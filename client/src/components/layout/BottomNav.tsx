import { Map, Grid, User } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';

interface BottomNavProps {
  activeTab: 'map' | 'categories' | 'profile';
  onTabChange: (tab: 'map' | 'categories' | 'profile') => void;
}

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
      <div className="flex items-center gap-1 p-1.5 bg-white/80 dark:bg-black/60 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-full shadow-xl ring-1 ring-black/5">
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "rounded-full w-12 h-12 transition-all duration-300",
            activeTab === 'map' 
              ? "bg-primary text-white shadow-md scale-110" 
              : "text-gray-500 hover:bg-gray-100/50 dark:text-gray-400 dark:hover:bg-white/10"
          )}
          onClick={() => onTabChange('map')}
        >
          <Map className="w-5 h-5" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "rounded-full w-12 h-12 transition-all duration-300",
            activeTab === 'categories' 
              ? "bg-primary text-white shadow-md scale-110" 
              : "text-gray-500 hover:bg-gray-100/50 dark:text-gray-400 dark:hover:bg-white/10"
          )}
          onClick={() => onTabChange('categories')}
        >
          <Grid className="w-5 h-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "rounded-full w-12 h-12 transition-all duration-300",
            activeTab === 'profile' 
              ? "bg-primary text-white shadow-md scale-110" 
              : "text-gray-500 hover:bg-gray-100/50 dark:text-gray-400 dark:hover:bg-white/10"
          )}
          onClick={() => onTabChange('profile')}
        >
          <User className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
