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
        <div className={`relative ${SPACING.BORDER_RADIUS} ${SPACING.BORDER_WIDTH} border-slate-200`}>
          <div className={SPACING.CARD_GAP}>
            <div className={`${SPACING.BORDER_RADIUS} w-full bg-slate-200 text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100`}>
              <div className={`${SPACING.CARD_PADDING}`}>
                
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-black text-lg flex items-center gap-2 uppercase tracking-tight text-neutral-900 dark:text-white">
                    F1 Fan Pulse
                  </h2>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider bg-gray-50 px-2 py-1 rounded-full dark:bg-neutral-800 dark:text-white">
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
                        className="text-[10px] font-bold text-blue-500 hover:underline flex items-center pointer-events-auto"
                      >
                        View All <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                    
                    <div className={SPACING.CONTENT_GAP}>
                      {ratings.slice(0, 3).map((driver, idx) => (
                        <div key={driver.driver_name} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-3 rounded-xl flex items-center justify-between shadow-sm">
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
                      className="w-full mt-3 font-bold py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs uppercase tracking-wider pointer-events-auto"
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
                        <div key={team.driver_name} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-3 rounded-xl flex items-center justify-between shadow-sm">
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
                      className="w-full mt-3 font-bold py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs uppercase tracking-wider pointer-events-auto"
                    >
                      Rate a Team
                    </button>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- 🟢 FIXED VIEW ALL MODAL --- */}
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
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm modal-backdrop" 
            onClick={() => {
              setViewAllType(null);
              setExpandedItem(null);
            }}
          />
          
          {/* Modal Container */}
          <div 
            className="relative z-[10000] w-full max-w-lg h-[85vh] flex flex-col rounded-2xl shadow-2xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 overflow-hidden modal-content"
          >
            {/* Fixed Header */}
            <div className="flex-shrink-0 p-5 border-b border-gray-100 dark:border-neutral-800 flex justify-between items-center bg-gray-50 dark:bg-neutral-900/50">
              <div>
                <h3 className="text-xl font-black text-neutral-900 dark:text-white uppercase tracking-tight">
                  {viewAllType === 'driver' ? 'Driver Standings' : 'Team Standings'}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  Based on community votes
                </p>
              </div>
              <button 
                onClick={() => { 
                  setViewAllType(null); 
                  setExpandedItem(null); 
                }}
                className="bg-gray-200 dark:bg-neutral-800 p-2 rounded-full hover:bg-gray-300 dark:hover:bg-neutral-700 transition-colors"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto modal-scroll-fix">
              <div className="p-4 space-y-3">
                {(viewAllType === 'driver' ? ratings : teamRatings).map((item, idx) => (
                  <div key={item.driver_name} className="overflow-hidden rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm transition-all">
                    {/* Main Row */}
                    <button 
                      onClick={() => setExpandedItem(expandedItem === item.driver_name ? null : item.driver_name)}
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-4">
                        <span className={`font-black text-xl w-8 text-center ${idx < 3 ? 'text-yellow-500' : 'text-gray-400'}`}>
                          #{idx + 1}
                        </span>
                        <div>
                          <div className="font-bold text-neutral-900 dark:text-white text-base">
                            {item.driver_name}
                          </div>
                          <div className="text-xs text-gray-500 font-medium flex items-center gap-1">
                            {item.total_votes} ratings • Click to see comments
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className={`px-3 py-1 rounded-lg font-black text-lg ${
                          item.avg_rating >= 9 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          item.avg_rating >= 7 ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                          'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {item.avg_rating.toFixed(1)}
                        </div>
                        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${expandedItem === item.driver_name ? 'rotate-180' : ''}`} />
                      </div>
                    </button>

                    {/* Expanded Comments Section */}
                    {expandedItem === item.driver_name && (
                      <div className="bg-gray-50 dark:bg-neutral-950/50 border-t border-gray-100 dark:border-neutral-800 p-4">
                        <div className="text-xs font-bold uppercase text-gray-400 mb-3 flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" /> Recent Feedback
                        </div>
                        <div className="space-y-3">
                          {item.latest_comments && item.latest_comments.length > 0 ? (
                            item.latest_comments.slice().reverse().map((comment, cIdx) => (
                              <div key={cIdx} className="bg-white dark:bg-neutral-900 p-3 rounded-lg border border-gray-100 dark:border-neutral-800">
                                <div className="flex justify-between items-start mb-1">
                                  <span className="font-bold text-xs text-neutral-900 dark:text-white flex items-center gap-1">
                                    <User className="w-3 h-3 text-gray-400" /> {comment.user}
                                  </span>
                                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                    comment.rating >= 8 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                  }`}>
                                    {comment.rating}/10
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-300 italic">"{comment.text}"</p>
                                <div className="text-[10px] text-gray-400 mt-2 text-right">{comment.date}</div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center text-sm text-gray-400 italic py-2">No comments yet.</div>
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

      {/* --- 🟢 FIXED RATING MODAL --- */}
      {mounted && isRatingOpen && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-6"
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
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm modal-backdrop" 
            onClick={() => setIsRatingOpen(false)} 
          />
          
          <div className="relative z-[10000] w-full max-w-md max-h-[90vh] overflow-y-auto modal-scroll-fix">
            <div className={`${SPACING.BORDER_RADIUS} ${SPACING.BORDER_WIDTH} border-slate-200 dark:border-neutral-800`}>
              <div className={SPACING.CARD_GAP}>
                <div className={`${SPACING.BORDER_RADIUS} shadow-2xl relative bg-gray-100 dark:bg-neutral-900`}>
                  <div className={SPACING.CARD_PADDING}>
                    <button 
                      onClick={() => setIsRatingOpen(false)}
                      className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 dark:text-neutral-400 dark:hover:text-white bg-gray-100 dark:bg-neutral-800 p-1 rounded-full z-10"
                    >
                      <X className="w-5 h-5" />
                    </button>

                    <h3 className="text-xl font-black text-neutral-900 dark:text-white uppercase tracking-tight mb-1">
                      Rate {ratingType === 'driver' ? 'Driver' : 'Team'}
                    </h3>
                    
                    {/* Type Toggle */}
                    <div className="flex bg-gray-100 dark:bg-neutral-800 rounded-xl p-1 mb-6">
                      <button 
                        onClick={() => { setRatingType('driver'); setSelectedEntity(allDriversList[0].name); }} 
                        className={`flex-1 py-2 rounded-lg font-bold text-sm transition-colors ${ratingType === 'driver' ? 'bg-red-600 text-white' : 'text-gray-600 dark:text-neutral-400'}`}
                      >
                        Driver
                      </button>
                      <button 
                        onClick={() => { setRatingType('team'); setSelectedEntity(allTeamsList[0].name); }} 
                        className={`flex-1 py-2 rounded-lg font-bold text-sm transition-colors ${ratingType === 'team' ? 'bg-red-600 text-white' : 'text-gray-600 dark:text-neutral-400'}`}
                      >
                        Team
                      </button>
                    </div>
                    
                    {/* Dropdown */}
                    <div className="relative mb-6">
                      <select 
                        value={selectedEntity}
                        onChange={(e) => setSelectedEntity(e.target.value)}
                        className={`w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl px-4 py-3 text-neutral-900 dark:text-white font-bold appearance-none focus:outline-none focus:ring-2 focus:ring-red-500`}
                      >
                        {(ratingType === 'driver' ? allDriversList : allTeamsList).map(item => (
                          <option key={item.id} value={item.name} className="bg-white dark:bg-neutral-900">
                            {item.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Slider */}
                    <div className="mb-6 bg-gray-50 dark:bg-neutral-800 p-4 rounded-xl border border-gray-100 dark:border-neutral-700">
                      <div className="flex justify-between mb-2">
                        <label className="text-xs font-bold text-gray-500 dark:text-white uppercase">Score</label>
                        <span className="text-3xl font-black text-neutral-900 dark:text-white">{userRating}</span>
                      </div>
                      <input 
                        type="range" 
                        min="1" 
                        max="10" 
                        value={userRating} 
                        onChange={(e) => setUserRating(Number(e.target.value))} 
                        className={`w-full h-2 bg-gray-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-red-600`} 
                      />
                    </div>

                    {/* Inputs */}
                    <div className={`${SPACING.CONTENT_GAP} mb-6`}>
                      <input 
                        type="text" 
                        placeholder="Your Name (Optional)" 
                        value={userName} 
                        onChange={(e) => setUserName(e.target.value)} 
                        className={`w-full bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg px-4 py-3 text-neutral-900 dark:text-white text-sm font-medium focus:outline-none focus:border-red-500 placeholder-gray-400 dark:placeholder-neutral-500 mb-6`} 
                      />
                      <textarea 
                        placeholder="Why this rating?" 
                        value={userComment} 
                        onChange={(e) => setUserComment(e.target.value)} 
                        className={`w-full bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg px-4 py-3 text-neutral-900 dark:text-white text-sm font-medium h-24 resize-none focus:outline-none focus:border-red-500 placeholder-gray-400 dark:placeholder-neutral-500`} 
                      />
                    </div>

                    <button 
                      onClick={handleSubmit} 
                      className={`w-full font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-md uppercase tracking-wider bg-red-600 hover:bg-red-700 text-white`}
                    >
                      <Send className="w-4 h-4" /> Submit
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}