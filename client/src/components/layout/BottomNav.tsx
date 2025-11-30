import { Compass, Bookmark, Navigation, Plus, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomNavProps {
  activeTab: 'map' | 'categories' | 'profile';
  onTabChange: (tab: 'map' | 'categories' | 'profile') => void;
}

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { id: 'map' as const, icon: Compass, label: 'Keşfet' },
    { id: 'saved' as const, icon: Bookmark, label: 'Kayıtlı' },
    { id: 'gps' as const, icon: Navigation, label: 'GPS' },
    { id: 'add' as const, icon: Plus, label: 'Ekle' },
    { id: 'categories' as const, icon: MapPin, label: 'Konum' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] bg-white border-t border-gray-100 safe-area-bottom">
      <div className="flex items-center justify-around py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = (tab.id === 'map' && activeTab === 'map') || 
                          (tab.id === 'categories' && activeTab === 'categories');
          const isExploreActive = tab.id === 'map' && activeTab === 'map';
          
          return (
            <button
              key={tab.id}
              className={cn(
                "flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-all duration-200 active:scale-95 min-w-[56px]",
                isActive ? "text-green-600" : "text-gray-400"
              )}
              onClick={() => {
                if (tab.id === 'map' || tab.id === 'categories') {
                  onTabChange(tab.id as 'map' | 'categories');
                }
              }}
              data-testid={`nav-${tab.id}`}
            >
              <div className={cn(
                "p-1.5 rounded-lg transition-colors",
                isExploreActive && "bg-green-100"
              )}>
                <Icon className={cn("w-5 h-5", isExploreActive && "text-green-600")} />
              </div>
              <span className={cn(
                "text-[10px] font-medium mt-0.5",
                isActive ? "text-green-600" : "text-gray-400"
              )}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
