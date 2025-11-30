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
import { SlidersHorizontal, Sparkles, LayoutGrid, Locate, MapPin, Search } from 'lucide-react';
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

  // Map Filter State (only affects map, not categories page)
  const [mapFilters, setMapFilters] = useState<{
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

  // Computed filtered stores for MAP only
  const mapFilteredStores = useMemo(() => {
    return stores.filter(store => {
      if (mapFilters.categories.length > 0 && !mapFilters.categories.includes(store.category)) return false;
      if (store.discountRate < mapFilters.minDiscount) return false;
      if (mapFilters.onlyOpen && store.openingDate) return false; 
      if (mapFilters.favoritesOnly) return false; 
      return true;
    });
  }, [stores, mapFilters]);

  // Handle dark mode class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const [showFullDetail, setShowFullDetail] = useState(false);
  const [shouldFlyToStore, setShouldFlyToStore] = useState(true);
  const [currentLocation, setCurrentLocation] = useState({ district: 'İzmit', city: 'Kocaeli' });

  // Get user location and reverse geocode
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=tr`
            );
            const data = await response.json();
            if (data.address) {
              const district = data.address.suburb || data.address.town || data.address.county || data.address.city_district || 'İzmit';
              const city = data.address.city || data.address.state || data.address.province || 'Kocaeli';
              setCurrentLocation({ district, city });
            }
          } catch (error) {
            console.log('Geocoding failed, using default location');
          }
        },
        () => {
          console.log('Location access denied, using default');
        }
      );
    }
  }, []);

  const handleStoreSelect = (store: Store, fromCategories: boolean = false) => {
    if (!fromCategories) {
      setSelectedStore(store);
      setShowFullDetail(false);
      setShouldFlyToStore(true);
    } else {
      setSelectedStore(store);
      setShowFullDetail(true);
      setShouldFlyToStore(false);
    }
  };

  const handleShowOnMap = () => {
    setActiveTab('map');
    setShowFullDetail(false);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-background text-foreground select-none touch-none">
      {/* Map Layer (Always Rendered, z-0) */}
      <SimulatedMap 
        stores={mapFilteredStores} 
        selectedStore={selectedStore} 
        onStoreSelect={handleStoreSelect}
        isDarkMode={isDarkMode}
        findMeTrigger={findMeTrigger}
        shouldFlyToStore={shouldFlyToStore}
      />

      {/* Top Search Bar with Filter */}
      <div className="absolute top-3 sm:top-4 left-3 sm:left-4 right-3 sm:right-4 z-30">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white dark:bg-neutral-900 rounded-full shadow-lg border border-gray-100 dark:border-gray-800 px-4 py-2.5 flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3 flex-1">
            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center">
              <Search className="w-4 h-4 text-gray-400" />
            </div>
            <span className="text-gray-400 text-sm">{currentLocation.district}, {currentLocation.city}</span>
          </div>
          
          <Button 
            size="icon" 
            variant="ghost"
            className="rounded-full w-10 h-10 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 relative transition-all duration-150 active:scale-95"
            onClick={() => setIsFilterOpen(true)}
            data-testid="button-filter"
          >
            <SlidersHorizontal className="w-4 h-4 text-gray-600 dark:text-white" />
            {(mapFilters.categories.length > 0 || mapFilters.minDiscount > 0) && (
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-blue-500 rounded-full border border-white"></div>
            )}
          </Button>
        </motion.div>
      </div>

      {/* Right Side - Locate Button */}
      <div className="absolute bottom-44 sm:bottom-48 right-3 sm:right-4 z-30">
        <Button 
          size="icon" 
          className="rounded-full w-12 h-12 bg-white dark:bg-neutral-900 shadow-lg border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-all"
          onClick={() => setFindMeTrigger(prev => prev + 1)}
          data-testid="button-find-me"
        >
          <Locate className="w-5 h-5 text-blue-500" />
        </Button>
      </div>

      {/* Left Side - Card Toggle Button */}
      <div className="absolute bottom-44 sm:bottom-48 left-3 sm:left-4 z-30">
        <Button 
          size="icon" 
          className={`rounded-full w-12 h-12 shadow-lg border transition-all ${
             isCarouselVisible 
             ? 'bg-blue-500 text-white border-blue-500' 
             : 'bg-white dark:bg-neutral-900 border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-neutral-800'
          }`}
          onClick={() => setIsCarouselVisible(!isCarouselVisible)}
          data-testid="button-carousel-toggle"
        >
          <LayoutGrid className="w-5 h-5" />
        </Button>
      </div>

      {/* AI Assistant FAB */}
      <div className="absolute bottom-20 sm:bottom-24 right-3 sm:right-4 z-30">
         <Button
            size="icon"
            className="rounded-full w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-xl shadow-purple-500/30 hover:scale-105 transition-transform"
            onClick={() => setIsAiOpen(true)}
            data-testid="button-ai-assistant"
         >
            <Sparkles className="w-5 h-5" />
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
                    <div className="flex gap-4 pb-2" style={{ width: 'max-content' }}>
                        {mapFilteredStores.map((store) => (
                            <div 
                                key={store.id}
                                className="w-64 flex-shrink-0 group cursor-pointer active:scale-95 transition-transform"
                                onClick={() => handleStoreSelect(store)}
                                data-testid={`card-store-${store.id}`}
                            >
                                {/* Outer border gradient frame */}
                                <div className="relative bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-pink-500/30 rounded-3xl p-0.5">
                                    {/* Inner content */}
                                    <div className="bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl rounded-3xl overflow-hidden shadow-xl border border-white/20 dark:border-white/10">
                                        {/* Image */}
                                        <div className="h-36 w-full relative overflow-hidden">
                                            <img src={store.image} alt={store.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                                            {store.discountRate > 0 && (
                                                <div className="absolute top-3 right-3 bg-red-500 text-white rounded-full px-3 py-1.5 text-xs font-bold shadow-lg border-2 border-white/30">
                                                    %{store.discountRate}
                                                </div>
                                            )}
                                        </div>
                                        {/* Content */}
                                        <div className="p-4">
                                            <h3 className="font-bold truncate dark:text-white text-base leading-tight">{store.name}</h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 mt-1">{store.category}</p>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
                                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                                    Açık
                                                </div>
                                                <span className="text-[11px] text-gray-400">1.2km</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Explore Sheet (Grid View) - uses ALL stores, has its own filters */}
      <ExploreSheet 
        isOpen={activeTab === 'categories'}
        onClose={() => setActiveTab('map')}
        stores={stores}
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
        onClose={() => {
          setSelectedStore(null);
          setShowFullDetail(false);
        }}
        showFullDetail={showFullDetail}
        onShowOnMap={handleShowOnMap}
      />
      
      <FilterModal 
        isOpen={isFilterOpen} 
        onClose={() => setIsFilterOpen(false)} 
        filters={mapFilters}
        onApplyFilters={setMapFilters}
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
