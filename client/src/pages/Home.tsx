import { useState, useEffect } from 'react';
import SimulatedMap from '../components/map/SimulatedMap';
import StoreDetailSheet from '../components/sheet/StoreDetailSheet';
import BottomNav from '../components/layout/BottomNav';
import FilterModal from '../components/modals/FilterModal';
import AiAssistantModal from '../components/modals/AiAssistantModal';
import ProfileSheet from '../components/sheet/ProfileSheet';
import { MOCK_STORES, MOCK_USER } from '../data/mockData';
import { Store } from '../types';
import { SlidersHorizontal, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import ExploreSheet from '../components/sheet/ExploreSheet';

export default function Home() {
  const [stores] = useState<Store[]>(MOCK_STORES);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [activeTab, setActiveTab] = useState<'map' | 'categories' | 'profile'>('map');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Handle dark mode class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleStoreSelect = (store: Store) => {
    setSelectedStore(store);
    // If we select a store from Explore, we close explored and go to map/store details
    // Actually, selecting a store should probably just open the store details over the explore sheet
    // Or close explore and show store. Let's close explore for now to "go to map"
    if (activeTab === 'categories') {
       // Keep categories active but maybe show store sheet?
       // Prompt said "Buradan seçim yapınca harita o mağazaya gitmeli." -> Go to map
       setActiveTab('map');
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-background text-foreground select-none touch-none">
      {/* Map Layer (Always Rendered, z-0) */}
      <SimulatedMap 
        stores={stores} 
        selectedStore={selectedStore} 
        onStoreSelect={handleStoreSelect}
        isDarkMode={isDarkMode}
      />

      {/* Controls Layer (z-10) */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <Button 
          size="icon" 
          variant="secondary"
          className="rounded-full w-12 h-12 bg-white/80 dark:bg-black/60 backdrop-blur-md shadow-lg border border-white/20"
          onClick={() => setIsFilterOpen(true)}
        >
          <SlidersHorizontal className="w-5 h-5" />
        </Button>
      </div>

      {/* AI Assistant FAB */}
      <div className="absolute bottom-24 right-4 z-10">
         <Button
            size="icon"
            className="rounded-full w-14 h-14 bg-gradient-to-r from-pink-500 to-violet-500 text-white shadow-xl hover:scale-105 transition-transform"
            onClick={() => setIsAiOpen(true)}
         >
            <Sparkles className="w-6 h-6" />
         </Button>
      </div>

      {/* Explore Sheet (Replaces Carousel) */}
      <ExploreSheet 
        isOpen={activeTab === 'categories'}
        onClose={() => setActiveTab('map')}
        stores={stores}
        onStoreSelect={handleStoreSelect}
      />

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab === 'map') setSelectedStore(null); // Clear selection when going to map
      }} />

      {/* Modals & Sheets */}
      <StoreDetailSheet 
        store={selectedStore} 
        isOpen={!!selectedStore} 
        onClose={() => setSelectedStore(null)} 
      />
      
      <FilterModal 
        isOpen={isFilterOpen} 
        onClose={() => setIsFilterOpen(false)} 
      />

      <AiAssistantModal 
        isOpen={isAiOpen} 
        onClose={() => setIsAiOpen(false)}
        stores={stores}
      />

      <ProfileSheet 
        isOpen={activeTab === 'profile'} 
        onClose={() => setActiveTab('map')} 
        isDarkMode={isDarkMode}
        toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      />
    </div>
  );
}
