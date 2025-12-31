// ==========================================
// 1. TYPES & INTERFACES
// ==========================================

export interface Race {
  id: string;
  round: number;
  name: string;
  circuit: string;
  country: string;
  date: string;
  status: 'finished' | 'upcoming';
  flag: string;
  time?: string; // Optional time field for upcoming races
}

export interface Driver {
  id: string;
  name: string;
  shortName: string;
  team: string;
  teamColor: string;
  number: number;
  nationality: string;
  status: 'active' | 'reserve';
  stats?: {
    championships: number;
    wins: number;
    podiums: number;
    poles: number;
  };
}

export interface Prediction {
  position: number;
  driver: Driver;
  probability: number;
  reasons: {
    positive: string[];
    negative: string[];
  };
}

export interface Constructor {
  id: string;
  name: string;
  shortName: string;
  color: string;
  logo: string;
  points: number;
  position: number;
  trend: 'up' | 'down' | 'stable';
  drivers: string[]; // Array of driver IDs
  winProbability: number;
  carImage: string;
}

// ==========================================
// 2. DATA: DRIVERS
// ==========================================

export const drivers: Record<string, Driver> = {
  VER: { id: 'VER', name: 'Max Verstappen', shortName: 'VER', team: 'Red Bull Racing', teamColor: '#3671C6', number: 1, nationality: 'Dutch', status: 'active', stats: { championships: 3, wins: 54, podiums: 104, poles: 38 } },
  NOR: { id: 'NOR', name: 'Lando Norris', shortName: 'NOR', team: 'McLaren', teamColor: '#FF8000', number: 4, nationality: 'British', status: 'active', stats: { championships: 0, wins: 2, podiums: 21, poles: 4 } },
  HAM: { id: 'HAM', name: 'Lewis Hamilton', shortName: 'HAM', team: 'Mercedes', teamColor: '#27F4D2', number: 44, nationality: 'British', status: 'active', stats: { championships: 7, wins: 105, podiums: 197, poles: 104 } },
  LEC: { id: 'LEC', name: 'Charles Leclerc', shortName: 'LEC', team: 'Ferrari', teamColor: '#E8002D', number: 16, nationality: 'Monégasque', status: 'active', stats: { championships: 0, wins: 5, podiums: 35, poles: 25 } },
  SAI: { id: 'SAI', name: 'Carlos Sainz', shortName: 'SAI', team: 'Ferrari', teamColor: '#E8002D', number: 55, nationality: 'Spanish', status: 'active', stats: { championships: 0, wins: 3, podiums: 23, poles: 5 } },
  RUS: { id: 'RUS', name: 'George Russell', shortName: 'RUS', team: 'Mercedes', teamColor: '#27F4D2', number: 63, nationality: 'British', status: 'active', stats: { championships: 0, wins: 2, podiums: 12, poles: 3 } },
  PIA: { id: 'PIA', name: 'Oscar Piastri', shortName: 'PIA', team: 'McLaren', teamColor: '#FF8000', number: 81, nationality: 'Australian', status: 'active', stats: { championships: 0, wins: 2, podiums: 10, poles: 0 } },
  PER: { id: 'PER', name: 'Sergio Perez', shortName: 'PER', team: 'Red Bull Racing', teamColor: '#3671C6', number: 11, nationality: 'Mexican', status: 'active', stats: { championships: 0, wins: 6, podiums: 39, poles: 3 } },
  ALO: { id: 'ALO', name: 'Fernando Alonso', shortName: 'ALO', team: 'Aston Martin', teamColor: '#229971', number: 14, nationality: 'Spanish', status: 'active', stats: { championships: 2, wins: 32, podiums: 106, poles: 22 } },
  STR: { id: 'STR', name: 'Lance Stroll', shortName: 'STR', team: 'Aston Martin', teamColor: '#229971', number: 18, nationality: 'Canadian', status: 'active', stats: { championships: 0, wins: 0, podiums: 3, poles: 1 } },
  GAS: { id: 'GAS', name: 'Pierre Gasly', shortName: 'GAS', team: 'Alpine', teamColor: '#FF87BC', number: 10, nationality: 'French', status: 'active', stats: { championships: 0, wins: 1, podiums: 4, poles: 0 } },
  OCO: { id: 'OCO', name: 'Esteban Ocon', shortName: 'OCO', team: 'Alpine', teamColor: '#FF87BC', number: 31, nationality: 'French', status: 'active', stats: { championships: 0, wins: 1, podiums: 3, poles: 0 } },
  TSU: { id: 'TSU', name: 'Yuki Tsunoda', shortName: 'TSU', team: 'RB', teamColor: '#6692FF', number: 22, nationality: 'Japanese', status: 'active', stats: { championships: 0, wins: 0, podiums: 0, poles: 0 } },
  RIC: { id: 'RIC', name: 'Daniel Ricciardo', shortName: 'RIC', team: 'RB', teamColor: '#6692FF', number: 3, nationality: 'Australian', status: 'active', stats: { championships: 0, wins: 8, podiums: 32, poles: 3 } },
  HUL: { id: 'HUL', name: 'Nico Hulkenberg', shortName: 'HUL', team: 'Haas F1 Team', teamColor: '#B6BABD', number: 27, nationality: 'German', status: 'active', stats: { championships: 0, wins: 0, podiums: 0, poles: 1 } },
  MAG: { id: 'MAG', name: 'Kevin Magnussen', shortName: 'MAG', team: 'Haas F1 Team', teamColor: '#B6BABD', number: 20, nationality: 'Danish', status: 'active', stats: { championships: 0, wins: 0, podiums: 1, poles: 1 } },
  BOT: { id: 'BOT', name: 'Valtteri Bottas', shortName: 'BOT', team: 'Kick Sauber', teamColor: '#52E252', number: 77, nationality: 'Finnish', status: 'active', stats: { championships: 0, wins: 10, podiums: 67, poles: 20 } },
  ZHO: { id: 'ZHO', name: 'Zhou Guanyu', shortName: 'ZHO', team: 'Kick Sauber', teamColor: '#52E252', number: 24, nationality: 'Chinese', status: 'active', stats: { championships: 0, wins: 0, podiums: 0, poles: 0 } },
  ALB: { id: 'ALB', name: 'Alexander Albon', shortName: 'ALB', team: 'Williams', teamColor: '#64C4FF', number: 23, nationality: 'Thai', status: 'active', stats: { championships: 0, wins: 0, podiums: 2, poles: 0 } },
  SAR: { id: 'SAR', name: 'Logan Sargeant', shortName: 'SAR', team: 'Williams', teamColor: '#64C4FF', number: 2, nationality: 'American', status: 'active', stats: { championships: 0, wins: 0, podiums: 0, poles: 0 } },
};

