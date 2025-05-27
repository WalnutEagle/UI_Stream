import React, { useState } from 'react';

interface EnhancedGPSMapProps {
  latitude: number;
  longitude: number;
  altitude: number;
  className?: string;
}

export const EnhancedGPSMap: React.FC<EnhancedGPSMapProps> = ({ 
  latitude, 
  longitude, 
  altitude,
  className = "" 
}) => {
  const [mapType, setMapType] = useState<'street' | 'satellite'>('street');
  
  // Very close zoom for detailed view
  const zoomDelta = 0.0005; // Extremely close zoom
  
  // OpenStreetMap URL for street view
  const streetMapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude-zoomDelta},${latitude-zoomDelta},${longitude+zoomDelta},${latitude+zoomDelta}&layer=mapnik&marker=${latitude},${longitude}`;
  
  // Alternative: Use a static satellite image (you'd need an API key for real satellite imagery)
  // For demo, we'll create a placeholder
  const satelliteViewPlaceholder = (
    <div className="w-full h-full bg-gray-900 flex flex-col items-center justify-center text-gray-400">
      <svg className="w-16 h-16 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p className="text-sm">Satellite View</p>
      <p className="text-xs mt-1">Lat: {latitude.toFixed(6)}</p>
      <p className="text-xs">Lon: {longitude.toFixed(6)}</p>
      <p className="text-xs mt-2 text-gray-500">API key required for real satellite imagery</p>
    </div>
  );

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Map Type Toggle */}
      <div className="flex gap-2 justify-center">
        <button
          onClick={() => setMapType('street')}
          className={`px-3 py-1 text-xs rounded transition-colors ${
            mapType === 'street' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Street View
        </button>
        <button
          onClick={() => setMapType('satellite')}
          className={`px-3 py-1 text-xs rounded transition-colors ${
            mapType === 'satellite' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Satellite View
        </button>
      </div>

      {/* Enhanced Map Display */}
      <div className="relative bg-gray-800 rounded-lg overflow-hidden" style={{ height: '300px' }}>
        {mapType === 'street' ? (
          <>
            <iframe
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              marginHeight={0}
              marginWidth={0}
              src={streetMapUrl}
              style={{ 
                filter: 'invert(100%) hue-rotate(180deg) brightness(0.95) contrast(0.9) sepia(0.2)',
                opacity: 0.9
              }}
              title="Vehicle Location Map"
            />
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-blue-900/10 pointer-events-none" />
          </>
        ) : (
          satelliteViewPlaceholder
        )}
        
        {/* Custom vehicle marker with direction indicator */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="relative">
            {/* Vehicle direction arrow (you could rotate this based on heading) */}
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
              <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[12px] border-b-green-400" />
            </div>
            {/* Vehicle position */}
            <div className="relative">
              <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse" />
              <div className="absolute top-0 left-0 w-4 h-4 bg-red-500 rounded-full animate-ping" />
            </div>
          </div>
        </div>
        
        {/* Zoom controls */}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          <button className="w-8 h-8 bg-black/70 hover:bg-black/80 text-white rounded flex items-center justify-center text-lg">
            +
          </button>
          <button className="w-8 h-8 bg-black/70 hover:bg-black/80 text-white rounded flex items-center justify-center text-lg">
            -
          </button>
        </div>
        
        {/* Compass */}
        <div className="absolute top-2 left-2 w-10 h-10 bg-black/70 rounded-full flex items-center justify-center">
          <div className="text-white text-xs font-bold">N</div>
        </div>
        
        {/* Scale indicator */}
        <div className="absolute bottom-10 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
          <div className="flex items-center gap-1">
            <div className="w-10 h-0.5 bg-white" />
            <span>~10m</span>
          </div>
        </div>
        
        {/* Attribution */}
        <div className="absolute bottom-2 right-2 bg-black/80 text-gray-300 text-xs px-2 py-1 rounded">
          © OpenStreetMap
        </div>
      </div>

      {/* Additional Info */}
      <div className="bg-gray-800 rounded-lg p-3 text-xs">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-gray-500">Altitude</div>
            <div className="text-yellow-400 font-semibold">{altitude.toFixed(1)}m</div>
          </div>
          <div>
            <div className="text-gray-500">Zoom Level</div>
            <div className="text-blue-400 font-semibold">20x</div>
          </div>
          <div>
            <div className="text-gray-500">Accuracy</div>
            <div className="text-green-400 font-semibold">±3m</div>
          </div>
        </div>
      </div>
    </div>
  );
};