import React, { useState, useEffect } from 'react';
import { ChevronRight, Calendar, Loader2, MapPin } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

// 🟢 YOUR BACKEND URL
const API_BASE = 'https://isreal-falconiform-seasonedly.ngrok-free.dev';  

// --- STATIC DATA: 2026 SCHEDULE (Generated from your CSV) ---
const SCHEDULE_2026 = [
  { "id": "2026-round-1", "round": 1, "name": "Australian Grand Prix", "circuit": "Melbourne, Australia", "date": "2026-03-08", "flag": "🇦🇺", "status": "upcoming" },
  { "id": "2026-round-2", "round": 2, "name": "Chinese Grand Prix", "circuit": "Shanghai, China", "date": "2026-03-15", "flag": "🇨🇳", "status": "upcoming" },
  { "id": "2026-round-3", "round": 3, "name": "Japanese Grand Prix", "circuit": "Suzuka, Japan", "date": "2026-03-29", "flag": "🇯🇵", "status": "upcoming" },
  { "id": "2026-round-4", "round": 4, "name": "Bahrain Grand Prix", "circuit": "Sakhir, Bahrain", "date": "2026-04-05", "flag": "🇧🇭", "status": "upcoming" },
  { "id": "2026-round-5", "round": 5, "name": "Saudi Arabian Grand Prix", "circuit": "Jeddah, Saudi Arabia", "date": "2026-04-12", "flag": "🇸🇦", "status": "upcoming" },
  { "id": "2026-round-6", "round": 6, "name": "Miami Grand Prix", "circuit": "Miami, USA", "date": "2026-05-03", "flag": "🇺🇸", "status": "upcoming" },
  { "id": "2026-round-7", "round": 7, "name": "Emilia Romagna Grand Prix", "circuit": "Imola, Italy", "date": "2026-05-17", "flag": "🇮🇹", "status": "upcoming" },
  { "id": "2026-round-8", "round": 8, "name": "Monaco Grand Prix", "circuit": "Monaco", "date": "2026-05-24", "flag": "🇲🇨", "status": "upcoming" },
  { "id": "2026-round-9", "round": 9, "name": "Spanish Grand Prix", "circuit": "Barcelona, Spain", "date": "2026-06-07", "flag": "🇪🇸", "status": "upcoming" },
  { "id": "2026-round-10", "round": 10, "name": "Canadian Grand Prix", "circuit": "Montreal, Canada", "date": "2026-06-14", "flag": "🇨🇦", "status": "upcoming" },
  { "id": "2026-round-11", "round": 11, "name": "Austrian Grand Prix", "circuit": "Spielberg, Austria", "date": "2026-06-28", "flag": "🇦🇹", "status": "upcoming" },
  { "id": "2026-round-12", "round": 12, "name": "British Grand Prix", "circuit": "Silverstone, UK", "date": "2026-07-05", "flag": "🇬🇧", "status": "upcoming" },
  { "id": "2026-round-13", "round": 13, "name": "Hungarian Grand Prix", "circuit": "Budapest, Hungary", "date": "2026-07-26", "flag": "🇭🇺", "status": "upcoming" },
  { "id": "2026-round-14", "round": 14, "name": "Belgian Grand Prix", "circuit": "Spa-Francorchamps, Belgium", "date": "2026-08-02", "flag": "🇧🇪", "status": "upcoming" },
  { "id": "2026-round-15", "round": 15, "name": "Dutch Grand Prix", "circuit": "Zandvoort, Netherlands", "date": "2026-08-30", "flag": "🇳🇱", "status": "upcoming" },
  { "id": "2026-round-16", "round": 16, "name": "Italian Grand Prix", "circuit": "Monza, Italy", "date": "2026-09-06", "flag": "🇮🇹", "status": "upcoming" },
  { "id": "2026-round-17", "round": 17, "name": "Azerbaijan Grand Prix", "circuit": "Baku, Azerbaijan", "date": "2026-09-20", "flag": "🇦🇿", "status": "upcoming" },
  { "id": "2026-round-18", "round": 18, "name": "Singapore Grand Prix", "circuit": "Marina Bay, Singapore", "date": "2026-10-04", "flag": "🇸🇬", "status": "upcoming" },
  { "id": "2026-round-19", "round": 19, "name": "United States Grand Prix", "circuit": "Austin, USA", "date": "2026-10-18", "flag": "🇺🇸", "status": "upcoming" },
  { "id": "2026-round-20", "round": 20, "name": "Mexico City Grand Prix", "circuit": "Mexico City, Mexico", "date": "2026-10-25", "flag": "🇲🇽", "status": "upcoming" },
  { "id": "2026-round-21", "round": 21, "name": "São Paulo Grand Prix", "circuit": "São Paulo, Brazil", "date": "2026-11-08", "flag": "🇧🇷", "status": "upcoming" },
  { "id": "2026-round-22", "round": 22, "name": "Las Vegas Grand Prix", "circuit": "Las Vegas, USA", "date": "2026-11-21", "flag": "🇺🇸", "status": "upcoming" },
  { "id": "2026-round-23", "round": 23, "name": "Qatar Grand Prix", "circuit": "Lusail, Qatar", "date": "2026-11-29", "flag": "🇶🇦", "status": "upcoming" },
  { "id": "2026-round-24", "round": 24, "name": "Abu Dhabi Grand Prix", "circuit": "Yas Marina, UAE", "date": "2026-12-06", "flag": "🇦🇪", "status": "upcoming" }
];

