import { Store } from '../../types';
import { Search, SlidersHorizontal, MapPin, Zap, Star } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface ExploreSheetProps {
  isOpen: boolean;
  onClose: () => void;
  stores: Store[];
  onStoreSelect: (store: Store) => void;
}

export default function ExploreSheet({ isOpen, onClose, stores, onStoreSelect }: ExploreSheetProps) {
  const specialStores = stores.filter(s => (s.loyaltyScore || 0) > 100 && s.discountRate >= 20);
  const regularStores = stores.filter(s => !specialStores.includes(s));

  const handleStoreClick = (store: Store) => {
    onStoreSelect(store);
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
                />
              </div>
              <Button size="icon" variant="outline" className="h-11 w-11 rounded-xl border-gray-200 dark:border-gray-700 shrink-0">
                <SlidersHorizontal className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-6 pb-24">
              
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
