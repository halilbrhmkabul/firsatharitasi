import { User, Trophy, Star, Moon, Sun, LogOut, UserPlus, Mail, Phone } from 'lucide-react';
import { Switch } from '../ui/switch';
import { Button } from '../ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../lib/auth.tsx';
import { useLocation } from 'wouter';

interface ProfileSheetProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export default function ProfileSheet({ isOpen, onClose, isDarkMode, toggleDarkMode }: ProfileSheetProps) {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogin = () => {
    onClose();
    setLocation('/auth');
  };

  const handleLogout = async () => {
    await logout();
  };

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
              
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : isAuthenticated && user ? (
                <>
                  {/* User Info */}
                  <div className="flex flex-col items-center mb-6">
                    <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-br from-primary to-purple-400 mb-3">
                      <div className="w-full h-full rounded-full bg-white overflow-hidden border-4 border-white dark:border-neutral-800 flex items-center justify-center">
                        <span className="text-2xl font-bold text-gray-600">
                          {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                        </span>
                      </div>
                    </div>
                    <h2 className="text-xl font-bold dark:text-white" data-testid="text-user-name">
                      {user.firstName} {user.lastName}
                    </h2>
                    <p className="text-primary font-medium text-sm">Üye</p>
                  </div>

                  {/* User Details */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-white/5 rounded-xl">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-300" data-testid="text-user-email">
                        {user.email}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-white/5 rounded-xl">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-300" data-testid="text-user-phone">
                        {user.phone}
                      </span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl flex items-center justify-center gap-3 mb-6">
                    <Star className="w-6 h-6 text-blue-600" />
                    <div className="text-center">
                      <span className="text-xl font-bold text-blue-700 dark:text-blue-400">0</span>
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
                    
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start h-12 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl px-4"
                      onClick={handleLogout}
                      data-testid="button-logout"
                    >
                      <LogOut className="w-5 h-5 mr-3" />
                      Çıkış Yap
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center mb-4">
                    <User className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-bold dark:text-white mb-2">Henüz giriş yapmadınız</h3>
                  <p className="text-gray-500 text-sm text-center mb-6 px-4">
                    Fırsatları kaydetmek ve kişiselleştirilmiş öneriler almak için giriş yapın
                  </p>
                  <Button 
                    onClick={handleLogin}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 h-12 rounded-xl"
                    data-testid="button-login"
                  >
                    <UserPlus className="w-5 h-5 mr-2" />
                    Giriş Yap / Kayıt Ol
                  </Button>

                  {/* Settings even when not logged in */}
                  <div className="w-full mt-8 space-y-2">
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                        <span className="font-medium dark:text-white text-sm">Karanlık Mod</span>
                      </div>
                      <Switch checked={isDarkMode} onCheckedChange={toggleDarkMode} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
