import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, Calendar, Flag, Trophy, Clock, Medal, Info } from 'lucide-react';
import { useTheme } from './ThemeContext'; 

// 🟢 INTERNAL CONFIG
const API_BASE = 'https://isreal-falconiform-seasonedly.ngrok-free.dev';

// --- FIXED STATIC DATA: 2025 SEASON (With AI Interpretations) ---
const RESULTS_2025 = [
  { position: 1, driver: "Lando Norris", team: "McLaren", wins: 8, points: 420, status: "Champion", details: "Clinched his maiden World Title with 8 wins and 19 podiums, showing supreme consistency over Verstappen." },
  { position: 2, driver: "Max Verstappen", team: "Red Bull", wins: 9, points: 380, status: "Active", details: "Won the most races (9) this season, but reliability issues and DNFs cost him the championship fight." },
  { position: 3, driver: "Oscar Piastri", "team": "McLaren", wins: 7, points: 300, status: "Active", details: "A breakout superstar season with 7 wins, securing the Constructors' Championship for McLaren." },
  { position: 4, driver: "George Russell", "team": "Mercedes", wins: 3, points: 250, status: "Active", details: "Led the Mercedes charge with 3 wins, establishing himself as the team leader over rookie Antonelli." },
  { position: 5, driver: "Charles Leclerc", "team": "Ferrari", wins: 0, points: 200, status: "Active", details: "Dominated qualifying with poles but struggled with race pace and tire degradation against McLaren." },
  { position: 6, driver: "Lewis Hamilton", "team": "Ferrari", wins: 0, points: 180, status: "Active", details: "Solid debut season in Red; consistent points finishes while adapting to the Ferrari car characteristics." },
  { position: 7, driver: "Kimi Antonelli", "team": "Mercedes", wins: 0, points: 150, status: "Rookie", details: "Sensational rookie performance with 3 podiums, proving he belongs in a top seat at just 19." },
  { position: 8, driver: "Alex Albon", "team": "Williams", wins: 0, points: 100, status: "Active", details: "Overachieved in the Williams, consistently dragging the car into Q3 and top-6 finishes." },
  { position: 9, driver: "Carlos Sainz", "team": "Williams", wins: 0, points: 80, status: "Active", details: "Brought veteran stability to Williams, forming a formidable midfield partnership with Albon." },
  { position: 10, driver: "Fernando Alonso", "team": "Aston Martin", wins: 0, points: 50, status: "Active", details: "Defied age at 44, using unmatched racecraft to snatch points despite a difficult car." },
  { position: 11, driver: "Nico Hülkenberg", "team": "Kick Sauber", wins: 0, points: 45, status: "Active", details: "Consistent midfield runner, extracting maximum value from the Audi-transitioning Sauber." },
  { position: 12, driver: "Yuki Tsunoda", "team": "Red Bull", wins: 0, points: 40, status: "Active", details: "Promoted to the top Red Bull seat but struggled to match Verstappen's relentless pace." },
  { position: 13, driver: "Isack Hadjar", "team": "Racing Bulls", wins: 0, points: 35, status: "Rookie", details: "Rookie highlight: Scored a shock podium in a chaotic wet race, showing flashes of brilliance." },
  { position: 14, driver: "Oliver Bearman", "team": "Haas", wins: 0, points: 30, status: "Active", details: "Quiet but steady rookie season for Haas, minimizing errors and learning the tracks." },
  { position: 15, driver: "Liam Lawson", "team": "Racing Bulls", wins: 0, points: 25, status: "Active", details: "Returned to full-time racing, matching his teammate closely in the midfield battle." },
  { position: 16, driver: "Esteban Ocon", "team": "Haas", wins: 0, points: 20, status: "Active", details: "Brought aggression to Haas, occasionally clashing with rivals but securing vital team points." },
  { position: 17, driver: "Lance Stroll", "team": "Aston Martin", wins: 0, points: 15, status: "Active", details: "Inconsistent season, occasionally flashing top-10 pace but fading in races." },
  { position: 18, driver: "Pierre Gasly", "team": "Alpine", wins: 0, points: 10, status: "Active", details: "Plagued by Alpine's mechanical reliability issues, limiting his ability to score." },
  { position: 19, driver: "Gabriel Bortoleto", "team": "Kick Sauber", wins: 0, points: 5, status: "Rookie", details: "Steep learning curve in F1, but showed raw qualifying speed in the second half." },
  { position: 20, driver: "Franco Colapinto", "team": "Alpine", wins: 0, points: 0, status: "Active", details: "Struggled with the difficult handling of the Alpine in his first full season." }
];

interface RaceResult {
  position: number;
  driver: string;
  team: string;
  points?: number;
  wins?: number;
  status: string;
  details?: string;
}

interface RaceDetailsScreenProps {
  raceId: string;
  onBack: () => void;
}

export function RaceDetailsScreen({ raceId, onBack }: RaceDetailsScreenProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // 1. SMART ID PARSING (Fixes the "Australian GP" bug)
  const safeId = String(raceId || '');
  
  let year = '2024'; // Default
  let round = '1';   // Default

  // 🔍 Find the year anywhere in the string (e.g. "australian-gp-2026" -> 2026)
  const yearMatch = safeId.match(/\b(202\d)\b/); 
  if (yearMatch) {
      year = yearMatch[1];
  } else {
      // Fallback: If no year found, try the first part of ID if it looks like a year
      const parts = safeId.split('-');
      if (parts[0] && parts[0].length === 4 && !isNaN(Number(parts[0]))) {
          year = parts[0];
      }
  }

  // 🔍 Find round number if present
  const roundMatch = safeId.match(/round-(\d+)/i);
  if (roundMatch) {
      round = roundMatch[1];
  }

  // 2. Logic Modes
  const is2025 = safeId.includes('2025-summary') || year === '2025';
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
  const subTitle = is2025 ? "Season Summary" : (is2026 ? `Future Season (${year})` : `${year} Official Results`);

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
                className={`p-3 mb-2 rounded-xl shadow-sm flex flex-col gap-2 border transition-all active:scale-[0.99] ${isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-white hover:shadow-md'}`}
                style={{ borderLeft: `4px solid ${getTeamColor(result.team)}` }}
            >
                {/* Top Row: Pos, Name, Points */}
                <div className="flex items-center gap-4">
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
                    </div>
                </div>

                {/* AI DETAILS SECTION */}
                {result.details && (
                    <div className={`mt-1 pl-12 pr-2 py-2 rounded-lg text-xs leading-relaxed flex gap-2 items-start ${isDark ? 'bg-neutral-800/50 text-neutral-400' : 'bg-slate-50 text-slate-600'}`}>
                        <Info className="w-3 h-3 mt-0.5 flex-shrink-0 opacity-70" />
                        <span>{result.details}</span>
                    </div>
                )}
                
                {/* Badges */}
                <div className="flex justify-end gap-2 pl-12">
                     {result.status === 'Champion' && (
                         <span className="flex items-center gap-1 text-[9px] font-black uppercase px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded border border-yellow-200">
                            <Medal className="w-2 h-2" /> CHAMPION
                         </span>
                    )}
                    {result.status === 'Rookie' && (
                         <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 bg-purple-100 text-purple-600 rounded border border-purple-200">ROOKIE</span>
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