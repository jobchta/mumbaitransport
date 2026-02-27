/**
 * MumbaiLocal - Main Page
 *
 * AI-powered Mumbai transport alerts with real-time disruption updates.
 * Features: Live alerts, station finder, fare calculator, train schedules.
 */

'use client';

import { useState, useEffect, useMemo, useCallback, useSyncExternalStore } from 'react';
import {
  Train,
  Clock,
  Users,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ArrowRight,
  ChevronRight,
  MapPin,
  Wifi,
  WifiOff,
  Navigation,
  Zap,
  Route,
  Search,
  Ticket,
  Accessibility,
  Heart,
  Phone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLiveAlerts, getLineColor } from '@/hooks/useLiveAlerts';
import { calculateCrowdLevel, getCrowdColorClass } from '@/hooks/useCrowdLevel';
import {
  STATIONS,
  LINES,
  calculateFare,
  getNextTrains,
} from '@/lib/transport/data';
import {
  STATION_LIST_CONFIG,
  STATUS_CONFIG,
  LINE_COLORS,
} from '@/lib/utils/constants';
import type { Station, TrainSchedule, Fare, LineId } from '@/types';

// ============================================================================
// Utility Components
// ============================================================================

/**
 * Time display component with live clock
 */
function TimeDisplay() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date): string =>
    date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  const formatDate = (date: Date): string =>
    date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' });

  return (
    <div className="text-center" role="timer" aria-live="polite">
      <div className="text-4xl font-bold tracking-tight">{formatTime(time)}</div>
      <div className="text-sm opacity-70">{formatDate(time)}</div>
    </div>
  );
}

/**
 * Train type badge component
 */
function TrainTypeBadge({ type }: { type: TrainSchedule['type'] }) {
  const config: Record<TrainSchedule['type'], { color: string; label: string }> = {
    slow: { color: 'bg-slate-500', label: 'S' },
    fast: { color: 'bg-red-500', label: 'F' },
    'semi-fast': { color: 'bg-orange-500', label: 'SF' },
    ladies: { color: 'bg-pink-500', label: 'L' },
  };

  const { color, label } = config[type];

  return (
    <span
      className={`${color} text-white text-xs px-2 py-0.5 rounded font-bold`}
      aria-label={`${type} train`}
    >
      {label}
    </span>
  );
}

/**
 * Line status indicator with accessible status text
 */
function StatusIndicator({
  status,
  className = '',
}: {
  status: 'normal' | 'delayed' | 'suspended';
  className?: string;
}) {
  const config = STATUS_CONFIG[status];
  const IconMap = { CheckCircle2, AlertTriangle, XCircle };
  const StatusIcon = IconMap[status === 'normal' ? 'normal' : status === 'delayed' ? 'delayed' : 'suspended'] || CheckCircle2;

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <StatusIcon className={`w-5 h-5 ${config.color}`} aria-hidden="true" />
      <span className="sr-only">{status}</span>
    </div>
  );
}

// ============================================================================
// Feature Components
// ============================================================================

/**
 * Next trains widget
 */
