import React, { useMemo } from 'react';
import { ControlPanel } from './ControlPanel';
import { TemperatureProfileChart } from './TemperatureProfileChart';
import { formatTime, findClosestHistoryIndex } from './utils';
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

  const exportToCSV = () => {
    const nNodes = historyA[0]?.temps.length || 20;
    
    let header = ["Time_seconds"];
    header.push("Thickness_A_inches");
    for(let i = 0; i < nNodes; i++) header.push(`A_Node_${i}_C`);
    header.push("Thickness_B_inches");
    for(let i = 0; i < nNodes; i++) header.push(`B_Node_${i}_C`);
    
    let rows = [header.join(",")];
    
    const maxTimeA = historyA.length > 0 ? historyA[historyA.length - 1].time : 0;
    const maxTimeB = historyB.length > 0 ? historyB[historyB.length - 1].time : 0;
    const maxTime = Math.max(maxTimeA, maxTimeB);
    
    for (let t = 0; t <= Math.ceil(maxTime); t += 5) {
      let row = [t];
      
      let idxA = findClosestHistoryIndex(historyA, t);
      let stateA = historyA[idxA] || { thickness: 0, temps: Array(nNodes).fill(0) };
      row.push(stateA.thickness.toFixed(4));
      stateA.temps.forEach(temp => row.push(temp.toFixed(2)));
      
      let idxB = findClosestHistoryIndex(historyB, t);
      let stateB = historyB[idxB] || { thickness: 0, temps: Array(nNodes).fill(0) };
      row.push(stateB.thickness.toFixed(4));
      stateB.temps.forEach(temp => row.push(temp.toFixed(2)));
      
      rows.push(row.join(","));
    }
    
    const csvContent = rows.join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    let safeTitle = title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    link.setAttribute("download", `heat_simulation_${safeTitle}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="simulation-instance" style={{ borderTop: `1px solid rgba(255,255,255,0.2)` }}>
      
      <div className="instance-header" style={{ borderBottomColor: 'var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {title}
          <button 
            className="btn-export-sm"
            onClick={exportToCSV}
            title="Export comparative simulation history to CSV"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Export CSV
          </button>
        </h2>
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
