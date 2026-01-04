import React, { useState, useEffect } from 'react';

// 🟢 1. INTERNAL CONFIG
const API_BASE = 'https://isreal-falconiform-seasonedly.ngrok-free.dev';

// --- STATIC DATA 2025 (Simplified) ---
const RESULTS_2025 = [
  { pos: 1, driver: "Lando Norris", team: "McLaren", wins: 11 },
  { pos: 2, driver: "Max Verstappen", team: "Red Bull", wins: 71 },
  { pos: 3, driver: "Oscar Piastri", "team": "McLaren", wins: 9 },
  { pos: 4, driver: "George Russell", "team": "Mercedes", wins: 5 },
  { pos: 5, driver: "Charles Leclerc", "team": "Ferrari", wins: 8 },
  { pos: 6, driver: "Lewis Hamilton", "team": "Ferrari", wins: 105 },
  { pos: 7, driver: "Kimi Antonelli", "team": "Mercedes", wins: 0 },
  { pos: 8, driver: "Alex Albon", "team": "Williams", wins: 0 },
  { pos: 9, driver: "Carlos Sainz", "team": "Williams", wins: 4 }
];

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
  const [fetchedResults, setFetchedResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 4. Fetch Effect (Only runs for 2023/2024)
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

        if (Array.isArray(rawData)) {
            setFetchedResults(rawData);
        }
      } catch (e) { console.error(e); }
      setLoading(false);
    };

    fetchResults();
  }, [safeId, year, round, shouldFetch, raceId]);

  // Helper for Colors
  const getTeamColor = (teamName: any) => {
    const t = String(teamName || '').toLowerCase();
    if (t.includes('red bull')) return '#3671C6';
    if (t.includes('ferrari')) return '#D92A32';
    if (t.includes('mercedes')) return '#00A19C';
    if (t.includes('mclaren')) return '#FF8000';
    return '#94a3b8';
  };

  return (
    <div 
      className="fixed inset-0 z-[1000] overflow-y-auto pb-24 font-sans w-full h-full"
      style={{ backgroundColor: '#ffffff', color: '#000000' }} 
    >
      {/* HEADER */}
      <div 
        className="sticky top-0 z-20 shadow-lg flex items-center gap-4 px-4 py-4"
        style={{ background: 'linear-gradient(to right, #7f1d1d, #450a0a)', color: 'white' }}
      >
        <button onClick={onBack} className="p-2 bg-white/20 rounded-full">
          <span style={{ fontSize: '20px' }}>⬅️</span>
        </button>
        <div>
          <h1 className="font-bold text-xl">{is2026 ? "Race Preview" : "Race Results"}</h1>
          <span className="text-xs opacity-80 uppercase tracking-widest block">
            {is2025 ? '2025 Season' : `${year} • Round ${round}`}
          </span>
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-4">
        
        {/* --- 2026 VIEW (STATIC HTML) --- */}
        {is2026 && (
            <div className="p-8 text-center border rounded-xl shadow-sm bg-slate-50">
                <div style={{ fontSize: '40px', marginBottom: '10px' }}>📅</div>
                <h2 className="text-xl font-bold mb-2">Upcoming Event</h2>
                <p className="text-sm text-gray-500 mb-4">
                    This race hasn't started yet. Check back later.
                </p>
                <div className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">
                    📍 See Circuit Map
                </div>
            </div>
        )}

        {/* --- 2025 VIEW (STATIC LIST) --- */}
        {is2025 && (
            <div>
                {RESULTS_2025.map((row, i) => (
                    <div 
                        key={i} 
                        className="flex items-center gap-3 p-3 mb-2 border rounded-xl shadow-sm bg-white"
                        style={{ borderLeft: `4px solid ${getTeamColor(row.team)}` }}
                    >
                        <div className="w-8 font-bold text-gray-500 text-center">{row.pos}</div>
                        <div className="flex-1">
                            <div className="font-bold">{row.driver}</div>
                            <div className="text-xs text-gray-400 uppercase">{row.team}</div>
                        </div>
                        <div className="font-bold text-blue-600 text-sm">{row.wins} WINS</div>
                    </div>
                ))}
            </div>
        )}

        {/* --- 2024/2023 VIEW (FETCHED DATA) --- */}
        {shouldFetch && (
            <div>
                {loading && <div className="text-center p-8">Loading Data...</div>}
                
                {!loading && fetchedResults.map((item, index) => (
                    <div 
                        key={index} 
                        className="flex items-center gap-3 p-3 mb-2 border rounded-xl shadow-sm bg-white"
                        style={{ borderLeft: `4px solid ${getTeamColor(item.Team || item.team)}` }}
                    >
                        <div className="w-8 font-bold text-gray-500 text-center">
                            {item.Position || item.position}
                        </div>
                        <div className="flex-1">
                            <div className="font-bold">{item.Driver || item.driver}</div>
                            <div className="text-xs text-gray-400 uppercase">{item.Team || item.team}</div>
                        </div>
                        <div className="font-bold text-green-600 text-sm">
                            +{item.Points || item.points} PTS
                        </div>
                    </div>
                ))}

                {!loading && fetchedResults.length === 0 && (
                    <div className="text-center p-8 text-gray-400">No results found.</div>
                )}
            </div>
        )}

      </div>
    </div>
  );
}