/**
 * Mumbai Local Train Data - Comprehensive Schedule & Station Info
 *
 * This module provides station data, fare calculations, and train schedules
 * for the Mumbai transport system.
 */

import type { Station, TrainSchedule, Fare, LineInfo, LineId, TrainType } from '@/types';
import { FARE_STRUCTURE, SCHEDULE_CONFIG, STATION_LIST_CONFIG } from '@/lib/utils/constants';

// Re-export types for backward compatibility
export type { Station, TrainSchedule, Fare } from '@/types';

/**
 * All stations with complete data organized by line
 */
export const STATIONS: Station[] = [
  // Western Line
  {
    id: 'churchgate',
    name: 'Churchgate',
    nameHi: 'चर्चगेट',
    line: 'western',
    zone: 'South',
    platforms: 4,
    distance: 0,
    facilities: ['Ticket Counter', 'Cloak Room', 'Refreshment'],
    parking: false,
    wheelchair: true,
    fastStop: true,
  },
  {
    id: 'marine-lines',
    name: 'Marine Lines',
    nameHi: 'मरीन लाइन्स',
    line: 'western',
    zone: 'South',
    platforms: 2,
    distance: 1.2,
    facilities: ['Ticket Counter'],
    parking: false,
    wheelchair: false,
    fastStop: false,
  },
  {
    id: 'charni-road',
    name: 'Charni Road',
    nameHi: 'चर्नी रोड',
    line: 'western',
    zone: 'South',
    platforms: 2,
    distance: 2.4,
    facilities: ['Ticket Counter'],
    parking: false,
    wheelchair: false,
    fastStop: false,
  },
  {
    id: 'grant-road',
    name: 'Grant Road',
    nameHi: 'ग्रांट रोड',
    line: 'western',
    zone: 'South',
    platforms: 2,
    distance: 3.8,
    facilities: ['Ticket Counter'],
    parking: false,
    wheelchair: false,
    fastStop: false,
  },
  {
    id: 'mumbai-central',
    name: 'Mumbai Central',
    nameHi: 'मुंबई सेंट्रल',
    line: 'western',
    zone: 'South',
    platforms: 4,
    distance: 5.2,
    facilities: ['Ticket Counter', 'Cloak Room', 'Food Plaza', 'Waiting Room'],
    parking: true,
    wheelchair: true,
    fastStop: true,
  },
  {
    id: 'mahalaxmi',
    name: 'Mahalaxmi',
    nameHi: 'महालक्ष्मी',
    line: 'western',
    zone: 'South',
    platforms: 2,
    distance: 6.8,
    facilities: ['Ticket Counter'],
    parking: false,
    wheelchair: false,
    fastStop: false,
  },
  {
    id: 'lower-parel',
    name: 'Lower Parel',
    nameHi: 'लोअर परेल',
    line: 'western',
    zone: 'Central',
    platforms: 2,
    distance: 8.2,
    facilities: ['Ticket Counter'],
    parking: false,
    wheelchair: false,
    fastStop: true,
  },
  {
    id: 'dadar-w',
    name: 'Dadar (W)',
    nameHi: 'दादर (पश्चिम)',
    line: 'western',
    zone: 'Central',
    platforms: 4,
    distance: 11.2,
    facilities: ['Ticket Counter', 'Foot Over Bridge', 'Refreshment'],
    parking: true,
    wheelchair: true,
    fastStop: true,
  },
  {
    id: 'bandra',
    name: 'Bandra',
    nameHi: 'बांद्रा',
    line: 'western',
    zone: 'Western Suburbs',
    platforms: 4,
    distance: 16.5,
    facilities: ['Ticket Counter', 'Waiting Room', 'Food Court'],
    parking: true,
    wheelchair: true,
    fastStop: true,
  },
  {
    id: 'andheri',
    name: 'Andheri',
    nameHi: 'अंधेरी',
    line: 'western',
    zone: 'Western Suburbs',
    platforms: 6,
    distance: 23.5,
    facilities: ['Ticket Counter', 'Metro Connect', 'Food Plaza'],
    parking: true,
    wheelchair: true,
    fastStop: true,
  },
  {
    id: 'borivali',
    name: 'Borivali',
    nameHi: 'बोरीवली',
    line: 'western',
    zone: 'Western Suburbs',
    platforms: 6,
    distance: 35.0,
    facilities: ['Ticket Counter', 'Food Plaza', 'Waiting Room', 'National Park'],
    parking: true,
    wheelchair: true,
    fastStop: true,
  },
  {
    id: 'virar',
    name: 'Virar',
    nameHi: 'विरार',
    line: 'western',
    zone: 'Extended Suburbs',
    platforms: 4,
    distance: 62.0,
    facilities: ['Ticket Counter', 'Refreshment'],
    parking: true,
    wheelchair: false,
    fastStop: true,
  },

  // Central Line
  {
    id: 'csmt',
    name: 'CSMT',
    nameHi: 'छत्रपति शिवाजी टर्मिनस',
    line: 'central',
    zone: 'South',
    platforms: 18,
    distance: 0,
    facilities: ['Ticket Counter', 'Cloak Room', 'Food Plaza', 'Waiting Room', 'Heritage Building'],
    parking: false,
    wheelchair: true,
    fastStop: true,
  },
  {
    id: 'dadar-c',
    name: 'Dadar (C)',
    nameHi: 'दादर (मध्य)',
    line: 'central',
    zone: 'Central',
    platforms: 4,
    distance: 11.5,
    facilities: ['Ticket Counter', 'Foot Over Bridge'],
    parking: true,
    wheelchair: true,
    fastStop: true,
  },
  {
    id: 'kurla-c',
    name: 'Kurla',
    nameHi: 'कुर्ला',
    line: 'central',
    zone: 'Central',
    platforms: 4,
    distance: 16.5,
    facilities: ['Ticket Counter', 'Harbour Connect'],
    parking: false,
    wheelchair: false,
    fastStop: true,
  },
  {
    id: 'ghatkopar',
    name: 'Ghatkopar',
    nameHi: 'घाटकोपर',
    line: 'central',
    zone: 'Central',
    platforms: 4,
    distance: 20.5,
    facilities: ['Ticket Counter', 'Metro Connect'],
    parking: true,
    wheelchair: true,
    fastStop: true,
  },
  {
    id: 'thane',
    name: 'Thane',
    nameHi: 'ठाणे',
    line: 'central',
    zone: 'Extended Suburbs',
    platforms: 8,
    distance: 36.0,
    facilities: ['Ticket Counter', 'Food Plaza', 'Trans-Harbour Connect'],
    parking: true,
    wheelchair: true,
    fastStop: true,
  },
  {
    id: 'kalyan',
    name: 'Kalyan',
    nameHi: 'कल्याण',
    line: 'central',
    zone: 'Extended Suburbs',
    platforms: 6,
    distance: 55.0,
    facilities: ['Ticket Counter', 'Waiting Room', 'Food Plaza'],
    parking: true,
    wheelchair: true,
    fastStop: true,
  },

  // Harbour Line
  {
    id: 'vashi',
    name: 'Vashi',
    nameHi: 'वाशी',
    line: 'harbour',
    zone: 'Navi Mumbai',
    platforms: 4,
    distance: 25.0,
    facilities: ['Ticket Counter', 'Bus Terminal', 'Mall Connect'],
    parking: true,
    wheelchair: true,
    fastStop: true,
  },
  {
    id: 'nerul',
    name: 'Nerul',
    nameHi: 'नेरुळ',
    line: 'harbour',
    zone: 'Navi Mumbai',
    platforms: 2,
    distance: 31.5,
    facilities: ['Ticket Counter', 'Bus Connect'],
    parking: false,
    wheelchair: false,
    fastStop: true,
  },
  {
    id: 'cbd-belapur',
    name: 'CBD Belapur',
    nameHi: 'सीबीडी बेलापूर',
    line: 'harbour',
    zone: 'Navi Mumbai',
    platforms: 2,
    distance: 37.0,
    facilities: ['Ticket Counter', 'Bus Terminal'],
    parking: true,
    wheelchair: true,
    fastStop: true,
  },
  {
    id: 'panvel',
    name: 'Panvel',
    nameHi: 'पनवेल',
    line: 'harbour',
    zone: 'Navi Mumbai',
    platforms: 4,
    distance: 51.0,
    facilities: ['Ticket Counter', 'Bus Terminal', 'Intercity'],
    parking: true,
    wheelchair: true,
    fastStop: true,
  },

  // Metro Line 1
  {
    id: 'versova',
    name: 'Versova',
    nameHi: 'वर्सोवा',
    line: 'metro-1',
    zone: 'Western Suburbs',
    platforms: 2,
    distance: 0,
    facilities: ['Ticket Counter', 'Elevator', 'Escalator'],
    parking: false,
    wheelchair: true,
    fastStop: true,
  },
  {
    id: 'andheri-metro',
    name: 'Andheri Metro',
    nameHi: 'अंधेरी मेट्रो',
    line: 'metro-1',
    zone: 'Western Suburbs',
    platforms: 2,
    distance: 4.5,
    facilities: ['Ticket Counter', 'Elevator', 'Escalator', 'Local Connect'],
    parking: false,
    wheelchair: true,
    fastStop: true,
  },
  {
    id: 'ghatkopar-metro',
    name: 'Ghatkopar Metro',
    nameHi: 'घाटकोपर मेट्रो',
    line: 'metro-1',
    zone: 'Central',
    platforms: 2,
    distance: 11.4,
    facilities: ['Ticket Counter', 'Elevator', 'Escalator', 'Local Connect'],
    parking: false,
    wheelchair: true,
    fastStop: true,
  },
];

