/**
 * Mumbai Local Train Data - Comprehensive Schedule & Station Info
 * 
 * Complete database of all Mumbai suburban railway and metro stations
 * with schedules, fares, and real-time data support.
 */

import type { Station, LineInfo, LineId, TrainType, Fare, JourneyRoute, JourneyLeg } from '@/types';
import { FARE_STRUCTURE, SCHEDULE_CONFIG, STATION_LIST_CONFIG } from '@/lib/utils/constants';

// ============================================================================
// Complete Station Database
// ============================================================================

export const STATIONS: Station[] = [
  // ========================================
  // WESTERN LINE (Churchgate - Virar - Dahanu Road)
  // ========================================
  { id: 'churchgate', name: 'Churchgate', nameHi: 'चर्चगेट', nameMr: 'चर्चगेट', line: 'western', zone: 'South', platforms: 4, distance: 0, facilities: ['Ticket Counter', 'Cloak Room', 'Refreshment', 'WiFi', 'ATM'], parking: false, wheelchair: true, fastStop: true, coordinates: { lat: 18.9322, lng: 72.8264 } },
  { id: 'marine-lines', name: 'Marine Lines', nameHi: 'मरीन लाइन्स', nameMr: 'मरीन लाईन्स', line: 'western', zone: 'South', platforms: 2, distance: 1.2, facilities: ['Ticket Counter'], parking: false, wheelchair: false, fastStop: false, coordinates: { lat: 18.9375, lng: 72.8248 } },
  { id: 'charni-road', name: 'Charni Road', nameHi: 'चर्नी रोड', nameMr: 'चर्नी रोड', line: 'western', zone: 'South', platforms: 2, distance: 2.4, facilities: ['Ticket Counter', 'Zoo Access'], parking: false, wheelchair: true, fastStop: false, coordinates: { lat: 18.9435, lng: 72.8238 } },
  { id: 'grant-road', name: 'Grant Road', nameHi: 'ग्रांट रोड', nameMr: 'ग्रँट रोड', line: 'western', zone: 'South', platforms: 2, distance: 3.8, facilities: ['Ticket Counter'], parking: false, wheelchair: false, fastStop: false, coordinates: { lat: 18.9515, lng: 72.8218 } },
  { id: 'mumbai-central', name: 'Mumbai Central', nameHi: 'मुंबई सेंट्रल', nameMr: 'मुंबई सेंट्रल', line: 'western', zone: 'South', platforms: 5, distance: 5.2, facilities: ['Ticket Counter', 'Cloak Room', 'Food Plaza', 'Waiting Room', 'AC Waiting', 'WiFi', 'ATM', 'Medical'], parking: true, wheelchair: true, fastStop: true, coordinates: { lat: 18.9692, lng: 72.8195 } },
  { id: 'mahalaxmi', name: 'Mahalaxmi', nameHi: 'महालक्ष्मी', nameMr: 'महालक्ष्मी', line: 'western', zone: 'South', platforms: 2, distance: 6.8, facilities: ['Ticket Counter', 'Temple Access'], parking: false, wheelchair: false, fastStop: false, coordinates: { lat: 18.9795, lng: 72.8125 } },
  { id: 'lower-parel', name: 'Lower Parel', nameHi: 'लोअर परेल', nameMr: 'लोअर परेल', line: 'western', zone: 'Central', platforms: 2, distance: 8.2, facilities: ['Ticket Counter', 'Phoenix Mall'], parking: false, wheelchair: true, fastStop: true, coordinates: { lat: 18.9902, lng: 72.8025 } },
  { id: 'elphinstone', name: 'Elphinstone Road', nameHi: 'एल्फिन्स्टन रोड', nameMr: 'एल्फिन्स्टन रोड', line: 'western', zone: 'Central', platforms: 2, distance: 9.5, facilities: ['Ticket Counter'], parking: false, wheelchair: false, fastStop: true, coordinates: { lat: 18.9965, lng: 72.7985 } },
  { id: 'dadar-w', name: 'Dadar (W)', nameHi: 'दादर (पश्चिम)', nameMr: 'दादर (पश्चिम)', line: 'western', zone: 'Central', platforms: 4, distance: 11.2, facilities: ['Ticket Counter', 'Foot Over Bridge', 'Refreshment', 'Shivaji Park', 'WiFi'], parking: true, wheelchair: true, fastStop: true, coordinates: { lat: 19.0178, lng: 72.8478 } },
  { id: 'matunga-w', name: 'Matunga Road', nameHi: 'माटुंगा रोड', nameMr: 'माटुंगा रोड', line: 'western', zone: 'Central', platforms: 2, distance: 13.0, facilities: ['Ticket Counter'], parking: false, wheelchair: false, fastStop: false, coordinates: { lat: 19.0265, lng: 72.8505 } },
  { id: 'mahim', name: 'Mahim Junction', nameHi: 'माहिम', nameMr: 'माहिम', line: 'western', zone: 'Central', platforms: 3, distance: 14.2, facilities: ['Ticket Counter', 'Harbour Connect'], parking: false, wheelchair: false, fastStop: true, coordinates: { lat: 19.0368, lng: 72.8425 } },
  { id: 'bandra', name: 'Bandra', nameHi: 'बांद्रा', nameMr: 'बांद्रा', line: 'western', zone: 'Western Suburbs', platforms: 5, distance: 16.5, facilities: ['Ticket Counter', 'Waiting Room', 'Food Court', 'Terminus', 'WiFi', 'AC Waiting'], parking: true, wheelchair: true, fastStop: true, coordinates: { lat: 19.0565, lng: 72.8395 } },
  { id: 'khar-road', name: 'Khar Road', nameHi: 'खार रोड', nameMr: 'खार रोड', line: 'western', zone: 'Western Suburbs', platforms: 2, distance: 18.0, facilities: ['Ticket Counter'], parking: false, wheelchair: false, fastStop: false, coordinates: { lat: 19.0655, lng: 72.8415 } },
  { id: 'santacruz', name: 'Santacruz', nameHi: 'सांताक्रूज', nameMr: 'सांताक्रूज', line: 'western', zone: 'Western Suburbs', platforms: 3, distance: 19.5, facilities: ['Ticket Counter', 'Terminal'], parking: false, wheelchair: true, fastStop: true, coordinates: { lat: 19.0785, lng: 72.8405 } },
  { id: 'vile-parle', name: 'Vile Parle', nameHi: 'विले पार्ले', nameMr: 'विले पार्ले', line: 'western', zone: 'Western Suburbs', platforms: 2, distance: 21.0, facilities: ['Ticket Counter', 'Market'], parking: false, wheelchair: false, fastStop: false, coordinates: { lat: 19.0915, lng: 72.8425 } },
  { id: 'andheri', name: 'Andheri', nameHi: 'अंधेरी', nameMr: 'अंधेरी', line: 'western', zone: 'Western Suburbs', platforms: 7, distance: 23.5, facilities: ['Ticket Counter', 'Metro Connect', 'Food Plaza', 'Terminal', 'WiFi', 'ATM'], parking: true, wheelchair: true, fastStop: true, coordinates: { lat: 19.1195, lng: 72.8465 } },
  { id: 'jogeshwari', name: 'Jogeshwari', nameHi: 'जोगेश्वरी', nameMr: 'जोगेश्वरी', line: 'western', zone: 'Western Suburbs', platforms: 2, distance: 25.5, facilities: ['Ticket Counter'], parking: false, wheelchair: false, fastStop: true, coordinates: { lat: 19.1315, lng: 72.8495 } },
  { id: 'goregaon', name: 'Goregaon', nameHi: 'गोरेगांव', nameMr: 'गोरेगांव', line: 'western', zone: 'Western Suburbs', platforms: 4, distance: 27.5, facilities: ['Ticket Counter', 'Oberoi Mall Connect', 'Terminal'], parking: true, wheelchair: true, fastStop: true, coordinates: { lat: 19.1515, lng: 72.8525 } },
  { id: 'malad', name: 'Malad', nameHi: 'मालाड', nameMr: 'मालाड', line: 'western', zone: 'Western Suburbs', platforms: 3, distance: 30.0, facilities: ['Ticket Counter', 'Inorbit Mall'], parking: true, wheelchair: true, fastStop: true, coordinates: { lat: 19.1715, lng: 72.8525 } },
  { id: 'kandivali', name: 'Kandivali', nameHi: 'कांदिवली', nameMr: 'कांदिवली', line: 'western', zone: 'Western Suburbs', platforms: 2, distance: 32.5, facilities: ['Ticket Counter'], parking: false, wheelchair: false, fastStop: false, coordinates: { lat: 19.1875, lng: 72.8465 } },
  { id: 'borivali', name: 'Borivali', nameHi: 'बोरीवली', nameMr: 'बोरीवली', line: 'western', zone: 'Western Suburbs', platforms: 6, distance: 35.0, facilities: ['Ticket Counter', 'Food Plaza', 'Waiting Room', 'National Park', 'Terminal', 'WiFi'], parking: true, wheelchair: true, fastStop: true, coordinates: { lat: 19.2085, lng: 72.8515 } },
  { id: 'dahisar', name: 'Dahisar', nameHi: 'दहिसर', nameMr: 'दहिसर', line: 'western', zone: 'Extended Suburbs', platforms: 3, distance: 38.5, facilities: ['Ticket Counter', 'Metro Connect'], parking: false, wheelchair: true, fastStop: true, coordinates: { lat: 19.2385, lng: 72.8515 } },
  { id: 'mira-road', name: 'Mira Road', nameHi: 'मीरा रोड', nameMr: 'मीरा रोड', line: 'western', zone: 'Extended Suburbs', platforms: 2, distance: 42.0, facilities: ['Ticket Counter'], parking: false, wheelchair: false, fastStop: true, coordinates: { lat: 19.2685, lng: 72.8555 } },
  { id: 'bhayandar', name: 'Bhayandar', nameHi: 'भायंदर', nameMr: 'भायंदर', line: 'western', zone: 'Extended Suburbs', platforms: 3, distance: 46.0, facilities: ['Ticket Counter', 'Terminal'], parking: true, wheelchair: true, fastStop: true, coordinates: { lat: 19.2985, lng: 72.8555 } },
  { id: 'naigaon', name: 'Naigaon', nameHi: 'नायगांव', nameMr: 'नायगांव', line: 'western', zone: 'Extended Suburbs', platforms: 2, distance: 50.0, facilities: ['Ticket Counter'], parking: false, wheelchair: false, fastStop: false, coordinates: { lat: 19.3285, lng: 72.8555 } },
  { id: 'vasai-road', name: 'Vasai Road', nameHi: 'वसई रोड', nameMr: 'वसई रोड', line: 'western', zone: 'Extended Suburbs', platforms: 5, distance: 54.0, facilities: ['Ticket Counter', 'Waiting Room', 'Dahanu Connect', 'Terminal'], parking: true, wheelchair: true, fastStop: true, coordinates: { lat: 19.3585, lng: 72.8555 } },
  { id: 'nalasopara', name: 'Nala Sopara', nameHi: 'नालासोपारा', nameMr: 'नालासोपारा', line: 'western', zone: 'Extended Suburbs', platforms: 2, distance: 58.0, facilities: ['Ticket Counter'], parking: false, wheelchair: false, fastStop: true, coordinates: { lat: 19.4085, lng: 72.8455 } },
  { id: 'virar', name: 'Virar', nameHi: 'विरार', nameMr: 'विरार', line: 'western', zone: 'Extended Suburbs', platforms: 5, distance: 62.0, facilities: ['Ticket Counter', 'Refreshment', 'Terminal', 'Dahanu Connect'], parking: true, wheelchair: true, fastStop: true, coordinates: { lat: 19.4565, lng: 72.8255 } },

  // ========================================
  // CENTRAL LINE (CSMT - Kalyan - Kasara/Karjat)
  // ========================================
  { id: 'csmt', name: 'CSMT', nameHi: 'छत्रपति शिवाजी टर्मिनस', nameMr: 'छत्रपति शिवाजी टर्मिनस', line: 'central', zone: 'South', platforms: 18, distance: 0, facilities: ['Ticket Counter', 'Cloak Room', 'Food Plaza', 'Waiting Room', 'Heritage Building', 'UNESCO Site', 'WiFi', 'ATM', 'Medical'], parking: false, wheelchair: true, fastStop: true, coordinates: { lat: 18.9402, lng: 72.8338 } },
  { id: 'masjid', name: 'Masjid Bunder', nameHi: 'मस्जिद बंदर', nameMr: 'मशीद बंदर', line: 'central', zone: 'South', platforms: 2, distance: 1.5, facilities: ['Ticket Counter'], parking: false, wheelchair: false, fastStop: false, coordinates: { lat: 18.9485, lng: 72.8425 } },
  { id: 'sandhurst-road', name: 'Sandhurst Road', nameHi: 'सैंडहर्स्ट रोड', nameMr: 'सँडहर्स्ट रोड', line: 'central', zone: 'South', platforms: 4, distance: 3.5, facilities: ['Ticket Counter', 'Harbour Connect'], parking: false, wheelchair: false, fastStop: true, coordinates: { lat: 18.9565, lng: 72.8505 } },
  { id: 'byculla', name: 'Byculla', nameHi: 'भायखळा', nameMr: 'भायखळा', line: 'central', zone: 'South', platforms: 2, distance: 5.5, facilities: ['Ticket Counter', 'Zoo Connect'], parking: false, wheelchair: false, fastStop: false, coordinates: { lat: 18.9755, lng: 72.8565 } },
  { id: 'chinchpokli', name: 'Chinchpokli', nameHi: 'चिंचपोकळी', nameMr: 'चिंचपोकळी', line: 'central', zone: 'South', platforms: 2, distance: 7.0, facilities: ['Ticket Counter'], parking: false, wheelchair: false, fastStop: false, coordinates: { lat: 18.9855, lng: 72.8555 } },
  { id: 'currey-road', name: 'Currey Road', nameHi: 'करी रोड', nameMr: 'करी रोड', line: 'central', zone: 'Central', platforms: 2, distance: 8.5, facilities: ['Ticket Counter'], parking: false, wheelchair: false, fastStop: false, coordinates: { lat: 18.9965, lng: 72.8555 } },
  { id: 'parel', name: 'Parel', nameHi: 'परेल', nameMr: 'परेल', line: 'central', zone: 'Central', platforms: 2, distance: 10.0, facilities: ['Ticket Counter', 'Hospital Connect', 'Monorail'], parking: false, wheelchair: true, fastStop: true, coordinates: { lat: 19.0085, lng: 72.8555 } },
  { id: 'dadar-c', name: 'Dadar (C)', nameHi: 'दादर (मध्य)', nameMr: 'दादर (मध्य)', line: 'central', zone: 'Central', platforms: 4, distance: 11.5, facilities: ['Ticket Counter', 'Foot Over Bridge', 'Western Connect', 'WiFi'], parking: true, wheelchair: true, fastStop: true, coordinates: { lat: 19.0178, lng: 72.8478 } },
  { id: 'matunga-c', name: 'Matunga', nameHi: 'माटुंगा', nameMr: 'माटुंगा', line: 'central', zone: 'Central', platforms: 2, distance: 13.0, facilities: ['Ticket Counter'], parking: false, wheelchair: false, fastStop: false, coordinates: { lat: 19.0275, lng: 72.8505 } },
  { id: 'sion', name: 'Sion', nameHi: 'शीव', nameMr: 'शिव', line: 'central', zone: 'Central', platforms: 2, distance: 14.5, facilities: ['Ticket Counter', 'Hospital Connect'], parking: false, wheelchair: false, fastStop: true, coordinates: { lat: 19.0385, lng: 72.8555 } },
  { id: 'kurla-c', name: 'Kurla', nameHi: 'कुर्ला', nameMr: 'कुर्ला', line: 'central', zone: 'Central', platforms: 5, distance: 16.5, facilities: ['Ticket Counter', 'Harbour Connect', 'Terminal'], parking: false, wheelchair: true, fastStop: true, coordinates: { lat: 19.0655, lng: 72.8855 } },
  { id: 'vidyavihar', name: 'Vidyavihar', nameHi: 'विद्याविहार', nameMr: 'विद्याविहार', line: 'central', zone: 'Central', platforms: 2, distance: 18.5, facilities: ['Ticket Counter', 'College Connect'], parking: false, wheelchair: false, fastStop: false, coordinates: { lat: 19.0755, lng: 72.8915 } },
  { id: 'ghatkopar', name: 'Ghatkopar', nameHi: 'घाटकोपर', nameMr: 'घाटकोपर', line: 'central', zone: 'Central', platforms: 5, distance: 20.5, facilities: ['Ticket Counter', 'Metro Connect', 'Terminal', 'WiFi'], parking: true, wheelchair: true, fastStop: true, coordinates: { lat: 19.0855, lng: 72.9055 } },
  { id: 'vikhroli', name: 'Vikhroli', nameHi: 'विक्रोळी', nameMr: 'विक्रोळी', line: 'central', zone: 'Central', platforms: 2, distance: 23.0, facilities: ['Ticket Counter', 'Godrej Connect'], parking: false, wheelchair: false, fastStop: true, coordinates: { lat: 19.0955, lng: 72.9255 } },
  { id: 'kanjurmarg', name: 'Kanjurmarg', nameHi: 'कांजुरमार्ग', nameMr: 'कांजुरमार्ग', line: 'central', zone: 'Central', platforms: 2, distance: 25.5, facilities: ['Ticket Counter', 'IIT Connect'], parking: false, wheelchair: false, fastStop: true, coordinates: { lat: 19.1085, lng: 72.9355 } },
  { id: 'bhandup', name: 'Bhandup', nameHi: 'भंडूप', nameMr: 'भंडूप', line: 'central', zone: 'Central', platforms: 3, distance: 28.0, facilities: ['Ticket Counter', 'Terminal'], parking: false, wheelchair: true, fastStop: true, coordinates: { lat: 19.1255, lng: 72.9455 } },
  { id: 'nahur', name: 'Nahur', nameHi: 'नाहूर', nameMr: 'नाहूर', line: 'central', zone: 'Central', platforms: 2, distance: 30.0, facilities: ['Ticket Counter'], parking: false, wheelchair: false, fastStop: false, coordinates: { lat: 19.1385, lng: 72.9555 } },
  { id: 'mulund', name: 'Mulund', nameHi: 'मुलुंड', nameMr: 'मुलुंड', line: 'central', zone: 'Extended Suburbs', platforms: 3, distance: 32.5, facilities: ['Ticket Counter', 'Terminal', 'Navi Mumbai Border'], parking: false, wheelchair: true, fastStop: true, coordinates: { lat: 19.1715, lng: 72.9555 } },
  { id: 'thane', name: 'Thane', nameHi: 'ठाणे', nameMr: 'ठाणे', line: 'central', zone: 'Extended Suburbs', platforms: 10, distance: 36.0, facilities: ['Ticket Counter', 'Food Plaza', 'Trans-Harbour Connect', 'Terminal', 'WiFi', 'ATM'], parking: true, wheelchair: true, fastStop: true, coordinates: { lat: 19.1855, lng: 72.9755 } },
  { id: 'kalwa', name: 'Kalwa', nameHi: 'कलवा', nameMr: 'कलवा', line: 'central', zone: 'Extended Suburbs', platforms: 2, distance: 38.5, facilities: ['Ticket Counter'], parking: false, wheelchair: false, fastStop: false, coordinates: { lat: 19.1955, lng: 72.9855 } },
  { id: 'mumbra', name: 'Mumbra', nameHi: 'मुंब्रा', nameMr: 'मुंब्रा', line: 'central', zone: 'Extended Suburbs', platforms: 2, distance: 42.0, facilities: ['Ticket Counter'], parking: false, wheelchair: false, fastStop: false, coordinates: { lat: 19.2755, lng: 73.0155 } },
  { id: 'diva', name: 'Diva', nameHi: 'दिवा', nameMr: 'दिवा', line: 'central', zone: 'Extended Suburbs', platforms: 3, distance: 45.0, facilities: ['Ticket Counter', 'Vasai Connect'], parking: false, wheelchair: false, fastStop: false, coordinates: { lat: 19.3055, lng: 73.0255 } },
  { id: 'kopar', name: 'Kopar', nameHi: 'कोपर', nameMr: 'कोपर', line: 'central', zone: 'Extended Suburbs', platforms: 2, distance: 47.5, facilities: ['Ticket Counter'], parking: false, wheelchair: false, fastStop: false, coordinates: { lat: 19.3255, lng: 73.0355 } },
  { id: 'dombivli', name: 'Dombivli', nameHi: 'डोंबिवली', nameMr: 'डोंबिवली', line: 'central', zone: 'Extended Suburbs', platforms: 3, distance: 50.0, facilities: ['Ticket Counter', 'Terminal'], parking: true, wheelchair: true, fastStop: true, coordinates: { lat: 19.3455, lng: 73.0455 } },
  { id: 'kalyan', name: 'Kalyan', nameHi: 'कल्याण', nameMr: 'कल्याण', line: 'central', zone: 'Extended Suburbs', platforms: 8, distance: 55.0, facilities: ['Ticket Counter', 'Waiting Room', 'Food Plaza', 'Kasara Connect', 'Karjat Connect', 'Terminal', 'WiFi', 'ATM'], parking: true, wheelchair: true, fastStop: true, coordinates: { lat: 19.2455, lng: 73.1355 } },

  // ========================================
  // HARBOUR LINE (CSMT - Panvel / Goregaon)
  // ========================================
  { id: 'csmt-h', name: 'CSMT', nameHi: 'छत्रपति शिवाजी टर्मिनस', nameMr: 'छत्रपति शिवाजी टर्मिनस', line: 'harbour', zone: 'South', platforms: 18, distance: 0, facilities: ['Ticket Counter', 'Cloak Room', 'Food Plaza'], parking: false, wheelchair: true, fastStop: true, coordinates: { lat: 18.9402, lng: 72.8338 } },
  { id: 'reay-road', name: 'Reay Road', nameHi: 'रे रोड', nameMr: 'रे रोड', line: 'harbour', zone: 'South', platforms: 2, distance: 5.5, facilities: ['Ticket Counter'], parking: false, wheelchair: false, fastStop: false, coordinates: { lat: 18.9755, lng: 72.8455 } },
  { id: 'cotton-green', name: 'Cotton Green', nameHi: 'कॉटन ग्रीन', nameMr: 'कॉटन ग्रीन', line: 'harbour', zone: 'South', platforms: 2, distance: 7.0, facilities: ['Ticket Counter'], parking: false, wheelchair: false, fastStop: false, coordinates: { lat: 18.9855, lng: 72.8455 } },
  { id: 'sewri', name: 'Sewri', nameHi: 'सेवरी', nameMr: 'सेवरी', line: 'harbour', zone: 'South', platforms: 2, distance: 8.5, facilities: ['Ticket Counter', 'Fort Access'], parking: false, wheelchair: false, fastStop: false, coordinates: { lat: 18.9955, lng: 72.8555 } },
  { id: 'wadala-road', name: 'Wadala Road', nameHi: 'वडाळा रोड', nameMr: 'वडाळा रोड', line: 'harbour', zone: 'Central', platforms: 4, distance: 10.5, facilities: ['Ticket Counter', 'Monorail Connect', 'Terminal'], parking: false, wheelchair: true, fastStop: true, coordinates: { lat: 19.0155, lng: 72.8655 } },
  { id: 'gtb-nagar', name: 'GTB Nagar', nameHi: 'जीटीबी नगर', nameMr: 'जीटीबी नगर', line: 'harbour', zone: 'Central', platforms: 2, distance: 12.5, facilities: ['Ticket Counter'], parking: false, wheelchair: false, fastStop: false, coordinates: { lat: 19.0455, lng: 72.8655 } },
  { id: 'chembur', name: 'Chembur', nameHi: 'चेंबूर', nameMr: 'चेंबूर', line: 'harbour', zone: 'Central', platforms: 4, distance: 15.0, facilities: ['Ticket Counter', 'Monorail Connect', 'Terminal'], parking: true, wheelchair: true, fastStop: true, coordinates: { lat: 19.0555, lng: 72.8955 } },
  { id: 'tilak-nagar', name: 'Tilak Nagar', nameHi: 'तिलक नगर', nameMr: 'तिलक नगर', line: 'harbour', zone: 'Central', platforms: 2, distance: 17.0, facilities: ['Ticket Counter'], parking: false, wheelchair: false, fastStop: false, coordinates: { lat: 19.0655, lng: 72.9055 } },
  { id: 'kurla-h', name: 'Kurla', nameHi: 'कुर्ला', nameMr: 'कुर्ला', line: 'harbour', zone: 'Central', platforms: 5, distance: 18.5, facilities: ['Ticket Counter', 'Central Connect'], parking: false, wheelchair: true, fastStop: true, coordinates: { lat: 19.0655, lng: 72.8855 } },
  { id: 'vashi', name: 'Vashi', nameHi: 'वाशी', nameMr: 'वाशी', line: 'harbour', zone: 'Navi Mumbai', platforms: 5, distance: 25.0, facilities: ['Ticket Counter', 'Bus Terminal', 'Mall Connect', 'Terminal', 'WiFi'], parking: true, wheelchair: true, fastStop: true, coordinates: { lat: 19.0755, lng: 72.9955 } },
  { id: 'sanpada', name: 'Sanpada', nameHi: 'सानपाडा', nameMr: 'सानपाडा', line: 'harbour', zone: 'Navi Mumbai', platforms: 2, distance: 27.5, facilities: ['Ticket Counter'], parking: false, wheelchair: false, fastStop: false, coordinates: { lat: 19.0855, lng: 73.0155 } },
  { id: 'juinagar', name: 'Juinagar', nameHi: 'जुईनगर', nameMr: 'जुईनगर', line: 'harbour', zone: 'Navi Mumbai', platforms: 2, distance: 29.0, facilities: ['Ticket Counter'], parking: false, wheelchair: false, fastStop: false, coordinates: { lat: 19.0955, lng: 73.0255 } },
  { id: 'nerul', name: 'Nerul', nameHi: 'नेरुळ', nameMr: 'नेरुळ', line: 'harbour', zone: 'Navi Mumbai', platforms: 3, distance: 31.5, facilities: ['Ticket Counter', 'Bus Connect', 'Terminal'], parking: true, wheelchair: true, fastStop: true, coordinates: { lat: 19.1055, lng: 73.0155 } },
  { id: 'seawoods', name: 'Seawoods', nameHi: 'सीवूड्स', nameMr: 'सीवूड्स', line: 'harbour', zone: 'Navi Mumbai', platforms: 2, distance: 34.0, facilities: ['Ticket Counter', 'Mall Connect'], parking: false, wheelchair: true, fastStop: true, coordinates: { lat: 19.1155, lng: 73.0055 } },
  { id: 'cbd-belapur', name: 'CBD Belapur', nameHi: 'सीबीडी बेलापूर', nameMr: 'सीबीडी बेलापूर', line: 'harbour', zone: 'Navi Mumbai', platforms: 3, distance: 37.0, facilities: ['Ticket Counter', 'Bus Terminal', 'Office Hub', 'Terminal'], parking: true, wheelchair: true, fastStop: true, coordinates: { lat: 19.0255, lng: 73.0355 } },
  { id: 'kharghar', name: 'Kharghar', nameHi: 'खारघर', nameMr: 'खारघर', line: 'harbour', zone: 'Navi Mumbai', platforms: 2, distance: 41.0, facilities: ['Ticket Counter', 'Golf Course', 'Central Park'], parking: true, wheelchair: true, fastStop: true, coordinates: { lat: 19.0355, lng: 73.0555 } },
  { id: 'mansarovar', name: 'Mansarovar', nameHi: 'मनसरोवर', nameMr: 'मनसरोवर', line: 'harbour', zone: 'Navi Mumbai', platforms: 2, distance: 44.0, facilities: ['Ticket Counter'], parking: false, wheelchair: false, fastStop: false, coordinates: { lat: 19.0255, lng: 73.0855 } },
  { id: 'khandeshwar', name: 'Khandeshwar', nameHi: 'खांडेश्वर', nameMr: 'खांडेश्वर', line: 'harbour', zone: 'Navi Mumbai', platforms: 2, distance: 47.0, facilities: ['Ticket Counter', 'Temple'], parking: false, wheelchair: false, fastStop: false, coordinates: { lat: 18.9955, lng: 73.1055 } },
  { id: 'panvel', name: 'Panvel', nameHi: 'पनवेल', nameMr: 'पनवेल', line: 'harbour', zone: 'Navi Mumbai', platforms: 6, distance: 51.0, facilities: ['Ticket Counter', 'Bus Terminal', 'Intercity', 'Konkan Railway', 'Terminal', 'WiFi', 'ATM'], parking: true, wheelchair: true, fastStop: true, coordinates: { lat: 18.9855, lng: 73.1155 } },

  // ========================================
  // TRANS-HARBOUR LINE (Thane - Vashi/Nerul)
  // ========================================
  { id: 'thane-th', name: 'Thane', nameHi: 'ठाणे', nameMr: 'ठाणे', line: 'trans-harbour', zone: 'Extended Suburbs', platforms: 10, distance: 0, facilities: ['Ticket Counter', 'Food Plaza', 'Central Connect'], parking: true, wheelchair: true, fastStop: true, coordinates: { lat: 19.1855, lng: 72.9755 } },
  { id: 'turmbhe', name: 'Turmbhe', nameHi: 'तुर्भे', nameMr: 'तुर्भे', line: 'trans-harbour', zone: 'Navi Mumbai', platforms: 2, distance: 5.0, facilities: ['Ticket Counter'], parking: false, wheelchair: false, fastStop: false, coordinates: { lat: 19.1155, lng: 72.9955 } },
  { id: 'koparkhairane', name: 'Koparkhairane', nameHi: 'कोपरखैराने', nameMr: 'कोपरखैराने', line: 'trans-harbour', zone: 'Navi Mumbai', platforms: 2, distance: 8.0, facilities: ['Ticket Counter'], parking: false, wheelchair: false, fastStop: true, coordinates: { lat: 19.1055, lng: 72.9955 } },
  { id: 'ghansoli', name: 'Ghansoli', nameHi: 'घनसोली', nameMr: 'घनसोली', line: 'trans-harbour', zone: 'Navi Mumbai', platforms: 2, distance: 11.0, facilities: ['Ticket Counter'], parking: false, wheelchair: false, fastStop: true, coordinates: { lat: 19.0955, lng: 72.9955 } },
  { id: 'rabale', name: 'Rabale', nameHi: 'रबाळे', nameMr: 'रबाळे', line: 'trans-harbour', zone: 'Navi Mumbai', platforms: 2, distance: 14.0, facilities: ['Ticket Counter', 'Industrial Hub'], parking: false, wheelchair: false, fastStop: false, coordinates: { lat: 19.0855, lng: 72.9955 } },
  { id: 'airoli', name: 'Airoli', nameHi: 'ऐरोली', nameMr: 'ऐरोली', line: 'trans-harbour', zone: 'Navi Mumbai', platforms: 3, distance: 17.0, facilities: ['Ticket Counter', 'Terminal', 'Bus Connect'], parking: true, wheelchair: true, fastStop: true, coordinates: { lat: 19.1555, lng: 72.9955 } },
  { id: 'vashi-th', name: 'Vashi', nameHi: 'वाशी', nameMr: 'वाशी', line: 'trans-harbour', zone: 'Navi Mumbai', platforms: 5, distance: 18.0, facilities: ['Ticket Counter', 'Harbour Connect'], parking: true, wheelchair: true, fastStop: true, coordinates: { lat: 19.0755, lng: 72.9955 } },

  // ========================================
  // METRO LINE 1 (Versova - Andheri - Ghatkopar)
  // ========================================
  { id: 'versova', name: 'Versova', nameHi: 'वर्सोवा', nameMr: 'वर्सोवा', line: 'metro-1', zone: 'Western Suburbs', platforms: 2, distance: 0, facilities: ['Ticket Counter', 'Elevator', 'Escalator', 'AC', 'WiFi'], parking: false, wheelchair: true, fastStop: true, coordinates: { lat: 19.1315, lng: 72.8155 } },
  { id: 'dn-nagar', name: 'D.N. Nagar', nameHi: 'डी.एन. नगर', nameMr: 'डी.एन. नगर', line: 'metro-1', zone: 'Western Suburbs', platforms: 2, distance: 1.5, facilities: ['Ticket Counter', 'Elevator', 'AC'], parking: false, wheelchair: true, fastStop: true, coordinates: { lat: 19.1315, lng: 72.8255 } },
  { id: 'azad-nagar', name: 'Azad Nagar', nameHi: 'आजाद नगर', nameMr: 'आजाद नगर', line: 'metro-1', zone: 'Western Suburbs', platforms: 2, distance: 2.8, facilities: ['Ticket Counter', 'Elevator', 'AC'], parking: false, wheelchair: true, fastStop: true, coordinates: { lat: 19.1315, lng: 72.8355 } },
  { id: 'andheri-metro', name: 'Andheri Metro', nameHi: 'अंधेरी मेट्रो', nameMr: 'अंधेरी मेट्रो', line: 'metro-1', zone: 'Western Suburbs', platforms: 2, distance: 4.5, facilities: ['Ticket Counter', 'Elevator', 'Escalator', 'Local Connect', 'AC', 'WiFi'], parking: false, wheelchair: true, fastStop: true, coordinates: { lat: 19.1195, lng: 72.8465 } },
  { id: 'western-express', name: 'Western Express Highway', nameHi: 'पश्चिम एक्सप्रेस हाईवे', nameMr: 'पश्चिम एक्सप्रेस हायवे', line: 'metro-1', zone: 'Western Suburbs', platforms: 2, distance: 6.0, facilities: ['Ticket Counter', 'Elevator', 'AC'], parking: false, wheelchair: true, fastStop: true, coordinates: { lat: 19.1155, lng: 72.8655 } },
  { id: 'chakala', name: 'Chakala', nameHi: 'चकाला', nameMr: 'चकाला', line: 'metro-1', zone: 'Western Suburbs', platforms: 2, distance: 7.5, facilities: ['Ticket Counter', 'Elevator', 'AC'], parking: false, wheelchair: true, fastStop: true, coordinates: { lat: 19.1055, lng: 72.8755 } },
  { id: 'airport-road', name: 'Airport Road', nameHi: 'एअरपोर्ट रोड', nameMr: 'एअरपोर्ट रोड', line: 'metro-1', zone: 'Western Suburbs', platforms: 2, distance: 8.8, facilities: ['Ticket Counter', 'Elevator', 'Airport Connect', 'AC'], parking: false, wheelchair: true, fastStop: true, coordinates: { lat: 19.0955, lng: 72.8855 } },
  { id: 'marol-naka', name: 'Marol Naka', nameHi: 'मारोल नाका', nameMr: 'मारोल नाका', line: 'metro-1', zone: 'Western Suburbs', platforms: 2, distance: 9.8, facilities: ['Ticket Counter', 'Elevator', 'AC'], parking: false, wheelchair: true, fastStop: true, coordinates: { lat: 19.0855, lng: 72.8955 } },
  { id: 'saki-naka', name: 'Saki Naka', nameHi: 'साकी नाका', nameMr: 'साकी नाका', line: 'metro-1', zone: 'Western Suburbs', platforms: 2, distance: 10.5, facilities: ['Ticket Counter', 'Elevator', 'AC'], parking: false, wheelchair: true, fastStop: true, coordinates: { lat: 19.0855, lng: 72.9055 } },
  { id: 'asalpha', name: 'Asalpha', nameHi: 'असल्फा', nameMr: 'असल्फा', line: 'metro-1', zone: 'Central', platforms: 2, distance: 10.8, facilities: ['Ticket Counter', 'Elevator', 'AC'], parking: false, wheelchair: true, fastStop: true, coordinates: { lat: 19.0855, lng: 72.9055 } },
  { id: 'jagruti-nagar', name: 'Jagruti Nagar', nameHi: 'जागृति नगर', nameMr: 'जागृति नगर', line: 'metro-1', zone: 'Central', platforms: 2, distance: 11.2, facilities: ['Ticket Counter', 'Elevator', 'AC'], parking: false, wheelchair: true, fastStop: true, coordinates: { lat: 19.0855, lng: 72.9055 } },
  { id: 'ghatkopar-metro', name: 'Ghatkopar Metro', nameHi: 'घाटकोपर मेट्रो', nameMr: 'घाटकोपर मेट्रो', line: 'metro-1', zone: 'Central', platforms: 2, distance: 11.4, facilities: ['Ticket Counter', 'Elevator', 'Escalator', 'Local Connect', 'AC', 'WiFi'], parking: false, wheelchair: true, fastStop: true, coordinates: { lat: 19.0855, lng: 72.9055 } },

  // ========================================
  // METRO LINE 2A (Dahisar East - D.N. Nagar)
  // ========================================
  { id: 'dahisar-east', name: 'Dahisar East', nameHi: 'दहिसर पूर्व', nameMr: 'दहिसर पूर्व', line: 'metro-2a', zone: 'Extended Suburbs', platforms: 2, distance: 0, facilities: ['Ticket Counter', 'Elevator', 'Escalator', 'AC'], parking: true, wheelchair: true, fastStop: true, coordinates: { lat: 19.2385, lng: 72.8615 } },
  { id: 'kamraj-nagar', name: 'Kamraj Nagar', nameHi: 'कामराज नगर', nameMr: 'कामराज नगर', line: 'metro-2a', zone: 'Extended Suburbs', platforms: 2, distance: 2.0, facilities: ['Ticket Counter', 'Elevator', 'AC'], parking: false, wheelchair: true, fastStop: true, coordinates: { lat: 19.2255, lng: 72.8615 } },
  { id: 'borivali-west', name: 'Borivali West', nameHi: 'बोरीवली पश्चिम', nameMr: 'बोरीवली पश्चिम', line: 'metro-2a', zone: 'Western Suburbs', platforms: 2, distance: 4.5, facilities: ['Ticket Counter', 'Elevator', 'AC'], parking: false, wheelchair: true, fastStop: true, coordinates: { lat: 19.2085, lng: 72.8515 } },
  { id: 'pahadi-eksar', name: 'Pahadi Eksar', nameHi: 'पहाड़ी एकसर', nameMr: 'पहाडी एकसर', line: 'metro-2a', zone: 'Western Suburbs', platforms: 2, distance: 6.5, facilities: ['Ticket Counter', 'Elevator', 'AC'], parking: false, wheelchair: true, fastStop: true, coordinates: { lat: 19.1955, lng: 72.8415 } },
  { id: 'lower-oci-metro', name: 'Lower Oshiwara', nameHi: 'लोअर ओशिवाड़ा', nameMr: 'लोअर ओशिवाडा', line: 'metro-2a', zone: 'Western Suburbs', platforms: 2, distance: 9.0, facilities: ['Ticket Counter', 'Elevator', 'AC'], parking: false, wheelchair: true, fastStop: true, coordinates: { lat: 19.1755, lng: 72.8315 } },
  { id: 'andheri-west', name: 'Andheri West', nameHi: 'अंधेरी पश्चिम', nameMr: 'अंधेरी पश्चिम', line: 'metro-2a', zone: 'Western Suburbs', platforms: 2, distance: 12.0, facilities: ['Ticket Counter', 'Elevator', 'Metro Connect', 'AC'], parking: false, wheelchair: true, fastStop: true, coordinates: { lat: 19.1315, lng: 72.8315 } },
  { id: 'dn-nagar-2a', name: 'D.N. Nagar', nameHi: 'डी.एन. नगर', nameMr: 'डी.एन. नगर', line: 'metro-2a', zone: 'Western Suburbs', platforms: 2, distance: 14.5, facilities: ['Ticket Counter', 'Elevator', 'Metro 1 Connect', 'AC'], parking: false, wheelchair: true, fastStop: true, coordinates: { lat: 19.1315, lng: 72.8255 } },

  // ========================================
  // METRO LINE 7 (Dahisar East - Andheri East)
  // ========================================
  { id: 'dahisar-east-7', name: 'Dahisar East', nameHi: 'दहिसर पूर्व', nameMr: 'दहिसर पूर्व', line: 'metro-7', zone: 'Extended Suburbs', platforms: 2, distance: 0, facilities: ['Ticket Counter', 'Elevator', 'Escalator', 'AC'], parking: true, wheelchair: true, fastStop: true, coordinates: { lat: 19.2385, lng: 72.8615 } },
  { id: 'oidc-1', name: 'Ovaripada', nameHi: 'ओवरीपाड़ा', nameMr: 'ओवरीपाडा', line: 'metro-7', zone: 'Extended Suburbs', platforms: 2, distance: 2.0, facilities: ['Ticket Counter', 'Elevator', 'AC'], parking: false, wheelchair: true, fastStop: true, coordinates: { lat: 19.2285, lng: 72.8615 } },
  { id: 'rashtriya-uttar', name: 'Rashtriya Uttar', nameHi: 'राष्ट्रीय उत्तर', nameMr: 'राष्ट्रीय उत्तर', line: 'metro-7', zone: 'Western Suburbs', platforms: 2, distance: 4.0, facilities: ['Ticket Counter', 'Elevator', 'AC'], parking: false, wheelchair: true, fastStop: true, coordinates: { lat: 19.2155, lng: 72.8615 } },
  { id: 'kandivali-east', name: 'Kandivali East', nameHi: 'कांदिवली पूर्व', nameMr: 'कांदिवली पूर्व', line: 'metro-7', zone: 'Western Suburbs', platforms: 2, distance: 6.5, facilities: ['Ticket Counter', 'Elevator', 'AC'], parking: false, wheelchair: true, fastStop: true, coordinates: { lat: 19.1955, lng: 72.8615 } },
  { id: 'akurli', name: 'Akurli', nameHi: 'अकुर्ली', nameMr: 'अकुर्ली', line: 'metro-7', zone: 'Western Suburbs', platforms: 2, distance: 8.5, facilities: ['Ticket Counter', 'Elevator', 'AC'], parking: false, wheelchair: true, fastStop: true, coordinates: { lat: 19.1755, lng: 72.8615 } },
  { id: 'dindoshi', name: 'Dindoshi', nameHi: 'दिंडोशी', nameMr: 'दिंडोशी', line: 'metro-7', zone: 'Western Suburbs', platforms: 2, distance: 11.0, facilities: ['Ticket Counter', 'Elevator', 'AC'], parking: false, wheelchair: true, fastStop: true, coordinates: { lat: 19.1555, lng: 72.8615 } },
  { id: 'ahmedabad-hwy', name: 'Ahmedabad Highway', nameHi: 'अहमदाबाद हाईवे', nameMr: 'अहमदाबाद हायवे', line: 'metro-7', zone: 'Western Suburbs', platforms: 2, distance: 13.5, facilities: ['Ticket Counter', 'Elevator', 'AC'], parking: false, wheelchair: true, fastStop: true, coordinates: { lat: 19.1355, lng: 72.8615 } },
  { id: 'andheri-east-7', name: 'Andheri East', nameHi: 'अंधेरी पूर्व', nameMr: 'अंधेरी पूर्व', line: 'metro-7', zone: 'Western Suburbs', platforms: 2, distance: 16.5, facilities: ['Ticket Counter', 'Elevator', 'Metro 1 Connect', 'Local Connect', 'AC', 'WiFi'], parking: false, wheelchair: true, fastStop: true, coordinates: { lat: 19.1195, lng: 72.8615 } },

  // ========================================
  // MONORAIL (Wadala - Chembur - Jacob Circle)
  // ========================================
  { id: 'wadala-monorail', name: 'Wadala Monorail', nameHi: 'वडाळा मोनोरेल', nameMr: 'वडाळा मोनोरेल', line: 'monorail', zone: 'Central', platforms: 2, distance: 0, facilities: ['Ticket Counter', 'Elevator', 'AC', 'Harbour Connect'], parking: false, wheelchair: true, fastStop: true, coordinates: { lat: 19.0155, lng: 72.8655 } },
  { id: 'bhakti-park', name: 'Bhakti Park', nameHi: 'भक्ति पार्क', nameMr: 'भक्ती पार्क', line: 'monorail', zone: 'Central', platforms: 2, distance: 2.0, facilities: ['Ticket Counter', 'Elevator', 'AC'], parking: false, wheelchair: true, fastStop: true, coordinates: { lat: 19.0255, lng: 72.8755 } },
  { id: 'mysore-colony', name: 'Mysore Colony', nameHi: 'मैसूर कॉलोनी', nameMr: 'मैसूर कॉलोनी', line: 'monorail', zone: 'Central', platforms: 2, distance: 4.0, facilities: ['Ticket Counter', 'Elevator', 'AC'], parking: false, wheelchair: true, fastStop: true, coordinates: { lat: 19.0355, lng: 72.8855 } },
  { id: 'chembur-monorail', name: 'Chembur Monorail', nameHi: 'चेंबूर मोनोरेल', nameMr: 'चेंबूर मोनोरेल', line: 'monorail', zone: 'Central', platforms: 2, distance: 6.5, facilities: ['Ticket Counter', 'Elevator', 'AC', 'Harbour Connect'], parking: true, wheelchair: true, fastStop: true, coordinates: { lat: 19.0555, lng: 72.8955 } },
  { id: 'basant-park', name: 'Basant Park', nameHi: 'बसंत पार्क', nameMr: 'बसंत पार्क', line: 'monorail', zone: 'Central', platforms: 2, distance: 9.0, facilities: ['Ticket Counter', 'Elevator', 'AC'], parking: false, wheelchair: true, fastStop: true, coordinates: { lat: 19.0455, lng: 72.8855 } },
  { id: 'fertiliser', name: 'Fertiliser Township', nameHi: 'फर्टिलाइजर टाउनशिप', nameMr: 'फर्टिलायझर टाउनशिप', line: 'monorail', zone: 'Central', platforms: 2, distance: 11.5, facilities: ['Ticket Counter', 'Elevator', 'AC'], parking: false, wheelchair: true, fastStop: true, coordinates: { lat: 19.0355, lng: 72.8755 } },
  { id: 'vnp-colony', name: 'V.N.P. Colony', nameHi: 'वी.एन.पी. कॉलोनी', nameMr: 'वी.एन.पी. कॉलोनी', line: 'monorail', zone: 'Central', platforms: 2, distance: 14.0, facilities: ['Ticket Counter', 'Elevator', 'AC'], parking: false, wheelchair: true, fastStop: true, coordinates: { lat: 19.0255, lng: 72.8655 } },
  { id: 'myn-bunder', name: 'Myn Bunder', nameHi: 'मायन बंदर', nameMr: 'मायन बंदर', line: 'monorail', zone: 'South', platforms: 2, distance: 16.5, facilities: ['Ticket Counter', 'Elevator', 'AC'], parking: false, wheelchair: true, fastStop: true, coordinates: { lat: 19.0155, lng: 72.8555 } },
  { id: 'jacob-circle', name: 'Jacob Circle', nameHi: 'जैकब सर्किल', nameMr: 'जैकब सर्किल', line: 'monorail', zone: 'South', platforms: 2, distance: 19.5, facilities: ['Ticket Counter', 'Elevator', 'AC', 'Western Connect'], parking: false, wheelchair: true, fastStop: true, coordinates: { lat: 18.9955, lng: 72.8255 } },
];

