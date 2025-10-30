import React, { useState } from 'react';
import { X, Send, Hash, Book, Heart, Star, Users } from 'lucide-react';
import apiService from '../services/api';

interface CreatePostProps {
  onClose: () => void;
  onPostCreated?: () => void;
}

const CreatePost: React.FC<CreatePostProps> = ({ onClose, onPostCreated }) => {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('torah');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    { id: 'torah', label: 'תורה', icon: Book, color: 'primary' },
    { id: 'halacha', label: 'הלכה', icon: Hash, color: 'accent' },
    { id: 'chassidus', label: 'חסידות', icon: Heart, color: 'secondary' },
    { id: 'mussar', label: 'מוסר', icon: Star, color: 'warm' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    setError('');
    
    try {
      await apiService.createPost({
        content: content.trim(),
        category: category as any
      });
      
      setContent('');
      setCategory('torah');
      onPostCreated?.();
      onClose();
    } catch (error: any) {
      console.error('Error creating post:', error);
      setError(error.message || 'Failed to create post. You may need to be logged in.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryStyle = (catColor: string) => {
    switch (catColor) {
      case 'primary': return 'from-primary-500 to-primary-600';
      case 'accent': return 'from-accent-500 to-accent-600';
      case 'secondary': return 'from-secondary-500 to-secondary-600';
      case 'warm': return 'from-warm-500 to-warm-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getSelectedStyle = (catColor: string, isSelected: boolean) => {
    if (!isSelected) return 'bg-white text-gray-700 hover:bg-gray-50';
    return `bg-gradient-to-r ${getCategoryStyle(catColor)} text-white shadow-lg transform scale-105`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-colorful-lg overflow-hidden border border-primary-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-secondary-500 p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="h-10 w-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
              <Send className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">פוסט חדש</h2>
              <p className="text-sm text-primary-100">שתף מחשבות תורניות עם הקהילה</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        {/* Content */}
        <div className="mb-6">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="מה על ליבך לשתף היום? כתוב פוסט תורני, שאלה הלכתית, או מחשבה..."
            className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none transition-all text-lg leading-relaxed"
            dir="rtl"
            rows={6}
          />
          <div className="mt-2 text-sm text-gray-500 text-right">
            {content.length} / 500 תווים
          </div>
        </div>

        {/* Category Selection */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center space-x-2 space-x-reverse">
            <Hash className="h-4 w-4 text-primary-500" />
            <span>בחר קטגוריה</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={`flex items-center justify-center space-x-2 space-x-reverse px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                  category === cat.id
                    ? getSelectedStyle(cat.color, true)
                    : 'border-gray-200 hover:border-primary-300'
                }`}
              >
                <cat.icon className="h-4 w-4" />
                <span className="font-medium">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 space-x-reverse text-sm text-gray-500">
            <Users className="h-4 w-4" />
            <span>יישלח לכל העוקבים שלך</span>
          </div>
          <div className="flex items-center space-x-3 space-x-reverse">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium"
            >
              ביטול
            </button>
            <button
              type="submit"
              disabled={!content.trim() || isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2 space-x-reverse"
            >
              <Send className="h-4 w-4" />
              <span>{isSubmitting ? 'מפרסם...' : 'פרסם'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;
