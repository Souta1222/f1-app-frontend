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

// 🟢 Image cache to avoid duplicate checks
const imageCache: Record<string, string> = {};

// 🟢 SMART IMAGE PATTERNS - SIMPLE FIRST
const getDriverImagePatterns = (driverId: string): string[] => {
  return [
    `${API_BASE}/driver-faces/${driverId}.png`,   // Most common - simple PNG
    `${API_BASE}/driver-faces/${driverId}.jpg`,   // Alternative simple JPG
    `${API_BASE}/driver-faces/${driverId}1.png`,  // Numbered 1 PNG
    `${API_BASE}/driver-faces/${driverId}1.jpg`,  // Numbered 1 JPG
    `${API_BASE}/driver-faces/${driverId}2.png`,  // Numbered 2 PNG
    `${API_BASE}/driver-faces/${driverId}2.jpg`,  // Numbered 2 JPG
    `${API_BASE}/driver-faces/${driverId}3.png`,  // Numbered 3 PNG (RARE!)
    `${API_BASE}/driver-faces/${driverId}3.jpg`,  // Numbered 3 JPG (RARE!)
  ];
};

// 🟢 Teams list
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
  { name: 'Retired Drivers', value: 'retired_teams', color: '#888888' },
];

// 🟢 Status filter options
const statusOptions = [
  { label: 'All Drivers', value: 'all' },
  { label: 'Active', value: 'Active' },
  { label: 'Retired', value: 'retired' },
];

