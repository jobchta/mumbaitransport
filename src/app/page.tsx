/**
 * MumbaiLocal - Main Page
 * 
 * Feature-rich Mumbai transport application with:
 * - Real-time alerts
 * - Journey planner
 * - Fare calculator
 * - Crowd reporting
 * - Favorites & history
 * - Station finder
 * - Weather info
 * - Trip sharing
 */

'use client';

import { useState, useEffect, useMemo, useCallback, useSyncExternalStore } from 'react';
import {
  Train, Clock, Users, AlertTriangle, CheckCircle2, XCircle,
  RefreshCw, ArrowRight, ChevronRight, MapPin, Wifi, WifiOff,
  Navigation, Zap, Route, Search, Ticket, Accessibility,
  Heart, Phone, Share2, Star, History, Settings, Home,
  Briefcase, TrendingUp, Bell, Moon, Sun, Map, ExternalLink,
  Building2, Camera, ThumbsUp, Info, ChevronDown, X, Plus,
  Bookmark, Clock3, TrainFront, CircleDot, AlertCircle, Copy,
  Check, Twitter, MessageCircle, Filter, SortAsc, Eye, EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useLiveAlerts, getLineColor } from '@/hooks/useLiveAlerts';
import { calculateCrowdLevel, getCrowdColorClass } from '@/hooks/useCrowdLevel';
import {
  STATIONS, LINES, calculateFare, getNextTrains, findRoutes,
  getTransportStats, searchStations, getStationsByLine
} from '@/lib/transport/data';
import {
  getFavoriteStations, addFavoriteStation, removeFavoriteStation,
  getFavoriteRoutes, addFavoriteRoute, removeFavoriteRoute,
  getTripHistory, addTripToHistory, getUserStats,
  generateShareCode, saveCrowdReport, getLastCrowdReport
} from '@/lib/storage';
import {
  STATION_LIST_CONFIG, LINE_COLORS, LINE_COLOR_CLASSES,
  LINE_TEXT_COLORS, LINE_BG_COLORS, TRAIN_TYPE_CONFIG,
  QUICK_ACTIONS, HELPLINES, APP_CONFIG, UI_CONFIG
} from '@/lib/utils/constants';
import type { Station, TrainType, LineId, Alert, LineStatus } from '@/types';

// ============================================================================
// Utility Functions
// ============================================================================

function useIsMounted(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' });
}

function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

// ============================================================================
// UI Components
// ============================================================================

function TimeDisplay() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="text-center">
      <div className="text-4xl font-bold tracking-tight">{formatTime(time)}</div>
      <div className="text-sm opacity-70">{formatDate(time)}</div>
    </div>
  );
}

function TrainTypeBadge({ type }: { type: TrainType }) {
  const config = TRAIN_TYPE_CONFIG[type] || TRAIN_TYPE_CONFIG.slow;
  return (
    <span className={`${config.color} text-white text-xs px-2 py-0.5 rounded font-bold`} title={config.description}>
      {config.label}
    </span>
  );
}

