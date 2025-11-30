import { Drawer } from 'vaul';
import { Store } from '../../types';
import { Search, SlidersHorizontal, MapPin, Zap, Percent } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';

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
    <Drawer.Root open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-40" data-testid="explore-overlay" />
        <Drawer.Content className="bg-white dark:bg-neutral-900 flex flex-col rounded-t-2xl sm:rounded-t-[2rem] fixed bottom-0 left-0 right-0 h-[95vh] sm:h-[92vh] z-50 focus:outline-none" data-testid="explore-content">
          <div className="flex-1 flex flex-col bg-white dark:bg-neutral-900 rounded-t-[2rem]">
            
            {/* Drag Handle */}
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-300 dark:bg-gray-700 mt-4 mb-4" />
            
            {/* Header & Search */}
            <div className="px-4 pb-4 border-b border-gray-100 dark:border-white/5">
                <h2 className="text-2xl font-bold dark:text-white mb-4">Keşfet</h2>
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input 
                            placeholder="Mağaza veya kategori ara..." 
                            className="pl-9 bg-gray-100 dark:bg-white/5 border-transparent rounded-xl h-12"
                        />
                    </div>
                    <Button size="icon" variant="outline" className="h-12 w-12 rounded-xl border-gray-200 dark:border-gray-700 shrink-0">
                        <SlidersHorizontal className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-4 space-y-8 pb-24">
                    
                    {/* Special Area (Özel Fırsatlar) */}
                    {specialStores.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Zap className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                                <h3 className="text-lg font-bold dark:text-white">Sana Özel Fırsatlar</h3>
                            </div>
                            <div className="overflow-x-auto hide-scrollbar -mx-4 px-4">
                                <div className="flex gap-3 pb-2" style={{ width: 'max-content' }}>
                                    {specialStores.map(store => (
                                        <div 
                                            key={store.id} 
                                            onClick={() => handleStoreClick(store)}
                                            data-testid={`card-special-${store.id}`}
                                            className="w-80 flex-shrink-0 group cursor-pointer active:scale-95 transition-transform"
                                        >
                                            {/* Outer gradient frame */}
                                            <div className="relative bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 rounded-3xl p-0.5">
                                                {/* Inner content */}
                                                <div className="relative bg-white dark:bg-neutral-900 rounded-3xl overflow-hidden shadow-2xl border border-yellow-200/50 dark:border-yellow-900/50">
                                                    {/* Animated gradient background */}
                                                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-100/20 via-transparent to-orange-100/20 dark:from-yellow-900/10 dark:to-orange-900/10" />
                                                    
                                                    {/* Content */}
                                                    <div className="relative flex gap-4 p-4">
                                                        {/* Image */}
                                                        <div className="w-28 h-28 rounded-2xl bg-gray-100 shrink-0 overflow-hidden shadow-lg border border-white/20">
                                                            <img src={store.image} alt={store.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                        </div>
                                                        
                                                        {/* Text */}
                                                        <div className="flex-1 flex flex-col justify-between">
                                                            <div>
                                                                <h4 className="font-bold text-base dark:text-white leading-tight">{store.name}</h4>
                                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{store.category}</p>
                                                            </div>
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md border border-red-400/50">
                                                                        %{store.discountRate}
                                                                    </span>
                                                                    <span className="text-[11px] text-yellow-600 font-bold bg-yellow-100 dark:bg-yellow-900/40 px-2 py-1 rounded-lg border border-yellow-300/50 dark:border-yellow-700/50">
                                                                        ⭐ Fırsat
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center text-xs text-gray-400 gap-1 mt-1">
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
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold dark:text-white">Tüm Mağazalar</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {regularStores.map(store => (
                                <div 
                                    key={store.id}
                                    onClick={() => handleStoreClick(store)}
                                    data-testid={`card-regular-${store.id}`}
                                    className="group bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all cursor-pointer"
                                >
                                    <div className="h-32 w-full relative overflow-hidden">
                                        <img src={store.image} alt={store.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                        <div className="absolute top-2 right-2 bg-white/90 dark:bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1 text-xs font-bold">
                                            <div className="flex items-center gap-0.5">
                                                <Percent className="w-3 h-3" />
                                                {store.discountRate}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-3">
                                        <h4 className="font-bold truncate dark:text-white text-sm">{store.name}</h4>
                                        <p className="text-xs text-gray-500 mb-2">{store.category}</p>
                                        <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                            Açık
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </ScrollArea>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
