import { Store } from '../../types';
import { MapPin, Star, Navigation, Heart, Phone, Share2, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Drawer } from 'vaul';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface StoreDetailSheetProps {
  store: Store | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function StoreDetailSheet({ store, isOpen, onClose }: StoreDetailSheetProps) {
  const [isFullOpen, setIsFullOpen] = useState(false);

  useEffect(() => {
    if (store) {
      // When a store is selected, we show the summary.
      // We don't auto-open full sheet unless requested, 
      // but the prompt says clicking pin shows summary.
      setIsFullOpen(false);
    }
  }, [store]);

  if (!store || !isOpen) return null;

  // Summary Card (Floating at bottom)
  const SummaryCard = (
    <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="absolute bottom-24 left-4 right-4 bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl p-4 z-20 cursor-pointer border border-gray-100 dark:border-gray-800"
        onClick={() => setIsFullOpen(true)}
    >
        <div className="flex gap-4">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-100 shrink-0">
                <img src={store.image} alt={store.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-bold text-lg truncate dark:text-white">{store.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{store.category}</p>
                    </div>
                    {store.discountRate > 0 && (
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            %{store.discountRate} İndirim
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-1 mt-2 text-sm text-gray-600 dark:text-gray-300">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{store.rating}</span>
                    <span className="mx-1">•</span>
                    <span>1.2 km</span>
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

      <Drawer.Root open={isFullOpen} onOpenChange={(open) => {
          setIsFullOpen(open);
          if (!open) {
              // When full sheet closes, we keep the summary open unless explicitly closed?
              // Prompt says "Summary... Full...". 
              // If I close full, I probably want to go back to map.
              // But usually user expects to see summary again or nothing.
              // Let's keep summary open if just dragging down, but if clicked outside maybe close all?
              // For now, let's just sync it.
          }
      }}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40 z-30" />
          <Drawer.Content className="bg-white dark:bg-neutral-900 flex flex-col rounded-t-[2rem] mt-24 fixed bottom-0 left-0 right-0 max-h-[96vh] z-40 focus:outline-none">
            <div className="p-4 bg-white dark:bg-neutral-900 rounded-t-[2rem] flex-1 overflow-y-auto no-scrollbar">
              <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-300 dark:bg-gray-700 mb-6" />
              
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

                  <div className="grid grid-cols-2 gap-4">
                      <Button className="w-full rounded-xl h-12 text-base bg-primary hover:bg-primary/90">
                          <Navigation className="w-4 h-4 mr-2" />
                          Yol Tarifi
                      </Button>
                      <Button variant="outline" className="w-full rounded-xl h-12 text-base border-gray-200 dark:border-gray-700">
                          <Phone className="w-4 h-4 mr-2" />
                          Ara
                      </Button>
                  </div>

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
