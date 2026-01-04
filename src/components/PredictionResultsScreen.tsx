import React, { useState, useEffect } from 'react';
import { ChevronLeft, Info, TrendingUp, Trophy, Crown } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { races } from '../lib/data';

// 🟢 CONFIG
const API_BASE = 'https://isreal-falconiform-seasonedly.ngrok-free.dev';

// --- TYPES ---
type PredictionCard = {
  id: string;
  driverName: string;
  team: string;
  position: number;
  probability: string;
  reasons: {
    positive: string[];
    negative: string[];
  };
  driver: { teamColor: string };
};

const getTeamColor = (team: string) => {
  if (!team) return '#666666';
  const t = team.toLowerCase();
  if (t.includes('red bull')) return '#3671C6';
  if (t.includes('ferrari')) return '#D92A32';
  if (t.includes('mercedes')) return '#00A19C';
  if (t.includes('mclaren')) return '#FF8000';
  if (t.includes('aston')) return '#006F62';
  if (t.includes('williams')) return '#005AFF';
  if (t.includes('alpine')) return '#FF87BC';
  return '#666666';
};

interface PredictionResultsScreenProps {
  raceId: string;
  onBack: () => void;
}

export function PredictionResultsScreen({ raceId, onBack }: PredictionResultsScreenProps) {
  const [selectedDriver, setSelectedDriver] = useState<PredictionCard | null>(null);
  const [predictions, setPredictions] = useState<PredictionCard[]>([]);
  const [loading, setLoading] = useState(true);

  const race = races.find(r => r.id === raceId);

  useEffect(() => {
    if (!race) { setLoading(false); return; }

    const fetchPredictions = async () => {
      try {
        // 🟢 SINGLE CALL TO BACKEND
        const response = await fetch(`${API_BASE}/predict`, {
          method: 'POST',
          headers: { 
            'ngrok-skip-browser-warning': 'true',
            'Content-Type': 'application/json' 
          },
          body: JSON.stringify({
            circuit_name: race.circuit || "Unknown Circuit"
          })
        });

        if (!response.ok) throw new Error("API Failed");

        const data = await response.json();
        const backendList = data.predictions || [];

        // Map backend data to frontend format
        const formattedResults: PredictionCard[] = backendList.map((item: any) => ({
            id: item.driver.name,
            driverName: item.driver.name,
            team: item.driver.team,
            position: item.position,
            probability: item.probability + "%",
            reasons: item.reasons,
            driver: { teamColor: getTeamColor(item.driver.team) }
        }));

        setPredictions(formattedResults);
      } catch (error) {
        console.error("Prediction Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPredictions();
  }, [raceId, race]);

  if (!race) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4 text-red-600">🏎️</div>
          <p className="uppercase tracking-widest font-bold text-xs text-gray-400">Simulating 2026 Race...</p>
        </div>
      </div>
    );
  }

  const podium = predictions.slice(0, 3);
  
  return (
    <div className="fixed inset-0 z-[1000] overflow-y-auto font-sans pb-20 w-full h-full bg-gray-100 text-gray-900">
      
      {/* HEADER */}
      <div 
        className="sticky top-0 z-20 shadow-lg px-4 py-4"
        style={{ background: 'linear-gradient(to right, #7f1d1d, #450a0a)' }}
      >
          <button onClick={onBack} className="flex items-center text-white/90 hover:text-white mb-4 transition-colors">
            <ChevronLeft className="w-5 h-5 mr-1" />
            <span className="font-medium text-sm">Back</span>
          </button>
          
          <div className="flex flex-col">
            <div className="flex items-center gap-3 mb-2">
               <span className="text-4xl drop-shadow-md text-white">{race.flag}</span>
               <div>
                  <h1 className="text-white uppercase font-black text-2xl leading-none tracking-tight">{race.name}</h1>
                  <p className="text-xs font-semibold mt-1 uppercase tracking-widest text-white/80">{race.circuit}</p>
               </div>
            </div>
            <div className="flex items-center gap-2 mt-1 ml-1">
                <span className="text-[9px] font-bold uppercase tracking-widest border border-white/40 px-2 py-1 rounded-full text-white/90">
                    AI Forecast
                </span>
            </div>
          </div>
      </div>

      {/* PODIUM */}
      <div className="px-4 py-8 relative">
        <h2 className="text-gray-400 uppercase font-bold tracking-widest text-[10px] mb-8 text-center flex items-center justify-center gap-2">
            <Trophy className="w-3 h-3 text-yellow-500" /> Projected Podium
        </h2>
        
        <div className="flex items-end justify-center gap-2 h-48">
          {/* P2 */}
          {podium[1] && (
            <div className="flex flex-col items-center w-1/3">
               <div className="w-full bg-white rounded-t-xl border border-gray-200 shadow-md flex flex-col items-center h-28 relative">
                 <div className="w-full h-1.5 rounded-t-xl" style={{ backgroundColor: getTeamColor(podium[1].team) }} />
                 <div className="mt-2 font-bold text-2xl text-gray-300">2</div>
                 <div className="text-xs font-bold text-center leading-tight px-1 mt-1">{podium[1].driverName.split(' ').pop()}</div>
               </div>
            </div>
          )}
          {/* P1 */}
          {podium[0] && (
            <div className="flex flex-col items-center w-1/3 z-10 -mx-1">
               <Crown className="w-6 h-6 text-yellow-500 mb-2 animate-bounce" />
               <div className="w-full bg-white rounded-t-xl border-t-4 border-yellow-400 shadow-xl flex flex-col items-center h-36 relative">
                 <div className="mt-4 font-black text-4xl text-gray-900">1</div>
                 <div className="text-sm font-black text-center uppercase mt-2">{podium[0].driverName.split(' ').pop()}</div>
                 <div className="mt-2 bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full">{podium[0].probability} Win</div>
               </div>
            </div>
          )}
          {/* P3 */}
          {podium[2] && (
            <div className="flex flex-col items-center w-1/3">
               <div className="w-full bg-white rounded-t-xl border border-gray-200 shadow-md flex flex-col items-center h-24 relative">
                 <div className="w-full h-1.5 rounded-t-xl" style={{ backgroundColor: getTeamColor(podium[2].team) }} />
                 <div className="mt-2 font-bold text-2xl text-gray-300">3</div>
                 <div className="text-xs font-bold text-center leading-tight px-1 mt-1">{podium[2].driverName.split(' ').pop()}</div>
               </div>
            </div>
          )}
        </div>
      </div>

      {/* LIST */}
      <div className="px-4 space-y-3">
          {predictions.map((p) => (
            <div key={p.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center justify-between"
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
                    <button onClick={() => setSelectedDriver(p)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                        <Info className="w-4 h-4" />
                    </button>
                </div>
            </div>
          ))}
      </div>

      {/* DIALOG */}
      <Dialog open={!!selectedDriver} onOpenChange={() => setSelectedDriver(null)}>
        <DialogContent className="bg-white text-gray-900 rounded-2xl max-w-[90vw]">
          {selectedDriver && (
            <>
              <DialogHeader>
                <DialogTitle className="font-bold text-xl flex items-center gap-2">
                  <div className="w-1.5 h-6 rounded-full" style={{ backgroundColor: getTeamColor(selectedDriver.team) }}></div>
                  {selectedDriver.driverName}
                </DialogTitle>
              </DialogHeader>
              <div className="pt-4 space-y-4">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-xs font-bold text-gray-500 uppercase">Win Probability</span>
                        <span className="text-2xl font-bold text-green-600 font-mono">{selectedDriver.probability}</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500" style={{ width: selectedDriver.probability }} />
                    </div>
                </div>
                <div>
                    <div className="flex items-center gap-2 text-green-600 mb-2 font-bold text-xs uppercase"><TrendingUp className="w-4 h-4"/> AI Analysis</div>
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