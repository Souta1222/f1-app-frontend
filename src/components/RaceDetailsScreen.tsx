import React, { useState, useEffect } from 'react';
import { ArrowLeft, Flag, Trophy, Calendar, MapPin } from 'lucide-react';

// 🟢 YOUR BACKEND URL
const API_BASE = 'https://isreal-falconiform-seasonedly.ngrok-free.dev';  

// --- STATIC DATA: 2025 RESULTS ---
const RESULTS_2025 = [
  { "position": 1, "driver": "Lando Norris", "team": "McLaren", "wins": 11, "status": "Active" },
  { "position": 2, "driver": "Max Verstappen", "team": "Red Bull", "wins": 71, "status": "Active" },
  { "position": 3, "driver": "Oscar Piastri", "team": "McLaren", "wins": 9, "status": "Active" },
  { "position": 4, "driver": "George Russell", "team": "Mercedes", "wins": 5, "status": "Active" },
  { "position": 5, "driver": "Charles Leclerc", "team": "Ferrari", "wins": 8, "status": "Active" },
  { "position": 6, "driver": "Lewis Hamilton", "team": "Ferrari", "wins": 105, "status": "Active" },
  { "position": 7, "driver": "Kimi Antonelli", "team": "Mercedes", "wins": 0, "status": "Rookie" },
  { "position": 8, "driver": "Alex Albon", "team": "Williams", "wins": 0, "status": "Active" },
  { "position": 9, "driver": "Carlos Sainz", "team": "Williams", "wins": 4, "status": "Active" }
];

interface RaceResult {
  position: number;
  driver: string;
  team: string;
  points?: number;
  wins?: number;
  status: string;
  grid?: number;
  laps?: number;
}

interface RaceDetailsScreenProps {
  raceId: string;
  onBack: () => void;
}