interface Race {
  id: string;
  round: number;
  name: string;
  circuit: string;
  date: string;
  flag: string;
  status: 'finished' | 'upcoming';
}

interface RaceSelectionScreenProps {
  onRaceSelect: (raceId: string) => void;
}

export function RaceSelectionScreen({ onRaceSelect }: RaceSelectionScreenProps) {
  const [selectedSeason, setSelectedSeason] = useState('2024'); 
  const [races, setRaces] = useState<Race[]>([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const fetchRaces = async () => {
      // 🟢 2026: Use Static Schedule
      if (selectedSeason === '2026') {
        setRaces(SCHEDULE_2026 as Race[]);
        return;
      }

      // 🟢 2025: Show Season Summary Link
      if (selectedSeason === '2025') {
        setRaces([{
           id: '2025-summary',
           round: 1,
           name: '2025 Championship Summary',
           circuit: 'Season Standings',
           date: '2025-12-31',
           flag: '🏆',
           status: 'finished'
        }]);
        return;
      }

      // 🟡 2023/2024: Fetch from Python Backend
      setLoading(true);
      try {
        const url = `${API_BASE}/races/${selectedSeason}`;
        const res = await fetch(url, {
          method: "GET",
          headers: {
            "ngrok-skip-browser-warning": "true",
            "Content-Type": "application/json"
          }
        });
        
        if (res.ok) {
          const data = await res.json();
          setRaces(data.length > 0 ? data : []);
        } else {
          setRaces([]);
        }
      } catch (e) {
        setRaces([]);
      }
      setLoading(false);
    };

    fetchRaces();
  }, [selectedSeason]);

  const formatDate = (dateString: string) => {
    if (dateString.includes('-01-01')) return selectedSeason; 
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  
  return (
    <div 
      className="fixed inset-0 z-0 overflow-y-auto pb-24"
      style={{ 
        backgroundColor: '#E2E8F0', 
        backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        color: '#1e293b' 
      }}
    >
      {/* Header */}
      <div 
        className="sticky top-0 z-20 shadow-lg"
        style={{ background: 'linear-gradient(to right, #7f1d1d, #450a0a)' }}
      >
        <div className="px-5 py-6">
          <div className="flex justify-between items-end mb-4">
             <h1 className="text-white text-2xl font-black italic tracking-tighter">
                RACE<span className="text-red-500">CALENDAR V3</span>
             </h1>
             <span className="text-white/60 text-[10px] font-bold uppercase tracking-widest border border-white/20 px-2 py-1 rounded-full">
                Season {selectedSeason}
             </span>
          </div>
          
          <Select value={selectedSeason} onValueChange={setSelectedSeason}>
            <SelectTrigger 
                className="w-full !bg-white text-neutral-900 border-0 rounded-xl shadow-md h-12 font-bold uppercase tracking-wide"
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-red-600" />
                <SelectValue />
              </div>
            </SelectTrigger>
            
            <SelectContent className="!bg-white border border-gray-100 text-neutral-900 rounded-xl shadow-xl z-[100]">
              <SelectItem value="2026" className="font-bold cursor-pointer">2026 Season (Upcoming)</SelectItem>
              <SelectItem value="2025" className="font-bold cursor-pointer">2025 Results (Summary)</SelectItem>
              <SelectItem value="2024" className="font-bold cursor-pointer">2024 Season</SelectItem>
              <SelectItem value="2023" className="font-bold cursor-pointer">2023 Season</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Race List */}
      <div className="px-5 py-6 space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
            <Loader2 className="w-10 h-10 text-red-600 animate-spin mb-4" />
            <p className="text-xs font-bold uppercase tracking-widest">Loading Calendar...</p>
          </div>
        ) : races.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-neutral-900 font-bold">No race data found</p>
          </div>
        ) : (
          races.map((race) => (
            <button
              key={race.id}
              onClick={() => onRaceSelect(race.id)}
              className="w-full bg-white rounded-xl border border-white shadow-sm hover:shadow-md p-4 flex items-center gap-4 transition-all active:scale-[0.99] group text-left"
            >
              <div className="flex-shrink-0 w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center text-3xl shadow-inner border border-gray-100">
                {race.flag}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-red-600 text-[9px] font-black uppercase tracking-widest border border-red-100 bg-red-50 px-1.5 py-0.5 rounded">
                    Round {race.round}
                  </span>
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide ${
                      race.status === 'finished' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-blue-50 text-blue-700 border border-blue-100'
                  }`}>
                    {race.status === 'finished' ? 'Finished' : 'Upcoming'}
                  </span>
                </div>
                <div className="text-neutral-900 font-bold text-sm leading-tight truncate mb-1">
                    {race.name}
                </div>
                <div className="flex items-center gap-1 text-gray-500 text-xs">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{race.circuit}</span>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-2">
                 <span className="text-xs font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded-md whitespace-nowrap">
                    {formatDate(race.date)}
                 </span>
                 <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-red-600 transition-colors" />
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}