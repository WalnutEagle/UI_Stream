import React from 'react';
import { useParams, Link } from 'react-router-dom';
import App from './App';

const VehicleView: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div>
      {/* Breadcrumb Navigation */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-3">
        <div className="flex items-center space-x-2 text-sm">
          <Link to="/" className="text-gray-400 hover:text-white transition-colors">
            Dashboard
          </Link>
          <span className="text-gray-500">/</span>
          <span className="text-white">Vehicle {id}</span>
        </div>
      </div>
      
      {/* Original App Component */}
      <App />
    </div>
  );
};

export default VehicleView;