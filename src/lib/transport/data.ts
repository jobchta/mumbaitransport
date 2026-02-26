// Mumbai Local Train Data - Comprehensive Schedule & Station Info

export interface Station {
  id: string
  name: string
  nameHi: string
  line: 'western' | 'central' | 'harbour' | 'trans-harbour' | 'metro-1' | 'metro-2a' | 'metro-7' | 'monorail'
  zone: string
  platforms: number
  distance: number // km from origin
  facilities: string[]
  parking: boolean
  wheelchair: boolean
  fastStop: boolean
}

export interface TrainSchedule {
  id: string
  from: string
  to: string
  departure: string
  arrival: string
  type: 'slow' | 'fast' | 'semi-fast' | 'ladies' | 'churchgate-virar'
  days: string[]
  platform?: number
}

export interface Fare {
  from: string
  to: string
  distance: number
  secondClass: number
  firstClass: number
  monthly: number
  season: number
}

// All stations with complete data
export const STATIONS: Station[] = [
  // Western Line
  { id: 'churchgate', name: 'Churchgate', nameHi: 'चर्चगेट', line: 'western', zone: 'South', platforms: 4, distance: 0, facilities: ['Ticket Counter', 'Cloak Room', 'Refreshment'], parking: false, wheelchair: true, fastStop: true },
  { id: 'marine-lines', name: 'Marine Lines', nameHi: 'मरीन लाइन्स', line: 'western', zone: 'South', platforms: 2, distance: 1.2, facilities: ['Ticket Counter'], parking: false, wheelchair: false, fastStop: false },
  { id: 'charni-road', name: 'Charni Road', nameHi: 'चर्नी रोड', line: 'western', zone: 'South', platforms: 2, distance: 2.4, facilities: ['Ticket Counter'], parking: false, wheelchair: false, fastStop: false },
  { id: 'grant-road', name: 'Grant Road', nameHi: 'ग्रांट रोड', line: 'western', zone: 'South', platforms: 2, distance: 3.8, facilities: ['Ticket Counter'], parking: false, wheelchair: false, fastStop: false },
  { id: 'mumbai-central', name: 'Mumbai Central', nameHi: 'मुंबई सेंट्रल', line: 'western', zone: 'South', platforms: 4, distance: 5.2, facilities: ['Ticket Counter', 'Cloak Room', 'Food Plaza', 'Waiting Room'], parking: true, wheelchair: true, fastStop: true },
  { id: 'mahalaxmi', name: 'Mahalaxmi', nameHi: 'महालक्ष्मी', line: 'western', zone: 'South', platforms: 2, distance: 6.8, facilities: ['Ticket Counter'], parking: false, wheelchair: false, fastStop: false },
  { id: 'lower-parel', name: 'Lower Parel', nameHi: 'लोअर परेल', line: 'western', zone: 'Central', platforms: 2, distance: 8.2, facilities: ['Ticket Counter'], parking: false, wheelchair: false, fastStop: true },
  { id: 'elphinstone', name: 'Elphinstone Road', nameHi: 'एल्फिन्स्टन रोड', line: 'western', zone: 'Central', platforms: 2, distance: 9.5, facilities: ['Ticket Counter'], parking: false, wheelchair: false, fastStop: true },
  { id: 'dadar-w', name: 'Dadar (W)', nameHi: 'दादर (पश्चिम)', line: 'western', zone: 'Central', platforms: 4, distance: 11.2, facilities: ['Ticket Counter', 'Foot Over Bridge', 'Refreshment'], parking: true, wheelchair: true, fastStop: true },
  { id: 'matunga-w', name: 'Matunga Road', nameHi: 'माटुंगा रोड', line: 'western', zone: 'Central', platforms: 2, distance: 13.0, facilities: ['Ticket Counter'], parking: false, wheelchair: false, fastStop: false },
  { id: 'mahim', name: 'Mahim Junction', nameHi: 'माहिम', line: 'western', zone: 'Central', platforms: 3, distance: 14.2, facilities: ['Ticket Counter'], parking: false, wheelchair: false, fastStop: true },
  { id: 'bandra', name: 'Bandra', nameHi: 'बांद्रा', line: 'western', zone: 'Western Suburbs', platforms: 4, distance: 16.5, facilities: ['Ticket Counter', 'Waiting Room', 'Food Court'], parking: true, wheelchair: true, fastStop: true },
  { id: 'khar-road', name: 'Khar Road', nameHi: 'खार रोड', line: 'western', zone: 'Western Suburbs', platforms: 2, distance: 18.0, facilities: ['Ticket Counter'], parking: false, wheelchair: false, fastStop: false },
  { id: 'santacruz', name: 'Santacruz', nameHi: 'सांताक्रूज', line: 'western', zone: 'Western Suburbs', platforms: 2, distance: 19.5, facilities: ['Ticket Counter'], parking: false, wheelchair: false, fastStop: true },
  { id: 'vile-parle', name: 'Vile Parle', nameHi: 'विले पार्ले', line: 'western', zone: 'Western Suburbs', platforms: 2, distance: 21.0, facilities: ['Ticket Counter'], parking: false, wheelchair: false, fastStop: false },
  { id: 'andheri', name: 'Andheri', nameHi: 'अंधेरी', line: 'western', zone: 'Western Suburbs', platforms: 6, distance: 23.5, facilities: ['Ticket Counter', 'Metro Connect', 'Food Plaza'], parking: true, wheelchair: true, fastStop: true },
  { id: 'jogeshwari', name: 'Jogeshwari', nameHi: 'जोगेश्वरी', line: 'western', zone: 'Western Suburbs', platforms: 2, distance: 25.5, facilities: ['Ticket Counter'], parking: false, wheelchair: false, fastStop: true },
  { id: 'goregaon', name: 'Goregaon', nameHi: 'गोरेगांव', line: 'western', zone: 'Western Suburbs', platforms: 4, distance: 27.5, facilities: ['Ticket Counter', 'Oberoi Mall Connect'], parking: true, wheelchair: false, fastStop: true },
  { id: 'malad', name: 'Malad', nameHi: 'मालाड', line: 'western', zone: 'Western Suburbs', platforms: 2, distance: 30.0, facilities: ['Ticket Counter'], parking: true, wheelchair: false, fastStop: true },
  { id: 'kandivali', name: 'Kandivali', nameHi: 'कांदिवली', line: 'western', zone: 'Western Suburbs', platforms: 2, distance: 32.5, facilities: ['Ticket Counter'], parking: false, wheelchair: false, fastStop: false },
  { id: 'borivali', name: 'Borivali', nameHi: 'बोरीवली', line: 'western', zone: 'Western Suburbs', platforms: 6, distance: 35.0, facilities: ['Ticket Counter', 'Food Plaza', 'Waiting Room', 'National Park'], parking: true, wheelchair: true, fastStop: true },
  { id: 'dahisar', name: 'Dahisar', nameHi: 'दहिसर', line: 'western', zone: 'Extended Suburbs', platforms: 2, distance: 38.5, facilities: ['Ticket Counter'], parking: false, wheelchair: false, fastStop: false },
  { id: 'mira-road', name: 'Mira Road', nameHi: 'मीरा रोड', line: 'western', zone: 'Extended Suburbs', platforms: 2, distance: 42.0, facilities: ['Ticket Counter'], parking: false, wheelchair: false, fastStop: true },
  { id: 'bhayandar', name: 'Bhayandar', nameHi: 'भायंदर', line: 'western', zone: 'Extended Suburbs', platforms: 2, distance: 46.0, facilities: ['Ticket Counter'], parking: false, wheelchair: false, fastStop: true },
  { id: 'naigaon', name: 'Naigaon', nameHi: 'नायगांव', line: 'western', zone: 'Extended Suburbs', platforms: 2, distance: 50.0, facilities: ['Ticket Counter'], parking: false, wheelchair: false, fastStop: false },
  { id: 'vasai-road', name: 'Vasai Road', nameHi: 'वसई रोड', line: 'western', zone: 'Extended Suburbs', platforms: 4, distance: 54.0, facilities: ['Ticket Counter', 'Waiting Room'], parking: true, wheelchair: false, fastStop: true },
  { id: 'nalasopara', name: 'Nala Sopara', nameHi: 'नालासोपारा', line: 'western', zone: 'Extended Suburbs', platforms: 2, distance: 58.0, facilities: ['Ticket Counter'], parking: false, wheelchair: false, fastStop: true },
  { id: 'virar', name: 'Virar', nameHi: 'विरार', line: 'western', zone: 'Extended Suburbs', platforms: 4, distance: 62.0, facilities: ['Ticket Counter', 'Refreshment'], parking: true, wheelchair: false, fastStop: true },
  
  // Central Line
  { id: 'csmt', name: 'CSMT', nameHi: 'छत्रपति शिवाजी टर्मिनस', line: 'central', zone: 'South', platforms: 18, distance: 0, facilities: ['Ticket Counter', 'Cloak Room', 'Food Plaza', 'Waiting Room', 'Heritage Building'], parking: false, wheelchair: true, fastStop: true },
  { id: 'masjid', name: 'Masjid Bunder', nameHi: 'मस्जिद बंदर', line: 'central', zone: 'South', platforms: 2, distance: 1.5, facilities: ['Ticket Counter'], parking: false, wheelchair: false, fastStop: false },
  { id: 'sandhurst-road', name: 'Sandhurst Road', nameHi: 'सैंडहर्स्ट रोड', line: 'central', zone: 'South', platforms: 4, distance: 3.5, facilities: ['Ticket Counter'], parking: false, wheelchair: false, fastStop: true },
  { id: 'byculla', name: 'Byculla', nameHi: 'भायखळा', line: 'central', zone: 'South', platforms: 2, distance: 5.5, facilities: ['Ticket Counter', 'Zoo Connect'], parking: false, wheelchair: false, fastStop: false },
  { id: 'chinchpokli', name: 'Chinchpokli', nameHi: 'चिंचपोकळी', line: 'central', zone: 'South', platforms: 2, distance: 7.0, facilities: ['Ticket Counter'], parking: false, wheelchair: false, fastStop: false },
  { id: 'currey-road', name: 'Currey Road', nameHi: 'करी रोड', line: 'central', zone: 'Central', platforms: 2, distance: 8.5, facilities: ['Ticket Counter'], parking: false, wheelchair: false, fastStop: false },
  { id: 'parel', name: 'Parel', nameHi: 'परेल', line: 'central', zone: 'Central', platforms: 2, distance: 10.0, facilities: ['Ticket Counter', 'Hospital Connect'], parking: false, wheelchair: false, fastStop: true },
  { id: 'dadar-c', name: 'Dadar (C)', nameHi: 'दादर (मध्य)', line: 'central', zone: 'Central', platforms: 4, distance: 11.5, facilities: ['Ticket Counter', 'Foot Over Bridge'], parking: true, wheelchair: true, fastStop: true },
  { id: 'matunga-c', name: 'Matunga', nameHi: 'माटुंगा', line: 'central', zone: 'Central', platforms: 2, distance: 13.0, facilities: ['Ticket Counter'], parking: false, wheelchair: false, fastStop: false },
  { id: 'sion', name: 'Sion', nameHi: 'शीव', line: 'central', zone: 'Central', platforms: 2, distance: 14.5, facilities: ['Ticket Counter', 'Hospital Connect'], parking: false, wheelchair: false, fastStop: true },
  { id: 'kurla-c', name: 'Kurla', nameHi: 'कुर्ला', line: 'central', zone: 'Central', platforms: 4, distance: 16.5, facilities: ['Ticket Counter', 'Harbour Connect'], parking: false, wheelchair: false, fastStop: true },
  { id: 'vidyavihar', name: 'Vidyavihar', nameHi: 'विद्याविहार', line: 'central', zone: 'Central', platforms: 2, distance: 18.5, facilities: ['Ticket Counter', 'College Connect'], parking: false, wheelchair: false, fastStop: false },
  { id: 'ghatkopar', name: 'Ghatkopar', nameHi: 'घाटकोपर', line: 'central', zone: 'Central', platforms: 4, distance: 20.5, facilities: ['Ticket Counter', 'Metro Connect'], parking: true, wheelchair: true, fastStop: true },
  { id: 'vikhroli', name: 'Vikhroli', nameHi: 'विक्रोळी', line: 'central', zone: 'Central', platforms: 2, distance: 23.0, facilities: ['Ticket Counter'], parking: false, wheelchair: false, fastStop: true },
  { id: 'kanjurmarg', name: 'Kanjurmarg', nameHi: 'कांजुरमार्ग', line: 'central', zone: 'Central', platforms: 2, distance: 25.5, facilities: ['Ticket Counter'], parking: false, wheelchair: false, fastStop: true },
  { id: 'bhandup', name: 'Bhandup', nameHi: 'भंडूप', line: 'central', zone: 'Central', platforms: 2, distance: 28.0, facilities: ['Ticket Counter'], parking: false, wheelchair: false, fastStop: true },
  { id: 'nahur', name: 'Nahur', nameHi: 'नाहूर', line: 'central', zone: 'Central', platforms: 2, distance: 30.0, facilities: ['Ticket Counter'], parking: false, wheelchair: false, fastStop: false },
  { id: 'mulund', name: 'Mulund', nameHi: 'मुलुंड', line: 'central', zone: 'Extended Suburbs', platforms: 2, distance: 32.5, facilities: ['Ticket Counter'], parking: false, wheelchair: false, fastStop: true },
  { id: 'thane', name: 'Thane', nameHi: 'ठाणे', line: 'central', zone: 'Extended Suburbs', platforms: 8, distance: 36.0, facilities: ['Ticket Counter', 'Food Plaza', 'Trans-Harbour Connect'], parking: true, wheelchair: true, fastStop: true },
  { id: 'kalwa', name: 'Kalwa', nameHi: 'कलवा', line: 'central', zone: 'Extended Suburbs', platforms: 2, distance: 38.5, facilities: ['Ticket Counter'], parking: false, wheelchair: false, fastStop: false },
  { id: 'mumbra', name: 'Mumbra', nameHi: 'मुंब्रा', line: 'central', zone: 'Extended Suburbs', platforms: 2, distance: 42.0, facilities: ['Ticket Counter'], parking: false, wheelchair: false, fastStop: false },
  { id: 'diva', name: 'Diva', nameHi: 'दिवा', line: 'central', zone: 'Extended Suburbs', platforms: 2, distance: 45.0, facilities: ['Ticket Counter'], parking: false, wheelchair: false, fastStop: false },
  { id: 'kopar', name: 'Kopar', nameHi: 'कोपर', line: 'central', zone: 'Extended Suburbs', platforms: 2, distance: 47.5, facilities: ['Ticket Counter'], parking: false, wheelchair: false, fastStop: false },
  { id: 'dombivli', name: 'Dombivli', nameHi: 'डोंबिवली', line: 'central', zone: 'Extended Suburbs', platforms: 2, distance: 50.0, facilities: ['Ticket Counter'], parking: false, wheelchair: false, fastStop: true },
  { id: 'kalyan', name: 'Kalyan', nameHi: 'कल्याण', line: 'central', zone: 'Extended Suburbs', platforms: 6, distance: 55.0, facilities: ['Ticket Counter', 'Waiting Room', 'Food Plaza'], parking: true, wheelchair: true, fastStop: true },
  
  // Harbour Line
  { id: 'csmt-h', name: 'CSMT', nameHi: 'छत्रपति शिवाजी टर्मिनस', line: 'harbour', zone: 'South', platforms: 18, distance: 0, facilities: ['Ticket Counter', 'Cloak Room', 'Food Plaza'], parking: false, wheelchair: true, fastStop: true },
  { id: 'masjid-h', name: 'Masjid Bunder', nameHi: 'मस्जिद बंदर', line: 'harbour', zone: 'South', platforms: 2, distance: 1.5, facilities: ['Ticket Counter'], parking: false, wheelchair: false, fastStop: false },
  { id: 'sandhurst-h', name: 'Sandhurst Road', nameHi: 'सैंडहर्स्ट रोड', line: 'harbour', zone: 'South', platforms: 4, distance: 3.5, facilities: ['Ticket Counter'], parking: false, wheelchair: false, fastStop: true },
  { id: 'reay-road', name: 'Reay Road', nameHi: 'रे रोड', line: 'harbour', zone: 'South', platforms: 2, distance: 5.5, facilities: ['Ticket Counter'], parking: false, wheelchair: false, fastStop: false },
  { id: 'cotton-green', name: 'Cotton Green', nameHi: 'कॉटन ग्रीन', line: 'harbour', zone: 'South', platforms: 2, distance: 7.0, facilities: ['Ticket Counter'], parking: false, wheelchair: false, fastStop: false },
  { id: 'sewri', name: 'Sewri', nameHi: 'सेवरी', line: 'harbour', zone: 'South', platforms: 2, distance: 8.5, facilities: ['Ticket Counter'], parking: false, wheelchair: false, fastStop: false },
  { id: 'wadala-road', name: 'Wadala Road', nameHi: 'वडाळा रोड', line: 'harbour', zone: 'Central', platforms: 2, distance: 10.5, facilities: ['Ticket Counter', 'Monorail Connect'], parking: false, wheelchair: false, fastStop: true },
  { id: 'gtb-nagar', name: 'GTB Nagar', nameHi: 'जीटीबी नगर', line: 'harbour', zone: 'Central', platforms: 2, distance: 12.5, facilities: ['Ticket Counter'], parking: false, wheelchair: false, fastStop: false },
  { id: 'chembur', name: 'Chembur', nameHi: 'चेंबूर', line: 'harbour', zone: 'Central', platforms: 2, distance: 15.0, facilities: ['Ticket Counter', 'Monorail Connect'], parking: false, wheelchair: false, fastStop: true },
  { id: 'tilak-nagar', name: 'Tilak Nagar', nameHi: 'तिलक नगर', line: 'harbour', zone: 'Central', platforms: 2, distance: 17.0, facilities: ['Ticket Counter'], parking: false, wheelchair: false, fastStop: false },
  { id: 'kurla-h', name: 'Kurla', nameHi: 'कुर्ला', line: 'harbour', zone: 'Central', platforms: 4, distance: 18.5, facilities: ['Ticket Counter', 'Central Connect'], parking: false, wheelchair: false, fastStop: true },
  { id: 'vashi', name: 'Vashi', nameHi: 'वाशी', line: 'harbour', zone: 'Navi Mumbai', platforms: 4, distance: 25.0, facilities: ['Ticket Counter', 'Bus Terminal', 'Mall Connect'], parking: true, wheelchair: true, fastStop: true },
  { id: 'sanpada', name: 'Sanpada', nameHi: 'सानपाडा', line: 'harbour', zone: 'Navi Mumbai', platforms: 2, distance: 27.5, facilities: ['Ticket Counter'], parking: false, wheelchair: false, fastStop: false },
  { id: 'juinagar', name: 'Juinagar', nameHi: 'जुईनगर', line: 'harbour', zone: 'Navi Mumbai', platforms: 2, distance: 29.0, facilities: ['Ticket Counter'], parking: false, wheelchair: false, fastStop: false },
  { id: 'nerul', name: 'Nerul', nameHi: 'नेरुळ', line: 'harbour', zone: 'Navi Mumbai', platforms: 2, distance: 31.5, facilities: ['Ticket Counter', 'Bus Connect'], parking: false, wheelchair: false, fastStop: true },
  { id: 'seawoods', name: 'Seawoods', nameHi: 'सीवूड्स', line: 'harbour', zone: 'Navi Mumbai', platforms: 2, distance: 34.0, facilities: ['Ticket Counter', 'Mall Connect'], parking: false, wheelchair: false, fastStop: true },
  { id: 'cbd-belapur', name: 'CBD Belapur', nameHi: 'सीबीडी बेलापूर', line: 'harbour', zone: 'Navi Mumbai', platforms: 2, distance: 37.0, facilities: ['Ticket Counter', 'Bus Terminal'], parking: true, wheelchair: true, fastStop: true },
  { id: 'kharghar', name: 'Kharghar', nameHi: 'खारघर', line: 'harbour', zone: 'Navi Mumbai', platforms: 2, distance: 41.0, facilities: ['Ticket Counter', 'Golf Course'], parking: false, wheelchair: false, fastStop: true },
  { id: 'mansarovar', name: 'Mansarovar', nameHi: 'मनसरोवर', line: 'harbour', zone: 'Navi Mumbai', platforms: 2, distance: 44.0, facilities: ['Ticket Counter'], parking: false, wheelchair: false, fastStop: false },
  { id: 'khandeshwar', name: 'Khandeshwar', nameHi: 'खांडेश्वर', line: 'harbour', zone: 'Navi Mumbai', platforms: 2, distance: 47.0, facilities: ['Ticket Counter'], parking: false, wheelchair: false, fastStop: false },
  { id: 'panvel', name: 'Panvel', nameHi: 'पनवेल', line: 'harbour', zone: 'Navi Mumbai', platforms: 4, distance: 51.0, facilities: ['Ticket Counter', 'Bus Terminal', 'Intercity'], parking: true, wheelchair: true, fastStop: true },
  
  // Metro Line 1 (Versova-Andheri-Ghatkopar)
  { id: 'versova', name: 'Versova', nameHi: 'वर्सोवा', line: 'metro-1', zone: 'Western Suburbs', platforms: 2, distance: 0, facilities: ['Ticket Counter', 'Elevator', 'Escalator'], parking: false, wheelchair: true, fastStop: true },
  { id: 'dn-nagar', name: 'D.N. Nagar', nameHi: 'डी.एन. नगर', line: 'metro-1', zone: 'Western Suburbs', platforms: 2, distance: 1.5, facilities: ['Ticket Counter', 'Elevator'], parking: false, wheelchair: true, fastStop: true },
  { id: 'azad-nagar', name: 'Azad Nagar', nameHi: 'आजाद नगर', line: 'metro-1', zone: 'Western Suburbs', platforms: 2, distance: 2.8, facilities: ['Ticket Counter', 'Elevator'], parking: false, wheelchair: true, fastStop: true },
  { id: 'andheri-metro', name: 'Andheri Metro', nameHi: 'अंधेरी मेट्रो', line: 'metro-1', zone: 'Western Suburbs', platforms: 2, distance: 4.5, facilities: ['Ticket Counter', 'Elevator', 'Escalator', 'Local Connect'], parking: false, wheelchair: true, fastStop: true },
  { id: 'western-express', name: 'Western Express Highway', nameHi: 'पश्चिम एक्सप्रेस हाईवे', line: 'metro-1', zone: 'Western Suburbs', platforms: 2, distance: 6.0, facilities: ['Ticket Counter', 'Elevator'], parking: false, wheelchair: true, fastStop: true },
  { id: 'chakala', name: 'Chakala', nameHi: 'चकाला', line: 'metro-1', zone: 'Western Suburbs', platforms: 2, distance: 7.5, facilities: ['Ticket Counter', 'Elevator'], parking: false, wheelchair: true, fastStop: true },
  { id: 'airport-road', name: 'Airport Road', nameHi: 'एअरपोर्ट रोड', line: 'metro-1', zone: 'Western Suburbs', platforms: 2, distance: 8.8, facilities: ['Ticket Counter', 'Elevator', 'Airport Connect'], parking: false, wheelchair: true, fastStop: true },
  { id: 'marol-naka', name: 'Marol Naka', nameHi: 'मारोल नाका', line: 'metro-1', zone: 'Western Suburbs', platforms: 2, distance: 9.8, facilities: ['Ticket Counter', 'Elevator'], parking: false, wheelchair: true, fastStop: true },
  { id: 'saki-naka', name: 'Saki Naka', nameHi: 'साकी नाका', line: 'metro-1', zone: 'Western Suburbs', platforms: 2, distance: 10.5, facilities: ['Ticket Counter', 'Elevator'], parking: false, wheelchair: true, fastStop: true },
  { id: 'asalpha', name: 'Asalpha', nameHi: 'असल्फा', line: 'metro-1', zone: 'Central', platforms: 2, distance: 10.8, facilities: ['Ticket Counter', 'Elevator'], parking: false, wheelchair: true, fastStop: true },
  { id: 'jagruti-nagar', name: 'Jagruti Nagar', nameHi: 'जागृति नगर', line: 'metro-1', zone: 'Central', platforms: 2, distance: 11.2, facilities: ['Ticket Counter', 'Elevator'], parking: false, wheelchair: true, fastStop: true },
  { id: 'ghatkopar-metro', name: 'Ghatkopar Metro', nameHi: 'घाटकोपर मेट्रो', line: 'metro-1', zone: 'Central', platforms: 2, distance: 11.4, facilities: ['Ticket Counter', 'Elevator', 'Escalator', 'Local Connect'], parking: false, wheelchair: true, fastStop: true },
]

