
import React, { useState, useEffect, useRef } from 'react';
import { InferenceMode, Waypoint, VehicleSensorData, VehicleControlState } from './types';
import { DataDisplayCard } from './components/DataDisplayCard';
import { InfoPanelItem } from './components/InfoPanelItem';
import { WaypointList } from './components/WaypointList';
import { WaypointVisualization } from './components/WaypointVisualization';
import { StyledButton } from './components/StyledButton';
import { CurrentTime } from './components/CurrentTime';
import { ImageView } from './components/ImageView';
import { SteeringThrottleDisplay } from './components/SteeringThrottleDisplay';
import { ModelIcon } from './components/ModelIcon';
import { LightningBoltIcon } from './components/LightningBoltIcon';
import { EnergyHistogram } from './components/EnergyHistogram';
import { InferenceModeDisplay } from './components/InferenceModeDisplay';
import { NetworkLatencyDisplay } from './components/NetworkLatencyDisplay';
import { GPSMapDisplay } from './components/GPSMapDisplay';
import { EnhancedGPSMap } from './components/EnhancedGPSMap';
import { GPSTrackingHistory } from './components/GPSTrackingHistory';

// Icons
const QuitIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
  </svg>
);

const SwapCamerasIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-5 h-5"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
  </svg>
);


// API configuration
const API_HOST = import.meta.env.VITE_API_HOST || "run-coops-767192.apps.shift.nerc.mghpcc.org";
const API_URL = `https://${API_HOST}/api/latest_car_data`;
// Polling interval in milliseconds
const POLLING_INTERVAL = 100; // 100 milliseconds for better performance

// Connection configuration
const MAX_RETRY_ATTEMPTS = 10;
const RETRY_DELAY = 5000; // 5 seconds

const PLACEHOLDER_IMAGE_SRC = "data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22800%22%20height%3D%22450%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20800%20450%22%3E%3Crect%20fill%3D%22%234A5568%22%20width%3D%22800%22%20height%3D%22450%22%2F%3E%3Ctext%20fill%3D%22rgba(255%2C255%2C255%2C0.7)%22%20font-family%3D%22sans-serif%22%20font-size%3D%2230%22%20dy%3D%2210.5%22%20font-weight%3D%22bold%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%3ENo%20Signal%3C%2Ftext%3E%3C%2Fsvg%3E";


type ConnectionStatus = "Connecting" | "Connected" | "Disconnected" | "Error";

interface HTTPMessage {
  predicted_waypoints: Array<{ X: number; Y: number }> | null;
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
  image1_base64: string | null;
  unique_id_image1: string | null;
  image2_base64: string | null;
  unique_id_image2: string | null;
  energy_used_wh: number | null;
  timestamp_car_sent_utc: string;
  timestamp_server_received_utc: string | null;
  data_transit_time_to_server_ms: number | null;
}