/**
 * Line information for all transport lines
 */
export const LINES: Record<LineId, LineInfo> = {
  western: {
    id: 'western',
    name: 'Western Line',
    nameHi: 'पश्चिम रेखा',
    color: '#3B82F6',
    colorCode: 'blue',
    endpoints: ['Churchgate', 'Virar'],
    length: 62,
    stations: 28,
    firstTrain: '04:00',
    lastTrain: '01:00',
    frequency: '3-5 min',
  },
  central: {
    id: 'central',
    name: 'Central Line',
    nameHi: 'मध्य रेखा',
    color: '#EF4444',
    colorCode: 'red',
    endpoints: ['CSMT', 'Kalyan'],
    length: 55,
    stations: 26,
    firstTrain: '04:15',
    lastTrain: '00:30',
    frequency: '3-5 min',
  },
  harbour: {
    id: 'harbour',
    name: 'Harbour Line',
    nameHi: 'हार्बर रेखा',
    color: '#F59E0B',
    colorCode: 'amber',
    endpoints: ['CSMT', 'Panvel'],
    length: 51,
    stations: 22,
    firstTrain: '04:30',
    lastTrain: '00:00',
    frequency: '5-10 min',
  },
  'trans-harbour': {
    id: 'trans-harbour',
    name: 'Trans-Harbour Line',
    nameHi: 'ट्रान्स-हार्बर रेखा',
    color: '#8B5CF6',
    colorCode: 'violet',
    endpoints: ['Thane', 'Vashi'],
    length: 18,
    stations: 11,
    firstTrain: '05:00',
    lastTrain: '23:30',
    frequency: '10-15 min',
  },
  'metro-1': {
    id: 'metro-1',
    name: 'Metro Line 1',
    nameHi: 'मेट्रो लाइन 1',
    color: '#EC4899',
    colorCode: 'pink',
    endpoints: ['Versova', 'Ghatkopar'],
    length: 11.4,
    stations: 12,
    firstTrain: '05:30',
    lastTrain: '23:30',
    frequency: '4-8 min',
  },
  'metro-2a': {
    id: 'metro-2a',
    name: 'Metro Line 2A',
    nameHi: 'मेट्रो लाइन 2ए',
    color: '#FBBF24',
    colorCode: 'yellow',
    endpoints: ['Dahisar East', 'D.N. Nagar'],
    length: 18.6,
    stations: 17,
    firstTrain: '06:00',
    lastTrain: '23:00',
    frequency: '5-10 min',
  },
  'metro-7': {
    id: 'metro-7',
    name: 'Metro Line 7',
    nameHi: 'मेट्रो लाइन 7',
    color: '#10B981',
    colorCode: 'emerald',
    endpoints: ['Dahisar East', 'Andheri East'],
    length: 16.5,
    stations: 13,
    firstTrain: '06:00',
    lastTrain: '23:00',
    frequency: '5-10 min',
  },
  monorail: {
    id: 'monorail',
    name: 'Monorail',
    nameHi: 'मोनोरेल',
    color: '#22C55E',
    colorCode: 'green',
    endpoints: ['Chembur', 'Sant Gadge Maharaj Chowk'],
    length: 19.5,
    stations: 17,
    firstTrain: '06:00',
    lastTrain: '22:00',
    frequency: '15-20 min',
  },
};