// ==========================================
// 3. DATA: RACES
// ==========================================

export const races: Race[] = [
  {
    id: 'bahrain',
    round: 1,
    name: 'Gulf Air Bahrain Grand Prix',
    circuit: 'Bahrain International Circuit',
    country: 'Bahrain',
    date: '2025-03-02',
    status: 'finished',
    flag: '🇧🇭'
  },
  {
    id: 'saudi',
    round: 2,
    name: 'Saudi Arabian Grand Prix',
    circuit: 'Jeddah Corniche Circuit',
    country: 'Saudi Arabia',
    date: '2025-03-09',
    status: 'finished',
    flag: '🇸🇦'
  },
  {
    id: 'australia',
    round: 3,
    name: 'Australian Grand Prix',
    circuit: 'Albert Park Circuit',
    country: 'Australia',
    date: '2025-03-23',
    status: 'finished',
    flag: '🇦🇺'
  },
  {
    id: 'japan',
    round: 4,
    name: 'Japanese Grand Prix',
    circuit: 'Suzuka International Racing Course',
    country: 'Japan',
    date: '2025-04-06',
    status: 'finished',
    flag: '🇯🇵'
  },
  {
    id: 'china',
    round: 5,
    name: 'Chinese Grand Prix',
    circuit: 'Shanghai International Circuit',
    country: 'China',
    date: '2025-04-20',
    status: 'upcoming',
    flag: '🇨🇳'
  },
  {
    id: 'miami',
    round: 6,
    name: 'Miami Grand Prix',
    circuit: 'Miami International Autodrome',
    country: 'United States',
    date: '2025-05-04',
    status: 'upcoming',
    flag: '🇺🇸'
  },
  {
    id: 'imola',
    round: 7,
    name: 'Emilia Romagna Grand Prix',
    circuit: 'Autodromo Enzo e Dino Ferrari',
    country: 'Italy',
    date: '2025-05-18',
    status: 'upcoming',
    flag: '🇮🇹'
  },
  {
    id: 'monaco',
    round: 8,
    name: 'Monaco Grand Prix',
    circuit: 'Circuit de Monaco',
    country: 'Monaco',
    date: '2025-05-25',
    status: 'upcoming',
    flag: '🇲🇨'
  },
  {
    id: 'spain',
    round: 9,
    name: 'Spanish Grand Prix',
    circuit: 'Circuit de Barcelona-Catalunya',
    country: 'Spain',
    date: '2025-06-01',
    status: 'upcoming',
    flag: '🇪🇸'
  },
  {
    id: 'canada',
    round: 10,
    name: 'Canadian Grand Prix',
    circuit: 'Circuit Gilles Villeneuve',
    country: 'Canada',
    date: '2025-06-15',
    status: 'upcoming',
    flag: '🇨🇦'
  },
  
  // --- SPECIAL: AUSTRALIA 2026 TEST CASE ---
  {
    id: "australian-gp-2026", 
    round: 11,
    name: "Australian Grand Prix (2026)",
    circuit: "Albert Park Grand Prix Circuit",
    date: "2026-03-08", 
    time: "12:00 PM",
    flag: "🇦🇺",
    status: "upcoming",
    country: "Australia"
  },
  
  {
    id: 'britain',
    round: 12,
    name: 'Pirelli British Grand Prix',
    circuit: 'Silverstone Circuit',
    country: 'Great Britain',
    date: '2025-07-06',
    status: 'upcoming',
    flag: '🇬🇧'
  },
  {
    id: 'hungary',
    round: 13,
    name: 'Hungarian Grand Prix',
    circuit: 'Hungaroring',
    country: 'Hungary',
    date: '2025-07-20',
    status: 'upcoming',
    flag: '🇭🇺'
  },
  {
    id: 'belgium',
    round: 14,
    name: 'Belgian Grand Prix',
    circuit: 'Circuit de Spa-Francorchamps',
    country: 'Belgium',
    date: '2025-07-27',
    status: 'upcoming',
    flag: '🇧🇪'
  },
];

