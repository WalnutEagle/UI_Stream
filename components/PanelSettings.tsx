import React from 'react';

interface PanelVisibility {
  inferenceMode: boolean;
  system: boolean;
  sensors: boolean;
  energyChart: boolean;
  vehicleControls: boolean;
  gpsLocation: boolean;
  predictedPath: boolean;
}

interface PanelSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  panelVisibility: PanelVisibility;
  onTogglePanel: (panel: keyof PanelVisibility) => void;
}

export const PanelSettings: React.FC<PanelSettingsProps> = ({
  isOpen,
  onClose,
  panelVisibility,
  onTogglePanel
}) => {
  if (!isOpen) return null;

  const panels = [
    { key: 'inferenceMode' as keyof PanelVisibility, label: 'Inference Mode', description: 'Cloud/Local policy display' },
    { key: 'system' as keyof PanelVisibility, label: 'System Info', description: 'Model and GPU information' },
    { key: 'sensors' as keyof PanelVisibility, label: 'Sensors', description: 'Speed, acceleration, yaw rate' },
    { key: 'energyChart' as keyof PanelVisibility, label: 'Energy Chart', description: 'Energy consumption history' },
    { key: 'vehicleControls' as keyof PanelVisibility, label: 'Vehicle Controls', description: 'Steering and throttle display' },
    { key: 'gpsLocation' as keyof PanelVisibility, label: 'GPS Location', description: 'Map with vehicle position' },
    { key: 'predictedPath' as keyof PanelVisibility, label: 'Predicted Path', description: 'Waypoint visualization' }
  ];

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />
      
      {/* Settings Panel */}
      <div className="fixed right-0 top-0 h-full w-96 bg-gray-800 shadow-2xl z-50 overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">Panel Settings</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <p className="text-sm text-gray-400 mb-6">
            Toggle panels to customize your dashboard view
          </p>
          
          <div className="space-y-3">
            {panels.map(panel => (
              <div
                key={panel.key}
                className="bg-gray-700 rounded-lg p-4 hover:bg-gray-650 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-white">{panel.label}</h3>
                    <p className="text-xs text-gray-400 mt-1">{panel.description}</p>
                  </div>
                  <button
                    onClick={() => onTogglePanel(panel.key)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      panelVisibility[panel.key] ? 'bg-blue-600' : 'bg-gray-600'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                        panelVisibility[panel.key] ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-gray-700 rounded-lg">
            <p className="text-xs text-gray-400">
              Note: Some panels may be required for core functionality and cannot be hidden.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};