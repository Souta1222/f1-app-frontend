import React, { useState, useEffect } from 'react';

// 🟢 SAFE MODE: Defining API here to prevent import errors
const API_BASE = 'https://isreal-falconiform-seasonedly.ngrok-free.dev';

// --- STATIC DATA: 2025 RESULTS ---
const RESULTS_2025 = [
  { position: 1, driver: "Lando Norris", team: "McLaren", wins: 11, status: "Active" },
  { position: 2, driver: "Max Verstappen", team: "Red Bull", wins: 71, status: "Active" },
  { position: 3, driver: "Oscar Piastri", "team": "McLaren", wins: 9, status: "Active" },
  { position: 4, driver: "George Russell", "team": "Mercedes", wins: 5, status: "Active" },
  { position: 5, driver: "Charles Leclerc", "team": "Ferrari", wins: 8, status: "Active" },
  { position: 6, driver: "Lewis Hamilton", "team": "Ferrari", wins: 105, status: "Active" },
  { position: 7, driver: "Kimi Antonelli", "team": "Mercedes", wins: 0, status: "Rookie" },
  { position: 8, driver: "Alex Albon", "team": "Williams", wins: 0, status: "Active" },
  { position: 9, driver: "Carlos Sainz", "team": "Williams", "wins": 4, "status": "Active" }
];

interface RaceResult {
  position: number;
  driver: string;
  team: string;
  points?: number;
  wins?: number;
  status: string;
}

interface RaceDetailsScreenProps {
  raceId: string;
  onBack: () => void;
}

export function RaceDetailsScreen({ raceId, onBack }: RaceDetailsScreenProps) {
  const [results, setResults] = useState<RaceResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [raceInfo, setRaceInfo] = useState({ year: '2024', round: '1' });
  const [viewMode, setViewMode] = useState<'results' | 'upcoming'>('results');

  useEffect(() => {
    // 1. Safety Check: Ensure ID exists
    const safeId = String(raceId || '');
    if (!safeId) return;

    // 2. Handle 2025 Summary
    if (safeId === '2025-summary') {
        setRaceInfo({ year: '2025', round: 'Season Standings' });
        setResults(RESULTS_2025);
        setViewMode('results');
        return;
    }

    // 3. Parse Year & Round
    const parts = safeId.split('-');
    let year = '2024';
    let round = '1';

    if (parts.length >= 3) {
        year = parts[0];
        round = parts[2];
        setRaceInfo({ year, round });
    }

    // 4. Handle 2026 (Upcoming)
    if (year === '2026') {
        setViewMode('upcoming');
        setResults([]);
        return; 
    }
    
    // 5. Fetch Data (Only for 2023/2024)
    setViewMode('results');
    
    const fetchResults = async () => {
      setLoading(true);
      try {
        const url = `${API_BASE}/race_results?year=${year}&round=${round}`;
        const headers = { 
            "ngrok-skip-browser-warning": "true",
            "Content-Type": "application/json"
        };

        const res = await fetch(url, { method: "GET", headers });
        let rawData: any = null;

        if (res.ok) {
           rawData = await res.json();
        } else {
           // Fallback fetch
           try {
             const resFallback = await fetch(`${API_BASE}/race/${raceId}/results`, { headers });
             if (resFallback.ok) rawData = await resFallback.json();
           } catch (err) { console.log("Fallback failed"); }
        }

        // 🛡️ Safe Data Processing
        const cleanData: RaceResult[] = [];
        if (Array.isArray(rawData)) {
            for (const item of rawData) {
                if (item && typeof item === 'object') {
                    cleanData.push({
                        position: parseInt(item.Position || item.position || '0'),
                        driver: String(item.Driver || item.driver || 'Unknown'),
                        team: String(item.Team || item.team || 'Unknown'),
                        points: parseFloat(item.Points || item.points || '0'),
                        status: String(item.status || item.Status || 'Finished'),
                        wins: item.wins ? parseInt(item.wins) : undefined
                    });
                }
            }
            setResults(cleanData);
        } else {
            setResults([]);
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
    const t = String(teamName).toLowerCase();
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
          {/* 🟢 CHANGED: Using Emoji instead of Icon to prevent crash */}
          <span className="text-xl">⬅️</span>
        </button>
        <div>
          <h1 className="font-black text-xl leading-none text-white uppercase tracking-tight">
            {viewMode === 'upcoming' ? 'Race Preview' : 'Race Results'}
          </h1>
          <span className="text-xs text-red-100/80 font-bold uppercase tracking-widest mt-1 inline-block">
            {raceInfo.year} • {raceInfo.round}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {viewMode === 'upcoming' ? (
            // 🟢 2026 View (Pure HTML/CSS - No External Components)
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm text-center px-6">
                <div className="text-4xl mb-4">📅</div>
                <h2 className="text-xl font-black text-neutral-900 mb-2">Upcoming Event</h2>
                <p className="text-sm text-neutral-500 mb-6">
                    This race hasn't started yet. AI predictions will be available 3 days before the race.
                </p>
                <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest">
                    <span>📍</span>
                    See Circuit Map
                </div>
            </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-20">
             <div className="animate-spin text-4xl mb-4 text-red-700">🏎️</div>
             <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Fetching Data...</p>
          </div>
        ) : (!results || results.length === 0) ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 shadow-sm">
             <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🏁</span>
            </div>
            <p className="text-neutral-900 font-bold">No results found</p>
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
                {result.position === 1 ? '🏆' : result.position}
              </div>

              {/* Driver Info */}
              <div className="flex-1 min-w-0">
                <div className="font-bold text-neutral-900 truncate text-sm">{result.driver}</div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide truncate">{result.team}</div>
              </div>

              {/* Stats */}
              <div className="text-right">
                {result.wins !== undefined ? (
                    <div className="font-mono font-bold text-sm text-blue-600">
                        {result.wins || 0} <span className="text-[9px] text-gray-400 font-sans uppercase">WINS</span>
                    </div>
                ) : (
                    <div className="font-mono font-bold text-sm text-green-600">
                        +{result.points || 0} <span className="text-[9px] text-gray-400 font-sans uppercase">PTS</span>
                    </div>
                )}
                
                <div className="text-[10px] flex items-center justify-end gap-1 mt-0.5">
                    <span className="text-slate-500 font-medium flex items-center gap-1">
                        {String(result.status)}
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