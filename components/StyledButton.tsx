
import React from 'react';

interface StyledButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  className?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export const StyledButton: React.FC<StyledButtonProps> = ({ onClick, children, variant = 'primary', className = '', icon, disabled = false }) => {
  let baseStyle = "font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-opacity-50 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed";
  
  switch (variant) {
    case 'secondary':
      baseStyle += " bg-gray-600 hover:bg-gray-500 text-white focus:ring-gray-400";
      break;
    case 'danger':
      baseStyle += " bg-red-600 hover:bg-red-700 text-white focus:ring-red-500";
      break;
    case 'ghost':
      baseStyle += " bg-transparent hover:bg-gray-700 text-blue-300 border border-blue-400 focus:ring-blue-300";
      break;
    case 'primary':
    default:
      baseStyle += " bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500";
      break;
  }

  return (
    <button onClick={onClick} className={`${baseStyle} ${className}`} disabled={disabled}>
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};
