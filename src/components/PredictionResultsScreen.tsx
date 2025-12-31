import React, { useState, useEffect } from 'react';
import { ChevronLeft, Info, TrendingUp, TrendingDown, Calendar, Trophy, Crown } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { races } from '../lib/data';

// ⚠️ YOUR IP ADDRESS
// 🟢 NEW: Your public internet backend
const API_BASE = 'https://isreal-falconiform-seasonedly.ngrok-free.dev';

// --- TYPES ---
type PredictionCard = {
  id: string;
  driverName: string;
  team: string;
  position: number;
  probability: string;
  grid_position: number;
  reasons: {
    positive: string[];
    negative: string[];
  };
  driver: { teamColor: string };
};

// --- LIGHT THEME COLORS ---
const getTeamColor = (team: string) => {
  switch (team) {
    case 'Red Bull':
    case 'Red Bull Racing': return '#3671C6';
    case 'Ferrari': return '#D92A32'; 
    case 'Mercedes': return '#00A19C'; 
    case 'McLaren': return '#FF8000';
    case 'Aston Martin': return '#006F62';
    default: return '#666666';
  }
};

interface PredictionResultsScreenProps {
  raceId: string;
  onBack: () => void;
}

export function PredictionResultsScreen({ raceId, onBack }: PredictionResultsScreenProps) {
  const [selectedDriver, setSelectedDriver] = useState<PredictionCard | null>(null);
  const [predictions, setPredictions] = useState<PredictionCard[]>([]);
  const [loading, setLoading] = useState(true);

  // Safely find race
  const race = races.find(r => r.id === raceId);

  useEffect(() => {
    if (!race) { setLoading(false); return; }

    const fetchPredictions = async () => {
      const apiBase = API_BASE;
      let driversToPredict = [
          { name: "Max Verstappen", team: "Red Bull", grid: 1 },
          { name: "Lando Norris", team: "McLaren", grid: 2 },
          { name: "Charles Leclerc", team: "Ferrari", grid: 3 },
          { name: "Lewis Hamilton", team: "Mercedes", grid: 4 },
          { name: "Oscar Piastri", team: "McLaren", grid: 5 },
          { name: "George Russell", team: "Mercedes", grid: 6 }
      ];

      // Custom grid for 2026
      if (raceId === 'australian-gp-2026') {
        driversToPredict = [
          { name: "Lewis Hamilton", team: "Ferrari", grid: 1 },
          { name: "Charles Leclerc", team: "Ferrari", grid: 2 },
          { name: "Max Verstappen", team: "Red Bull", grid: 3 },
          { name: "Oscar Piastri", team: "McLaren", grid: 4 },
          { name: "Lando Norris", team: "McLaren", grid: 5 },
          { name: "George Russell", team: "Mercedes", grid: 6 }
        ];
      }

      const newResults: PredictionCard[] = [];

      for (const driver of driversToPredict) {
        try {
          const response = await fetch(`${apiBase}/predict`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              driver_name: driver.name,
              team_name: driver.team,
              grid_position: driver.grid,
              circuit_name: race?.circuit || "Unknown Circuit"
            })
          });

          if (!response.ok) continue;

          const data = await response.json();
          if (!data.podium_probability) continue;

          const prob = Number(data.podium_probability) * 100;
          const positiveReasons: string[] = [];
          const negativeReasons: string[] = [];

          if (driver.grid === 1) positiveReasons.push("Pole Position Advantage");
          else if (driver.grid <= 3) positiveReasons.push("Front Row Start");
          if (prob > 80) positiveReasons.push(`Dominant at ${race?.circuit}`); 
          if (prob < 15) negativeReasons.push("Statistical Disadvantage");

          if (positiveReasons.length === 0) positiveReasons.push("AI Model Confidence: Moderate");

          newResults.push({
            id: driver.name,
            driverName: driver.name,
            team: driver.team,
            position: 0, 
            probability: prob.toFixed(1) + "%", 
            grid_position: driver.grid,
            reasons: { positive: positiveReasons, negative: negativeReasons },
            driver: { teamColor: getTeamColor(driver.team) } 
          });

        } catch (error) {
          console.error(`Error:`, error);
        }
      }

      newResults.sort((a, b) => parseFloat(b.probability) - parseFloat(a.probability));
      newResults.forEach((p, index) => p.position = index + 1);

      setPredictions(newResults);
      setLoading(false);
    };

    fetchPredictions();
  }, [raceId, race]);

  if (!race) return null;

  // --- LOADING ---
  if (loading) {
    return (
      <div 
        className="fixed inset-0 z-[1000] flex items-center justify-center"
        style={{ backgroundColor: '#f3f4f6' }} 
      >
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4 text-red-800">🏎️</div>
          <p className="uppercase tracking-widest font-bold text-xs text-gray-400">Simulating Race Strategy...</p>
        </div>
      </div>
    );
  }

  const podium = predictions.slice(0, 3);
  
  const raceDate = (race as any).date 
    ? new Date((race as any).date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
    : 'UPCOMING';

  return (
    <div 
      className="fixed inset-0 z-[1000] overflow-y-auto font-sans pb-20 w-full h-full"
      style={{ backgroundColor: '#F3F4F6', color: '#111827' }} 
    >
      
      {/* --- HEADER (Dark Red Gradient) --- */}
      <div 
        className="sticky top-0 z-20 shadow-lg"
        // Dark Red for premium look
        style={{ background: 'linear-gradient(to right, #7f1d1d, #450a0a)' }}
      >
        <div className="px-4 py-4">
          <button onClick={onBack} className="flex items-center text-white/90 hover:text-white mb-4 transition-colors">
            <ChevronLeft className="w-5 h-5 mr-1" />
            <span className="font-medium text-sm">Back</span>
          </button>
          
          <div className="flex flex-col">
            <div className="flex items-center gap-3 mb-2">
               <span className="text-4xl drop-shadow-md text-white">{race.flag}</span>
               <div>
                  <h1 className="text-white uppercase font-black text-2xl leading-none tracking-tight shadow-sm">
                    {race.name}
                  </h1>
                  {/* Circuit Name: Forced White */}
                  <p 
                    className="text-xs font-semibold mt-1 uppercase tracking-widest opacity-100"
                    style={{ color: 'rgba(255, 255, 255, 0.9)' }} 
                  >
                    {race.circuit}
                  </p>
               </div>
            </div>

            <div className="flex items-center gap-2 mt-1 ml-1">
                {/* Date Pill: White BG, Bright Red Text */}
                <div className="bg-white px-3 py-1 rounded-full shadow-sm flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-red-600" />
                    <span 
                        className="text-[10px] font-bold uppercase tracking-widest"
                        style={{ color: '#dc2626' }} // FORCE RED
                    >
                        {raceDate}
                    </span>
                </div>
                {/* AI Badge: White Text with Border */}
                <span 
                    className="text-[9px] font-bold uppercase tracking-widest border border-white/40 px-2 py-1 rounded-full"
                    style={{ color: 'rgba(255, 255, 255, 0.9)' }} // FORCE WHITE
                >
                    AI Forecast
                </span>
            </div>
          </div>
        </div>
      </div>

      {/* --- PODIUM --- */}
      <div className="px-4 py-8 relative">
        <h2 className="text-gray-400 uppercase font-bold tracking-widest text-[10px] mb-8 text-center flex items-center justify-center gap-2">
            <Trophy className="w-3 h-3 text-yellow-500" />
            Projected Podium
        </h2>
        
        <div className="flex items-end justify-center gap-2">
          
          {/* P2 (Left) */}
          {podium[1] && (
            <div className="flex flex-col items-center flex-1">
               <div className="text-[10px] font-bold uppercase mb-2 text-gray-400">{podium[1].team}</div>
               
               <div className="w-full bg-white rounded-t-xl border border-gray-200 shadow-md flex flex-col items-center relative h-36">
                 <div className="w-full h-1.5 rounded-t-xl shrink-0" style={{ backgroundColor: getTeamColor(podium[1].team) }} />
                 <div className="flex flex-col justify-between items-center h-full w-full py-3 px-1">
                     <span className="text-3xl font-black text-gray-200">2</span>
                     <div className="flex flex-col items-center gap-1">
                        <span className="text-xs font-bold text-gray-900 truncate text-center leading-tight">
                            {podium[1].driverName.split(' ').pop()}
                        </span>
                        <div className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-full">
                            {podium[1].probability}
                        </div>
                     </div>
                 </div>
              </div>
            </div>
          )}

          {/* P1 (Center - Tall) */}
          {podium[0] && (
            <div className="flex flex-col items-center flex-[1.6] z-10 -mx-1">
               <div className="mb-2">
                 <Crown className="w-8 h-8 text-yellow-500 fill-yellow-500 animate-pulse" />
               </div>
               
               <div className="w-full bg-white rounded-t-xl border-t-4 border-x border-b border-t-yellow-400 border-gray-200 shadow-2xl flex flex-col items-center relative h-56 transform transition-transform hover:scale-[1.02]">
                 <div className="w-full h-1 opacity-50 shrink-0" style={{ backgroundColor: getTeamColor(podium[0].team) }} />
                 <div className="flex flex-col justify-between items-center h-full w-full py-4 px-2">
                     <span className="text-6xl font-black text-gray-900/90 drop-shadow-sm mt-2">1</span>
                     <div className="flex flex-col items-center gap-2 w-full">
                        <span className="text-sm font-black text-gray-900 uppercase tracking-tight text-center leading-tight">
                            {podium[0].driverName}
                        </span>
                        <div className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full border border-green-200 shadow-sm">
                            {podium[0].probability} Win
                        </div>
                     </div>
                 </div>
              </div>
            </div>
          )}

          {/* P3 (Right) */}
          {podium[2] && (
            <div className="flex flex-col items-center flex-1">
               <div className="text-[10px] font-bold uppercase mb-2 text-gray-400">{podium[2].team}</div>
               
               <div className="w-full bg-white rounded-t-xl border border-gray-200 shadow-md flex flex-col items-center relative h-32">
                 <div className="w-full h-1.5 rounded-t-xl shrink-0" style={{ backgroundColor: getTeamColor(podium[2].team) }} />
                 <div className="flex flex-col justify-between items-center h-full w-full py-3 px-1">
                     <span className="text-3xl font-black text-gray-200">3</span>
                     <div className="flex flex-col items-center gap-1">
                        <span className="text-xs font-bold text-gray-900 truncate text-center leading-tight">
                            {podium[2].driverName.split(' ').pop()}
                        </span>
                        <div className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-full">
                            {podium[2].probability}
                        </div>
                     </div>
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- LIST --- */}
      <div className="px-4 space-y-3">
          {predictions.map((p) => (
            <div key={p.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center justify-between transition-all hover:shadow-md"
                 style={{ borderLeft: `4px solid ${getTeamColor(p.team)}` }}>
                <div className="flex items-center gap-4">
                  <span className={`text-lg font-bold w-6 text-center ${p.position <= 3 ? 'text-gray-900' : 'text-gray-400'}`}>P{p.position}</span>
                  <div>
                    <div className="text-gray-900 font-bold">{p.driverName}</div>
                    <div className="text-[10px] font-bold uppercase text-gray-500">{p.team}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-green-600 font-bold font-mono text-sm">{p.probability}</div>
                    <button onClick={() => setSelectedDriver(p)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:text-red-900 hover:bg-red-50 transition-colors">
                        <Info className="w-4 h-4" />
                    </button>
                </div>
            </div>
          ))}
      </div>

      {/* --- DIALOG --- */}
      <Dialog open={!!selectedDriver} onOpenChange={() => setSelectedDriver(null)}>
        <DialogContent 
            className="rounded-2xl shadow-2xl max-w-[90vw]"
            style={{ backgroundColor: '#ffffff', color: '#111827' }}
        >
          {selectedDriver && (
            <>
              <DialogHeader>
                <DialogTitle className="text-gray-900 font-bold text-xl flex items-center gap-2">
                  <div className="w-1.5 h-6 rounded-full" style={{ backgroundColor: getTeamColor(selectedDriver.team) }}></div>
                  {selectedDriver.driverName}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-xs font-bold text-gray-500 uppercase">Win Chance</span>
                        <span className="text-2xl font-bold text-green-600 font-mono">{selectedDriver.probability}</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500" style={{ width: selectedDriver.probability }} />
                    </div>
                </div>
                <div>
                    <div className="flex items-center gap-2 text-green-600 mb-2 font-bold text-xs uppercase"><TrendingUp className="w-4 h-4"/> Key Strengths</div>
                    <ul className="space-y-2">
                        {selectedDriver.reasons.positive.map((r, i) => (
                            <li key={i} className="flex gap-2 text-sm text-gray-700"><span className="text-green-500">●</span> {r}</li>
                        ))}
                    </ul>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      
    </div>
  );
}