import { Store } from '../../types';
import { MapPin, Star, Navigation, Heart, Phone, Share2, Map } from 'lucide-react';
import { Button } from '../ui/button';
import { Drawer } from 'vaul';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface StoreDetailSheetProps {
  store: Store | null;
  isOpen: boolean;
  onClose: () => void;
  showFullDetail?: boolean;
  onShowOnMap?: () => void;
}

export default function StoreDetailSheet({ store, isOpen, onClose, showFullDetail = false, onShowOnMap }: StoreDetailSheetProps) {
  const [isFullOpen, setIsFullOpen] = useState(false);

  useEffect(() => {
    if (store) {
      setIsFullOpen(showFullDetail);
    }
  }, [store, showFullDetail]);

  if (!store || !isOpen) return null;

  // Summary Card (Floating at bottom)
  const SummaryCard = (
    <motion.div 
        initial={{ y: 100, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 100, opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 100 }}
        onDragEnd={(_, info) => {
            if (info.offset.y > 50) {
                onClose();
            }
        }}
        className="absolute bottom-20 sm:bottom-24 left-2 sm:left-4 right-2 sm:right-4 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl rounded-xl sm:rounded-[2rem] shadow-2xl p-3 sm:p-5 z-20 cursor-pointer border border-white/20 dark:border-white/10"
        onClick={() => setIsFullOpen(true)}
    >
        {/* Drag Handle Indicator */}
        <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4" />
        
        <div className="flex gap-2 sm:gap-4">
            <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-lg sm:rounded-2xl overflow-hidden bg-gray-100 shrink-0 shadow-inner ring-1 ring-black/5">
                <img src={store.image} alt={store.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="flex justify-between items-start gap-1 mb-1">
                    <h3 className="font-bold text-sm sm:text-lg truncate dark:text-white leading-tight">{store.name}</h3>
                    {store.discountRate > 0 && (
                        <span className="bg-red-500 text-white text-[8px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full shadow-sm shadow-red-200 dark:shadow-none whitespace-nowrap">
                            %{store.discountRate}
                        </span>
                    )}
                </div>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate mb-2">{store.category}</p>
                <div className="flex items-center gap-1.5 sm:gap-3 text-[10px] sm:text-xs font-medium text-gray-600 dark:text-gray-300">
                    <div className="flex items-center gap-0.5 bg-yellow-50 dark:bg-yellow-900/20 px-1 sm:px-1.5 py-0.5 rounded-md text-yellow-700 dark:text-yellow-400">
                        <Star className="w-2.5 sm:w-3 h-2.5 sm:h-3 fill-current" />
                        <span>{store.rating}</span>
                    </div>
                    <div className="flex items-center gap-0.5 text-gray-400">
                         <MapPin className="w-2.5 sm:w-3 h-2.5 sm:h-3" />
                        <span>1.2 km</span>
                    </div>
                </div>
            </div>
        </div>
    </motion.div>
  );

  return (
    <>
      <AnimatePresence>
        {!isFullOpen && isOpen && SummaryCard}
      </AnimatePresence>

      <Drawer.Root 
        open={isFullOpen} 
        onOpenChange={(open) => {
            setIsFullOpen(open);
        }}
        shouldScaleBackground
      >
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-30" />
          <Drawer.Content className="bg-white dark:bg-neutral-900 flex flex-col rounded-t-[2rem] mt-24 fixed bottom-0 left-0 right-0 max-h-[96vh] z-40 focus:outline-none after:hidden">
            <div className="p-4 bg-white dark:bg-neutral-900 rounded-t-[2rem] flex-1 overflow-y-auto no-scrollbar">
              <div className="mx-auto w-16 h-1.5 flex-shrink-0 rounded-full bg-gray-300 dark:bg-gray-700 mb-8 mt-2" />
              
              {/* Cover Image */}
              <div className="relative h-64 rounded-3xl overflow-hidden mb-6 group">
                  <img src={store.image} alt={store.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute top-4 right-4 flex gap-2">
                      <Button size="icon" variant="secondary" className="rounded-full bg-white/80 backdrop-blur-md hover:bg-white text-black shadow-sm">
                          <Share2 className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="secondary" className="rounded-full bg-white/80 backdrop-blur-md hover:bg-white text-black shadow-sm">
                          <Heart className="w-4 h-4" />
                      </Button>
                  </div>
                  {store.discountRate > 0 && (
                    <div className="absolute bottom-4 left-4 bg-red-600 text-white px-4 py-2 rounded-xl font-bold text-lg shadow-lg">
                        %{store.discountRate} İndirim
                    </div>
                  )}
              </div>

              <div className="space-y-6 pb-20">
                  <div>
                      <h1 className="text-3xl font-bold mb-2 dark:text-white">{store.name}</h1>
                      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-4">
                          <MapPin className="w-4 h-4" />
                          <span>{store.address}</span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                          {store.description}
                      </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                      <Button 
                          className="w-full rounded-xl h-11 text-sm bg-primary hover:bg-primary/90"
                          onClick={() => window.open(`https://maps.google.com/?q=${store.coordinates.lat},${store.coordinates.lng}`)}
                          data-testid="button-directions"
                      >
                          <Navigation className="w-4 h-4 mr-2" />
                          Yol Tarifi
                      </Button>
                      <Button 
                          variant="outline" 
                          className="w-full rounded-xl h-11 text-sm border-gray-200 dark:border-gray-700"
                          onClick={() => window.open(`tel:+905554443322`)}
                          data-testid="button-call"
                      >
                          <Phone className="w-4 h-4 mr-2" />
                          Ara
                      </Button>
                  </div>
                  
                  {onShowOnMap && showFullDetail && (
                      <Button 
                          variant="outline" 
                          className="w-full rounded-xl h-11 text-sm border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          onClick={onShowOnMap}
                          data-testid="button-show-on-map"
                      >
                          <Map className="w-4 h-4 mr-2" />
                          Haritada Göster
                      </Button>
                  )}

                  {/* Additional Info Section */}
                  <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4 space-y-3">
                      <div className="flex justify-between items-center">
                          <span className="text-gray-500 dark:text-gray-400">Kategori</span>
                          <span className="font-medium dark:text-white">{store.category}</span>
                      </div>
                      <div className="flex justify-between items-center">
                          <span className="text-gray-500 dark:text-gray-400">Açılış Saati</span>
                          <span className="font-medium dark:text-white">10:00 - 22:00</span>
                      </div>
                      <div className="flex justify-between items-center">
                          <span className="text-gray-500 dark:text-gray-400">Sadakat Puanı</span>
                          <span className="font-medium text-primary">+{store.loyaltyScore || 10} Puan</span>
                      </div>
                  </div>
              </div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </>
  );
}