/**
 * Calculate fare between two stations
 *
 * @param from - Origin station
 * @param to - Destination station
 * @returns Fare object with prices or null if stations are on unconnected lines
 */
export function calculateFare(from: Station, to: Station): Fare | null {
  if (from.line !== to.line && !isConnectedLine(from.line, to.line)) {
    return null;
  }

  const distance = Math.abs(to.distance - from.distance);
  const isMetro = from.line.startsWith('metro');

  let secondClass: number;
  let firstClass: number;

  if (isMetro) {
    const fares = FARE_STRUCTURE.METRO;
    const bracketIndex = fares.DISTANCE_BRACKETS.findIndex(d => distance <= d);
    secondClass = fares.BASE_FARES[bracketIndex === -1 ? fares.BASE_FARES.length - 1 : bracketIndex];
    firstClass = secondClass * fares.FIRST_CLASS_MULTIPLIER;
  } else {
    const fares = FARE_STRUCTURE.RAILWAY;
    const bracketIndex = fares.DISTANCE_BRACKETS.findIndex(d => distance <= d);
    secondClass = fares.SECOND_CLASS[bracketIndex === -1 ? fares.SECOND_CLASS.length - 1 : bracketIndex];
    firstClass = secondClass * fares.FIRST_CLASS_MULTIPLIER;
  }

  return {
    from: from.id,
    to: to.id,
    distance: Math.round(distance * 10) / 10,
    secondClass,
    firstClass,
    monthly: Math.round(secondClass * FARE_STRUCTURE.MONTHLY_MULTIPLIER),
    season: Math.round(secondClass * FARE_STRUCTURE.SEASON_MULTIPLIER),
  };
}