// ============================================================================
// Line Information Database
// ============================================================================

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
    avgDailyRidership: 3500000,
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
    avgDailyRidership: 4000000,
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
    avgDailyRidership: 1200000,
  },
  'trans-harbour': {
    id: 'trans-harbour',
    name: 'Trans-Harbour Line',
    nameHi: 'ट्रान्स-हार्बर रेखा',
    color: '#8B5CF6',
    colorCode: 'violet',
    endpoints: ['Thane', 'Vashi'],
    length: 18,
    stations: 7,
    firstTrain: '05:00',
    lastTrain: '23:30',
    frequency: '10-15 min',
    avgDailyRidership: 400000,
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
    avgDailyRidership: 500000,
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
    avgDailyRidership: 200000,
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
    avgDailyRidership: 180000,
  },
  monorail: {
    id: 'monorail',
    name: 'Monorail',
    nameHi: 'मोनोरेल',
    color: '#22C55E',
    colorCode: 'green',
    endpoints: ['Wadala', 'Jacob Circle'],
    length: 19.5,
    stations: 17,
    firstTrain: '06:00',
    lastTrain: '22:00',
    frequency: '15-20 min',
    avgDailyRidership: 45000,
  },
};

// ============================================================================
// Connection Map for Journey Planning
// ============================================================================

