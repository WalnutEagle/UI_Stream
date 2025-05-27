import React from 'react';

interface GoogleMapDisplayProps {
  latitude: number;
  longitude: number;
  altitude: number;
  className?: string;
}

export const GoogleMapDisplay: React.FC<GoogleMapDisplayProps> = ({ 
  latitude, 
  longitude, 
  altitude,
  className = "" 
}) => {
  // Get API key from environment variable
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  
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

  // Google Maps Static API with dark theme
  const mapUrl = apiKey 
    ? `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=18&size=600x400&maptype=roadmap&style=feature:all|element:geometry|color:0x242f3e&style=feature:all|element:labels.text.stroke|color:0x242f3e&style=feature:all|element:labels.text.fill|color:0x746855&style=feature:administrative.locality|element:labels.text.fill|color:0xd59563&style=feature:poi|element:labels.text.fill|color:0xd59563&style=feature:poi.park|element:geometry|color:0x263c3f&style=feature:poi.park|element:labels.text.fill|color:0x6b9a76&style=feature:road|element:geometry|color:0x38414e&style=feature:road|element:geometry.stroke|color:0x212a37&style=feature:road|element:labels.text.fill|color:0x9ca5b3&style=feature:road.highway|element:geometry|color:0x746855&style=feature:road.highway|element:geometry.stroke|color:0x1f2835&style=feature:road.highway|element:labels.text.fill|color:0xf3d19c&style=feature:transit|element:geometry|color:0x2f3948&style=feature:transit.station|element:labels.text.fill|color:0xd59563&style=feature:water|element:geometry|color:0x17263c&style=feature:water|element:labels.text.fill|color:0x515c6d&style=feature:water|element:labels.text.stroke|color:0x17263c&markers=color:red|${latitude},${longitude}&key=${apiKey}`
    : '';

  // Night mode styles for Google Maps
  const nightModeStyles = [
    { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
    {
      featureType: 'administrative.locality',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#d59563' }]
    },
    {
      featureType: 'poi',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#d59563' }]
    },
    {
      featureType: 'poi.park',
      elementType: 'geometry',
      stylers: [{ color: '#263c3f' }]
    },
    {
      featureType: 'poi.park',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#6b9a76' }]
    },
    {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [{ color: '#38414e' }]
    },
    {
      featureType: 'road',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#212a37' }]
    },
    {
      featureType: 'road',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#9ca5b3' }]
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry',
      stylers: [{ color: '#746855' }]
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#1f2835' }]
    },
    {
      featureType: 'road.highway',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#f3d19c' }]
    },
    {
      featureType: 'transit',
      elementType: 'geometry',
      stylers: [{ color: '#2f3948' }]
    },
    {
      featureType: 'transit.station',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#d59563' }]
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: '#17263c' }]
    },
    {
      featureType: 'water',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#515c6d' }]
    },
    {
      featureType: 'water',
      elementType: 'labels.text.stroke',
      stylers: [{ color: '#17263c' }]
    }
  ];

  // Since Google Maps Embed API doesn't support custom styles directly,
  // we'll use a workaround with the JavaScript API loaded in an iframe
  const mapHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          html, body, #map {
            height: 100%;
            margin: 0;
            padding: 0;
            background: #1a1a1a;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          function initMap() {
            const position = { lat: ${latitude}, lng: ${longitude} };
            
            const map = new google.maps.Map(document.getElementById('map'), {
              center: position,
              zoom: 18,
              disableDefaultUI: true,
              zoomControl: true,
              mapTypeControl: false,
              scaleControl: true,
              streetViewControl: false,
              rotateControl: false,
              fullscreenControl: false,
              styles: ${JSON.stringify(nightModeStyles)}
            });
            
            new google.maps.Marker({
              position: position,
              map: map,
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: '#ef4444',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 2
              },
              title: 'Vehicle Location'
            });
          }
        </script>
        <script async defer 
          src="https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap">
        </script>
      </body>
    </html>
  `;

  const encodedMapHtml = encodeURIComponent(mapHtml);
  const dataUrl = `data:text/html;charset=utf-8,${encodedMapHtml}`;

  if (!apiKey) {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="bg-gray-900 rounded-lg p-6 text-center">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-gray-400 mb-2">Google Maps API Key Required</p>
            <p className="text-xs text-gray-500">Add VITE_GOOGLE_MAPS_API_KEY to your .env file</p>
          </div>
        </div>
      </div>
    );
  }

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

      {/* Google Maps Display with Night Theme */}
      <div className="relative bg-gray-800 rounded-lg overflow-hidden" style={{ height: '300px' }}>
        <iframe
          width="100%"
          height="100%"
          frameBorder="0"
          style={{ border: 0 }}
          src={dataUrl}
          allowFullScreen
          title="Vehicle Location Map"
        />
        
        {/* Map controls overlay */}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          <a 
            href={`https://www.google.com/maps?q=${latitude},${longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 bg-black/70 hover:bg-black/80 text-white rounded flex items-center justify-center text-xs"
            title="Open in Google Maps"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
        
        {/* Scale indicator */}
        <div className="absolute bottom-10 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
          <div className="flex items-center gap-1">
            <div className="w-10 h-0.5 bg-white" />
            <span>~20m</span>
          </div>
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
            <div className="text-blue-400 font-semibold">18x</div>
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