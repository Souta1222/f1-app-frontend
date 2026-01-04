import { useEffect, useState } from 'react';
import { ChevronRight, Clock, Newspaper, Trophy, Zap, MapPin } from 'lucide-react';
import { Button } from './ui/button';
import { races, myPredictions } from '../lib/data';
import { FanPulseWidget } from './FanPulseWidget';
// @ts-ignore
import { useTheme } from './../components/ThemeContext.tsx'; // Import Hook
import { ThemeToggle } from './ThemeToggle';         // Import Button
import logo from '../styles/LOGO.png';



// --- CONFIG ---
// 🟢 NEW: Your public internet backend
//const API_BASE = 'https://isreal-falconiform-seasonedly.ngrok-free.app';

//import { API_BASE } from '../config';

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

// Consistent spacing constants
const SPACING = {
  SECTION_MARGIN: 'mb-8', // Consistent margin between sections
  SECTION_PADDING: 'px-3', // Consistent horizontal padding
  CARD_PADDING: 'p-3', // Consistent card inner padding
  CARD_GAP: 'p-3', // Consistent gap between card border and content
  BORDER_WIDTH: 'border-8', // Consistent border width
  BORDER_RADIUS: 'rounded-2xl', // Consistent border radius
  CONTENT_GAP: 'space-y-6', // Consistent gap between content items
  HEADER_MARGIN: 'mb-3', // Consistent margin below headers
  COMPONENT_GAP: 'gap-3', // Consistent gap between components
} as const;

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
    ? { backgroundColor: '#0a0a0a', color: '#ee1919ff' } // Night Mode
    : { 
        backgroundColor: '#E2E8F0', // Silver Tarmac
        backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        color: '#1e293b' 
      };

  // Border color utilities
  const getBorderColor = (section: 'hero' | 'pulse' | 'news' | 'card') => {
    if (isDark) {
      switch(section) {
        case 'hero': return 'border-gray-700';
        case 'pulse': return 'border-blue-900/40';
        case 'news': return 'border-green-900/40';
        case 'card': return 'border-neutral-800';
        default: return 'border-neutral-800';
      }
    } else {
      switch(section) {
        case 'hero': return 'border-red-200';
        case 'pulse': return 'border-blue-200';
        case 'news': return 'border-green-200';
        case 'card': return 'border-slate-200';
        default: return 'border-slate-200';
      }
    }
  };

  // Background color utilities for hero card - UPDATED FOR DARK MODE
  const getHeroCardBg = () => {
    if (isDark) {
      // Dark mode: Use similar background to news section
      return {
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
        color: '#ffffff'
      };
    } else {
      return {
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        color: '#ffffff'
      };
    }
  };

  // Countdown box colors for dark mode - UPDATED
  const getCountdownBoxStyle = () => {
    if (isDark) {
      // Dark mode: Match news item styling
      return {
        backgroundColor: '#262626', // Dark gray similar to news items
        borderColor: '#404040', // Dark border
        color: '#ffffff'
      };
    } else {
      return {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        color: '#ffffff'
      };
    }
  };

  // Badge colors for dark mode
  const getBadgeStyle = () => {
    if (isDark) {
      return {
        backgroundColor: '#dc2626',
        color: '#ffffff'
      };
    } else {
      return {
        backgroundColor: '#dc2626',
        color: '#ffffff'
      };
    }
  };

  // Speed lines color for dark mode
  const getSpeedLinesColor = () => {
    if (isDark) {
      return 'bg-gray-700/10'; // Subtle dark mode speed lines
    } else {
      return 'bg-white/5'; // Light mode speed lines
    }
  };

  const heroCardStyle = getHeroCardBg();
  const countdownBoxStyle = getCountdownBoxStyle();
  const badgeStyle = getBadgeStyle();
  const speedLinesColor = getSpeedLinesColor();

  return (
    <div 
      className="min-h-screen font-sans w-full transition-colors duration-300"
      style={containerStyle}
    >
      
      {/* --- HEADER --- */}
      <div 
        className="sticky top-0 z-50 px-6 pt-12 pb-6 shadow-2xl flex justify-between items-center transition-colors duration-300 backdrop-blur-sm"
        style={{ background: 'linear-gradient(to right, #7f1d1d, #450a0a)' }}
      >
        <div>
            <p className="text-red-200 text-[10px] font-bold uppercase tracking-widest mb-1 opacity-80">Race Week Hub</p>
            <div className="flex items-center gap-2">
                <img 
                src={logo} 
                alt="F1INSIDER" 
                className="h-8 w-auto"
                />
            </div>
        </div>

        <div className="flex items-center gap-3">
            <ThemeToggle />
            
            <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full border border-white/20 flex items-center justify-center text-white shadow-inner">
                <span className="text-xs font-bold">ME</span>
            </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className={`${SPACING.SECTION_PADDING} ${SPACING.CONTENT_GAP} mt-2 pb-10 pt-2`}>
        
        {/* --- 1. HERO CARD --- */}
        <section className={SPACING.SECTION_MARGIN}>
          {/* Section Header */}
          <div className={`${SPACING.HEADER_MARGIN} ${SPACING.SECTION_PADDING}`}>
            <div className={`flex items-center ${SPACING.COMPONENT_GAP} ${isDark ? 'text-white' : 'text-slate-800'}`}>
              <div className="w-1 h-6 bg-red-600 rounded-full shadow-sm mt-6"></div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-red-600 opacity-90 mb-0.5 mt-6">Featured</p>
                <h2 className="font-bold text-xl tracking-tight">Next Grand Prix</h2>
              </div>
            </div>
          </div>
          
          {/* Card Container */}
          <div className={`relative ${SPACING.BORDER_RADIUS} ${SPACING.BORDER_WIDTH} ${getBorderColor('hero')} overflow-hidden z-10`}>
            {/* Outer border gap */}
            <div className={SPACING.CARD_GAP}>
              {/* Card Content with dynamic background */}
              <div 
                className={`${SPACING.BORDER_RADIUS} w-full`} 
                style={heroCardStyle}
              >
                {/* Speed Lines */}
                <div className={`absolute top-0 right-0 w-40 h-full skew-x-12 transform translate-x-20 pointer-events-none ${speedLinesColor}`} />
                
                <div className={`relative ${SPACING.CARD_PADDING}`}>
                  {/* Date and Badge */}
                  <div className="flex justify-between items-start mb-6">
                    <div 
                      className="text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg border border-red-500 m-2"
                      style={badgeStyle}
                    >
                      Live Countdown
                    </div>
                    <span className={isDark ? "text-gray-400 text-xs font-mono tracking-wider" : "text-white/60 text-xs font-mono tracking-wider"}>
                      {nextRace.date}
                    </span>
                  </div>

                  {/* Race Info */}
                  <div className={`flex items-center ${SPACING.COMPONENT_GAP} mb-8`}>
                    <span className="text-5xl filter drop-shadow-2xl">{nextRace.flag}</span>
                    <div>
                      <h3 className={`text-2xl font-black uppercase leading-none mb-1 ${
                        isDark ? 'text-white' : 'text-white'
                      }`}>
                        {nextRace.name}
                      </h3>
                      <div className={`flex items-center gap-1 font-bold text-xs uppercase tracking-widest ${
                        isDark ? 'text-red-400' : 'text-red-400'
                      }`}>
                        <MapPin className="w-3 h-3" />
                        {nextRace.circuit}
                      </div>
                    </div>
                  </div>

                  {/* Countdown Grid - Updated for dark mode */}
                  <div className={`grid grid-cols-4 ${SPACING.COMPONENT_GAP} mb-6`}>
                    {[
                      { label: 'DAYS', val: countdown.days },
                      { label: 'HRS', val: countdown.hours },
                      { label: 'MIN', val: countdown.minutes },
                      { label: 'SEC', val: countdown.seconds }
                    ].map((item, i) => (
                      <div 
                        key={i} 
                        className={`rounded-xl p-3 text-center backdrop-blur-md shadow-inner border ${
                          isDark ? 'border-gray-700' : 'border-white/10'
                        }`}
                        style={countdownBoxStyle}
                      >
                        <div className={`text-2xl font-black tabular-nums leading-none mb-1 ${
                          isDark ? 'text-white' : 'text-white'
                        }`}>
                          {String(item.val).padStart(2, '0')}
                        </div>
                        <div className={`text-[10px] font-bold tracking-wider ${
                          isDark ? 'text-gray-400' : 'text-white/40'
                        }`}>
                          {item.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Action Button */}
                  <Button 
                    onClick={() => onNavigateToRace(nextRace.id)}
                    className={`w-full font-bold uppercase tracking-widest h-12 rounded-xl shadow-lg border-0 transition-all mt-4 ${
                      isDark 
                        ? 'bg-red-600 text-white hover:bg-red-700 border border-red-500' 
                        : 'bg-white text-slate-900 hover:bg-gray-100'
                    }`}
                  >
                    View AI Prediction
                    <ChevronRight className={`w-4 h-4 ml-2 ${isDark ? 'text-white' : 'text-red-600'}`} />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- 2. FAN PULSE --- */}
            <section className={SPACING.SECTION_MARGIN}>
            {/* Section Header */}
            <div className={`${SPACING.HEADER_MARGIN} ${SPACING.SECTION_PADDING}`}>
                <div className={`flex items-center ${SPACING.COMPONENT_GAP} ${isDark ? 'text-white' : 'text-slate-800'}`}>
                <div className={`w-1 h-6 rounded-full shadow-sm ${isDark ? 'bg-blue-500' : 'bg-blue-600'}`}></div>
                <div>
                    <p className={`text-xs font-bold uppercase tracking-widest mb-0.5 ${
                    isDark ? 'text-blue-400' : 'text-blue-600'
                    }`}>
                    Community
                    </p>
                    <h2 className="font-bold text-xl tracking-tight">Fan Pulse</h2>
                </div>
                </div>
                <p className={`text-sm mt-2 ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}>
                Real-time sentiment from F1 fans worldwide
                </p>
            </div>
            
            {/* Card Container */}
            <div className={`relative ${SPACING.BORDER_RADIUS} ${SPACING.BORDER_WIDTH} ${
                isDark ? 'border-neutral-800' : 'border-slate-200'
            }`}>
                {/* Outer border gap */}
                <div className={SPACING.CARD_GAP}>
                {/* Card Content */}
                <div className={`${SPACING.BORDER_RADIUS} ${
                    isDark ? 'bg-neutral-900' : 'bg-slate-50'
                }`}>
                    <FanPulseWidget />
                </div>
                </div>
            </div>
            </section>

        {/* --- 3. NEWS LIST --- */}
        <section className={SPACING.SECTION_MARGIN}>
          {/* Section Header */}
          <div className={`${SPACING.HEADER_MARGIN} ${SPACING.SECTION_PADDING}`}>
            <div className={`flex items-center justify-between ${isDark ? 'text-white' : 'text-slate-800'}`}>
              <div className={`flex items-center ${SPACING.COMPONENT_GAP}`}>
                <div className="w-1 h-6 bg-green-600 rounded-full shadow-sm"></div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-green-600 opacity-90 mb-0.5">Updates</p>
                  <h2 className="font-bold text-xl tracking-tight">Trending News</h2>
                </div>
              </div>
              <div className={`flex items-center ${SPACING.COMPONENT_GAP}`}>
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
                </span>
                <span className={`text-xs font-medium ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}>
                  Live
                </span>
              </div>
            </div>
            <p className={`text-sm mt-2 ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}>
              Latest headlines from the F1 world
            </p>
          </div>

          {/* News List Container */}
          <div className={SPACING.CONTENT_GAP}>
            {realNews.length === 0 ? (
              <div className={`relative ${SPACING.BORDER_RADIUS} ${SPACING.BORDER_WIDTH} ${getBorderColor('news')}`}>
                <div className={SPACING.CARD_GAP}>
                  <div className={`${SPACING.BORDER_RADIUS} border ${SPACING.CARD_PADDING} text-center ${
                    isDark 
                      ? 'bg-neutral-900 border-neutral-700' 
                      : 'bg-white border-slate-100'
                  }`}>
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                      isDark ? 'bg-neutral-800' : 'bg-slate-100'
                    }`}>
                      <Newspaper className={`w-8 h-8 ${isDark ? 'text-neutral-500' : 'text-slate-400'}`} />
                    </div>
                    <p className={`font-bold text-lg mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      No News Available
                    </p>
                    <p className={`text-sm ${isDark ? 'text-neutral-500' : 'text-slate-500'}`}>
                      Ask the chatbot to fetch the latest news
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              realNews.map((item, index) => (
                <div key={index} className={`relative ${SPACING.BORDER_RADIUS} ${SPACING.BORDER_WIDTH} ${getBorderColor('news')}`}>
                  <div className={SPACING.CARD_GAP}>
                    <a 
                      href={item.Link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`
                        ${SPACING.BORDER_RADIUS} ${SPACING.CARD_PADDING} shadow-md flex items-center ${SPACING.COMPONENT_GAP}
                        transition-all active:scale-[0.99] border
                        ${isDark 
                          ? 'bg-neutral-900 border-neutral-700 hover:border-neutral-600' 
                          : 'bg-white border-slate-100 hover:border-green-100 hover:shadow-lg'
                        }
                      `}
                    >
                      <div className={`w-12 h-12 flex-shrink-0 rounded-xl flex items-center justify-center font-bold shadow-inner ${
                        isDark ? 'bg-green-900/20 text-green-500' : 'bg-green-50 text-green-600'
                      }`}>
                        <Zap className="w-5 h-5" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-bold text-sm leading-snug line-clamp-2 mb-2 ${
                          isDark ? 'text-white' : 'text-slate-900'
                        }`}>
                          {item.Headline}
                        </h4>
                        <div className={`flex items-center ${SPACING.COMPONENT_GAP}`}>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${
                            isDark 
                            ? 'text-neutral-300 bg-neutral-800 border border-neutral-700' 
                            : 'text-slate-600 bg-slate-100 border border-slate-200'
                          }`}>
                            {item.Source}
                          </span>
                          <span className={`text-xs ${isDark ? 'text-neutral-500' : 'text-slate-500'}`}>
                            {item.Date}
                          </span>
                        </div>
                      </div>
                      
                      <ChevronRight className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-neutral-600' : 'text-slate-400'}`} />
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}