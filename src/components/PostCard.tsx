import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, ThumbsUp, Star, Calendar } from 'lucide-react';
import { Post } from '../types';
import CommentSection from './CommentSection';
import apiService from '../services/api';

interface PostCardProps {
  post: Post;
  onAddComment?: (postId: string, content: string) => void;
  onPostUpdate?: (postId: string, updatedPost: Partial<Post>) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onAddComment, onPostUpdate }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [showComments, setShowComments] = useState(false);
  const [liking, setLiking] = useState(false);

  const handleLike = async () => {
    if (liking) return;
    
    setLiking(true);
    try {
      const response = await apiService.likePost(parseInt(post.id));
      const newLikedState = response.liked;
      const newLikeCount = likeCount + (newLikedState ? 1 : -1);
      
      setIsLiked(newLikedState);
      setLikeCount(newLikeCount);
      
      // Notify parent component of the update
      onPostUpdate?.(post.id, { likes: newLikeCount });
    } catch (error) {
      console.error('Error liking post:', error);
      // Fallback to local update
      const newLikedState = !isLiked;
      const newLikeCount = likeCount + (newLikedState ? 1 : -1);
      setIsLiked(newLikedState);
      setLikeCount(newLikeCount);
    } finally {
      setLiking(false);
    }
  };

  const handleAddComment = (postId: string, content: string) => {
    onAddComment?.(postId, content);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'torah': return 'bg-gray-900 text-white';
      case 'halacha': return 'bg-gray-800 text-white';
      case 'chassidus': return 'bg-gray-700 text-white';
      case 'mussar': return 'bg-gray-600 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'torah': return 'תורה';
      case 'halacha': return 'הלכה';
      case 'chassidus': return 'חסידות';
      case 'mussar': return 'מוסר';
      default: return 'כללי';
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (hours < 1) return 'עכשיו';
    if (hours < 24) return `לפני ${hours} שעות`;
    if (days < 7) return `לפני ${days} ימים`;
    return date.toLocaleDateString('he-IL');
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-200">
      {/* Post Header */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="relative">
              <div className="h-12 w-12 bg-gray-900 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {post.author.name.charAt(0)}
                </span>
              </div>
              <div className="absolute -bottom-1 -left-1 h-4 w-4 bg-gray-900 rounded-full flex items-center justify-center">
                <Star className="h-2 w-2 text-white fill-current" />
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 flex items-center space-x-2 space-x-reverse">
                <span>{post.author.name}</span>
                <div className="h-1 w-1 bg-gray-400 rounded-full"></div>
                <span className="text-sm text-gray-600">{post.author.title}</span>
              </h3>
              <div className="flex items-center space-x-2 space-x-reverse text-sm text-gray-500">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(post.createdAt)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 space-x-reverse">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(post.category)}`}>
              {getCategoryLabel(post.category)}
            </span>
            <button className="text-gray-400 hover:text-gray-600 transition-colors p-1">
              <MoreHorizontal className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Post Content */}
        <div className="mb-6">
          <p className="text-gray-800 leading-relaxed text-lg" dir="rtl">
            {post.content}
          </p>
        </div>

        {/* Engagement Stats */}
        <div className="flex items-center justify-between py-3 border-y border-gray-200">
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="flex items-center space-x-1 space-x-reverse text-sm text-gray-500">
              <Heart className="h-4 w-4" />
              <span>{likeCount} אהבו</span>
            </div>
            <div className="flex items-center space-x-1 space-x-reverse text-sm text-gray-500">
              <MessageCircle className="h-4 w-4" />
              <span>{post.comments.length} תגובות</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-2 space-x-reverse">
            <button
              onClick={handleLike}
              disabled={liking}
              className={`flex items-center space-x-2 space-x-reverse px-4 py-2 rounded-md transition-colors ${
                isLiked
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } ${liking ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''} ${liking ? 'animate-pulse' : ''}`} />
              <span className="font-medium">{liking ? '...' : likeCount}</span>
            </button>
            
            <button 
              onClick={() => setShowComments(!showComments)}
              className={`flex items-center space-x-2 space-x-reverse px-4 py-2 rounded-md transition-colors ${
                showComments
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <MessageCircle className="h-5 w-5" />
              <span className="font-medium">{post.comments.length}</span>
            </button>
            
            <button className="flex items-center space-x-2 space-x-reverse px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
              <Share2 className="h-5 w-5" />
              <span className="font-medium">שיתוף</span>
            </button>
          </div>
          
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
            <Bookmark className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-gray-200 bg-gray-50">
          <CommentSection
            postId={post.id}
            comments={post.comments}
            onAddComment={handleAddComment}
          />
        </div>
      )}
    </div>
  );
};

export default PostCard;
