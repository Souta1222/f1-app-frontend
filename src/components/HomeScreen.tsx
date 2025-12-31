import { useEffect, useState } from 'react';
import { ChevronRight, Clock, Newspaper, Trophy, Zap, MapPin } from 'lucide-react';
import { Button } from './ui/button';
import { races, myPredictions } from '../lib/data';
import { FanPulseWidget } from './FanPulseWidget';
import { useTheme } from './../components/ThemeContext.tsx'; // Import Hook
import { ThemeToggle } from './ThemeToggle';         // Import Button

// --- CONFIG ---
// 🟢 NEW: Your public internet backend
const API_BASE = 'https://isreal-falconiform-seasonedly.ngrok-free.dev';

interface HomeScreenProps {
  onNavigateToRace: (raceId: string) => void;
}

interface NewsArticle {
  Headline: string;
  Source: string;
  Date: string;
  Link: string;
  Team?: string; 
}

export function HomeScreen({ onNavigateToRace }: HomeScreenProps) {
  // 1. Theme Logic inside the component
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [realNews, setRealNews] = useState<NewsArticle[]>([]);
  
  // --- COUNTDOWN LOGIC ---
  const nextRace = races.find(race => race.id === 'australian-gp-2026') || races.find(race => race.status === 'upcoming');
  
  useEffect(() => {
    if (!nextRace) return;
    
    const updateCountdown = () => {
      const now = new Date();
      const raceDate = new Date(nextRace.date + (nextRace.time ? ' ' + nextRace.time : 'T12:00:00'));
      const diff = raceDate.getTime() - now.getTime();
      
      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        setCountdown({ days, hours, minutes, seconds });
      }
    };
    
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [nextRace]);

  // --- FETCH NEWS ---
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch(`${API_BASE}/news/latest`);
        if (res.ok) {
          const data = await res.json();
          setRealNews(data.slice(0, 5));
        }
      } catch (e) {
        console.error("Failed to fetch news", e);
      }
    };
    fetchNews();
  }, []);
  
  if (!nextRace) return null;

  // 2. Define Dynamic Styles
  const containerStyle = isDark 
    ? { backgroundColor: '#0a0a0a', color: '#ffffff' } // Night Mode
    : { 
        backgroundColor: '#E2E8F0', // Silver Tarmac
        backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        color: '#1e293b' 
      };

  return (
    <div 
      className="min-h-screen pb-24 font-sans w-full transition-colors duration-300"
      style={containerStyle}
    >
      
      {/* --- HEADER --- */}
      <div 
        className="sticky top-0 z-30 px-6 pt-12 pb-6 shadow-lg flex justify-between items-center transition-colors duration-300"
        style={{ background: 'linear-gradient(to right, #7f1d1d, #450a0a)' }}
      >
        <div>
            <p className="text-red-200 text-[10px] font-bold uppercase tracking-widest mb-1 opacity-80">Race Week Hub</p>
            <h1 className="text-2xl font-black text-white italic tracking-tighter">
                F1<span className="text-red-500">INSIDER</span>
            </h1>
        </div>

        <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <ThemeToggle />
            
            <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full border border-white/20 flex items-center justify-center text-white shadow-inner">
                <span className="text-xs font-bold">ME</span>
            </div>
        </div>
      </div>

      <div className="px-5 space-y-8 mt-6">

        {/* --- 1. HERO CARD --- */}
        <div className="relative w-full rounded-2xl shadow-xl overflow-hidden transform transition-all active:scale-[0.99]">
            <div 
                className="absolute inset-0" 
                style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}
            />
            {/* Speed Lines */}
            <div className="absolute top-0 right-0 w-40 h-full bg-white/5 skew-x-12 transform translate-x-20 pointer-events-none" />
            
            <div className="relative p-6 text-white">
                <div className="flex justify-between items-start mb-6">
                    <div className="bg-red-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg border border-red-500">
                        Next Grand Prix
                    </div>
                    <span className="text-white/60 text-xs font-mono tracking-wider">{nextRace.date}</span>
                </div>

                <div className="mb-8 flex items-center gap-4">
                    <span className="text-5xl filter drop-shadow-2xl">{nextRace.flag}</span>
                    <div>
                        <h2 className="text-white text-2xl font-black uppercase leading-none mb-1">
                            {nextRace.name}
                        </h2>
                        <div className="flex items-center gap-1 text-red-400 font-bold text-xs uppercase tracking-widest">
                            <MapPin className="w-3 h-3" />
                            {nextRace.circuit}
                        </div>
                    </div>
                </div>

                {/* Countdown Grid */}
                <div className="grid grid-cols-4 gap-2 mb-6">
                    {[
                        { label: 'DAYS', val: countdown.days },
                        { label: 'HRS', val: countdown.hours },
                        { label: 'MIN', val: countdown.minutes },
                        { label: 'SEC', val: countdown.seconds }
                    ].map((item, i) => (
                        <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-2 text-center backdrop-blur-md shadow-inner">
                            <div className="text-white text-xl font-black tabular-nums leading-none">
                                {String(item.val).padStart(2, '0')}
                            </div>
                            <div className="text-white/40 text-[9px] font-bold mt-1 tracking-wider">{item.label}</div>
                        </div>
                    ))}
                </div>

                <Button 
                    onClick={() => onNavigateToRace(nextRace.id)}
                    className="w-full bg-white text-slate-900 hover:bg-gray-100 font-bold uppercase tracking-widest h-12 rounded-xl shadow-lg border-0 transition-all"
                >
                    View AI Prediction
                    <ChevronRight className="w-4 h-4 ml-2 text-red-600" />
                </Button>
            </div>
        </div>

        {/* --- 2. FAN PULSE --- */}
        <div>
            <div className={`flex items-center gap-2 mb-4 px-1 transition-colors ${isDark ? 'text-white' : 'text-slate-800'}`}>
                <div className="w-1 h-5 bg-blue-600 rounded-full shadow-sm"></div>
                <h3 className="font-bold text-lg tracking-tight">Community Pulse</h3>
            </div>
            
            {/* Wrapper adapts to theme: Dark Navy in Night Mode, Slate-900 in Light Mode (to keep widget contrast) */}
            <div className={`rounded-2xl p-1 shadow-xl overflow-hidden border transition-colors ${
                isDark ? 'bg-black border-neutral-800' : 'bg-slate-900 border-slate-800'
            }`}>
                <FanPulseWidget />
            </div>
        </div>

        {/* --- 3. NEWS LIST --- */}
        <div className="mb-10">
            <div className={`flex items-center justify-between mb-4 px-1 transition-colors ${isDark ? 'text-white' : 'text-slate-800'}`}>
                <div className="flex items-center gap-2">
                    <div className={`w-1 h-5 rounded-full shadow-sm ${isDark ? 'bg-neutral-500' : 'bg-slate-900'}`}></div>
                    <h3 className="font-bold text-lg tracking-tight">Trending News</h3>
                </div>
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
                </span>
            </div>

            <div className="space-y-3">
                {realNews.length === 0 ? (
                    <div className={`border rounded-2xl p-8 text-center shadow-sm transition-colors ${
                        isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-slate-200'
                    }`}>
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${
                            isDark ? 'bg-neutral-800' : 'bg-slate-100'
                        }`}>
                            <Newspaper className={`w-6 h-6 ${isDark ? 'text-neutral-500' : 'text-slate-400'}`} />
                        </div>
                        <p className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>No news loaded</p>
                        <p className={`text-xs mt-1 ${isDark ? 'text-neutral-500' : 'text-slate-500'}`}>Ask the chatbot to update news</p>
                    </div>
                ) : (
                    realNews.map((item, index) => (
                        <a 
                            key={index}
                            href={item.Link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`
                                p-4 rounded-2xl shadow-md flex gap-4 items-center transition-all active:scale-[0.99]
                                ${isDark 
                                    ? 'bg-neutral-900 border border-neutral-800 hover:border-neutral-700' 
                                    : 'bg-white border border-white hover:border-red-100 hover:shadow-lg'
                                }
                            `}
                        >
                            <div className={`w-12 h-12 flex-shrink-0 rounded-xl flex items-center justify-center font-bold shadow-inner ${
                                isDark ? 'bg-red-900/20 text-red-500' : 'bg-red-50 text-red-600'
                            }`}>
                                <Zap className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className={`font-bold text-sm leading-snug line-clamp-2 mb-1 ${
                                    isDark ? 'text-white' : 'text-slate-900'
                                }`}>
                                    {item.Headline}
                                </h4>
                                <div className="flex items-center gap-2">
                                    <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                                        isDark 
                                        ? 'text-neutral-400 border border-neutral-700' 
                                        : 'text-slate-400 border border-slate-100'
                                    }`}>
                                        {item.Source}
                                    </span>
                                    <span className={`text-[9px] ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>
                                        {item.Date}
                                    </span>
                                </div>
                            </div>
                        </a>
                    ))
                )}
            </div>
        </div>

      </div>
    </div>
  );
}