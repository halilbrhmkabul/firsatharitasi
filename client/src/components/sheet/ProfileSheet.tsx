import { Drawer } from 'vaul';
import { User, Trophy, Wallet, Star, Moon, Sun, LogOut } from 'lucide-react';
import { Switch } from '../ui/switch';
import { Button } from '../ui/button';
import { MOCK_USER } from '../../data/mockData';

interface ProfileSheetProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export default function ProfileSheet({ isOpen, onClose, isDarkMode, toggleDarkMode }: ProfileSheetProps) {
  return (
    <Drawer.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Drawer.Content className="bg-white dark:bg-neutral-900 flex flex-col rounded-t-[2rem] mt-24 fixed bottom-0 left-0 right-0 h-[85vh] z-50 focus:outline-none">
          <div className="p-6 bg-white dark:bg-neutral-900 rounded-t-[2rem] flex-1 overflow-y-auto">
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-300 dark:bg-gray-700 mb-6" />
            
            <div className="flex flex-col items-center mb-8">
                <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-br from-primary to-purple-400 mb-4">
                    <div className="w-full h-full rounded-full bg-white overflow-hidden border-4 border-white dark:border-neutral-800">
                         <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" className="w-full h-full object-cover" />
                    </div>
                </div>
                <h2 className="text-2xl font-bold dark:text-white">{MOCK_USER.name}</h2>
                <p className="text-primary font-medium">{MOCK_USER.level}</p>
                
                <div className="flex gap-2 mt-3">
                    {MOCK_USER.badges.map((badge, i) => (
                        <div key={i} className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                            <Trophy className="w-4 h-4" />
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 mb-8">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                    <Star className="w-8 h-8 text-blue-600 mb-2" />
                    <span className="text-2xl font-bold text-blue-700 dark:text-blue-400">{MOCK_USER.reviews}</span>
                    <span className="text-xs text-blue-600/80 dark:text-blue-500">İnceleme</span>
                </div>
            </div>

            <div className="space-y-2">
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                        <span className="font-medium dark:text-white">Karanlık Mod</span>
                    </div>
                    <Switch checked={isDarkMode} onCheckedChange={toggleDarkMode} />
                </div>
                
                <Button variant="ghost" className="w-full justify-start h-14 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl px-4">
                    <LogOut className="w-5 h-5 mr-3" />
                    Çıkış Yap
                </Button>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
