'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { 
  Train, Clock, Users, AlertTriangle, CheckCircle2, XCircle,
  RefreshCw, ArrowRight, ChevronRight, MapPin,
  Wifi, WifiOff, Navigation, Zap, Route, Search,
  Ticket, Accessibility, Heart, Phone
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { useLiveAlerts, getLineColor, getSeverityColor } from '@/hooks/useLiveAlerts'
import { STATIONS, LINES, calculateFare, getNextTrains, type Station, type TrainSchedule, type Fare } from '@/lib/transport/data'

// Current time display
function TimeDisplay() {
  const [time, setTime] = useState(new Date())
  
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])
  
  const formatTime = (d: Date) => d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  const formatDate = (d: Date) => d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })
  
  return (
    <div className="text-center">
      <div className="text-4xl font-bold tracking-tight">{formatTime(time)}</div>
      <div className="text-sm opacity-70">{formatDate(time)}</div>
    </div>
  )
}

// Train type badge
function TrainTypeBadge({ type }: { type: TrainSchedule['type'] }) {
  const config = {
    slow: { color: 'bg-slate-500', label: 'S' },
    fast: { color: 'bg-red-500', label: 'F' },
    'semi-fast': { color: 'bg-orange-500', label: 'SF' },
    ladies: { color: 'bg-pink-500', label: '👩' },
  }
  const { color, label } = config[type] || config.slow
  return (
    <span className={`${color} text-white text-xs px-2 py-0.5 rounded font-bold`}>
      {label}
    </span>
  )
}

