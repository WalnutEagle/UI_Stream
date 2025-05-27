import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './Dashboard';
import VehicleView from './VehicleView';

const AppRouter: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/vehicle/:id" element={<VehicleView />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;