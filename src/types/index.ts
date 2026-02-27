/**
 * Central type definitions for MumbaiTransport application
 * All shared types should be exported from this file
 */

// ============================================================================
// Alert Types
// ============================================================================

export interface Alert {
  id: string;
  title: string;
  description: string;
  line: TransportLine;
  lineId: LineId;
  severity: AlertSeverity;
  status: AlertStatus;
  lastUpdated: string;
}

export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low';
export type AlertStatus = 'active' | 'resolved';

// ============================================================================
// Transport Line Types
// ============================================================================

export type LineId =
  | 'western'
  | 'central'
  | 'harbour'
  | 'trans-harbour'
  | 'metro-1'
  | 'metro-2a'
  | 'metro-7'
  | 'monorail'
  | 'general';

export type TransportLine =
  | 'Western'
  | 'Central'
  | 'Harbour'
  | 'Trans-Harbour'
  | 'Metro Line 1'
  | 'Metro Line 2A'
  | 'Metro Line 7'
  | 'Monorail'
  | 'General';

// ============================================================================
// Station Types
// ============================================================================

export interface Station {
  id: string;
  name: string;
  nameHi: string;
  nameMr?: string; // Marathi
  line: LineId;
  zone: string;
  platforms: number;
  distance: number;
  facilities: string[];
  parking: boolean;
  wheelchair: boolean;
  fastStop: boolean;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

// ============================================================================
// Train Schedule Types
// ============================================================================

export type TrainType = 'slow' | 'fast' | 'semi-fast' | 'ladies' | 'special';

export interface TrainSchedule {
  id: string;
  from: string;
  to: string;
  departure: string;
  arrival: string;
  type: TrainType;
  days: string[];
  platform?: number;
  carCount?: number;
}

export interface TrainPosition {
  trainId: string;
  currentStation: string;
  nextStation: string;
  departureTime: string;
  arrivalTime: string;
  delay: number; // in minutes
  status: 'on-time' | 'delayed' | 'cancelled' | 'arriving';
  lastUpdated: string;
}

// ============================================================================
// Fare Types
// ============================================================================

export interface Fare {
  from: string;
  to: string;
  distance: number;
  secondClass: number;
  firstClass: number;
  monthly: number;
  season: number;
}

export interface FareBreakdown {
  baseFare: number;
  distance: number;
  peakSurcharge?: number;
  total: number;
}

// ============================================================================
// Line Information
// ============================================================================

export interface LineInfo {
  id: LineId;
  name: string;
  nameHi: string;
  color: string;
  colorCode: string;
  endpoints: [string, string];
  length: number;
  stations: number;
  firstTrain: string;
  lastTrain: string;
  frequency: string;
  avgDailyRidership?: number;
}

export interface LineStatus {
  lineId: LineId;
  status: 'normal' | 'delayed' | 'suspended';
  alertCount: number;
  lastUpdated?: string;
}

// ============================================================================
// Journey Planner Types
// ============================================================================

export interface JourneyRoute {
  id: string;
  from: Station;
  to: Station;
  legs: JourneyLeg[];
  totalTime: number;
  totalDistance: number;
  fare: Fare;
  transfers: number;
  departureTime: string;
  arrivalTime: string;
}

export interface JourneyLeg {
  from: Station;
  to: Station;
  line: LineId;
  trainType: TrainType;
  departureTime: string;
  arrivalTime: string;
  duration: number;
  platforms: {
    from: number;
    to: number;
  };
}

export interface JourneyPlanRequest {
  from: string;
  to: string;
  departureTime?: Date;
  arrivalTime?: Date;
  preferences?: JourneyPreferences;
}

export interface JourneyPreferences {
  avoidTransfers?: boolean;
  preferFast?: boolean;
  wheelchairAccessible?: boolean;
  ladiesOnly?: boolean;
}

// ============================================================================
// User Data Types
// ============================================================================

export interface FavoriteStation {
  stationId: string;
  addedAt: string;
  nickname?: string;
}

export interface FavoriteRoute {
  id: string;
  from: Station;
  to: Station;
  nickname?: string;
  addedAt: string;
  lastUsed?: string;
}

export interface TripHistory {
  id: string;
  from: Station;
  to: Station;
  timestamp: string;
  line: LineId;
  fare?: number;
}

export interface UserPreferences {
  defaultLine?: LineId;
  homeStation?: string;
  workStation?: string;
  language: 'en' | 'hi' | 'mr';
  theme: 'dark' | 'light' | 'system';
  notifications: NotificationPreferences;
}

export interface NotificationPreferences {
  lineAlerts: LineId[];
  pushEnabled: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
}

// ============================================================================
// Crowd Data Types
// ============================================================================

export interface CrowdInfo {
  stationId: string;
  percentage: number;
  level: 'low' | 'medium' | 'high';
  colorClass: string;
}

export interface CrowdReport {
  id: string;
  stationId: string;
  userId: string;
  level: 'low' | 'medium' | 'high';
  timestamp: string;
  platform?: number;
  expiresAt: string;
}

// ============================================================================
// Weather Types
// ============================================================================

export interface WeatherInfo {
  temp: number;
  feelsLike: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'foggy';
  humidity: number;
  windSpeed: number;
  icon: string;
  lastUpdated: string;
}

// ============================================================================
// Share Types
// ============================================================================

export interface ShareableTrip {
  from: string;
  to: string;
  line: string;
  departureTime: string;
  expectedArrival: string;
  shareCode: string;
  createdAt: string;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface AlertsApiResponse {
  success: boolean;
  cached?: boolean;
  timestamp: string;
  data: {
    alerts: Alert[];
    lineStatuses: LineStatus[];
    stats: {
      alertCount: number;
    };
  };
  error?: string;
}

export interface WebSearchResult {
  url: string;
  name: string;
  snippet: string;
  host_name: string;
  rank: number;
  date: string;
  favicon: string;
}

// ============================================================================
// PWA Types
// ============================================================================

export interface PWAInstallPrompt {
  isInstallable: boolean;
  prompt: () => Promise<boolean>;
  isInstalled: boolean;
}

export interface OfflineData {
  stations: Station[];
  lines: Record<string, LineInfo>;
  lastSync: string;
}

// ============================================================================
// Quick Actions
// ============================================================================

export interface QuickAction {
  id: string;
  type: 'station' | 'route' | 'alert' | 'fare';
  title: string;
  subtitle?: string;
  icon: string;
  action: () => void;
}

// ============================================================================
// Statistics
// ============================================================================

export interface TransportStats {
  totalStations: number;
  totalLines: number;
  totalDistance: number;
  dailyRidership: number;
  avgFrequency: number;
}
