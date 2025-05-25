
export enum InferenceMode {
  LOCAL = "Local",
  CLOUD = "Cloud",
}

export interface Waypoint {
  id: string;
  x: number;
  y: number;
  z?: number; // Optional altitude
}

export interface GPSSensorData {
  lat: number;
  lon: number;
  altitude: number; // meters
}

export interface VehicleSensorData {
  gps: GPSSensorData;
  velocity: number; // km/h
  acceleration: {
    x: number; // m/s^2
    y: number;
    z: number;
  };
  yawRate: number; // deg/s
}

export interface VehicleControlState {
  steeringAngle: number; // degrees, -45 (left) to 45 (right)
  throttle: number; // percentage, 0 to 100
  brake: number; // percentage, 0 to 100
}