export function RaceDetailsScreen({ raceId, onBack }: RaceDetailsScreenProps) {
  const [results, setResults] = useState<RaceResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [raceInfo, setRaceInfo] = useState({ year: '', round: '' });
  const [isUpcoming, setIsUpcoming] = useState(false);

  useEffect(() => {
    // 1. Handle 2025 Static Summary
    if (raceId === '2025-summary') {
        setRaceInfo({ year: '2025', round: 'Season Standings' });
        setResults(RESULTS_2025);
        return;
    }

    // 2. Parse ID for API
    const parts = raceId.split('-');
    if (parts.length >= 3) {
        const year = parts[0];
        const round = parts[2];
        setRaceInfo({ year, round });

        // 🟢 FIX: Detect 2026/Upcoming races and stop fetching
        if (year === '2026') {
            setIsUpcoming(true);
            return;
        }
    }

    // 3. Fetch Details from Backend (Only for past races)
    const fetchResults = async () => {
      setLoading(true);
      try {
        const [year, , round] = raceId.split('-');
        
        // Try Main API
        const url = `${API_BASE}/race_results?year=${year}&round=${round}`;
        const res = await fetch(url, {
            method: "GET",
            headers: {
                "ngrok-skip-browser-warning": "true",
                "Content-Type": "application/json"
            }
        });
        
        let rawData = [];
        if (res.ok) {
          rawData = await res.json();
        } else {
           // Fallback API
           const resFallback = await fetch(`${API_BASE}/race/${raceId}/results`);
           if(resFallback.ok) {
               rawData = await resFallback.json();
           }
        }

        // 🟢 FIX: Crash Protection (Ensure rawData is actually an Array)
        if (Array.isArray(rawData) && rawData.length > 0) {
            const cleanData = rawData.map((item: any) => ({
                position: parseInt(item.Position || item.position || '0'),
                driver: item.Driver || item.driver || 'Unknown Driver',
                team: item.Team || item.team || 'Unknown Team',
                points: parseFloat(item.Points || item.points || '0'),
                status: item.status || item.Status || 'Finished',
            }));
            setResults(cleanData);
        } else {
            setResults([]); // No results found, but don't crash
        }

      } catch (e) {
        console.error("Error fetching results", e);
        setResults([]);
      }
      setLoading(false);
    };

    fetchResults();
  }, [raceId]);

  // Helper for Team Colors
  const getTeamColor = (teamName: string) => {
    if (!teamName) return '#94a3b8';
    const t = teamName.toLowerCase();
    if (t.includes('red bull')) return '#3671C6';
    if (t.includes('ferrari')) return '#D92A32';
    if (t.includes('mercedes')) return '#00A19C';
    if (t.includes('mclaren')) return '#FF8000';
    if (t.includes('aston')) return '#006F62';
    if (t.includes('williams')) return '#005AFF';
    return '#94a3b8';
  };

  return (
    <div 
      className="fixed inset-0 z-[1000] overflow-y-auto pb-24 font-sans w-full h-full"
      style={{ 
        backgroundColor: '#E2E8F0', 
        backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        color: '#1e293b' 
      }}
    >
      {/* Header */}
      <div 
        className="sticky top-0 z-20 shadow-lg flex items-center gap-4 px-4 py-4"
        style={{ background: 'linear-gradient(to right, #7f1d1d, #450a0a)' }}
      >
        <button 
            onClick={onBack} 
            className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white backdrop-blur-md"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-black text-xl leading-none text-white uppercase tracking-tight">
            {isUpcoming ? 'Race Preview' : 'Race Results'}
          </h1>
          <span className="text-xs text-red-100/80 font-bold uppercase tracking-widest mt-1 inline-block">
            {raceInfo.year} • {raceInfo.round}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* 🟢 HANDLING UPCOMING RACES (2026) */}
        {isUpcoming ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm text-center px-6">
                <Calendar className="w-16 h-16 text-blue-500 mb-4" />
                <h2 className="text-xl font-black text-neutral-900 mb-2">Upcoming Event</h2>
                <p className="text-sm text-neutral-500 mb-6">
                    This race hasn't started yet. AI predictions will be available 3 days before the race.
                </p>
                <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest">
                    <MapPin className="w-4 h-4" />
                    See Circuit Map
                </div>
            </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-20">
             <div className="animate-spin text-4xl mb-4 text-red-700">🏎️</div>
             <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Fetching Data...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <p className="text-neutral-900 font-bold">No results found</p>
            <p className="text-neutral-500 text-xs mt-1">This race might not have happened yet.</p>
          </div>
        ) : (
          results.map((result, index) => (
            <div 
              key={index}
              className="bg-white border border-gray-200 shadow-sm hover:shadow-md rounded-xl p-3 flex items-center gap-4 transition-all"
              style={{ borderLeft: `4px solid ${getTeamColor(result.team)}` }}
            >
              {/* Position Badge */}
              <div className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg font-black text-sm shadow-inner
                ${result.position === 1 ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' : 
                  result.position === 2 ? 'bg-slate-100 text-slate-600 border border-slate-200' :
                  result.position === 3 ? 'bg-orange-50 text-orange-700 border border-orange-100' : 'bg-slate-50 text-slate-400'}
              `}>
                {result.position === 1 ? <Trophy className="w-4 h-4" /> : result.position}
              </div>

              {/* Driver Info */}
              <div className="flex-1 min-w-0">
                <div className="font-bold text-neutral-900 truncate text-sm">{result.driver}</div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide truncate">{result.team}</div>
              </div>

              {/* Stats: Shows Wins for 2025, Points for others */}
              <div className="text-right">
                {result.wins !== undefined ? (
                    <div className="font-mono font-bold text-sm text-blue-600">{result.wins} <span className="text-[9px] text-gray-400 font-sans uppercase">WINS</span></div>
                ) : (
                    <div className="font-mono font-bold text-sm text-green-600">+{result.points} <span className="text-[9px] text-gray-400 font-sans uppercase">PTS</span></div>
                )}
                
                <div className="text-[10px] flex items-center justify-end gap-1 mt-0.5">
                    <span className="text-slate-500 font-medium flex items-center gap-1">
                        {result.status}
                    </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}