/**
 * Storage Utilities
 * 
 * Persistent storage for user data using localStorage
 */

import type { FavoriteStation, FavoriteRoute, TripHistory, UserPreferences } from '@/types';

const STORAGE_KEYS = {
  FAVORITE_STATIONS: 'mumbailocal_fav_stations',
  FAVORITE_ROUTES: 'mumbailocal_fav_routes',
  TRIP_HISTORY: 'mumbailocal_trips',
  PREFERENCES: 'mumbailocal_prefs',
  LAST_CROWD_REPORT: 'mumbailocal_crowd_report',
} as const;

// ============================================================================
// Generic Storage Helpers
// ============================================================================

function getStorageItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setStorageItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Storage error:', error);
  }
}

// ============================================================================
// Favorite Stations
// ============================================================================

export function getFavoriteStations(): FavoriteStation[] {
  return getStorageItem<FavoriteStation[]>(STORAGE_KEYS.FAVORITE_STATIONS, []);
}

export function addFavoriteStation(stationId: string, nickname?: string): void {
  const favorites = getFavoriteStations();
  if (!favorites.find(f => f.stationId === stationId)) {
    favorites.push({
      stationId,
      addedAt: new Date().toISOString(),
      nickname,
    });
    setStorageItem(STORAGE_KEYS.FAVORITE_STATIONS, favorites);
  }
}

export function removeFavoriteStation(stationId: string): void {
  const favorites = getFavoriteStations().filter(f => f.stationId !== stationId);
  setStorageItem(STORAGE_KEYS.FAVORITE_STATIONS, favorites);
}

export function isFavoriteStation(stationId: string): boolean {
  return getFavoriteStations().some(f => f.stationId === stationId);
}

// ============================================================================
// Favorite Routes
// ============================================================================

export function getFavoriteRoutes(): FavoriteRoute[] {
  return getStorageItem<FavoriteRoute[]>(STORAGE_KEYS.FAVORITE_ROUTES, []);
}

export function addFavoriteRoute(
  fromId: string, 
  toId: string, 
  fromName: string, 
  toName: string,
  nickname?: string
): void {
  const routes = getFavoriteRoutes();
  const id = `${fromId}-${toId}`;
  
  if (!routes.find(r => r.id === id)) {
    routes.push({
      id,
      from: { id: fromId, name: fromName } as any,
      to: { id: toId, name: toName } as any,
      nickname,
      addedAt: new Date().toISOString(),
    });
    setStorageItem(STORAGE_KEYS.FAVORITE_ROUTES, routes);
  }
}

export function removeFavoriteRoute(routeId: string): void {
  const routes = getFavoriteRoutes().filter(r => r.id !== routeId);
  setStorageItem(STORAGE_KEYS.FAVORITE_ROUTES, routes);
}

export function updateRouteLastUsed(routeId: string): void {
  const routes = getFavoriteRoutes();
  const route = routes.find(r => r.id === routeId);
  if (route) {
    route.lastUsed = new Date().toISOString();
    setStorageItem(STORAGE_KEYS.FAVORITE_ROUTES, routes);
  }
}

// ============================================================================
// Trip History
// ============================================================================

export function getTripHistory(limit = 20): TripHistory[] {
  const history = getStorageItem<TripHistory[]>(STORAGE_KEYS.TRIP_HISTORY, []);
  return history.slice(0, limit);
}

export function addTripToHistory(
  fromId: string, 
  toId: string, 
  fromName: string, 
  toName: string,
  line: string,
  fare?: number
): void {
  const history = getStorageItem<TripHistory[]>(STORAGE_KEYS.TRIP_HISTORY, []);
  
  history.unshift({
    id: `trip_${Date.now()}`,
    from: { id: fromId, name: fromName } as any,
    to: { id: toId, name: toName } as any,
    timestamp: new Date().toISOString(),
    line: line as any,
    fare,
  });
  
  // Keep only last 50 trips
  setStorageItem(STORAGE_KEYS.TRIP_HISTORY, history.slice(0, 50));
}

export function clearTripHistory(): void {
  setStorageItem(STORAGE_KEYS.TRIP_HISTORY, []);
}

// ============================================================================
// User Preferences
// ============================================================================

const DEFAULT_PREFERENCES: UserPreferences = {
  language: 'en',
  theme: 'dark',
  notifications: {
    lineAlerts: [],
    pushEnabled: false,
  },
};

export function getUserPreferences(): UserPreferences {
  return getStorageItem<UserPreferences>(STORAGE_KEYS.PREFERENCES, DEFAULT_PREFERENCES);
}

export function setUserPreferences(prefs: Partial<UserPreferences>): void {
  const current = getUserPreferences();
  setStorageItem(STORAGE_KEYS.PREFERENCES, { ...current, ...prefs });
}

export function setHomeStation(stationId: string): void {
  setUserPreferences({ homeStation: stationId });
}

export function setWorkStation(stationId: string): void {
  setUserPreferences({ workStation: stationId });
}

export function setPreferredLine(lineId: string): void {
  setUserPreferences({ defaultLine: lineId as any });
}

// ============================================================================
// Crowd Reports
// ============================================================================

export interface LocalCrowdReport {
  stationId: string;
  level: 'low' | 'medium' | 'high';
  timestamp: string;
  expiresAt: string;
}

export function saveCrowdReport(stationId: string, level: 'low' | 'medium' | 'high'): void {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 30 * 60 * 1000); // 30 min expiry
  
  setStorageItem(STORAGE_KEYS.LAST_CROWD_REPORT, {
    stationId,
    level,
    timestamp: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  });
}

export function getLastCrowdReport(): LocalCrowdReport | null {
  const report = getStorageItem<LocalCrowdReport | null>(STORAGE_KEYS.LAST_CROWD_REPORT, null);
  
  if (!report) return null;
  
  // Check if expired
  if (new Date(report.expiresAt) < new Date()) {
    return null;
  }
  
  return report;
}

// ============================================================================
// Share Trip
// ============================================================================

export function generateShareCode(fromId: string, toId: string, departureTime: string): string {
  const data = `${fromId}|${toId}|${departureTime}|${Date.now()}`;
  return btoa(data).slice(0, 12).toUpperCase();
}

export function parseShareCode(code: string): { fromId: string; toId: string; departureTime: string } | null {
  try {
    const paddedCode = code + '='.repeat((4 - code.length % 4) % 4);
    const decoded = atob(paddedCode.toUpperCase());
    const [fromId, toId, departureTime] = decoded.split('|');
    return { fromId, toId, departureTime };
  } catch {
    return null;
  }
}

// ============================================================================
// Statistics
// ============================================================================

export function getUserStats() {
  const favorites = getFavoriteStations();
  const routes = getFavoriteRoutes();
  const history = getTripHistory(100);
  
  // Calculate most used line
  const lineUsage: Record<string, number> = {};
  history.forEach(trip => {
    lineUsage[trip.line] = (lineUsage[trip.line] || 0) + 1;
  });
  
  const mostUsedLine = Object.entries(lineUsage)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  
  return {
    totalTrips: history.length,
    favoriteCount: favorites.length,
    routeCount: routes.length,
    mostUsedLine,
    tripsThisWeek: history.filter(t => {
      const tripDate = new Date(t.timestamp);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return tripDate > weekAgo;
    }).length,
  };
}
