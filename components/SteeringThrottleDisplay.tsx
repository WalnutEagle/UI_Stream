import React, { useState } from 'react';
import { VehicleControlState } from '../types';
import { SpeedometerGauge } from './SpeedometerGauge';
import { SteeringWheelGauge } from './SteeringWheelGauge';
import { StyledButton } from './StyledButton';
import { EyeIcon } from './EyeIcon';
import { EyeSlashIcon } from './EyeSlashIcon';

interface SteeringThrottleDisplayProps {
  controls: VehicleControlState;
}

export const SteeringThrottleDisplay: React.FC<SteeringThrottleDisplayProps> = ({ controls }) => {
  const [showValues, setShowValues] = useState<boolean>(true);

  const toggleShowValues = () => {
    setShowValues(prev => !prev);
  };

  return (
    <div className="p-1 space-y-3">
      <div className="flex flex-col sm:flex-row justify-around items-center gap-2 sm:gap-0">
        <SpeedometerGauge 
          value={controls.throttle} 
          maxValue={100} 
          label="Throttle" 
          unit="%"
          showValue={showValues}
        />
      
        <SteeringWheelGauge 
          steeringAngle={controls.steeringAngle} 
          maxAngle={45} 
          label="Steering"
          showValue={showValues}
        />
      </div>
    </div>
  );
};