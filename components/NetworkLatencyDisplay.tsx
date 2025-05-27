import React from 'react';

interface NetworkLatencyDisplayProps {
  latency: number;
  className?: string;
}

export const NetworkLatencyDisplay: React.FC<NetworkLatencyDisplayProps> = ({ latency, className = "" }) => {
  // Determine latency quality
  const getLatencyStatus = () => {
    if (latency < 50) return { color: 'text-green-400', bg: 'bg-green-900/20', status: 'Excellent' };
    if (latency < 200) return { color: 'text-yellow-400', bg: 'bg-yellow-900/20', status: 'Good' };
    if (latency < 300) return { color: 'text-orange-400', bg: 'bg-orange-900/20', status: 'Fair' };
    return { color: 'text-red-400', bg: 'bg-red-900/20', status: 'Poor' };
  };

  const { color, bg, status } = getLatencyStatus();
  const barWidth = Math.min((latency / 300) * 100, 100); // Cap at 300ms for visualization

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-gray-400">Network Latency</span>
        <span className={`text-xs font-medium ${color}`}>{status}</span>
      </div>
      
      <div className="relative h-6 bg-gray-800 rounded-full overflow-hidden">
        <div 
          className={`absolute inset-y-0 left-0 ${bg} transition-all duration-300`}
          style={{ width: `${barWidth}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-sm font-semibold ${color}`}>
            {latency.toFixed(0)} ms
          </span>
        </div>
      </div>
      
      {/* Latency scale indicators */}
      <div className="flex justify-between mt-1 text-xs text-gray-500">
        <span>0</span>
        <span>100</span>
        <span>200</span>
        <span>300+</span>
      </div>
    </div>
  );
};