function NextTrainsWidget({ station }: { station: Station | null }) {
  const trains = useMemo(
    () => (station ? getNextTrains(station, null, 5) : []),
    [station]
  );

  if (!station) return null;

  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-lg flex items-center gap-2">
        <Clock className="w-5 h-5 text-blue-500" aria-hidden="true" />
        Next Trains from {station.name}
      </h3>
      {trains.length === 0 ? (
        <p className="text-sm opacity-70">No upcoming trains</p>
      ) : (
        <div className="space-y-1" role="list" aria-label="Upcoming trains">
          {trains.map((train) => (
            <div
              key={train.id}
              className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
              role="listitem"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold font-mono">{train.departure}</span>
                <TrainTypeBadge type={train.type} />
                {train.platform && (
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded">
                    Pl. {train.platform}
                  </span>
                )}
              </div>
              <div className="text-right text-sm opacity-70">
                <div aria-label={`Destination: ${train.to}`}>→ {train.to}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Fare calculator component
 */
function FareCalculator() {
  const [fromStation, setFromStation] = useState<Station | null>(null);
  const [toStation, setToStation] = useState<Station | null>(null);

  const fare = useMemo<Fare | null>(
    () => (fromStation && toStation ? calculateFare(fromStation, toStation) : null),
    [fromStation, toStation]
  );

  const handleFromChange = useCallback((value: string) => {
    setFromStation(STATIONS.find((s) => s.id === value) || null);
  }, []);

  const handleToChange = useCallback((value: string) => {
    setToStation(STATIONS.find((s) => s.id === value) || null);
  }, []);

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg flex items-center gap-2">
        <Ticket className="w-5 h-5 text-green-500" aria-hidden="true" />
        Fare Calculator
      </h3>

      <div className="grid grid-cols-2 gap-3">
        <Select onValueChange={handleFromChange} aria-label="Select origin station">
          <SelectTrigger className="bg-white/10 border-white/20">
            <SelectValue placeholder="From Station" />
          </SelectTrigger>
          <SelectContent>
            {STATIONS.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name} ({s.line})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select onValueChange={handleToChange} aria-label="Select destination station">
          <SelectTrigger className="bg-white/10 border-white/20">
            <SelectValue placeholder="To Station" />
          </SelectTrigger>
          <SelectContent>
            {STATIONS.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name} ({s.line})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {fare && (
        <div
          className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-gradient-to-br from-green-500/20 to-blue-500/20 border border-white/10"
          role="region"
          aria-label="Fare details"
        >
          <div>
            <div className="text-sm opacity-70">Distance</div>
            <div className="text-2xl font-bold">{fare.distance} km</div>
          </div>
          <div>
            <div className="text-sm opacity-70">Second Class</div>
            <div className="text-2xl font-bold text-green-400">₹{fare.secondClass}</div>
          </div>
          <div>
            <div className="text-sm opacity-70">First Class</div>
            <div className="text-xl font-semibold">₹{fare.firstClass}</div>
          </div>
          <div>
            <div className="text-sm opacity-70">Monthly Pass</div>
            <div className="text-xl font-semibold">₹{fare.monthly}</div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Line status card component
 */
function LineStatusCard({
  lineId,
  status,
  alertCount,
}: {
  lineId: LineId;
  status: 'normal' | 'delayed' | 'suspended';
  alertCount: number;
}) {
  const line = LINES[lineId];
  if (!line) return null;

  const config = STATUS_CONFIG[status];

  return (
    <div
      className={`relative p-4 rounded-xl ${config.bg} border border-white/10 hover:border-white/30 transition-all cursor-pointer group`}
      role="article"
      aria-label={`${line.name} - ${status}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: line.color }}
            aria-hidden="true"
          />
          <span className="font-semibold">{line.name}</span>
        </div>
        <StatusIndicator status={status} />
      </div>
      <div className="flex items-center gap-4 text-sm opacity-70">
        <span>{line.firstTrain} - {line.lastTrain}</span>
        <span>{line.frequency}</span>
      </div>
      {alertCount > 0 && (
        <Badge className="mt-2 bg-red-500/50 text-white text-xs">
          {alertCount} alert{alertCount > 1 ? 's' : ''}
        </Badge>
      )}
      <span className="sr-only">{status}</span>
      <ChevronRight
        className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 top-1/2 -translate-y-1/2"
        aria-hidden="true"
      />
    </div>
  );
}

/**
 * Station list item component
 */
function StationListItem({
  station,
  crowdInfo,
  onSelect,
}: {
  station: Station;
  crowdInfo: { percentage: number };
  onSelect: (station: Station) => void;
}) {
  return (
    <button
      onClick={() => onSelect(station)}
      className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer transition-colors border border-white/5 text-left"
      aria-label={`${station.name} station, crowd level ${crowdInfo.percentage}%`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-3 h-3 rounded-full ${getLineColor(station.line)}`}
          aria-hidden="true"
        />
        <div>
          <div className="font-medium">{station.name}</div>
          <div className="text-xs opacity-50">{station.zone}</div>
        </div>
      </div>
      <div className="text-right" aria-label={`Crowd: ${crowdInfo.percentage}%`}>
        <div className="text-sm font-semibold">{crowdInfo.percentage}%</div>
        <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden" role="progressbar" aria-valuenow={crowdInfo.percentage} aria-valuemin={0} aria-valuemax={100}>
          <div
            className={`h-full rounded-full ${getCrowdColorClass(crowdInfo.percentage)}`}
            style={{ width: `${crowdInfo.percentage}%` }}
          />
        </div>
      </div>
    </button>
  );
}

// ============================================================================
// Main Page Component
// ============================================================================

// Custom hook for client-side only mounting
function useIsMounted(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export default function Home() {
  const mounted = useIsMounted();
  const [activeTab, setActiveTab] = useState('home');
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [fromStation, setFromStation] = useState<Station | null>(null);
  const [toStation, setToStation] = useState<Station | null>(null);

  const { alerts, serverConnected, stats, forceRefresh, isLoading, lineStatuses } = useLiveAlerts();

  // Add dark mode class on mount
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // Filter stations based on search
  const filteredStations = useMemo(() => {
    if (!searchQuery) return STATIONS.slice(0, STATION_LIST_CONFIG.DEFAULT_DISPLAY_COUNT);
    return STATIONS.filter(
      (s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.nameHi.includes(searchQuery)
    ).slice(0, STATION_LIST_CONFIG.DEFAULT_DISPLAY_COUNT);
  }, [searchQuery]);

  // Get line status from alerts
  const getLineStatus = useCallback(
    (lineId: LineId): { status: 'normal' | 'delayed' | 'suspended'; alertCount: number } => {
      const lineStatus = lineStatuses.find((s) => s.lineId === lineId);
      return lineStatus
        ? { status: lineStatus.status, alertCount: lineStatus.alertCount }
        : { status: 'normal', alertCount: 0 };
    },
    [lineStatuses]
  );

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white pb-20">
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-white focus:text-black focus:p-2 focus:rounded"
      >
        Skip to main content
      </a>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
                <Train className="w-6 h-6" aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-lg font-bold">MumbaiLocal</h1>
                <div className="flex items-center gap-1 text-xs">
                  {serverConnected ? (
                    <>
                      <Wifi className="w-3 h-3 text-green-400" aria-hidden="true" />
                      <span className="text-green-400">Live</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-3 h-3 text-yellow-400" aria-hidden="true" />
                      <span className="text-yellow-400">Offline</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => forceRefresh()}
                disabled={isLoading}
                aria-label="Refresh alerts"
              >
                <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" className="max-w-lg mx-auto px-4 py-6 space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Home Tab */}
          <TabsContent value="home" className="space-y-6">
            {/* Time Display */}
            <Card className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border-white/10">
              <CardContent className="pt-6">
                <TimeDisplay />
              </CardContent>
            </Card>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-50" aria-hidden="true" />
              <Input
                placeholder="Search station or route..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 bg-white/10 border-white/20 rounded-xl"
                aria-label="Search stations"
              />
            </div>

            {/* Active Alerts */}
            {alerts.length > 0 && (
              <Card className="bg-red-500/20 border-red-500/50" role="region" aria-label="Active alerts">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-5 h-5 text-red-400" aria-hidden="true" />
                    <span className="font-semibold">
                      Active Alerts ({stats.alertCount})
                    </span>
                  </div>
                  {alerts.slice(0, 2).map((alert) => (
                    <div key={alert.id} className="p-3 rounded-lg bg-white/5 mb-2">
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-2 h-2 rounded-full ${getLineColor(alert.lineId)}`} />
                        <span className="font-medium">{alert.title}</span>
                      </div>
                      <p className="text-sm opacity-70">{alert.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Line Status */}
            <section aria-label="Line status">
              <h2 className="font-semibold mb-3 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" aria-hidden="true" />
                Line Status
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {(Object.keys(LINES) as LineId[]).slice(0, 4).map((lineId) => {
                  const { status, alertCount } = getLineStatus(lineId);
                  return (
                    <LineStatusCard
                      key={lineId}
                      lineId={lineId}
                      status={status}
                      alertCount={alertCount}
                    />
                  );
                })}
              </div>
            </section>

            {/* Station Finder */}
            {selectedStation ? (
              <Card className="bg-white/5 border-white/10">
                <CardContent className="pt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold">{selectedStation.name}</h3>
                      <p className="text-sm opacity-70">{selectedStation.nameHi}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedStation(null)}
                      aria-label="Close station details"
                    >
                      Close
                    </Button>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" aria-hidden="true" />
                      {selectedStation.zone}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" aria-hidden="true" />
                      {selectedStation.platforms} platforms
                    </span>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {selectedStation.facilities.map((f) => (
                      <Badge key={f} variant="outline" className="border-white/20">
                        {f}
                      </Badge>
                    ))}
                  </div>

                  {selectedStation.wheelchair && (
                    <div className="flex items-center gap-2 text-green-400">
                      <Accessibility className="w-4 h-4" aria-hidden="true" />
                      <span className="text-sm">Wheelchair accessible</span>
                    </div>
                  )}

                  <NextTrainsWidget station={selectedStation} />
                </CardContent>
              </Card>
            ) : (
              <section aria-label="Nearby stations">
                <h2 className="font-semibold flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-400" aria-hidden="true" />
                  Nearby Stations
                </h2>
                <div className="space-y-2 mt-3">
                  {filteredStations.map((station) => {
                    const crowdInfo = calculateCrowdLevel(station.id);
                    return (
                      <StationListItem
                        key={station.id}
                        station={station}
                        crowdInfo={crowdInfo}
                        onSelect={setSelectedStation}
                      />
                    );
                  })}
                </div>
              </section>
            )}
          </TabsContent>

          {/* Trains Tab */}
          <TabsContent value="trains" className="space-y-6">
            <Card className="bg-white/5 border-white/10">
              <CardContent className="pt-4 space-y-4">
                <h2 className="font-semibold text-lg flex items-center gap-2">
                  <Navigation className="w-5 h-5 text-blue-500" aria-hidden="true" />
                  Find Your Train
                </h2>

                <div className="grid grid-cols-[1fr,auto,1fr] gap-2 items-center">
                  <Select
                    onValueChange={(v) => setFromStation(STATIONS.find((s) => s.id === v) || null)}
                    aria-label="Select origin station"
                  >
                    <SelectTrigger className="bg-white/10 border-white/20">
                      <SelectValue placeholder="From" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATIONS.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button variant="ghost" size="icon" className="shrink-0" aria-hidden="true">
                    <ArrowRight className="w-4 h-4" />
                  </Button>

                  <Select
                    onValueChange={(v) => setToStation(STATIONS.find((s) => s.id === v) || null)}
                    aria-label="Select destination station"
                  >
                    <SelectTrigger className="bg-white/10 border-white/20">
                      <SelectValue placeholder="To" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATIONS.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {fromStation && <NextTrainsWidget station={fromStation} />}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fare Tab */}
          <TabsContent value="fare" className="space-y-6">
            <Card className="bg-white/5 border-white/10">
              <CardContent className="pt-4">
                <FareCalculator />
              </CardContent>
            </Card>
          </TabsContent>

          {/* More Tab */}
          <TabsContent value="more" className="space-y-6">
            {/* All Lines */}
            <section aria-label="All transport lines">
              <h2 className="font-semibold mb-3">All Lines</h2>
              <div className="grid grid-cols-2 gap-3">
                {(Object.entries(LINES) as [LineId, typeof LINES[LineId]][]).map(([id, line]) => {
                  const { status, alertCount } = getLineStatus(id);
                  return (
                    <Card
                      key={id}
                      className="bg-white/5 border-white/10 hover:bg-white/10 cursor-pointer transition-colors"
                    >
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: line.color }}
                            aria-hidden="true"
                          />
                          <span className="font-medium text-sm">{line.name}</span>
                          <StatusIndicator status={status} className="ml-auto" />
                        </div>
                        <div className="text-xs opacity-70 space-y-1">
                          <div>{line.endpoints.join(' ↔ ')}</div>
                          <div>{line.stations} stations • {line.length} km</div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>

            {/* Women's Safety */}
            <Card className="bg-white/5 border-white/10">
              <CardContent className="pt-4 space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Heart className="w-5 h-5 text-pink-400" aria-hidden="true" />
                  Women&apos;s Safety
                </h3>
                <p className="text-sm opacity-70">
                  Ladies special trains run during peak hours (7-11 AM & 5-9 PM).
                  First class compartments are reserved for women on all lines.
                </p>
              </CardContent>
            </Card>

            {/* Helplines */}
            <Card className="bg-white/5 border-white/10">
              <CardContent className="pt-4 space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Phone className="w-5 h-5 text-green-400" aria-hidden="true" />
                  Helplines
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Railway Helpline</span>
                    <span className="font-mono">139</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Security Helpline</span>
                    <span className="font-mono">182</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Women Helpline</span>
                    <span className="font-mono">1091</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Bottom Navigation */}
      <nav
        className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-white/10 safe-area-pb"
        aria-label="Main navigation"
      >
        <TabsList className="grid w-full grid-cols-4 h-16 bg-transparent" role="tablist">
          <TabsTrigger
            value="home"
            className="flex flex-col gap-1 data-[state=active]:text-cyan-400"
            role="tab"
            aria-selected={activeTab === 'home'}
          >
            <Zap className="w-5 h-5" aria-hidden="true" />
            <span className="text-xs">Home</span>
          </TabsTrigger>
          <TabsTrigger
            value="trains"
            className="flex flex-col gap-1 data-[state=active]:text-cyan-400"
            role="tab"
            aria-selected={activeTab === 'trains'}
          >
            <Train className="w-5 h-5" aria-hidden="true" />
            <span className="text-xs">Trains</span>
          </TabsTrigger>
          <TabsTrigger
            value="fare"
            className="flex flex-col gap-1 data-[state=active]:text-cyan-400"
            role="tab"
            aria-selected={activeTab === 'fare'}
          >
            <Ticket className="w-5 h-5" aria-hidden="true" />
            <span className="text-xs">Fare</span>
          </TabsTrigger>
          <TabsTrigger
            value="more"
            className="flex flex-col gap-1 data-[state=active]:text-cyan-400"
            role="tab"
            aria-selected={activeTab === 'more'}
          >
            <Route className="w-5 h-5" aria-hidden="true" />
            <span className="text-xs">More</span>
          </TabsTrigger>
        </TabsList>
      </nav>
    </div>
  );
}
