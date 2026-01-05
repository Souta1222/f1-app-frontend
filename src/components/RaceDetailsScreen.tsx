import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, Flag, Trophy, Medal, Info, TrendingUp, BrainCircuit } from 'lucide-react';
// @ts-ignore
import { useTheme } from './../components/ThemeContext.tsx'; 

// 🟢 CONFIG
const API_BASE = 'https://isreal-falconiform-seasonedly.ngrok-free.dev';

// --- SHARED 2026 SCHEDULE (Needed to look up circuit names for prediction) ---
const SCHEDULE_2026 = [
  { "round": 1, "circuit": "Melbourne, Australia" },
  { "round": 2, "circuit": "Shanghai, China" },
  { "round": 3, "circuit": "Suzuka, Japan" },
  { "round": 4, "circuit": "Sakhir, Bahrain" },
  { "round": 5, "circuit": "Jeddah, Saudi Arabia" },
  { "round": 6, "circuit": "Miami, USA" },
  { "round": 7, "circuit": "Imola, Italy" },
  { "round": 8, "circuit": "Monaco" },
  { "round": 9, "circuit": "Barcelona, Spain" },
  { "round": 10, "circuit": "Montreal, Canada" },
  { "round": 11, "circuit": "Spielberg, Austria" },
  { "round": 12, "circuit": "Silverstone, UK" },
  { "round": 13, "circuit": "Budapest, Hungary" },
  { "round": 14, "circuit": "Spa-Francorchamps, Belgium" },
  { "round": 15, "circuit": "Zandvoort, Netherlands" },
  { "round": 16, "circuit": "Monza, Italy" },
  { "round": 17, "circuit": "Baku, Azerbaijan" },
  { "round": 18, "circuit": "Marina Bay, Singapore" },
  { "round": 19, "circuit": "Austin, USA" },
  { "round": 20, "circuit": "Mexico City, Mexico" },
  { "round": 21, "circuit": "São Paulo, Brazil" },
  { "round": 22, "circuit": "Las Vegas, USA" },
  { "round": 23, "circuit": "Lusail, Qatar" },
  { "round": 24, "circuit": "Yas Marina, UAE" }
];

// --- STATIC DATA (2025) ---
const RESULTS_2025 = [
  { position: 1, driver: "Lando Norris", team: "McLaren", wins: 8, points: 420, status: "Champion", details: "Clinched his maiden World Title with 8 wins and 19 podiums." },
  { position: 2, driver: "Max Verstappen", team: "Red Bull", wins: 9, points: 380, status: "Active", details: "Won the most races (9), but reliability issues cost him the title." },
  { position: 3, driver: "Oscar Piastri", team: "McLaren", wins: 7, points: 300, status: "Active", details: "Breakout season with 7 wins, securing Constructors' Title." },
  { position: 4, driver: "George Russell", team: "Mercedes", wins: 3, points: 250, status: "Active", details: "Led Mercedes charge with 3 wins." },
  { position: 5, driver: "Charles Leclerc", team: "Ferrari", wins: 0, points: 200, status: "Active", details: "Dominated qualifying but struggled with race pace." },
  { position: 6, driver: "Lewis Hamilton", team: "Ferrari", wins: 0, points: 180, status: "Active", details: "Solid debut in Red; consistent points finishes." },
];

interface RaceResult {
  position: number;
  driver: string;
  team: string;
  points?: number;
  wins?: number;
  status: string;
  details?: string;
  probability?: number; // 🟢 NEW for Predictions
}

interface RaceDetailsScreenProps {
  raceId: string;
  onBack: () => void;
}

// --- TEAM'S SPACING CONSTANTS ---
const SPACING = {
  SECTION_MARGIN: 'mb-8',
  SECTION_PADDING: 'px-4',
  CARD_PADDING: 'p-3',
  CARD_GAP: 'p-3',
  BORDER_WIDTH: 'border-8',
  BORDER_RADIUS: 'rounded-2xl',
  CONTENT_GAP: 'space-y-4',
  HEADER_MARGIN: 'mb-3',
  COMPONENT_GAP: 'gap-3',
} as const;

