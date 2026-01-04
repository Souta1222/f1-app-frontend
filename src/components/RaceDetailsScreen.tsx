import React, { useState, useEffect } from 'react';

// 🟢 1. INTERNAL CONFIG (No Import Errors)
const API_BASE = 'https://isreal-falconiform-seasonedly.ngrok-free.dev';

interface RaceDetailsScreenProps {
  raceId: string;
  onBack: () => void;
}

export function RaceDetailsScreen({ raceId, onBack }: RaceDetailsScreenProps) {
  // 🔍 DEBUG LOGS: Check your browser console (F12) to see these
  console.log("RaceDetailsScreen mounting with ID:", raceId);

  // 1. Analyze ID
  const safeId = String(raceId || '');
  const parts = safeId.split('-');
  const year = parts[0] || '2024';
  const round = parts[2] || '1';

  // 2. Determine Mode
  const is2025 = safeId === '2025-summary';
  const is2026 = year === '2026';
  
  // 3. State for fetched data (2023/2024 only)
  const [fetchedResults, setFetchedResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 4. Fetch Effect (Only runs for 2023/2024)
  useEffect(() => {
    if (is2025 || is2026) return;

    const doFetch = async () => {
      setLoading(true);
      try {
        console.log(`Fetching ${year} round ${round}`);
        const res = await fetch(`${API_BASE}/race_results?year=${year}&round=${round}`, {
            headers: { "ngrok-skip-browser-warning": "true" }
        });
        const data = await res.json();
        
        if (Array.isArray(data)) {
            setFetchedResults(data);
        } else {
            // Fallback fetch
            const res2 = await fetch(`${API_BASE}/race/${raceId}/results`, {
                headers: { "ngrok-skip-browser-warning": "true" }
            });
            const data2 = await res2.json();
            if (Array.isArray(data2)) setFetchedResults(data2);
        }
      } catch (e) {
        console.error("Fetch failed", e);
      }
      setLoading(false);
    };

    doFetch();
  }, [safeId, year, round, is2025, is2026, raceId]);

  // 🟢 5. RENDER - EXTREMELY SIMPLIFIED
  // This removes all complex mapping to see if the crash stops.
  
  return (
    <div className="fixed inset-0 z-[1000] overflow-y-auto pb-24 font-sans w-full h-full bg-slate-200 text-slate-900">
      
      {/* HEADER */}
      <div className="sticky top-0 z-20 shadow-lg flex items-center gap-4 px-4 py-4 bg-red-900 text-white">
        <button onClick={onBack} className="p-2 bg-white/20 rounded-full">
          <span>⬅️ Back</span>
        </button>
        <div>
          <h1 className="font-bold text-xl">
            {is2026 ? "2026 Preview" : is2025 ? "2025 Standings" : "Race Results"}
          </h1>
          <span className="text-xs opacity-75">{year}</span>
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-4">
        
        {/* SCENARIO A: 2026 */}
        {is2026 && (
            <div className="p-8 bg-white rounded-xl shadow-sm text-center">
                <h2 className="text-2xl mb-2">📅</h2>
                <h3 className="font-bold">Upcoming 2026 Race</h3>
                <p>This page is static text only to test the crash.</p>
            </div>
        )}

        {/* SCENARIO B: 2025 */}
        {is2025 && (
            <div className="p-8 bg-white rounded-xl shadow-sm">
                <h3 className="font-bold mb-4">2025 Season Summary</h3>
                <div className="space-y-2">
                    {/* Hardcoded items to prove mapping isn't breaking it */}
                    <div className="p-3 border rounded bg-slate-50">1. Lando Norris (McLaren)</div>
                    <div className="p-3 border rounded bg-slate-50">2. Max Verstappen (Red Bull)</div>
                    <div className="p-3 border rounded bg-slate-50">3. Oscar Piastri (McLaren)</div>
                </div>
            </div>
        )}

        {/* SCENARIO C: 2024/2023 (Fetched) */}
        {!is2025 && !is2026 && (
            <div>
                {loading && <p className="text-center p-4">Loading...</p>}
                {!loading && fetchedResults.map((item: any, idx: number) => (
                    <div key={idx} className="bg-white p-3 mb-2 rounded shadow-sm border-l-4 border-blue-500">
                        <span className="font-bold">#{item.Position || item.position}</span> {item.Driver || item.driver}
                    </div>
                ))}
            </div>
        )}

      </div>
    </div>
  );
}