/**
 * Check if two lines are connected (allow transfer)
 */
function isConnectedLine(line1: LineId, line2: LineId): boolean {
  const connections: Record<string, LineId[]> = {
    western: ['metro-1', 'metro-2a', 'metro-7'],
    central: ['harbour', 'metro-1'],
    harbour: ['central', 'monorail'],
    'trans-harbour': ['central', 'harbour'],
    'metro-1': ['western', 'central'],
    'metro-2a': ['western'],
    'metro-7': ['western'],
    monorail: ['harbour'],
  };

  return connections[line1]?.includes(line2) ?? false;
}

/**
 * Destination patterns by line - deterministically selected based on station
 */
const DESTINATIONS_BY_LINE: Record<LineId, string[]> = {
  western: ['Churchgate', 'Virar', 'Borivali'],
  central: ['CSMT', 'Kalyan', 'Thane'],
  harbour: ['CSMT', 'Panvel', 'Vashi'],
  'trans-harbour': ['Thane', 'Vashi', 'Nerul'],
  'metro-1': ['Versova', 'Ghatkopar'],
  'metro-2a': ['Dahisar East', 'D.N. Nagar'],
  'metro-7': ['Dahisar East', 'Andheri East'],
  monorail: ['Chembur', 'Wadala', 'Sant Gadge Maharaj Chowk'],
};

/**
 * Get a deterministic destination for a station based on time and station ID
 * This ensures consistent destination display without randomness
 */
function getDestination(station: Station, minutesSinceMidnight: number): string {
  const destinations = DESTINATIONS_BY_LINE[station.line] || ['Unknown'];
  // Use time-based selection for consistent but varied destinations
  const index = Math.floor((minutesSinceMidnight / 15) % destinations.length);
  return destinations[index];
}