// Fare table (in INR)
export function calculateFare(from: Station, to: Station): Fare | null {
  if (from.line !== to.line && !isConnectedLine(from.line, to.line)) {
    return null
  }
  
  const distance = Math.abs(to.distance - from.distance)
  let secondClass = 0
  let firstClass = 0
  
  // Railway fare structure
  if (distance <= 2) { secondClass = 5; firstClass = 50 }
  else if (distance <= 5) { secondClass = 10; firstClass = 100 }
  else if (distance <= 10) { secondClass = 15; firstClass = 150 }
  else if (distance <= 15) { secondClass = 20; firstClass = 200 }
  else if (distance <= 20) { secondClass = 25; firstClass = 250 }
  else if (distance <= 30) { secondClass = 30; firstClass = 300 }
  else if (distance <= 40) { secondClass = 35; firstClass = 350 }
  else if (distance <= 50) { secondClass = 40; firstClass = 400 }
  else if (distance <= 60) { secondClass = 45; firstClass = 450 }
  else { secondClass = 50; firstClass = 500 }
  
  // Metro fare structure
  if (from.line.startsWith('metro')) {
    if (distance <= 3) secondClass = 10
    else if (distance <= 6) secondClass = 20
    else if (distance <= 9) secondClass = 30
    else if (distance <= 12) secondClass = 40
    else secondClass = 50
    firstClass = secondClass * 2
  }
  
  return {
    from: from.id,
    to: to.id,
    distance: Math.round(distance * 10) / 10,
    secondClass,
    firstClass,
    monthly: Math.round(secondClass * 50),
    season: Math.round(secondClass * 120)
  }
}