// Next trains component
function NextTrainsWidget({ station }: { station: Station | null }) {
  const trains = useMemo(() => 
    station ? getNextTrains(station, null, 5) : [], 
    [station]
  )
  
  if (!station) return null
  
  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-lg flex items-center gap-2">
        <Clock className="w-5 h-5 text-blue-500" />
        Next Trains from {station.name}
      </h3>
      <div className="space-y-1">
        {trains.map((train) => (
          <div key={train.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/10">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold font-mono">{train.departure}</span>
              <TrainTypeBadge type={train.type} />
              {train.platform && (
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded">Pl. {train.platform}</span>
              )}
            </div>
            <div className="text-right text-sm opacity-70">
              <div>→ {train.to}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Fare calculator
function FareCalculator() {
  const [fromStation, setFromStation] = useState<Station | null>(null)
  const [toStation, setToStation] = useState<Station | null>(null)
  
  const fare = useMemo(() => 
    fromStation && toStation ? calculateFare(fromStation, toStation) : null,
    [fromStation, toStation]
  )
  
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg flex items-center gap-2">
        <Ticket className="w-5 h-5 text-green-500" />
        Fare Calculator
      </h3>
      
      <div className="grid grid-cols-2 gap-3">
        <Select onValueChange={(v) => setFromStation(STATIONS.find(s => s.id === v) || null)}>
          <SelectTrigger className="bg-white/10 border-white/20">
            <SelectValue placeholder="From Station" />
          </SelectTrigger>
          <SelectContent>
            {STATIONS.map(s => (
              <SelectItem key={s.id} value={s.id}>{s.name} ({s.line})</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select onValueChange={(v) => setToStation(STATIONS.find(s => s.id === v) || null)}>
          <SelectTrigger className="bg-white/10 border-white/20">
            <SelectValue placeholder="To Station" />
          </SelectTrigger>
          <SelectContent>
            {STATIONS.map(s => (
              <SelectItem key={s.id} value={s.id}>{s.name} ({s.line})</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {fare && (
        <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-gradient-to-br from-green-500/20 to-blue-500/20 border border-white/10">
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
  )
}

// Line status card
function LineStatusCard({ lineId, status, alertCount }: { lineId: string; status: string; alertCount: number }) {
  const line = LINES[lineId as keyof typeof LINES]
  if (!line) return null
  
  const statusConfig = {
    normal: { icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/20' },
    delayed: { icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
    suspended: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/20' },
  }
  const { icon: StatusIcon, color, bg } = statusConfig[status as keyof typeof statusConfig] || statusConfig.normal
  
  return (
    <div className={`p-4 rounded-xl ${bg} border border-white/10 hover:border-white/30 transition-all cursor-pointer group`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: line.color }}></div>
          <span className="font-semibold">{line.name}</span>
        </div>
        <StatusIcon className={`w-5 h-5 ${color}`} />
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
      <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 top-1/2 -translate-y-1/2" />
    </div>
  )
}

// Main page
export default function Home() {
  const [darkMode, setDarkMode] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState('home')
  const [selectedStation, setSelectedStation] = useState<Station | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [fromStation, setFromStation] = useState<Station | null>(null)
  const [toStation, setToStation] = useState<Station | null>(null)
  
  const { alerts, serverConnected, stats, refetch, forceRefresh, isLoading } = useLiveAlerts()
  
  // Get line status
  const getLineStatus = (lineId: string): { status: string; alertCount: number } => {
    const lineAlerts = alerts.filter(a => 
      a.lineId === lineId || a.line.toLowerCase().includes(lineId.toLowerCase())
    )
    return {
      status: lineAlerts.length === 0 ? 'normal' : 
              lineAlerts.some(a => a.severity === 'critical') ? 'suspended' : 'delayed',
      alertCount: lineAlerts.length
    }
  }
  
  // Filter stations
  const filteredStations = useMemo(() => {
    if (!searchQuery) return STATIONS.slice(0, 20)
    return STATIONS.filter(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nameHi.includes(searchQuery)
    ).slice(0, 20)
  }, [searchQuery])
  
  // Crowd simulation
  const getCrowdLevel = (stationId: string): number => {
    const hour = new Date().getHours()
    let base = 30
    if (hour >= 8 && hour <= 11) base = 75 + Math.random() * 20
    else if (hour >= 17 && hour <= 21) base = 70 + Math.random() * 25
    else if (hour >= 22 || hour <= 5) base = 10 + Math.random() * 15
    else base = 30 + Math.random() * 30
    return Math.round(base)
  }
  
  useEffect(() => {
    setMounted(true)
    document.documentElement.classList.add('dark')
  }, [])
  
  if (!mounted) return null
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
                <Train className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-lg font-bold">MumbaiLocal</h1>
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
              <Button variant="ghost" size="icon" onClick={() => forceRefresh()} disabled={isLoading}>
                <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="home" className="space-y-6">
            {/* Time & Quick Actions */}
            <Card className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border-white/10">
              <CardContent className="pt-6">
                <TimeDisplay />
              </CardContent>
            </Card>
            
            {/* Quick Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-50" />
              <Input 
                placeholder="Search station or route..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 bg-white/10 border-white/20 rounded-xl"
              />
            </div>
            
            {/* Active Alerts */}
            {alerts.length > 0 && (
              <Card className="bg-red-500/20 border-red-500/50">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    <span className="font-semibold">Active Alerts ({alerts.length})</span>
                  </div>
                  {alerts.slice(0, 2).map(alert => (
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
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                Line Status
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.keys(LINES).slice(0, 4).map(lineId => {
                  const { status, alertCount } = getLineStatus(lineId)
                  return <LineStatusCard key={lineId} lineId={lineId} status={status} alertCount={alertCount} />
                })}
              </div>
            </div>
            
            {/* Station Finder */}
            {selectedStation ? (
              <Card className="bg-white/5 border-white/10">
                <CardContent className="pt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold">{selectedStation.name}</h3>
                      <p className="text-sm opacity-70">{selectedStation.nameHi}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedStation(null)}>Close</Button>
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
                  
                  <NextTrainsWidget station={selectedStation} />
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-400" />
                  Nearby Stations
                </h3>
                {filteredStations.map(station => {
                  const crowd = getCrowdLevel(station.id)
                  return (
                    <div 
                      key={station.id}
                      onClick={() => setSelectedStation(station)}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer transition-colors border border-white/5"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${getLineColor(station.line)}`} />
                        <div>
                          <div className="font-medium">{station.name}</div>
                          <div className="text-xs opacity-50">{station.zone}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">{crowd}%</div>
                        <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${crowd > 70 ? 'bg-red-500' : crowd > 40 ? 'bg-yellow-500' : 'bg-green-500'}`}
                            style={{ width: `${crowd}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="trains" className="space-y-6">
            <Card className="bg-white/5 border-white/10">
              <CardContent className="pt-4 space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Navigation className="w-5 h-5 text-blue-500" />
                  Find Your Train
                </h3>
                
                <div className="grid grid-cols-[1fr,auto,1fr] gap-2 items-center">
                  <Select onValueChange={(v) => setFromStation(STATIONS.find(s => s.id === v) || null)}>
                    <SelectTrigger className="bg-white/10 border-white/20">
                      <SelectValue placeholder="From" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATIONS.map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Button variant="ghost" size="icon" className="shrink-0">
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                  
                  <Select onValueChange={(v) => setToStation(STATIONS.find(s => s.id === v) || null)}>
                    <SelectTrigger className="bg-white/10 border-white/20">
                      <SelectValue placeholder="To" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATIONS.map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {fromStation && <NextTrainsWidget station={fromStation} />}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="fare" className="space-y-6">
            <Card className="bg-white/5 border-white/10">
              <CardContent className="pt-4">
                <FareCalculator />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="more" className="space-y-6">
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(LINES).map(([id, line]) => {
                const { status, alertCount } = getLineStatus(id)
                return (
                  <Card key={id} className="bg-white/5 border-white/10 hover:bg-white/10 cursor-pointer transition-colors">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: line.color }} />
                        <span className="font-medium text-sm">{line.name}</span>
                      </div>
                      <div className="text-xs opacity-70 space-y-1">
                        <div>{line.endpoints.join(' ↔ ')}</div>
                        <div>{line.stations} stations • {line.length} km</div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
            
            <Card className="bg-white/5 border-white/10">
              <CardContent className="pt-4 space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Heart className="w-5 h-5 text-pink-400" />
                  Women&apos;s Safety
                </h3>
                <p className="text-sm opacity-70">
                  Ladies special trains run during peak hours (7-11 AM & 5-9 PM). 
                  First class compartments are reserved for women on all lines.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/5 border-white/10">
              <CardContent className="pt-4 space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Phone className="w-5 h-5 text-green-400" />
                  Helplines
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span>Railway Helpline</span><span className="font-mono">139</span></div>
                  <div className="flex justify-between"><span>Security Helpline</span><span className="font-mono">182</span></div>
                  <div className="flex justify-between"><span>Women Helpline</span><span className="font-mono">1091</span></div>
                </div>
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
            <Train className="w-5 h-5" />
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
  )
}
