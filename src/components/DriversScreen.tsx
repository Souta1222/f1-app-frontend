import React, { useState, useMemo, useEffect } from 'react';
import { Search, Camera, Upload, X, Sparkles, Trophy, BarChart3 } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';
import { ImageWithFallback } from './figma/ImageWithFallback';
// @ts-ignore
import { useTheme } from './../components/ThemeContext.tsx'; 
import { ThemeToggle } from './ThemeToggle'; 
import logo from '../styles/logo.png'; 

// 🟢 CONFIG
const API_BASE = 'https://isreal-falconiform-seasonedly.ngrok-free.dev';

interface DriverStats {
  win_probability: string;
  podium_probability: string;
  points_probability: string;
  average_position: number;
}

interface APIDriver {
  id: string; // Now "VER", "NOR", etc.
  name: string;
  team: string;
  country: string;
  stats: DriverStats;
}

const teamsList = [
  { name: 'All Teams', value: 'all', color: '#FFFFFF' },
  { name: 'Red Bull', value: 'Red Bull', color: '#3671C6' },
  { name: 'Ferrari', value: 'Ferrari', color: '#E8002D' },
  { name: 'Mercedes', value: 'Mercedes', color: '#27F4D2' },
  { name: 'McLaren', value: 'McLaren', color: '#FF8000' },
  { name: 'Aston Martin', value: 'Aston Martin', color: '#229971' },
  { name: 'Alpine', value: 'Alpine', color: '#FF87BC' },
  { name: 'Williams', value: 'Williams', color: '#64C4FF' },
  { name: 'RB', value: 'RB', color: '#6692FF' },
  { name: 'Haas', value: 'Haas', color: '#B6BABD' },
  { name: 'Sauber', value: 'Sauber', color: '#52E252' },
];

const getTeamColor = (teamName: string) => {
    const found = teamsList.find(t => teamName.includes(t.value) && t.value !== 'all');
    return found ? found.color : '#666666';
};

