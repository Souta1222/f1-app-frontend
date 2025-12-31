import { useState } from 'react';
import { Home, Calendar, Users, Trophy } from 'lucide-react';
import { HomeScreen } from './components/HomeScreen';
import { PredictionResultsScreen } from './components/PredictionResultsScreen';
import { RaceSelectionScreen } from './components/RaceSelectionScreen';
import { DriversScreen } from './components/DriversScreen';
import { ConstructorsScreen } from './components/ConstructorsScreen';
import { RaceDetailsScreen } from './components/RaceDetailsScreen';
import { ChatWidget } from './components/ChatWidget';
// Check this path: If you put ThemeContext in src/context, change this import!
import { ThemeProvider } from './components/ThemeContext.tsx'; 

type Screen = 'home' | 'races' | 'drivers' | 'constructors';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [selectedRaceId, setSelectedRaceId] = useState<string | null>(null);

  const handleNavigate = (screen: Screen) => {
    setCurrentScreen(screen);
    if (screen !== 'races') setSelectedRaceId(null);
  };

  const handleRaceSelect = (raceId: string) => {
    console.log("Navigating to ID:", raceId);
    setSelectedRaceId(raceId);
  };

  const renderScreen = () => {
    // --- SMART ROUTING LOGIC ---
    if (selectedRaceId) {
      if (selectedRaceId.startsWith('2023') || selectedRaceId.startsWith('2024')) {
        return (
          <RaceDetailsScreen 
            raceId={selectedRaceId} 
            onBack={() => setSelectedRaceId(null)} 
          />
        );
      }
      
      // Default to Prediction screen for 2025/2026
      return (
        <PredictionResultsScreen 
          raceId={selectedRaceId} 
          onBack={() => setSelectedRaceId(null)} 
        />
      );
    }

    switch (currentScreen) {
      case 'home': return <HomeScreen onNavigateToRace={handleRaceSelect} />;
      case 'races': return <RaceSelectionScreen onRaceSelect={handleRaceSelect} />;
      case 'drivers': return <DriversScreen />;
      case 'constructors': return <ConstructorsScreen />;
      default: return <HomeScreen onNavigateToRace={handleRaceSelect} />;
    }
  };

  return (
    // 1. ThemeProvider wraps the ENTIRE app
    <ThemeProvider>
      <div className="min-h-screen bg-neutral-950 text-white pb-20 relative">
        
        {/* 2. Main Content */}
        {renderScreen()}
        
        {/* 3. Floating Chat Widget */}
        <ChatWidget />

        {/* 4. Bottom Navigation */}
        {!selectedRaceId && (
          <nav className="fixed bottom-0 left-0 right-0 bg-neutral-900 border-t border-neutral-800 z-40">
            <div className="flex justify-around items-center h-16 max-w-md mx-auto">
              <button 
                onClick={() => handleNavigate('home')} 
                className={`flex flex-col items-center justify-center flex-1 h-full ${currentScreen === 'home' ? 'text-red-500' : 'text-neutral-400'}`}
              >
                <Home className="w-6 h-6" /><span className="text-xs mt-1">Home</span>
              </button>
              
              <button 
                onClick={() => handleNavigate('races')} 
                className={`flex flex-col items-center justify-center flex-1 h-full ${currentScreen === 'races' ? 'text-red-500' : 'text-neutral-400'}`}
              >
                <Calendar className="w-6 h-6" /><span className="text-xs mt-1">Races</span>
              </button>
              
              <button 
                onClick={() => handleNavigate('drivers')} 
                className={`flex flex-col items-center justify-center flex-1 h-full ${currentScreen === 'drivers' ? 'text-red-500' : 'text-neutral-400'}`}
              >
                <Users className="w-6 h-6" /><span className="text-xs mt-1">Drivers</span>
              </button>
              
              <button 
                onClick={() => handleNavigate('constructors')} 
                className={`flex flex-col items-center justify-center flex-1 h-full ${currentScreen === 'constructors' ? 'text-red-500' : 'text-neutral-400'}`}
              >
                <Trophy className="w-6 h-6" /><span className="text-xs mt-1">Teams</span>
              </button>
            </div>
          </nav>
        )}
      </div>
    </ThemeProvider>
  );
}