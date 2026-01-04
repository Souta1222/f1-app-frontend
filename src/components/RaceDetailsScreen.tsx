import React, { useState, useEffect } from 'react';

// 🟢 1. INTERNAL CONFIG (No Import Errors)
const API_BASE = 'https://isreal-falconiform-seasonedly.ngrok-free.dev';

// 🟢 2. STATIC DATA
const RESULTS_2025 = [
  { position: 1, driver: "Lando Norris", team: "McLaren", wins: 11, points: 0, status: "Active" },
  { position: 2, driver: "Max Verstappen", team: "Red Bull", wins: 71, points: 0, "status": "Active" },
  { position: 3, driver: "Oscar Piastri", "team": "McLaren", wins: 9, points: 0, "status": "Active" },
  { position: 4, driver: "George Russell", "team": "Mercedes", wins: 5, points: 0, "status": "Active" },
  { position: 5, driver: "Charles Leclerc", "team": "Ferrari", wins: 8, points: 0, "status": "Active" },
  { position: 6, driver: "Lewis Hamilton", "team": "Ferrari", wins: 105, points: 0, "status": "Active" },
  { position: 7, driver: "Kimi Antonelli", "team": "Mercedes", wins: 0, points: 0, "status": "Rookie" },
  { position: 8, driver: "Alex Albon", "team": "Williams", "wins": 0, points: 0, "status": "Active" },
  { position: 9, driver: "Carlos Sainz", "team": "Williams", "wins": 4, points: 0, "status": "Active" }
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
  // 🟢 3. IMMEDIATE LOGIC (No useEffect required for these)
  const safeId = String(raceId || '');
  
  // 🟢 FIXED: Determine the "Mode" instantly based on the ID
  const is2025Summary = safeId === '2025-summary';
  const is2026Upcoming = safeId.startsWith('2026-');
  
  // 🟢 FIXED: Better ID parsing that works for all formats
  let year = '2024';
  let round = '1';
  
  // Extract year (look for first 4-digit number)
  const yearMatch = safeId.match(/\b(\d{4})\b/);
  if (yearMatch) {
    year = yearMatch[1];
  }
  
  // Extract round (look for last number in the string)
  const roundMatch = safeId.match(/(\d+)(?!.*\d)/);
  if (roundMatch) {
    round = roundMatch[1];
  }
  
  const shouldFetch = !is2025Summary && !is2026Upcoming;

  // State for Fetching Only
  const [fetchedResults, setFetchedResults] = useState<RaceResult[]>([]);
  const [loading, setLoading] = useState(false);

  // 🟢 4. SAFE FETCH EFFECT
  useEffect(() => {
    // If we don't need to fetch, STOP immediately.
    if (!shouldFetch) return;

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
           // Fallback
           try {
             const resFallback = await fetch(`${API_BASE}/race/${raceId}/results`, { headers });
             if (resFallback.ok) rawData = await resFallback.json();
           } catch (err) { console.log("Fallback failed"); }
        }

        // Parse Data safely
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
            setFetchedResults(cleanData);
        } else {
            setFetchedResults([]);
        }

      } catch (e) {
        console.error("Fetch Error:", e);
        setFetchedResults([]);
      }
      setLoading(false);
    };

    fetchResults();
  }, [safeId, year, round, shouldFetch, raceId]);

  // 🟢 5. DECIDE WHAT TO SHOW
  // We pick the correct list based on the "Mode" we calculated at the top
  let activeResults: RaceResult[] = [];
  if (is2025Summary) {
      activeResults = RESULTS_2025;
  } else if (shouldFetch) {
      activeResults = fetchedResults;
  }
  // For 2026, activeResults is empty (handled by UI check)


  // Helper for Colors
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
          {/* EMOJI BUTTON (Crash Proof) */}
          <span className="text-xl">⬅️</span>
        </button>
        <div>
          <h1 className="font-black text-xl leading-none text-white uppercase tracking-tight">
            {is2026Upcoming ? 'Race Preview' : 'Race Results'}
          </h1>
          <span className="text-xs text-red-100/80 font-bold uppercase tracking-widest mt-1 inline-block">
            {is2025Summary ? '2025 Season' : `${year} • Round ${round}`}
          </span>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 space-y-3">
        
        {/* VIEW 1: 2026 UPCOMING */}
        {is2026Upcoming && (
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
        )}

        {/* VIEW 2: LOADING */}
        {shouldFetch && loading && (
          <div className="flex flex-col items-center justify-center py-20">
             <div className="animate-spin text-4xl mb-4 text-red-700">🏎️</div>
             <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Fetching Data...</p>
          </div>
        )}

        {/* VIEW 3: RESULTS LIST (2025 or Fetch) */}
        {!is2026Upcoming && !loading && (
            <>
                {(!activeResults || activeResults.length === 0) ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 shadow-sm">
                        <div className="text-3xl mb-2">🏁</div>
                        <p className="text-neutral-900 font-bold">No results found</p>
                    </div>
                ) : (
                    activeResults.map((result, index) => (
                        <div 
                        key={index}
                        className="bg-white border border-gray-200 shadow-sm hover:shadow-md rounded-xl p-3 flex items-center gap-4 transition-all"
                        style={{ borderLeft: `4px solid ${getTeamColor(result.team)}` }}
                        >
                            {/* Position */}
                            <div className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg font-black text-sm shadow-inner
                                ${result.position === 1 ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' : 
                                result.position === 2 ? 'bg-slate-100 text-slate-600 border border-slate-200' :
                                result.position === 3 ? 'bg-orange-50 text-orange-700 border border-orange-100' : 'bg-slate-50 text-slate-400'}
                            `}>
                                {result.position === 1 ? '🏆' : result.position}
                            </div>

                            {/* Driver */}
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
            </>
        )}
      </div>
    </div>
  );
}