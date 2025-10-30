import React, { useState, useEffect } from 'react';
import { ArrowRight, Calendar, MapPin, Book, Users, Heart, MessageCircle, Loader2 } from 'lucide-react';
import { User, Post } from '../types';
import PostCard from './PostCard';
import apiService from '../services/api';

interface UserProfileProps {
  userId: string;
  onBack?: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ userId, onBack }) => {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const [userData, userPosts, followStatus] = await Promise.all([
          apiService.getUser(parseInt(userId)),
          apiService.getUserPosts(parseInt(userId)),
          apiService.getFollowStatus(parseInt(userId)).catch(() => ({ following: false }))
        ]);

        // Transform user data
        const transformedUser: User = {
          id: userData.id.toString(),
          name: userData.name,
          title: userData.title || '',
          expertise: userData.expertise ? userData.expertise.split(',').map((e: string) => e.trim()) : [],
          followers: userData.followers,
          following: userData.following,
          joinedAt: new Date(userData.created_at)
        };

        // Transform posts data
        const transformedPosts: Post[] = userPosts.map((post: any) => ({
          id: post.id.toString(),
          authorId: post.user_id.toString(),
          author: transformedUser,
          content: post.content,
          category: post.category as Post['category'],
          likes: post.likes,
          comments: post.comments?.map((comment: any) => ({
            id: comment.id.toString(),
            postId: comment.post_id.toString(),
            authorId: comment.user_id.toString(),
            author: {
              id: comment.user_id.toString(),
              name: comment.author_name,
              title: '',
              expertise: [],
              followers: 0,
              following: 0,
              joinedAt: new Date(comment.created_at)
            },
            content: comment.content,
            likes: 0,
            createdAt: new Date(comment.created_at)
          })) || [],
          createdAt: new Date(post.created_at),
          updatedAt: new Date(post.updated_at)
        }));

        setUser(transformedUser);
        setPosts(transformedPosts);
        setIsFollowing(followStatus.following);
      } catch (error) {
        console.error('Error loading user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [userId]);

  const handleFollow = async () => {
    if (followLoading) return;
    
    setFollowLoading(true);
    try {
      const response = await apiService.followUser(parseInt(userId));
      setIsFollowing(response.following);
      
      // Update user follower count
      if (user) {
        setUser({
          ...user,
          followers: user.followers + (response.following ? 1 : -1)
        });
      }
    } catch (error) {
      console.error('Error following user:', error);
    } finally {
      setFollowLoading(false);
    }
  };

  const handlePostUpdate = (postId: string, updates: Partial<Post>) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, ...updates }
        : post
    ));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">User not found</p>
        {onBack && (
          <button
            onClick={onBack}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            Go back
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      {onBack && (
        <button
          onClick={onBack}
          className="mb-6 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowRight className="h-4 w-4 ml-2 rotate-180" />
          Back to Rabbis
        </button>
      )}

      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-6 space-x-reverse">
            <div className="h-24 w-24 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold text-3xl">
                {user.name.charAt(0)}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{user.name}</h1>
              <p className="text-lg text-gray-600 mb-1">{user.title}</p>
              <div className="flex items-center space-x-4 space-x-reverse text-sm text-gray-500">
                <div className="flex items-center space-x-1 space-x-reverse">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {user.joinedAt.toLocaleDateString('he-IL')}</span>
                </div>
                {user.location && (
                  <div className="flex items-center space-x-1 space-x-reverse">
                    <MapPin className="h-4 w-4" />
                    <span>{user.location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <button
            onClick={handleFollow}
            disabled={followLoading}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              isFollowing
                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            } ${followLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {followLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              isFollowing ? 'Following' : 'Follow'
            )}
          </button>
        </div>

        {/* Bio */}
        {user.bio && (
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">About</h3>
            <p className="text-gray-700" dir="rtl">{user.bio}</p>
          </div>
        )}

        {/* Expertise */}
        {user.expertise.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Areas of Expertise</h3>
            <div className="flex flex-wrap gap-2">
              {user.expertise.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 pt-6 border-t border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{user.followers}</div>
            <div className="text-sm text-gray-500 flex items-center justify-center">
              <Users className="h-4 w-4 ml-1" />
              Followers
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{user.following}</div>
            <div className="text-sm text-gray-500">Following</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{posts.length}</div>
            <div className="text-sm text-gray-500 flex items-center justify-center">
              <Book className="h-4 w-4 ml-1" />
              Posts
            </div>
          </div>
        </div>
      </div>

      {/* Posts */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Posts</h2>
        {posts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <Book className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No posts yet</p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onPostUpdate={handlePostUpdate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
