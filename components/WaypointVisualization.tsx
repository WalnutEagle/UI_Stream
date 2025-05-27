import React from 'react';

interface WaypointVisualizationProps {
  waypoints: Array<{ X: number; Y: number }>;
  width?: number;
  height?: number;
  className?: string;
}

export const WaypointVisualization: React.FC<WaypointVisualizationProps> = ({ 
  waypoints, 
  width = 300, 
  height = 200,
  className = "" 
}) => {
  if (!waypoints || waypoints.length === 0) {
    return (
      <div className={`flex items-center justify-center bg-gray-800 rounded-lg ${className}`} style={{ width, height }}>
        <p className="text-sm text-gray-500 italic">No waypoints predicted</p>
      </div>
    );
  }
  
  // Find bounds of the waypoints
  const xValues = waypoints.map(wp => wp.X);
  const yValues = waypoints.map(wp => wp.Y);
  const minX = Math.min(...xValues);
  const maxX = Math.max(...xValues);
  const minY = Math.min(...yValues);
  const maxY = Math.max(...yValues);
  
  // Add padding
  const padding = 20;
  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;
  
  // Scale waypoints to fit the SVG
  const scaleX = (width - 2 * padding) / rangeX;
  const scaleY = (height - 2 * padding) / rangeY;
  const scale = Math.min(scaleX, scaleY) * 0.8; // Use 80% to leave some margin
  
  // Center the path
  const centerX = width / 2;
  const centerY = height / 2;
  const pathCenterX = (minX + maxX) / 2;
  const pathCenterY = (minY + maxY) / 2;
  
  // Convert waypoints to SVG coordinates
  const svgPoints = waypoints.map(wp => ({
    x: centerX + (wp.X - pathCenterX) * scale,
    y: centerY - (wp.Y - pathCenterY) * scale // Invert Y for SVG
  }));
  
  // Create path string
  const pathString = svgPoints
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');

  return (
    <div className={`bg-gray-800 rounded-lg p-2 ${className}`}>
      <svg width={width} height={height} className="w-full h-full">
        {/* Grid lines */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(75, 85, 99, 0.3)" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        
        {/* Center crosshair (vehicle position) */}
        <line 
          x1={centerX - 10} 
          y1={centerY} 
          x2={centerX + 10} 
          y2={centerY} 
          stroke="rgba(59, 130, 246, 0.5)" 
          strokeWidth="2"
        />
        <line 
          x1={centerX} 
          y1={centerY - 10} 
          x2={centerX} 
          y2={centerY + 10} 
          stroke="rgba(59, 130, 246, 0.5)" 
          strokeWidth="2"
        />
        
        {/* Predicted path */}
        <path
          d={pathString}
          fill="none"
          stroke="rgba(52, 211, 153, 0.8)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Waypoint dots */}
        {svgPoints.map((point, index) => (
          <g key={index}>
            <circle
              cx={point.x}
              cy={point.y}
              r="4"
              fill={index === 0 ? "rgb(59, 130, 246)" : "rgb(52, 211, 153)"}
              stroke="white"
              strokeWidth="1"
            />
            {/* Show waypoint number for first and last */}
            {(index === 0 || index === waypoints.length - 1) && (
              <text
                x={point.x}
                y={point.y - 8}
                fill="white"
                fontSize="10"
                textAnchor="middle"
                className="font-mono"
              >
                {index === 0 ? 'Start' : 'End'}
              </text>
            )}
          </g>
        ))}
        
        {/* Vehicle icon at center */}
        <g transform={`translate(${centerX}, ${centerY})`}>
          <path
            d="M -8 4 L 0 -8 L 8 4 L 4 4 L 4 8 L -4 8 L -4 4 Z"
            fill="rgb(59, 130, 246)"
            stroke="white"
            strokeWidth="1"
          />
        </g>
      </svg>
      
      {/* Legend */}
      <div className="flex justify-between items-center mt-2 text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span>Vehicle</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
          <span>Predicted Path</span>
        </div>
      </div>
    </div>
  );
};