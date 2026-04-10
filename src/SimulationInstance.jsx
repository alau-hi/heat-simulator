import React, { useMemo } from 'react';
import { ControlPanel } from './ControlPanel';
import { TemperatureProfileChart } from './TemperatureProfileChart';
import { formatTime } from './utils';

// Fast binary search to find closest history frame safely
function findClosestHistoryIndex(history, targetTime) {
  if (!history || history.length === 0) return 0;
  if (targetTime <= history[0].time) return 0;
  if (targetTime >= history[history.length - 1].time) return history.length - 1;

  let left = 0;
  let right = history.length - 1;
  let best = 0;

  while (left <= right) {
    let mid = Math.floor((left + right) / 2);
    if (history[mid].time <= targetTime) {
      best = mid;
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  return best;
}


export function SimulationInstance({ 
  title, 
  simDataA,
  simDataB,
  globalScrubTime,
  isScrubbing,
  onInteraction,
  globalMinTemp,
  globalMaxTemp
}) {
  const paramsA = simDataA.params;
  const paramsB = simDataB.params;
  
  const historyA = simDataA.history || [];
  const historyB = simDataB.history || [];

  const safeIndexA = findClosestHistoryIndex(historyA, globalScrubTime);
  const currentStateA = historyA[safeIndexA] || { time: 0, temps: [], thickness: paramsA.thicknessInches };
  
  const safeIndexB = findClosestHistoryIndex(historyB, globalScrubTime);
  const currentStateB = historyB[safeIndexB] || { time: 0, temps: [], thickness: paramsB.thicknessInches };

  const timeAt90C = useMemo(() => {
    if (!historyA || historyA.length === 0) return null;
    for (let frame of historyA) {
      if (Math.min(...frame.temps) >= 90) {
        return frame.time;
      }
    }
    return null;
  }, [historyA]);

  // Assume both simulations have identical targetCoreTemp
  const isFinished = 
    (historyA.length > 0 && globalScrubTime >= historyA[historyA.length - 1].time) && 
    (historyB.length > 0 && globalScrubTime >= historyB[historyB.length - 1].time);

  const minTemp = globalMinTemp !== undefined ? globalMinTemp : 0; 
  const maxTemp = globalMaxTemp !== undefined ? globalMaxTemp : 200; 

  // Since structural physics are strictly shared, we just map out A's geometry
  const currentThickness = currentStateA.thickness;

  return (
    <div className="simulation-instance" style={{ borderTop: `1px solid rgba(255,255,255,0.2)` }}>
      
      <div className="instance-header" style={{ borderBottomColor: 'var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ color: 'var(--text-main)' }}>{title}</h2>
        <div style={{ fontSize: '0.65rem', display: 'flex', gap: '0.5rem', fontWeight: 'bold' }}>
          <span style={{ color: 'var(--accent-blue)' }}>A (Base)</span>
          <span style={{ color: 'var(--accent-orange)' }}>B (High)</span>
        </div>
      </div>

      <ControlPanel 
        paramsA={paramsA} 
        paramsB={paramsB}
        setParamsA={simDataA.setParams}
        setParamsB={simDataB.setParams}
        onInteraction={onInteraction} 
        timeAt90C={timeAt90C}
      />

      <div className="instance-dashboard">
        <div className="visualizer-card timer-card" style={{ width: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', backgroundColor: 'var(--bg-input)' }}>
          <h3 style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Status</h3>
          <div className={`time-value ${isFinished ? 'blink' : ''}`} style={{ fontSize: '1.4rem', fontFamily: 'monospace', color: 'var(--accent-green)' }}>
             {formatTime(currentStateA.time)}
          </div>
          {isFinished ? (
            <div style={{ fontSize: '0.7rem', color: 'var(--accent-red)', fontWeight: 'bold', textAlign: 'center', marginTop: '0.5rem' }}>
              Reached
            </div>
          ) : (
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.5rem' }}>
              Heating
            </div>
          )}
        </div>

        <div className="visualizer-card chart-card">
          <TemperatureProfileChart 
            temperaturesA={currentStateA.temps}
            temperaturesB={currentStateB.temps}
            minTemp={minTemp}
            maxTemp={maxTemp}
            initialThickness={paramsA.thicknessInches}
            currentThickness={currentThickness}
          />
        </div>
      </div>
      
    </div>
  );
}
