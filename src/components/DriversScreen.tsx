import React, { useState, useMemo } from 'react';
import { Search, Camera, Upload, X, Sparkles } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { drivers } from '../lib/data';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useTheme } from './../components/ThemeContext.tsx'; 
import { ThemeToggle } from './ThemeToggle'; //  1. IMPORT ADDED

// ⚠️ YOUR IP ADDRESS
// 🟢 NEW: Your public internet backend
const API_BASE = 'https://isreal-falconiform-seasonedly.ngrok-free.dev';

const teams = [
  { name: 'All Teams', value: 'all', color: '#FFFFFF' },
  { name: 'Red Bull', value: 'Red Bull Racing', color: '#3671C6' },
  { name: 'Ferrari', value: 'Ferrari', color: '#E8002D' },
  { name: 'Mercedes', value: 'Mercedes', color: '#27F4D2' },
  { name: 'McLaren', value: 'McLaren', color: '#FF8000' },
  { name: 'Aston Martin', value: 'Aston Martin', color: '#229971' },
  { name: 'Alpine', value: 'Alpine', color: '#FF87BC' },
  { name: 'Williams', value: 'Williams', color: '#64C4FF' },
  { name: 'RB', value: 'RB', color: '#6692FF' },
  { name: 'Haas', value: 'Haas F1 Team', color: '#B6BABD' },
  { name: 'Sauber', value: 'Kick Sauber', color: '#52E252' },
];

