import React, { useEffect, useRef } from 'react';

interface GPSMapDisplayProps {
  latitude: number;
  longitude: number;
  altitude: number;
  className?: string;
}

export const GPSMapDisplay: React.FC<GPSMapDisplayProps> = ({ 
  latitude, 
  longitude, 
  altitude,
  className = "" 
}) => {
  // Much smaller bounding box for very close zoom (approximately building level)
  const zoomDelta = 0.0008; // This gives approximately zoom level 19-20 (very close)
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude-zoomDelta},${latitude-zoomDelta},${longitude+zoomDelta},${latitude+zoomDelta}&layer=mapnik&marker=${latitude},${longitude}`;
  
  // Format coordinates for display
  const formatCoordinate = (value: number, isLat: boolean) => {
    const absValue = Math.abs(value);
    const degrees = Math.floor(absValue);
    const minutes = Math.floor((absValue - degrees) * 60);
    const seconds = ((absValue - degrees - minutes/60) * 3600).toFixed(2);
    const direction = isLat 
      ? (value >= 0 ? 'N' : 'S')
      : (value >= 0 ? 'E' : 'W');
    return `${degrees}°${minutes}'${seconds}"${direction}`;
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Formatted Coordinates Display */}
      <div className="bg-gray-800 rounded-lg p-3">
        <h4 className="text-xs text-gray-400 mb-2 uppercase tracking-wider">GPS Coordinates</h4>
        <div className="space-y-1 font-mono text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Latitude:</span>
            <span className="text-green-400">{formatCoordinate(latitude, true)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Longitude:</span>
            <span className="text-blue-400">{formatCoordinate(longitude, false)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Altitude:</span>
            <span className="text-yellow-400">{altitude.toFixed(1)} m</span>
          </div>
        </div>
      </div>

      {/* Map Display with dark theme */}
      <div className="relative bg-gray-800 rounded-lg overflow-hidden" style={{ height: '250px' }}>
        <iframe
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          marginHeight={0}
          marginWidth={0}
          src={mapUrl}
          style={{ 
            filter: 'invert(100%) hue-rotate(180deg) brightness(0.95) contrast(0.9) sepia(0.2)',
            opacity: 0.9
          }}
          title="Vehicle Location Map"
        />
        {/* Dark overlay for better night theme */}
        <div className="absolute inset-0 bg-blue-900/10 pointer-events-none" />
        
        {/* Custom marker overlay since the inverted one looks weird */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-full">
          <div className="relative">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <div className="absolute top-0 left-0 w-3 h-3 bg-red-500 rounded-full animate-ping" />
          </div>
        </div>
        
        <div className="absolute bottom-2 right-2 bg-black/80 text-gray-300 text-xs px-2 py-1 rounded">
          © OpenStreetMap
        </div>
      </div>

      {/* Location Details */}
      <div className="bg-gray-800 rounded-lg p-3">
        <h4 className="text-xs text-gray-400 mb-2 uppercase tracking-wider">Location Info</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-500">Decimal:</span>
            <div className="text-xs text-gray-300">
              {latitude.toFixed(6)}, {longitude.toFixed(6)}
            </div>
          </div>
          <div>
            <span className="text-gray-500">Elevation:</span>
            <div className="text-xs text-gray-300">
              {(altitude * 3.28084).toFixed(0)} ft / {altitude.toFixed(0)} m
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};