export function RaceDetailsScreen({ raceId, onBack }: RaceDetailsScreenProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // 1. SMART ID PARSING
  const safeId = String(raceId || '');
  let year = '2024'; 
  let round = '1'; 

  const yearMatch = safeId.match(/\b(202\d)\b/); 
  if (yearMatch) year = yearMatch[1];
  else {
      const parts = safeId.split('-');
      if (parts[0] && parts[0].length === 4 && !isNaN(Number(parts[0]))) year = parts[0];
  }

  const roundMatch = safeId.match(/round-(\d+)/i);
  if (roundMatch) round = roundMatch[1];

  // 2. Logic Modes
  const is2025 = safeId.includes('2025-summary') || year === '2025';
  const is2026 = year === '2026';
  const shouldFetch = !is2025; // 🟢 Fetch for 2026 (Predictions) or 2024/23 (Results)

  // 3. Data State
  const [fetchedResults, setFetchedResults] = useState<RaceResult[]>([]);
  const [loading, setLoading] = useState(false);

  // 4. Fetch Effect
  useEffect(() => {
    if (!shouldFetch) return;

    const fetchResults = async () => {
      setLoading(true);
      try {
        const headers = { 
            "ngrok-skip-browser-warning": "true",
            "Content-Type": "application/json"
        };

        let rawData: any = null;

        // 🟢 BRANCH 1: PREDICTION (2026)
        if (is2026) {
            // Find Circuit Name from Schedule
            const raceInfo = SCHEDULE_2026.find(r => r.round === parseInt(round));
            const circuitName = raceInfo ? raceInfo.circuit : "Unknown";
            
            console.log(`🔮 Predicting for 2026 Round ${round} at ${circuitName}`);
            
            const res = await fetch(`${API_BASE}/predict`, {
                method: "POST",
                headers,
                body: JSON.stringify({ circuit_name: circuitName })
            });
            
            if (res.ok) {
                const data = await res.json();
                rawData = data.predictions; // Backend returns { predictions: [...] }
            }
        } 
        // 🟢 BRANCH 2: RESULTS (2024/2023)
        else {
            console.log(`🔄 Fetching results for ${year} Round ${round}`);
            const res = await fetch(`${API_BASE}/race_results?year=${year}&round=${round}`, { 
                method: "GET", 
                headers 
            });
            
            if (res.ok) {
                rawData = await res.json();
            } else {
                // Fallback
                const resFallback = await fetch(`${API_BASE}/race/${raceId}/results`, { headers });
                if (resFallback.ok) rawData = await resFallback.json();
            }
        }

        console.log("📊 Data Received:", rawData);

        // Normalize Data
        const cleanData: RaceResult[] = [];
        if (Array.isArray(rawData)) {
            for (const item of rawData) {
                if (item && typeof item === 'object') {
                    // Check if it's a Prediction object (has 'probability') or Result object
                    const isPrediction = item.probability !== undefined;
                    
                    cleanData.push({
                        position: parseInt(item.Position || item.position || '0'),
                        driver: isPrediction ? item.driver.name : String(item.Driver || item.driver || 'Unknown'),
                        team: isPrediction ? item.driver.team : String(item.Team || item.team || 'Unknown'),
                        points: item.Points ? parseFloat(item.Points) : undefined,
                        status: String(item.status || item.Status || (isPrediction ? 'Predicted' : 'Finished')),
                        wins: item.wins ? parseInt(item.wins) : undefined,
                        probability: item.probability, // 🟢 Capture Probability
                        details: isPrediction 
                            ? (item.reasons?.positive?.[0] || "AI Analysis pending") 
                            : item.details
                    });
                }
            }
            setFetchedResults(cleanData);
        }
      } catch (e) { console.error("Fetch Error:", e); }
      setLoading(false);
    };

    fetchResults();
  }, [safeId, year, round, shouldFetch, raceId, is2026]);

  // 5. Unified List Selection
  const displayList = useMemo(() => {
      if (is2025) return RESULTS_2025;
      return fetchedResults;
  }, [is2025, fetchedResults]);

  const headerTitle = is2025 ? "2025 Standings" : (is2026 ? "AI Prediction" : `Round ${round}`);
  const subTitle = is2025 ? "Season Summary" : (is2026 ? `2026 Season (Round ${round})` : `${year} Official Results`);

  // 6. Styles
  const containerStyle = isDark 
    ? { backgroundColor: '#0a0a0a', color: '#ffffff' } 
    : { backgroundColor: '#E2E8F0', backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '24px 24px', color: '#1e293b' };

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
    <div className="fixed inset-0 z-[1000] overflow-y-auto pb-24 font-sans w-full h-full transition-colors duration-300" style={containerStyle}>
      {/* HEADER */}
      <div className="sticky top-0 z-20 shadow-lg flex items-center gap-4 px-4 py-4" style={{ background: 'linear-gradient(to right, #7f1d1d, #450a0a)', color: 'white' }}>
        <button onClick={onBack} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-md border border-white/10">
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
      <div className="px-4 py-6 space-y-3">
        
        {/* --- LOADING --- */}
        {loading && (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="animate-spin text-4xl mb-4 text-red-600">🏎️</div>
                <p className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-neutral-500' : 'text-slate-500'}`}>
                    {is2026 ? "Running AI Simulation..." : "Fetching Results..."}
                </p>
            </div>
        )}

        {/* --- RESULTS LIST --- */}
        {!loading && displayList.map((result, index) => (
            <div 
                key={index}
                className={`p-3 rounded-xl shadow-sm flex flex-col gap-2 border transition-all active:scale-[0.99] ${isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-white hover:shadow-md'}`}
                style={{ borderLeft: `4px solid ${getTeamColor(result.team)}` }}
            >
                {/* Top Row */}
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

                    {/* Stats (Points OR Win Probability) */}
                    <div className="text-right">
                        {is2026 ? (
                             <div className="font-mono font-bold text-sm text-purple-500">
                                {result.probability}% <span className={`text-[9px] font-sans uppercase ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>WIN</span>
                             </div>
                        ) : (
                            result.wins !== undefined && result.wins > 0 ? (
                                <div className="font-mono font-bold text-sm text-blue-500">
                                    {result.wins} <span className={`text-[9px] font-sans uppercase ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>WINS</span>
                                </div>
                            ) : (
                                <div className="font-mono font-bold text-sm text-green-500">
                                    +{result.points} <span className={`text-[9px] font-sans uppercase ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>PTS</span>
                                </div>
                            )
                        )}
                    </div>
                </div>

                {/* AI DETAILS */}
                {result.details && (
                    <div className={`mt-1 pl-12 pr-2 py-2 rounded-lg text-xs leading-relaxed flex gap-2 items-start ${isDark ? 'bg-neutral-800/50 text-neutral-400' : 'bg-slate-50 text-slate-600'}`}>
                        {is2026 ? <BrainCircuit className="w-3 h-3 mt-0.5 flex-shrink-0 opacity-70" /> : <Info className="w-3 h-3 mt-0.5 flex-shrink-0 opacity-70" />}
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
        {!loading && displayList.length === 0 && (
            <div className={`text-center py-12 rounded-2xl border border-dashed ${isDark ? 'border-neutral-800 bg-neutral-900/50' : 'border-slate-200 bg-white'}`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${isDark ? 'bg-neutral-800' : 'bg-slate-100'}`}>
                    <Flag className={`w-6 h-6 ${isDark ? 'text-neutral-600' : 'text-slate-400'}`} />
                </div>
                <p className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>No results available</p>
                <p className={`text-xs mt-1 ${isDark ? 'text-neutral-500' : 'text-slate-500'}`}>Check back later</p>
            </div>
        )}

      </div>
    </div>
  );
}