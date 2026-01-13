import React, { useState, useMemo, useEffect } from 'react';
import { Search, Camera, Upload, X, Sparkles, Filter, Image as ImageIcon } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';
// @ts-ignore
import { useTheme } from './../components/ThemeContext.tsx'; 
import { ThemeToggle } from './ThemeToggle'; 
import logo from '../styles/logo.png'; 

// 🟢 CONFIG
const API_BASE = 'https://isreal-falconiform-seasonedly.ngrok-free.dev';

// 🟢 UPDATED: Teams list based on CSV data
const teams = [
  { name: 'All Teams', value: 'all', color: '#FFFFFF' },
  { name: 'Red Bull', value: 'Red Bull', color: '#3671C6' },
  { name: 'McLaren', value: 'McLaren', color: '#FF8000' },
  { name: 'Mercedes', value: 'Mercedes', color: '#27F4D2' },
  { name: 'Ferrari', value: 'Ferrari', color: '#E8002D' },
  { name: 'Williams', value: 'Williams', color: '#64C4FF' },
  { name: 'Aston Martin', value: 'Aston Martin', color: '#229971' },
  { name: 'Racing Bulls', value: 'Racing Bulls', color: '#6692FF' },
  { name: 'Haas', value: 'Haas', color: '#B6BABD' },
  { name: 'Kick Sauber', value: 'Kick Sauber', color: '#52E252' },
  { name: 'Alpine', value: 'Alpine', color: '#FF87BC' },
  { name: 'Retired Teams', value: 'retired_teams', color: '#888888' },
];

// 🟢 UPDATED: Status filter options
const statusOptions = [
  { label: 'All Drivers', value: 'all' },
  { label: 'Active', value: 'Active' },
  { label: 'Retired', value: 'retired' },
];

// 🟢 FIXED: Team colors object (moved outside component)
const teamColors: Record<string, string> = {
  'Red Bull': '#3671C6',
  'McLaren': '#FF8000',
  'Mercedes': '#27F4D2',
  'Ferrari': '#E8002D',
  'Williams': '#64C4FF',
  'Aston Martin': '#229971',
  'Racing Bulls': '#6692FF',
  'Haas': '#B6BABD',
  'Kick Sauber': '#52E252',
  'Alpine': '#FF87BC',
  'default': '#888888'
};

interface Driver {
  id: string;
  name: string;
  team: string;
  nationality: string;
  number: string;
  age: number;
  f1_debut: number;
  world_champs: number;
  race_starts: number;
  wins: number;
  podiums: number;
  poles: number;
  status: string;
  teamColor?: string;
  stats?: Record<string, string | number>;
  images?: string[];
}

