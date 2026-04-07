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
      <div className="controls-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem', width: '100%' }}>
        <div className="input-group">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <label>Initial Thickness: {paramsA.thicknessInches}in</label>
          </div>
          <input type="range" name="thicknessInches" value={paramsA.thicknessInches} onChange={handleSharedChange} min="0.1" max="2" step="0.05" style={{ padding: 0 }} />
        </div>

        <div className="input-group">
          <label>Initial Temp (°C)</label>
          <input type="number" name="initWoodTemp" value={paramsA.initWoodTemp} onChange={handleSharedChange} />
        </div>
        
        {!(paramsA.platenRamp && paramsA.platenRamp.active) && (
          <div className="input-group">
            <label style={{ color: 'var(--accent-blue)' }}>Platen A (°C)</label>
            <input type="number" value={paramsA.platenTemp}
              onChange={(e) => { setParamsA(p => ({...p, platenTemp: parseFloat(e.target.value)||0})); if(onInteraction) onInteraction(); }} 
            />
          </div>
        )}

        {!(paramsB.platenRamp && paramsB.platenRamp.active) && (
          <div className="input-group">
            <label style={{ color: 'var(--accent-orange)' }}>Platen B (°C)</label>
            <input type="number" value={paramsB.platenTemp}
              onChange={(e) => { setParamsB(p => ({...p, platenTemp: parseFloat(e.target.value)||0})); if(onInteraction) onInteraction(); }} 
            />
          </div>
        )}
      </div>

      {paramsA.platenRamp && paramsA.platenRamp.active && (
        <div className="controls-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem', width: '100%', marginTop: '0.2rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.2rem' }}>
          <div className="input-group">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label>Shared Ramp Time: {formatTime(paramsA.platenRamp.duration)}</label>
            </div>
            <input type="range" name="duration" value={paramsA.platenRamp.duration} onChange={handleSharedRampTime} min="0" max="600" step="10" style={{ padding: 0 }} />
          </div>
          <div className="input-group">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label>Start Temp: {paramsA.platenRamp.startTemp}°C</label>
            </div>
            <input type="range" name="startTemp" value={paramsA.platenRamp.startTemp} onChange={handleSharedRampTime} min="50" max="200" step="5" style={{ padding: 0 }} />
          </div>
          <div className="input-group" style={{ borderBottom: '2px solid var(--accent-blue)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label style={{ color: 'var(--accent-blue)' }}>End Ramp A: {paramsA.platenRamp.endTemp}°C</label>
            </div>
            <input type="range" name="endTemp" value={paramsA.platenRamp.endTemp} onChange={handleRampA} min="50" max="200" step="5" style={{ padding: 0 }} />
          </div>
          <div className="input-group" style={{ borderBottom: '2px solid var(--accent-orange)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label style={{ color: 'var(--accent-orange)' }}>End Ramp B: {paramsB.platenRamp.endTemp}°C</label>
            </div>
            <input type="range" name="endTemp" value={paramsB.platenRamp.endTemp} onChange={handleRampB} min="50" max="200" step="5" style={{ padding: 0 }} />
          </div>
        </div>
      )}

      {paramsA.compression && paramsA.compression.active && (
        <div style={{ width: '100%', marginTop: 'auto', borderTop: '1px solid var(--border-color)', paddingTop: '0.3rem' }}>
          <div style={{ fontSize: '0.6rem', color: 'var(--accent-green)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.2rem', paddingLeft: '0.2rem' }}>
            Compression
          </div>
          <div className="controls-group" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.2rem' }}>
            <div className="input-group" style={{ borderColor: 'var(--accent-green)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label>Period</label>
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
                <label>Ratio: {paramsA.compression.ratio}x</label>
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
