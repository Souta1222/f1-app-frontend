import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom'; 
import { Star, Send, X, User, Users, AlertCircle, ChevronRight, MessageSquare, ChevronDown } from 'lucide-react';
import { drivers, teams } from '../lib/data';
// @ts-ignore
import { useTheme } from './../components/ThemeContext.tsx'; 

// 🟢 CONFIG
const API_BASE = 'https://isreal-falconiform-seasonedly.ngrok-free.dev';

const SPACING = {
  SECTION_MARGIN: 'mb-8',
  SECTION_PADDING: 'px-3',
  CARD_PADDING: 'p-3',
  CARD_GAP: 'p-3',
  BORDER_WIDTH: 'border-8',
  BORDER_RADIUS: 'rounded-2xl',
  CONTENT_GAP: 'space-y-6',
  HEADER_MARGIN: 'mb-3',
  COMPONENT_GAP: 'gap-3',
} as const;

interface RatingData {
  driver_name: string;
  avg_rating: number;
  total_votes: number;
  latest_comments: { user: string; rating: number; text: string; date: string }[];
}

export function FanPulseWidget() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [ratings, setRatings] = useState<RatingData[]>([]);     
  const [teamRatings, setTeamRatings] = useState<RatingData[]>([]); 
  
  // Rating State
  const [selectedEntity, setSelectedEntity] = useState<string>(""); 
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [ratingType, setRatingType] = useState<'driver' | 'team'>('driver');
  const [userRating, setUserRating] = useState(10);
  const [userComment, setUserComment] = useState("");
  const [userName, setUserName] = useState("");

  // View All State
  const [viewAllType, setViewAllType] = useState<'driver' | 'team' | null>(null);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  
  const [mounted, setMounted] = useState(false);

  const allDriversList = Object.values(drivers);
  const allTeamsList = Object.values(teams);

  // BODY SCROLL LOCK - FIXED VERSION
  useEffect(() => {
    const hasModal = isRatingOpen || viewAllType;
    
    if (hasModal) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.classList.add('modal-open');
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.classList.remove('modal-open');
    }
    
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.classList.remove('modal-open');
    };
  }, [isRatingOpen, viewAllType]);

  // FETCH DATA
  const fetchData = async () => {
    try {
      const res = await fetch(`${API_BASE}/community/ratings?t=${Date.now()}`, {
        method: 'GET',
        headers: {
            'ngrok-skip-browser-warning': 'true', 
            'Content-Type': 'application/json'
        }
      });

      if (res.ok) {
        const allData: RatingData[] = await res.json();
        
        const knownTeamNames = allTeamsList.map(t => t.name.toLowerCase());
        const teamsData: RatingData[] = [];
        const driversData: RatingData[] = [];

        allData.forEach(d => {
            if (knownTeamNames.some(name => d.driver_name.toLowerCase().includes(name))) {
                teamsData.push(d);
            } else {
                driversData.push(d);
            }
        });

        const sorter = (a: RatingData, b: RatingData) => b.avg_rating - a.avg_rating || b.total_votes - a.total_votes;
        
        driversData.sort(sorter);
        teamsData.sort(sorter);

        setRatings(driversData);
        setTeamRatings(teamsData);
      }
    } catch (e) {
      console.error("Failed to load ratings", e);
    }
  };

  useEffect(() => {
    setMounted(true); 
    fetchData();
  }, []);

  const handleSubmit = async () => {
    if (!selectedEntity) return;
    try {
      await fetch(`${API_BASE}/community/rate`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true' 
        },
        body: JSON.stringify({
          driver_name: selectedEntity, 
          rating: userRating,
          comment: userComment || "No comment",
          username: userName || "Anonymous Fan"
        })
      });
      setIsRatingOpen(false);
      setUserComment("");
      setUserName("");
      setTimeout(fetchData, 500);
    } catch (e) {
      alert("Failed to submit rating");
    }
  };

  return (
    <>
      <div 
        className={`transition-all duration-300 ${
          (isRatingOpen || viewAllType) 
            ? 'blur-sm pointer-events-none select-none' 
            : ''
        }`}
      >
        <div className={`relative ${SPACING.BORDER_RADIUS} ${SPACING.BORDER_WIDTH} border-slate-200 dark:border-neutral-800`}>
          <div className={SPACING.CARD_GAP}>
            {/* MAIN WIDGET CARD - SOLID BACKGROUND */}
            <div className={`${SPACING.BORDER_RADIUS} w-full bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-lg`}>
              <div className={`${SPACING.CARD_PADDING}`}>
                
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-black text-lg flex items-center gap-2 uppercase tracking-tight text-neutral-900 dark:text-white">
                    F1 Fan Pulse
                  </h2>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider bg-gray-50 dark:bg-neutral-800 px-2 py-1 rounded-full">
                    Community
                  </span>
                </div>

                {/* --- DRIVERS SECTION --- */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-blue-500" />
                        <h3 className="font-bold text-sm text-gray-700 dark:text-white uppercase tracking-wide">Top Drivers</h3>
                      </div>
                      <button 
                        onClick={() => setViewAllType('driver')}
                        className="text-[10px] font-bold text-red-500 hover:underline flex items-center pointer-events-auto"
                      >
                        View All <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                    
                    <div className={SPACING.CONTENT_GAP}>
                      {ratings.slice(0, 3).map((driver, idx) => (
                        <div key={driver.driver_name} className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 rounded-xl flex items-center justify-between shadow-sm">
                          <div className="flex items-center gap-3">
                            <span className={`font-black text-lg w-6 text-center ${idx === 0 ? 'text-yellow-500' : 'text-gray-400 dark:text-gray-300'}`}>#{idx + 1}</span>
                            <div>
                              <div className="text-neutral-900 dark:text-white font-black text-sm uppercase tracking-wide truncate max-w-[120px]">{driver.driver_name}</div>
                              <div className="text-gray-500 dark:text-gray-400 text-[10px] font-bold flex items-center gap-1"><User className="w-3 h-3" /> {driver.total_votes} votes</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-black text-neutral-900 dark:text-white">{driver.avg_rating.toFixed(1)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button 
                      onClick={() => { setSelectedEntity(allDriversList[0].name); setRatingType('driver'); setIsRatingOpen(true); }}
                      className="w-full mt-3 font-bold py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs uppercase tracking-wider pointer-events-auto shadow-md"
                    >
                      Rate a Driver
                    </button>
                </div>

                {/* --- TEAMS SECTION --- */}
                <div className="mb-2">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-red-500" />
                        <h3 className="font-bold text-sm text-gray-700 dark:text-white uppercase tracking-wide">Top Teams</h3>
                      </div>
                      <button 
                        onClick={() => setViewAllType('team')}
                        className="text-[10px] font-bold text-red-500 hover:underline flex items-center pointer-events-auto"
                      >
                        View All <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                    
                    <div className={SPACING.CONTENT_GAP}>
                      {teamRatings.slice(0, 3).map((team, idx) => (
                        <div key={team.driver_name} className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 rounded-xl flex items-center justify-between shadow-sm">
                          <div className="flex items-center gap-3">
                            <span className={`font-black text-lg w-6 text-center ${idx === 0 ? 'text-yellow-500' : 'text-gray-400 dark:text-gray-300'}`}>#{idx + 1}</span>
                            <div>
                              <div className="text-neutral-900 dark:text-white font-black text-sm uppercase tracking-wide truncate max-w-[120px]">{team.driver_name}</div>
                              <div className="text-gray-500 dark:text-gray-400 text-[10px] font-bold flex items-center gap-1"><Users className="w-3 h-3" /> {team.total_votes} votes</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-black text-neutral-900 dark:text-white">{team.avg_rating.toFixed(1)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button 
                      onClick={() => { setSelectedEntity(allTeamsList[0].name); setRatingType('team'); setIsRatingOpen(true); }}
                      className="w-full mt-3 font-bold py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs uppercase tracking-wider pointer-events-auto shadow-md"
                    >
                      Rate a Team
                    </button>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- 🟢 VIEW ALL MODAL (SOLID BACKGROUND WITH BETTER PADDING) --- */}
      {mounted && viewAllType && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0,
            overflow: 'hidden'
          }}
          data-modal="true"
        >
          {/* Solid Dark Backdrop */}
          <div 
            className="absolute inset-0 bg-gray-900/95 dark:bg-black/95 modal-backdrop" 
            onClick={() => {
              setViewAllType(null);
              setExpandedItem(null);
            }}
          />
          
          {/* Modal Container - COMPLETELY SOLID BACKGROUND */}
          <div 
            className="relative z-[10000] w-full max-w-lg h-[85vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden modal-content"
            style={{
              backgroundColor: isDark ? '#171717' : '#ffffff'
            }}
          >
            {/* Fixed Header - SOLID BACKGROUND WITH MORE PADDING */}
            <div 
              className="flex-shrink-0 px-6 py-5 border-b flex justify-between items-center rounded-t-2xl"
              style={{
                backgroundColor: isDark ? '#262626' : '#f9fafb',
                borderColor: isDark ? '#404040' : '#e5e7eb'
              }}
            >
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight mb-1" style={{ color: isDark ? '#ffffff' : '#111827' }}>
                  {viewAllType === 'driver' ? 'Driver Standings' : 'Team Standings'}
                </h3>
                <p className="text-xs font-medium" style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
                  Based on community votes
                </p>
              </div>
              <button 
                onClick={() => { 
                  setViewAllType(null); 
                  setExpandedItem(null); 
                }}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ml-3"
                style={{
                  backgroundColor: isDark ? '#374151' : '#f3f4f6',
                  borderColor: isDark ? '#4b5563' : '#d1d5db'
                }}
              >
                <X className="w-5 h-5" style={{ color: isDark ? '#d1d5db' : '#4b5563' }} />
              </button>
            </div>

            {/* Scrollable Content Area - SOLID BACKGROUND WITH BETTER PADDING */}
            <div 
              className="flex-1 overflow-y-auto modal-scroll-fix"
              style={{
                backgroundColor: isDark ? '#171717' : '#ffffff'
              }}
            >
              <div className="px-5 py-4 space-y-4">
                {(viewAllType === 'driver' ? ratings : teamRatings).map((item, idx) => (
                  <div 
                    key={item.driver_name} 
                    className="overflow-hidden rounded-xl border shadow-sm transition-all"
                    style={{
                      backgroundColor: isDark ? '#262626' : '#f9fafb',
                      borderColor: isDark ? '#404040' : '#e5e7eb'
                    }}
                  >
                    {/* Main Row - WITH MORE PADDING */}
                    <button 
                      onClick={() => setExpandedItem(expandedItem === item.driver_name ? null : item.driver_name)}
                      className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
                      style={{
                        backgroundColor: isDark ? '#262626' : '#ffffff'
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <span 
                          className="font-black text-xl w-8 text-center"
                          style={{ color: idx < 3 ? '#f59e0b' : (isDark ? '#9ca3af' : '#6b7280') }}
                        >
                          #{idx + 1}
                        </span>
                        <div className="min-w-0">
                          <div className="font-bold text-base mb-1" style={{ color: isDark ? '#ffffff' : '#111827' }}>
                            {item.driver_name}
                          </div>
                          <div className="text-xs font-medium flex items-center gap-1" style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
                            {item.total_votes} ratings • Click to see comments
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 ml-3">
                        <div className="px-3 py-1 rounded-lg font-black text-lg" style={{
                          backgroundColor: item.avg_rating >= 9 
                            ? (isDark ? '#065f46' : '#d1fae5') 
                            : item.avg_rating >= 7 
                            ? (isDark ? '#1e40af' : '#dbeafe') 
                            : (isDark ? '#7f1d1d' : '#fee2e2'),
                          color: item.avg_rating >= 9 
                            ? (isDark ? '#34d399' : '#065f46') 
                            : item.avg_rating >= 7 
                            ? (isDark ? '#60a5fa' : '#1e40af') 
                            : (isDark ? '#f87171' : '#7f1d1d')
                        }}>
                          {item.avg_rating.toFixed(1)}
                        </div>
                        <ChevronDown 
                          className={`w-5 h-5 transition-transform ${expandedItem === item.driver_name ? 'rotate-180' : ''}`} 
                          style={{ color: isDark ? '#9ca3af' : '#6b7280' }}
                        />
                      </div>
                    </button>

                    {/* Expanded Comments Section - SOLID BACKGROUND WITH BETTER PADDING */}
                    {expandedItem === item.driver_name && (
                      <div 
                        className="border-t px-5 py-4"
                        style={{
                          backgroundColor: isDark ? '#1f2937' : '#f9fafb',
                          borderColor: isDark ? '#374151' : '#e5e7eb'
                        }}
                      >
                        <div className="text-xs font-bold uppercase mb-3 flex items-center gap-1" style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
                          <MessageSquare className="w-3 h-3" /> Recent Feedback
                        </div>
                        <div className="space-y-3">
                          {item.latest_comments && item.latest_comments.length > 0 ? (
                            item.latest_comments.slice().reverse().map((comment, cIdx) => (
                              <div 
                                key={cIdx} 
                                className="px-4 py-3 rounded-lg border"
                                style={{
                                  backgroundColor: isDark ? '#111827' : '#ffffff',
                                  borderColor: isDark ? '#374151' : '#e5e7eb'
                                }}
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <span className="font-bold text-xs flex items-center gap-1" style={{ color: isDark ? '#ffffff' : '#111827' }}>
                                    <User className="w-3 h-3" style={{ color: '#9ca3af' }} /> {comment.user}
                                  </span>
                                  <span className="text-[10px] font-bold px-2 py-1 rounded" style={{
                                    backgroundColor: comment.rating >= 8 
                                      ? (isDark ? '#065f46' : '#d1fae5') 
                                      : comment.rating >= 6 
                                      ? (isDark ? '#854d0e' : '#fef3c7') 
                                      : (isDark ? '#7f1d1d' : '#fee2e2'),
                                    color: comment.rating >= 8 
                                      ? (isDark ? '#34d399' : '#065f46') 
                                      : comment.rating >= 6 
                                      ? (isDark ? '#fbbf24' : '#854d0e') 
                                      : (isDark ? '#f87171' : '#7f1d1d')
                                  }}>
                                    {comment.rating}/10
                                  </span>
                                </div>
                                <p className="text-sm italic mb-2 px-1" style={{ color: isDark ? '#d1d5db' : '#4b5563' }}>"{comment.text}"</p>
                                <div className="text-[10px] text-right px-1" style={{ color: isDark ? '#6b7280' : '#9ca3af' }}>{comment.date}</div>
                              </div>
                            ))
                          ) : (
                            <div 
                              className="text-center text-sm italic py-3 px-4 rounded-lg border"
                              style={{
                                backgroundColor: isDark ? '#111827' : '#ffffff',
                                borderColor: isDark ? '#374151' : '#e5e7eb',
                                color: isDark ? '#9ca3af' : '#6b7280'
                              }}
                            >
                              No comments yet.
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* --- 🟢 RATING MODAL (UPDATED WITH EXIT BUTTON INSIDE MODAL) --- */}
      {mounted && isRatingOpen && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6"
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0,
            overflow: 'hidden'
          }}
          data-modal="true"
        >
          {/* Solid Dark Backdrop */}
          <div 
            className="absolute inset-0 bg-gray-900/95 dark:bg-black/95 modal-backdrop" 
            onClick={() => setIsRatingOpen(false)} 
          />
          
          {/* Modal Container */}
          <div className="relative z-[10000] w-full max-w-md mx-4">
            {/* Modal Card with Exit Button Inside */}
            <div 
              className="rounded-2xl shadow-2xl relative overflow-hidden"
              style={{ 
                backgroundColor: isDark ? '#171717' : '#ffffff'
              }}
            >
              {/* Exit Button - Positioned at top-right inside modal */}
              <button 
                onClick={() => setIsRatingOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full z-20 transition-all hover:scale-105 active:scale-95 shadow-sm"
                style={{ 
                  backgroundColor: isDark ? '#374151' : '#f3f4f6',
                  border: '1px solid',
                  borderColor: isDark ? '#4b5563' : '#d1d5db',
                  color: isDark ? '#d1d5db' : '#4b5563'
                }}
                aria-label="Close rating modal"
              >
                <X className="w-5 h-5" />
              </button>
              
              {/* Modal Content with padding for exit button */}
              <div className="px-6 py-7 pt-8">
                {/* Title with spacing for exit button */}
                <h3 className="text-xl font-black uppercase tracking-tight mb-2 pr-10" style={{ color: isDark ? '#ffffff' : '#111827' }}>
                  Rate {ratingType === 'driver' ? 'Driver' : 'Team'}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
                  Share your rating with the community
                </p>
                
                {/* Type Toggle */}
                <div 
                  className="flex rounded-xl p-1 mb-6"
                  style={{ 
                    backgroundColor: isDark ? '#262626' : '#f3f4f6',
                    borderColor: isDark ? '#404040' : '#d1d5db'
                  }}
                >
                  <button 
                    onClick={() => { setRatingType('driver'); setSelectedEntity(allDriversList[0].name); }} 
                    className={`flex-1 py-3 rounded-lg font-bold text-sm transition-colors ${ratingType === 'driver' ? 'text-white' : ''}`}
                    style={{ 
                      backgroundColor: ratingType === 'driver' ? '#dc2626' : 'transparent',
                      color: ratingType === 'driver' ? '#ffffff' : (isDark ? '#9ca3af' : '#4b5563')
                    }}
                  >
                    Driver
                  </button>
                  <button 
                    onClick={() => { setRatingType('team'); setSelectedEntity(allTeamsList[0].name); }} 
                    className={`flex-1 py-3 rounded-lg font-bold text-sm transition-colors ${ratingType === 'team' ? 'text-white' : ''}`}
                    style={{ 
                      backgroundColor: ratingType === 'team' ? '#dc2626' : 'transparent',
                      color: ratingType === 'team' ? '#ffffff' : (isDark ? '#9ca3af' : '#4b5563')
                    }}
                  >
                    Team
                  </button>
                </div>
                
                {/* Dropdown */}
                <div className="relative mb-6">
                  <select 
                    value={selectedEntity}
                    onChange={(e) => setSelectedEntity(e.target.value)}
                    className="w-full rounded-xl px-4 py-3 font-bold appearance-none focus:outline-none focus:ring-2 focus:ring-red-500 border"
                    style={{ 
                      backgroundColor: isDark ? '#262626' : '#ffffff',
                      borderColor: isDark ? '#404040' : '#d1d5db',
                      color: isDark ? '#ffffff' : '#111827'
                    }}
                  >
                    {(ratingType === 'driver' ? allDriversList : allTeamsList).map(item => (
                      <option key={item.id} value={item.name} style={{ 
                        backgroundColor: isDark ? '#171717' : '#ffffff',
                        color: isDark ? '#ffffff' : '#111827'
                      }}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Slider Container */}
                <div 
                  className="mb-6 px-5 py-4 rounded-xl border"
                  style={{ 
                    backgroundColor: isDark ? '#262626' : '#f9fafb',
                    borderColor: isDark ? '#404040' : '#e5e7eb'
                  }}
                >
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-xs font-bold uppercase" style={{ color: isDark ? '#d1d5db' : '#4b5563' }}>Score</label>
                    <span className="text-3xl font-black" style={{ color: isDark ? '#ffffff' : '#111827' }}>{userRating}</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    value={userRating} 
                    onChange={(e) => setUserRating(Number(e.target.value))} 
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer" 
                    style={{ 
                      backgroundColor: isDark ? '#4b5563' : '#d1d5db',
                      accentColor: '#dc2626'
                    }}
                  />
                </div>

                {/* Inputs */}
                <div className="mb-6 space-y-4">
                  <input 
                    type="text" 
                    placeholder="Your Name (Optional)" 
                    value={userName} 
                    onChange={(e) => setUserName(e.target.value)} 
                    className="w-full rounded-lg px-4 py-3 text-sm font-medium focus:outline-none focus:border-red-500 border" 
                    style={{ 
                      backgroundColor: isDark ? '#262626' : '#ffffff',
                      borderColor: isDark ? '#404040' : '#d1d5db',
                      color: isDark ? '#ffffff' : '#111827'
                    }}
                  />
                  <textarea 
                    placeholder="Why this rating?" 
                    value={userComment} 
                    onChange={(e) => setUserComment(e.target.value)} 
                    className="w-full rounded-lg px-4 py-3 text-sm font-medium h-28 resize-none focus:outline-none focus:border-red-500 border" 
                    style={{ 
                      backgroundColor: isDark ? '#262626' : '#ffffff',
                      borderColor: isDark ? '#404040' : '#d1d5db',
                      color: isDark ? '#ffffff' : '#111827'
                    }}
                  />
                </div>

                {/* Submit Button */}
                <button 
                  onClick={handleSubmit} 
                  className="w-full font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-md uppercase tracking-wider hover:bg-red-700 active:scale-[0.98]"
                  style={{ 
                    backgroundColor: '#dc2626',
                    color: '#ffffff',
                    borderColor: '#b91c1c'
                  }}
                >
                  <Send className="w-4 h-4" /> Submit
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}