export function DriversScreen() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [apiDrivers, setApiDrivers] = useState<APIDriver[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDriver, setSelectedDriver] = useState<APIDriver | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [inputMessage, setInputMessage] = useState('');

  useEffect(() => {
    const fetchDrivers = async () => {
        try {
            const res = await fetch(`${API_BASE}/drivers`, {
                headers: { 'ngrok-skip-browser-warning': 'true' }
            });
            if (res.ok) {
                const data = await res.json();
                setApiDrivers(data);
            }
        } catch (error) {
            console.error("Failed to fetch drivers:", error);
        } finally {
            setLoading(false);
        }
    };
    fetchDrivers();
  }, []);

  const filteredDrivers = useMemo(() => {
    return apiDrivers.filter((driver) => {
      const matchesSearch = driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        driver.team.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTeam = selectedTeam === 'all' || driver.team.includes(selectedTeam);
      return matchesSearch && matchesTeam;
    });
  }, [apiDrivers, searchQuery, selectedTeam]);

  // 🟢 FIXED: Match based on 3-letter ID returned from API
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setUploadedImage(reader.result as string);
      reader.readAsDataURL(file);

      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch(`${API_BASE}/identify-driver`, {
          method: 'POST',
          headers: { 'ngrok-skip-browser-warning': 'true' },
          body: formData,
        });
        const data = await response.json();

        if (data.success && data.driver_id) {
          // data.driver_id is now "VER", "NOR" etc.
          // apiDrivers IDs are now "VER", "NOR" etc.
          const found = apiDrivers.find(d => d.id === data.driver_id);

          if (found) {
             setSelectedDriver(found);
             alert(`✅ Match found: ${found.name} (${data.confidence})`);
          } else {
             alert(`⚠️ Identified "${data.driver_id}" but stats are missing in your engine.`);
          }
        } else {
          alert(`❌ ${data.message || "Identification failed"}`);
          setSelectedDriver(null);
        }
      } catch (error) {
        console.error("🔥 Upload failed:", error);
        alert("Server connection failed.");
      }
    }
  };

  // ... rest of the component (Chat, Render, etc.) ...
  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    setChatMessages(prev => [...prev, { role: 'user', content: inputMessage }]);
    setInputMessage('');
    setTimeout(() => {
      setChatMessages(prev => [...prev, { role: 'assistant', content: "I'm the Grand Prix Guru! Ask me about driver stats." }]);
    }, 1000);
  };

  const containerStyle = isDark ? { backgroundColor: '#0a0a0a', color: '#ffffff' } : { backgroundColor: '#E2E8F0', backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '24px 24px', color: '#1e293b' };

  return (
    <div className="min-h-screen pb-24 font-sans w-full transition-colors duration-300" style={containerStyle}>
      <div className="fixed top-0 left-0 right-0 z-50 px-6 pt-12 pb-6 shadow-lg flex justify-between items-center transition-colors duration-300" style={{ background: 'linear-gradient(to right, #7f1d1d, #450a0a)' }}>
        <div>
           <div className="flex items-center gap-2 mt-6">
               <img src={logo} alt="F1INSIDER" className="h-8 w-auto" />
           </div>
        </div>
        <div className="flex items-center gap-3">
            <ThemeToggle />
        </div>
      </div>

      <div className="pt-32 px-4"> 
        <div className="mb-8 pl-2">
            <div className="inline-block px-3 py-2 rounded-xl bg-green-500 text-white dark:bg-red-600 dark:text-red-100">
            <h1 className="text-[10px] uppercase tracking-widest opacity-80">2025 SEASON PREDICTIONS</h1>
            </div>
        </div>

        <div className="mb-6">
            <button onClick={() => setUploadDialogOpen(true)} className={`w-full border-2 rounded-xl p-6 transition-all text-left group active:scale-[0.99] ${isDark ? 'bg-gradient-to-br from-red-900/20 to-neutral-900 border-red-900/50 hover:border-red-600' : 'bg-white border-white hover:border-red-200 shadow-md hover:shadow-lg'}`}>
            <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-14 h-14 bg-red-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Camera className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                    <h3 className={`font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Identify Driver AI</h3>
                    <p className={`text-sm ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>Upload a photo to see 2025 predictions</p>
                </div>
            </div>
            </button>
        </div>

        <div className="mb-4 relative">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-neutral-500' : 'text-slate-400'}`} />
            <Input type="text" placeholder="Search drivers..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className={`w-full pl-10 h-12 border transition-all ${isDark ? 'bg-neutral-900/80 border-neutral-800 text-white placeholder:text-neutral-600' : 'bg-white border-white text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-red-200'}`} />
        </div>

        <div className="mb-6">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {teamsList.map((team) => (
                <button key={team.value} onClick={() => setSelectedTeam(team.value)} className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-tight transition-all border ${selectedTeam === team.value ? 'bg-red-600 text-white border-red-600 shadow-md' : isDark ? 'bg-neutral-900 text-neutral-400 border-neutral-800' : 'bg-white text-slate-500 border-white shadow-sm'}`}>
                {team.value !== 'all' && <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: team.color }} />}
                {team.name}
                </button>
            ))}
            </div>
        </div>

        {loading ? (
             <div className="text-center py-20 animate-pulse"><div className="text-4xl mb-4">🏎️</div><p className={isDark ? "text-neutral-500" : "text-slate-400"}>Simulating 2025 Season...</p></div>
        ) : (
            <div className="grid grid-cols-2 gap-3">
                {filteredDrivers.map((driver) => (
                <div key={driver.id} onClick={() => setSelectedDriver(driver)} className={`cursor-pointer rounded-xl border overflow-hidden transition-all active:scale-[0.98] ${isDark ? 'bg-neutral-900/80 border-neutral-800 hover:border-neutral-600' : 'bg-white border-white shadow-sm hover:shadow-md hover:border-red-100'}`}>
                    <div className={`relative aspect-[4/3] ${isDark ? 'bg-neutral-800' : 'bg-slate-100'}`}>
                        {/* 🟢 FIXED: Image src now uses the 3-letter ID (e.g. /drivers/VER.png) */}
                        <ImageWithFallback src={`/drivers/${driver.id}.png`} alt={driver.name} className="w-full h-full object-cover object-top" />
                        <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: getTeamColor(driver.team) }} />
                    </div>
                    <div className="p-3">
                        <div className="mb-2">
                            <h3 className={`text-sm font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{driver.name}</h3>
                            <p className={`text-[10px] truncate ${isDark ? 'text-neutral-500' : 'text-slate-500'}`}>{driver.team}</p>
                        </div>
                        <div className={`grid grid-cols-3 gap-1 pt-2 border-t ${isDark ? 'border-neutral-800' : 'border-slate-100'}`}>
                            <div className="text-center"><div className="text-[9px] font-bold text-yellow-500 uppercase">Win</div><div className={`text-[10px] font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{driver.stats.win_probability}</div></div>
                            <div className="text-center border-l border-r border-dashed border-white/10"><div className="text-[9px] font-bold text-green-500 uppercase">Podium</div><div className={`text-[10px] font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{driver.stats.podium_probability}</div></div>
                            <div className="text-center"><div className="text-[9px] font-bold text-blue-500 uppercase">Points</div><div className={`text-[10px] font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{driver.stats.points_probability}</div></div>
                        </div>
                    </div>
                </div>
                ))}
            </div>
        )}
      </div>

      <Dialog open={uploadDialogOpen || !!selectedDriver} onOpenChange={(open) => { if (!open) { setUploadDialogOpen(false); setSelectedDriver(null); setUploadedImage(null); }}}>
        <DialogContent className={`max-w-[90vw] max-h-[90vh] overflow-y-auto rounded-2xl border shadow-2xl z-50 ${isDark ? '!bg-neutral-900 border-neutral-800 text-white' : '!bg-white border-slate-200 text-slate-900'}`} style={{ backgroundColor: isDark ? '#171717' : '#ffffff' }}>
          <DialogHeader>
            <DialogTitle className={isDark ? 'text-white' : 'text-slate-900'}>{selectedDriver ? 'Driver Profile' : 'Identify Driver'}</DialogTitle>
            <DialogDescription className={isDark ? 'text-neutral-400' : 'text-slate-500'}>{selectedDriver ? '2025 Season Forecast' : 'Upload a photo to predict results'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {!selectedDriver && !uploadedImage && (
              <label className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${isDark ? 'border-neutral-700 bg-neutral-950 hover:border-red-600' : 'border-slate-300 bg-slate-50 hover:border-red-400 hover:bg-slate-100'}`}>
                <div className="flex flex-col items-center justify-center pt-5 pb-6"><Upload className={`w-10 h-10 mb-3 ${isDark ? 'text-neutral-500' : 'text-slate-400'}`} /><p className={`mb-2 text-sm ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}>Tap to upload driver photo</p></div>
                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
              </label>
            )}
            {!selectedDriver && uploadedImage && (
                <div className="relative w-full h-72">
                  <img src={uploadedImage} alt="Uploaded" className="w-full h-full object-cover rounded-xl" />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><div className="animate-spin text-4xl">🏎️</div></div>
                </div>
            )}
            {selectedDriver && (
                <div>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white shadow-lg">
                            <ImageWithFallback src={`/drivers/${selectedDriver.id}.png`} alt={selectedDriver.name} className="w-full h-full object-cover object-top" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black italic uppercase leading-none">{selectedDriver.name}</h2>
                            <div className="flex items-center gap-2 mt-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: getTeamColor(selectedDriver.team) }}></span><span className={`text-sm font-bold ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}>{selectedDriver.team}</span></div>
                        </div>
                    </div>
                    <div className={`grid grid-cols-2 gap-3 mb-4`}>
                        <div className={`p-4 rounded-xl border ${isDark ? 'bg-neutral-800/50 border-neutral-700' : 'bg-slate-50 border-slate-200'}`}><div className="flex items-center gap-2 mb-1"><Trophy className="w-4 h-4 text-yellow-500" /><span className="text-xs font-bold uppercase opacity-70">Win Prob</span></div><div className="text-2xl font-black text-yellow-500">{selectedDriver.stats.win_probability}</div></div>
                        <div className={`p-4 rounded-xl border ${isDark ? 'bg-neutral-800/50 border-neutral-700' : 'bg-slate-50 border-slate-200'}`}><div className="flex items-center gap-2 mb-1"><BarChart3 className="w-4 h-4 text-green-500" /><span className="text-xs font-bold uppercase opacity-70">Podium</span></div><div className="text-2xl font-black text-green-500">{selectedDriver.stats.podium_probability}</div></div>
                    </div>
                    <div className={`p-4 rounded-xl border ${isDark ? 'bg-neutral-800/50 border-neutral-700' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="flex justify-between items-center mb-2"><span className="text-sm font-bold">Predicted Avg. Position</span><span className="text-xl font-mono font-bold">{selectedDriver.stats.average_position}</span></div>
                        <div className="w-full bg-gray-700 rounded-full h-2"><div className="bg-red-600 h-2 rounded-full" style={{ width: `${Math.max(5, (21 - selectedDriver.stats.average_position) * 5)}%` }}></div></div>
                    </div>
                    <Button onClick={() => setSelectedDriver(null)} className="w-full mt-4 bg-transparent border border-red-600 text-red-600 hover:bg-red-600 hover:text-white">Close Profile</Button>
                </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      <button onClick={() => setChatOpen(true)} className="fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center shadow-2xl shadow-red-600/50 hover:scale-110 transition-transform z-50"><Sparkles className="w-6 h-6 text-white" /></button>
      <Sheet open={chatOpen} onOpenChange={setChatOpen}>
        <SheetContent side="bottom" className="bg-neutral-900/95 border-t-2 border-red-600 text-white h-[85vh] rounded-t-3xl p-0">
          <SheetHeader className="px-6 pt-6 pb-4 border-b border-neutral-800"><SheetTitle>Grand Prix Guru</SheetTitle></SheetHeader>
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">{chatMessages.map((msg, i) => (<div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.role === 'user' ? 'bg-red-600' : 'bg-neutral-800'}`}><p className="text-sm">{msg.content}</p></div></div>))}</div>
          <div className="p-4 bg-neutral-900"><div className="flex gap-2"><Input value={inputMessage} onChange={e => setInputMessage(e.target.value)} className="bg-neutral-800 border-neutral-700 text-white" placeholder="Ask AI..." /><Button onClick={handleSendMessage} className="bg-red-600"><Sparkles className="w-4 h-4" /></Button></div></div>
        </SheetContent>
      </Sheet>
    </div>
  );
}