import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, Calendar, Flag, Trophy, Clock, Medal } from 'lucide-react';
import { useTheme } from './ThemeContext'; 

// 🟢 INTERNAL CONFIG
const API_BASE = 'https://isreal-falconiform-seasonedly.ngrok-free.dev';

// --- FIXED STATIC DATA: 2025 SEASON ---
// Logic: Lando (8 Wins) beat Max (8 Wins) on Points Consistency (420 vs 380)
const RESULTS_2025 = [
  { position: 1, driver: "Lando Norris", team: "McLaren", wins: 8, points: 420, status: "Champion" },
  { position: 2, driver: "Max Verstappen", team: "Red Bull", wins: 8, points: 380, status: "Active" },
  { position: 3, driver: "Oscar Piastri", "team": "McLaren", wins: 7, points: 300, status: "Active" },
  { position: 4, driver: "George Russell", "team": "Mercedes", wins: 3, points: 250, status: "Active" },
  { position: 5, driver: "Charles Leclerc", "team": "Ferrari", wins: 0, points: 200, status: "Active" },
  { position: 6, driver: "Lewis Hamilton", "team": "Ferrari", wins: 0, points: 180, status: "Active" },
  { position: 7, driver: "Kimi Antonelli", "team": "Mercedes", wins: 0, points: 150, status: "Rookie" },
  { position: 8, driver: "Alex Albon", "team": "Williams", wins: 0, points: 100, status: "Active" },
  { position: 9, driver: "Carlos Sainz", "team": "Williams", wins: 0, points: 80, status: "Active" },
  { position: 10, driver: "Fernando Alonso", "team": "Aston Martin", wins: 0, points: 50, status: "Active" },
  { position: 11, driver: "Nico Hülkenberg", "team": "Kick Sauber", wins: 0, points: 45, status: "Active" },
  { position: 12, driver: "Yuki Tsunoda", "team": "Red Bull", wins: 0, points: 40, status: "Active" },
  { position: 13, driver: "Isack Hadjar", "team": "Racing Bulls", wins: 0, points: 35, status: "Rookie" },
  { position: 14, driver: "Oliver Bearman", "team": "Haas", wins: 0, points: 30, status: "Active" },
  { position: 15, driver: "Liam Lawson", "team": "Racing Bulls", wins: 0, points: 25, status: "Active" },
  { position: 16, driver: "Esteban Ocon", "team": "Haas", wins: 0, points: 20, status: "Active" },
  { position: 17, driver: "Lance Stroll", "team": "Aston Martin", wins: 0, points: 15, status: "Active" },
  { position: 18, driver: "Pierre Gasly", "team": "Alpine", wins: 0, points: 10, status: "Active" },
  { position: 19, driver: "Gabriel Bortoleto", "team": "Kick Sauber", wins: 0, points: 5, status: "Rookie" },
  { position: 20, driver: "Franco Colapinto", "team": "Alpine", wins: 0, points: 0, status: "Active" }
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
  const { theme } = useTheme();
  const isDark = theme === 'dark';

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

  // 5. Unified List Selection
  const displayList = useMemo(() => {
      if (is2025) return RESULTS_2025;
      if (is2026) return [];
      return fetchedResults;
  }, [is2025, is2026, fetchedResults]);

  const headerTitle = is2025 ? "2025 Standings" : (is2026 ? "2026 Preview" : `Round ${round}`);
  const subTitle = is2025 ? "Season Summary" : (is2026 ? "Future Season" : `${year} Official Results`);

  // 6. Dynamic Styles
  const containerStyle = isDark 
    ? { backgroundColor: '#0a0a0a', color: '#ffffff' } 
    : { 
        backgroundColor: '#E2E8F0', 
        backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        color: '#1e293b' 
      };

  const getTeamColor = (teamName: string) => {
    if (!teamName) return '#94a3b8';
    const t = String(teamName).toLowerCase();
    if (t.includes('red bull')) return '#3671C6';
    if (t.includes('ferrari')) return '#D92A32';
    if (t.includes('mercedes')) return '#00A19C';
    if (t.includes('mclaren')) return '#FF8000';
    if (t.includes('aston')) return '#006F62';
    if (t.includes('williams')) return '#005AFF';
    if (t.includes('alpine')) return '#0090FF';
    if (t.includes('haas')) return '#B6BABD';
    if (t.includes('sauber') || t.includes('kick')) return '#52E252';
    if (t.includes('racing bulls') || t.includes('rb')) return '#6692FF';
    return '#94a3b8';
  };

  return (
    <div 
      className="fixed inset-0 z-[1000] overflow-y-auto pb-24 font-sans w-full h-full transition-colors duration-300"
      style={containerStyle}
    >
      {/* HEADER */}
      <div 
        className="sticky top-0 z-20 shadow-lg flex items-center gap-4 px-4 py-4"
        style={{ background: 'linear-gradient(to right, #7f1d1d, #450a0a)', color: 'white' }}
      >
        <button 
            onClick={onBack} 
            className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-md border border-white/10"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <div>
          <h1 className="font-black text-xl leading-none uppercase tracking-tight">{headerTitle}</h1>
          <span className="text-xs opacity-80 font-bold uppercase tracking-widest mt-1 inline-block text-red-100">
            {subTitle}
          </span>
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-4 space-y-3">
        
        {/* --- 2026 VIEW --- */}
        {is2026 && (
            <div className={`flex flex-col items-center justify-center py-16 rounded-2xl border shadow-sm text-center px-6 transition-all ${isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-white'}`}>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isDark ? 'bg-neutral-800 text-neutral-400' : 'bg-blue-50 text-blue-500'}`}>
                    <Calendar className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-black mb-2">Season Begins March 2026</h2>
                <p className={`text-sm mb-6 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                    The 2026 grid is set. AI predictions will unlock after winter testing.
                </p>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border ${isDark ? 'border-neutral-700 bg-neutral-800 text-neutral-300' : 'border-blue-100 bg-blue-50 text-blue-700'}`}>
                    <Clock className="w-3 h-3" />
                    <span>Pre-Season Mode</span>
                </div>
            </div>
        )}

        {/* --- LOADING --- */}
        {loading && (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="animate-spin text-4xl mb-4 text-red-600">🏎️</div>
                <p className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-neutral-500' : 'text-slate-500'}`}>Fetching Data...</p>
            </div>
        )}

        {/* --- RESULTS LIST --- */}
        {displayList.map((result, index) => (
            <div 
                key={index}
                className={`p-3 mb-2 rounded-xl shadow-sm flex items-center gap-4 border transition-all active:scale-[0.99] ${isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-white hover:shadow-md'}`}
                style={{ borderLeft: `4px solid ${getTeamColor(result.team)}` }}
            >
                {/* Position */}
                <div className={`w-8 h-8 flex-shrink-0 rounded-lg flex items-center justify-center font-bold text-sm shadow-inner ${
                    result.position === 1 ? 'bg-yellow-100 text-yellow-700' : 
                    result.position === 2 ? 'bg-slate-200 text-slate-700' : 
                    result.position === 3 ? 'bg-orange-100 text-orange-800' : 
                    (isDark ? 'bg-neutral-800 text-neutral-400' : 'bg-slate-100 text-slate-500')
                }`}>
                    {result.position === 1 ? <Trophy className="w-4 h-4" /> : result.position}
                </div>

                {/* Driver */}
                <div className="flex-1 min-w-0">
                    <div className={`font-bold truncate text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{result.driver}</div>
                    <div className={`text-[10px] font-bold uppercase tracking-wide truncate ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>{result.team}</div>
                </div>

                {/* Stats */}
                <div className="text-right">
                    {result.wins !== undefined && result.wins > 0 ? (
                        <div className="font-mono font-bold text-sm text-blue-500">
                            {result.wins} <span className={`text-[9px] font-sans uppercase ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>WINS</span>
                        </div>
                    ) : (
                        <div className="font-mono font-bold text-sm text-green-500">
                            +{result.points} <span className={`text-[9px] font-sans uppercase ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>PTS</span>
                        </div>
                    )}
                    
                    {/* Status Badge */}
                    {result.status === 'Champion' && (
                         <div className="mt-1 flex justify-end">
                             <span className="flex items-center gap-1 text-[9px] font-black uppercase px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded border border-yellow-200">
                                <Medal className="w-2 h-2" /> CHAMPION
                             </span>
                        </div>
                    )}
                    {result.status === 'Rookie' && (
                         <div className="mt-1 flex justify-end">
                             <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 bg-purple-100 text-purple-600 rounded">ROOKIE</span>
                        </div>
                    )}
                </div>
            </div>
        ))}

        {/* --- EMPTY STATE --- */}
        {!is2026 && !loading && displayList.length === 0 && (
            <div className={`text-center py-12 rounded-2xl border border-dashed ${isDark ? 'border-neutral-800 bg-neutral-900/50' : 'border-slate-200 bg-white'}`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${isDark ? 'bg-neutral-800' : 'bg-slate-100'}`}>
                    <Flag className={`w-6 h-6 ${isDark ? 'text-neutral-600' : 'text-slate-400'}`} />
                </div>
                <p className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>No results found</p>
            </div>
        )}

      </div>
    </div>
  );
}