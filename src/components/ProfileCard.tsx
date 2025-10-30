import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, Book, Edit, Loader2 } from 'lucide-react';
import { User } from '../types';
import apiService from '../services/api';

interface ProfileCardProps {
  user: User;
  isOwnProfile?: boolean;
  onUserClick?: (userId: string) => void;
  onUserUpdate?: (userId: string, updates: Partial<User>) => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ user, isOwnProfile = false, onUserClick, onUserUpdate }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    // Check follow status for non-own profiles
    if (!isOwnProfile) {
      const checkFollowStatus = async () => {
        try {
          console.log('Checking follow status for user:', user.id);
          const status = await apiService.getFollowStatus(parseInt(user.id));
          console.log('Follow status:', status);
          setIsFollowing(status.following);
        } catch (error) {
          console.error('Error checking follow status:', error);
          // Don't set following state on error, keep default false
        }
      };
      checkFollowStatus();
    }
  }, [user.id, isOwnProfile]);

  const handleFollow = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    if (followLoading || isOwnProfile) return;
    
    console.log('Attempting to follow/unfollow user:', user.id);
    setFollowLoading(true);
    try {
      const response = await apiService.followUser(parseInt(user.id));
      console.log('Follow response:', response);
      setIsFollowing(response.following);
      
      // Update user follower count
      const updatedUser = {
        ...user,
        followers: user.followers + (response.following ? 1 : -1)
      };
      console.log('Updated user:', updatedUser);
      onUserUpdate?.(user.id, updatedUser);
    } catch (error) {
      console.error('Error following user:', error);
      // Show error to user or fallback
      alert('Failed to follow user. Please try again.');
    } finally {
      setFollowLoading(false);
    }
  };
  const handleClick = () => {
    if (onUserClick && !isOwnProfile) {
      onUserClick(user.id);
    }
  };

  return (
    <div 
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${
        !isOwnProfile ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center space-x-4 space-x-reverse">
          <div className="h-20 w-20 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-bold text-2xl">
              {user.name.charAt(0)}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
            <p className="text-gray-600">{user.title}</p>
            {user.yeshiva && (
              <p className="text-sm text-gray-500">{user.yeshiva}</p>
            )}
          </div>
        </div>
        {isOwnProfile && (
          <button className="text-gray-500 hover:text-blue-600 transition-colors">
            <Edit className="h-5 w-5" />
          </button>
        )}
      </div>

      {user.bio && (
        <div className="mb-6">
          <p className="text-gray-700 leading-relaxed" dir="rtl">
            {user.bio}
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">{user.followers}</p>
          <p className="text-sm text-gray-500">עוקבים</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">{user.following}</p>
          <p className="text-sm text-gray-500">עוקב אחרי</p>
        </div>
      </div>

      {user.expertise.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <Book className="h-4 w-4 ml-2" />
            תחומי התמחות
          </h3>
          <div className="flex flex-wrap gap-2">
            {user.expertise.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2 text-sm text-gray-600">
        {user.location && (
          <div className="flex items-center">
            <MapPin className="h-4 w-4 ml-2" />
            <span>{user.location}</span>
          </div>
        )}
        <div className="flex items-center">
          <Calendar className="h-4 w-4 ml-2" />
          <span>הצטרף ב-{new Date(user.joinedAt).toLocaleDateString('he-IL')}</span>
        </div>
      </div>

      {!isOwnProfile && (
        <div className="mt-6 space-y-3">
          {/* Debug button */}
          <button 
            onClick={async (e) => {
              e.stopPropagation();
              console.log('Debug - API Service Token:', apiService.getToken());
              try {
                const testResponse = await apiService.getFollowStatus(parseInt(user.id));
                console.log('Debug - Follow status API response:', testResponse);
                alert(`Debug: Token exists: ${!!apiService.getToken()}, Follow status: ${testResponse.following}`);
              } catch (error) {
                console.error('Debug - API error:', error);
                alert(`Debug error: ${error}`);
              }
            }}
            className="w-full py-1 px-2 bg-yellow-100 text-yellow-800 rounded text-xs"
          >
            Debug Follow Status
          </button>
          
          <div className="flex space-x-3 space-x-reverse">
            <button 
              onClick={handleFollow}
              disabled={followLoading}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 space-x-reverse ${
                isFollowing
                  ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              } ${followLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {followLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>...</span>
                </>
              ) : isFollowing ? (
                'Following'
              ) : (
                'Follow'
              )}
            </button>
            <button 
              onClick={(e) => e.stopPropagation()}
              className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Message
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileCard;