export const STATION_CONNECTIONS: Record<string, string[]> = {
  'dadar-w': ['dadar-c', 'mahim'],
  'dadar-c': ['dadar-w', 'matunga-c'],
  'kurla-c': ['kurla-h', 'kurla-th'],
  'ghatkopar': ['ghatkopar-metro'],
  'andheri': ['andheri-metro', 'andheri-west', 'andheri-east-7'],
  'thane': ['thane-th', 'thane-c'],
  'vashi': ['vashi-th', 'vashi-h'],
  'chembur': ['chembur-monorail'],
  'wadala-road': ['wadala-monorail'],
  'parel': ['lower-parel'],
  'bandra': ['bandra-terminus'],
  'csmt': ['csmt-h'],
  'dahisar': ['dahisar-east', 'dahisar-east-7'],
  'versova': ['dn-nagar', 'dn-nagar-2a'],
};

// ============================================================================
// Fare Calculation
// ============================================================================

/**
 * Calculate fare between two stations
 */
export function calculateFare(from: Station, to: Station): Fare | null {
  if (from.line !== to.line && !isConnectedLine(from.line, to.line)) {
    return null;
  }

  const distance = Math.abs(to.distance - from.distance);
  const isMetro = from.line.startsWith('metro') || to.line.startsWith('metro');
  const isMonorail = from.line === 'monorail' || to.line === 'monorail';

  let secondClass: number;
  let firstClass: number;

  if (isMetro) {
    const fares = FARE_STRUCTURE.METRO;
    const bracketIndex = fares.DISTANCE_BRACKETS.findIndex(d => distance <= d);
    secondClass = fares.BASE_FARES[bracketIndex === -1 ? fares.BASE_FARES.length - 1 : bracketIndex];
    firstClass = secondClass * fares.FIRST_CLASS_MULTIPLIER;
  } else if (isMonorail) {
    // Monorail flat fare structure
    if (distance <= 5) secondClass = 10;
    else if (distance <= 10) secondClass = 20;
    else secondClass = 30;
    firstClass = secondClass;
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
 * Check if two lines are connected
 */
function isConnectedLine(line1: LineId, line2: LineId): boolean {
  const connections: Record<string, LineId[]> = {
    western: ['metro-1', 'metro-2a', 'metro-7', 'harbour', 'monorail'],
    central: ['harbour', 'metro-1', 'trans-harbour'],
    harbour: ['central', 'monorail', 'trans-harbour', 'western'],
    'trans-harbour': ['central', 'harbour'],
    'metro-1': ['western', 'central', 'metro-2a', 'metro-7'],
    'metro-2a': ['western', 'metro-1'],
    'metro-7': ['western', 'metro-1'],
    monorail: ['harbour', 'central'],
  };

  return connections[line1]?.includes(line2) ?? false;
}

// ============================================================================
// Journey Planner
// ============================================================================

/**
 * Find journey routes between two stations
 */
export function findRoutes(from: Station, to: Station): JourneyRoute[] {
  const routes: JourneyRoute[] = [];

  // Direct route on same line
  if (from.line === to.line) {
    const fare = calculateFare(from, to);
    if (fare) {
      routes.push({
        id: `direct-${from.id}-${to.id}`,
        from,
        to,
        legs: [{
          from,
          to,
          line: from.line,
          trainType: 'slow',
          departureTime: 'Now',
          arrivalTime: `${Math.round(Math.abs(to.distance - from.distance) * 2)} min`,
          duration: Math.round(Math.abs(to.distance - from.distance) * 2),
          platforms: { from: 1, to: 1 },
        }],
        totalTime: Math.round(Math.abs(to.distance - from.distance) * 2),
        totalDistance: Math.abs(to.distance - from.distance),
        fare,
        transfers: 0,
        departureTime: 'Now',
        arrivalTime: `${Math.round(Math.abs(to.distance - from.distance) * 2)} min`,
      });
    }
  }

  // Find transfer routes
  if (isConnectedLine(from.line, to.line)) {
    const transferStation = findTransferStation(from.line, to.line);
    if (transferStation) {
      const transferStn = STATIONS.find(s => s.id === transferStation || s.line === from.line);
      if (transferStn) {
        const fare = calculateFare(from, to);
        if (fare) {
          routes.push({
            id: `transfer-${from.id}-${to.id}`,
            from,
            to,
            legs: [
              {
                from,
                to: transferStn,
                line: from.line,
                trainType: 'slow',
                departureTime: 'Now',
                arrivalTime: `${Math.round(Math.abs(transferStn.distance - from.distance) * 2)} min`,
                duration: Math.round(Math.abs(transferStn.distance - from.distance) * 2),
                platforms: { from: 1, to: 2 },
              },
              {
                from: transferStn,
                to,
                line: to.line,
                trainType: 'slow',
                departureTime: '+5 min',
                arrivalTime: `${Math.round(Math.abs(to.distance - transferStn.distance) * 2) + 5} min`,
                duration: Math.round(Math.abs(to.distance - transferStn.distance) * 2) + 5,
                platforms: { from: 3, to: 1 },
              },
            ],
            totalTime: Math.round(Math.abs(to.distance - from.distance) * 2) + 5,
            totalDistance: Math.abs(to.distance - from.distance),
            fare,
            transfers: 1,
            departureTime: 'Now',
            arrivalTime: `${Math.round(Math.abs(to.distance - from.distance) * 2) + 5} min`,
          });
        }
      }
    }
  }

  return routes;
}

/**
 * Find a transfer station between two lines
 */
function findTransferStation(line1: LineId, line2: LineId): string | null {
  const transferPoints: Record<string, Record<string, string>> = {
    'western-central': 'dadar-w',
    'western-harbour': 'mahim',
    'central-harbour': 'kurla-c',
    'central-metro-1': 'ghatkopar',
    'western-metro-1': 'andheri',
    'harbour-monorail': 'wadala-road',
    'trans-harbour-harbour': 'vashi',
    'trans-harbour-central': 'thane',
  };

  const key1 = `${line1}-${line2}`;
  const key2 = `${line2}-${line1}`;

  return transferPoints[key1] || transferPoints[key2] || null;
}

// ============================================================================
// Train Schedule Generation
// ============================================================================

/**
 * Get next trains from a station
 */
export function getNextTrains(
  fromStation: Station,
  toStation: Station | null,
  limit = 5
): { id: string; from: string; to: string; departure: string; arrival: string; type: TrainType; days: string[]; platform?: number }[] {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const trains: { id: string; from: string; to: string; departure: string; arrival: string; type: TrainType; days: string[]; platform?: number }[] = [];

  const isMetro = fromStation.line.startsWith('metro');
  const isMonorail = fromStation.line === 'monorail';
  const frequency = isMonorail ? 15 : isMetro ? 5 : 4;
  const startHour = isMetro || isMonorail ? 6 : 4;
  const endHour = isMetro || isMonorail ? 23 : 1;

  const destinations = getDestinationsForLine(fromStation.line);

  for (let hour = startHour; hour <= (endHour < startHour ? endHour + 24 : endHour); hour++) {
    for (let min = 0; min < 60; min += frequency) {
      const actualHour = hour > 23 ? hour - 24 : hour;
      const trainMinutes = actualHour * 60 + min;

      const isAfterMidnight = currentMinutes < startHour * 60;
      const trainIsRelevant = isAfterMidnight
        ? trainMinutes >= startHour * 60
        : trainMinutes > currentMinutes;

      if (trainIsRelevant) {
        const departure = `${String(actualHour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
        const trainType: TrainType = determineTrainType(fromStation, min, hour);
        const dest = toStation?.name || destinations[Math.floor(trainMinutes / 30) % destinations.length];
        const travelTime = toStation ? Math.round(Math.abs(toStation.distance - fromStation.distance) * 2) : 25;

        trains.push({
          id: `${fromStation.id}-${departure}-${trainType}`,
          from: fromStation.name,
          to: dest,
          departure,
          arrival: calculateArrivalTime(departure, travelTime),
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

function getDestinationsForLine(line: LineId): string[] {
  const destinations: Record<LineId, string[]> = {
    western: ['Churchgate', 'Virar', 'Borivali', 'Dahanu Road'],
    central: ['CSMT', 'Kalyan', 'Kasara', 'Karjat', 'Khopoli'],
    harbour: ['CSMT', 'Panvel', 'Goregaon'],
    'trans-harbour': ['Thane', 'Vashi', 'Nerul'],
    'metro-1': ['Versova', 'Ghatkopar'],
    'metro-2a': ['Dahisar East', 'D.N. Nagar'],
    'metro-7': ['Dahisar East', 'Andheri East'],
    monorail: ['Wadala', 'Jacob Circle', 'Chembur'],
  };
  return destinations[line] || ['Unknown'];
}

function determineTrainType(station: Station, minute: number, hour: number): TrainType {
  if (minute % 30 === 0 && hour >= 7 && hour <= 11) return 'ladies';
  if (station.fastStop) {
    if (minute % 15 === 0) return 'fast';
    if (minute % 8 === 0) return 'semi-fast';
  }
  return 'slow';
}

function calculateArrivalTime(departure: string, travelMinutes: number): string {
  const [h, m] = departure.split(':').map(Number);
  const totalMinutes = h * 60 + m + travelMinutes;
  const arrivalH = Math.floor(totalMinutes / 60) % 24;
  const arrivalM = totalMinutes % 60;
  return `${String(arrivalH).padStart(2, '0')}:${String(arrivalM).padStart(2, '0')}`;
}

function getPlatform(station: Station, type: TrainType): number {
  if (type === 'fast' && station.platforms >= 3) return station.platforms;
  return Math.min(2, station.platforms);
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Find station by ID or name
 */
export function findStation(query: string): Station | undefined {
  return STATIONS.find(s => 
    s.id === query || 
    s.name.toLowerCase() === query.toLowerCase() ||
    s.nameHi === query
  );
}

/**
 * Get stations by line
 */
export function getStationsByLine(line: LineId): Station[] {
  return STATIONS.filter(s => s.line === line);
}

/**
 * Search stations by name
 */
export function searchStations(query: string, limit = 20): Station[] {
  const q = query.toLowerCase();
  return STATIONS.filter(s => 
    s.name.toLowerCase().includes(q) ||
    s.nameHi.includes(query) ||
    s.nameMr?.includes(query) ||
    s.id.includes(q)
  ).slice(0, limit);
}

/**
 * Get last train time for a line
 */
export function getLastTrain(line: LineId, stationId: string, direction: 'up' | 'down'): string {
  const lineInfo = LINES[line];
  if (!lineInfo) return '--:--';

  const isMetro = line.startsWith('metro');
  const baseHour = isMetro ? 22 : 0;
  const baseMinute = isMetro ? 30 : 30;

  // Adjust based on station position
  const station = STATIONS.find(s => s.id === stationId);
  if (!station) return lineInfo.lastTrain;

  const distanceFactor = Math.floor(station.distance / 20);
  const adjustedHour = baseHour + distanceFactor;
  const adjustedMinute = baseMinute + (station.distance % 20);

  return `${String(adjustedHour % 24).padStart(2, '0')}:${String(adjustedMinute % 60).padStart(2, '0')}`;
}

/**
 * Get transport statistics
 */
export function getTransportStats() {
  return {
    totalStations: STATIONS.length,
    totalLines: Object.keys(LINES).length,
    totalDistance: Object.values(LINES).reduce((sum, l) => sum + l.length, 0),
    dailyRidership: Object.values(LINES).reduce((sum, l) => sum + (l.avgDailyRidership || 0), 0),
    avgFrequency: 5,
  };
}
