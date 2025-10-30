import React, { useState } from 'react';
import { MessageCircle, Heart, Send, MoreHorizontal } from 'lucide-react';
import { Comment } from '../types';

interface CommentSectionProps {
  postId: string;
  comments: Comment[];
  onAddComment: (postId: string, content: string) => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({ 
  postId, 
  comments, 
  onAddComment 
}) => {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    await onAddComment(postId, newComment);
    setNewComment('');
    setIsSubmitting(false);
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
    <div className="mt-4 pt-4 border-t border-gray-100">
      <div className="flex items-center space-x-2 space-x-reverse mb-4">
        <MessageCircle className="h-5 w-5 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">
          {comments.length} תגובות
        </span>
      </div>

      <div className="space-y-4 mb-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex space-x-3 space-x-reverse">
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-blue-600 font-semibold text-sm">
                {comment.author.name.charAt(0)}
              </span>
            </div>
            <div className="flex-1">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <h4 className="text-sm font-semibold text-gray-900">
                      {comment.author.name}
                    </h4>
                    <span className="text-xs text-gray-500">
                      {comment.author.title}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-400">
                      {formatDate(comment.createdAt)}
                    </span>
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed" dir="rtl">
                  {comment.content}
                </p>
              </div>
              <div className="flex items-center space-x-4 mt-2 mr-3">
                <button className="flex items-center space-x-1 space-x-reverse text-gray-500 hover:text-red-600 transition-colors">
                  <Heart className="h-4 w-4" />
                  <span className="text-xs">{comment.likes}</span>
                </button>
                <button className="text-xs text-gray-500 hover:text-blue-600 transition-colors">
                  תגובה
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex space-x-3 space-x-reverse">
        <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-blue-600 font-semibold text-sm">א</span>
        </div>
        <div className="flex-1 flex items-center space-x-2 space-x-reverse">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="הוסף תגובה..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            dir="rtl"
          />
          <button
            type="submit"
            disabled={!newComment.trim() || isSubmitting}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommentSection;