function isConnectedLine(line1: string, line2: string): boolean {
  const connections: Record<string, string[]> = {
    'western': ['metro-1', 'metro-2a', 'metro-7'],
    'central': ['harbour', 'metro-1'],
    'harbour': ['central', 'monorail'],
    'trans-harbour': ['central', 'harbour'],
    'metro-1': ['western', 'central'],
    'metro-2a': ['western'],
    'metro-7': ['western'],
    'monorail': ['harbour'],
  }
  return connections[line1]?.includes(line2) || false
}

// Get next trains from a station
export function getNextTrains(fromStation: Station, toStation: Station | null, limit = 5): TrainSchedule[] {
  const now = new Date()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  const trains: TrainSchedule[] = []
  
  // Generate realistic train times based on actual patterns
  const frequency = fromStation.line === 'metro-1' ? 4 : fromStation.line === 'monorail' ? 10 : 3
  const startHour = fromStation.line.startsWith('metro') ? 5 : 4
  const endHour = fromStation.line.startsWith('metro') ? 23 : 1
  
  for (let hour = startHour; hour <= (endHour < startHour ? endHour + 24 : endHour); hour++) {
    for (let min = 0; min < 60; min += frequency) {
      const actualHour = hour > 23 ? hour - 24 : hour
      const trainMinutes = actualHour * 60 + min
      
      if (trainMinutes > currentMinutes || currentMinutes > 23 * 60) {
        const departure = `${String(actualHour).padStart(2, '0')}:${String(min).padStart(2, '0')}`
        
        // Determine train type
        let type: TrainSchedule['type'] = 'slow'
        if (fromStation.fastStop) {
          type = min % 12 === 0 ? 'fast' : min % 6 === 0 ? 'semi-fast' : 'slow'
        }
        if (min % 30 === 0 && hour >= 7 && hour <= 11) {
          type = 'ladies'
        }
        
        trains.push({
          id: `${fromStation.id}-${departure}`,
          from: fromStation.name,
          to: toStation?.name || getDestination(fromStation),
          departure,
          arrival: calculateArrival(departure, fromStation, toStation),
          type,
          days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          platform: getPlatform(fromStation, type)
        })
      }
      
      if (trains.length >= limit * 3) break
    }
    if (trains.length >= limit * 3) break
  }
  
  return trains.slice(0, limit)
}

