import React, { useEffect, useState, useRef } from 'react';
import { VehicleCard } from './components/VehicleCard';

interface VehicleData {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'maintenance';
  lastUpdate: Date;
  location: { lat: number; lon: number };
  speed: number;
  thumbnailUrl?: string;
  inferenceMode?: string;
  serverCommTime?: number;
}

interface APIResponse {
  unique_id_image1: string;
  unique_id_image2: string;
  data_transit_time_to_server_ms: number;
  sensor_data: {
    gps_lat: number;
    gps_lon: number;
    altitude: number;
    velocity: number;
    accel_x: number;
    accel_y: number;
    yaw_rate: number;
  };
  inference_mode: string;
  vehicle_controls: {
    steering: number;
    throttle: number;
  };
  predicted_waypoints?: Array<{ X: number; Y: number }>;
  energy_used_wh?: number;
  image1_base64?: string;
  image2_base64?: string;
  timestamp_car_sent_utc: string;
  timestamp_server_received_utc: string;
}

const Dashboard: React.FC = () => {
  const [vehicles, setVehicles] = useState<VehicleData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pollingInterval = useRef<number | null>(null);

  const API_HOST = import.meta.env.VITE_API_HOST || "run-coops-767192.apps.shift.nerc.mghpcc.org";
  const API_URL = `https://${API_HOST}/api/latest_car_data`;

  const fetchVehicleData = async () => {
    try {
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        credentials: 'same-origin'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: APIResponse = await response.json();
      
      // Transform API data to VehicleData format
      const vehicle: VehicleData = {
        id: data.unique_id_image1.substring(0, 8).toUpperCase(), // Use first 8 chars of unique ID
        name: `Vehicle ${data.unique_id_image1.substring(0, 8).toUpperCase()}`,
        status: 'online', // If we're getting data, it's online
        lastUpdate: new Date(data.timestamp_server_received_utc),
        location: { 
          lat: data.sensor_data.gps_lat, 
          lon: data.sensor_data.gps_lon 
        },
        speed: data.sensor_data.velocity,
        thumbnailUrl: '/av2.png',
        inferenceMode: data.inference_mode,
        serverCommTime: data.data_transit_time_to_server_ms
      };

      setVehicles([vehicle]);
      setError(null);
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to fetch vehicle data:', err);
      setError('Failed to connect to vehicle');
      // If error, show as offline
      setVehicles(prev => prev.map(v => ({ ...v, status: 'offline' as const })));
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchVehicleData();

    // Poll every 2 seconds
    pollingInterval.current = window.setInterval(fetchVehicleData, 2000);

    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, []);

  const onlineCount = vehicles.filter(v => v.status === 'online').length;
  const totalCount = vehicles.length;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="bg-gray-850 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-gray-400 text-sm">Total Vehicles</p>
              <p className="text-2xl font-bold text-white">{totalCount}</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-gray-400 text-sm">Online</p>
              <p className="text-2xl font-bold text-green-400">{onlineCount}</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-gray-400 text-sm">Offline</p>
              <p className="text-2xl font-bold text-red-400">{totalCount - onlineCount}</p>
            </div>
            {/* <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-gray-400 text-sm">Inference Mode</p>
              <p className="text-2xl font-bold text-blue-400">
                {vehicles.length > 0 && vehicles[0].inferenceMode 
                  ? vehicles[0].inferenceMode.charAt(0).toUpperCase() + vehicles[0].inferenceMode.slice(1)
                  : 'N/A'}
              </p>
            </div> */}
          </div>
        </div>
      </div>

      {/* Vehicle Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold">Connected Vehicles</h2>
          <p className="text-gray-400 text-sm mt-1">Click on a vehicle to view detailed telemetry</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-900/20 border border-red-600 rounded-lg text-red-400">
            <p className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </p>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-400">
              <svg className="animate-spin h-8 w-8 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading vehicles...
            </div>
          </div>
        ) : vehicles.length === 0 && !error ? (
          <div className="text-center py-12 bg-gray-800 rounded-lg">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-400">No vehicles connected</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map(vehicle => (
              <VehicleCard key={vehicle.id} {...vehicle} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;