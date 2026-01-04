import React, { useState, useEffect } from 'react';
import { Star, MessageCircle, Send, X, User, ChevronDown, Users } from 'lucide-react';
import { drivers, teams } from '../lib/data';
// @ts-ignore
import { useTheme } from './../components/ThemeContext.tsx'; 

// 🟢 CONFIG: Use your functional backend URL
const API_BASE = 'https://isreal-falconiform-seasonedly.ngrok-free.dev';

// Consistent spacing constants - matching HomeScreen
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

interface DriverRating {
  driver_name: string;
  avg_rating: number;
  total_votes: number;
  latest_comments: { user: string; rating: number; text: string; date: string }[];
}

interface TeamRating {
  team_name: string;
  avg_rating: number;
  total_votes: number;
  latest_comments: { user: string; rating: number; text: string; date: string }[];
}

export function FanPulseWidget() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [ratings, setRatings] = useState<DriverRating[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<DriverRating | null>(null);
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [ratingType, setRatingType] = useState<'driver' | 'team'>('driver');

  const [teamRatings, setTeamRatings] = useState<TeamRating[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<TeamRating | null>(null);
  
  const [userRating, setUserRating] = useState(10);
  const [userComment, setUserComment] = useState("");
  const [userName, setUserName] = useState("");

  const allDriversList = Object.values(drivers);
  const allTeamsList = Object.values(teams);

  const fetchRatings = async () => {
    try {
      const res = await fetch(`${API_BASE}/community/ratings`);
      if (res.ok) {
        const data = await res.json();
        setRatings(data);
      }
    } catch (e) {
      console.error("Failed to load fan ratings", e);
    }
  };

  const fetchTeamRatings = async () => {
    try {
      // Use endpoint if available, otherwise mock for UI continuity
      // (Your original code had a fetch here, kept for consistency)
      const res = await fetch(`${API_BASE}/community/ratings`); // Reuse for now or update if you made a team endpoint
      if (res.ok) {
         // Logic to filter or mock team data if backend doesn't support it yet
         const mockTeamRatings = allTeamsList.map(team => ({
            team_name: team.name,
            avg_rating: (Math.random() * 2 + 7).toFixed(1), // Mock high ratings
            total_votes: Math.floor(Math.random() * 500),
            latest_comments: []
         }));
         setTeamRatings(mockTeamRatings as any);
      }
    } catch (e) {
      console.error("Failed to load team ratings", e);
    }
  };

  useEffect(() => {
    fetchRatings();
    fetchTeamRatings();
  }, []);

  const handleSubmit = async () => {
    if (ratingType === 'driver' && !selectedDriver) return;
    if (ratingType === 'team' && !selectedTeam) return;
    
    try {
      const endpoint = ratingType === 'driver' ? '/community/rate' : '/community/rate'; // Update if you have a team endpoint
      const name = ratingType === 'driver' ? selectedDriver?.driver_name : selectedTeam?.team_name;
      
      await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driver_name: name, // Reuse field name for simplicity with your current backend
          rating: userRating,
          comment: userComment || "No comment",
          username: userName || "Anonymous Fan"
        })
      });
      
      setIsRatingOpen(false);
      setUserComment("");
      setUserName("");
      
      // Refresh Data
      fetchRatings();
      fetchTeamRatings();
      
    } catch (e) {
      alert("Failed to submit rating");
    }
  };

  const handleDriverChange = (driverName: string) => {
    const existingStats = ratings.find(r => r.driver_name === driverName);
    if (existingStats) {
        setSelectedDriver(existingStats);
    } else {
        setSelectedDriver({
            driver_name: driverName,
            avg_rating: 0,
            total_votes: 0,
            latest_comments: []
        });
    }
  };

  const handleTeamChange = (teamName: string) => {
    const existingStats = teamRatings.find(r => r.team_name === teamName);
    if (existingStats) {
        setSelectedTeam(existingStats);
    } else {
        setSelectedTeam({
            team_name: teamName,
            avg_rating: 0,
            total_votes: 0,
            latest_comments: []
        });
    }
  };

  return (
    <>
      {/* Fixed backdrop overlay */}
      {isRatingOpen && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm transition-all duration-300" />
      )}
      
      {/* Main content wrapper */}
      <div className={`transition-all duration-300 ${isRatingOpen ? 'blur-sm' : ''}`}>
        {/* Main Card */}
        <div className={`relative ${SPACING.BORDER_RADIUS} ${SPACING.BORDER_WIDTH} border-slate-200`}>
          <div className={SPACING.CARD_GAP}>
            <div 
              className={`
                ${SPACING.BORDER_RADIUS} w-full
                bg-slate-200 text-neutral-900
                dark:bg-neutral-900 dark:text-neutral-100
              `}
            >
              <div className={`${SPACING.CARD_PADDING}`}>
                {/* Header Section */}
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-black text-lg flex items-center gap-2 uppercase tracking-tight text-neutral-900 dark:text-white">
                    F1 Fan Pulse
                  </h2>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider bg-gray-50 px-2 py-1 rounded-full dark:bg-neutral-800 dark:text-white">
                    Community
                  </span>
                </div>

                {/* --- DRIVERS LEADERBOARD --- */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Star className="w-4 h-4 text-blue-500" />
                      <h3 className="font-bold text-sm text-gray-700 dark:text-white uppercase tracking-wide">
                        Top Drivers
                      </h3>
                    </div>
                    
                    <div className={SPACING.CONTENT_GAP}>
                      {ratings.length === 0 ? (
                        <div className="text-center text-gray-500 dark:text-gray-400 py-4 text-sm font-medium">
                          No driver ratings yet. Be the first!
                        </div>
                      ) : (
                        ratings.slice(0, 3).map((driver, idx) => (
                          <div 
                            key={driver.driver_name}
                            onClick={() => { 
                              setSelectedDriver(driver); 
                              setRatingType('driver');
                              setIsRatingOpen(true); 
                            }}
                            className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 transition-all p-3 rounded-xl flex items-center justify-between cursor-pointer group active:scale-[0.98]"
                          >
                            <div className="flex items-center gap-3">
                              <span className={`font-black text-lg w-6 text-center ${idx === 0 ? 'text-yellow-500' : 'text-gray-400 dark:text-gray-300'}`}>
                                #{idx + 1}
                              </span>
                              <div>
                                <div className="text-neutral-900 dark:text-white font-black text-sm uppercase tracking-wide">
                                  {driver.driver_name}
                                </div>
                                <div className="text-gray-500 dark:text-gray-400 text-[10px] font-bold flex items-center gap-1">
                                  <User className="w-3 h-3" /> {driver.total_votes} votes
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <div className="text-xl font-black text-neutral-900 dark:text-white">{driver.avg_rating}</div>
                                <div className="text-[9px] text-gray-400 dark:text-gray-300 font-bold uppercase">Avg</div>
                              </div>
                              <div className={`w-1.5 h-8 rounded-full ${
                                driver.avg_rating >= 9 ? 'bg-green-500' :
                                driver.avg_rating >= 7 ? 'bg-blue-500' : 
                                driver.avg_rating >= 5 ? 'bg-yellow-500' : 'bg-red-500'
                              }`} />
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* --- RATE BUTTONS --- */}
                  <div className="flex gap-2">
                    <button 
                      onClick={() => { 
                        if (!selectedDriver) handleDriverChange(allDriversList[0].name);
                        setRatingType('driver');
                        setIsRatingOpen(true);
                      }}
                      className={`w-full font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-md uppercase tracking-wider bg-red-600 hover:bg-red-700 text-white`}
                    >
                      <Star className="w-3 h-3" />
                      Rate Driver
                    </button>
                  </div>

                  {/* --- TEAMS LEADERBOARD --- */}
                  <div className="mb-6 mt-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="w-4 h-4 text-purple-500" />
                      <h3 className="font-bold text-sm text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                        Top Teams
                      </h3>
                    </div>
                    
                    <div className={SPACING.CONTENT_GAP}>
                      {teamRatings.length === 0 ? (
                        <div className="text-center text-gray-500 dark:text-gray-400 py-4 text-sm font-medium">
                          No team ratings yet. Be the first!
                        </div>
                      ) : (
                        teamRatings.slice(0, 3).map((team, idx) => (
                          <div 
                            key={team.team_name}
                            onClick={() => { 
                              setSelectedTeam(team); 
                              setRatingType('team');
                              setIsRatingOpen(true); 
                            }}
                            className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 transition-all p-3 rounded-xl flex items-center justify-between cursor-pointer group active:scale-[0.98] mt-4"
                          >
                            <div className="flex items-center gap-3">
                              <span className={`font-black text-lg w-6 text-center ${idx === 0 ? 'text-yellow-500' : 'text-gray-400 dark:text-white'}`}>
                                #{idx + 1}
                              </span>
                              <div>
                                <div className="text-neutral-900 dark:text-white font-black text-sm uppercase tracking-wide">
                                  {team.team_name}
                                </div>
                                <div className="text-gray-500 dark:text-gray-400 text-[10px] font-bold flex items-center gap-1">
                                  <User className="w-3 h-3" /> {team.total_votes} votes
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <div className="text-xl font-black text-neutral-900 dark:text-white">{team.avg_rating}</div>
                                <div className="text-[9px] text-gray-400 dark:text-gray-300 font-bold uppercase">Avg</div>
                              </div>
                              <div className={`w-1.5 h-8 rounded-full ${
                                team.avg_rating >= 9 ? 'bg-green-500' :
                                team.avg_rating >= 7 ? 'bg-blue-500' : 
                                team.avg_rating >= 5 ? 'bg-yellow-500' : 'bg-red-500'
                              }`} />
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                {/* --- RATE BUTTONS --- */}
                <div className="flex gap-2">
                  <button 
                    onClick={() => { 
                      if (!selectedTeam) handleTeamChange(allTeamsList[0].name);
                      setRatingType('team');
                      setIsRatingOpen(true);
                    }}
                    className={`w-full font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-md uppercase tracking-wider bg-red-600 hover:bg-red-700 text-white`}
                  >
                    <Users className="w-3 h-3" />
                    Rate Team
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    {/* --- MODAL --- */}
    {isRatingOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
        <div className={`relative ${SPACING.BORDER_RADIUS} ${SPACING.BORDER_WIDTH} border-slate-200 dark:border-neutral-800 w-full max-w-md`}>
          <div className={SPACING.CARD_GAP}>
            <div 
              className={`${SPACING.BORDER_RADIUS} shadow-2xl relative animate-in zoom-in-95 fade-in duration-300 bg-gray-100 dark:bg-neutral-900`}
            >
              <div className={SPACING.CARD_PADDING}>
                <button 
                  onClick={() => setIsRatingOpen(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 dark:text-neutral-400 dark:hover:text-white bg-gray-100 dark:bg-neutral-800 p-1 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>

                <h3 className="text-xl font-black text-neutral-900 dark:text-white uppercase tracking-tight mb-1">
                  Rate {ratingType === 'driver' ? 'Driver' : 'Team'}
                </h3>
                <p className="text-gray-500 dark:text-neutral-400 text-xs font-bold mb-6">
                  How did {
                    ratingType === 'driver' 
                      ? selectedDriver?.driver_name 
                      : selectedTeam?.team_name
                  } perform?
                </p>

                {/* Type Toggle */}
                <div className="flex bg-gray-100 dark:bg-neutral-800 rounded-xl p-1 mb-6">
                  <button
                    onClick={() => setRatingType('driver')}
                    className={`flex-1 py-2 rounded-lg font-bold text-sm transition-colors ${
                      ratingType === 'driver'
                        ? 'bg-red-600 text-white'
                        : 'text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    Driver
                  </button>
                  <button
                    onClick={() => setRatingType('team')}
                    className={`flex-1 py-2 rounded-lg font-bold text-sm transition-colors ${
                      ratingType === 'team'
                        ? 'bg-purple-600 text-white'
                        : 'text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    Team
                  </button>
                </div>
                
                {/* Dropdown */}
                <div className="relative mb-6">
                  <select 
                    value={
                      ratingType === 'driver' 
                        ? selectedDriver?.driver_name 
                        : selectedTeam?.team_name
                    }
                    onChange={(e) => {
                      if (ratingType === 'driver') {
                        handleDriverChange(e.target.value);
                      } else {
                        handleTeamChange(e.target.value);
                      }
                    }}
                    className={`w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl px-4 py-3 text-neutral-900 dark:text-white font-bold appearance-none focus:outline-none focus:ring-2 ${
                      ratingType === 'driver' ? 'focus:ring-red-500' : 'focus:ring-purple-500'
                    }`}
                  >
                    {(ratingType === 'driver' ? allDriversList : allTeamsList).map(item => (
                      <option 
                        key={item.id} 
                        value={item.name}
                        className="bg-white dark:bg-neutral-900"
                      >
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
                    min="1" max="10" 
                    value={userRating}
                    onChange={(e) => setUserRating(Number(e.target.value))}
                    className={`w-full h-2 bg-gray-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer ${ratingType === 'driver' ? 'accent-red-600' : 'accent-purple-600'}`}
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
                  className={`w-full font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-md uppercase tracking-wider ${ratingType === 'driver' ? 'bg-red-600 hover:bg-red-700' : 'bg-purple-600 hover:bg-purple-700'} text-white`}
                >
                  <Send className="w-4 h-4" />
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
}