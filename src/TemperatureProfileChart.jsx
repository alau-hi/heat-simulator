import { useState } from 'react';

export function TemperatureProfileChart({ temperaturesA = [], temperaturesB = [], minTemp, maxTemp, initialThickness, currentThickness }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const mapX = (temp) => {
    const clamped = Math.max(minTemp, Math.min(maxTemp, temp));
    return ((clamped - minTemp) / (maxTemp - minTemp)) * 100;
  };

  const mapY = (index) => {
    const len = Math.max(temperaturesA.length, temperaturesB.length);
    if (len <= 1) return 0;
    const relProgress = index / (len - 1);
    return relProgress * 100;
  };

  const tracePath = (temps, isFill = false) => {
    if (!temps || temps.length === 0) return '';
    const linePath = temps.map((temp, index) => {
      const x = mapX(temp);
      const y = mapY(index);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');

    if (isFill) {
      return linePath + ` L 0 ${mapY(temps.length - 1)} L 0 ${mapY(0)} Z`;
    }
    return linePath;
  };

  const pathA = tracePath(temperaturesA);
  const fillA = tracePath(temperaturesA, true);
  
  const pathB = tracePath(temperaturesB);
  const fillB = tracePath(temperaturesB, true);

  const len = Math.max(temperaturesA.length, temperaturesB.length);
  const safeIndices = temperaturesA.length > 0 ? temperaturesA.map((_, i) => i) : [];

  return (
    <div className="chart-container" style={{ width: '100%', position: 'relative', paddingLeft: '30px' }}>
      
      {/* Outer Chamber Bounds representing the uncompressed physical block space */}
      <div className="press-chamber" style={{ 
        height: `${(initialThickness * 160) + 106}px`, 
        width: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'stretch', 
        position: 'relative'
      }}>
        
        {/* Top Stainless Steel Platen */}
        <div className="platen-top" style={{
          height: '53px',
          width: '100%',
          background: 'linear-gradient(180deg, #6c757d 0%, #adb5bd 40%, #6c757d 100%)',
          border: '1px solid #343a40',
          borderRadius: '4px 4px 0 0',
          boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.3)',
          zIndex: 2,
          flex: 'none'
        }}></div>

        <div className="svg-wrapper" style={{ 
          height: `${currentThickness * 160}px`, 
          width: '100%', 
          flex: 'none', 
          transition: 'height 0.05s linear',
          position: 'relative'
        }}>
          {/* Dynamic Thickness Horizontal Ruler */}
          <div style={{ position: 'absolute', right: '100%', marginRight: '0px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', zIndex: 10 }}>
            <div style={{ color: 'var(--accent-green)', fontSize: '0.65rem', fontWeight: 'bold', whiteSpace: 'nowrap', textAlign: 'right', display: 'flex', flexDirection: 'column', paddingRight: '4px' }}>
              <span>{currentThickness.toFixed(3)}"</span>
              {currentThickness < initialThickness && <span style={{fontSize: '0.55rem', opacity: 0.8}}>{((currentThickness/initialThickness)*100).toFixed(0)}%</span>}
            </div>
            {/* Center tick connecting to the wood block */}
            <div style={{ width: '12px', height: '1px', backgroundColor: 'var(--accent-green)' }}></div>
          </div>

          <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
            <defs>
              <linearGradient id="tempGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.4" />
                <stop offset="50%" stopColor="#b054fc" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#ff2a5f" stopOpacity="0.4" />
              </linearGradient>
            </defs>

            <rect x="0" y="0" width="100" height="100" fill="rgba(0,0,0,0.03)" />

            <line x1="0" y1="0" x2="0" y2="100" className="grid-line" vectorEffect="non-scaling-stroke" />
            <line x1="50" y1="0" x2="50" y2="100" className="grid-line" vectorEffect="non-scaling-stroke" />
            <line x1="100" y1="0" x2="100" y2="100" className="grid-line" vectorEffect="non-scaling-stroke" />
            
            <line x1="0" y1="0" x2="100" y2="0" className="grid-line" vectorEffect="non-scaling-stroke" />
            <line x1="0" y1="50" x2="100" y2="50" className="grid-line" vectorEffect="non-scaling-stroke" />
            <line x1="0" y1="100" x2="100" y2="100" className="grid-line" vectorEffect="non-scaling-stroke" />

            {/* Fills mapped dynamically to thermal gradient stops */}
            {temperaturesB.length > 0 && <path d={fillB} fill="url(#tempGradient)" style={{ transition: 'd 0.05s linear' }} />}
            {temperaturesA.length > 0 && <path d={fillA} fill="url(#tempGradient)" style={{ transition: 'd 0.05s linear' }} />}

            {/* 150C Tg Boundary Math mapping purely to native space */}
            <line 
              x1={mapX(150)} 
              y1="-5" 
              x2={mapX(150)} 
              y2="105" 
              stroke="var(--accent-red)" 
              strokeWidth="2" 
              strokeDasharray="4 4" 
              opacity="0.8" 
              vectorEffect="non-scaling-stroke"
            />

            {/* Traces */}
            <path d={pathA} fill="none" stroke="var(--accent-blue)" strokeWidth="2" vectorEffect="non-scaling-stroke" style={{ filter: 'drop-shadow(0 0 3px rgba(0,212,255,0.6))', transition: 'd 0.05s linear' }} />
            <path d={pathB} fill="none" stroke="var(--accent-orange)" strokeWidth="2" vectorEffect="non-scaling-stroke" style={{ filter: 'drop-shadow(0 0 3px rgba(255,171,0,0.6))', transition: 'd 0.05s linear' }} />

            {/* Shared Y Invisible Hit Zones mapping structurally out from center */}
            {safeIndices.map((i) => (
              <rect 
                key={`hit-${i}`} 
                x="0" 
                y={mapY(i) - 2.5} 
                width="100" 
                height="5" 
                fill="transparent" 
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            ))}
          </svg>
          
          {/* Tg Marker Label */}
          <div style={{
            position: 'absolute',
            left: `${mapX(150)}%`,
            top: '-20px',
            transform: 'translateX(-50%)',
            color: 'var(--accent-red)',
            fontSize: '0.6rem',
            fontWeight: 'bold',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            textShadow: '0 0 4px rgba(0,0,0,0.8)',
            zIndex: 10
          }}>
            150°C Tg
          </div>

          {/* Dual Overlay Active Floating HTML Tooltip */}
          {hoveredIndex !== null && (
            <div style={{
              position: 'absolute',
              right: `10px`, // Fixed right alignment for stable numerical reading
              top: `${mapY(hoveredIndex)}%`,
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
              backgroundColor: 'rgba(10, 12, 18, 0.95)',
              backdropFilter: 'blur(8px)',
              border: '1px solid var(--border-heavy)',
              padding: '6px 8px',
              borderRadius: '4px',
              fontSize: '0.65rem',
              color: 'var(--text-main)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
              zIndex: 100,
              minWidth: '80px'
            }}>
              <div style={{ borderBottom: '1px solid var(--border-heavy)', paddingBottom: '3px', marginBottom: '3px', textAlign: 'center', color: 'var(--text-muted)' }}>
                Depth: <strong>{((hoveredIndex/(len-1)) * currentThickness).toFixed(3)}in</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent-blue)', fontWeight: 'bold' }}>
                <span>Base:</span>
                <span>{temperaturesA[hoveredIndex]?.toFixed(1)}°C</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent-orange)', fontWeight: 'bold' }}>
                <span>High:</span>
                <span>{temperaturesB[hoveredIndex]?.toFixed(1)}°C</span>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Stainless Steel Platen */}
        <div className="platen-bottom" style={{
          height: '53px',
          width: '100%',
          background: 'linear-gradient(180deg, #6c757d 0%, #adb5bd 40%, #6c757d 100%)',
          border: '1px solid #343a40',
          borderRadius: '0 0 4px 4px',
          boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.3)',
          zIndex: 2,
          flex: 'none'
        }}></div>

      </div>

      {/* Labels positioned off the static outer chamber */}
      <div className="x-axis-labels" style={{ 
        position: 'absolute', 
        bottom: '-22px', 
        left: '30px', 
        width: 'calc(100% - 30px)', 
        display: 'flex', 
        justifyContent: 'space-between',
        color: 'var(--text-main)',
        fontSize: '0.75rem',
        fontWeight: 'bold',
        textShadow: '0px 1px 2px rgba(0,0,0,0.8)'
      }}>
        <span>{minTemp}°C</span>
        <span>{Math.round((minTemp + maxTemp) / 2)}°C</span>
        <span>{maxTemp}°C</span>
      </div>
    </div>
  );
}
