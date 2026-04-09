import React from 'react';
import { formatTime } from './utils';

export function ControlPanel({ paramsA, paramsB, setParamsA, setParamsB, onInteraction }) {
  
  const handleSharedChange = (e) => {
    const { name, value } = e.target;
    const val = parseFloat(value) || 0;
    setParamsA(prev => ({ ...prev, [name]: val }));
    setParamsB(prev => ({ ...prev, [name]: val }));
    if (onInteraction) onInteraction();
  };

  const handleSharedCompression = (e) => {
    const { name, value } = e.target;
    const val = parseFloat(value) || 0;
    setParamsA(prev => ({ ...prev, compression: { ...prev.compression, [name]: val } }));
    setParamsB(prev => ({ ...prev, compression: { ...prev.compression, [name]: val } }));
    if (onInteraction) onInteraction();
  };

  const handleRampA = (e) => {
    const { name, value } = e.target;
    setParamsA(prev => ({ ...prev, platenRamp: { ...prev.platenRamp, [name]: parseFloat(value) || 0 } }));
    if (onInteraction) onInteraction();
  };

  const handleRampB = (e) => {
    const { name, value } = e.target;
    setParamsB(prev => ({ ...prev, platenRamp: { ...prev.platenRamp, [name]: parseFloat(value) || 0 } }));
    if (onInteraction) onInteraction();
  };

  const handleSharedRampTime = (e) => {
    const { name, value } = e.target;
    const val = parseFloat(value) || 0;
    setParamsA(prev => ({ ...prev, platenRamp: { ...prev.platenRamp, [name]: val } }));
    setParamsB(prev => ({ ...prev, platenRamp: { ...prev.platenRamp, [name]: val } }));
    if (onInteraction) onInteraction();
  };

  return (
    <div className="control-panel">
      {/* Configurations */}
      <div style={{ width: '100%', border: '1px solid rgba(160, 82, 45, 0.4)', backgroundColor: 'rgba(160, 82, 45, 0.05)', borderRadius: 'var(--radius-sm)', padding: '0.4rem', marginBottom: '0.4rem' }}>
        <div style={{ fontSize: '0.6rem', color: '#c47d57', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.2rem', paddingLeft: '0.2rem' }}>
          Wood Starting Conditions
        </div>
        <div className="controls-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.2rem', width: '100%' }}>
          <div className="input-group" style={{ borderColor: 'rgba(160, 82, 45, 0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label style={{ color: '#ffcdb2', fontWeight: '600', fontSize: '0.65rem', whiteSpace: 'nowrap' }}>Thickness: {paramsA.thicknessInches}in</label>
            </div>
            <input type="range" name="thicknessInches" value={paramsA.thicknessInches} onChange={handleSharedChange} min="0.1" max="2" step="0.05" style={{ padding: 0 }} />
          </div>

          <div className="input-group" style={{ borderColor: 'rgba(160, 82, 45, 0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ color: '#ffcdb2', fontWeight: '600', fontSize: '0.65rem', whiteSpace: 'nowrap' }}>Moisture: {paramsA.moistureContent ?? 0}%</label>
              <button 
                onClick={() => alert("Specific Heat Capacity Model:\n\nThis model incorporates an apparent specific heat capacity component. Instead of just modeling the sensible heat of wood and water, it adds a localized peak between 100°C and 120°C to simulate the energy absorbed during the desorption of bound water (representing the latent heat of vaporization).")} 
                style={{ 
                  background: 'none', border: '1px solid rgba(160, 82, 45, 0.4)', color: '#c47d57', 
                  borderRadius: '50%', width: '16px', height: '16px', fontSize: '10px', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0,
                  marginLeft: '4px', flexShrink: 0
                }}
                title="View Heat Capacity Model Info"
              >
                i
              </button>
            </div>
            <input type="range" name="moistureContent" value={paramsA.moistureContent ?? 0} onChange={handleSharedChange} min="0" max="30" step="1" style={{ padding: 0 }} />
          </div>

          <div className="input-group" style={{ borderColor: 'rgba(160, 82, 45, 0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label style={{ color: '#ffcdb2', fontWeight: '600', fontSize: '0.65rem', whiteSpace: 'nowrap' }}>Temp: {paramsA.initWoodTemp}°C</label>
            </div>
            <input type="range" name="initWoodTemp" value={paramsA.initWoodTemp} onChange={handleSharedChange} min="10" max="100" step="1" style={{ padding: 0 }} />
          </div>
        </div>
      </div>

      <div style={{ width: '100%', border: '1px solid rgba(255, 42, 95, 0.3)', backgroundColor: 'rgba(255, 42, 95, 0.05)', borderRadius: 'var(--radius-sm)', padding: '0.4rem', marginBottom: '0.4rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem', paddingLeft: '0.2rem', paddingRight: '0.2rem' }}>
          <div style={{ fontSize: '0.6rem', color: 'var(--accent-red)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Platen Temp
          </div>
          
          {/* Custom Left/Right Toggle Pill */}
          <div 
            onClick={() => {
              const isActive = !(paramsA.platenRamp && paramsA.platenRamp.active);
              const ensureRamp = (p) => ({ ...(p.platenRamp || { startTemp: 90, endTemp: p.platenTemp || 160, duration: 300 }), active: isActive });
              setParamsA(prev => ({ ...prev, platenRamp: ensureRamp(prev) }));
              setParamsB(prev => ({ ...prev, platenRamp: ensureRamp(prev) }));
              if (onInteraction) onInteraction();
            }}
            style={{ 
              display: 'flex', 
              background: 'rgba(0,0,0,0.3)', 
              borderRadius: '12px', 
              padding: '2px', 
              cursor: 'pointer',
              border: '1px solid rgba(255, 42, 95, 0.3)'
            }}
          >
            <div style={{ 
              padding: '2px 8px', 
              fontSize: '0.55rem', 
              fontWeight: 'bold', 
              borderRadius: '10px', 
              transition: 'all 0.2s ease', 
              backgroundColor: !(paramsA.platenRamp && paramsA.platenRamp.active) ? 'rgba(255, 42, 95, 0.8)' : 'transparent', 
              color: !(paramsA.platenRamp && paramsA.platenRamp.active) ? '#fff' : 'var(--text-muted)' 
            }}>
              FIXED
            </div>
            <div style={{ 
              padding: '2px 8px', 
              fontSize: '0.55rem', 
              fontWeight: 'bold', 
              borderRadius: '10px', 
              transition: 'all 0.2s ease', 
              backgroundColor: (paramsA.platenRamp && paramsA.platenRamp.active) ? 'rgba(255, 42, 95, 0.8)' : 'transparent', 
              color: (paramsA.platenRamp && paramsA.platenRamp.active) ? '#fff' : 'var(--text-muted)' 
            }}>
              RAMP
            </div>
          </div>
        </div>

        <div className="controls-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem', width: '100%' }}>
          {!(paramsA.platenRamp && paramsA.platenRamp.active) && (
            <>
              <div className="input-group" style={{ borderColor: 'rgba(255, 42, 95, 0.2)' }}>
                <label style={{ color: 'var(--accent-blue)' }}>Platen A (°C)</label>
                <input type="number" value={paramsA.platenTemp}
                  onChange={(e) => { setParamsA(p => ({...p, platenTemp: parseFloat(e.target.value)||0})); if(onInteraction) onInteraction(); }} 
                />
              </div>
              <div className="input-group" style={{ borderColor: 'rgba(255, 42, 95, 0.2)' }}>
                <label style={{ color: 'var(--accent-orange)' }}>Platen B (°C)</label>
                <input type="number" value={paramsB.platenTemp}
                  onChange={(e) => { setParamsB(p => ({...p, platenTemp: parseFloat(e.target.value)||0})); if(onInteraction) onInteraction(); }} 
                />
              </div>
            </>
          )}
        </div>

        {/* Ramp Controls rendering (occupies row 1 and 2 if active) */}
        {paramsA.platenRamp && paramsA.platenRamp.active && (
          <div className="controls-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem', width: '100%', marginTop: '0.2rem', paddingTop: '0.2rem' }}>
            <div className="input-group" style={{ borderColor: 'rgba(255, 42, 95, 0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label style={{ color: '#ffb3c1', fontWeight: '600', fontSize: '0.65rem', whiteSpace: 'nowrap' }}>Platen Heat-up Time: {formatTime(paramsA.platenRamp.duration)}</label>
              </div>
              <input type="range" name="duration" value={paramsA.platenRamp.duration} onChange={handleSharedRampTime} min="0" max="600" step="10" style={{ padding: 0 }} />
            </div>
            <div className="input-group" style={{ borderColor: 'rgba(255, 42, 95, 0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label style={{ color: '#ffb3c1', fontWeight: '600', fontSize: '0.65rem', whiteSpace: 'nowrap' }}>Start Temp: {paramsA.platenRamp.startTemp}°C</label>
              </div>
              <input type="range" name="startTemp" value={paramsA.platenRamp.startTemp} onChange={handleSharedRampTime} min="50" max="200" step="5" style={{ padding: 0 }} />
            </div>
            <div className="input-group" style={{ borderBottom: '2px solid var(--accent-blue)', borderColor: 'rgba(255, 42, 95, 0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label style={{ color: 'var(--accent-blue)', fontWeight: '600', fontSize: '0.65rem', whiteSpace: 'nowrap' }}>End Ramp A: {paramsA.platenRamp.endTemp}°C</label>
              </div>
              <input type="range" name="endTemp" value={paramsA.platenRamp.endTemp} onChange={handleRampA} min="50" max="200" step="5" style={{ padding: 0 }} />
            </div>
            <div className="input-group" style={{ borderBottom: '2px solid var(--accent-orange)', borderColor: 'rgba(255, 42, 95, 0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label style={{ color: 'var(--accent-orange)', fontWeight: '600', fontSize: '0.65rem', whiteSpace: 'nowrap' }}>End Ramp B: {paramsB.platenRamp.endTemp}°C</label>
              </div>
              <input type="range" name="endTemp" value={paramsB.platenRamp.endTemp} onChange={handleRampB} min="50" max="200" step="5" style={{ padding: 0 }} />
            </div>
          </div>
        )}

        {/* Structural spacer holding identical space for second row when FIXED is selected */}
        {!(paramsA.platenRamp && paramsA.platenRamp.active) && (
          <div className="controls-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem', width: '100%', marginTop: '0.2rem', paddingTop: '0.2rem', visibility: 'hidden', pointerEvents: 'none' }}>
            <div className="input-group" style={{ borderColor: 'rgba(255, 42, 95, 0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label>&nbsp;</label>
              </div>
              <input type="range" style={{ padding: 0 }} />
            </div>
            <div className="input-group" style={{ borderColor: 'rgba(255, 42, 95, 0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label>&nbsp;</label>
              </div>
              <input type="range" style={{ padding: 0 }} />
            </div>
          </div>
        )}
      </div>

      {paramsA.compression && paramsA.compression.active && (
        <div style={{ width: '100%', border: '1px solid rgba(0, 230, 118, 0.3)', backgroundColor: 'rgba(0, 230, 118, 0.05)', borderRadius: 'var(--radius-sm)', padding: '0.4rem', marginTop: 'auto' }}>
          <div style={{ fontSize: '0.6rem', color: 'var(--accent-green)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.2rem', paddingLeft: '0.2rem' }}>
            Compression
          </div>
          <div className="controls-group" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.2rem' }}>
            <div className="input-group" style={{ borderColor: 'var(--accent-green)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label style={{ color: '#a7f3d0', fontWeight: '600', fontSize: '0.65rem', whiteSpace: 'nowrap' }}>Period</label>
              </div>
              <div style={{ position: 'relative', height: '24px', marginTop: '14px' }}>
                
                {/* Hovering Labels */}
                <div style={{
                  position: 'absolute',
                  top: '-16px',
                  left: `${(paramsA.compression.start / 600) * 100}%`,
                  transform: 'translateX(-50%)',
                  fontSize: '0.65rem',
                  fontWeight: '600',
                  color: 'var(--text-main)',
                  zIndex: 2,
                  pointerEvents: 'none',
                }}>
                  {formatTime(paramsA.compression.start)}
                </div>
                <div style={{
                  position: 'absolute',
                  top: '-16px',
                  left: `${(paramsA.compression.stop / 600) * 100}%`,
                  transform: 'translateX(-50%)',
                  fontSize: '0.65rem',
                  fontWeight: '600',
                  color: 'var(--text-main)',
                  zIndex: 2,
                  pointerEvents: 'none',
                }}>
                  {formatTime(paramsA.compression.stop)}
                </div>

                {/* Tracks */}
                <div style={{ position: 'absolute', top: '10px', left: 0, right: 0, height: '4px', backgroundColor: 'var(--border-heavy)', borderRadius: '2px', zIndex: 0 }} />

                <div style={{ 
                  position: 'absolute', 
                  top: '10px', 
                  left: `${(paramsA.compression.start / 600) * 100}%`, 
                  right: `${100 - (paramsA.compression.stop / 600) * 100}%`, 
                  height: '4px', 
                  backgroundColor: 'var(--accent-green)', 
                  borderRadius: '2px',
                  zIndex: 1,
                  boxShadow: '0 0 5px rgba(0,230,118,0.5)'
                }} />
                
                {/* Range Inputs */}
                <input type="range" name="start" value={paramsA.compression.start} 
                  onChange={(e) => handleSharedCompression({target: {name: 'start', value: Math.min(e.target.value, paramsA.compression.stop - 10)}})} 
                  min="0" max="600" step="10" className="dual-thumb" 
                  style={{ position: 'absolute', top: '2px', left: 0, margin: 0, padding: 0, zIndex: 3, width: '100%', height: '20px' }} />
                <input type="range" name="stop" value={paramsA.compression.stop} 
                  onChange={(e) => handleSharedCompression({target: {name: 'stop', value: Math.max(e.target.value, paramsA.compression.start + 10)}})} 
                  min="0" max="600" step="10" className="dual-thumb" 
                  style={{ position: 'absolute', top: '2px', left: 0, margin: 0, padding: 0, zIndex: 4, width: '100%', height: '20px' }} />
              </div>
            </div>
            <div className="input-group" style={{ borderColor: 'var(--accent-green)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label style={{ color: '#a7f3d0', fontWeight: '600', fontSize: '0.65rem', whiteSpace: 'nowrap' }}>Ratio: {paramsA.compression.ratio}x</label>
              </div>
              <div style={{ position: 'relative', height: '24px', marginTop: '14px' }}>
                <input type="range" name="ratio" value={paramsA.compression.ratio} onChange={handleSharedCompression} min="1.5" max="5" step="0.1" style={{ position: 'absolute', top: '2px', left: 0, margin: 0, padding: 0, zIndex: 3, width: '100%', height: '20px' }} />
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
