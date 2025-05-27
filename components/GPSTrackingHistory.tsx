import React from 'react';

interface GPSPoint {
  lat: number;
  lon: number;
  timestamp: Date;
}

interface GPSTrackingHistoryProps {
  history: GPSPoint[];
  maxPoints?: number;
  className?: string;
}

export const GPSTrackingHistory: React.FC<GPSTrackingHistoryProps> = ({ 
  history, 
  maxPoints = 20,
  className = "" 
}) => {
  // Keep only the latest maxPoints
  const displayHistory = history.slice(-maxPoints);
  
  if (displayHistory.length < 2) {
    return (
      <div className={`bg-gray-800 rounded-lg p-4 text-center text-gray-500 ${className}`}>
        <p className="text-sm">Tracking history will appear here...</p>
      </div>
    );
  }

  // Calculate distance between two GPS points (Haversine formula)
  const calculateDistance = (point1: GPSPoint, point2: GPSPoint): number => {
    const R = 6371000; // Earth radius in meters
    const φ1 = point1.lat * Math.PI / 180;
    const φ2 = point2.lat * Math.PI / 180;
    const Δφ = (point2.lat - point1.lat) * Math.PI / 180;
    const Δλ = (point2.lon - point1.lon) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  };

  // Calculate total distance traveled
  let totalDistance = 0;
  for (let i = 1; i < displayHistory.length; i++) {
    totalDistance += calculateDistance(displayHistory[i-1], displayHistory[i]);
  }

  // Calculate speed between last two points
  const lastSpeed = displayHistory.length >= 2 
    ? calculateDistance(
        displayHistory[displayHistory.length - 2], 
        displayHistory[displayHistory.length - 1]
      ) / ((displayHistory[displayHistory.length - 1].timestamp.getTime() - 
           displayHistory[displayHistory.length - 2].timestamp.getTime()) / 1000)
    : 0;

  return (
    <div className={`bg-gray-800 rounded-lg p-4 ${className}`}>
      <h4 className="text-sm text-gray-400 mb-3">GPS Tracking Stats</h4>
      
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-700/50 rounded p-2">
          <div className="text-xs text-gray-400">Distance Traveled</div>
          <div className="text-lg font-semibold text-blue-400">
            {(totalDistance / 1000).toFixed(2)} km
          </div>
        </div>
        <div className="bg-gray-700/50 rounded p-2">
          <div className="text-xs text-gray-400">Current Speed</div>
          <div className="text-lg font-semibold text-green-400">
            {(lastSpeed * 3.6).toFixed(1)} km/h
          </div>
        </div>
      </div>

      {/* Mini path visualization */}
      <div className="bg-gray-900 rounded p-2" style={{ height: '100px' }}>
        <svg width="100%" height="100%" viewBox="0 0 200 80">
          {displayHistory.length > 1 && (() => {
            const lats = displayHistory.map(p => p.lat);
            const lons = displayHistory.map(p => p.lon);
            const minLat = Math.min(...lats);
            const maxLat = Math.max(...lats);
            const minLon = Math.min(...lons);
            const maxLon = Math.max(...lons);
            const latRange = maxLat - minLat || 0.0001;
            const lonRange = maxLon - minLon || 0.0001;

            const points = displayHistory.map((point, index) => ({
              x: ((point.lon - minLon) / lonRange) * 180 + 10,
              y: 70 - ((point.lat - minLat) / latRange) * 60,
              opacity: (index + 1) / displayHistory.length
            }));

            const pathString = points
              .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
              .join(' ');

            return (
              <>
                <path
                  d={pathString}
                  fill="none"
                  stroke="rgba(59, 130, 246, 0.8)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                {points.map((point, index) => (
                  <circle
                    key={index}
                    cx={point.x}
                    cy={point.y}
                    r="2"
                    fill={`rgba(59, 130, 246, ${point.opacity})`}
                  />
                ))}
                {/* Current position */}
                <circle
                  cx={points[points.length - 1].x}
                  cy={points[points.length - 1].y}
                  r="4"
                  fill="rgb(52, 211, 153)"
                  stroke="white"
                  strokeWidth="1"
                />
              </>
            );
          })()}
        </svg>
      </div>
      
      <div className="text-xs text-gray-500 mt-2 text-center">
        Tracking last {displayHistory.length} positions
      </div>
    </div>
  );
};