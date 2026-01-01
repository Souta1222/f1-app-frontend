import React, { useState, useEffect } from 'react';
import { Star, MessageCircle, Send, X, User, ChevronDown, Building2 } from 'lucide-react';
import { drivers } from '../lib/data';

// 🟢 YOUR BACKEND URL
const API_BASE = 'https://isreal-falconiform-seasonedly.ngrok-free.dev';

// --- DATA: F1 TEAMS ---
const F1_TEAMS = [
  { id: 'rb', name: 'Red Bull Racing' },
  { id: 'mer', name: 'Mercedes' },
  { id: 'fer', name: 'Ferrari' },
  { id: 'mcl', name: 'McLaren' },
  { id: 'ast', name: 'Aston Martin' },
  { id: 'alp', name: 'Alpine' },
  { id: 'wil', name: 'Williams' },
  { id: 'vcarb', name: 'RB (AlphaTauri)' },
  { id: 'kick', name: 'Kick Sauber' },
  { id: 'haas', name: 'Haas F1 Team' }
];

interface RatingData {
  driver_name: string; // Used for both Driver and Team names
  avg_rating: number;
  total_votes: number;
  latest_comments: { user: string; rating: number; text: string; date: string }[];
}

export function FanPulseWidget() {
  const [ratings, setRatings] = useState<RatingData[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<RatingData | null>(null);
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'drivers' | 'teams'>('drivers'); // 🟢 NEW: Tab State
  
  const [userRating, setUserRating] = useState(10);
  const [userComment, setUserComment] = useState("");
  const [userName, setUserName] = useState("");

  const allDriversList = Object.values(drivers);

  // --- FETCH RATINGS (With Ngrok Header) ---
  const fetchRatings = async () => {
    try {
      const res = await fetch(`${API_BASE}/community/ratings`, {
        method: "GET",
        headers: {
            "ngrok-skip-browser-warning": "true",
            "Content-Type": "application/json"
        }
      });
      if (res.ok) {
        const data = await res.json();
        setRatings(data);
      }
    } catch (e) {
      console.error("Failed to load fan ratings", e);
    }
  };

  useEffect(() => {
    fetchRatings();
  }, []);

  // --- SUBMIT RATING ---
  const handleSubmit = async () => {
    if (!selectedEntity) return;
    try {
      await fetch(`${API_BASE}/community/rate`, {
        method: 'POST',
        headers: { 
            'ngrok-skip-browser-warning': 'true',
            'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          driver_name: selectedEntity.driver_name, // Backend field is generic
          rating: userRating,
          comment: userComment || "No comment",
          username: userName || "Anonymous Fan"
        })
      });
      setIsRatingOpen(false);
      setUserComment("");
      setUserName("");
      fetchRatings(); 
    } catch (e) {
      alert("Failed to submit rating");
    }
  };

  const handleEntityChange = (name: string) => {
    const existingStats = ratings.find(r => r.driver_name === name);
    if (existingStats) {
        setSelectedEntity(existingStats);
    } else {
        setSelectedEntity({
            driver_name: name,
            avg_rating: 0,
            total_votes: 0,
            latest_comments: []
        });
    }
  };

  // --- FILTERING LOGIC ---
  const getFilteredRatings = () => {
    // Get list of valid names for the current tab
    const validNames = activeTab === 'drivers' 
        ? allDriversList.map(d => d.name)
        : F1_TEAMS.map(t => t.name);

    // Return only ratings that match the current tab's list
    return ratings.filter(r => validNames.includes(r.driver_name));
  };

  const displayRatings = getFilteredRatings().slice(0, 3);

  return (
    <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-5 mb-6 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-neutral-900 font-black text-lg flex items-center gap-2 uppercase tracking-tight">
          <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
          Fan Pulse
        </h2>
        
        {/* 🟢 NEW: Toggle Switch */}
        <div className="bg-gray-100 p-1 rounded-lg flex gap-1">
            <button 
                onClick={() => setActiveTab('drivers')}
                className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${activeTab === 'drivers' ? 'bg-white shadow text-red-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
                Drivers
            </button>
            <button 
                onClick={() => setActiveTab('teams')}
                className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${activeTab === 'teams' ? 'bg-white shadow text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
                Teams
            </button>
        </div>
      </div>

      {/* --- LEADERBOARD --- */}
      <div className="space-y-2 min-h-[100px]">
        {displayRatings.length === 0 ? (
          <div className="text-center text-gray-400 py-6 text-xs font-bold uppercase tracking-wide bg-gray-50 rounded-xl border border-dashed border-gray-200">
            No {activeTab} ratings yet.<br/>Be the first to vote!
          </div>
        ) : (
          displayRatings.map((item, idx) => (
            <div 
              key={item.driver_name}
              onClick={() => { setSelectedEntity(item); setIsRatingOpen(true); }}
              className="bg-gray-50 hover:bg-gray-100 border border-transparent hover:border-gray-200 transition-all p-3 rounded-xl flex items-center justify-between cursor-pointer group active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <span className={`font-black text-lg w-6 text-center ${idx === 0 ? 'text-yellow-500' : 'text-gray-400'}`}>
                  #{idx + 1}
                </span>
                <div>
                  <div className="text-neutral-900 font-black text-sm uppercase tracking-wide truncate max-w-[140px]">
                    {item.driver_name}
                  </div>
                  <div className="text-gray-500 text-[10px] font-bold flex items-center gap-1">
                    {activeTab === 'drivers' ? <User className="w-3 h-3" /> : <Building2 className="w-3 h-3" />}
                    {item.total_votes} votes
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-xl font-black text-neutral-900">{item.avg_rating}</div>
                  <div className="text-[9px] text-gray-400 font-bold uppercase">Avg</div>
                </div>
                <div className={`w-1.5 h-8 rounded-full ${
                  item.avg_rating >= 9 ? 'bg-green-500' :
                  item.avg_rating >= 7 ? 'bg-blue-500' : 
                  item.avg_rating >= 5 ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
              </div>
            </div>
          ))
        )}
      </div>

      {/* --- ACTION BUTTON --- */}
      <button 
        onClick={() => { 
          // Default to first item if nothing selected
          const firstOption = activeTab === 'drivers' ? allDriversList[0].name : F1_TEAMS[0].name;
          if (!selectedEntity || (activeTab === 'drivers' && !allDriversList.find(d => d.name === selectedEntity.driver_name))) {
             handleEntityChange(firstOption);
          }
          setIsRatingOpen(true);
        }}
        className={`w-full mt-4 text-white py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-lg ${activeTab === 'drivers' ? 'bg-neutral-900 hover:bg-black' : 'bg-blue-900 hover:bg-blue-950'}`}
      >
        <MessageCircle className="w-4 h-4" />
        Rate a {activeTab === 'drivers' ? 'Driver' : 'Team'}
      </button>

      {/* --- MODAL --- */}
      {isRatingOpen && selectedEntity && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl relative animate-in slide-in-from-bottom-10 duration-300">
            
            <button 
              onClick={() => setIsRatingOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 bg-gray-100 p-1 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black text-neutral-900 uppercase tracking-tight mb-1">
                Rate {activeTab === 'drivers' ? 'Driver' : 'Team'}
            </h3>
            <p className="text-gray-500 text-xs font-bold mb-6">
                How did {selectedEntity.driver_name} perform?
            </p>
            
            {/* Dropdown */}
            <div className="relative mb-6">
                <select 
                    value={selectedEntity.driver_name}
                    onChange={(e) => handleEntityChange(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-neutral-900 font-bold appearance-none focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                    {activeTab === 'drivers' 
                        ? allDriversList.map(d => <option key={d.id} value={d.name}>{d.name}</option>)
                        : F1_TEAMS.map(t => <option key={t.id} value={t.name}>{t.name}</option>)
                    }
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>

            {/* Slider */}
            <div className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="flex justify-between mb-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Score</label>
                <span className={`text-3xl font-black ${userRating >= 8 ? 'text-green-600' : userRating >= 5 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {userRating}
                </span>
              </div>
              <input 
                type="range" 
                min="1" max="10" 
                value={userRating}
                onChange={(e) => setUserRating(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
              />
              <div className="flex justify-between text-[10px] font-bold text-gray-400 mt-2 uppercase">
                <span>Disaster</span>
                <span>Average</span>
                <span>Masterclass</span>
              </div>
            </div>

            {/* Inputs */}
            <div className="space-y-3 mb-6">
              <input
                type="text"
                placeholder="Your Name (Optional)"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-neutral-900 text-sm font-medium focus:outline-none focus:border-red-500"
              />
              <textarea
                placeholder="Why this rating?"
                value={userComment}
                onChange={(e) => setUserComment(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-neutral-900 text-sm font-medium h-24 resize-none focus:outline-none focus:border-red-500"
              />
            </div>

            <button 
              onClick={handleSubmit}
              className={`w-full text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-md uppercase tracking-wider ${activeTab === 'drivers' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              <Send className="w-4 h-4" />
              Submit Rating
            </button>
          </div>
        </div>
      )}
    </div>
  );
}