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
import { SlidersHorizontal, Sparkles, Navigation, MapPin, Layers, Star } from 'lucide-react';
import { Button } from '../components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [activeTab, setActiveTab] = useState<'map' | 'categories' | 'profile'>('map');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isCarouselVisible, setIsCarouselVisible] = useState(true);
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
              // İlçe bilgisi: county veya town kullan (mahalle değil)
              const district = data.address.county || data.address.town || data.address.city_district || 'İzmit';
              const city = data.address.province || data.address.state || data.address.city || 'Kocaeli';
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

      {/* Top Search Bar - Minimal */}
      <div className="absolute top-3 sm:top-4 left-3 sm:left-4 right-3 sm:right-4 z-30">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="rounded-full shadow-lg px-4 py-2.5 flex items-center justify-between gap-3"
          style={{ 
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)'
          }}
        >
          <div className="flex items-center gap-2 flex-1">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600 text-sm font-medium">{currentLocation.district}, {currentLocation.city}</span>
          </div>
          
          <button 
            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all active:scale-95 relative"
            onClick={() => setIsFilterOpen(true)}
            data-testid="button-filter"
          >
            <SlidersHorizontal className="w-4 h-4 text-gray-600" />
            {(mapFilters.categories.length > 0 || mapFilters.minDiscount > 0) && (
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-blue-500 rounded-full"></div>
            )}
          </button>
        </motion.div>
      </div>

      {/* Right Side Action Buttons */}
      <AnimatePresence>
        {activeTab === 'map' && !selectedStore && (
          <>
            {/* Locate Button */}
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute bottom-24 right-4 z-40"
            >
              <button
                className="w-11 h-11 rounded-xl shadow-lg flex items-center justify-center bg-white/90 active:scale-95 transition-transform"
                style={{ backdropFilter: 'blur(10px)' }}
                onClick={() => setFindMeTrigger(prev => prev + 1)}
                data-testid="button-find-me"
              >
                <Navigation className="w-5 h-5 text-blue-500" />
              </button>
            </motion.div>

            {/* Cards Toggle Button */}
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute bottom-36 right-4 z-40"
            >
              <button
                className={`w-11 h-11 rounded-xl shadow-lg flex items-center justify-center active:scale-95 transition-all ${
                  isCarouselVisible 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white/90 text-gray-600'
                }`}
                style={{ backdropFilter: 'blur(10px)' }}
                onClick={() => setIsCarouselVisible(!isCarouselVisible)}
                data-testid="button-carousel-toggle"
              >
                <Layers className="w-5 h-5" />
              </button>
            </motion.div>

            {/* AI Assistant */}
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute bottom-48 right-4 z-40"
            >
              <button
                className="w-11 h-11 rounded-xl shadow-lg flex items-center justify-center bg-gradient-to-br from-violet-500 to-purple-600 text-white active:scale-95 transition-transform"
                onClick={() => setIsAiOpen(true)}
                data-testid="button-ai-assistant"
              >
                <Sparkles className="w-5 h-5" />
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>


      {/* Horizontal Cards Carousel */}
      <AnimatePresence>
        {isCarouselVisible && activeTab === 'map' && !selectedStore && (
          <motion.div 
            initial={{ y: 200, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 200, opacity: 0 }}
            className="absolute bottom-20 left-0 right-16 z-20 pb-2"
          >
            <div className="w-full overflow-x-auto hide-scrollbar snap-x snap-mandatory">
              <div className="flex px-3 gap-3 pb-2" style={{ width: 'max-content' }}>
                {mapFilteredStores.map((store) => (
                  <div 
                    key={store.id}
                    className="w-[calc(100vw-6rem)] max-w-sm flex-shrink-0 snap-center group cursor-pointer active:scale-[0.98] transition-transform"
                    onClick={() => handleStoreSelect(store)}
                    data-testid={`card-store-${store.id}`}
                  >
                    <div className="bg-white rounded-2xl overflow-hidden shadow-lg flex h-24">
                      {/* Image */}
                      <div className="w-24 h-full relative overflow-hidden flex-shrink-0">
                        <img src={store.image} alt={store.name} className="w-full h-full object-cover" />
                        {store.discountRate > 0 && (
                          <div className="absolute top-1.5 left-1.5 bg-red-500 text-white rounded-md px-1.5 py-0.5 text-[10px] font-bold">
                            %{store.discountRate}
                          </div>
                        )}
                      </div>
                      {/* Content */}
                      <div className="p-3 flex-1 flex flex-col justify-center min-w-0">
                        <h3 className="font-semibold truncate text-gray-900 text-sm">{store.name}</h3>
                        <p className="text-xs text-gray-500 truncate mt-0.5">{store.address}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                            <span className="text-xs font-medium text-gray-600">{store.rating}</span>
                          </div>
                          <span className="text-xs text-gray-400">1.2 km</span>
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
      <BottomNav 
        activeTab={activeTab} 
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab === 'map') setSelectedStore(null); 
        }}
      />

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
