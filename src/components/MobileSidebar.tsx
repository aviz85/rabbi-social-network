import React from 'react';
import { Home, Users, BookOpen, Calendar, Settings, PlusCircle, Hash, Heart, X } from 'lucide-react';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onCreatePost: () => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  onUserClick?: (userId: string) => void;
}

const MobileSidebar: React.FC<MobileSidebarProps> = ({ 
  isOpen, 
  onClose, 
  activeTab, 
  onTabChange, 
  onCreatePost,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  onUserClick
}) => {
  const menuItems = [
    { icon: Home, label: 'דף הבית', id: 'home' },
    { icon: Users, label: 'רבנים', id: 'rabbis' },
    { icon: BookOpen, label: 'לימוד', id: 'study' },
    { icon: Calendar, label: 'אירועים', id: 'events' },
    { icon: Hash, label: 'נושאים', id: 'topics' },
    { icon: Heart, label: 'מועדפים', id: 'favorites' },
    { icon: Settings, label: 'הגדרות', id: 'settings' },
  ];

  const suggestedRabbis = [
    { name: 'הרב ישראל מאיר לאו', title: 'ראש ישיבה', followers: '12.5K' },
    { name: 'הרב דוד לאו', title: 'הרב הראשי', followers: '8.3K' },
    { name: 'הרב יצחק יוסף', title: 'הראשון לציון', followers: '15.7K' },
  ];

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
        onClick={onClose}
      />
      <aside className="fixed right-0 top-0 h-full w-72 bg-white shadow-xl z-50 md:hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">תפריט</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4">
          <button 
            onClick={() => {
              onCreatePost();
              onClose();
            }}
            className="w-full bg-blue-600 text-white rounded-lg py-3 px-4 flex items-center justify-center space-x-2 space-x-reverse hover:bg-blue-700 transition-colors"
          >
            <PlusCircle className="h-5 w-5" />
            <span className="font-medium">פוסט חדש</span>
          </button>
        </div>

        <nav className="px-4">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => {
                    onTabChange(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center space-x-3 space-x-reverse px-3 py-2 rounded-lg transition-colors ${
                    activeTab === item.id
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-8 px-4">
          <h3 className="text-gray-500 text-sm font-medium mb-3">רבנים מומלצים</h3>
          <div className="space-y-3">
            {suggestedRabbis.map((rabbi, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{rabbi.name}</p>
                    <p className="text-xs text-gray-500">{rabbi.title}</p>
                  </div>
                </div>
                <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
                  מעקב
                </button>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
};

export default MobileSidebar;
