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
  // We force EVERYTHING into a list so the HTML structure never changes
  let displayList: RaceResult[] = [];
  let headerTitle = "Race Results";
  
  if (is2025) {
      displayList = RESULTS_2025;
      headerTitle = "2025 Season";
  } else if (is2026) {
      displayList = []; // Empty list for 2026
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
    <div className="fixed inset-0 z-[1000] overflow-y-auto pb-24 font-sans w-full h-full bg-slate-200">
      
      {/* HEADER */}
      <div className="sticky top-0 z-20 shadow-lg flex items-center gap-4 px-4 py-4 bg-red-900 text-white">
        <button onClick={onBack} className="p-2 bg-white/20 rounded-full">
          <span>⬅️</span>
        </button>
        <div>
          <h1 className="font-bold text-xl">{headerTitle}</h1>
        </div>
      </div>

      {/* CONTENT - SINGLE PATH RENDERING */}
      <div className="p-4">
        
        {/* 2026 MESSAGE (Only show if list is empty AND it is 2026) */}
        {is2026 && (
            <div className="p-8 bg-white rounded-xl shadow-sm text-center mb-4">
                <h2 className="text-2xl mb-2">📅</h2>
                <h3 className="font-bold">Upcoming 2026 Event</h3>
                <p>AI Predictions coming soon.</p>
            </div>
        )}

        {/* LOADING */}
        {loading && (
            <div className="text-center p-8">Loading Data...</div>
        )}

        {/* LIST RENDERING (Safe for all years) */}
        {displayList.map((result, index) => (
            <div 
                key={index}
                className="bg-white p-3 mb-2 rounded-xl shadow-sm flex items-center gap-4"
                style={{ borderLeft: `4px solid ${getTeamColor(result.team)}` }}
            >
                {/* Position */}
                <div className="w-8 h-8 flex-shrink-0 bg-slate-100 rounded-lg flex items-center justify-center font-bold text-sm">
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

        {/* EMPTY STATE (For 2024 if fetch fails) */}
        {!is2026 && !loading && displayList.length === 0 && (
            <div className="text-center p-8 text-slate-500">
                No results found.
            </div>
        )}

      </div>
    </div>
  );
}