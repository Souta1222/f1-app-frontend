import React, { useState, useEffect } from 'react';

// 🟢 INTERNAL CONFIG
const API_BASE = 'https://isreal-falconiform-seasonedly.ngrok-free.dev';

// --- STATIC DATA ---
const RESULTS_2025 = [
  { position: 1, driver: "Lando Norris", team: "McLaren", wins: 11, points: 0, status: "Active" },
  { position: 2, driver: "Max Verstappen", team: "Red Bull", wins: 71, points: 0, "status": "Active" },
  { position: 3, driver: "Oscar Piastri", "team": "McLaren", wins: 9, points: 0, "status": "Active" },
  { position: 4, driver: "George Russell", "team": "Mercedes", wins: 5, points: 0, "status": "Active" },
  { position: 5, driver: "Charles Leclerc", "team": "Ferrari", wins: 8, points: 0, "status": "Active" },
  { position: 6, driver: "Lewis Hamilton", "team": "Ferrari", wins: 105, points: 0, "status": "Active" },
  { position: 7, driver: "Kimi Antonelli", "team": "Mercedes", wins: 0, points: 0, "status": "Rookie" },
  { position: 8, driver: "Alex Albon", "team": "Williams", wins: 0, points: 0, "status": "Active" },
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

// 🟢 SAFE ICONS (No external libraries to crash)
const IconBack = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
);
const IconCalendar = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
);
const IconMap = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
);

export function RaceDetailsScreen({ raceId, onBack }: RaceDetailsScreenProps) {
  // 1. Analyze ID
  const safeId = String(raceId || '');
  const parts = safeId.split('-');
  const year = parts[0] || '2024';
  const round = parts[2] || '1';

  // 2. Logic Modes
  const is2025 = safeId === '2025-summary';
  const is2026 = year === '2026';
  const shouldFetch = !is2025 && !is2026;

  // 3. Data State
  const [fetchedResults, setFetchedResults] = useState<RaceResult[]>([]);
  const [loading, setLoading] = useState(false);

  // 4. Fetch Effect
  useEffect(() => {
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
           try {
             const resFallback = await fetch(`${API_BASE}/race/${raceId}/results`, { headers });
             if (resFallback.ok) rawData = await resFallback.json();
           } catch (err) { console.log("Fallback failed"); }
        }

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
        }
      } catch (e) { console.error(e); }
      setLoading(false);
    };

    fetchResults();
  }, [safeId, year, round, shouldFetch, raceId]);

  // 5. UNIFIED LIST CREATION
  let displayList: RaceResult[] = [];
  let headerTitle = "Race Results";
  
  if (is2025) {
      displayList = RESULTS_2025;
      headerTitle = "2025 Season";
  } else if (is2026) {
      displayList = []; 
      headerTitle = "2026 Preview";
  } else {
      displayList = fetchedResults;
      headerTitle = `${year} Round ${round}`;
  }

  // Helper
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
      style={{ backgroundColor: '#F1F5F9', color: '#1e293b' }} 
    >
      {/* HEADER */}
      <div 
        className="sticky top-0 z-20 shadow-lg flex items-center gap-4 px-4 py-4"
        style={{ background: 'linear-gradient(to right, #7f1d1d, #450a0a)', color: 'white' }}
      >
        <button onClick={onBack} className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
          <IconBack />
        </button>
        <div>
          <h1 className="font-bold text-xl leading-none">{headerTitle}</h1>
          <span className="text-xs opacity-80 font-bold uppercase tracking-widest mt-1 inline-block">
            {is2025 ? 'Final Standings' : (is2026 ? 'Upcoming' : 'Official Results')}
          </span>
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-4 space-y-3">
        
        {/* 2026 VIEW */}
        {is2026 && (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm text-center px-6">
                <div className="mb-4"><IconCalendar /></div>
                <h2 className="text-xl font-black text-neutral-900 mb-2">Upcoming Event</h2>
                <p className="text-sm text-neutral-500 mb-6">
                    This race hasn't started yet. Check back 3 days before the race for AI predictions.
                </p>
                <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest">
                    <IconMap />
                    <span>See Circuit Map</span>
                </div>
            </div>
        )}

        {/* LOADING */}
        {loading && (
            <div className="text-center p-8 text-slate-500 font-bold">Loading Data...</div>
        )}

        {/* LIST */}
        {displayList.map((result, index) => (
            <div 
                key={index}
                className="bg-white p-3 mb-2 rounded-xl shadow-sm flex items-center gap-4 border border-gray-100"
                style={{ borderLeft: `4px solid ${getTeamColor(result.team)}` }}
            >
                {/* Position */}
                <div className="w-8 h-8 flex-shrink-0 bg-slate-100 rounded-lg flex items-center justify-center font-bold text-sm text-slate-700">
                    {result.position}
                </div>

                {/* Driver */}
                <div className="flex-1">
                    <div className="font-bold text-slate-900">{result.driver}</div>
                    <div className="text-xs text-slate-500 uppercase">{result.team}</div>
                </div>

                {/* Stats */}
                <div className="text-right">
                    {result.wins !== undefined ? (
                        <div className="font-bold text-blue-600 text-sm">{result.wins} WINS</div>
                    ) : (
                        <div className="font-bold text-green-600 text-sm">+{result.points} PTS</div>
                    )}
                </div>
            </div>
        ))}

        {/* EMPTY STATE */}
        {!is2026 && !loading && displayList.length === 0 && (
            <div className="text-center p-8 text-slate-500">
                <p>No results found.</p>
                <p className="text-xs mt-2 opacity-50">ID: {safeId}</p>
            </div>
        )}

      </div>
    </div>
  );
}