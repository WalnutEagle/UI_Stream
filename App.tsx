import React, { useState, useEffect, useRef } from 'react';
import { InferenceMode, Waypoint, VehicleSensorData, VehicleControlState } from './types';
import { DataDisplayCard } from './components/DataDisplayCard';
import { InfoPanelItem } from './components/InfoPanelItem';
import { WaypointVisualization } from './components/WaypointVisualization';
import { StyledButton } from './components/StyledButton';
import { CurrentTime } from './components/CurrentTime';
import { ImageViewEnhanced } from './components/ImageViewEnhanced';
import { SteeringThrottleDisplay } from './components/SteeringThrottleDisplay';
import { ModelIcon } from './components/ModelIcon';
import { LightningBoltIcon } from './components/LightningBoltIcon';
import { EnergyHistogram } from './components/EnergyHistogram';
import { EnergyLineChart } from './components/EnergyLineChart';
import { PanelSettings } from './components/PanelSettings';
import { InferenceModeDisplay } from './components/InferenceModeDisplay';
import { NetworkLatencyDisplay } from './components/NetworkLatencyDisplay';
import { GoogleMapDisplay } from './components/GoogleMapDisplay';
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

const SettingsIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-5 h-5"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

// API configuration
const API_HOST = import.meta.env.VITE_API_HOST || "run-coops-767192.apps.shift.nerc.mghpcc.org";
const API_URL = `https://${API_HOST}/api/latest_car_data`;
const POLLING_INTERVAL = 50; // 50 milliseconds
const MAX_RETRY_ATTEMPTS = 10;
const RETRY_DELAY = 5000;

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
  // Initialize with some default waypoints
  const [predictedWaypoints, setPredictedWaypoints] = useState<Waypoint[]>(() => {
    const initialWaypoints: Waypoint[] = [];
    for (let i = 1; i <= 10; i++) {
      initialWaypoints.push([i * 2.5, 0]); // Straight line forward
    }
    return initialWaypoints;
  });
  
  // Track API waypoints separately
  const [apiWaypoints, setApiWaypoints] = useState<Waypoint[]>([]);

  // Sensor Data State
  const [sensorData, setSensorData] = useState<VehicleSensorData>({
    gps: { lat: 0, lon: 0, altitude: 0 },
    velocity: 0,
    acceleration: { x: 0, y: 0, z: 0 },
    yawRate: 0,
  });
  const [energyUsage, setEnergyUsage] = useState<number>(0);
  const [energyHistory, setEnergyHistory] = useState<Array<{ value: number; mode: InferenceMode; timestamp: Date }>>([]);
  const [carTimestamp, setCarTimestamp] = useState<string>('');
  const [serverTimestamp, setServerTimestamp] = useState<string>('');
  const [imageIds, setImageIds] = useState<{ image1: string; image2: string }>({ image1: '', image2: '' });
  const [gpsHistory, setGPSHistory] = useState<Array<{ lat: number; lon: number; timestamp: Date }>>([]);

  // UI State
  const [inferenceMode, setInferenceMode] = useState<InferenceMode>(InferenceMode.CLOUD);
  const [image1Src, setImage1Src] = useState<string>(PLACEHOLDER_IMAGE_SRC);
  const [image2Src, setImage2Src] = useState<string>(PLACEHOLDER_IMAGE_SRC);
  const [displayDepthView, setDisplayDepthView] = useState<boolean>(false);
  const [imageFreezeDetected, setImageFreezeDetected] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  // Load panel visibility from localStorage or use defaults
  const loadPanelVisibility = () => {
    const saved = localStorage.getItem('panelVisibility');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved panel visibility:', e);
      }
    }
    return {
      inferenceMode: true,
      system: true,
      sensors: true,
      energyChart: true,
      vehicleControls: true,
      gpsLocation: true,
      predictedPath: true
    };
  };

  const [panelVisibility, setPanelVisibility] = useState(loadPanelVisibility());
  
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
        mode: 'cors',
        credentials: 'same-origin'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!isValidHTTPMessage(data)) {
        console.error("Invalid HTTP message format:", data);
        return;
      }

      setConnectionStatus("Connected");
      setRetryAttempts(0);
      setImageFreezeDetected(false);

      // Save API waypoints if available
      if (data.predicted_waypoints && data.predicted_waypoints.length > 0) {
        setApiWaypoints(data.predicted_waypoints.map(wp => [wp.X, wp.Y]));
      } else {
        setApiWaypoints([]);
      }

      // Always generate calculated waypoints based on current vehicle state
      const dummyWaypoints: Waypoint[] = [];
      const steering = data.vehicle_controls?.steering || 0;
      const speed = data.sensor_data?.velocity || 20; // km/h
      
      for (let i = 1; i <= 10; i++) {
        let x = i * 2.5; // 2.5 meters forward per waypoint (25m total)
        let y = 0;
        
        // Add curvature based on steering
        if (Math.abs(steering) > 0.05) {
          // Create a curved path
          const radius = 20 / Math.max(Math.abs(steering), 0.1); // Turning radius
          const angle = (i * 2.5) / radius; // Arc length to angle
          x = radius * Math.sin(angle);
          y = radius * (1 - Math.cos(angle)) * Math.sign(steering);
        }
        
        // Add small random variation for realism
        x += (Math.random() - 0.5) * 0.2;
        y += (Math.random() - 0.5) * 0.2;
        
        dummyWaypoints.push([x, y]);
      }
      
      setPredictedWaypoints(dummyWaypoints);

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

      setGPSHistory(prev => [...prev, {
        lat: data.sensor_data.gps_lat,
        lon: data.sensor_data.gps_lon,
        timestamp: new Date()
      }].slice(-100));

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
        setEnergyHistory(prev => [...prev, {
          value: data.energy_used_wh,
          mode: inferenceMode,
          timestamp: new Date()
        }].slice(-100));
      }

      if (data.data_transit_time_to_server_ms !== null) {
        setServerCommTime(data.data_transit_time_to_server_ms);
      }

      setCarTimestamp(data.timestamp_car_sent_utc);
      if (data.timestamp_server_received_utc) {
        setServerTimestamp(data.timestamp_server_received_utc);
      }

      if (data.unique_id_image1 || data.unique_id_image2) {
        setImageIds({
          image1: data.unique_id_image1 || '',
          image2: data.unique_id_image2 || ''
        });
      }

    } catch (error) {
      console.error("Failed to fetch data:", error);
      setConnectionStatus("Error");
      
      if (retryAttempts < MAX_RETRY_ATTEMPTS) {
        setRetryAttempts(prev => prev + 1);
        setConnectionStatus("Disconnected");
      }
    }
  };

  const startPolling = () => {
    setConnectionStatus("Connecting");
    fetchData();
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
  }, []);

  // Save panel visibility to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('panelVisibility', JSON.stringify(panelVisibility));
  }, [panelVisibility]);

  const handleQuit = () => {
    const newWindow = window.open('', '_self');
    newWindow?.close();
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

  const togglePanel = (panel: keyof typeof panelVisibility) => {
    setPanelVisibility(prev => ({
      ...prev,
      [panel]: !prev[panel]
    }));
  };
  
  const currentFeedSrc = displayDepthView ? image2Src : image1Src;
  const currentFeedAlt = displayDepthView ? "Depth Camera Feed" : "RGB Camera Feed";
  const switchButtonText = displayDepthView ? "Switch to RGB" : "Switch to Depth";

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-3">
      <div className="max-w-screen-2xl mx-auto">
        {/* Header Bar */}
        <div className="flex items-center justify-between mb-3 px-2">
          <h1 className="text-xl font-bold text-gray-100">Vehicle Telemetry Dashboard</h1>
          <div className="flex items-center gap-6">
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <LightningBoltIcon className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-semibold text-yellow-300">{energyUsage.toFixed(1)} Wh</span>
              </div>
              <CurrentTime className="text-gray-400 text-sm" />
              <span className={`text-sm ${getStatusColor()}`}>{connectionStatus}</span>
              <button
                onClick={() => setShowSettings(true)}
                className="text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-gray-700"
                title="Settings"
              >
                <SettingsIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-12 gap-3">
          {/* Left Sidebar - 2 columns - extends full height */}
          <div className="col-span-12 lg:col-span-2">
            <div className="space-y-3">
              {panelVisibility.inferenceMode && <InferenceModeDisplay mode={inferenceMode} />}
              {panelVisibility.system && (
                <DataDisplayCard title="System" className="text-xs">
                  <InfoPanelItem label="Model" value={modelName} valueClassName="text-blue-300 text-xs" />
                  <InfoPanelItem label="GPU" value={gpuInfo} valueClassName="text-xs" />
                  <NetworkLatencyDisplay latency={serverCommTime} className="mt-2" />
                </DataDisplayCard>
              )}
              {panelVisibility.sensors && (
                <DataDisplayCard title="Sensors" className="text-xs">
                  <InfoPanelItem label="Speed" value={sensorData.velocity.toFixed(1)} unit="km/h" valueClassName="text-yellow-400 text-sm font-bold" />
                  <InfoPanelItem label="Accel X/Y" value={`${sensorData.acceleration.x.toFixed(1)}/${sensorData.acceleration.y.toFixed(1)}`} unit="m/s²" valueClassName="text-xs" />
                  <InfoPanelItem label="Yaw Rate" value={sensorData.yawRate.toFixed(1)} unit="°/s" valueClassName="text-xs" />
                </DataDisplayCard>
              )}
            </div>
          </div>

          {/* Main Camera View - 6 columns */}
          <div className="col-span-12 lg:col-span-6 space-y-3">
             {/* Energy Chart above camera */}
            {panelVisibility.energyChart && (
              <DataDisplayCard title="Energy Consumption Over Time" className="p-3">
                <EnergyLineChart data={energyHistory} height={180} />
              </DataDisplayCard>
            )}
            {/* <DataDisplayCard title="Main Camera Feed - 480p HD" className="h-full"> */}
              <DataDisplayCard title="Main Camera Feed - 480p HD">
              <div className="relative" style={{ minHeight: '480px' }}>
                <ImageViewEnhanced 
                  src={currentFeedSrc} 
                  alt={currentFeedAlt}
                  imageId={displayDepthView ? imageIds.image2 : imageIds.image1}
                  className="h-full"
                  onFreezeDetected={() => setImageFreezeDetected(true)}
                />
              </div>
              <div className="flex gap-2 mt-3">
                <StyledButton
                  onClick={toggleDisplayedFeed}
                  variant="secondary"
                  className="flex-1"
                  icon={<SwapCamerasIcon className="w-4 h-4"/>}
                >
                  {switchButtonText}
                </StyledButton>
                {imageFreezeDetected && (
                  <StyledButton
                    onClick={() => {
                      setImageFreezeDetected(false);
                      fetchData();
                    }}
                    variant="danger"
                    className="flex-1"
                  >
                    Refresh Feed
                  </StyledButton>
                )}
              </div>
            </DataDisplayCard>
          </div>

          {/* Right Side - 4 columns */}
          <div className="col-span-12 lg:col-span-4 space-y-3">
            {/* Energy Consumption Over Time - full width of right column */}
            {panelVisibility.vehicleControls && (
              <DataDisplayCard title="Vehicle Controls">
                <SteeringThrottleDisplay controls={vehicleControls} />
              </DataDisplayCard>
            )}
            
            <div className="grid grid-cols-2 gap-3">
              
              {panelVisibility.gpsLocation && (
                <DataDisplayCard title="GPS Location" className="col-span-2">
                  <GoogleMapDisplay 
                    latitude={sensorData.gps.lat}
                    longitude={sensorData.gps.lon}
                    altitude={sensorData.gps.altitude}
                  />
                </DataDisplayCard>
              )}
            </div>

            {panelVisibility.predictedPath && (
              <DataDisplayCard title="Predicted Path">
                <WaypointVisualization 
                  waypoints={apiWaypoints.map(wp => ({ X: wp[0], Y: wp[1] }))}
                  calculatedWaypoints={predictedWaypoints.map(wp => ({ X: wp[0], Y: wp[1] }))}
                  width={320}
                  height={160}
                />
              </DataDisplayCard>
            )}

           

            {/* <StyledButton 
              onClick={handleQuit} 
              variant="danger"
              icon={<QuitIcon />}
              className="w-full"
            >
              Quit Simulation
            </StyledButton> */}
          </div>
        </div>
      </div>
      
      {/* Panel Settings Modal */}
      <PanelSettings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        panelVisibility={panelVisibility}
        onTogglePanel={togglePanel}
      />
    </div>
  );
};

export default App;