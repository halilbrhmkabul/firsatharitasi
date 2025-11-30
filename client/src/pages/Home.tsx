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
import { Menu, Sparkles, Locate, Search, Phone, Share2, Navigation, Star, X } from 'lucide-react';
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

      {/* Top Bar - Menu, Search, Profile */}
      <div className="absolute top-0 left-0 right-0 z-30 safe-area-top">
        <div className="flex items-center justify-between px-4 py-3 pt-3">
          {/* Menu Button */}
          <button 
            className="w-10 h-10 rounded-xl bg-white shadow-md flex items-center justify-center"
            onClick={() => setActiveTab('profile')}
            data-testid="button-menu"
          >
            <Menu className="w-5 h-5 text-gray-700" />
          </button>

          {/* Search Bar */}
          <div 
            className="flex-1 mx-3 h-10 rounded-full bg-white shadow-md flex items-center px-4 gap-2"
            onClick={() => setIsFilterOpen(true)}
            data-testid="button-search"
          >
            <Search className="w-4 h-4 text-gray-400" />
            <span className="text-gray-400 text-sm">Haritada Ara</span>
          </div>

          {/* Profile Avatar */}
          <button 
            className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 shadow-md flex items-center justify-center overflow-hidden"
            onClick={() => setActiveTab('profile')}
            data-testid="button-profile"
          >
            <span className="text-white font-bold text-sm">U</span>
          </button>
        </div>
      </div>

      {/* Locate Button - Right Side */}
      <AnimatePresence>
        {activeTab === 'map' && !selectedStore && (
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute bottom-44 right-4 z-40"
          >
            <button
              className="w-12 h-12 rounded-full shadow-lg flex items-center justify-center bg-white active:scale-95 transition-transform"
              onClick={() => setFindMeTrigger(prev => prev + 1)}
              data-testid="button-find-me"
            >
              <Locate className="w-5 h-5 text-blue-500" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>


      {/* Selected Store Card - Bottom */}
      <AnimatePresence>
        {selectedStore && activeTab === 'map' && (
          <motion.div 
            initial={{ y: 200, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 200, opacity: 0 }}
            className="absolute bottom-16 left-0 right-0 z-50 px-4 pb-2"
          >
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
              {/* Image Header */}
              <div className="relative h-32">
                <img 
                  src={selectedStore.image} 
                  alt={selectedStore.name} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                
                {/* Close Button */}
                <button 
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center"
                  onClick={() => setSelectedStore(null)}
                  data-testid="button-close-card"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900">{selectedStore.name}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">{selectedStore.address}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-600">8 Dk</p>
                    <p className="text-xs text-gray-400">2.2 KM</p>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-4">
                  <span className="text-sm font-medium text-gray-700">{selectedStore.rating}</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-3.5 h-3.5 ${i < Math.floor(selectedStore.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button 
                    className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white py-2.5 rounded-full text-sm font-medium active:scale-95 transition-transform"
                    onClick={() => setShowFullDetail(true)}
                    data-testid="button-show-route"
                  >
                    <Navigation className="w-4 h-4" />
                    Yol Tarifi
                  </button>
                  <button 
                    className="flex items-center justify-center gap-2 border border-gray-200 text-gray-700 px-4 py-2.5 rounded-full text-sm font-medium active:scale-95 transition-transform"
                    data-testid="button-call"
                  >
                    <Phone className="w-4 h-4" />
                    Ara
                  </button>
                  <button 
                    className="flex items-center justify-center gap-2 border border-gray-200 text-gray-700 px-4 py-2.5 rounded-full text-sm font-medium active:scale-95 transition-transform"
                    data-testid="button-share"
                  >
                    <Share2 className="w-4 h-4" />
                    Paylaş
                  </button>
                </div>
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
