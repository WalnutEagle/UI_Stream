
import React from 'react';

interface DataDisplayCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const DataDisplayCard: React.FC<DataDisplayCardProps> = ({ title, children, className }) => {
  return (
    <div className={`bg-gray-800 shadow-lg rounded-xl p-5 ${className || ''}`}>
      <h3 className="text-lg font-semibold text-blue-300 mb-4 border-b border-gray-700 pb-2">
        {title}
      </h3>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );
};
