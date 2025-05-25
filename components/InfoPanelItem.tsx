
import React from 'react';

interface InfoPanelItemProps {
  label: string;
  value: string | number | React.ReactNode;
  icon?: React.ReactNode;
  valueClassName?: string;
  unit?: string;
}

export const InfoPanelItem: React.FC<InfoPanelItemProps> = ({ label, value, icon, valueClassName, unit }) => {
  return (
    <div className="flex justify-between items-center py-1.5">
      <div className="flex items-center">
        {icon && <span className="mr-2 opacity-80">{icon}</span>}
        <span className="text-sm text-gray-400">{label}</span>
      </div>
      <div className="flex items-baseline">
        <span className={`text-sm font-medium ${valueClassName || 'text-gray-100'}`}>
          {value}
        </span>
        {unit && <span className="text-xs text-gray-500 ml-1">{unit}</span>}
      </div>
    </div>
  );
};