// ==========================================
// 4. DATA: CONSTRUCTORS
// ==========================================

export const constructors: Constructor[] = [
  {
    id: 'red-bull',
    name: 'Oracle Red Bull Racing',
    shortName: 'Red Bull',
    color: '#3671C6',
    logo: '🏎️',
    points: 860,
    position: 1,
    trend: 'stable',
    drivers: ['VER', 'PER'],
    winProbability: 72,
    carImage: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80'
  },
  {
    id: 'mclaren',
    name: 'McLaren F1 Team',
    shortName: 'McLaren',
    color: '#FF8000',
    logo: '🧡',
    points: 798,
    position: 2,
    trend: 'up',
    drivers: ['NOR', 'PIA'],
    winProbability: 65,
    carImage: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80'
  },
  {
    id: 'ferrari',
    name: 'Scuderia Ferrari',
    shortName: 'Ferrari',
    color: '#E8002D',
    logo: '🐎',
    points: 652,
    position: 3,
    trend: 'down',
    drivers: ['LEC', 'SAI'],
    winProbability: 45,
    carImage: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80'
  },
  {
    id: 'mercedes',
    name: 'Mercedes-AMG Petronas F1 Team',
    shortName: 'Mercedes',
    color: '#27F4D2',
    logo: '⭐',
    points: 584,
    position: 4,
    trend: 'up',
    drivers: ['HAM', 'RUS'],
    winProbability: 38,
    carImage: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80'
  },
  {
    id: 'aston-martin',
    name: 'Aston Martin Aramco F1 Team',
    shortName: 'Aston Martin',
    color: '#229971',
    logo: '💚',
    points: 312,
    position: 5,
    trend: 'stable',
    drivers: ['ALO', 'STR'],
    winProbability: 18,
    carImage: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80'
  },
  {
    id: 'alpine',
    name: 'BWT Alpine F1 Team',
    shortName: 'Alpine',
    color: '#FF87BC',
    logo: '🩷',
    points: 198,
    position: 6,
    trend: 'down',
    drivers: ['GAS', 'OCO'],
    winProbability: 12,
    carImage: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80'
  },
  {
    id: 'williams',
    name: 'Williams Racing',
    shortName: 'Williams',
    color: '#64C4FF',
    logo: '💙',
    points: 142,
    position: 7,
    trend: 'up',
    drivers: ['ALB', 'SAR'],
    winProbability: 8,
    carImage: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80'
  },
  {
    id: 'rb',
    name: 'Visa Cash App RB F1 Team',
    shortName: 'RB',
    color: '#6692FF',
    logo: '🔵',
    points: 98,
    position: 8,
    trend: 'stable',
    drivers: ['TSU', 'RIC'],
    winProbability: 5,
    carImage: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80'
  },
  {
    id: 'haas',
    name: 'MoneyGram Haas F1 Team',
    shortName: 'Haas',
    color: '#B6BABD',
    logo: '⚪',
    points: 54,
    position: 9,
    trend: 'down',
    drivers: ['HUL', 'MAG'],
    winProbability: 3,
    carImage: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80'
  },
  {
    id: 'sauber',
    name: 'Stake F1 Team Kick Sauber',
    shortName: 'Kick Sauber',
    color: '#52E252',
    logo: '💚',
    points: 28,
    position: 10,
    trend: 'stable',
    drivers: ['BOT', 'ZHO'],
    winProbability: 2,
    carImage: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80'
  },
];

