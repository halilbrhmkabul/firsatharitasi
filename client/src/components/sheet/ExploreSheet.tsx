import { Store, Category } from '../../types';
import { Search, SlidersHorizontal, MapPin, Zap, Star, X, Award, Sparkles, CheckCircle } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../../lib/auth.tsx';

interface ExploreSheetProps {
  isOpen: boolean;
  onClose: () => void;
  stores: Store[];
  onStoreSelect: (store: Store, fromCategories?: boolean) => void;
}

const categories: { id: Category; label: string; icon: string }[] = [
  { id: 'Food', label: 'Yemek', icon: '🍔' },
  { id: 'Shopping', label: 'Alışveriş', icon: '🛍️' },
  { id: 'Entertainment', label: 'Eğlence', icon: '🎬' },
  { id: 'Service', label: 'Hizmet', icon: '💼' },
  { id: 'Event', label: 'Etkinlik', icon: '🎉' },
];

export default function ExploreSheet({ isOpen, onClose, stores, onStoreSelect }: ExploreSheetProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [vitrinStores, setVitrinStores] = useState<Store[]>([]);
  const [personalizedStores, setPersonalizedStores] = useState<Store[]>([]);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchVitrinStores();
    if (isAuthenticated) {
      fetchPersonalizedStores();
    }
  }, [isAuthenticated]);

  const fetchVitrinStores = async () => {
    try {
      const response = await fetch('/api/stores/top?limit=6');
      if (response.ok) {
        const data = await response.json();
        setVitrinStores(data);
      }
    } catch (err) {
      console.error('Error fetching vitrin stores:', err);
    }
  };

  const fetchPersonalizedStores = async () => {
    try {
      const response = await fetch('/api/recommendations', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setPersonalizedStores(data.personalized || []);
      }
    } catch (err) {
      console.error('Error fetching personalized stores:', err);
    }
  };

  const filteredStores = useMemo(() => {
    return stores.filter(store => {
      const matchesSearch = searchQuery === '' || 
        store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.address.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategories.length === 0 || 
        selectedCategories.includes(store.category);
      
      return matchesSearch && matchesCategory;
    });
  }, [stores, searchQuery, selectedCategories]);

  const specialStores = filteredStores.filter(s => (s.loyaltyScore || 0) > 50 && s.discountRate >= 15);
  const regularStores = filteredStores.filter(s => !specialStores.includes(s));

  const toggleCategory = (cat: Category) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
  };

  // Reset filters when page closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setSelectedCategories([]);
      setShowFilters(false);
    }
  }, [isOpen]);

  const handleStoreClick = (store: Store) => {
    onStoreSelect(store, true);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: '100%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed inset-0 z-50 bg-white dark:bg-neutral-900 flex flex-col"
          data-testid="explore-page"
        >
          {/* Header */}
          <div className="flex-shrink-0 px-4 pt-6 pb-4 border-b border-gray-100 dark:border-white/5">
            <h2 className="text-xl font-bold dark:text-white mb-3">Keşfet</h2>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input 
                  placeholder="Mağaza veya kategori ara..." 
                  className="pl-9 bg-gray-100 dark:bg-white/5 border-transparent rounded-xl h-11"
                  data-testid="input-search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <Button 
                size="icon" 
                variant="outline" 
                className={`h-11 w-11 rounded-xl shrink-0 transition-colors ${
                  showFilters || selectedCategories.length > 0
                    ? 'bg-primary text-white border-primary'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="w-5 h-5" />
              </Button>
            </div>

            {/* Category Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-5 gap-3 pt-4 pb-2">
                    {categories.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => toggleCategory(cat.id)}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all ${
                          selectedCategories.includes(cat.id)
                            ? 'bg-primary/10 border-2 border-primary'
                            : 'bg-gray-100 dark:bg-white/10 border-2 border-transparent'
                        }`}
                        data-testid={`filter-category-${cat.id}`}
                      >
                        <span className="text-2xl mb-1">{cat.icon}</span>
                        <span className={`text-[10px] font-medium text-center leading-tight ${
                          selectedCategories.includes(cat.id)
                            ? 'text-primary'
                            : 'text-gray-600 dark:text-gray-300'
                        }`}>
                          {cat.label}
                        </span>
                      </button>
                    ))}
                  </div>
                  {selectedCategories.length > 0 && (
                    <div className="flex justify-center pb-2">
                      <button
                        onClick={clearFilters}
                        className="px-4 py-1.5 rounded-full text-sm font-medium bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                      >
                        Filtreleri Temizle
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-6 pb-24">
              
              {/* Vitrin Section - Top Loyalty Stores */}
              {vitrinStores.length > 0 && searchQuery === '' && selectedCategories.length === 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-purple-500" />
                    <h3 className="text-base font-bold dark:text-white">Vitrin</h3>
                    <span className="text-xs text-gray-400 ml-1">En aktif işletmeler</span>
                  </div>
                  <div className="overflow-x-auto hide-scrollbar -mx-4 px-4">
                    <div className="flex gap-3 pb-2" style={{ width: 'max-content' }}>
                      {vitrinStores.map(store => (
                        <div 
                          key={store.id} 
                          onClick={() => handleStoreClick(store as Store)}
                          data-testid={`card-vitrin-${store.id}`}
                          className="w-40 flex-shrink-0 cursor-pointer active:scale-95 transition-transform"
                        >
                          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl p-3 border border-purple-200 dark:border-purple-800">
                            <div className="w-full h-24 rounded-xl bg-gray-100 dark:bg-gray-800 overflow-hidden mb-2">
                              <img 
                                src={(store as any).image} 
                                alt={(store as any).name} 
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            </div>
                            <div className="flex items-center gap-1 mb-1">
                              <h4 className="font-bold text-sm dark:text-white truncate">{(store as any).name}</h4>
                              {(store as any).isVerified && (
                                <CheckCircle className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                              )}
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">{(store as any).category}</span>
                              <span className="text-xs font-semibold text-purple-600 bg-purple-100 dark:bg-purple-900/40 px-1.5 py-0.5 rounded">
                                ⭐ {(store as any).loyaltyScore}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Personalized Section - For logged in users */}
              {isAuthenticated && personalizedStores.length > 0 && searchQuery === '' && selectedCategories.length === 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    <h3 className="text-base font-bold dark:text-white">Size Özel</h3>
                    <span className="text-xs text-gray-400 ml-1">Sık ziyaret ettikleriniz</span>
                  </div>
                  <div className="overflow-x-auto hide-scrollbar -mx-4 px-4">
                    <div className="flex gap-3 pb-2" style={{ width: 'max-content' }}>
                      {personalizedStores.map(store => (
                        <div 
                          key={store.id} 
                          onClick={() => handleStoreClick(store as Store)}
                          data-testid={`card-personalized-${store.id}`}
                          className="w-36 flex-shrink-0 cursor-pointer active:scale-95 transition-transform"
                        >
                          <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl p-3 border border-amber-200 dark:border-amber-800">
                            <div className="w-full h-20 rounded-xl bg-gray-100 dark:bg-gray-800 overflow-hidden mb-2">
                              <img 
                                src={(store as any).image} 
                                alt={(store as any).name} 
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            </div>
                            <h4 className="font-bold text-sm dark:text-white truncate">{(store as any).name}</h4>
                            {(store as any).discountRate > 0 && (
                              <span className="text-xs font-semibold text-red-600">%{(store as any).discountRate} indirim</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Special Area (Özel Fırsatlar) */}
              {specialStores.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <h3 className="text-base font-bold dark:text-white">Sana Özel Fırsatlar</h3>
                  </div>
                  <div className="overflow-x-auto hide-scrollbar -mx-4 px-4">
                    <div className="flex gap-3 pb-2" style={{ width: 'max-content' }}>
                      {specialStores.map(store => (
                        <div 
                          key={store.id} 
                          onClick={() => handleStoreClick(store)}
                          data-testid={`card-special-${store.id}`}
                          className="w-64 flex-shrink-0 cursor-pointer active:scale-95 transition-transform"
                        >
                          {/* Gradient border frame */}
                          <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 rounded-2xl p-[2px]">
                            <div className="bg-white dark:bg-neutral-900 rounded-[14px] overflow-hidden">
                              <div className="flex gap-3 p-3">
                                {/* Image */}
                                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 shrink-0 overflow-hidden">
                                  <img 
                                    src={store.image} 
                                    alt={store.name} 
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                    }}
                                  />
                                </div>
                                
                                {/* Text */}
                                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                                  <div>
                                    <h4 className="font-bold text-sm dark:text-white leading-tight truncate">{store.name}</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{store.category}</p>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                      %{store.discountRate}
                                    </span>
                                    <span className="text-[10px] text-yellow-600 font-semibold bg-yellow-100 dark:bg-yellow-900/40 px-1.5 py-0.5 rounded">
                                      ⭐ Fırsat
                                    </span>
                                  </div>
                                  <div className="flex items-center text-[10px] text-gray-400 gap-1">
                                    <MapPin className="w-3 h-3" />
                                    1.2 km
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Regular Grid */}
              <div className="space-y-3">
                <h3 className="text-base font-bold dark:text-white">Tüm Mağazalar</h3>
                <div className="grid grid-cols-2 gap-3">
                  {regularStores.map(store => (
                    <div 
                      key={store.id}
                      onClick={() => handleStoreClick(store)}
                      data-testid={`card-regular-${store.id}`}
                      className="bg-white dark:bg-neutral-800 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm active:scale-95 transition-transform cursor-pointer"
                    >
                      <div className="h-24 w-full relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                        <img 
                          src={store.image} 
                          alt={store.name} 
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                        {store.discountRate > 0 && (
                          <div className="absolute top-1.5 right-1.5 bg-red-500 text-white rounded-full px-1.5 py-0.5 text-[9px] font-bold">
                            %{store.discountRate}
                          </div>
                        )}
                      </div>
                      <div className="p-2">
                        <h4 className="font-semibold truncate dark:text-white text-xs">{store.name}</h4>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">{store.category}</p>
                        <div className="flex items-center justify-between mt-1.5">
                          <div className="flex items-center gap-1 text-[9px] text-gray-400">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                            Açık
                          </div>
                          <div className="flex items-center gap-0.5 text-[9px] text-yellow-600">
                            <Star className="w-2.5 h-2.5 fill-current" />
                            {store.rating}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
