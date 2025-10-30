import React, { useState } from 'react';
import { Search, Bell, User, Settings, LogOut, Star, BookOpen } from 'lucide-react';

const Header: React.FC = () => {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="relative">
              <div className="h-10 w-10 bg-gray-900 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">ר</span>
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                רבנים נט
              </h1>
              <p className="text-xs text-gray-500">רשת חברתית לעולם התורה</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg mx-8">
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="חיפוש רבנים, נושאים או דיונים..."
                className="w-full pr-10 pl-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-colors"
                dir="rtl"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-4 space-x-reverse">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-gray-900 rounded-full"></span>
              </button>
              
              {showNotifications && (
                <div className="absolute left-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                  <div className="bg-gray-900 text-white p-4">
                    <h3 className="font-semibold">התראות</h3>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-start space-x-3 space-x-reverse p-3 bg-gray-50 rounded-lg">
                      <div className="h-8 w-8 bg-gray-900 rounded-full flex items-center justify-center flex-shrink-0">
                        <Star className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">הרב כהן הגיב לפוסט שלך</p>
                        <p className="text-xs text-gray-500">לפני 5 דקות</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 space-x-reverse p-3 bg-gray-50 rounded-lg">
                      <div className="h-8 w-8 bg-gray-900 rounded-full flex items-center justify-center flex-shrink-0">
                        <BookOpen className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">שיעור חדש בהלכות שבת</p>
                        <p className="text-xs text-gray-500">מתחיל בעוד שעה</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative">
              <button className="flex items-center space-x-2 space-x-reverse p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <div className="h-8 w-8 bg-gray-900 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-medium hidden md:block">הרב משתמש</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
