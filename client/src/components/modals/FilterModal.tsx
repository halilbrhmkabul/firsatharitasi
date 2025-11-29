import { Drawer } from 'vaul';
import { Slider } from '../ui/slider';
import { Switch } from '../ui/switch';
import { Button } from '../ui/button';
import { Utensils, ShoppingBag, Music, Star, Check } from 'lucide-react';
import { useState } from 'react';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FilterModal({ isOpen, onClose }: FilterModalProps) {
  const [discountRange, setDiscountRange] = useState([10]);
  
  return (
    <Drawer.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Drawer.Content className="bg-white dark:bg-neutral-900 flex flex-col rounded-t-[2rem] mt-24 fixed bottom-0 left-0 right-0 max-h-[80vh] z-50 focus:outline-none">
          <div className="p-4 bg-white dark:bg-neutral-900 rounded-t-[2rem] flex-1 overflow-y-auto">
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-300 dark:bg-gray-700 mb-6" />
            
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold dark:text-white">Filtrele</h2>
                <Button variant="ghost" onClick={onClose} className="text-primary">Sıfırla</Button>
            </div>

            <div className="space-y-8 pb-10">
                {/* Categories */}
                <div className="space-y-4">
                    <h3 className="font-medium text-gray-500 dark:text-gray-400">Kategoriler</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {['Yeme & İçme', 'Alışveriş', 'Eğlence', 'Etkinlik'].map((cat, i) => (
                            <button key={i} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${i === 0 ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 dark:border-gray-700 dark:text-gray-300'}`}>
                                {i === 0 && <Check className="w-4 h-4" />}
                                <span className="font-medium">{cat}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Discount Rate */}
                <div className="space-y-4">
                    <div className="flex justify-between">
                         <h3 className="font-medium text-gray-500 dark:text-gray-400">Minimum İndirim Oranı</h3>
                         <span className="font-bold text-primary">%{discountRange[0]}+</span>
                    </div>
                    <Slider 
                        defaultValue={[10]} 
                        max={100} 
                        step={5} 
                        value={discountRange}
                        onValueChange={setDiscountRange}
                        className="py-4"
                    />
                </div>

                {/* Toggles */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-white/5">
                        <span className="font-medium dark:text-white">Sadece Açık Olanlar</span>
                        <Switch />
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-white/5">
                        <span className="font-medium dark:text-white">Favorilerim</span>
                        <Switch />
                    </div>
                </div>

                <Button className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-lg" onClick={onClose}>
                    Uygula (12 Sonuç)
                </Button>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