// 🟢 Team colors
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
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  // 🟢 SMART: Check if image exists before trying to load it
  const checkImageExists = async (url: string): Promise<boolean> => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  };

  // 🟢 SMART: Get the first available image for a driver
  const getBestDriverImage = async (driverId: string): Promise<string> => {
    // Check cache first
    if (imageCache[driverId]) {
      return imageCache[driverId];
    }

    const patterns = getDriverImagePatterns(driverId);
    
    // Try each pattern in order
    for (const pattern of patterns) {
      const exists = await checkImageExists(pattern);
      if (exists) {
        imageCache[driverId] = pattern;
        return pattern;
      }
    }

    // No image found, use placeholder
    const placeholder = 'https://via.placeholder.com/300x400/333333/ffffff?text=Driver+Photo';
    imageCache[driverId] = placeholder;
    return placeholder;
  };

  // 🟢 Get driver image - UPDATED WITH CACHE
  const getDriverImage = (driverId: string, driverName?: string) => {
    const images = driverImages[driverId] || [];
    const currentIndex = currentImageIndex[driverId] || 0;
    
    if (images.length > 0 && images[currentIndex]) {
      return images[currentIndex];
    }
    
    // Return cached image or start with first pattern
    if (imageCache[driverId]) {
      return imageCache[driverId];
    }
    
    // Start with the most likely pattern
    const patterns = getDriverImagePatterns(driverId);
    return patterns[0]; // Start with simple .png
  };

  // 🟢 Rotate to next image
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

  // 🟢 Pre-fetch and cache images for all drivers
  useEffect(() => {
    const prefetchImages = async () => {
      if (driversList.length === 0) return;
      
      console.log(`🖼️ Pre-fetching images for ${driversList.length} drivers...`);
      
      const newDriverImages: Record<string, string[]> = {};
      const newImageCache: Record<string, string> = {};
      
      // Process in batches to avoid too many requests
      const batchSize = 10;
      for (let i = 0; i < driversList.length; i += batchSize) {
        const batch = driversList.slice(i, i + batchSize);
        
        await Promise.all(
          batch.map(async (driver) => {
            const patterns = getDriverImagePatterns(driver.id);
            const foundImages: string[] = [];
            
            // Check each pattern
            for (const pattern of patterns) {
              try {
                // Skip if we already found 2 images
                if (foundImages.length >= 2) break;
                
                const response = await fetch(pattern, { method: 'HEAD' });
                if (response.ok) {
                  foundImages.push(pattern);
                  
                  // Cache the first found image
                  if (!newImageCache[driver.id]) {
                    newImageCache[driver.id] = pattern;
                  }
                }
              } catch (error) {
                // Skip this pattern
                continue;
              }
            }
            
            if (foundImages.length > 0) {
              newDriverImages[driver.id] = foundImages;
            } else {
              // Use placeholder if no images found
              const placeholder = 'https://via.placeholder.com/300x400/333333/ffffff?text=Driver+Photo';
              newDriverImages[driver.id] = [placeholder];
              newImageCache[driver.id] = placeholder;
            }
          })
        );
      }
      
      // Update caches
      Object.assign(imageCache, newImageCache);
      setDriverImages(newDriverImages);
      console.log(`✅ Pre-fetched images for ${Object.keys(newDriverImages).length} drivers`);
    };
    
    if (driversList.length > 0) {
      prefetchImages();
    }
  }, [driversList]);

  // 🟢 Fetch drivers and images - IMPROVED
  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        console.log("🔄 Fetching drivers from API...");
        const response = await fetch(`${API_BASE}/drivers/all`, {
          headers: {
            'ngrok-skip-browser-warning': 'true',
          },
        });
        
        if (response.ok) {
          const result = await response.json();
          const driversArray = result.drivers || [];
          
          console.log(`📊 Found ${driversArray.length} drivers`);
          
          if (driversArray.length === 0) {
            console.warn("⚠️ No drivers returned from API");
            setLoading(false);
            return;
          }
          
          // Map backend fields to frontend fields
          const mappedDrivers = driversArray.map((driver: any) => {
            const team = driver.team || "Unknown";
            
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
              status: driver.status || (driver.F1_Retired === 'Active' ? 'Active' : 'Retired'),
              teamColor: teamColors[team] || teamColors.default,
              stats: {
                'Wins': Number(driver.wins || driver.Wins || 0),
                'Podiums': Number(driver.podiums || driver.Podiums || 0),
                'Poles': Number(driver.poles || driver.Poles || 0),
                'Starts': Number(driver.starts || driver.Race_Starts || 0)
              }
            };
          });
          
          setDriversList(mappedDrivers);
          
        } else {
          console.error('❌ Failed to fetch drivers from API');
          // Fallback to sample data
          setDriversList(getFallbackDrivers());
        }
      } catch (error) {
        console.error('🔥 Error fetching drivers:', error);
        // Fallback to sample data
        setDriversList(getFallbackDrivers());
      } finally {
        setLoading(false);
      }
    };
    
    fetchDrivers();
  }, []);

  // 🟢 Fallback drivers if API fails
  const getFallbackDrivers = (): Driver[] => {
    return [
      {
        id: 'VER',
        name: 'Max Verstappen',
        team: 'Red Bull',
        nationality: 'Dutch',
        number: '1',
        age: 28,
        f1_debut: 2015,
        world_champs: 3,
        race_starts: 200,
        wins: 71,
        podiums: 127,
        poles: 48,
        status: 'Active',
        teamColor: teamColors['Red Bull']
      },
      {
        id: 'HAM',
        name: 'Lewis Hamilton',
        team: 'Ferrari',
        nationality: 'British',
        number: '44',
        age: 40,
        f1_debut: 2007,
        world_champs: 7,
        race_starts: 350,
        wins: 105,
        podiums: 202,
        poles: 104,
        status: 'Active',
        teamColor: teamColors['Ferrari']
      },
      {
        id: 'NOR',
        name: 'Lando Norris',
        team: 'McLaren',
        nationality: 'British',
        number: '4',
        age: 26,
        f1_debut: 2019,
        world_champs: 0,
        race_starts: 120,
        wins: 11,
        podiums: 44,
        poles: 16,
        status: 'Active',
        teamColor: teamColors['McLaren']
      },
      {
        id: 'LEC',
        name: 'Charles Leclerc',
        team: 'Ferrari',
        nationality: 'Monégasque',
        number: '16',
        age: 28,
        f1_debut: 2018,
        world_champs: 0,
        race_starts: 140,
        wins: 8,
        podiums: 50,
        poles: 27,
        status: 'Active',
        teamColor: teamColors['Ferrari']
      }
    ];
  };

  // 🟢 Filter logic
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

  // 🟢 Handle image error - SMART FALLBACK
  const handleImageError = async (e: React.SyntheticEvent<HTMLImageElement>, driverId: string) => {
    const imgElement = e.currentTarget as HTMLImageElement;
    const currentSrc = imgElement.src;
    
    // Mark this URL as failed
    setFailedImages(prev => new Set(prev).add(currentSrc));
    
    // Get the patterns
    const patterns = getDriverImagePatterns(driverId);
    const currentIndex = patterns.findIndex(url => url === currentSrc);
    
    // Try next pattern
    if (currentIndex < patterns.length - 1) {
      const nextUrl = patterns[currentIndex + 1];
      imgElement.src = nextUrl;
    } else {
      // All patterns failed, use placeholder
      imgElement.src = 'https://via.placeholder.com/300x400/333333/ffffff?text=Driver+Photo';
    }
  };

  // 🟢 Upload Logic
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
        
        console.log("📥 Response status:", response.status);
        
        if (!response.ok) {
          throw new Error(`Server returned ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log("📦 Identification response:", data);

        if (data.success && data.driver_id) {
          if (data.driver_info) {
            const enhancedDriver = {
              id: data.driver_id,
              name: data.driver_info.name || `Driver ${data.driver_id}`,
              team: data.driver_info.team || "Unknown",
              nationality: data.driver_info.country || "Unknown",
              number: data.driver_info.number || "0",
              age: data.driver_info.age || 0,
              f1_debut: data.driver_info.f1_debut || 0,
              world_champs: data.driver_info.world_champs || 0,
              race_starts: data.driver_info.starts || 0,
              wins: data.driver_info.wins || 0,
              podiums: data.driver_info.podiums || 0,
              poles: data.driver_info.poles || 0,
              status: "Active",
              teamColor: teamColors[data.driver_info.team] || teamColors.default,
              stats: {
                'Wins': data.driver_info.wins || 0,
                'Podiums': data.driver_info.podiums || 0,
                'Poles': data.driver_info.poles || 0,
                'Starts': data.driver_info.starts || 0
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
        alert("Server connection failed. Please check if the server is running and try again.");
      }
    }
  };

  // 🟢 Chat function
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
      {/* Header */}
      <div 
        className="fixed top-0 left-0 right-0 z-50 px-6 pt-12 pb-6 shadow-lg flex justify-between items-center transition-colors duration-300"
        style={{ background: 'linear-gradient(to right, #7f1d1d, #450a0a)' }}
      >
        <div>
          <div className="flex items-center gap-2 mt-6">
            <img src={logo} alt="F1INSIDER" className="h-8 w-auto" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
        </div>
      </div>

      {/* Content */}
      <div className="pt-32 px-4"> 
      
        {/* Title Badge */}
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

        {/* Status Filter */}
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
            <p className={isDark ? "text-neutral-500" : "text-slate-400"}>Loading drivers...</p>
          </div>
        ) : (
          <>
            {/* Driver Grid - SMART IMAGE DISPLAY */}
            <div className="grid grid-cols-2 gap-3">
              {filteredDrivers.map((driver) => {
                const images = driverImages[driver.id] || [];
                const hasMultipleImages = images.length > 1;
                const currentIndex = currentImageIndex[driver.id] || 0;
                const currentImage = images[currentIndex] || getDriverImage(driver.id, driver.name);
                
                return (
                  <div
                    key={driver.id}
                    className={`rounded-xl border overflow-hidden transition-all relative group ${
                      isDark 
                        ? 'bg-neutral-900/80 border-neutral-800 hover:border-neutral-700' 
                        : 'bg-white border-white shadow-sm hover:shadow-md hover:border-red-100'
                    } ${driver.status !== 'Active' ? 'opacity-80' : ''}`}
                  >
                    {/* Image Container */}
                    <div className={`relative aspect-square ${isDark ? 'bg-neutral-800' : 'bg-slate-100'}`}>
                      <img
                        src={currentImage}
                        alt={driver.name}
                        className="w-full h-full object-cover object-top"
                        onError={(e) => handleImageError(e, driver.id)}
                        loading="lazy"
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
                      
                      {/* Multiple Images Controls */}
                      {hasMultipleImages && (
                        <>
                          <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded-full">
                            {currentIndex + 1}/{images.length}
                          </div>
                          
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
              </div>
            )}
          </>
        )}
      </div>

      {/* Upload Dialog */}
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
                    
                    {/* Stats Grid */}
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