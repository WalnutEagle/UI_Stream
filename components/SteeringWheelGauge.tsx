import React from 'react';

interface SteeringWheelGaugeProps {
  steeringAngle: number; // e.g., -45 to 45
  maxAngle: number;      // e.g., 45 (absolute max deflection)
  label: string;
  showValue?: boolean;
}

export const SteeringWheelGauge: React.FC<SteeringWheelGaugeProps> = ({ steeringAngle, maxAngle, label, showValue = true }) => {
  const clampedAngle = Math.max(-maxAngle, Math.min(steeringAngle, maxAngle));

  // Map steeringAngle to a 0-100 scale for the gauge logic
  const valueForGauge = ((clampedAngle + maxAngle) / (2 * maxAngle)) * 100;
  const needleRotationDegrees = (valueForGauge / 100) * 180 - 90; // -90 (left) to +90 (right)

  const svgWidth = 180;
  const svgHeight = 105; 
  const centerX = svgWidth / 2;
  const centerY = svgHeight - 15; 
  const radius = 75;
  const tickLength = 10;

  const arcPath = `
    M ${centerX - radius} ${centerY}
    A ${radius} ${radius} 0 0 1 ${centerX + radius} ${centerY}
  `;

  const ticksData = [
    { val: 0, label: "L", angleDegrees: -maxAngle }, // Corresponds to full left
    { val: 50, label: "", angleDegrees: 0 },       // Center
    { val: 100, label: "R", angleDegrees: maxAngle },// Corresponds to full right
  ];

  return (
    <div className="text-center flex-1 min-w-[180px] p-2">
      <div className="text-sm text-gray-300 mb-1 h-12 flex flex-col justify-center items-center"> {/* Fixed height, always present */}
        <span>{label}</span> {/* Always visible label */}
        <span className={`font-bold text-lg text-sky-400 ${!showValue ? 'invisible' : ''}`}>
          {clampedAngle.toFixed(1)}°
        </span>
      </div>

      <svg width="100%" height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="mx-auto">
        <path d={arcPath} strokeWidth="12" strokeLinecap="round" stroke="#374151" fill="none" />
        
        {ticksData.map(tick => {
          const tickPositionAngleRad = ((tick.val / 100) * 180 - 180) * Math.PI / 180; // Map 0-100 to -180 to 0 degrees for semi-circle
          const isCenterTick = tick.val === 50;
          const currentTickLength = isCenterTick ? tickLength + 4 : tickLength;
          
          const x1 = centerX + (radius - currentTickLength / 2) * Math.cos(tickPositionAngleRad);
          const y1 = centerY + (radius - currentTickLength / 2) * Math.sin(tickPositionAngleRad);
          const x2 = centerX + (radius + currentTickLength / 2) * Math.cos(tickPositionAngleRad);
          const y2 = centerY + (radius + currentTickLength / 2) * Math.sin(tickPositionAngleRad);
          
          let textAnchor = "middle";
          let dx = 0, dy = 5; // Default adjustments for tick labels
            if (tick.val === 0) { textAnchor = "start"; dx = 5; dy = 2; } // "L" label
            else if (tick.val === 100) { textAnchor = "end"; dx = -5; dy = 2; } // "R" label

          const textX = centerX + (radius + 10) * Math.cos(tickPositionAngleRad) + dx;
          const textY = centerY + (radius + 10) * Math.sin(tickPositionAngleRad) + dy;

          return (
            <g key={`tick-steering-${tick.val}`}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#718096" strokeWidth={isCenterTick ? "2" : "1.5"} />
              {tick.label && (
                 <text 
                    x={textX} 
                    y={textY} 
                    fontSize="12" 
                    fontWeight="bold"
                    fill="#A0AEC0" 
                    textAnchor={textAnchor}
                    dominantBaseline="central"
                 >
                    {tick.label}
                 </text>
              )}
            </g>
          );
        })}

        <path 
            d={`M ${centerX} ${centerY - (radius - 10)} L ${centerX - 4} ${centerY} L ${centerX + 4} ${centerY} Z`}
            fill="#0EA5E9" // Sky blue needle
            stroke="#0C85C7" // Darker sky blue stroke
            strokeWidth="1"
            strokeLinecap="round"
            style={{ transition: 'transform 0.3s ease-out', transformOrigin: `${centerX}px ${centerY}px` }}
            transform={`rotate(${needleRotationDegrees})`}
        />
        
        <circle cx={centerX} cy={centerY} r="6" fill="#CBD5E0" stroke="#4A5568" strokeWidth="1" />
      </svg>
    </div>
  );
};