export function DriversScreen() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [driversList, setDriversList] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [driverImages, setDriverImages] = useState<Record<string, string[]>>({});
  const [currentImageIndex, setCurrentImageIndex] = useState<Record<string, number>>({});

  // 🟢 NEW: Function to get driver image with rotation
  const getDriverImage = (driverId: string, driverName: string) => {
    const images = driverImages[driverId] || [];
    const currentIndex = currentImageIndex[driverId] || 0;
    
    if (images.length > 0) {
      if (images[currentIndex]) {
        return images[currentIndex];
      }
      return images[0];
    }
    
    // Fallback to numbered images
    const fallbackImages = [
      `/drivers/${driverId}1.png`,
      `/drivers/${driverId}2.png`,
      `/drivers/${driverId}3.png`,
      `/drivers/${driverId}1.jpg`,
      `/drivers/${driverId}2.jpg`,
      `/drivers/${driverId}1.jpeg`,
      `/drivers/${driverId}.png`,
      `/drivers/${driverId}.jpg`,
      `/drivers/default.png`
    ];
    
    return fallbackImages[0];
  };

  // 🟢 NEW: Function to rotate to next image
  const rotateDriverImage = (driverId: string) => {
    const images = driverImages[driverId] || [];
    if (images.length <= 1) return;
    
    const currentIndex = currentImageIndex[driverId] || 0;
    const nextIndex = (currentIndex + 1) % images.length;
    
    setCurrentImageIndex(prev => ({
      ...prev,
      [driverId]: nextIndex
    }));
  };

  // 🟢 FIXED: Fetch drivers and their images
  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        console.log("🔄 Fetching drivers from API...");
        const response = await fetch(`${API_BASE}/drivers/all`, {
          headers: {
            'ngrok-skip-browser-warning': 'true',
          },
        });
        
        console.log("📡 Response status:", response.status);
        
        if (response.ok) {
          const result = await response.json();
          console.log("📦 Raw API response:", result);
          
          const driversArray = result.drivers || [];
          console.log(`📊 Found ${driversArray.length} drivers`);
          
          if (driversArray.length === 0) {
            console.warn("⚠️ No drivers returned from API, using fallback");
            setDriversList(getFallbackDrivers());
            setLoading(false);
            return;
          }
          
          // Map backend fields to frontend fields
          const mappedDrivers = driversArray.map((driver: any) => {
            const team = driver.team || driver.Team || "Unknown";
            
            return {
              id: driver.id || driver.Abbr || "UNK",
              name: driver.name || driver.Full_Name || "Unknown",
              team: team,
              nationality: driver.country || driver.Nationality || driver.nationality || "Unknown",
              number: String(driver.number || driver.No || driver.No_ || "0"),
              age: Number(driver.age || driver.Age || 0),
              f1_debut: Number(driver.debut || driver.F1_Debut || driver.f1_debut || 0),
              world_champs: Number(driver.championships || driver.World_Champs || 0),
              race_starts: Number(driver.starts || driver.Race_Starts || 0),
              wins: Number(driver.wins || driver.Wins || 0),
              podiums: Number(driver.podiums || driver.Podiums || 0),
              poles: Number(driver.poles || driver.Poles || 0),
              status: driver.status || driver.F1_Retired || "Active",
              teamColor: teamColors[team] || teamColors.default,
              stats: {
                'Wins': Number(driver.wins || driver.Wins || 0),
                'Podiums': Number(driver.podiums || driver.Podiums || 0),
                'Poles': Number(driver.poles || driver.Poles || 0),
                'Starts': Number(driver.starts || driver.Race_Starts || 0)
              }
            };
          });
          
          console.log("✅ Mapped drivers:", mappedDrivers);
          setDriversList(mappedDrivers);
          
          // 🟢 NEW: Pre-fetch image availability for each driver
          mappedDrivers.forEach(async (driver: Driver) => {
            try {
              console.log(`🖼️ Fetching images for ${driver.id}...`);
              const imagesResponse = await fetch(`${API_BASE}/drivers/${driver.id}/images`, {
                headers: {
                  'ngrok-skip-browser-warning': 'true',
                },
              });
              
              if (imagesResponse.ok) {
                const imagesData = await imagesResponse.json();
                console.log(`📸 Images data for ${driver.id}:`, imagesData);
                
                if (imagesData.images && imagesData.images.length > 0) {
                  const imageUrls = imagesData.images.map((img: any) => 
                    img.full_url || `${API_BASE}/driver_faces/${img.filename}` || `/driver_faces/${img.filename}`
                  );
                  
                  setDriverImages(prev => ({
                    ...prev,
                    [driver.id]: imageUrls
                  }));
                }
              }
            } catch (error) {
              console.error(`Failed to fetch images for ${driver.id}:`, error);
            }
          });
          
        } else {
          console.error('❌ Failed to fetch drivers from API');
          setDriversList(getFallbackDrivers());
        }
      } catch (error) {
        console.error('🔥 Error fetching drivers:', error);
        setDriversList(getFallbackDrivers());
      } finally {
        setLoading(false);
      }
    };
    
    fetchDrivers();
  }, []);

  // 🟢 FIXED: Fallback drivers function
  const getFallbackDrivers = (): Driver[] => {
    return [
      {
        id: "VER",
        name: "Max Verstappen",
        team: "Red Bull",
        nationality: "Dutch",
        number: "1",
        age: 28,
        f1_debut: 2015,
        world_champs: 4,
        race_starts: 233,
        wins: 71,
        podiums: 127,
        poles: 48,
        status: "Active",
        teamColor: teamColors['Red Bull'],
        stats: { Wins: 71, Podiums: 127, Poles: 48, Starts: 233 }
      },
      {
        id: "NOR",
        name: "Lando Norris",
        team: "McLaren",
        nationality: "British",
        number: "4",
        age: 26,
        f1_debut: 2019,
        world_champs: 1,
        race_starts: 152,
        wins: 11,
        podiums: 44,
        poles: 16,
        status: "Active",
        teamColor: teamColors['McLaren'],
        stats: { Wins: 11, Podiums: 44, Poles: 16, Starts: 152 }
      },
      {
        id: "LEC",
        name: "Charles Leclerc",
        team: "Ferrari",
        nationality: "Monégasque",
        number: "16",
        age: 28,
        f1_debut: 2018,
        world_champs: 0,
        race_starts: 171,
        wins: 8,
        podiums: 50,
        poles: 27,
        status: "Active",
        teamColor: teamColors['Ferrari'],
        stats: { Wins: 8, Podiums: 50, Poles: 27, Starts: 171 }
      }
    ];
  };

  // 🟢 UPDATED: Filter logic
  const filteredDrivers = useMemo(() => {
    return driversList.filter((driver) => {
      const matchesSearch = 
        driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        driver.team.toLowerCase().includes(searchQuery.toLowerCase()) ||
        driver.nationality.toLowerCase().includes(searchQuery.toLowerCase()) ||
        driver.id.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesTeam = 
        selectedTeam === 'all' || 
        driver.team === selectedTeam ||
        (selectedTeam === 'retired_teams' && driver.status !== 'Active');
      
      const matchesStatus = 
        selectedStatus === 'all' ||
        (selectedStatus === 'Active' && driver.status === 'Active') ||
        (selectedStatus === 'retired' && driver.status !== 'Active');
      
      return matchesSearch && matchesTeam && matchesStatus;
    });
  }, [driversList, searchQuery, selectedTeam, selectedStatus]);

  // 🟢 UPDATED: Upload Logic with enhanced response
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
        console.log("📤 Uploading image for identification...");
        const response = await fetch(`${API_BASE}/identify-driver`, {
          method: 'POST',
          headers: {
            'ngrok-skip-browser-warning': 'true',
          },
          body: formData,
        });
        const data = await response.json();
        console.log("📥 Identification response:", data);

        if (data.success && data.driver_id) {
          if (data.driver_info) {
            const enhancedDriver = {
              ...data.driver_info,
              teamColor: teamColors[data.driver_info.team] || teamColors.default,
              stats: {
                'Wins': data.driver_info.wins || 0,
                'Podiums': data.driver_info.podiums || 0,
                'Poles': data.driver_info.poles || 0,
                'Starts': data.driver_info.race_starts || 0
              },
              images: data.available_images || []
            };
            setSelectedDriver(enhancedDriver as Driver);
            alert(`✅ Match found: ${data.driver_info.name} (${data.confidence})`);
          } else {
            const foundDriver = driversList.find(d => d.id === data.driver_id);
            if (foundDriver) {
              setSelectedDriver(foundDriver);
              alert(`✅ Match found: ${foundDriver.name} (${data.confidence})`);
            } else {
              alert(`⚠️ AI identified "${data.driver_id}", but driver not found.`);
            }
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

  // 🟢 FIXED: Added handleSendMessage function
  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    setChatMessages(prev => [...prev, { role: 'user', content: inputMessage }]);
    setInputMessage('');
    
    setTimeout(() => {
      const aiResponses = [
        "I'm the Grand Prix Guru! Ask me about driver stats, team performance, or race predictions.",
        "Based on current data, Max Verstappen has the highest win probability this season.",
        "Lando Norris shows strong consistency with multiple podium finishes this year.",
        "The battle between Ferrari and McLaren is one to watch this season!",
        "Rookie drivers like Kimi Antonelli are showing promising pace early in the season."
      ];
      
      const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];
      setChatMessages(prev => [...prev, { role: 'assistant', content: randomResponse }]);
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
      {/* 🟢 FIXED HEADER */}
      <div 
        className="fixed top-0 left-0 right-0 z-50 px-6 pt-12 pb-6 shadow-lg flex justify-between items-center transition-colors duration-300"
        style={{ background: 'linear-gradient(to right, #7f1d1d, #450a0a)' }}
      >
        <div>
          {/* Logo Integration */}
          <div className="flex items-center gap-2 mt-6">
            <img src={logo} alt="F1INSIDER" className="h-8 w-auto" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
        </div>
      </div>

      {/* 🟢 PADDING FOR CONTENT */}
      <div className="pt-32 px-4"> 
      
        {/* Title Badge - UPDATED */}
        <div className="mb-8 pl-2">
          <div className="inline-block px-3 py-2 rounded-xl bg-green-500 text-white dark:bg-red-600 dark:text-red-100">
            <h1 className="text-[10px] uppercase tracking-widest opacity-80">
              F1 DRIVERS HALL OF FAME
            </h1>
          </div>
          <p className={`text-xs mt-2 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
            {filteredDrivers.length} drivers • Active & Retired Legends
          </p>
        </div>

        {/* 🟢 NEW: Status Filter */}
        <div className="mb-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedStatus(option.value)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-tight transition-all border ${
                selectedStatus === option.value
                  ? 'bg-red-600 text-white border-red-600 shadow-md'
                  : isDark
                    ? 'bg-neutral-900 text-neutral-400 border-neutral-800'
                    : 'bg-white text-slate-500 border-white shadow-sm'
              }`}
            >
              <Filter className="inline-block w-3 h-3 mr-2" />
              {option.label}
            </button>
          ))}
        </div>

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
            placeholder="Search drivers by name, team, or nationality..."
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
                {team.value !== 'all' && team.value !== 'retired_teams' && (
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

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600"></div>
            <p className={`mt-2 ${isDark ? "text-neutral-500" : "text-slate-400"}`}>Loading drivers...</p>
          </div>
        ) : (
          <>
            {/* 🟢 UPDATED: Driver Grid with Image Rotation */}
            <div className="grid grid-cols-2 gap-3">
              {filteredDrivers.map((driver) => {
                const images = driverImages[driver.id] || [];
                const hasMultipleImages = images.length > 1;
                const currentIndex = currentImageIndex[driver.id] || 0;
                
                return (
                  <div
                    key={driver.id}
                    className={`rounded-xl border overflow-hidden transition-all relative group ${
                      isDark 
                        ? 'bg-neutral-900/80 border-neutral-800 hover:border-neutral-700' 
                        : 'bg-white border-white shadow-sm hover:shadow-md hover:border-red-100'
                    } ${driver.status !== 'Active' ? 'opacity-80' : ''}`}
                  >
                    {/* Image Container with Rotation Controls */}
                    <div className={`relative aspect-square ${isDark ? 'bg-neutral-800' : 'bg-slate-100'}`}>
                      <img
                        src={getDriverImage(driver.id, driver.name)}
                        alt={driver.name}
                        className="w-full h-full object-cover object-top"
                        onError={(e) => {
                          const imgElement = e.currentTarget;
                          const driverId = driver.id;
                          const attempts = [
                            `/drivers/${driverId}2.png`,
                            `/drivers/${driverId}1.jpg`,
                            `/drivers/${driverId}2.jpg`,
                            `/drivers/${driverId}3.jpg`,
                            `/drivers/${driverId}1.jpeg`,
                            `/drivers/${driverId}.png`,
                            `/drivers/${driverId}.jpg`,
                            `/drivers/default.png`
                          ];
                          
                          const currentSrc = imgElement.src;
                          const currentAttempt = attempts.findIndex(attempt => 
                            currentSrc.includes(attempt.replace('/drivers/', '').split('.')[0])
                          );
                          
                          const nextAttempt = currentAttempt + 1;
                          if (nextAttempt < attempts.length) {
                            imgElement.src = attempts[nextAttempt];
                          } else {
                            imgElement.src = '/drivers/default.png';
                          }
                        }}
                      />
                      
                      {/* Number Badge */}
                      <div className="absolute top-2 right-2 w-8 h-8 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">
                        <span className="text-white font-bold text-xs">{driver.number}</span>
                      </div>
                      
                      {/* Status Badge */}
                      {driver.status !== 'Active' && (
                        <div className="absolute top-2 left-2 bg-gray-800/80 text-white text-[10px] px-2 py-1 rounded-full">
                          RETIRED
                        </div>
                      )}
                      
                      {/* 🟢 NEW: Multiple Images Indicator & Controls */}
                      {hasMultipleImages && (
                        <>
                          {/* Image Counter */}
                          <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded-full">
                            {currentIndex + 1}/{images.length}
                          </div>
                          
                          {/* Next Image Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              rotateDriverImage(driver.id);
                            }}
                            className="absolute bottom-2 left-2 w-8 h-8 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Next image"
                          >
                            <ImageIcon className="w-4 h-4" />
                          </button>
                        </>
                      )}
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
                      {/* Quick stats */}
                      <div className="flex gap-3 mt-2 text-[10px]">
                        <span className={isDark ? 'text-neutral-400' : 'text-slate-500'}>
                          🏆 {driver.world_champs}
                        </span>
                        <span className={isDark ? 'text-neutral-400' : 'text-slate-500'}>
                          🏁 {driver.wins}
                        </span>
                        <span className={isDark ? 'text-neutral-400' : 'text-slate-500'}>
                          🥇 {driver.podiums}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredDrivers.length === 0 && (
              <div className="text-center py-12">
                <p className={isDark ? "text-neutral-500" : "text-slate-400"}>No drivers found</p>
                <p className={`text-xs mt-2 ${isDark ? "text-neutral-600" : "text-slate-500"}`}>
                  Try adjusting your search or filters
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* --- DIALOGS --- */}
      
      {/* 🟢 UPDATED UPLOAD DIALOG */}
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
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFileUpload} 
                />
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
                  
                  <button 
                    onClick={() => { 
                      setUploadedImage(null); 
                      setSelectedDriver(null); 
                    }} 
                    className="absolute top-2 right-2 z-10 w-9 h-9 bg-black/70 rounded-full flex items-center justify-center text-white hover:bg-black/90 backdrop-blur-md border border-white/30 shadow-xl transition-transform active:scale-90"
                    aria-label="Close Preview"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {selectedDriver && (
                  <div className={`rounded-xl p-4 border transition-colors shadow-lg mt-2 ${
                    isDark 
                      ? 'bg-neutral-950 border-neutral-800' 
                      : 'bg-slate-50 border-slate-200'
                  }`}>
                    {/* Driver Header */}
                    <div className="flex items-center gap-4 mb-4">
                      <div 
                        className="w-2 h-12 rounded-full shadow-sm flex-shrink-0" 
                        style={{ backgroundColor: selectedDriver.teamColor }} 
                      />
                      
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className={`font-black text-lg italic tracking-tight leading-none ${
                              isDark ? 'text-white' : 'text-slate-900'
                            }`}>
                              {selectedDriver.name.toUpperCase()}
                            </h3>
                            <p className={`text-xs mt-1 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                              {selectedDriver.team} • {selectedDriver.nationality}
                            </p>
                          </div>
                          {selectedDriver.status !== 'Active' && (
                            <span className="bg-gray-800 text-white text-[10px] px-2 py-1 rounded-full">
                              RETIRED
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* 🟢 ENHANCED Stats Grid */}
                    <div className={`grid grid-cols-4 gap-2 pt-3 border-t mb-4 ${
                      isDark ? 'border-neutral-800' : 'border-slate-200'
                    }`}>
                      <div className="text-center">
                        <div className={`font-bold text-lg leading-none ${
                          isDark ? 'text-white' : 'text-slate-900'
                        }`}>
                          {selectedDriver.wins}
                        </div>
                        <div className={`text-[9px] uppercase mt-1 ${
                          isDark ? 'text-neutral-500' : 'text-slate-400'
                        }`}>
                          Wins
                        </div>
                      </div>
                      <div className="text-center">
                        <div className={`font-bold text-lg leading-none ${
                          isDark ? 'text-white' : 'text-slate-900'
                        }`}>
                          {selectedDriver.podiums}
                        </div>
                        <div className={`text-[9px] uppercase mt-1 ${
                          isDark ? 'text-neutral-500' : 'text-slate-400'
                        }`}>
                          Podiums
                        </div>
                      </div>
                      <div className="text-center">
                        <div className={`font-bold text-lg leading-none ${
                          isDark ? 'text-white' : 'text-slate-900'
                        }`}>
                          {selectedDriver.poles}
                        </div>
                        <div className={`text-[9px] uppercase mt-1 ${
                          isDark ? 'text-neutral-500' : 'text-slate-400'
                        }`}>
                          Poles
                        </div>
                      </div>
                      <div className="text-center">
                        <div className={`font-bold text-lg leading-none ${
                          isDark ? 'text-white' : 'text-slate-900'
                        }`}>
                          {selectedDriver.world_champs}
                        </div>
                        <div className={`text-[9px] uppercase mt-1 ${
                          isDark ? 'text-neutral-500' : 'text-slate-400'
                        }`}>
                          Titles
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={() => {
                        setSearchQuery(selectedDriver.name);
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

      {/* Chat Button */}
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
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputMessage(e.target.value)} 
                className="bg-neutral-800 border-neutral-700 text-white"
                placeholder="Ask AI about drivers..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSendMessage();
                  }
                }}
              />
              <Button onClick={handleSendMessage} className="bg-red-600">
                <Sparkles className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}