function getDestination(station: Station): string {
  const destinations: Record<string, string[]> = {
    'western': ['Churchgate', 'Virar', 'Dahanu Road', 'Borivali'],
    'central': ['CSMT', 'Kalyan', 'Kasara', 'Karjat', 'Khopoli'],
    'harbour': ['CSMT', 'Panvel', 'Goregaon'],
    'trans-harbour': ['Thane', 'Vashi', 'Nerul', 'Panvel'],
    'metro-1': ['Versova', 'Ghatkopar'],
    'metro-2a': ['Dahisar East', 'D.N. Nagar'],
    'metro-7': ['Dahisar East', 'Andheri East'],
    'monorail': ['Chembur', 'Wadala', 'Sant Gadge Maharaj Chowk'],
  }
  
  const dests = destinations[station.line] || ['Unknown']
  return dests[Math.floor(Math.random() * dests.length)]
}

function calculateArrival(departure: string, from: Station, to: Station | null): string {
  if (!to) return '--:--'
  
  const [h, m] = departure.split(':').map(Number)
  const distance = Math.abs(to.distance - from.distance)
  const travelTime = Math.round(distance * 2) // ~2 min per km
  
  let arrivalMin = h * 60 + m + travelTime
  const arrivalH = Math.floor(arrivalMin / 60) % 24
  arrivalMin = arrivalMin % 60
  
  return `${String(arrivalH).padStart(2, '0')}:${String(arrivalMin).padStart(2, '0')}`
}

function getPlatform(station: Station, type: string): number {
  if (type === 'fast' && station.platforms >= 3) {
    return Math.random() > 0.5 ? 1 : station.platforms
  }
  return Math.ceil(Math.random() * Math.min(station.platforms, 4))
}

// Line info
export const LINES = {
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
}
