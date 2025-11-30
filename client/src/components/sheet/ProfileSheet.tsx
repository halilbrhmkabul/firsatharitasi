import { User, Trophy, Star, Moon, Sun, LogOut } from 'lucide-react';
import { Switch } from '../ui/switch';
import { Button } from '../ui/button';
import { MOCK_USER } from '../../data/mockData';
import { motion, AnimatePresence } from 'framer-motion';

interface ProfileSheetProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export default function ProfileSheet({ isOpen, onClose, isDarkMode, toggleDarkMode }: ProfileSheetProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: '100%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed inset-0 z-50 bg-white dark:bg-neutral-900 flex flex-col"
          data-testid="profile-page"
        >
          {/* Header */}
          <div className="flex-shrink-0 px-4 pt-6 pb-4 border-b border-gray-100 dark:border-white/5">
            <h2 className="text-xl font-bold dark:text-white">Profil</h2>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 pb-24">
              
              {/* User Info */}
              <div className="flex flex-col items-center mb-6">
                <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-br from-primary to-purple-400 mb-3">
                  <div className="w-full h-full rounded-full bg-white overflow-hidden border-4 border-white dark:border-neutral-800">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" className="w-full h-full object-cover" />
                  </div>
                </div>
                <h2 className="text-xl font-bold dark:text-white">{MOCK_USER.name}</h2>
                <p className="text-primary font-medium text-sm">{MOCK_USER.level}</p>
                
                <div className="flex gap-2 mt-2">
                  {MOCK_USER.badges.map((badge, i) => (
                    <div key={i} className="w-7 h-7 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                      <Trophy className="w-3.5 h-3.5" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl flex items-center justify-center gap-3 mb-6">
                <Star className="w-6 h-6 text-blue-600" />
                <div className="text-center">
                  <span className="text-xl font-bold text-blue-700 dark:text-blue-400">{MOCK_USER.reviews}</span>
                  <span className="text-xs text-blue-600/80 dark:text-blue-500 ml-1">İnceleme</span>
                </div>
              </div>

              {/* Settings */}
              <div className="space-y-2">
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                    <span className="font-medium dark:text-white text-sm">Karanlık Mod</span>
                  </div>
                  <Switch checked={isDarkMode} onCheckedChange={toggleDarkMode} />
                </div>
                
                <Button variant="ghost" className="w-full justify-start h-12 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl px-4">
                  <LogOut className="w-5 h-5 mr-3" />
                  Çıkış Yap
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
