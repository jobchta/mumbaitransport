/**
 * Crowd Level Hook
 *
 * Provides crowd level estimates for stations based on time of day.
 * Memoized to prevent unnecessary recalculations.
 */

'use client';

import { useMemo } from 'react';
import { CROWD_THRESHOLDS, TIME_CONSTANTS } from '@/lib/utils/constants';

export interface CrowdLevelInfo {
  percentage: number;
  level: 'low' | 'medium' | 'high';
  colorClass: string;
}

/**
 * Calculate crowd level for a station based on current time
 *
 * @param stationId - Station identifier (used for deterministic variation)
 * @param currentTime - Current time (injected for testing)
 * @returns Crowd level information
 */
export function calculateCrowdLevel(stationId: string, currentTime: Date = new Date()): CrowdLevelInfo {
  const hour = currentTime.getHours();
  const minutes = currentTime.getMinutes();

  // Use stationId to create deterministic but varied base
  const stationHash = stationId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const variation = (stationHash % 10) - 5; // -5 to +5 variation

  let basePercentage: number;

  // Calculate base percentage based on time of day
  if (hour >= TIME_CONSTANTS.MORNING_PEAK_START && hour <= TIME_CONSTANTS.MORNING_PEAK_END) {
    // Morning rush hour (8 AM - 11 AM)
    basePercentage = CROWD_THRESHOLDS.BASE_MORNING_PEAK + variation;
  } else if (hour >= TIME_CONSTANTS.EVENING_PEAK_START && hour <= TIME_CONSTANTS.EVENING_PEAK_END) {
    // Evening rush hour (5 PM - 9 PM)
    basePercentage = CROWD_THRESHOLDS.BASE_EVENING_PEAK + variation;
  } else if (hour >= TIME_CONSTANTS.NIGHT_START || hour <= TIME_CONSTANTS.NIGHT_END) {
    // Night hours (10 PM - 5 AM)
    basePercentage = CROWD_THRESHOLDS.BASE_NIGHT + variation;
  } else {
    // Off-peak hours
    basePercentage = CROWD_THRESHOLDS.BASE_OFF_PEAK + variation;
  }

  // Add subtle time-based variation within the current period
  const minuteVariation = Math.sin((minutes / 60) * Math.PI) * 5;
  const percentage = Math.max(5, Math.min(100, Math.round(basePercentage + minuteVariation)));

  // Determine level and color
  let level: CrowdLevelInfo['level'];
  let colorClass: string;

  if (percentage >= CROWD_THRESHOLDS.MEDIUM) {
    level = 'high';
    colorClass = 'bg-red-500';
  } else if (percentage >= CROWD_THRESHOLDS.LOW) {
    level = 'medium';
    colorClass = 'bg-yellow-500';
  } else {
    level = 'low';
    colorClass = 'bg-green-500';
  }

  return { percentage, level, colorClass };
}

/**
 * Hook for calculating crowd levels for multiple stations
 *
 * @param stationIds - Array of station IDs to calculate crowd levels for
 * @returns Map of station ID to crowd level info
 */
export function useCrowdLevels(stationIds: string[]): Map<string, CrowdLevelInfo> {
  // Get hour outside useMemo to use as dependency
  const hour = new Date().getHours();

  return useMemo(() => {
    const currentTime = new Date();
    const crowdMap = new Map<string, CrowdLevelInfo>();

    for (const stationId of stationIds) {
      crowdMap.set(stationId, calculateCrowdLevel(stationId, currentTime));
    }

    return crowdMap;
  }, [stationIds, hour]);
}

/**
 * Hook for calculating crowd level for a single station
 *
 * @param stationId - Station ID
 * @returns Crowd level info
 */
export function useCrowdLevel(stationId: string): CrowdLevelInfo {
  // Get hour outside useMemo to use as dependency
  const hour = new Date().getHours();

  return useMemo(
    () => calculateCrowdLevel(stationId, new Date()),
    [stationId, hour]
  );
}

/**
 * Get crowd level color class based on percentage
 */
export function getCrowdColorClass(percentage: number): string {
  if (percentage >= CROWD_THRESHOLDS.MEDIUM) {
    return 'bg-red-500';
  }
  if (percentage >= CROWD_THRESHOLDS.LOW) {
    return 'bg-yellow-500';
  }
  return 'bg-green-500';
}
