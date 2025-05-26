
import React from 'react';
import { Waypoint } from '../types';

interface WaypointListProps {
  waypoints: Waypoint[];
}

export const WaypointList: React.FC<WaypointListProps> = ({ waypoints }) => {
  if (!waypoints.length) {
    return <p className="text-sm text-gray-500 italic">No waypoints predicted.</p>;
  }
  return (
    <ul className="space-y-1 max-h-32 overflow-y-auto text-xs pr-2">
      {waypoints.map((wp, index) => (
        <li key={index} className="flex justify-between p-1 bg-gray-700 rounded-md">
          <span className="text-gray-300">Waypoint {index + 1}</span>
          <span className="text-cyan-400">
            X: {wp[0].toFixed(2)}, Y: {wp[1].toFixed(2)}
          </span>
        </li>
      ))}
    </ul>
  );
};