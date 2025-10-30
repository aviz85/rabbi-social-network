import React, { useState } from 'react';
import { Menu, X, Search, Bell, User, Star } from 'lucide-react';

interface MobileHeaderProps {
  onMenuToggle: () => void;
  isMenuOpen: boolean;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ onMenuToggle, isMenuOpen }) => {
  const [showSearch, setShowSearch] = useState(false);

  return (
    <header className="bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-500 text-white shadow-colorful-lg sticky top-0 z-40 md:hidden">
      <div className="px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <button
              onClick={onMenuToggle}
              className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-all"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <div className="flex items-center space-x-3 space-x-reverse mr-3">
              <div className="relative">
                <div className="h-8 w-8 bg-gradient-to-br from-accent-400 to-accent-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-sm">ר</span>
                </div>
                <div className="absolute -top-1 -right-1 h-2 w-2 bg-warm-500 rounded-full animate-pulse"></div>
              </div>
              <div>
                <span className="text-lg font-bold text-white">רבנים נט</span>
                <div className="text-xs text-primary-100">רשת חברתית</div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 space-x-reverse">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-all"
            >
              <Search className="h-5 w-5" />
            </button>
            <button className="relative text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-all">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-warm-500 rounded-full animate-pulse"></span>
            </button>
            <button className="flex items-center justify-center h-8 w-8 bg-gradient-to-br from-accent-400 to-accent-600 rounded-lg shadow-md hover:scale-105 transition-transform">
              <User className="h-4 w-4 text-white" />
            </button>
          </div>
        </div>
      </div>

      {showSearch && (
        <div className="px-4 pb-4 sm:px-6 bg-gradient-to-b from-primary-500/10 to-transparent">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary-200" />
            <input
              type="text"
              placeholder="חיפוש רבנים, נושאים או דיונים..."
              className="w-full pr-10 pl-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-primary-200 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent transition-all"
              dir="rtl"
              autoFocus
            />
          </div>
        </div>
      )}
    </header>
  );
};

export default MobileHeader;
