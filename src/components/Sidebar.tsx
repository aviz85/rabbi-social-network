import React, { useState, useEffect } from 'react';
import { Home, Users, BookOpen, Calendar, Settings, PlusCircle, Hash, Heart, TrendingUp, Award, Clock, Loader2 } from 'lucide-react';
import apiService from '../services/api';
import { User } from '../types';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onCreatePost: () => void;
  onUserClick?: (userId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, onCreatePost, onUserClick }) => {
  const [suggestedRabbis, setSuggestedRabbis] = useState<User[]>([]);
  const [followStates, setFollowStates] = useState<{[key: string]: boolean}>({});
  const [followLoading, setFollowLoading] = useState<{[key: string]: boolean}>({});
  const menuItems = [
    { icon: Home, label: 'דף הבית', id: 'home', color: 'primary' },
    { icon: Users, label: 'רבנים', id: 'rabbis', color: 'accent' },
    { icon: BookOpen, label: 'לימוד', id: 'study', color: 'secondary' },
    { icon: Calendar, label: 'אירועים', id: 'events', color: 'warm' },
    { icon: Hash, label: 'נושאים', id: 'topics', color: 'primary' },
    { icon: Heart, label: 'מועדפים', id: 'favorites', color: 'secondary' },
    { icon: Settings, label: 'הגדרות', id: 'settings', color: 'gray' },
  ];

  useEffect(() => {
    const loadSuggestedRabbis = async () => {
      try {
        const users = await apiService.getUsers();
        // Get top 3 users by followers
        const topRabbis = users
          .sort((a, b) => b.followers - a.followers)
          .slice(0, 3)
          .map(user => ({
            id: user.id.toString(), // Convert id to string
            name: user.name,
            title: user.title || '', // Handle optional title
            expertise: user.expertise ? user.expertise.split(',').map(e => e.trim()) : [], // Convert string to array
            followers: user.followers,
            following: user.following,
            joinedAt: new Date() // Add missing joinedAt property
          }));
        
        setSuggestedRabbis(topRabbis);
        
        // Check follow status for each rabbi
        const followStatusPromises = topRabbis.map(async (rabbi) => {
          try {
            const status = await apiService.getFollowStatus(parseInt(rabbi.id));
            return { userId: rabbi.id, following: status.following };
          } catch (error) {
            return { userId: rabbi.id, following: false };
          }
        });
        
        const followStatuses = await Promise.all(followStatusPromises);
        const statusMap = followStatuses.reduce((acc, status) => {
          acc[status.userId] = status.following;
          return acc;
        }, {} as {[key: string]: boolean});
        
        setFollowStates(statusMap);
      } catch (error) {
        console.error('Error loading suggested rabbis:', error);
      }
    };
    
    loadSuggestedRabbis();
  }, []);

  const handleFollow = async (userId: string) => {
    if (followLoading[userId]) return;
    
    setFollowLoading(prev => ({ ...prev, [userId]: true }));
    try {
      const response = await apiService.followUser(parseInt(userId));
      setFollowStates(prev => ({ ...prev, [userId]: response.following }));
      
      // Update user follower count
      setSuggestedRabbis(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, followers: user.followers + (response.following ? 1 : -1) }
          : user
      ));
    } catch (error) {
      console.error('Error following user:', error);
    } finally {
      setFollowLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const getActiveStyle = (color: string, isActive: boolean) => {
    if (!isActive) return '';
    
    switch (color) {
      case 'primary': return 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg';
      case 'accent': return 'bg-gradient-to-r from-accent-500 to-accent-600 text-white shadow-lg';
      case 'secondary': return 'bg-gradient-to-r from-secondary-500 to-secondary-600 text-white shadow-lg';
      case 'warm': return 'bg-gradient-to-r from-warm-500 to-warm-600 text-white shadow-lg';
      default: return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg';
    }
  };

  const getHoverStyle = (color: string) => {
    switch (color) {
      case 'primary': return 'hover:bg-gradient-to-r hover:from-primary-50 hover:to-primary-100 hover:text-primary-600';
      case 'accent': return 'hover:bg-gradient-to-r hover:from-accent-50 hover:to-accent-100 hover:text-accent-600';
      case 'secondary': return 'hover:bg-gradient-to-r hover:from-secondary-50 hover:to-secondary-100 hover:text-secondary-600';
      case 'warm': return 'hover:bg-gradient-to-r hover:from-warm-50 hover:to-warm-100 hover:text-warm-600';
      default: return 'hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:text-gray-600';
    }
  };

  return (
    <aside className="w-80 space-y-6">
      {/* Create Post Button */}
      <div className="bg-gray-900 rounded-lg p-1">
        <button 
          onClick={onCreatePost}
          className="w-full bg-white rounded-md p-4 flex items-center justify-center space-x-2 space-x-reverse hover:bg-gray-50 transition-colors group"
        >
          <PlusCircle className="h-5 w-5 text-gray-900 group-hover:scale-110 transition-transform" />
          <span className="font-semibold text-gray-900">
            פוסט חדש
          </span>
        </button>
      </div>

      {/* Navigation Menu */}
      <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2 space-x-reverse">
          <TrendingUp className="h-5 w-5 text-gray-600" />
          <span>ניווט מהיר</span>
        </h3>
        <nav>
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center space-x-3 space-x-reverse px-4 py-3 rounded-md transition-colors ${
                    activeTab === item.id
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                  {activeTab === item.id && (
                    <div className="mr-auto h-2 w-2 bg-white rounded-full"></div>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Stats Card */}
      <div className="bg-gray-900 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">הישגים</h3>
          <Award className="h-6 w-6 text-gray-300" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">247</div>
            <div className="text-sm text-gray-300">פוסטים</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">1.2K</div>
            <div className="text-sm text-gray-300">עוקבים</div>
          </div>
        </div>
      </div>

      {/* Suggested Rabbis */}
      <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2 space-x-reverse">
          <Users className="h-5 w-5 text-gray-600" />
          <span>רבנים מומלצים</span>
        </h3>
        <div className="space-y-3">
          {suggestedRabbis.map((rabbi) => (
            <div key={rabbi.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group">
              <div 
                className="flex items-center space-x-3 space-x-reverse flex-1 cursor-pointer"
                onClick={() => onUserClick?.(rabbi.id)}
              >
                <div className="relative">
                  <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold group-hover:scale-110 transition-transform">
                    {rabbi.name.charAt(0)}
                  </div>
                  <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-blue-600 rounded-full border-2 border-white"></div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{rabbi.name}</p>
                  <div className="flex items-center space-x-2 space-x-reverse text-xs text-gray-500">
                    <span>{rabbi.title}</span>
                    {rabbi.expertise.length > 0 && (
                      <>
                        <span>•</span>
                        <span>{rabbi.expertise[0]}</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center space-x-1 space-x-reverse text-xs text-gray-600">
                    <Heart className="h-3 w-3" />
                    <span>{rabbi.followers}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => handleFollow(rabbi.id)}
                disabled={followLoading[rabbi.id]}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors flex items-center space-x-1 space-x-reverse ${
                  followStates[rabbi.id]
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                } ${followLoading[rabbi.id] ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {followLoading[rabbi.id] ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>...</span>
                  </>
                ) : followStates[rabbi.id] ? (
                  'Following'
                ) : (
                  'Follow'
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2 space-x-reverse">
          <Clock className="h-5 w-5 text-gray-600" />
          <span>אירועים קרובים</span>
        </h3>
        <div className="space-y-3">
          <div className="p-3 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-900">שיעור בהלכות שבת</span>
              <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">היום</span>
            </div>
            <p className="text-xs text-gray-500">הרב ישראל מאיר לאו • 19:00</p>
          </div>
          <div className="p-3 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-900">דיון: תכנון הלכתי</span>
              <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">מחר</span>
            </div>
            <p className="text-xs text-gray-500">הרב דוד לאו • 20:30</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
