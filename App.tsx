
import React, { useState, useEffect, useCallback } from 'react';
import { InferenceMode, Waypoint, VehicleSensorData, VehicleControlState } from './types';
import { DataDisplayCard } from './components/DataDisplayCard';
import { InfoPanelItem } from './components/InfoPanelItem';
import { WaypointList } from './components/WaypointList';
import { StyledButton } from './components/StyledButton';
import { CurrentTime } from './components/CurrentTime';
import { ImageView } from './components/ImageView';
import { SteeringThrottleDisplay } from './components/SteeringThrottleDisplay';
import { ModelIcon } from './components/ModelIcon';
// EyeIcon and EyeSlashIcon are used within SteeringThrottleDisplay, not directly here.
// Importing them ensures they are part of the dependency graph if needed.
// import { EyeIcon } from './components/EyeIcon'; 
// import { EyeSlashIcon } from './components/EyeSlashIcon';


// Icons for buttons (simple SVGs)
const SwitchCameraIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
  </svg>
);

const QuitIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
  </svg>
);


const App: React.FC = () => {
  // System Information State
  const [modelName, setModelName] = useState<string>('GeminiDrive PilotNet v3.1');
  const [gpuInfo, setGpuInfo] = useState<string>('NVIDIA Jetson AGX Orin');
  const [serverCommTime, setServerCommTime] = useState<number>(28); // ms
  const [serverResponseTime, setServerResponseTime] = useState<number>(120); // ms
  const [predictedWaypoints, setPredictedWaypoints] = useState<Waypoint[]>([]);

  // Sensor Data State
  const [sensorData, setSensorData] = useState<VehicleSensorData>({
    gps: { lat: 34.0522, lon: -118.2437, altitude: 70 },
    velocity: 0,
    acceleration: { x: 0, y: 0, z: 0 },
    yawRate: 0,
  });

  // UI State
  const [inferenceMode, setInferenceMode] = useState<InferenceMode>(InferenceMode.CLOUD);
  const [activeCameraView, setActiveCameraView] = useState<'front_rgb' | 'front_depth'>('front_rgb');


  // Vehicle Control State
  const [vehicleControls, setVehicleControls] = useState<VehicleControlState>({
    steeringAngle: 0,
    throttle: 0,
    brake: 0, // Brake is still in state, but not displayed in SteeringThrottleDisplay
  });
  
  const generateRandomWaypoints = useCallback(() => {
    const numWaypoints = Math.floor(Math.random() * 5) + 3; // 3 to 7 waypoints
    const newWaypoints: Waypoint[] = [];
    for (let i = 0; i < numWaypoints; i++) {
      newWaypoints.push({
        id: `wp-${Date.now()}-${i}`,
        x: parseFloat((sensorData.gps.lon + (Math.random() - 0.5) * 0.001).toFixed(5)),
        y: parseFloat((sensorData.gps.lat + (Math.random() - 0.5) * 0.001).toFixed(5)),
        z: parseFloat((sensorData.gps.altitude + (Math.random() - 0.5) * 5).toFixed(1)),
      });
    }
    setPredictedWaypoints(newWaypoints);
  }, [sensorData.gps.lat, sensorData.gps.lon, sensorData.gps.altitude]);


  // Simulate data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setServerCommTime(Math.floor(Math.random() * (45 - 15 + 1)) + 15);
      setServerResponseTime(Math.floor(Math.random() * (250 - 80 + 1)) + 80);

      setSensorData(prev => ({
        ...prev,
        gps: {
          lat: parseFloat((prev.gps.lat + (Math.random() - 0.5) * 0.0001).toFixed(6)),
          lon: parseFloat((prev.gps.lon + (Math.random() - 0.5) * 0.0001).toFixed(6)),
          altitude: parseFloat((prev.gps.altitude + (Math.random() - 0.5) * 0.5).toFixed(1)),
        },
        velocity: Math.max(0, Math.min(120, prev.velocity + (Math.random() - 0.45) * 5)),
        acceleration: {
          x: parseFloat(((Math.random() - 0.5) * 2).toFixed(2)),
          y: parseFloat(((Math.random() - 0.5) * 2).toFixed(2)),
          z: parseFloat(((Math.random() - 0.5) * 0.5).toFixed(2)),
        },
        yawRate: parseFloat(((Math.random() - 0.5) * 10).toFixed(1)),
      }));

      setVehicleControls({
        steeringAngle: parseFloat(((Math.random() - 0.5) * 90).toFixed(1)), // Range -45 to 45
        throttle: Math.max(0, Math.min(100, Math.floor(Math.random() * 110 -5))), // Range 0 to 100 after clamping
        brake: Math.random() > 0.8 ? Math.floor(Math.random() * 60) : 0,
      });

    }, 2000); // Update every 2 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    generateRandomWaypoints();
    const waypointInterval = setInterval(generateRandomWaypoints, 5000); // New waypoints every 5s
    return () => clearInterval(waypointInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generateRandomWaypoints]); // generateRandomWaypoints is memoized

  const toggleInferenceMode = () => {
    setInferenceMode(prev => prev === InferenceMode.CLOUD ? InferenceMode.LOCAL : InferenceMode.CLOUD);
  };
  
  const toggleCameraView = () => {
    setActiveCameraView(prev => prev === 'front_rgb' ? 'front_depth' : 'front_rgb');
  };

  const handleQuit = () => {
    console.log("Attempting to close window...");
    window.close();
  };

  // Image sources
  const frontRgbImageSrc = "https://picsum.photos/seed/mainfeed/800/450";
  const frontDepthImageSrc = "https://picsum.photos/seed/depthfeed/800/450?grayscale&blur=1"; 
  const auxImageSrc = "https://picsum.photos/seed/auxfeed/400/300"; 

  const currentFrontImageSrc = activeCameraView === 'front_rgb' ? frontRgbImageSrc : frontDepthImageSrc;
  const frontImageViewTitle = activeCameraView === 'front_rgb' ? "Front RGB Camera View" : "Front Depth Camera View";


  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        
        {/* Column 1: System Info & Sensors */}
        <div className="lg:col-span-1 flex flex-col gap-4 sm:gap-6">
          <DataDisplayCard title="System Status">
            <InfoPanelItem label="Model Name" value={modelName} icon={<ModelIcon />} valueClassName="text-blue-300 font-semibold" />
            <InfoPanelItem label="GPU" value={gpuInfo} valueClassName="text-gray-200" />
            <InfoPanelItem label="Server Comm Time" value={serverCommTime} unit="ms" valueClassName="text-green-400" />
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

        {/* Column 2: Camera Control & Aux View */}
        <div className="lg:col-span-1 flex flex-col gap-4 sm:gap-6">
          <StyledButton 
            onClick={toggleCameraView}
            variant="secondary"
            icon={<SwitchCameraIcon />}
          >
            {activeCameraView === 'front_rgb' ? 'Switch to Depth View' : 'Switch to RGB View'}
          </StyledButton>
          
          <DataDisplayCard title="Real World Car Implementation" className="flex-grow">
            <ImageView src={auxImageSrc} alt="Auxiliary camera feed" className="min-h-[200px]"/>
          </DataDisplayCard>
          
          <StyledButton 
            onClick={handleQuit} 
            variant="danger"
            icon={<QuitIcon />}
          >
            Quit Simulation
          </StyledButton>
        </div>

        {/* Column 3: Main View & Controls */}
        <div className="lg:col-span-1 flex flex-col gap-4 sm:gap-6">
          <DataDisplayCard title="Operational Overview" className="flex-none">
            <div className="flex justify-between items-center">
                <InfoPanelItem 
                    label="Inference Mode" 
                    value={inferenceMode} 
                    valueClassName={inferenceMode === InferenceMode.CLOUD ? "text-purple-400" : "text-teal-400"}
                />
                <StyledButton onClick={toggleInferenceMode} variant="ghost" className="py-1 px-2 text-xs">
                    Toggle
                </StyledButton>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Current Time</span>
                <CurrentTime className="text-gray-100" />
            </div>
          </DataDisplayCard>

          <DataDisplayCard title={frontImageViewTitle} className="flex-grow">
            <ImageView src={currentFrontImageSrc} alt={frontImageViewTitle} className="min-h-[250px]" />
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
