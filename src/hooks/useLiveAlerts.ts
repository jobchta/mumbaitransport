/**
 * Live Alerts Hook
 *
 * Provides real-time transport alerts with automatic refresh and error handling.
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Alert, LineStatus, AlertsApiResponse } from '@/types';
import { LINE_COLOR_CLASSES, SEVERITY_COLOR_CLASSES } from '@/lib/utils/constants';

// Re-export types for convenience
export type { Alert, LineStatus } from '@/types';

interface UseLiveAlertsReturn {
  alerts: Alert[];
  isLoading: boolean;
  serverConnected: boolean;
  stats: { alertCount: number };
  lineStatuses: LineStatus[];
  refetch: () => Promise<void>;
  forceRefresh: () => Promise<void>;
}

interface UseLiveAlertsOptions {
  /** Refresh interval in milliseconds (default: 60000) */
  refreshInterval?: number;
  /** Enable automatic refresh */
  autoRefresh?: boolean;
}

/**
 * Hook for fetching and managing live transport alerts
 */
export function useLiveAlerts(options: UseLiveAlertsOptions = {}): UseLiveAlertsReturn {
  const { refreshInterval = 60000, autoRefresh = true } = options;

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [lineStatuses, setLineStatuses] = useState<LineStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [serverConnected, setServerConnected] = useState(false);
  const [stats, setStats] = useState({ alertCount: 0 });

  // Use ref to track if component is mounted
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchData = useCallback(async (forceCacheBust = false) => {
    try {
      const url = forceCacheBust ? '/api/alerts' : '/api/alerts';
      const method = forceCacheBust ? 'POST' : 'GET';

      const response = await fetch(url, { method });
      const data: AlertsApiResponse = await response.json();

      // Only update state if component is still mounted
      if (!isMountedRef.current) return;

      if (data.success && data.data) {
        setAlerts(data.data.alerts);
        setLineStatuses(data.data.lineStatuses);
        setStats(data.data.stats);
        setServerConnected(true);
      } else {
        // API returned success: false but we still got data
        if (data.data) {
          setAlerts(data.data.alerts);
          setLineStatuses(data.data.lineStatuses);
          setStats(data.data.stats);
        }
        setServerConnected(data.data?.alerts.length !== undefined);
      }
    } catch (error) {
      if (!isMountedRef.current) return;
      console.error('Failed to fetch alerts:', error);
      setServerConnected(false);
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  const refetch = useCallback(async () => {
    await fetchData(false);
  }, [fetchData]);

  const forceRefresh = useCallback(async () => {
    setIsLoading(true);
    await fetchData(true);
  }, [fetchData]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh interval
  useEffect(() => {
    if (!autoRefresh) return;

    const intervalId = setInterval(() => {
      fetchData();
    }, refreshInterval);

    return () => clearInterval(intervalId);
  }, [fetchData, refreshInterval, autoRefresh]);

  return {
    alerts,
    isLoading,
    serverConnected,
    stats,
    lineStatuses,
    refetch,
    forceRefresh,
  };
}

/**
 * Get Tailwind background color class for a line
 */
export function getLineColor(line: string): string {
  return LINE_COLOR_CLASSES[line.toLowerCase()] || 'bg-gray-500';
}

/**
 * Get Tailwind background color class for severity
 */
export function getSeverityColor(severity: string): string {
  return SEVERITY_COLOR_CLASSES[severity.toLowerCase()] || 'bg-gray-500';
}
