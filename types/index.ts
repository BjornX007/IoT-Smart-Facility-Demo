export type ZoneType =
  | 'gate' | 'restroom' | 'lounge' | 'food' | 'retail' | 'corridor'
  | 'security' | 'checkin' | 'baggage' | 'staff' | 'utility' | 'atrium' | 'dock';

export type ZoneStatus = 'clean' | 'dirty' | 'inprogress' | 'scheduled' | 'skip';
export type Priority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'SKIP';

export interface SmartBin {
  id: string;
  zoneId: string;
  label: string;
  fillLevel: number;
  lastEmptied: string;
  type: 'general' | 'recycling' | 'hazardous';
}

export interface Sensor {
  id: string;
  zoneId: string;
  trafficLevel: number;
  detected: boolean;
  lastMotion: number | null;
  totalPassengers: number;
}

export interface Zone {
  id: string;
  name: string;
  shortName: string;
  x: number;
  y: number;
  w: number;
  h: number;
  type: ZoneType;
  terminalId: string;
  floor: number;
  gateCode?: string;
  sensors: number;
  binCount: number;
  capacity: number;
}

export interface Corridor {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Floor {
  id: number;
  name: string;
  zones: Zone[];
  corridors: Corridor[];
}

export interface Terminal {
  id: string;
  name: string;
  shortName: string;
  floors: Floor[];
}

export type RobotStatus = 'docked' | 'navigating' | 'mopping' | 'collecting' | 'returning' | 'charging';

export interface RobotPosition {
  x: number;
  y: number;
  floor: number;
  terminalId: string;
}

export interface Robot {
  id: string;
  name: string;
  model: string;
  terminalId: string;
  status: RobotStatus;
  battery: number;
  position: RobotPosition;
  targetZoneId: string | null;
  currentTask: string;
  eta: number | null;
  totalJobsToday: number;
  distanceCoveredM: number;
  mode: 'auto' | 'manual'; // NEW
}

export type WorkerStatus = 'active' | 'transit' | 'break' | 'idle';

export interface Worker {
  id: string;
  name: string;
  initials: string;
  terminalId: string;
  floor: number;
  status: WorkerStatus;
  currentTask: string;
  zoneId: string | null;
  efficiency: number;
  jobsToday: number;
  avgResponseMin: number;
}

export type ReportType = 'spill' | 'smell' | 'broken' | 'bin_overflow' | 'restroom' | 'other';
export type ReportStatus = 'pending' | 'inprogress' | 'resolved' | 'dismissed';
export type Urgency = 'low' | 'medium' | 'high' | 'critical';

export interface Report {
  id: string;
  type: ReportType;
  urgency: Urgency;
  zoneId: string;
  zoneName: string;
  terminalId: string;
  floor: number;
  description: string;
  status: ReportStatus;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  assignedRobotId: string | null;
  assignedWorkerId: string | null;
  trackingCode: string;
}

export interface Review {
  id: string;
  reportId: string | null;
  zoneId: string;
  zoneName: string;
  stars: number;
  comment: string;
  category: 'cleaning' | 'response_time' | 'staff' | 'facilities' | 'general';
  createdAt: string;
}

export type FlightStatus = 'on_time' | 'boarding' | 'departed' | 'delayed' | 'arrived';

export interface Flight {
  id: string;
  flightNumber: string;
  destination: string;
  origin?: string;
  scheduledTime: string;
  status: FlightStatus;
  gateCode: string;
  terminalId: string;
  passengers: number;
  type: 'departure' | 'arrival';
}

export interface ServiceRequest {
  id: string;
  type: string;
  zoneId: string;
  zoneName: string;
  terminalId: string;
  scheduledTime: string;
  status: 'pending' | 'confirmed' | 'completed';
  createdAt: string;
}

export interface ZoneState {
  zoneId: string;
  status: ZoneStatus;
  priority: Priority;
  sensor: Sensor;
  bins: SmartBin[];
  lastCleaned: string;
  scheduledClean: string | null;
  assignedRobotId: string | null;
  assignedWorkerId: string | null;
}

export interface AppState {
  zoneStates: Record<string, ZoneState>;
  robots: Robot[];
  workers: Worker[];
  reports: Report[];
  reviews: Review[];
  flights: Flight[];
  serviceRequests: ServiceRequest[];
  simulationTick: number;
  tripsSaved: number;
  lastUpdated: string;
}

export interface MapLayers {
  heatmap: boolean;
  sensors: boolean;
  priority: boolean;
  bins: boolean;
  robots: boolean;
}

export type ActivePanel = 'tasks' | 'robots' | 'bins' | 'workers' | 'reviews' | 'flights';