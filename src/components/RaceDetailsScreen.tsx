import React, { useState, useEffect } from 'react';
import { ArrowLeft, Flag, CheckCircle2, Trophy, Timer } from 'lucide-react';

// 🟢 YOUR BACKEND URL
const API_BASE = 'https://isreal-falconiform-seasonedly.ngrok-free.dev';  

interface RaceResult {
  position: number;
  driver: string;
  team: string;
  points: number;
  status: string;
  grid: number;
  laps: number;
  time?: string;
}

interface RaceDetailsScreenProps {
  raceId: string;
  onBack: () => void;
}

export function RaceDetailsScreen({ raceId, onBack }: RaceDetailsScreenProps) {
  const [results, setResults] = useState<RaceResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [raceInfo, setRaceInfo] = useState({ year: '', round: '' });

  useEffect(() => {
    // 1. Parse ID (Format: "2023-round-1")
    if (!raceId) return;
    const parts = raceId.split('-');
    if (parts.length >= 3) {
        const year = parts[0];
        const round = parts[2];
        setRaceInfo({ year, round });
    }

    // 2. Fetch Details
    const fetchResults = async () => {
      setLoading(true);
      try {
        const [year, , round] = raceId.split('-');
        
        // Try Fetching
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
           // Fallback
           const resFallback = await fetch(`${API_BASE}/race/${raceId}/results`, {
                method: "GET",
                headers: {
                    "ngrok-skip-browser-warning": "true",
                    "Content-Type": "application/json"
                }
           });
           if(resFallback.ok) rawData = await resFallback.json();
        }

        // 🛡️ DATA SANITIZER (The Fix for the Blank Screen)
        // Maps "Team" -> "team", "Driver" -> "driver", etc.
        const cleanData = rawData.map((item: any) => ({
            position: parseInt(item.Position || item.position || '0'),
            driver: item.Driver || item.driver || 'Unknown Driver',
            team: item.Team || item.team || 'Unknown Team',
            points: parseFloat(item.Points || item.points || '0'),
            status: item.status || item.Status || 'Finished',
            grid: parseInt(item.Grid || item.grid || '0'),
            laps: parseInt(item.Laps || item.laps || '0'),
            time: item.Time || item.time || ''
        }));

        setResults(cleanData);

      } catch (e) {
        console.error("Error fetching results", e);
      }
      setLoading(false);
    };

    fetchResults();
  }, [raceId]);

  // Helper for Team Colors
  const getTeamColor = (teamName: string) => {
    if (!teamName) return '#94a3b8'; // Safety check
    const t = teamName.toLowerCase();
    if (t.includes('red bull')) return '#3671C6';
    if (t.includes('ferrari')) return '#D92A32';
    if (t.includes('mercedes')) return '#00A19C';
    if (t.includes('mclaren')) return '#FF8000';
    if (t.includes('aston')) return '#006F62';
    if (t.includes('alpine')) return '#0090FF';
    if (t.includes('williams')) return '#005AFF';
    if (t.includes('haas')) return '#B6BABD';
    if (t.includes('kick') || t.includes('sauber')) return '#52E252';
    if (t.includes('rb') || t.includes('alpha')) return '#6692FF';
    return '#94a3b8'; // Default Grey
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
          <h1 className="font-black text-xl leading-none text-white uppercase tracking-tight">Race Results</h1>
          <span className="text-xs text-red-100/80 font-bold uppercase tracking-widest mt-1 inline-block">
            {raceInfo.year} • Round {raceInfo.round}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
             <div className="animate-spin text-4xl mb-4 text-red-700">🏎️</div>
             <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Fetching Data...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Flag className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-neutral-900 font-bold">No results found</p>
            <p className="text-neutral-500 text-xs mt-1">Try selecting a different round.</p>
          </div>
        ) : (
          results.map((result, index) => (
            <div 
              key={index}
              className="bg-white border border-gray-200 shadow-sm hover:shadow-md rounded-xl p-3 flex items-center gap-4 transition-all active:scale-[0.99]"
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

              {/* Stats */}
              <div className="text-right">
                <div className="font-mono font-bold text-sm text-green-600">+{result.points} <span className="text-[9px] text-gray-400 font-sans uppercase">PTS</span></div>
                
                <div className="text-[10px] flex items-center justify-end gap-1 mt-0.5">
                  {(result.status?.toLowerCase() === 'finished' || result.status?.includes('+')) ? (
                    <span className="text-slate-500 font-medium flex items-center gap-1">
                          {result.status.includes('+') ? result.status : <><Flag className="w-3 h-3 text-slate-400" /> Finished</>}
                    </span>
                  ) : (
                    <span className="text-red-500 font-bold bg-red-50 px-1.5 py-0.5 rounded uppercase tracking-wider text-[9px]">
                        {result.status}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}