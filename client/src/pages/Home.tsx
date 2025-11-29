import { useState, useEffect, useMemo } from 'react';
import SimulatedMap from '../components/map/SimulatedMap';
import StoreDetailSheet from '../components/sheet/StoreDetailSheet';
import BottomNav from '../components/layout/BottomNav';
import FilterModal from '../components/modals/FilterModal';
import AiAssistantModal from '../components/modals/AiAssistantModal';
import ProfileSheet from '../components/sheet/ProfileSheet';
import ExploreSheet from '../components/sheet/ExploreSheet';
import { fetchStores } from '../lib/api';
import { Store, Category } from '../types';
import { SlidersHorizontal, Sparkles, LayoutGrid, Locate } from 'lucide-react';
import { Button } from '../components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Carousel, CarouselContent, CarouselItem } from '../components/ui/carousel';

export default function Home() {
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [activeTab, setActiveTab] = useState<'map' | 'categories' | 'profile'>('map');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isCarouselVisible, setIsCarouselVisible] = useState(false);
  const [findMeTrigger, setFindMeTrigger] = useState(0);

  // Filter State
  const [filters, setFilters] = useState<{
    categories: Category[];
    minDiscount: number;
    onlyOpen: boolean;
    favoritesOnly: boolean;
  }>({
    categories: [],
    minDiscount: 0,
    onlyOpen: false,
    favoritesOnly: false
  });

  // Fetch stores from API
  useEffect(() => {
    async function loadStores() {
      try {
        setIsLoading(true);
        const data = await fetchStores();
        setStores(data);
      } catch (error) {
        console.error('Failed to load stores:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadStores();
  }, []);

  // Computed filtered stores
  const filteredStores = useMemo(() => {
    return stores.filter(store => {
      if (filters.categories.length > 0 && !filters.categories.includes(store.category)) return false;
      if (store.discountRate < filters.minDiscount) return false;
      if (filters.onlyOpen && store.openingDate) return false; 
      if (filters.favoritesOnly) return false; 
      return true;
    });
  }, [stores, filters]);

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
    if (activeTab === 'categories') {
       setActiveTab('map');
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-background text-foreground select-none touch-none">
      {/* Map Layer (Always Rendered, z-0) */}
      <SimulatedMap 
        stores={filteredStores} 
        selectedStore={selectedStore} 
        onStoreSelect={handleStoreSelect}
        isDarkMode={isDarkMode}
        findMeTrigger={findMeTrigger}
      />

      {/* Controls Layer - Right Side (z-10) */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <Button 
          size="icon" 
          variant="secondary"
          className="rounded-full w-11 h-11 bg-white/90 dark:bg-black/70 backdrop-blur-md shadow-lg border border-white/20"
          onClick={() => setIsFilterOpen(true)}
          data-testid="button-filter"
        >
          <SlidersHorizontal className="w-5 h-5" />
          {(filters.categories.length > 0 || filters.minDiscount > 0) && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full border-2 border-white"></div>
          )}
        </Button>
        
        <Button 
          size="icon" 
          variant="secondary"
          className={`rounded-full w-11 h-11 backdrop-blur-md shadow-lg border border-white/20 transition-all ${
             isCarouselVisible 
             ? 'bg-primary text-white border-primary' 
             : 'bg-white/90 dark:bg-black/70'
          }`}
          onClick={() => setIsCarouselVisible(!isCarouselVisible)}
          data-testid="button-carousel-toggle"
        >
          <LayoutGrid className="w-5 h-5" />
        </Button>

        <Button 
          size="icon" 
          variant="secondary"
          className="rounded-full w-11 h-11 bg-white/90 dark:bg-black/70 backdrop-blur-md shadow-lg border border-white/20"
          onClick={() => setFindMeTrigger(prev => prev + 1)}
          data-testid="button-find-me"
        >
          <Locate className="w-5 h-5 text-blue-500" />
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

      {/* Carousel Overlay (Visible on Map when toggled) */}
      <AnimatePresence>
        {isCarouselVisible && activeTab === 'map' && !selectedStore && (
            <motion.div 
                initial={{ y: 200, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 200, opacity: 0 }}
                className="absolute bottom-24 left-0 right-0 z-20 pb-2"
            >
                <div className="w-full overflow-x-auto hide-scrollbar px-4">
                    <div className="flex gap-3 pb-2" style={{ width: 'max-content' }}>
                        {filteredStores.map((store) => (
                            <div 
                                key={store.id}
                                className="w-56 flex-shrink-0 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden border border-white/20 dark:border-white/10 cursor-pointer transform transition-all active:scale-95"
                                onClick={() => handleStoreSelect(store)}
                                data-testid={`card-store-${store.id}`}
                            >
                                <div className="h-28 w-full relative">
                                    <img src={store.image} alt={store.name} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                    {store.discountRate > 0 && (
                                        <div className="absolute top-2 right-2 bg-red-500 backdrop-blur-md rounded-full px-2 py-1 text-xs font-bold text-white shadow-lg">
                                            %{store.discountRate}
                                        </div>
                                    )}
                                </div>
                                <div className="p-3">
                                    <h3 className="font-bold truncate dark:text-white text-sm">{store.name}</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{store.category}</p>
                                    <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                        Açık • 1.2km
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Explore Sheet (Grid View) */}
      <ExploreSheet 
        isOpen={activeTab === 'categories'}
        onClose={() => setActiveTab('map')}
        stores={filteredStores}
        onStoreSelect={handleStoreSelect}
      />

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab === 'map') setSelectedStore(null); 
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
        filters={filters}
        onApplyFilters={setFilters}
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
