import { Drawer } from 'vaul';
import { Slider } from '../ui/slider';
import { Switch } from '../ui/switch';
import { Button } from '../ui/button';
import { Check, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Category } from '../../types';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: {
    categories: Category[];
    minDiscount: number;
    onlyOpen: boolean;
    favoritesOnly: boolean;
  };
  onApplyFilters: (filters: any) => void;
}

const CATEGORY_MAP: { [key: string]: Category } = {
  'Yeme & İçme': 'Food',
  'Alışveriş': 'Shopping',
  'Eğlence': 'Entertainment',
  'Etkinlik': 'Event',
  'Hizmet': 'Service'
};

export default function FilterModal({ isOpen, onClose, filters, onApplyFilters }: FilterModalProps) {
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters, isOpen]);

  const toggleCategory = (cat: Category) => {
    setLocalFilters(prev => {
      const exists = prev.categories.includes(cat);
      return {
        ...prev,
        categories: exists 
          ? prev.categories.filter(c => c !== cat)
          : [...prev.categories, cat]
      };
    });
  };

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  return (
    <Drawer.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Drawer.Content className="bg-white dark:bg-neutral-900 flex flex-col rounded-t-[2rem] mt-24 fixed bottom-0 left-0 right-0 max-h-[85vh] z-50 focus:outline-none">
          <div className="p-6 bg-white dark:bg-neutral-900 rounded-t-[2rem] flex-1 overflow-y-auto">
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-300 dark:bg-gray-700 mb-6" />
            
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold dark:text-white">Filtrele</h2>
                <Button 
                    variant="ghost" 
                    onClick={() => setLocalFilters({ categories: [], minDiscount: 0, onlyOpen: false, favoritesOnly: false })} 
                    className="text-primary hover:text-primary/80"
                >
                    Sıfırla
                </Button>
            </div>

            <div className="space-y-8 pb-24">
                {/* Categories */}
                <div className="space-y-4">
                    <h3 className="font-medium text-gray-500 dark:text-gray-400">Kategoriler</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {Object.entries(CATEGORY_MAP).map(([label, value]) => {
                            const isSelected = localFilters.categories.includes(value);
                            return (
                                <button 
                                    key={value} 
                                    onClick={() => toggleCategory(value)}
                                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                                        isSelected 
                                        ? 'border-primary bg-primary/10 text-primary shadow-sm' 
                                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
                                    }`}
                                >
                                    {isSelected ? <Check className="w-4 h-4" /> : <div className="w-4 h-4" />}
                                    <span className="font-medium">{label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Discount Rate */}
                <div className="space-y-4">
                    <div className="flex justify-between">
                         <h3 className="font-medium text-gray-500 dark:text-gray-400">Minimum İndirim Oranı</h3>
                         <span className="font-bold text-primary text-lg">%{localFilters.minDiscount}+</span>
                    </div>
                    <Slider 
                        value={[localFilters.minDiscount]} 
                        max={50} 
                        step={5} 
                        onValueChange={(val) => setLocalFilters(prev => ({ ...prev, minDiscount: val[0] }))}
                        className="py-4"
                    />
                </div>

                {/* Toggles */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-colors">
                        <span className="font-medium dark:text-white">Sadece Açık Olanlar</span>
                        <Switch 
                            checked={localFilters.onlyOpen}
                            onCheckedChange={(checked) => setLocalFilters(prev => ({ ...prev, onlyOpen: checked }))}
                        />
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-colors">
                        <span className="font-medium dark:text-white">Favorilerim</span>
                        <Switch 
                            checked={localFilters.favoritesOnly}
                            onCheckedChange={(checked) => setLocalFilters(prev => ({ ...prev, favoritesOnly: checked }))}
                        />
                    </div>
                </div>
            </div>
          </div>
          
          <div className="p-4 bg-white dark:bg-neutral-900 border-t border-gray-100 dark:border-gray-800">
            <Button className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-lg shadow-lg shadow-primary/20" onClick={handleApply}>
                Uygula
            </Button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
