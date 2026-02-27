/**
 * Application Constants
 * Centralized configuration values
 */

// ============================================================================
// Cache Configuration
// ============================================================================

export const CACHE_CONFIG = {
  /** Time-to-live for alert cache in milliseconds (5 minutes) */
  ALERTS_TTL_MS: 5 * 60 * 1000,
  /** Maximum number of alerts to process */
  MAX_ALERTS: 12,
  /** Number of search results per query */
  SEARCH_RESULTS_PER_QUERY: 3,
  /** Weather cache TTL (30 minutes) */
  WEATHER_TTL_MS: 30 * 60 * 1000,
} as const;

// ============================================================================
// Crowd Level Configuration
// ============================================================================

export const CROWD_THRESHOLDS = {
  /** Low crowd percentage threshold */
  LOW: 40,
  /** Medium crowd percentage threshold */
  MEDIUM: 70,
  /** Base crowd percentage during off-peak hours */
  BASE_OFF_PEAK: 30,
  /** Base crowd percentage during morning peak */
  BASE_MORNING_PEAK: 75,
  /** Base crowd percentage during evening peak */
  BASE_EVENING_PEAK: 70,
  /** Base crowd percentage during night hours */
  BASE_NIGHT: 10,
} as const;

// ============================================================================
// Time Constants
// ============================================================================

export const TIME_CONSTANTS = {
  /** Morning peak start hour */
  MORNING_PEAK_START: 8,
  /** Morning peak end hour */
  MORNING_PEAK_END: 11,
  /** Evening peak start hour */
  EVENING_PEAK_START: 17,
  /** Evening peak end hour */
  EVENING_PEAK_END: 21,
  /** Night start hour */
  NIGHT_START: 22,
  /** Night end hour */
  NIGHT_END: 5,
} as const;

// ============================================================================
// Fare Structure
// ============================================================================

export const FARE_STRUCTURE = {
  RAILWAY: {
    DISTANCE_BRACKETS: [2, 5, 10, 15, 20, 30, 40, 50, 60],
    SECOND_CLASS: [5, 10, 15, 20, 25, 30, 35, 40, 45, 50],
    FIRST_CLASS_MULTIPLIER: 10,
  },
  METRO: {
    DISTANCE_BRACKETS: [3, 6, 9, 12],
    BASE_FARES: [10, 20, 30, 40, 50],
    FIRST_CLASS_MULTIPLIER: 2,
  },
  /** Monthly pass multiplier */
  MONTHLY_MULTIPLIER: 50,
  /** Season pass multiplier */
  SEASON_MULTIPLIER: 120,
} as const;

// ============================================================================
// Schedule Configuration
// ============================================================================

export const SCHEDULE_CONFIG = {
  /** Default frequency for local trains in minutes */
  LOCAL_FREQUENCY_MIN: 3,
  /** Frequency for metro trains in minutes */
  METRO_FREQUENCY_MIN: 4,
  /** Frequency for monorail in minutes */
  MONORAIL_FREQUENCY_MIN: 10,
  /** Start hour for local trains */
  LOCAL_START_HOUR: 4,
  /** End hour for local trains */
  LOCAL_END_HOUR: 1,
  /** Start hour for metro */
  METRO_START_HOUR: 5,
  /** End hour for metro */
  METRO_END_HOUR: 23,
} as const;

// ============================================================================
// Station List Configuration
// ============================================================================

export const STATION_LIST_CONFIG = {
  /** Maximum stations to display without search */
  DEFAULT_DISPLAY_COUNT: 20,
  /** Travel time per kilometer in minutes */
  TRAVEL_TIME_PER_KM_MIN: 2,
} as const;

// ============================================================================
// Rate Limiting
// ============================================================================

export const RATE_LIMIT_CONFIG = {
  /** Window size in milliseconds (1 minute) */
  WINDOW_MS: 60 * 1000,
  /** Maximum requests per window */
  MAX_REQUESTS: 10,
  /** Maximum crowd reports per hour */
  MAX_CROWD_REPORTS_PER_HOUR: 5,
} as const;

// ============================================================================
// Line Colors
// ============================================================================

export const LINE_COLORS: Record<string, string> = {
  western: '#3B82F6',        // Blue
  central: '#EF4444',        // Red
  harbour: '#F59E0B',        // Amber
  'trans-harbour': '#8B5CF6', // Violet
  'metro-1': '#EC4899',      // Pink
  'metro-2a': '#FBBF24',     // Yellow
  'metro-7': '#10B981',      // Emerald
  monorail: '#22C55E',       // Green
};

export const LINE_COLOR_CLASSES: Record<string, string> = {
  western: 'bg-blue-500',
  central: 'bg-red-500',
  harbour: 'bg-yellow-500',
  'trans-harbour': 'bg-violet-500',
  'metro-1': 'bg-pink-500',
  'metro-2a': 'bg-yellow-400',
  'metro-7': 'bg-emerald-500',
  monorail: 'bg-green-500',
};

export const LINE_TEXT_COLORS: Record<string, string> = {
  western: 'text-blue-500',
  central: 'text-red-500',
  harbour: 'text-yellow-500',
  'trans-harbour': 'text-violet-500',
  'metro-1': 'text-pink-500',
  'metro-2a': 'text-yellow-400',
  'metro-7': 'text-emerald-500',
  monorail: 'text-green-500',
};

