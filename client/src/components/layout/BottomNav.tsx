import { Map, LayoutGrid, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomNavProps {
  activeTab: 'map' | 'categories' | 'profile';
  onTabChange: (tab: 'map' | 'categories' | 'profile') => void;
}

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { id: 'map' as const, icon: Map, label: 'Harita' },
    { id: 'categories' as const, icon: LayoutGrid, label: 'Keşfet' },
    { id: 'profile' as const, icon: User, label: 'Profil' },
  ];

  return (
    <div className="fixed bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 z-[60]">
      <div 
        className="flex items-center gap-6 px-8 py-3 rounded-full shadow-xl"
        style={{ 
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.1)'
        }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              className="flex flex-col items-center justify-center transition-all duration-200 active:scale-95"
              onClick={() => onTabChange(tab.id)}
              data-testid={`nav-${tab.id}`}
            >
              <Icon className={cn(
                "w-6 h-6 transition-colors",
                isActive ? "text-blue-500" : "text-gray-400"
              )} />
              <span className={cn(
                "text-[11px] font-medium mt-1 transition-colors",
                isActive ? "text-blue-500" : "text-gray-400"
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
