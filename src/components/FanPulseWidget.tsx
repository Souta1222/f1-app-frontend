import React, { useState, useEffect } from 'react';
import { Star, MessageCircle, Send, X, User, ChevronDown } from 'lucide-react';
import { drivers } from '../lib/data';

// 🟢 NEW: Your public internet backend
const API_BASE = 'https://isreal-falconiform-seasonedly.ngrok-free.dev';

interface DriverRating {
  driver_name: string;
  avg_rating: number;
  total_votes: number;
  latest_comments: { user: string; rating: number; text: string; date: string }[];
}

export function FanPulseWidget() {
  const [ratings, setRatings] = useState<DriverRating[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<DriverRating | null>(null);
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  
  const [userRating, setUserRating] = useState(10);
  const [userComment, setUserComment] = useState("");
  const [userName, setUserName] = useState("");

  const allDriversList = Object.values(drivers);

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

  useEffect(() => {
    fetchRatings();
  }, []);

  const handleSubmit = async () => {
    if (!selectedDriver) return;
    try {
      await fetch(`${API_BASE}/community/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driver_name: selectedDriver.driver_name,
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

  return (
    // LIGHT THEME CARD
    <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-neutral-900 font-black text-lg flex items-center gap-2 uppercase tracking-tight">
          <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
          F1 Fan Pulse
        </h2>
        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider bg-gray-50 px-2 py-1 rounded-full border border-gray-100">
          Community
        </span>
      </div>

      {/* --- LEADERBOARD --- */}
      <div className="space-y-2">
        {ratings.length === 0 ? (
          <div className="text-center text-gray-400 py-4 text-sm font-medium">No ratings yet. Be the first!</div>
        ) : (
          ratings.slice(0, 3).map((driver, idx) => (
            <div 
              key={driver.driver_name}
              onClick={() => { setSelectedDriver(driver); setIsRatingOpen(true); }}
              className="bg-gray-50 hover:bg-gray-100 border border-transparent hover:border-gray-200 transition-all p-3 rounded-xl flex items-center justify-between cursor-pointer group active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <span className={`font-black text-lg w-6 text-center ${idx === 0 ? 'text-yellow-500' : 'text-gray-400'}`}>
                  #{idx + 1}
                </span>
                <div>
                  {/* BOLD BLACK FONT */}
                  <div className="text-neutral-900 font-black text-sm uppercase tracking-wide">{driver.driver_name}</div>
                  <div className="text-gray-500 text-[10px] font-bold flex items-center gap-1">
                    <User className="w-3 h-3" /> {driver.total_votes} votes
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-xl font-black text-neutral-900">{driver.avg_rating}</div>
                  <div className="text-[9px] text-gray-400 font-bold uppercase">Avg</div>
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

      {/* --- BUTTON --- */}
      <button 
        onClick={() => { 
          if (!selectedDriver) handleDriverChange(allDriversList[0].name);
          setIsRatingOpen(true);
        }}
        className="w-full mt-4 bg-neutral-900 hover:bg-black text-white py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-lg"
      >
        <MessageCircle className="w-4 h-4" />
        Rate a Driver
      </button>

      {/* --- MODAL (Light Theme) --- */}
      {isRatingOpen && selectedDriver && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl relative animate-in slide-in-from-bottom-10 fade-in duration-300">
            
            <button 
              onClick={() => setIsRatingOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 bg-gray-100 p-1 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black text-neutral-900 uppercase tracking-tight mb-1">Rate Driver</h3>
            <p className="text-gray-500 text-xs font-bold mb-6">How did {selectedDriver.driver_name} perform?</p>
            
            {/* Dropdown */}
            <div className="relative mb-6">
                <select 
                    value={selectedDriver.driver_name}
                    onChange={(e) => handleDriverChange(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-neutral-900 font-bold appearance-none focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                    {allDriversList.map(d => (
                        <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>

            {/* Slider */}
            <div className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="flex justify-between mb-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Score</label>
                <span className="text-3xl font-black text-neutral-900">{userRating}</span>
              </div>
              <input 
                type="range" 
                min="1" max="10" 
                value={userRating}
                onChange={(e) => setUserRating(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
              />
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
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-md uppercase tracking-wider"
            >
              <Send className="w-4 h-4" />
              Submit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}