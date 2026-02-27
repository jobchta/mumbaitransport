/**
 * Central type definitions for MumbaiTransport application
 * All shared types should be exported from this file
 */

// Alert types for transport disruptions
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

// Transport line identifiers
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

// Station types
export interface Station {
  id: string;
  name: string;
  nameHi: string;
  line: LineId;
  zone: string;
  platforms: number;
  distance: number; // km from origin
  facilities: string[];
  parking: boolean;
  wheelchair: boolean;
  fastStop: boolean;
}

// Train schedule types
export type TrainType = 'slow' | 'fast' | 'semi-fast' | 'ladies';

export interface TrainSchedule {
  id: string;
  from: string;
  to: string;
  departure: string;
  arrival: string;
  type: TrainType;
  days: string[];
  platform?: number;
}

// Fare types
export interface Fare {
  from: string;
  to: string;
  distance: number;
  secondClass: number;
  firstClass: number;
  monthly: number;
  season: number;
}

// Line information
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
}

// Line status for UI display
export interface LineStatus {
  lineId: LineId;
  status: 'normal' | 'delayed' | 'suspended';
  alertCount: number;
}

// Crowd level information
export interface CrowdInfo {
  stationId: string;
  percentage: number;
  lastUpdated: string;
}

// API response types
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

// Web search result from z-ai SDK
export interface WebSearchResult {
  url: string;
  name: string;
  snippet: string;
  host_name: string;
  rank: number;
  date: string;
  favicon: string;
}

// LLM-extracted alert (raw from AI)
export interface LlmExtractedAlert {
  title?: string;
  description?: string;
  line?: string;
  severity?: string;
}
