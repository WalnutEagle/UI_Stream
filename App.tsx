
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { InferenceMode, Waypoint, VehicleSensorData, VehicleControlState } from './types';
import { DataDisplayCard } from './components/DataDisplayCard';
import { InfoPanelItem } from './components/InfoPanelItem';
import { WaypointList } from './components/WaypointList';
import { StyledButton } from './components/StyledButton';
import { CurrentTime } from './components/CurrentTime';
import { ImageView } from './components/ImageView';
import { SteeringThrottleDisplay } from './components/SteeringThrottleDisplay';
import { ModelIcon } from './components/ModelIcon';
import { LightningBoltIcon } from './components/LightningBoltIcon';

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


const WS_URL = "wss://run-coops-767192.apps.shift.nerc.mghpcc.org/api/ui_updates";
const RECONNECT_DELAY = 5000; // 5 seconds
const PLACEHOLDER_IMAGE_SRC = "data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22800%22%20height%3D%22450%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20800%20450%22%3E%3Crect%20fill%3D%22%234A5568%22%20width%3D%22800%22%20height%3D%22450%22%2F%3E%3Ctext%20fill%3D%22rgba(255%2C255%2C255%2C0.7)%22%20font-family%3D%22sans-serif%22%20font-size%3D%2230%22%20dy%3D%2210.5%22%20font-weight%3D%22bold%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%3ENo%20Signal%3C%2Ftext%3E%3C%2Fsvg%3E";


type WebSocketStatus = "Connecting" | "Connected" | "Disconnected" | "Error";

interface WebSocketMessage {
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

  // UI State
  const [inferenceMode, setInferenceMode] = useState<InferenceMode>(InferenceMode.CLOUD);
  const [image1Src, setImage1Src] = useState<string>(PLACEHOLDER_IMAGE_SRC);
  const [image2Src, setImage2Src] = useState<string>(PLACEHOLDER_IMAGE_SRC);
  const [displayDepthView, setDisplayDepthView] = useState<boolean>(false); // false = RGB (image1), true = Depth (image2)
  
  const [webSocketStatus, setWebSocketStatus] = useState<WebSocketStatus>("Connecting");
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeoutId = useRef<number | null>(null);

  // Vehicle Control State
  const [vehicleControls, setVehicleControls] = useState<VehicleControlState>({
    steeringAngle: 0,
    throttle: 0,
    brake: 0,
  });

  const connectWebSocket = useCallback(() => {
    if (reconnectTimeoutId.current) {
      clearTimeout(reconnectTimeoutId.current);
      reconnectTimeoutId.current = null;
    }

    if (ws.current && ws.current.readyState !== WebSocket.CLOSED) {
        console.log("WebSocket already open or connecting.");
        return;
    }
    
    setWebSocketStatus("Connecting");
    console.log("Attempting to connect WebSocket...");
    ws.current = new WebSocket(WS_URL);

    ws.current.onopen = () => {
      console.log("WebSocket Connected");
      setWebSocketStatus("Connected");
    };

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data as string) as WebSocketMessage;

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
        }

        if (data.data_transit_time_to_server_ms !== null) {
          setServerCommTime(data.data_transit_time_to_server_ms);
        }

      } catch (error) {
        console.error("Failed to parse WebSocket message or update state:", error);
      }
    };

    ws.current.onerror = (error) => {
      console.error("WebSocket Error:", error);
      setWebSocketStatus("Error");
    };

    ws.current.onclose = () => {
      console.log("WebSocket Disconnected");
      if (webSocketStatus !== "Error") setWebSocketStatus("Disconnected"); 
      
      if (reconnectTimeoutId.current) {
        clearTimeout(reconnectTimeoutId.current);
      }
      console.log(`Attempting to reconnect in ${RECONNECT_DELAY / 1000} seconds...`);
      reconnectTimeoutId.current = window.setTimeout(connectWebSocket, RECONNECT_DELAY);
    };
  }, [webSocketStatus]); 

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (reconnectTimeoutId.current) {
        clearTimeout(reconnectTimeoutId.current);
      }
      if (ws.current) {
        console.log("Closing WebSocket connection on component unmount.");
        ws.current.onclose = null; 
        ws.current.close();
      }
    };
  }, [connectWebSocket]);


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
    switch (webSocketStatus) {
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
            <InfoPanelItem label="Server Comm Time" value={serverCommTime.toFixed(0)} unit="ms" valueClassName="text-green-400" />
            <InfoPanelItem label="Server Response Time" value={serverResponseTime} unit="ms" valueClassName="text-green-400" />
            <div className="pt-2">
                <h4 className="text-sm text-gray-400 mb-1">Predicted Waypoints</h4>
                <WaypointList waypoints={predictedWaypoints} />
            </div>
          </DataDisplayCard>

          <DataDisplayCard title="Sensor Data Output">
            <InfoPanelItem label="GPS Lat" value={sensorData.gps.lat.toFixed(5)} unit="°" />
            <InfoPanelItem label="GPS Lon" value={sensorData.gps.lon.toFixed(5)} unit="°" />
            <InfoPanelItem label="Altitude" value={sensorData.gps.altitude.toFixed(1)} unit="m" />
            <InfoPanelItem label="Velocity" value={sensorData.velocity.toFixed(1)} unit="km/h" valueClassName="text-yellow-400" />
            <InfoPanelItem label="Accel X" value={sensorData.acceleration.x.toFixed(2)} unit="m/s²" />
            <InfoPanelItem label="Accel Y" value={sensorData.acceleration.y.toFixed(2)} unit="m/s²" />
            <InfoPanelItem label="Yaw Rate" value={sensorData.yawRate.toFixed(1)} unit="°/s" />
          </DataDisplayCard>
        </div>

        <div className="lg:col-span-1 flex flex-col gap-4 sm:gap-6">
          <DataDisplayCard title="Real World Car Implementation" className="flex-grow flex flex-col">
            {/* ImageView removed from here */}
            <div className="mt-auto pt-3 border-t border-gray-700"> 
              <InfoPanelItem
                label="Energy Usage"
                value={energyUsage.toFixed(1)}
                unit="Wh"
                icon={<LightningBoltIcon className="w-5 h-5 text-yellow-400" />}
                valueClassName="text-yellow-300"
              />
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
            <InfoPanelItem 
                label="Inference Mode" 
                value={inferenceMode} 
                valueClassName={inferenceMode === InferenceMode.CLOUD ? "text-purple-400" : "text-teal-400"}
            />
            <InfoPanelItem
              label="Connection Status"
              value={webSocketStatus}
              valueClassName={getStatusColor()}
            />
            <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Current Time</span>
                <CurrentTime className="text-gray-100" />
            </div>
          </DataDisplayCard>

          <DataDisplayCard title="Main Camera Feed" className="flex-grow flex flex-col">
            <ImageView 
                src={currentFeedSrc} 
                alt={currentFeedAlt} 
                // title={currentFeedTitle}
                className="min-h-[200px] flex-shrink-0 mb-3" 
            />
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
        </div>

      </div>
    </div>
  );
};

export default App;
