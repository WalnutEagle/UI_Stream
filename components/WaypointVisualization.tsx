import React, { useState } from 'react';

interface WaypointVisualizationProps {
  waypoints: Array<{ X: number; Y: number }>;
  calculatedWaypoints: Array<{ X: number; Y: number }>;
  width?: number;
  height?: number;
  className?: string;
}

export const WaypointVisualization: React.FC<WaypointVisualizationProps> = ({ 
  waypoints, 
  calculatedWaypoints,
  width = 300, 
  height = 200,
  className = "" 
}) => {
  const [useCalculated, setUseCalculated] = useState(true);
  
  // Use calculated waypoints by default, or API waypoints if toggled
  const displayWaypoints = useCalculated ? calculatedWaypoints : waypoints;
  if (!displayWaypoints || displayWaypoints.length === 0) {
    return (
      <div className={`flex items-center justify-center bg-gray-800 rounded-lg ${className}`} style={{ width, height }}>
        <p className="text-sm text-gray-500 italic">No waypoints predicted</p>
      </div>
    );
  }
  
  // Find bounds of the waypoints
  const xValues = displayWaypoints.map(wp => wp.X);
  const yValues = displayWaypoints.map(wp => wp.Y);
  const minX = Math.min(...xValues);
  const maxX = Math.max(...xValues);
  const minY = Math.min(...yValues);
  const maxY = Math.max(...yValues);
  
  // Add padding
  const padding = 30;
  
  // Calculate the scale to fit all waypoints
  // We want the vehicle at bottom-center and waypoints extending upward
  const maxForwardDistance = Math.max(...xValues, 1);
  const maxLateralDistance = Math.max(Math.abs(minY), Math.abs(maxY), 1) * 2;
  
  // Scale to fit the visualization area
  const scaleX = (width - 2 * padding) / maxLateralDistance;
  const scaleY = (height - 2 * padding) / maxForwardDistance;
  const scale = Math.min(scaleX, scaleY) * 0.8;
  
  // Position vehicle at bottom-center of the visualization
  const vehicleX = width / 2;
  const vehicleY = height - padding;
  
  // Convert waypoints to SVG coordinates
  // Vehicle is at (0,0) in waypoint space, positioned at (vehicleX, vehicleY) in SVG space
  const svgPoints = displayWaypoints.map(wp => ({
    x: vehicleX + wp.Y * scale,     // Y (left/right) maps to SVG X
    y: vehicleY - wp.X * scale      // X (forward) maps to SVG Y (inverted)
  }));
  
  // Add vehicle position as the first point
  const vehiclePoint = { x: vehicleX, y: vehicleY };
  
  // Create path string starting from vehicle
  const pathString = `M ${vehicleX} ${vehicleY} ` + 
    svgPoints.map(point => `L ${point.x} ${point.y}`).join(' ');

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
        
        {/* Ground line */}
        <line 
          x1={padding} 
          y1={vehicleY} 
          x2={width - padding} 
          y2={vehicleY} 
          stroke="rgba(255, 255, 255, 0.1)" 
          strokeWidth="1"
          strokeDasharray="2,2"
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
            {(index === 0 || index === displayWaypoints.length - 1) && (
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
        
        {/* Vehicle icon at bottom center - pointing up (forward) */}
        <g transform={`translate(${vehicleX}, ${vehicleY})`}>
          <path
            d="M 0 5 L -6 -3 L -3 -3 L -3 -7 L 3 -7 L 3 -3 L 6 -3 Z"
            fill="rgb(59, 130, 246)"
            stroke="white"
            strokeWidth="1.5"
          />
          {/* Vehicle center dot */}
          <circle cx="0" cy="0" r="2" fill="white" opacity="0.8" />
        </g>
      </svg>
      
      {/* Toggle and Legend */}
      <div className="mt-2">
        {/* Toggle Button */}
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => setUseCalculated(!useCalculated)}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              useCalculated 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-600 text-white hover:bg-gray-700'
            }`}
          >
            {useCalculated ? 'Calculated' : 'API'} Waypoints
          </button>
          <span className="text-xs text-gray-500">
            {waypoints.length > 0 ? `${waypoints.length} API points available` : 'No API data'}
          </span>
        </div>
        
        {/* Legend */}
        <div className="flex justify-between items-center text-xs text-gray-400">
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
    </div>
  );
};