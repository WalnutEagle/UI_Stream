import React from 'react';

interface SpeedometerGaugeProps {
  value: number;
  maxValue: number;
  label: string;
  unit: string;
  showValue?: boolean;
}

export const SpeedometerGauge: React.FC<SpeedometerGaugeProps> = ({ value, maxValue, label, unit, showValue = true }) => {
  const clampedValue = Math.max(0, Math.min(value, maxValue));
  // Angle: -90 deg for 0 value, 0 deg for 50% value, 90 deg for 100% value of the arc
  const needleRotationDegrees = (clampedValue / maxValue) * 180 - 90;

  const svgWidth = 180;
  const svgHeight = 105; // Reduced height slightly as text is separate
  const centerX = svgWidth / 2;
  const centerY = svgHeight - 15; // Pivot point at the bottom center
  const radius = 75;
  const tickLength = 8;
  const mainTickLength = 12;

  const arcPath = `
    M ${centerX - radius} ${centerY}
    A ${radius} ${radius} 0 0 1 ${centerX + radius} ${centerY}
  `;

  const ticksData = [0, 20, 40, 60, 80, 100];

  return (
    <div className="text-center flex-1 min-w-[180px] p-2">
      <div className="text-sm text-gray-300 mb-1 h-12 flex flex-col justify-center items-center"> {/* Fixed height, always present */}
        <span>{label}</span> {/* Always visible label */}
        <span className={`font-bold text-lg text-green-400 ${!showValue ? 'invisible' : ''}`}>
          {clampedValue.toFixed(0)}{unit}
        </span>
      </div>

      <svg width="100%" height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="mx-auto">
        {/* Background Arc */}
        <path d={arcPath} strokeWidth="12" strokeLinecap="round" stroke="#374151" fill="none" />
        
        {/* Ticks and Labels */}
        {ticksData.map(val => {
          const tickAngleRad = ((val / maxValue) * 180 - 180) * Math.PI / 180; 
          const isMainTick = val % 20 === 0;
          const currentTickLength = isMainTick ? mainTickLength : tickLength;
          
          const x1 = centerX + (radius - currentTickLength / 2) * Math.cos(tickAngleRad);
          const y1 = centerY + (radius - currentTickLength / 2) * Math.sin(tickAngleRad);
          const x2 = centerX + (radius + currentTickLength / 2) * Math.cos(tickAngleRad);
          const y2 = centerY + (radius + currentTickLength / 2) * Math.sin(tickAngleRad);
          
          let textAnchor = "middle";
          let dx = 0, dy = 4;
          if (val === 0) { textAnchor = "start"; dx = 2; dy = 2;}
          else if (val === maxValue) { textAnchor = "end"; dx = -2; dy = 2;}
          else if (val === maxValue / 2) { dy = -2; }

          const textX = centerX + (radius + (isMainTick ? 12 : 8)) * Math.cos(tickAngleRad) + dx;
          const textY = centerY + (radius + (isMainTick ? 12 : 8)) * Math.sin(tickAngleRad) + dy;

          return (
            <g key={`tick-throttle-${val}`}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#718096" strokeWidth={isMainTick ? "1.5" : "1"} />
              {isMainTick && val !== 50 && ( // Don't draw label for 50 to avoid clutter if needle is there
                 <text 
                    x={textX} 
                    y={textY} 
                    fontSize="8" 
                    fill="#A0AEC0" 
                    textAnchor={textAnchor}
                    dominantBaseline="central"
                 >
                    {val}
                 </text>
              )}
            </g>
          );
        })}
        
        {/* Needle (Triangle Path) */}
        <path 
            d={`M ${centerX} ${centerY - (radius - 10)} L ${centerX - 4} ${centerY} L ${centerX + 4} ${centerY} Z`}
            fill="#EF4444" // Red needle
            stroke="#D03030" // Darker red stroke
            strokeWidth="1"
            strokeLinecap="round"
            style={{ transition: 'transform 0.3s ease-out', transformOrigin: `${centerX}px ${centerY}px` }}
            transform={`rotate(${needleRotationDegrees})`}
        />
        {/* Needle Pivot */}
        <circle cx={centerX} cy={centerY} r="6" fill="#CBD5E0" stroke="#4A5568" strokeWidth="1" />
      </svg>
    </div>
  );
};