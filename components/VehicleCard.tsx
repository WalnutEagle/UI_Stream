import React from 'react';
import { Link } from 'react-router-dom';

interface VehicleCardProps {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'maintenance';
  lastUpdate: Date;
  location: { lat: number; lon: number };
  speed: number;
  thumbnailUrl?: string;
}

const StatusBadge: React.FC<{ status: VehicleCardProps['status'] }> = ({ status }) => {
  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-red-500',
    maintenance: 'bg-yellow-500'
  };

  return (
    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColors[status]} text-white`}>
      <div className="w-2 h-2 rounded-full bg-white opacity-75 mr-1 animate-pulse" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </div>
  );
};

export const VehicleCard: React.FC<VehicleCardProps> = ({
  id,
  name,
  status,
  lastUpdate,
  location,
  speed,
  thumbnailUrl
}) => {
  const timeSinceUpdate = Math.floor((Date.now() - lastUpdate.getTime()) / 1000);
  const timeString = timeSinceUpdate < 60 ? `${timeSinceUpdate}s ago` : `${Math.floor(timeSinceUpdate / 60)}m ago`;

  return (
    <Link
      to={`/vehicle/${id}`}
      className="block bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition-all duration-200 hover:shadow-xl border border-gray-700 hover:border-gray-600"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-white mb-1">{name}</h3>
          <p className="text-sm text-gray-400">ID: {id}</p>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="aspect-video bg-gray-900 rounded-md mb-4 overflow-hidden">
        {thumbnailUrl ? (
          <img 
            src={thumbnailUrl} 
            alt={`${name} camera feed`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-600">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-400">Speed</p>
          <p className="text-white font-medium">{speed.toFixed(1)} km/h</p>
        </div>
        <div>
          <p className="text-gray-400">Location</p>
          <p className="text-white font-medium" title={`${location.lat}, ${location.lon}`}>
            {location.lat.toFixed(4)}, {location.lon.toFixed(4)}
          </p>
        </div>
        <div>
          <p className="text-gray-400">Last Update</p>
          <p className="text-white font-medium">{timeString}</p>
        </div>
      </div>
    </Link>
  );
};