export const LINE_BG_COLORS: Record<string, string> = {
  western: 'bg-blue-500/20',
  central: 'bg-red-500/20',
  harbour: 'bg-yellow-500/20',
  'trans-harbour': 'bg-violet-500/20',
  'metro-1': 'bg-pink-500/20',
  'metro-2a': 'bg-yellow-400/20',
  'metro-7': 'bg-emerald-500/20',
  monorail: 'bg-green-500/20',
};

// ============================================================================
// Severity Colors
// ============================================================================

export const SEVERITY_COLOR_CLASSES: Record<string, string> = {
  critical: 'bg-red-600',
  high: 'bg-orange-500',
  medium: 'bg-yellow-500',
  low: 'bg-blue-500',
};

// ============================================================================
// Status Configuration
// ============================================================================

export const STATUS_CONFIG = {
  normal: { icon: 'CheckCircle2', color: 'text-green-400', bg: 'bg-green-500/20', label: 'Normal' },
  delayed: { icon: 'AlertTriangle', color: 'text-yellow-400', bg: 'bg-yellow-500/20', label: 'Delayed' },
  suspended: { icon: 'XCircle', color: 'text-red-400', bg: 'bg-red-500/20', label: 'Suspended' },
} as const;

// ============================================================================
// Train Type Configuration
// ============================================================================

export const TRAIN_TYPE_CONFIG = {
  slow: { color: 'bg-slate-500', label: 'S', description: 'Stops at all stations', icon: '●' },
  fast: { color: 'bg-red-500', label: 'F', description: 'Limited stops', icon: '▶' },
  'semi-fast': { color: 'bg-orange-500', label: 'SF', description: 'Semi-fast', icon: '▷' },
  ladies: { color: 'bg-pink-500', label: 'L', description: 'Ladies Special', icon: '♥' },
  special: { color: 'bg-purple-500', label: 'SP', description: 'Special', icon: '★' },
} as const;

// ============================================================================
// Quick Actions Configuration
// ============================================================================

export const QUICK_ACTIONS = [
  { id: 'home-to-work', icon: 'Home', label: 'Home → Work', shortcut: 'h' },
  { id: 'last-train', icon: 'Moon', label: 'Last Train Home', shortcut: 'l' },
  { id: 'nearby', icon: 'MapPin', label: 'Nearby Stations', shortcut: 'n' },
  { id: 'favorites', icon: 'Star', label: 'Favorites', shortcut: 'f' },
] as const;

// ============================================================================
// Helpline Numbers
// ============================================================================

export const HELPLINES = [
  { name: 'Railway Helpline', number: '139', icon: 'Phone' },
  { name: 'Security Helpline', number: '182', icon: 'Shield' },
  { name: 'Women Helpline', number: '1091', icon: 'Heart' },
  { name: 'Accident Helpline', number: '1072', icon: 'AlertCircle' },
  { name: 'Child Helpline', number: '1098', icon: 'Baby' },
  { name: 'Disaster Helpline', number: '1070', icon: 'Siren' },
] as const;

// ============================================================================
// Features Configuration
// ============================================================================

export const FEATURES = {
  /** Enable crowd reporting */
  CROWD_REPORTING: true,
  /** Enable trip sharing */
  TRIP_SHARING: true,
  /** Enable journey planner */
  JOURNEY_PLANNER: true,
  /** Enable fare calculator */
  FARE_CALCULATOR: true,
  /** Enable trip history */
  TRIP_HISTORY: true,
  /** Enable favorites */
  FAVORITES: true,
  /** Enable offline mode */
  OFFLINE_MODE: true,
  /** Enable notifications */
  NOTIFICATIONS: false,
  /** Enable weather display */
  WEATHER: true,
} as const;

// ============================================================================
// UI Configuration
// ============================================================================

export const UI_CONFIG = {
  /** Animation duration in ms */
  ANIMATION_DURATION: 300,
  /** Toast duration in ms */
  TOAST_DURATION: 4000,
  /** Refresh interval for alerts */
  ALERT_REFRESH_INTERVAL: 60000,
  /** Refresh interval for crowd data */
  CROWD_REFRESH_INTERVAL: 30000,
  /** Maximum search results */
  MAX_SEARCH_RESULTS: 20,
  /** Debounce delay for search */
  SEARCH_DEBOUNCE_MS: 300,
} as const;

// ============================================================================
// Zones
// ============================================================================

export const ZONES = [
  { id: 'south', name: 'South Mumbai', nameHi: 'दक्षिण मुंबई' },
  { id: 'central', name: 'Central Mumbai', nameHi: 'मध्य मुंबई' },
  { id: 'western', name: 'Western Suburbs', nameHi: 'पश्चिमी उपनगर' },
  { id: 'extended', name: 'Extended Suburbs', nameHi: 'विस्तारित उपनगर' },
  { id: 'navi-mumbai', name: 'Navi Mumbai', nameHi: 'नवी मुंबई' },
] as const;

// ============================================================================
// App Metadata
// ============================================================================

export const APP_CONFIG = {
  name: 'MumbaiLocal',
  version: '3.0.0',
  author: 'MumbaiLocal Team',
  description: 'AI-powered Mumbai transport alerts with real-time updates',
  website: 'https://mumbaitransport.in',
  github: 'https://github.com/jobchta/mumbaitransport',
} as const;
