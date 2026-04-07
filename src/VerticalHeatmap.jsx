export function VerticalHeatmap({ temperatures, minTemp, maxTemp, platenTemp, initialThickness, currentThickness }) {
  // Helper to interp color from Cool Blue to Deep Red
  const getColor = (temp) => {
    const ratio = Math.max(0, Math.min(1, (temp - minTemp) / (maxTemp - minTemp)));
    const hue = (1 - ratio) * 240; 
    return `hsl(${hue}, 80%, 50%)`;
  };

  const isCompressing = currentThickness && initialThickness && currentThickness < initialThickness;
  const thicknessRatio = isCompressing ? currentThickness / initialThickness : 1;

  return (
    <div className="heatmap-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h3>Cross-Section Heatmap</h3>
      <div className="heatmap-visualizer" style={{ height: `${initialThickness * 160}px` }}>
        {/* Top Platen */}
        <div className="platen platen-top">Top ({platenTemp}°C)</div>
        
        {/* Wood Cross Section Container */}
        <div className="wood-stack-container">
          <div className="wood-stack" style={{ height: `${thicknessRatio * 100}%` }}>
            {temperatures.map((temp, i) => (
              <div 
                key={i} 
                className="wood-slice" 
                style={{ backgroundColor: getColor(temp) }}
              >
                <span className="tooltip">{temp.toFixed(1)}°C</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Bottom Platen */}
        <div className="platen platen-bottom">Bot ({platenTemp}°C)</div>
      </div>
    </div>
  );
}
