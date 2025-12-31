import React, { useState, useEffect } from 'react';
import { ChevronRight, Calendar, CheckCircle2, Clock, Loader2, MapPin } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { races as staticRaces } from '../lib/data'; 

// 🟢 NEW: Your public internet backend
const API_BASE = 'https://isreal-falconiform-seasonedly.ngrok-free.dev';

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
      // 1. If 2025, use static data (Frontend only)
      if (selectedSeason === '2025') {
        setRaces(staticRaces);
        return;
      }

      // 2. If 2023/2024, Fetch from Python Backend
      setLoading(true);
      try {
        const url = `${API_BASE}/races/${selectedSeason}`;
        const res = await fetch(url);
        
        if (res.ok) {
          const data = await res.json();
          if (data.length > 0) {
            setRaces(data);
          } else {
            setRaces([]);
          }
        } else {
          console.error("Backend Error");
          setRaces([]);
        }
      } catch (e) {
        console.error("Connection Error", e);
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
      
      {/* --- HEADER --- */}
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
          
          {/* 🛡️ FIX: Added '!bg-white' and inline style to force solid background */}
          <Select value={selectedSeason} onValueChange={setSelectedSeason}>
            <SelectTrigger 
                className="w-full !bg-white text-neutral-900 border-0 rounded-xl shadow-md h-12 font-bold uppercase tracking-wide opacity-100 ring-0 focus:ring-0"
                style={{ backgroundColor: 'white' }}
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-red-600" />
                <SelectValue />
              </div>
            </SelectTrigger>
            
            <SelectContent 
                className="!bg-white border border-gray-100 text-neutral-900 rounded-xl shadow-xl z-[100]"
                style={{ backgroundColor: 'white' }} 
            >
              <SelectItem value="2025" className="font-bold cursor-pointer hover:bg-gray-100 focus:bg-gray-100 focus:text-neutral-900">2025 Season (Upcoming)</SelectItem>
              <SelectItem value="2024" className="font-bold cursor-pointer hover:bg-gray-100 focus:bg-gray-100 focus:text-neutral-900">2024 Season (Results)</SelectItem>
              <SelectItem value="2023" className="font-bold cursor-pointer hover:bg-gray-100 focus:bg-gray-100 focus:text-neutral-900">2023 Season (Results)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* --- RACE LIST --- */}
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
            <p className="text-neutral-500 text-xs mt-1">Ensure backend is running.</p>
          </div>
        ) : (
          races.map((race) => (
            <button
              key={race.id}
              onClick={() => onRaceSelect(race.id)}
              className="w-full bg-white rounded-xl border border-white shadow-sm hover:shadow-md p-4 flex items-center gap-4 transition-all active:scale-[0.99] group text-left"
            >
              {/* Flag / Icon */}
              <div className="flex-shrink-0 w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center text-3xl shadow-inner border border-gray-100">
                {race.flag}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-red-600 text-[9px] font-black uppercase tracking-widest border border-red-100 bg-red-50 px-1.5 py-0.5 rounded">
                    Round {race.round}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide ${
                      race.status === 'finished'
                        ? 'bg-green-50 text-green-700 border border-green-100'
                        : 'bg-blue-50 text-blue-700 border border-blue-100'
                    }`}
                  >
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
              
              {/* Date & Arrow */}
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