export function DriversScreen() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [inputMessage, setInputMessage] = useState('');

  const driversList = Object.values(drivers);

  const filteredDrivers = useMemo(() => {
    return driversList.filter((driver) => {
      const matchesSearch = driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        driver.team.toLowerCase().includes(searchQuery.toLowerCase()) ||
        driver.nationality.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesTeam = selectedTeam === 'all' || driver.team === selectedTeam;
      
      return matchesSearch && matchesTeam;
    });
  }, [driversList, searchQuery, selectedTeam]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);

      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch(`${API_BASE}/identify-driver`, {
          method: 'POST',
          // 🟢 ADD THIS HEADERS BLOCK
          headers: {
            'ngrok-skip-browser-warning': 'true',
          },
          // ⚠️ NOTE: Do NOT add 'Content-Type' here! 
          // The browser automatically sets it for File Uploads.
          body: formData,
        });
        const data = await response.json();

        if (data.success && data.driver_id) {
          if (drivers[data.driver_id]) {
             setSelectedDriver(data.driver_id);
             alert(`✅ Match found: ${drivers[data.driver_id].name} (${data.confidence})`);
          } else {
             alert(`⚠️ AI identified "${data.driver_id}", but this driver is not in your app's data list.`);
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

  const selectedDriverData = selectedDriver ? drivers[selectedDriver] : null;

  const handleSmartChip = (question: string) => {
    setChatMessages(prev => [...prev, { role: 'user', content: question }]);
    setTimeout(() => {
      let response = "I'm analyzing the driver data...";
      if (question.includes('Compare')) response = "Max Verstappen leads with 3 titles, but Lando Norris is closing the gap with recent wins.";
      else if (question.includes('rookie')) response = "Oscar Piastri is the standout talent, challenging established drivers consistently.";
      else if (question.includes('Predict')) response = "For the next GP, Norris has a 65% podium probability based on track characteristics.";
      setChatMessages(prev => [...prev, { role: 'assistant', content: response }]);
    }, 1000);
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    setChatMessages(prev => [...prev, { role: 'user', content: inputMessage }]);
    setInputMessage('');
    setTimeout(() => {
      setChatMessages(prev => [...prev, { role: 'assistant', content: "I'm the Grand Prix Guru! Ask me about driver stats." }]);
    }, 1000);
  };

  // Define Dynamic Container Style
  const containerStyle = isDark 
    ? { backgroundColor: '#0a0a0a', color: '#ffffff' } 
    : { 
        backgroundColor: '#E2E8F0', 
        backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        color: '#1e293b' 
      };

  return (
    <div 
      className="min-h-screen pb-24 font-sans w-full transition-colors duration-300"
      style={containerStyle}
    >
      {/* 2. HEADER WITH TOGGLE BUTTON */}
      <div 
        className="sticky top-0 z-30 px-6 pt-12 pb-6 shadow-lg flex justify-between items-center transition-colors duration-300"
        style={{ background: 'linear-gradient(to right, #7f1d1d, #450a0a)' }}
      >
        <div>
           <p className="text-red-200 text-[10px] font-bold uppercase tracking-widest mb-1 opacity-80">2025 Season Grid</p>
           <h1 className="text-2xl font-black text-white italic tracking-tighter">
              DRIVERS<span className="text-red-500">HUB</span>
           </h1>
        </div>

        {/* 👈 BUTTON ADDED HERE */}
        <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full border border-white/20 flex items-center justify-center text-white shadow-inner">
                <span className="text-xs font-bold">ME</span>
            </div>
        </div>
      </div>

      <div className="px-4 mt-6">
        
        {/* AI Feature Card */}
        <div className="mb-6">
            <button
            onClick={() => setUploadDialogOpen(true)}
            className={`w-full border-2 rounded-xl p-6 transition-all text-left group active:scale-[0.99] ${
                isDark 
                ? 'bg-gradient-to-br from-red-900/20 to-neutral-900 border-red-900/50 hover:border-red-600' 
                : 'bg-white border-white hover:border-red-200 shadow-md hover:shadow-lg'
            }`}
            >
            <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-14 h-14 bg-red-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Camera className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                    <h3 className={`font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Identify Driver AI</h3>
                    <p className={`text-sm ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                        Upload a photo to instantly see stats & predictions
                    </p>
                </div>
            </div>
            </button>
        </div>

        {/* Search Bar */}
        <div className="mb-4 relative">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-neutral-500' : 'text-slate-400'}`} />
            <Input
                type="text"
                placeholder="Search drivers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 h-12 border transition-all ${
                    isDark 
                    ? 'bg-neutral-900/80 border-neutral-800 text-white placeholder:text-neutral-600' 
                    : 'bg-white border-white text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-red-200'
                }`}
            />
        </div>

        {/* Team Filters */}
        <div className="mb-6">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {teams.map((team) => (
                <button
                key={team.value}
                onClick={() => setSelectedTeam(team.value)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-tight transition-all border ${
                    selectedTeam === team.value
                    ? 'bg-red-600 text-white border-red-600 shadow-md'
                    : isDark
                        ? 'bg-neutral-900 text-neutral-400 border-neutral-800'
                        : 'bg-white text-slate-500 border-white shadow-sm'
                }`}
                >
                {team.value !== 'all' && (
                    <span
                    className="inline-block w-2 h-2 rounded-full mr-2"
                    style={{ backgroundColor: team.color }}
                    />
                )}
                {team.name}
                </button>
            ))}
            </div>
        </div>

        {/* Driver Grid */}
        <div className="grid grid-cols-2 gap-3">
            {filteredDrivers.map((driver) => (
            <div
                key={driver.id}
                className={`rounded-xl border overflow-hidden transition-all ${
                    isDark 
                    ? 'bg-neutral-900/80 border-neutral-800 hover:border-neutral-700' 
                    : 'bg-white border-white shadow-sm hover:shadow-md hover:border-red-100'
                }`}
            >
                <div className={`relative aspect-square ${isDark ? 'bg-neutral-800' : 'bg-slate-100'}`}>
                <ImageWithFallback
                    src={`https://images.unsplash.com/photo-1628618032874-79ad8e9decea?w=400&q=80`}
                    alt={driver.name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 w-8 h-8 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">
                    <span className="text-white font-bold text-xs">{driver.number}</span>
                </div>
                </div>

                <div className="p-3">
                <div className="mb-1">
                    <h3 className={`text-sm font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {driver.name}
                    </h3>
                </div>
                <div className="flex items-center gap-2">
                    <div
                    className="w-1 h-3 rounded-full"
                    style={{ backgroundColor: driver.teamColor }}
                    />
                    <span className={`text-xs truncate ${isDark ? 'text-neutral-500' : 'text-slate-500'}`}>
                        {driver.team}
                    </span>
                </div>
                </div>
            </div>
            ))}
        </div>

        {filteredDrivers.length === 0 && (
            <div className="text-center py-12">
            <p className={isDark ? "text-neutral-500" : "text-slate-400"}>No drivers found</p>
            </div>
        )}
      </div>

      {/* --- DIALOGS (Keep Dark Theme) --- */}
      
    {/* --- UPLOAD DIALOG (Fixed Mobile Close Button) --- */}
    <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent 
            className={`max-w-[90vw] max-h-[90vh] overflow-y-auto rounded-2xl border shadow-2xl transition-colors duration-300 z-50 ${
                isDark 
                ? '!bg-neutral-900 border-neutral-800 text-white' 
                : '!bg-white border-slate-200 text-slate-900'
            }`}
            style={{ 
                backgroundColor: isDark ? '#171717' : '#ffffff',
                opacity: 1 
            }}
        >
          <DialogHeader>
            <DialogTitle className={isDark ? 'text-white' : 'text-slate-900'}>
                Identify Driver AI
            </DialogTitle>
            <DialogDescription className={isDark ? 'text-neutral-400' : 'text-slate-500'}>
              Upload a photo to identify the driver.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {!uploadedImage ? (
              <label 
                className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                    isDark 
                    ? 'border-neutral-700 bg-neutral-950 hover:border-red-600' 
                    : 'border-slate-300 bg-slate-50 hover:border-red-400 hover:bg-slate-100'
                }`}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className={`w-10 h-10 mb-3 ${isDark ? 'text-neutral-500' : 'text-slate-400'}`} />
                  <p className={`mb-2 text-sm ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}>
                    Tap to upload
                  </p>
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
              </label>
            ) : (
              <div className="space-y-4">
                {/* Big Image Preview */}
                <div className="relative w-full h-72">
                  <img 
                    src={uploadedImage} 
                    alt="Uploaded" 
                    className="w-full h-full object-cover object-top rounded-xl shadow-md" 
                  />
                  
                  {/* 👇 FIXED BUTTON: High Contrast & Z-Index for Mobile Visibility */}
                  <button 
                    onClick={() => { setUploadedImage(null); setSelectedDriver(null); }} 
                    className="absolute top-2 right-2 z-10 w-9 h-9 bg-black/70 rounded-full flex items-center justify-center text-white hover:bg-black/90 backdrop-blur-md border border-white/30 shadow-xl transition-transform active:scale-90"
                    aria-label="Close Preview"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {selectedDriverData && (
                  <div className={`rounded-xl p-4 border transition-colors shadow-lg mt-2 ${
                      isDark 
                      ? 'bg-neutral-950 border-neutral-800' 
                      : 'bg-slate-50 border-slate-200'
                  }`}>
                    {/* Driver Header */}
                    <div className="flex items-center gap-4 mb-4">
                      {/* Team Color Strip (Fixed width) */}
                      <div 
                        className="w-2 h-12 rounded-full shadow-sm flex-shrink-0" 
                        style={{ backgroundColor: selectedDriverData.teamColor }} 
                      />
                      
                      <div>
                        <h3 className={`font-black text-lg italic tracking-tight leading-none ${
                            isDark ? 'text-white' : 'text-slate-900'
                        }`}>
                            {selectedDriverData.name.toUpperCase()}
                        </h3>
                        <p className={`text-xs mt-1 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                            {selectedDriverData.team}
                        </p>
                      </div>
                    </div>
                    
                    {/* Stats Grid */}
                    <div className={`grid grid-cols-4 gap-2 pt-3 border-t mb-4 ${
                        isDark ? 'border-neutral-800' : 'border-slate-200'
                    }`}>
                        {selectedDriverData.stats && Object.entries(selectedDriverData.stats).map(([key, val]) => (
                            <div key={key} className="text-center">
                                <div className={`font-bold text-lg leading-none ${
                                    isDark ? 'text-white' : 'text-slate-900'
                                }`}>
                                    {val}
                                </div>
                                <div className={`text-[9px] uppercase mt-1 ${
                                    isDark ? 'text-neutral-500' : 'text-slate-400'
                                }`}>
                                    {key}
                                </div>
                            </div>
                        ))}
                    </div>

                    <Button
                        onClick={() => {
                            setSearchQuery(selectedDriverData.name); 
                            setUploadDialogOpen(false);
                            setUploadedImage(null);
                            setSelectedDriver(null);
                        }}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md"
                    >
                        View Full Profile
                    </Button>

                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <button
        onClick={() => setChatOpen(true)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center shadow-2xl shadow-red-600/50 hover:scale-110 transition-transform z-50"
      >
        <Sparkles className="w-6 h-6 text-white" />
      </button>

      <Sheet open={chatOpen} onOpenChange={setChatOpen}>
        <SheetContent side="bottom" className="bg-neutral-900/95 border-t-2 border-red-600 text-white h-[85vh] rounded-t-3xl p-0">
          <SheetHeader className="px-6 pt-6 pb-4 border-b border-neutral-800">
            <SheetTitle>Grand Prix Guru</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.role === 'user' ? 'bg-red-600' : 'bg-neutral-800'}`}>
                        <p className="text-sm">{msg.content}</p>
                    </div>
                </div>
            ))}
          </div>
          <div className="p-4 bg-neutral-900">
             <div className="flex gap-2">
                <Input 
                    value={inputMessage} 
                    onChange={e => setInputMessage(e.target.value)} 
                    className="bg-neutral-800 border-neutral-700 text-white"
                    placeholder="Ask AI..."
                />
                <Button onClick={handleSendMessage} className="bg-red-600"><Sparkles className="w-4 h-4" /></Button>
             </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}