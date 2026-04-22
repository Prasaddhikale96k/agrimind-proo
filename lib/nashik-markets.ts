export interface NashikMarket {
  id: string;
  name: string;
  nameMarathi: string;
  address: string;
  district: string;
  taluka: string;
  state: string;
  latitude: number;
  longitude: number;
  marketType: string;
  commodities: string[];
  openDays: string;
  contactNumber?: string;
  isAPMC: boolean;
}

export const NASHIK_MARKETS: NashikMarket[] = [
  {
    id: 'nashik-main',
    name: 'Nashik',
    nameMarathi: 'नाशिक',
    address: 'APMC Market Yard, Nashik Pune Road, Nashik',
    district: 'Nashik',
    taluka: 'Nashik',
    state: 'Maharashtra',
    latitude: 19.9975,
    longitude: 73.7898,
    marketType: 'APMC',
    commodities: ['Onion', 'Tomato', 'Grapes', 'Wheat'],
    openDays: 'Mon-Sat',
    contactNumber: '0253-2317400',
    isAPMC: true,
  },
  {
    id: 'lasalgaon',
    name: 'Lasalgaon',
    nameMarathi: 'लासलगाव',
    address: 'APMC Market Yard, Lasalgaon, Niphad',
    district: 'Nashik',
    taluka: 'Niphad',
    state: 'Maharashtra',
    latitude: 20.1167,
    longitude: 74.0833,
    marketType: 'APMC',
    commodities: ['Onion', 'Tomato', 'Garlic'],
    openDays: 'Mon-Sat',
    contactNumber: '02550-260033',
    isAPMC: true,
  },
  {
    id: 'pimpalgaon',
    name: 'Pimpalgaon Baswant',
    nameMarathi: 'पिंपळगाव बसवंत',
    address: 'APMC Pimpalgaon Baswant, Niphad Taluka',
    district: 'Nashik',
    taluka: 'Niphad',
    state: 'Maharashtra',
    latitude: 20.0833,
    longitude: 74.0500,
    marketType: 'APMC',
    commodities: ['Onion', 'Grapes', 'Pomegranate'],
    openDays: 'Mon-Sat',
    isAPMC: true,
  },
  {
    id: 'yeola',
    name: 'Yeola',
    nameMarathi: 'येवला',
    address: 'APMC Market Yard, Yeola',
    district: 'Nashik',
    taluka: 'Yeola',
    state: 'Maharashtra',
    latitude: 20.0456,
    longitude: 74.4892,
    marketType: 'APMC',
    commodities: ['Onion', 'Cotton', 'Soybean'],
    openDays: 'Mon-Sat',
    isAPMC: true,
  },
  {
    id: 'malegaon',
    name: 'Malegaon',
    nameMarathi: 'मालेगाव',
    address: 'APMC Market Yard, Malegaon',
    district: 'Nashik',
    taluka: 'Malegaon',
    state: 'Maharashtra',
    latitude: 20.5579,
    longitude: 74.5089,
    marketType: 'APMC',
    commodities: ['Cotton', 'Onion', 'Bajra', 'Wheat'],
    openDays: 'Mon-Sat',
    contactNumber: '02554-252345',
    isAPMC: true,
  },
  {
    id: 'sinnar',
    name: 'Sinnar',
    nameMarathi: 'सिन्नर',
    address: 'APMC Market Yard, Sinnar',
    district: 'Nashik',
    taluka: 'Sinnar',
    state: 'Maharashtra',
    latitude: 19.8478,
    longitude: 74.0022,
    marketType: 'APMC',
    commodities: ['Onion', 'Tomato', 'Wheat'],
    openDays: 'Mon-Sat',
    isAPMC: true,
  },
  {
    id: 'chandwad',
    name: 'Chandwad',
    nameMarathi: 'चांदवड',
    address: 'APMC Market Yard, Chandwad',
    district: 'Nashik',
    taluka: 'Chandwad',
    state: 'Maharashtra',
    latitude: 20.3392,
    longitude: 74.2394,
    marketType: 'APMC',
    commodities: ['Onion', 'Grapes', 'Pomegranate'],
    openDays: 'Mon-Sat',
    isAPMC: true,
  },
  {
    id: 'niphad',
    name: 'Niphad',
    nameMarathi: 'निफाड',
    address: 'APMC Market Yard, Niphad',
    district: 'Nashik',
    taluka: 'Niphad',
    state: 'Maharashtra',
    latitude: 20.0833,
    longitude: 74.1167,
    marketType: 'APMC',
    commodities: ['Grapes', 'Onion', 'Tomato'],
    openDays: 'Mon-Sat',
    isAPMC: true,
  },
  {
    id: 'igatpuri',
    name: 'Igatpuri',
    nameMarathi: 'इगतपुरी',
    address: 'APMC Market Yard, Igatpuri',
    district: 'Nashik',
    taluka: 'Igatpuri',
    state: 'Maharashtra',
    latitude: 19.6939,
    longitude: 73.5603,
    marketType: 'APMC',
    commodities: ['Rice', 'Vegetables', 'Strawberry'],
    openDays: 'Mon-Sat',
    isAPMC: true,
  },
  {
    id: 'dindori',
    name: 'Dindori',
    nameMarathi: 'दिंडोरी',
    address: 'APMC Market Yard, Dindori',
    district: 'Nashik',
    taluka: 'Dindori',
    state: 'Maharashtra',
    latitude: 20.2167,
    longitude: 73.8333,
    marketType: 'APMC',
    commodities: ['Grapes', 'Onion', 'Vegetables'],
    openDays: 'Mon-Sat',
    isAPMC: true,
  },
  {
    id: 'kalwan',
    name: 'Kalwan',
    nameMarathi: 'कळवण',
    address: 'APMC Market Yard, Kalwan',
    district: 'Nashik',
    taluka: 'Kalwan',
    state: 'Maharashtra',
    latitude: 20.5000,
    longitude: 73.8333,
    marketType: 'APMC',
    commodities: ['Onion', 'Wheat', 'Maize'],
    openDays: 'Mon-Sat',
    isAPMC: true,
  },
  {
    id: 'surgana',
    name: 'Surgana',
    nameMarathi: 'सुरगाणा',
    address: 'APMC Market Yard, Surgana',
    district: 'Nashik',
    taluka: 'Surgana',
    state: 'Maharashtra',
    latitude: 20.5667,
    longitude: 73.6167,
    marketType: 'APMC',
    commodities: ['Rice', 'Vegetables', 'Maize'],
    openDays: 'Mon-Sat',
    isAPMC: true,
  },
  {
    id: 'satana',
    name: 'Satana',
    nameMarathi: 'सटाणा',
    address: 'APMC Market Yard, Satana, Baglan',
    district: 'Nashik',
    taluka: 'Baglan',
    state: 'Maharashtra',
    latitude: 20.5961,
    longitude: 74.2092,
    marketType: 'APMC',
    commodities: ['Onion', 'Cotton', 'Bajra'],
    openDays: 'Mon-Sat',
    isAPMC: true,
  },
  {
    id: 'trimbakeshwar',
    name: 'Trimbakeshwar',
    nameMarathi: 'त्र्यंबकेश्वर',
    address: 'APMC Market Yard, Trimbakeshwar',
    district: 'Nashik',
    taluka: 'Trimbakeshwar',
    state: 'Maharashtra',
    latitude: 19.9333,
    longitude: 73.5333,
    marketType: 'APMC',
    commodities: ['Vegetables', 'Fruits', 'Grains'],
    openDays: 'Mon-Sat',
    isAPMC: true,
  },
  {
    id: 'deola',
    name: 'Deola',
    nameMarathi: 'देवळा',
    address: 'APMC Market Yard, Deola',
    district: 'Nashik',
    taluka: 'Deola',
    state: 'Maharashtra',
    latitude: 20.4167,
    longitude: 74.2333,
    marketType: 'APMC',
    commodities: ['Onion', 'Wheat', 'Soybean'],
    openDays: 'Mon-Sat',
    isAPMC: true,
  },
];

export function findMarketByName(name: string): NashikMarket | undefined {
  const lower = name.toLowerCase().trim();
  return NASHIK_MARKETS.find(
    (m) =>
      m.name.toLowerCase().includes(lower) ||
      lower.includes(m.name.toLowerCase()) ||
      m.id.includes(lower)
  );
}

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export function getNearestMarkets(
  userLat: number,
  userLng: number,
  limit: number = 5
): (NashikMarket & { distance: number })[] {
  return NASHIK_MARKETS.map((market) => ({
    ...market,
    distance: calculateDistance(
      userLat, userLng,
      market.latitude, market.longitude
    ),
  }))
  .sort((a, b) => a.distance - b.distance)
  .slice(0, limit) as any;
}