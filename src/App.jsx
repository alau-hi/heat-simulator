import { useState, useCallback, useEffect, useRef } from 'react';
import { useHeatSimulation } from './useHeatSimulation';
import { SimulationInstance } from './SimulationInstance';
import { formatTime } from './utils';
import './App.css';

function App() {
  const [globalIsPlaying, setGlobalIsPlaying] = useState(false);
  const [globalTargetTemp, setGlobalTargetTemp] = useState(155);

  const [scrubTime, setScrubTime] = useState(0);
  const [isScrubbing, setIsScrubbing] = useState(false);

  const conf160 = { thicknessInches: 0.75, initWoodTemp: 80, platenTemp: 160, targetCoreTemp: globalTargetTemp, alpha: 0.18e-6 };
  const conf170 = { thicknessInches: 0.75, initWoodTemp: 80, platenTemp: 170, targetCoreTemp: globalTargetTemp, alpha: 0.18e-6 };

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
        <div className="header-titles" style={{ minWidth: '150px' }}>
          <h1>1D Heat Conduction</h1>
          <p className="subtitle">HOT PRESS DYNAMICS</p>
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

        <div className="global-actions" style={{ maxWidth: '250px' }}>
          <button 
            className={`btn btn-play ${globalIsPlaying ? 'active' : ''}`}
            onClick={() => setGlobalIsPlaying(!globalIsPlaying)}
            disabled={isAllFinished}
          >
            {globalIsPlaying ? 'Pause All' : 'Play All'}
          </button>
          <button className="btn btn-reset" onClick={handleGlobalReset}>
            Reset All
          </button>
        </div>
      </header>

      <main className="comparison-board">
        <SimulationInstance title="Static Platen Offset" simDataA={sim1} simDataB={sim2} globalScrubTime={scrubTime} isScrubbing={isScrubbing} onInteraction={handleGlobalReset} />
        <SimulationInstance title="Compressed Comparison" simDataA={sim3} simDataB={sim4} globalScrubTime={scrubTime} isScrubbing={isScrubbing} onInteraction={handleGlobalReset} />
        <SimulationInstance title="Dynamic Platen Ramp + Compress" simDataA={sim5} simDataB={sim6} globalScrubTime={scrubTime} isScrubbing={isScrubbing} onInteraction={handleGlobalReset} />
      </main>
    </div>
  );
}

export default App;