const App: React.FC = () => {
  // System Information State
  const [modelName] = useState<string>('GeminiDrive PilotNet v3.1');
  const [gpuInfo] = useState<string>('NVIDIA Jetson AGX Orin');
  const [serverCommTime, setServerCommTime] = useState<number>(0);
  const [serverResponseTime] = useState<number>(0); 
  const [predictedWaypoints, setPredictedWaypoints] = useState<Waypoint[]>([]);

  // Sensor Data State
  const [sensorData, setSensorData] = useState<VehicleSensorData>({
    gps: { lat: 0, lon: 0, altitude: 0 },
    velocity: 0,
    acceleration: { x: 0, y: 0, z: 0 },
    yawRate: 0,
  });
  const [energyUsage, setEnergyUsage] = useState<number>(0);
  const [energyHistory, setEnergyHistory] = useState<number[]>([]);
  const [carTimestamp, setCarTimestamp] = useState<string>('');
  const [serverTimestamp, setServerTimestamp] = useState<string>('');
  const [imageIds, setImageIds] = useState<{ image1: string; image2: string }>({ image1: '', image2: '' });
  const [gpsHistory, setGPSHistory] = useState<Array<{ lat: number; lon: number; timestamp: Date }>>([]);

  // UI State
  const [inferenceMode, setInferenceMode] = useState<InferenceMode>(InferenceMode.CLOUD);
  const [image1Src, setImage1Src] = useState<string>(PLACEHOLDER_IMAGE_SRC);
  const [image2Src, setImage2Src] = useState<string>(PLACEHOLDER_IMAGE_SRC);
  const [displayDepthView, setDisplayDepthView] = useState<boolean>(false); // false = RGB (image1), true = Depth (image2)
  
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("Connecting");
  const pollingIntervalId = useRef<number | null>(null);
  const [retryAttempts, setRetryAttempts] = useState<number>(0);

  // Vehicle Control State
  const [vehicleControls, setVehicleControls] = useState<VehicleControlState>({
    steeringAngle: 0,
    throttle: 0,
    brake: 0,
  });

  // Message validation function
  const isValidHTTPMessage = (data: any): data is HTTPMessage => {
    return data &&
      typeof data.sensor_data === 'object' &&
      typeof data.inference_mode === 'string' &&
      typeof data.vehicle_controls === 'object' &&
      typeof data.sensor_data.gps_lat === 'number' &&
      typeof data.sensor_data.gps_lon === 'number';
  };

  const fetchData = async () => {
    try {
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        // Handle CORS
        mode: 'cors',
        credentials: 'same-origin'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Validate message format
      if (!isValidHTTPMessage(data)) {
        console.error("Invalid HTTP message format:", data);
        return;
      }

      // Update connection status to Connected on successful fetch
      setConnectionStatus("Connected");
      setRetryAttempts(0);

      // Process the data same as before
      if (data.predicted_waypoints) {
        setPredictedWaypoints(data.predicted_waypoints.map(wp => [wp.X, wp.Y]));
      } else {
        setPredictedWaypoints([]);
      }

      setSensorData({
        gps: {
          lat: data.sensor_data.gps_lat,
          lon: data.sensor_data.gps_lon,
          altitude: data.sensor_data.altitude,
        },
        velocity: data.sensor_data.velocity,
        acceleration: {
          x: data.sensor_data.accel_x,
          y: data.sensor_data.accel_y,
          z: 0, 
        },
        yawRate: data.sensor_data.yaw_rate,
      });

      // Update GPS history
      setGPSHistory(prev => [...prev, {
        lat: data.sensor_data.gps_lat,
        lon: data.sensor_data.gps_lon,
        timestamp: new Date()
      }].slice(-100)); // Keep last 100 points

      const modeStr = data.inference_mode.toLowerCase();
      if (modeStr === InferenceMode.LOCAL.toLowerCase()) {
        setInferenceMode(InferenceMode.LOCAL);
      } else if (modeStr === InferenceMode.CLOUD.toLowerCase()) {
        setInferenceMode(InferenceMode.CLOUD);
      }

      setVehicleControls({
        steeringAngle: data.vehicle_controls.steering * 45, 
        throttle: data.vehicle_controls.throttle * 100, 
        brake: 0, 
      });

      setImage1Src(data.image1_base64 ? `data:image/jpeg;base64,${data.image1_base64}` : PLACEHOLDER_IMAGE_SRC);
      setImage2Src(data.image2_base64 ? `data:image/jpeg;base64,${data.image2_base64}` : PLACEHOLDER_IMAGE_SRC);

      if (data.energy_used_wh !== null) {
        setEnergyUsage(data.energy_used_wh);
        setEnergyHistory(prev => [...prev, data.energy_used_wh].slice(-50)); // Keep last 50 readings
      }

      if (data.data_transit_time_to_server_ms !== null) {
        setServerCommTime(data.data_transit_time_to_server_ms);
      }

      // Update timestamps
      setCarTimestamp(data.timestamp_car_sent_utc);
      if (data.timestamp_server_received_utc) {
        setServerTimestamp(data.timestamp_server_received_utc);
      }

      // Update image IDs
      if (data.unique_id_image1 || data.unique_id_image2) {
        setImageIds({
          image1: data.unique_id_image1 || '',
          image2: data.unique_id_image2 || ''
        });
      }

    } catch (error) {
      console.error("Failed to fetch data:", error);
      setConnectionStatus("Error");
      
      // Handle retry logic
      if (retryAttempts < MAX_RETRY_ATTEMPTS) {
        setRetryAttempts(prev => prev + 1);
        setConnectionStatus("Disconnected");
        console.log(`Retry attempt ${retryAttempts + 1}/${MAX_RETRY_ATTEMPTS} in ${RETRY_DELAY / 1000} seconds...`);
      } else {
        console.error("Maximum retry attempts reached. Please refresh the page to try again.");
        setConnectionStatus("Error");
      }
    }
  };

  const startPolling = () => {
    // Initial fetch
    setConnectionStatus("Connecting");
    fetchData();
    
    // Set up polling interval
    pollingIntervalId.current = window.setInterval(() => {
      fetchData();
    }, POLLING_INTERVAL);
  };

  const stopPolling = () => {
    if (pollingIntervalId.current) {
      clearInterval(pollingIntervalId.current);
      pollingIntervalId.current = null;
    }
  }; 

  useEffect(() => {
    startPolling();
    return () => {
      stopPolling();
    };
  }, []); // Empty dependency array


  const handleQuit = () => {
    console.log("Attempting to close window...");
    if (window.opener) {
        window.close();
    } else {
        // Try to close, but browsers might block this if not opened by script
        const newWindow = window.open('', '_self'); // Try to re-target self
        newWindow?.close();
        if (!newWindow?.closed) { // Check if it actually closed
             alert("The application attempted to close this tab. If it's still open, please close it manually.");
        }
    }
  };
  
  const getStatusColor = () => {
    switch (connectionStatus) {
      case "Connected": return "text-green-400";
      case "Connecting": return "text-yellow-400";
      case "Disconnected": return "text-red-500";
      case "Error": return "text-red-700 font-bold";
      default: return "text-gray-400";
    }
  };

  const toggleDisplayedFeed = () => {
    setDisplayDepthView(prev => !prev);
  };
  
  const currentFeedSrc = displayDepthView ? image2Src : image1Src;
  const currentFeedAlt = displayDepthView ? "Depth Camera Feed" : "RGB Camera Feed";
  const currentFeedTitle = displayDepthView ? "Depth View" : "RGB View";
  const switchButtonText = displayDepthView ? "Switch to RGB View" : "Switch to Depth View";

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        
        <div className="lg:col-span-1 flex flex-col gap-4 sm:gap-6">
          <DataDisplayCard title="System Status">
            <InfoPanelItem label="Model Name" value={modelName} icon={<ModelIcon />} valueClassName="text-blue-300 font-semibold" />
            <InfoPanelItem label="GPU" value={gpuInfo} valueClassName="text-gray-200" />
            <div className="mt-3">
              <NetworkLatencyDisplay latency={serverCommTime} />
            </div>
            <div className="mt-3 pt-3 border-t border-gray-700">
              <h4 className="text-sm text-gray-400 mb-2">Timestamps</h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Car Sent:</span>
                  <span className="text-gray-300">{carTimestamp ? new Date(carTimestamp).toLocaleTimeString() : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Server Received:</span>
                  <span className="text-gray-300">{serverTimestamp ? new Date(serverTimestamp).toLocaleTimeString() : 'N/A'}</span>
                </div>
              </div>
            </div>
            <div className="pt-3 border-t border-gray-700">
                <h4 className="text-sm text-gray-400 mb-2">Predicted Path</h4>
                <WaypointVisualization 
                  waypoints={predictedWaypoints.map(wp => ({ X: wp[0], Y: wp[1] }))}
                  width={280}
                  height={180}
                />
            </div>
          </DataDisplayCard>

          <DataDisplayCard title="Sensor Data Output">
            <InfoPanelItem label="Velocity" value={sensorData.velocity.toFixed(1)} unit="km/h" valueClassName="text-yellow-400" />
            <InfoPanelItem label="Accel X" value={sensorData.acceleration.x.toFixed(2)} unit="m/s²" />
            <InfoPanelItem label="Accel Y" value={sensorData.acceleration.y.toFixed(2)} unit="m/s²" />
            <InfoPanelItem label="Yaw Rate" value={sensorData.yawRate.toFixed(1)} unit="°/s" />
          </DataDisplayCard>

          <DataDisplayCard title="GPS Location">
            <EnhancedGPSMap 
              latitude={sensorData.gps.lat}
              longitude={sensorData.gps.lon}
              altitude={sensorData.gps.altitude}
            />
          </DataDisplayCard>
        </div>

        <div className="lg:col-span-1 flex flex-col gap-4 sm:gap-6">
          <DataDisplayCard title="Vehicle Metrics" className="flex-grow flex flex-col">
            <div className="space-y-3">
              <InfoPanelItem
                label="Total Energy Used"
                value={energyUsage.toFixed(1)}
                unit="Wh"
                icon={<LightningBoltIcon className="w-5 h-5 text-yellow-400" />}
                valueClassName="text-yellow-300"
              />
              <div className="pt-3 border-t border-gray-700">
                <h4 className="text-sm text-gray-400 mb-2">Energy Consumption History</h4>
                <EnergyHistogram data={energyHistory} />
              </div>
            </div>
          </DataDisplayCard>
          
          <StyledButton 
            onClick={handleQuit} 
            variant="danger"
            icon={<QuitIcon />}
          >
            Quit Simulation
          </StyledButton>
        </div>

        <div className="lg:col-span-1 flex flex-col gap-4 sm:gap-6">
          <DataDisplayCard title="Operational Overview" className="flex-none">
            <InferenceModeDisplay mode={inferenceMode} className="mb-3" />
            <InfoPanelItem
              label="Connection Status"
              value={connectionStatus}
              valueClassName={getStatusColor()}
            />
            {connectionStatus === "Disconnected" && retryAttempts < MAX_RETRY_ATTEMPTS && (
              <StyledButton
                onClick={() => {
                  setRetryAttempts(0);
                  setConnectionStatus("Connecting");
                  fetchData();
                }}
                variant="secondary"
                className="w-full mt-2"
              >
                Retry Connection
              </StyledButton>
            )}
            <div className="flex justify-between items-center mt-3">
                <span className="text-sm text-gray-400">Current Time</span>
                <CurrentTime className="text-gray-100" />
            </div>
          </DataDisplayCard>

          <DataDisplayCard title="Main Camera Feed" className="flex-grow flex flex-col">
            <ImageView 
                src={currentFeedSrc} 
                alt={currentFeedAlt} 
                className="min-h-[200px] flex-shrink-0 mb-3" 
            />
            <div className="text-xs text-gray-500 mb-2">
              ID: {displayDepthView ? imageIds.image2.substring(0, 8) : imageIds.image1.substring(0, 8)}...
            </div>
            <StyledButton
                onClick={toggleDisplayedFeed}
                variant="secondary"
                className="w-full mt-auto" 
                icon={<SwapCamerasIcon className="w-4 h-4"/>}
            >
                {switchButtonText}
            </StyledButton>
          </DataDisplayCard>

          <DataDisplayCard title="Vehicle Control Inputs">
            <SteeringThrottleDisplay controls={vehicleControls} />
          </DataDisplayCard>

          <DataDisplayCard title="GPS Tracking">
            <GPSTrackingHistory history={gpsHistory} />
          </DataDisplayCard>
        </div>

      </div>
    </div>
  );
};

export default App;