/**
 * Get next trains from a station
 *
 * @param fromStation - Origin station
 * @param toStation - Optional destination station for direction
 * @param limit - Maximum number of trains to return
 * @returns Array of upcoming train schedules
 */
export function getNextTrains(
  fromStation: Station,
  toStation: Station | null,
  limit = 5
): TrainSchedule[] {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const trains: TrainSchedule[] = [];

  // Determine frequency based on line type
  const isMetro = fromStation.line.startsWith('metro');
  const isMonorail = fromStation.line === 'monorail';
  const frequency = isMonorail
    ? SCHEDULE_CONFIG.MONORAIL_FREQUENCY_MIN
    : isMetro
      ? SCHEDULE_CONFIG.METRO_FREQUENCY_MIN
      : SCHEDULE_CONFIG.LOCAL_FREQUENCY_MIN;

  const startHour = isMetro ? SCHEDULE_CONFIG.METRO_START_HOUR : SCHEDULE_CONFIG.LOCAL_START_HOUR;
  const endHour = isMetro ? SCHEDULE_CONFIG.METRO_END_HOUR : SCHEDULE_CONFIG.LOCAL_END_HOUR;

  // Generate train times for the rest of the day
  for (let hour = startHour; hour <= (endHour < startHour ? endHour + 24 : endHour); hour++) {
    for (let min = 0; min < 60; min += frequency) {
      const actualHour = hour > 23 ? hour - 24 : hour;
      const trainMinutes = actualHour * 60 + min;

      // Include trains that haven't departed yet (skip late night trains before first train)
      const isAfterMidnight = currentMinutes < startHour * 60;
      const trainIsRelevant = isAfterMidnight
        ? trainMinutes >= startHour * 60
        : trainMinutes > currentMinutes;

      if (trainIsRelevant) {
        const departure = `${String(actualHour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;

        // Determine train type based on station characteristics and time
        const trainType: TrainType = determineTrainType(fromStation, min, hour);

        trains.push({
          id: `${fromStation.id}-${departure}-${trainType}`,
          from: fromStation.name,
          to: toStation?.name || getDestination(fromStation, trainMinutes),
          departure,
          arrival: calculateArrival(departure, fromStation, toStation),
          type: trainType,
          days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          platform: getPlatform(fromStation, trainType),
        });
      }

      if (trains.length >= limit * 3) break;
    }
    if (trains.length >= limit * 3) break;
  }

  return trains.slice(0, limit);
}

/**
 * Determine train type based on station and schedule
 */
function determineTrainType(station: Station, minute: number, hour: number): TrainType {
  // Ladies specials during peak hours
  if (minute % 30 === 0 && hour >= 7 && hour <= 11) {
    return 'ladies';
  }

  // Fast trains only stop at fast stations
  if (station.fastStop) {
    if (minute % 12 === 0) return 'fast';
    if (minute % 6 === 0) return 'semi-fast';
  }

  return 'slow';
}

/**
 * Calculate arrival time based on departure and distance
 */
function calculateArrival(
  departure: string,
  from: Station,
  to: Station | null
): string {
  if (!to) return '--:--';

  const [h, m] = departure.split(':').map(Number);
  const distance = Math.abs(to.distance - from.distance);
  const travelTime = Math.round(distance * STATION_LIST_CONFIG.TRAVEL_TIME_PER_KM_MIN);

  let arrivalMin = h * 60 + m + travelTime;
  const arrivalH = Math.floor(arrivalMin / 60) % 24;
  arrivalMin = arrivalMin % 60;

  return `${String(arrivalH).padStart(2, '0')}:${String(arrivalMin).padStart(2, '0')}`;
}

/**
 * Get platform number for a train
 */
function getPlatform(station: Station, type: TrainType): number {
  if (type === 'fast' && station.platforms >= 3) {
    // Fast trains typically use outer platforms
    return station.platforms;
  }
  // Slow trains use inner platforms, but this varies by station
  return Math.min(2, station.platforms);
}
