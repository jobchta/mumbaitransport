"use client";

import { useState, useEffect, useCallback } from 'react';

export interface Alert {
  id: string;
  title: string;
  description: string;
  line: string;
  lineId: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'active' | 'resolved';
  lastUpdated: string;
}

interface ApiResponse {
  success: boolean;
  data?: {
    alerts: Alert[];
    lineStatuses: object[];
    stats: { alertCount: number };
  };
}

export function useLiveAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [serverConnected, setServerConnected] = useState(false);
  const [stats, setStats] = useState({ alertCount: 0 });

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/alerts');
      const data: ApiResponse = await res.json();
      
      if (data.success && data.data) {
        setAlerts(data.data.alerts);
        setStats(data.data.stats);
        setServerConnected(true);
      }
    } catch {
      setServerConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const forceRefresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/alerts', { method: 'POST' });
      const data: ApiResponse = await res.json();
      
      if (data.success && data.data) {
        setAlerts(data.data.alerts);
        setStats(data.data.stats);
        setServerConnected(true);
      }
    } catch {
      setServerConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return { alerts, isLoading, serverConnected, stats, refetch: fetchData, forceRefresh };
}

export function getLineColor(line: string): string {
  const colors: Record<string, string> = {
    western: 'bg-blue-500',
    central: 'bg-red-500',
    harbour: 'bg-yellow-500',
    'trans-harbour': 'bg-violet-500',
    'metro-1': 'bg-pink-500',
    'metro-2a': 'bg-yellow-400',
    'metro-7': 'bg-emerald-500',
    monorail: 'bg-green-500',
  };
  return colors[line.toLowerCase()] || 'bg-gray-500';
}

export function getSeverityColor(severity: string): string {
  const colors: Record<string, string> = {
    critical: 'bg-red-600',
    high: 'bg-orange-500',
    medium: 'bg-yellow-500',
    low: 'bg-blue-500',
  };
  return colors[severity] || 'bg-gray-500';
}