function StatusBadge({ status }: { status: 'normal' | 'delayed' | 'suspended' }) {
  const config = {
    normal: { icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/20', label: 'Normal' },
    delayed: { icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-500/20', label: 'Delayed' },
    suspended: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/20', label: 'Suspended' },
  };
  const { icon: Icon, color, bg, label } = config[status];

  return (
    <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${bg}`}>
      <Icon className={`w-3 h-3 ${color}`} />
      <span className={`text-xs font-medium ${color}`}>{label}</span>
    </div>
  );
}

function CrowdMeter({ percentage, showLabel = true }: { percentage: number; showLabel?: boolean }) {
  const level = percentage >= 70 ? 'high' : percentage >= 40 ? 'medium' : 'low';
  const levelText = { low: 'Low', medium: 'Moderate', high: 'Crowded' };
  const colorClass = getCrowdColorClass(percentage);

  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-2 bg-white/10 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${colorClass}`} style={{ width: `${percentage}%` }} />
      </div>
      {showLabel && (
        <span className="text-xs opacity-70">{percentage}% · {levelText[level]}</span>
      )}
    </div>
  );
}

// ============================================================================
// Feature Components
// ============================================================================

function QuickActionsBar({ onAction }: { onAction: (id: string) => void }) {
  const stats = getUserStats();

  return (
    <div className="grid grid-cols-4 gap-2">
      {QUICK_ACTIONS.map((action) => {
        const Icon = action.icon === 'Home' ? Home : action.icon === 'Moon' ? Moon : action.icon === 'MapPin' ? MapPin : Star;
        return (
          <button
            key={action.id}
            onClick={() => onAction(action.id)}
            className="flex flex-col items-center gap-1 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
          >
            <Icon className="w-5 h-5 text-cyan-400" />
            <span className="text-xs text-center">{action.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function NextTrainsWidget({ station, limit = 5 }: { station: Station | null; limit?: number }) {
  const trains = useMemo(
    () => (station ? getNextTrains(station, null, limit) : []),
    [station, limit]
  );

  if (!station) return null;

  const line = LINES[station.line];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-500" />
          Next Trains
        </h3>
        <span className="text-xs opacity-50">{line?.frequency} frequency</span>
      </div>

      {trains.length === 0 ? (
        <p className="text-sm opacity-70 text-center py-4">No upcoming trains</p>
      ) : (
        <div className="space-y-1">
          {trains.map((train) => (
            <div
              key={train.id}
              className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="text-center">
                  <div className="text-2xl font-bold font-mono">{train.departure}</div>
                  <div className="text-xs opacity-50">Depart</div>
                </div>
                <div className="flex flex-col gap-1">
                  <TrainTypeBadge type={train.type} />
                  {train.platform && (
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded">Pl. {train.platform}</span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">→ {train.to}</div>
                <div className="text-xs opacity-50">Arr {train.arrival}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FareCalculator() {
  const [fromStation, setFromStation] = useState<Station | null>(null);
  const [toStation, setToStation] = useState<Station | null>(null);

  const fare = useMemo(
    () => (fromStation && toStation ? calculateFare(fromStation, toStation) : null),
    [fromStation, toStation]
  );

  const handleSwap = useCallback(() => {
    const temp = fromStation;
    setFromStation(toStation);
    setToStation(temp);
  }, [fromStation, toStation]);

  const handleSave = useCallback(() => {
    if (fromStation && toStation) {
      addFavoriteRoute(fromStation.id, toStation.id, fromStation.name, toStation.name);
    }
  }, [fromStation, toStation]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Ticket className="w-5 h-5 text-green-500" />
          Fare Calculator
        </h3>
        {fare && (
          <Button variant="ghost" size="sm" onClick={handleSave}>
            <Bookmark className="w-4 h-4 mr-1" /> Save Route
          </Button>
        )}
      </div>

      <div className="grid grid-cols-[1fr,auto,1fr] gap-2 items-center">
        <Select onValueChange={(v) => setFromStation(STATIONS.find(s => s.id === v) || null)}>
          <SelectTrigger className="bg-white/10 border-white/20">
            <SelectValue placeholder="From Station" />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-white/20 max-h-60">
            {STATIONS.map(s => (
              <SelectItem key={s.id} value={s.id} className="hover:bg-white/10">
                {s.name} <span className="opacity-50">({s.line})</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="ghost" size="icon" onClick={handleSwap} className="shrink-0">
          <ArrowRight className="w-4 h-4" />
        </Button>

        <Select onValueChange={(v) => setToStation(STATIONS.find(s => s.id === v) || null)}>
          <SelectTrigger className="bg-white/10 border-white/20">
            <SelectValue placeholder="To Station" />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-white/20 max-h-60">
            {STATIONS.map(s => (
              <SelectItem key={s.id} value={s.id} className="hover:bg-white/10">
                {s.name} <span className="opacity-50">({s.line})</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {fare ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-gradient-to-br from-green-500/20 to-blue-500/20 border border-white/10">
          <div>
            <div className="text-xs opacity-70 mb-1">Distance</div>
            <div className="text-xl font-bold">{fare.distance} km</div>
          </div>
          <div>
            <div className="text-xs opacity-70 mb-1">Second Class</div>
            <div className="text-xl font-bold text-green-400">₹{fare.secondClass}</div>
          </div>
          <div>
            <div className="text-xs opacity-70 mb-1">First Class</div>
            <div className="text-xl font-bold">₹{fare.firstClass}</div>
          </div>
          <div>
            <div className="text-xs opacity-70 mb-1">Monthly Pass</div>
            <div className="text-xl font-bold">₹{fare.monthly}</div>
          </div>
        </div>
      ) : fromStation && toStation ? (
        <div className="p-4 rounded-xl bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 text-sm">
          <AlertCircle className="w-4 h-4 inline mr-2" />
          Stations are on non-connected lines. Transfer required.
        </div>
      ) : null}
    </div>
  );
}

function JourneyPlanner() {
  const [fromStation, setFromStation] = useState<Station | null>(null);
  const [toStation, setToStation] = useState<Station | null>(null);
  const [routes, setRoutes] = useState<ReturnType<typeof findRoutes>>([]);

  const handleSearch = useCallback(() => {
    if (fromStation && toStation) {
      const foundRoutes = findRoutes(fromStation, toStation);
      setRoutes(foundRoutes);
      addTripToHistory(fromStation.id, toStation.id, fromStation.name, toStation.name, fromStation.line);
    }
  }, [fromStation, toStation]);

  useEffect(() => {
    if (fromStation && toStation) {
      handleSearch();
    }
  }, [fromStation, toStation, handleSearch]);

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg flex items-center gap-2">
        <Navigation className="w-5 h-5 text-cyan-500" />
        Journey Planner
      </h3>

      <div className="grid grid-cols-[1fr,auto,1fr] gap-2 items-center">
        <Select onValueChange={(v) => setFromStation(STATIONS.find(s => s.id === v) || null)}>
          <SelectTrigger className="bg-white/10 border-white/20">
            <SelectValue placeholder="Start Station" />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-white/20 max-h-60">
            {STATIONS.map(s => (
              <SelectItem key={`from-${s.id}`} value={s.id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <ArrowRight className="w-4 h-4 opacity-50" />

        <Select onValueChange={(v) => setToStation(STATIONS.find(s => s.id === v) || null)}>
          <SelectTrigger className="bg-white/10 border-white/20">
            <SelectValue placeholder="End Station" />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-white/20 max-h-60">
            {STATIONS.map(s => (
              <SelectItem key={`to-${s.id}`} value={s.id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {routes.length > 0 && (
        <div className="space-y-3">
          {routes.map((route, idx) => (
            <div key={route.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{route.totalTime} min</span>
                  <span className="text-sm opacity-50">· {route.totalDistance} km</span>
                </div>
                <div className="flex items-center gap-2">
                  {route.transfers > 0 && (
                    <Badge variant="outline" className="border-white/20">{route.transfers} transfer</Badge>
                  )}
                  <Badge className="bg-green-500/50">₹{route.fare.secondClass}</Badge>
                </div>
              </div>
              
              <div className="space-y-2">
                {route.legs.map((leg, legIdx) => (
                  <div key={legIdx} className="flex items-center gap-2 text-sm">
                    <div className={`w-3 h-3 rounded-full ${LINE_COLOR_CLASSES[leg.line]}`} />
                    <span>{leg.from.name}</span>
                    <ArrowRight className="w-3 h-3 opacity-50" />
                    <span>{leg.to.name}</span>
                    <span className="opacity-50 text-xs ml-auto">{leg.duration} min</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function LineStatusCard({ lineId, status, alertCount, onClick }: {
  lineId: LineId;
  status: 'normal' | 'delayed' | 'suspended';
  alertCount: number;
  onClick?: () => void;
}) {
  const line = LINES[lineId];
  if (!line) return null;

  return (
    <div
      onClick={onClick}
      className={`relative p-4 rounded-xl ${LINE_BG_COLORS[lineId]} border border-white/10 hover:border-white/30 transition-all cursor-pointer group`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: line.color }} />
          <span className="font-semibold text-sm">{line.name}</span>
        </div>
        <StatusBadge status={status} />
      </div>
      <div className="flex items-center gap-4 text-xs opacity-70">
        <span>{line.firstTrain} - {line.lastTrain}</span>
        <span>{line.frequency}</span>
      </div>
      {alertCount > 0 && (
        <Badge className="mt-2 bg-red-500/50 text-white text-xs">
          {alertCount} alert{alertCount > 1 ? 's' : ''}
        </Badge>
      )}
      <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 top-1/2 -translate-y-1/2" />
    </div>
  );
}

function StationCard({ station, onSelect, isFavorite, onToggleFavorite }: {
  station: Station;
  onSelect: (station: Station) => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}) {
  const crowd = calculateCrowdLevel(station.id);

  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5 group">
      <button
        onClick={() => onSelect(station)}
        className="flex items-center gap-3 flex-1 text-left"
      >
        <div className={`w-3 h-3 rounded-full ${getLineColor(station.line)}`} />
        <div>
          <div className="font-medium">{station.name}</div>
          <div className="text-xs opacity-50">{station.zone} · {station.platforms} platforms</div>
        </div>
      </button>
      <div className="flex items-center gap-2">
        <CrowdMeter percentage={crowd.percentage} showLabel={false} />
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Star className={`w-4 h-4 ${isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
        </button>
      </div>
    </div>
  );
}

function FavoritesPanel({ onSelectStation }: { onSelectStation: (station: Station) => void }) {
  const favStations = getFavoriteStations();
  const favRoutes = getFavoriteRoutes();

  return (
    <div className="space-y-4">
      <h3 className="font-semibold flex items-center gap-2">
        <Star className="w-5 h-5 text-yellow-400" />
        Favorites
      </h3>

      {favStations.length > 0 && (
        <div>
          <div className="text-sm opacity-70 mb-2">Stations</div>
          <div className="space-y-2">
            {favStations.map(fav => {
              const station = STATIONS.find(s => s.id === fav.stationId);
              if (!station) return null;
              return (
                <button
                  key={fav.stationId}
                  onClick={() => onSelectStation(station)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 text-left"
                >
                  <div className={`w-3 h-3 rounded-full ${getLineColor(station.line)}`} />
                  <span>{station.name}</span>
                  {fav.nickname && <span className="text-xs opacity-50">({fav.nickname})</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {favRoutes.length > 0 && (
        <div>
          <div className="text-sm opacity-70 mb-2">Routes</div>
          <div className="space-y-2">
            {favRoutes.map(route => (
              <button
                key={route.id}
                className="w-full flex items-center gap-2 p-3 rounded-lg bg-white/5 hover:bg-white/10 text-left"
              >
                <Route className="w-4 h-4 text-cyan-400" />
                <span>{route.from?.name || 'Unknown'}</span>
                <ArrowRight className="w-3 h-3 opacity-50" />
                <span>{route.to?.name || 'Unknown'}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {favStations.length === 0 && favRoutes.length === 0 && (
        <div className="text-center py-8 opacity-70">
          <Star className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <p>No favorites yet</p>
          <p className="text-sm">Star stations and routes for quick access</p>
        </div>
      )}
    </div>
  );
}

function TripHistoryPanel({ onSelectStation }: { onSelectStation: (station: Station) => void }) {
  const history = getTripHistory(10);

  return (
    <div className="space-y-4">
      <h3 className="font-semibold flex items-center gap-2">
        <History className="w-5 h-5 text-purple-400" />
        Recent Trips
      </h3>

      {history.length > 0 ? (
        <div className="space-y-2">
          {history.map(trip => (
            <div key={trip.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${LINE_COLOR_CLASSES[trip.line]}`} />
                <span className="text-sm">{trip.from?.name || 'Unknown'}</span>
                <ArrowRight className="w-3 h-3 opacity-50" />
                <span className="text-sm">{trip.to?.name || 'Unknown'}</span>
              </div>
              <span className="text-xs opacity-50">{formatRelativeTime(trip.timestamp)}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 opacity-70">
          <History className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <p>No trips recorded</p>
        </div>
      )}
    </div>
  );
}

function HelplineSection() {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold flex items-center gap-2">
        <Phone className="w-5 h-5 text-green-400" />
        Emergency Helplines
      </h3>
      
      <div className="grid grid-cols-2 gap-2">
        {HELPLINES.map(h => (
          <a
            key={h.number}
            href={`tel:${h.number}`}
            className="flex items-center gap-2 p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10"
          >
            <Phone className="w-4 h-4 text-green-400" />
            <div>
              <div className="font-mono text-lg">{h.number}</div>
              <div className="text-xs opacity-50">{h.name}</div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

function StatsPanel() {
  const stats = getTransportStats();
  const userStats = getUserStats();

  return (
    <div className="space-y-4">
      <h3 className="font-semibold flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-cyan-400" />
        Statistics
      </h3>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="text-2xl font-bold">{stats.totalStations}</div>
          <div className="text-xs opacity-50">Total Stations</div>
        </div>
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="text-2xl font-bold">{stats.totalLines}</div>
          <div className="text-xs opacity-50">Lines</div>
        </div>
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="text-2xl font-bold">{stats.totalDistance} km</div>
          <div className="text-xs opacity-50">Network Length</div>
        </div>
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="text-2xl font-bold">{(stats.dailyRidership / 1000000).toFixed(1)}M</div>
          <div className="text-xs opacity-50">Daily Ridership</div>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-white/10">
        <div className="text-sm opacity-70 mb-2">Your Activity</div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xl font-bold">{userStats.totalTrips}</div>
            <div className="text-xs opacity-50">Trips Recorded</div>
          </div>
          <div>
            <div className="text-xl font-bold">{userStats.favoriteCount}</div>
            <div className="text-xs opacity-50">Favorites</div>
          </div>
          <div>
            <div className="text-xl font-bold">{userStats.routeCount}</div>
            <div className="text-xs opacity-50">Saved Routes</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Main Page Component
// ============================================================================

export default function Home() {
  const mounted = useIsMounted();
  const [activeTab, setActiveTab] = useState('home');
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  const { alerts, serverConnected, stats, forceRefresh, isLoading, lineStatuses } = useLiveAlerts();

  // Load favorites
  useEffect(() => {
    const favs = getFavoriteStations();
    setFavoriteIds(new Set(favs.map(f => f.stationId)));
  }, []);

  // Filter stations
  const filteredStations = useMemo(() => {
    if (!searchQuery) return STATIONS.slice(0, STATION_LIST_CONFIG.DEFAULT_DISPLAY_COUNT);
    return searchStations(searchQuery);
  }, [searchQuery]);

  // Get line status
  const getLineStatus = useCallback(
    (lineId: LineId): { status: 'normal' | 'delayed' | 'suspended'; alertCount: number } => {
      const status = lineStatuses.find(s => s.lineId === lineId);
      return status ? { status: status.status, alertCount: status.alertCount } : { status: 'normal', alertCount: 0 };
    },
    [lineStatuses]
  );

  // Toggle favorite
  const toggleFavorite = useCallback((stationId: string) => {
    if (favoriteIds.has(stationId)) {
      removeFavoriteStation(stationId);
      setFavoriteIds(prev => { const next = new Set(prev); next.delete(stationId); return next; });
    } else {
      addFavoriteStation(stationId);
      setFavoriteIds(prev => new Set(prev).add(stationId));
    }
  }, [favoriteIds]);

  // Handle quick action
  const handleQuickAction = useCallback((id: string) => {
    switch (id) {
      case 'favorites':
        setActiveTab('more');
        break;
      case 'nearby':
        setShowSearch(true);
        break;
      case 'last-train':
        setActiveTab('trains');
        break;
      default:
        break;
    }
  }, []);

  // Dark mode
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white flex items-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin" />
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white pb-20">
      {/* Skip Link */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-white focus:text-black focus:p-2 focus:rounded">
        Skip to main content
      </a>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
                <Train className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-lg font-bold">{APP_CONFIG.name}</h1>
                <div className="flex items-center gap-1 text-xs">
                  {serverConnected ? (
                    <><Wifi className="w-3 h-3 text-green-400" /> <span className="text-green-400">Live</span></>
                  ) : (
                    <><WifiOff className="w-3 h-3 text-yellow-400" /> <span className="text-yellow-400">Offline</span></>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => setShowSearch(!showSearch)} aria-label="Search">
                <Search className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => forceRefresh()} disabled={isLoading} aria-label="Refresh">
                <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          {showSearch && (
            <div className="mt-3 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-50" />
              <Input
                placeholder="Search stations, lines, routes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 bg-white/10 border-white/20 rounded-xl"
                autoFocus
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setSearchQuery(''); setShowSearch(false); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" className="max-w-lg mx-auto px-4 py-6 space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Home Tab */}
          <TabsContent value="home" className="space-y-6">
            {/* Time */}
            <Card className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border-white/10">
              <CardContent className="pt-6">
                <TimeDisplay />
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <QuickActionsBar onAction={handleQuickAction} />

            {/* Alerts */}
            {alerts.length > 0 && (
              <Card className="bg-red-500/20 border-red-500/50">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    <span className="font-semibold">Active Alerts ({stats.alertCount})</span>
                  </div>
                  {alerts.slice(0, 3).map(alert => (
                    <div key={alert.id} className="p-3 rounded-lg bg-white/5 mb-2">
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-2 h-2 rounded-full ${getLineColor(alert.lineId)}`} />
                        <span className="font-medium text-sm">{alert.title}</span>
                        <Badge className={`text-xs ${alert.severity === 'critical' ? 'bg-red-600' : alert.severity === 'high' ? 'bg-orange-500' : 'bg-yellow-500'}`}>
                          {alert.severity}
                        </Badge>
                      </div>
                      <p className="text-sm opacity-70">{alert.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Line Status */}
            <section>
              <h2 className="font-semibold mb-3 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                Line Status
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {(Object.keys(LINES) as LineId[]).slice(0, 4).map(lineId => {
                  const { status, alertCount } = getLineStatus(lineId);
                  return (
                    <LineStatusCard
                      key={lineId}
                      lineId={lineId}
                      status={status}
                      alertCount={alertCount}
                      onClick={() => setActiveTab('more')}
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
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleFavorite(selectedStation.id)}
                      >
                        <Star className={`w-5 h-5 ${favoriteIds.has(selectedStation.id) ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedStation(null)}>
                        Close
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {selectedStation.zone}</span>
                    <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {selectedStation.platforms} platforms</span>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {selectedStation.facilities.map(f => (
                      <Badge key={f} variant="outline" className="border-white/20">{f}</Badge>
                    ))}
                  </div>

                  {selectedStation.wheelchair && (
                    <div className="flex items-center gap-2 text-green-400">
                      <Accessibility className="w-4 h-4" />
                      <span className="text-sm">Wheelchair accessible</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm">
                    <span>Crowd:</span>
                    <CrowdMeter percentage={calculateCrowdLevel(selectedStation.id).percentage} />
                  </div>

                  <NextTrainsWidget station={selectedStation} />
                </CardContent>
              </Card>
            ) : (
              <section>
                <h2 className="font-semibold flex items-center gap-2 mb-3">
                  <MapPin className="w-5 h-5 text-blue-400" />
                  Stations
                </h2>
                <div className="space-y-2">
                  {filteredStations.map(station => (
                    <StationCard
                      key={station.id}
                      station={station}
                      onSelect={setSelectedStation}
                      isFavorite={favoriteIds.has(station.id)}
                      onToggleFavorite={() => toggleFavorite(station.id)}
                    />
                  ))}
                </div>
              </section>
            )}
          </TabsContent>

          {/* Trains Tab */}
          <TabsContent value="trains" className="space-y-6">
            <JourneyPlanner />
            <FareCalculator />
          </TabsContent>

          {/* Fare Tab */}
          <TabsContent value="fare" className="space-y-6">
            <FareCalculator />
            <TripHistoryPanel onSelectStation={setSelectedStation} />
          </TabsContent>

          {/* More Tab */}
          <TabsContent value="more" className="space-y-6">
            {/* All Lines */}
            <section>
              <h2 className="font-semibold mb-3">All Lines</h2>
              <div className="grid grid-cols-2 gap-3">
                {(Object.entries(LINES) as [LineId, typeof LINES[LineId]][]).map(([id, line]) => {
                  const { status, alertCount } = getLineStatus(id);
                  return (
                    <Card key={id} className="bg-white/5 border-white/10">
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: line.color }} />
                          <span className="font-medium text-sm">{line.name}</span>
                          <StatusBadge status={status} />
                        </div>
                        <div className="text-xs opacity-70 space-y-1">
                          <div>{line.endpoints.join(' ↔ ')}</div>
                          <div>{line.stations} stations · {line.length} km</div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>

            <FavoritesPanel onSelectStation={setSelectedStation} />
            <StatsPanel />
            <HelplineSection />

            {/* App Info */}
            <Card className="bg-white/5 border-white/10">
              <CardContent className="pt-4 space-y-2 text-center">
                <div className="text-sm opacity-50">{APP_CONFIG.name} v{APP_CONFIG.version}</div>
                <a href={APP_CONFIG.github} className="text-xs text-cyan-400 hover:underline flex items-center justify-center gap-1">
                  <ExternalLink className="w-3 h-3" /> View on GitHub
                </a>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-white/10 safe-area-pb">
        <TabsList className="grid w-full grid-cols-4 h-16 bg-transparent">
          <TabsTrigger value="home" className="flex flex-col gap-1 data-[state=active]:text-cyan-400">
            <Zap className="w-5 h-5" />
            <span className="text-xs">Home</span>
          </TabsTrigger>
          <TabsTrigger value="trains" className="flex flex-col gap-1 data-[state=active]:text-cyan-400">
            <Navigation className="w-5 h-5" />
            <span className="text-xs">Trains</span>
          </TabsTrigger>
          <TabsTrigger value="fare" className="flex flex-col gap-1 data-[state=active]:text-cyan-400">
            <Ticket className="w-5 h-5" />
            <span className="text-xs">Fare</span>
          </TabsTrigger>
          <TabsTrigger value="more" className="flex flex-col gap-1 data-[state=active]:text-cyan-400">
            <Route className="w-5 h-5" />
            <span className="text-xs">More</span>
          </TabsTrigger>
        </TabsList>
      </nav>
    </div>
  );
}