// ==========================================
// 5. HELPER FUNCTIONS & MOCK DATA
// ==========================================

export const getPredictions = (raceId: string): Prediction[] => {
  // Mock predictions based on race - useful for fallback if API fails
  if (raceId === 'britain') {
    return [
      {
        position: 1,
        driver: drivers.NOR,
        probability: 65,
        reasons: {
          positive: ['Strong historical performance at this circuit', 'Ranked #1 in recent Practice 3 data', 'Home race advantage'],
          negative: ['Historically poor performance in wet conditions']
        }
      },
    ];
  }
  
  // Default predictions for other races
  return [
    { position: 1, driver: drivers.VER, probability: 68, reasons: { positive: ['Championship leader', 'Strong pace'], negative: ['Grid penalty risk'] } },
    { position: 2, driver: drivers.NOR, probability: 62, reasons: { positive: ['McLaren upgrades', 'Consistent form'], negative: ['Qualifying struggles'] } },
    { position: 3, driver: drivers.LEC, probability: 55, reasons: { positive: ['Ferrari pace', 'Circuit suits car'], negative: ['Reliability concerns'] } },
    { position: 4, driver: drivers.HAM, probability: 50, reasons: { positive: ['Experience', 'Race craft'], negative: ['Mercedes pace deficit'] } },
    { position: 5, driver: drivers.PIA, probability: 48, reasons: { positive: ['McLaren pace'], negative: ['Less experience'] } },
    { position: 6, driver: drivers.SAI, probability: 45, reasons: { positive: ['Consistent'], negative: ['Qualifying position'] } },
    { position: 7, driver: drivers.RUS, probability: 42, reasons: { positive: ['Mercedes upgrades'], negative: ['Setup issues'] } },
    { position: 8, driver: drivers.PER, probability: 38, reasons: { positive: ['Red Bull pace'], negative: ['Form concerns'] } },
    { position: 9, driver: drivers.ALO, probability: 35, reasons: { positive: ['Experience'], negative: ['Pace deficit'] } },
    { position: 10, driver: drivers.STR, probability: 30, reasons: { positive: ['Team support'], negative: ['Qualifying'] } },
  ];
};

export const myPredictions = [
  { raceId: 'britain', summary: '1. NOR, 2. VER, 3. HAM' },
  { raceId: 'austria', summary: '1. VER, 2. NOR, 3. LEC' },
  { raceId: 'canada', summary: '1. VER, 2. HAM, 3. NOR' },
];

export const newsItems = [
  {
    id: 1,
    title: 'Weather Update',
    description: 'Rain probable for Qualifying',
    type: 'weather' as const,
  },
  {
    id: 2,
    title: 'Driver Update',
    description: 'Leclerc confirmed 5-place grid penalty',
    type: 'penalty' as const,
  },
  {
    id: 3,
    title: 'Team News',
    description: 'McLaren bringing major upgrade package',
    type: 'upgrade' as const,
  },
];