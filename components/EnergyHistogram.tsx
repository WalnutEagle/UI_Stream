import React from 'react';

interface EnergyHistogramProps {
  data: number[];
  maxDataPoints?: number;
  height?: number;
}

export const EnergyHistogram: React.FC<EnergyHistogramProps> = ({ 
  data, 
  maxDataPoints = 30,
  height = 120 
}) => {
  // Keep only the latest maxDataPoints
  const displayData = data.slice(-maxDataPoints);
  
  // Calculate max value for scaling
  const maxValue = Math.max(...displayData, 1);
  
  // Calculate bar width based on container width
  const barWidth = 100 / maxDataPoints;
  
  return (
    <div className="w-full">
      <div className="relative" style={{ height: `${height}px` }}>
        <div className="absolute inset-0 flex items-end justify-between">
          {Array.from({ length: maxDataPoints }).map((_, index) => {
            const value = displayData[index] || 0;
            const heightPercent = (value / maxValue) * 100;
            const isRecent = index >= displayData.length - 5;
            
            return (
              <div
                key={index}
                className="flex-1 mx-0.5"
                style={{ height: '100%' }}
              >
                <div
                  className={`w-full transition-all duration-300 ${
                    isRecent ? 'bg-yellow-400' : 'bg-yellow-600'
                  } ${value > maxValue * 0.8 ? 'animate-pulse' : ''}`}
                  style={{ 
                    height: `${heightPercent}%`,
                    marginTop: 'auto'
                  }}
                  title={`${value.toFixed(1)} Wh`}
                />
              </div>
            );
          })}
        </div>
        
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 -ml-8 h-full flex flex-col justify-between text-xs text-gray-400">
          <span>{maxValue.toFixed(0)}</span>
          <span>{(maxValue / 2).toFixed(0)}</span>
          <span>0</span>
        </div>
      </div>
      
      {/* X-axis label */}
      <div className="mt-2 text-center text-xs text-gray-400">
        Time (last {maxDataPoints} readings)
      </div>
    </div>
  );
};