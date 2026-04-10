import { useState, useCallback, useEffect, useRef } from 'react';
import { useHeatSimulation } from './useHeatSimulation';
import { SimulationInstance } from './SimulationInstance';
import { formatTime } from './utils';
import './App.css';

function App() {
  const [globalIsPlaying, setGlobalIsPlaying] = useState(false);
  const [globalTargetTemp, setGlobalTargetTemp] = useState(155);
  const [showAssumptions, setShowAssumptions] = useState(false);

  const [scrubTime, setScrubTime] = useState(0);
  const [isScrubbing, setIsScrubbing] = useState(false);

  const conf160 = { thicknessInches: 0.75, initWoodTemp: 80, platenTemp: 160, targetCoreTemp: globalTargetTemp, alpha: 0.166e-6, moistureContent: 8 };
  const conf170 = { thicknessInches: 0.75, initWoodTemp: 80, platenTemp: 170, targetCoreTemp: globalTargetTemp, alpha: 0.166e-6, moistureContent: 8 };

  const compDef = { active: true, start: 120, stop: 180, ratio: 3 };
  const conf160Comp = { ...conf160, compression: compDef };
  const conf170Comp = { ...conf170, compression: compDef };

  const rampDef = { active: true, startTemp: 90, endTemp: 160, duration: 300 };
  const rampDefHigh = { active: true, startTemp: 90, endTemp: 170, duration: 300 };

  const confRampComp1 = { ...conf160, compression: compDef, platenRamp: rampDef };
  const confRampComp2 = { ...conf170, compression: compDef, platenRamp: rampDefHigh };

  const sim1 = useHeatSimulation(conf160);
  const sim2 = useHeatSimulation(conf170);
  const sim3 = useHeatSimulation(conf160Comp);
  const sim4 = useHeatSimulation(conf170Comp);
  const sim5 = useHeatSimulation(confRampComp1);
  const sim6 = useHeatSimulation(confRampComp2);

  const sims = [sim1, sim2, sim3, sim4, sim5, sim6];

  const globalMinTemp = Math.min(...sims.map(sim => sim.params.initWoodTemp || 0));
  const globalMaxTemp = Math.max(...sims.flatMap(sim => {
    const p = sim.params;
    let max = p.platenTemp || 0;
    if (p.platenRamp && p.platenRamp.active) {
      max = Math.max(max, p.platenRamp.startTemp, p.platenRamp.endTemp);
    }
    return max;
  }));

  // Map global target temp updates into all hooks instantaneously
  useEffect(() => {
    sims.forEach(sim => {
      sim.setParams(prev => ({ ...prev, targetCoreTemp: globalTargetTemp }));
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalTargetTemp]);

  const maxSimTime = Math.max(0, ...sims.map(sim => {
    return sim.history && sim.history.length > 0 ? sim.history[sim.history.length - 1].time : 0;
  }));

  const handleGlobalReset = useCallback(() => {
    setGlobalIsPlaying(false);
    setScrubTime(0);
  }, []);

  const reqRef = useRef(null);
  const lastTimeRef = useRef(0);

  // Smooth native animation streaming driven fully by browser display frame rates
  useEffect(() => {
    if (!globalIsPlaying || isScrubbing) {
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
      return;
    }
    
    lastTimeRef.current = performance.now();
    
    const animate = (timeNow) => {
      let realDtSec = (timeNow - lastTimeRef.current) / 1000;
      lastTimeRef.current = timeNow;
      
      const SIM_SPEED_MULTIPLIER = 30; // 30s per real second
      
      setScrubTime(prev => {
        let nxt = prev + realDtSec * SIM_SPEED_MULTIPLIER;
        if (nxt >= maxSimTime) {
          setGlobalIsPlaying(false);
          return maxSimTime;
        }
        return nxt;
      });
      reqRef.current = requestAnimationFrame(animate);
    };
    reqRef.current = requestAnimationFrame(animate);
    
    return () => cancelAnimationFrame(reqRef.current);
  }, [globalIsPlaying, maxSimTime, isScrubbing]);

  const handleScrub = (e) => {
    if (globalIsPlaying) {
      setGlobalIsPlaying(false);
    }
    setIsScrubbing(true);
    setScrubTime(parseFloat(e.target.value));
  };
  
  const finishScrub = () => {
    setIsScrubbing(false);
  };

  const isAllFinished = scrubTime >= maxSimTime && maxSimTime > 0;

  return (
    <div className="app-container">
      <header className="global-header" style={{ padding: '0.5rem 1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div className="header-titles" style={{ minWidth: '300px', flex: 1 }}>
          <h1 style={{ marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            1D Platen-Heated Wood Simulator
            <button 
              onClick={() => setShowAssumptions(true)}
              style={{ fontSize: '0.65rem', padding: '0.2rem 0.6rem', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-main)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 'bold' }}>
              View Assumptions
            </button>
          </h1>
          <p className="subtitle" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4', maxWidth: '600px' }}>
            Analyzing the various factors in getting the center of a board up to the glass transition temperature of lignin.
          </p>
        </div>
        
        {/* Global Nav & Scrubber */}
        <div className="global-nav-tools" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.2rem', minWidth: '200px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Global Time Scrubber</label>
            <span style={{ fontSize: '0.85rem', fontWeight: 'bold', fontFamily: 'monospace' }}>{formatTime(scrubTime)}</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max={maxSimTime || 0} 
            step="0.1"
            value={Math.min(scrubTime, maxSimTime)} 
            onChange={handleScrub}
            onMouseUp={finishScrub}
            onTouchEnd={finishScrub}
            className="scrub-slider"
            style={{ width: '100%', cursor: 'pointer' }}
          />
        </div>

        {/* Global Target Temp Slider */}
        <div className="global-nav-tools" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.2rem', minWidth: '200px', padding: '0 1rem', borderLeft: '1px solid var(--border-color)', borderRight: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Global Target Core Temp</label>
            <span style={{ fontSize: '0.85rem', fontWeight: 'bold', fontFamily: 'monospace' }}>{globalTargetTemp}°C</span>
          </div>
          <input 
            type="range" 
            min="100" 
            max="200" 
            step="1"
            value={globalTargetTemp} 
            onChange={(e) => {
              setGlobalTargetTemp(parseFloat(e.target.value));
              handleGlobalReset();
            }}
            className="scrub-slider"
            style={{ width: '100%', cursor: 'pointer' }}
          />
        </div>

        <div className="global-actions" style={{ maxWidth: '320px', alignItems: 'center' }}>
          <button 
            className={`btn btn-play ${globalIsPlaying ? 'active' : ''}`}
            onClick={() => setGlobalIsPlaying(!globalIsPlaying)}
            disabled={isAllFinished}
          >
            {globalIsPlaying ? 'Pause' : 'Play'}
          </button>
          <button className="btn btn-reset" onClick={handleGlobalReset}>
            Reset
          </button>
        </div>
      </header>

      <main className="comparison-board">
        <SimulationInstance title="Fixed Platens" simDataA={sim1} simDataB={sim2} globalScrubTime={scrubTime} isScrubbing={isScrubbing} onInteraction={handleGlobalReset} globalMinTemp={globalMinTemp} globalMaxTemp={globalMaxTemp} />
        <SimulationInstance title="Compressing Platens" simDataA={sim3} simDataB={sim4} globalScrubTime={scrubTime} isScrubbing={isScrubbing} onInteraction={handleGlobalReset} globalMinTemp={globalMinTemp} globalMaxTemp={globalMaxTemp} />
        <SimulationInstance title="Compressing + Temp-Ramping Platens" simDataA={sim5} simDataB={sim6} globalScrubTime={scrubTime} isScrubbing={isScrubbing} onInteraction={handleGlobalReset} globalMinTemp={globalMinTemp} globalMaxTemp={globalMaxTemp} />
      </main>

      {showAssumptions && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(3px)' }}>
          <div style={{ backgroundColor: 'var(--bg-panel)', padding: '2rem', borderRadius: 'var(--radius-md)', maxWidth: '850px', width: '90%', border: '1px solid var(--border-heavy)', position: 'relative', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
            <button 
              onClick={() => setShowAssumptions(false)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}>
              ✕
            </button>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)', margin: '0 0 1.5rem 0', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Key Thermodynamic Assumptions
            </h3>
            <ul style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6', paddingLeft: '1.2rem', margin: 0 }}>
              <li style={{ marginBottom: '1rem' }}><strong>1D Heat Transfer:</strong> Computes heat flow across the thickness axis (face-to-face). Assumes an infinite planar slab where lateral/edge heat losses are negligible.</li>
              <li style={{ marginBottom: '1rem' }}><strong>Apparent Specific Heat Capacity:</strong> Simulates the latent heat of vaporization of bound moisture by applying localized elevations in the wood's apparent specific heat between 100°C and 120°C.</li>
              <li style={{ marginBottom: '1rem' }}>
                <strong>Conduction Only:</strong> Relies on the Explicit Finite Difference Method applied to Fourier's law. Internal convective effects driven by mobilized steam/vapor migration are not factored in.
                <div style={{ marginTop: '0.6rem', padding: '0.6rem', backgroundColor: 'rgba(255, 179, 193, 0.1)', borderLeft: '3px solid #ffb3c1', borderRadius: '0 4px 4px 0' }}>
                  <span style={{ color: '#ffcdb2', fontWeight: 'bold' }}>Alex's Note:</span> <span style={{ color: 'var(--text-main)' }}>Heat transfer after 100-120°C is reached could be much faster, as steam migration impacts could become a significant-to-dominant factor.</span>
                </div>
              </li>
              <li>
                <strong>Poplar Calibration &amp; Compression:</strong> The baseline derives from <strong>Yellow Poplar</strong> macro-properties: Density <span style={{ fontFamily: '"Cambria Math", "Computer Modern", "Times New Roman", serif', fontStyle: 'italic', fontSize: '1.05em' }}>ρ</span> ≈ <span style={{ fontFamily: '"Cambria Math", "Computer Modern", "Times New Roman", serif', fontSize: '1.05em' }}>450 kg/m³</span>, Specific Heat <span style={{ fontFamily: '"Cambria Math", "Computer Modern", "Times New Roman", serif', fontStyle: 'italic', fontSize: '1.05em' }}>C<sub>p</sub></span> ≈ <span style={{ fontFamily: '"Cambria Math", "Computer Modern", "Times New Roman", serif', fontSize: '1.05em' }}>1600 J/kg·K</span> (with residual core moisture), and transverse Thermal Conductivity <span style={{ fontFamily: '"Cambria Math", "Computer Modern", "Times New Roman", serif', fontStyle: 'italic', fontSize: '1.05em' }}>k</span> ≈ <span style={{ fontFamily: '"Cambria Math", "Computer Modern", "Times New Roman", serif', fontSize: '1.05em' }}>0.12 W/m·K</span>. This sets an uncompressed baseline thermal diffusivity (<span style={{ fontFamily: '"Cambria Math", "Computer Modern", "Times New Roman", serif', fontStyle: 'italic', fontSize: '1.05em' }}>α</span>) of <code style={{ fontFamily: '"Cambria Math", "Computer Modern", "Times New Roman", serif', fontSize: '1.1em' }}>0.166 × 10<sup>-6</sup> m²/s</code>. As structural density scales inversely with mechanical compression, the simulator doubles this diffusivity for every 3x volume reduction to account for eliminated insulating air pockets.
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
