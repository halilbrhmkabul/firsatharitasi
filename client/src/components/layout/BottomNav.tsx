import { Map, Grid, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomNavProps {
  activeTab: 'map' | 'categories' | 'profile';
  onTabChange: (tab: 'map' | 'categories' | 'profile') => void;
}

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { id: 'map' as const, icon: Map, label: 'Harita' },
    { id: 'categories' as const, icon: Grid, label: 'Keşfet' },
    { id: 'profile' as const, icon: User, label: 'Profil' },
  ];

  return (
    <div className="fixed bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 z-[60]">
      <div 
        className="flex items-center gap-1 px-2 py-2 rounded-2xl shadow-2xl"
        style={{ 
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
        }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              className={cn(
                "flex flex-col items-center justify-center px-5 py-2 rounded-xl transition-all duration-200 active:scale-95",
                isActive 
                  ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30" 
                  : "text-gray-500 hover:bg-gray-100/80"
              )}
              onClick={() => onTabChange(tab.id)}
              data-testid={`nav-${tab.id}`}
            >
              <Icon className="w-5 h-5" />
              <span className={cn(
                "text-[10px] font-medium mt-0.5",
                isActive ? "text-white" : "text-gray-500"
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
