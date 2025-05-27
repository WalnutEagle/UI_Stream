import React from 'react';
import { InferenceMode } from '../types';

interface EnergyDataPoint {
  value: number;
  mode: InferenceMode;
  timestamp: Date;
}

interface EnergyLineChartProps {
  data: EnergyDataPoint[];
  maxDataPoints?: number;
  height?: number;
  className?: string;
}

export const EnergyLineChart: React.FC<EnergyLineChartProps> = ({ 
  data, 
  maxDataPoints = 40,
  height = 150,
  className = ""
}) => {
  // Keep only the latest maxDataPoints
  const displayData = data.slice(-maxDataPoints);
  
  if (displayData.length < 2) {
    return (
      <div className={`w-full bg-gray-800 rounded-lg p-4 ${className}`} style={{ height: `${height}px` }}>
        <div className="flex items-center justify-center h-full text-gray-500 text-sm">
          Collecting energy data...
        </div>
      </div>
    );
  }
  
  // Calculate min and max for scaling
  const values = displayData.map(d => d.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = maxValue - minValue || 1;
  const padding = range * 0.1;
  
  // SVG dimensions
  const svgWidth = 800;
  const svgHeight = height;
  const chartPadding = { top: 20, right: 60, bottom: 40, left: 60 };
  const chartWidth = svgWidth - chartPadding.left - chartPadding.right;
  const chartHeight = svgHeight - chartPadding.top - chartPadding.bottom;
  
  // Create points for the line
  const points = displayData.map((point, index) => {
    const x = (index / (maxDataPoints - 1)) * chartWidth + chartPadding.left;
    const y = chartHeight - ((point.value - (minValue - padding)) / (range + 2 * padding)) * chartHeight + chartPadding.top;
    return { x, y, mode: point.mode, value: point.value };
  });
  
  // Create path segments by mode
  const pathSegments: { path: string; mode: InferenceMode }[] = [];
  let currentSegment = { path: `M ${points[0].x} ${points[0].y}`, mode: points[0].mode };
  
  for (let i = 1; i < points.length; i++) {
    if (points[i].mode === points[i-1].mode) {
      currentSegment.path += ` L ${points[i].x} ${points[i].y}`;
    } else {
      pathSegments.push(currentSegment);
      currentSegment = { 
        path: `M ${points[i-1].x} ${points[i-1].y} L ${points[i].x} ${points[i].y}`, 
        mode: points[i].mode 
      };
    }
  }
  pathSegments.push(currentSegment);
  
  // Y-axis labels
  const yLabels = [minValue - padding, (minValue + maxValue) / 2, maxValue + padding];
  
  return (
    <div className={`w-full bg-gray-800 rounded-lg p-4 ${className}`}>
      <div className="relative" style={{ height: `${height}px` }}>
        <svg width="100%" height="100%" viewBox={`0 0 ${svgWidth} ${svgHeight}`} preserveAspectRatio="none">
          {/* Grid lines */}
          <g className="text-gray-700">
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const y = chartPadding.top + chartHeight * (1 - ratio);
              return (
                <line
                  key={ratio}
                  x1={chartPadding.left}
                  y1={y}
                  x2={chartPadding.left + chartWidth}
                  y2={y}
                  stroke="currentColor"
                  strokeWidth="0.5"
                  strokeDasharray="2,2"
                />
              );
            })}
          </g>
          
          {/* Y-axis labels */}
          <g className="text-gray-400 text-xs">
            {yLabels.map((label, index) => {
              const y = chartPadding.top + chartHeight * (1 - index / (yLabels.length - 1));
              return (
                <text
                  key={index}
                  x={chartPadding.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  fill="currentColor"
                >
                  {label.toFixed(0)}
                </text>
              );
            })}
            <text
              x={chartPadding.left - 40}
              y={svgHeight / 2}
              textAnchor="middle"
              fill="currentColor"
              transform={`rotate(-90, ${chartPadding.left - 40}, ${svgHeight / 2})`}
            >
              Energy (Wh)
            </text>
          </g>
          
          {/* Area fill under line */}
          {pathSegments.map((segment, index) => {
            const fillPath = segment.path + 
              ` L ${points[points.length - 1].x} ${chartHeight + chartPadding.top}` +
              ` L ${points[0].x} ${chartHeight + chartPadding.top} Z`;
            
            return (
              <path
                key={`fill-${index}`}
                d={fillPath}
                fill={segment.mode === InferenceMode.CLOUD ? 'rgba(167, 139, 250, 0.1)' : 'rgba(45, 212, 191, 0.1)'}
              />
            );
          })}
          
          {/* Line segments */}
          {pathSegments.map((segment, index) => (
            <path
              key={`line-${index}`}
              d={segment.path}
              fill="none"
              stroke={segment.mode === InferenceMode.CLOUD ? 'rgb(167, 139, 250)' : 'rgb(45, 212, 191)'}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
          
          {/* Data points */}
          {points.map((point, index) => (
            <g key={index}>
              <circle
                cx={point.x}
                cy={point.y}
                r="4"
                fill={point.mode === InferenceMode.CLOUD ? 'rgb(167, 139, 250)' : 'rgb(45, 212, 191)'}
                stroke="white"
                strokeWidth="1"
              />
              {/* Tooltip on hover */}
              <title>{`${point.value.toFixed(1)} Wh (${point.mode})`}</title>
            </g>
          ))}
          
          {/* Current value label */}
          {points.length > 0 && (
            <g>
              <rect
                x={points[points.length - 1].x + 10}
                y={points[points.length - 1].y - 10}
                width="50"
                height="20"
                fill="rgb(31, 41, 55)"
                stroke={points[points.length - 1].mode === InferenceMode.CLOUD ? 'rgb(167, 139, 250)' : 'rgb(45, 212, 191)'}
                strokeWidth="1"
                rx="3"
              />
              <text
                x={points[points.length - 1].x + 35}
                y={points[points.length - 1].y + 3}
                textAnchor="middle"
                fill="white"
                fontSize="12"
                fontWeight="bold"
              >
                {points[points.length - 1].value.toFixed(1)}
              </text>
            </g>
          )}
          
          {/* X-axis label */}
          <text
            x={svgWidth / 2}
            y={svgHeight - 5}
            textAnchor="middle"
            fill="currentColor"
            className="text-xs text-gray-400"
          >
            Time →
          </text>
        </svg>
        
        {/* Legend */}
        <div className="absolute top-0 right-0 bg-gray-900/90 rounded p-2 text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
              <span className="text-gray-300">Cloud Policy</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-teal-400 rounded-full"></div>
              <span className="text-gray-300">Local Policy</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};