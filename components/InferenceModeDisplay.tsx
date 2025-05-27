import React from 'react';
import { InferenceMode } from '../types';

interface InferenceModeDisplayProps {
  mode: InferenceMode;
  className?: string;
}

const CloudIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
  </svg>
);

const ChipIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25zm.75-12h9v9h-9v-9z" />
  </svg>
);

export const InferenceModeDisplay: React.FC<InferenceModeDisplayProps> = ({ mode, className = "" }) => {
  const isCloud = mode === InferenceMode.CLOUD;
  
  return (
    <div className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ${
      isCloud ? 'bg-purple-900/20 border border-purple-600/30' : 'bg-teal-900/20 border border-teal-600/30'
    } ${className}`}>
      <div className={`p-2 rounded-full ${
        isCloud ? 'bg-purple-600/20' : 'bg-teal-600/20'
      }`}>
        {isCloud ? (
          <CloudIcon className="w-6 h-6 text-purple-400" />
        ) : (
          <ChipIcon className="w-6 h-6 text-teal-400" />
        )}
      </div>
      
      <div className="flex-1">
        <div className={`text-sm font-semibold ${
          isCloud ? 'text-purple-300' : 'text-teal-300'
        }`}>
          {isCloud ? 'Cloud Policy' : 'Local Policy'}
        </div>
        <div className="text-xs text-gray-400 mt-0.5">
          {isCloud 
            ? 'Processing on remote servers' 
            : 'Running on vehicle hardware'}
        </div>
      </div>
      
      <div className={`px-2 py-1 rounded text-xs font-medium ${
        isCloud 
          ? 'bg-purple-600/30 text-purple-300' 
          : 'bg-teal-600/30 text-teal-300'
      }`}>
        {isCloud ? 'Remote' : 'Edge'}
      </div>
    </div>
  );
};