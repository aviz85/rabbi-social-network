import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MobileHeader from './components/MobileHeader';
import MobileSidebar from './components/MobileSidebar';
import PostCard from './components/PostCard';
import CreatePost from './components/CreatePost';
import ProfileCard from './components/ProfileCard';
import StudySessionCard from './components/StudySessionCard';
import AuthModal from './components/AuthModal';
import UserProfile from './components/UserProfile';
import { mockPosts, mockUsers, mockStudySessions } from './data/mockData';
import { Post, User, StudySession } from './types';
import apiService from './services/api';

type TabType = 'home' | 'rabbis' | 'study' | 'events' | 'topics' | 'favorites' | 'settings';
type ViewType = TabType | 'user-profile';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ViewType>('home');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data from API and auto-authenticate for testing
  useEffect(() => {
    const loadData = async () => {
      try {
        // Auto-authenticate for testing purposes
        try {
          console.log('Attempting auto-authentication...');
          const authResponse = await apiService.login('test@rabbi.com', 'password123');
          console.log('Auto-authentication successful:', authResponse);
          handleAuthSuccess(authResponse.user);
        } catch (authError) {
          console.error('Auto-authentication failed:', authError);
          // Try to use existing token if available
          const existingToken = apiService.getToken();
          if (existingToken) {
            console.log('Using existing token');
            setIsAuthenticated(true);
          }
        }

        const [postsData, usersData, sessionsData] = await Promise.all([
          apiService.getPosts(),
          apiService.getUsers(),
          apiService.getStudySessions()
        ]);

        // Transform API data to match frontend types
        const transformedPosts: Post[] = postsData.map((post: any) => ({
          id: post.id.toString(),
          authorId: post.user_id.toString(),
          author: {
            id: post.user_id.toString(),
            name: post.author_name,
            title: post.author_title || '',
            expertise: [],
            followers: 0,
            following: 0,
            joinedAt: new Date(post.created_at)
          },
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

        const transformedUsers: User[] = usersData.map((user: any) => ({
          id: user.id.toString(),
          name: user.name,
          title: user.title || '',
          expertise: user.expertise ? user.expertise.split(',').map((e: string) => e.trim()) : [],
          followers: user.followers,
          following: user.following,
          joinedAt: new Date(user.created_at)
        }));

        const transformedSessions: StudySession[] = sessionsData.map((session: any) => ({
          id: session.id.toString(),
          title: session.title,
          description: session.description || '',
          hostId: session.speaker_id.toString(),
          host: {
            id: session.speaker_id.toString(),
            name: session.speaker_name,
            title: session.speaker_title || '',
            expertise: [],
            followers: 0,
            following: 0,
            joinedAt: new Date()
          },
          topic: session.category || '',
          startTime: new Date(session.date_time),
          duration: session.duration || 60,
          participants: [],
          maxParticipants: session.max_participants || 30
        }));

        setPosts(transformedPosts);
        setUsers(transformedUsers);
        setStudySessions(transformedSessions);
      } catch (error) {
        console.error('Error loading data:', error);
        // Fallback to mock data on error
        setPosts(mockPosts as any);
        setUsers(mockUsers);
        setStudySessions(mockStudySessions);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSessionUpdate = (sessionId: string, updates: Partial<StudySession>) => {
    setStudySessions(studySessions.map(session => 
      session.id === sessionId 
        ? { ...session, ...updates }
        : session
    ));
  };

  const handlePostUpdate = (postId: string, updates: Partial<Post>) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, ...updates }
        : post
    ));
  };

  const handlePostCreated = async () => {
    try {
      // Refresh posts from API
      const postsData = await apiService.getPosts();
      
      // Transform API data to match frontend types
      const transformedPosts: Post[] = postsData.map((post: any) => ({
        id: post.id.toString(),
        authorId: post.user_id.toString(),
        author: {
          id: post.user_id.toString(),
          name: post.author_name,
          title: post.author_title || '',
          expertise: [],
          followers: 0,
          following: 0,
          joinedAt: new Date(post.created_at)
        },
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
      
      setPosts(transformedPosts);
    } catch (error) {
      console.error('Error refreshing posts:', error);
    }
  };

  const handleCreatePost = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      setAuthMode('register');
      return;
    }
    setShowCreatePost(true);
  };

  const handleUserUpdate = (userId: string, updatedUser: Partial<User>) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, ...updatedUser }
        : user
    ));
  };

  const handleUserClick = (userId: string) => {
    setSelectedUserId(userId);
    setActiveTab('user-profile');
  };

  const handleBackFromProfile = () => {
    setSelectedUserId(null);
    setActiveTab('rabbis');
  };

  const handleTabChange = (tab: string) => {
    if (tab === 'favorites' && !isAuthenticated) {
      setShowAuthModal(true);
      setAuthMode('login');
      return;
    }
    if (tab === 'settings' && !isAuthenticated) {
      setShowAuthModal(true);
      setAuthMode('login');
      return;
    }
    setActiveTab(tab as ViewType);
  };

  const handleAuthSuccess = (user?: any) => {
    setIsAuthenticated(true);
    setCurrentUser(user || { name: 'Test Rabbi', email: 'test@rabbi.com' });
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    apiService.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    // Redirect to home and refresh data
    setActiveTab('home');
    window.location.reload();
  };

  const handleManualAuth = async () => {
    try {
      console.log('Manual authentication attempt...');
      const authResponse = await apiService.login('test@rabbi.com', 'password123');
      console.log('Manual auth successful:', authResponse);
      handleAuthSuccess(authResponse.user);
      alert('Authentication successful! You can now create posts.');
    } catch (error) {
      console.error('Manual auth failed:', error);
      alert('Authentication failed: ' + (error as any).message);
    }
  };

  const handleAddComment = async (postId: string, content: string) => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      setAuthMode('login');
      return;
    }

    try {
      const newComment = await apiService.addComment(parseInt(postId), content);
      
      // Refresh posts to get updated comments
      const updatedPosts = await apiService.getPosts();
      const transformedPosts: Post[] = updatedPosts.map((post: any) => ({
        id: post.id.toString(),
        authorId: post.user_id.toString(),
        author: {
          id: post.user_id.toString(),
          name: post.author_name,
          title: post.author_title || '',
          expertise: [],
          followers: 0,
          following: 0,
          joinedAt: new Date(post.created_at)
        },
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
      
      setPosts(transformedPosts);
    } catch (error) {
      console.error('Error adding comment:', error);
      // Fallback to optimistic update
      const currentUser = {
        id: 'current-user',
        name: 'הרב משתמש',
        title: 'רב קהילה',
        expertise: [],
        followers: 0,
        following: 0,
        joinedAt: new Date(),
      };

      const newCommentObj = {
        id: Date.now().toString(),
        postId,
        authorId: 'current-user',
        author: currentUser,
        content,
        likes: 0,
        createdAt: new Date(),
      };

      setPosts(posts.map(post => 
        post.id === postId 
          ? { ...post, comments: [...post.comments, newCommentObj] }
          : post
      ));
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    switch (activeTab) {
      case 'home':
        return (
          <div className="space-y-6">
            {/* Debug Authentication Button */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    Debug: Authentication Status: {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
                  </p>
                  {currentUser && (
                    <p className="text-xs text-yellow-600 mt-1">
                      User: {currentUser.name} ({currentUser.email})
                    </p>
                  )}
                  <p className="text-xs text-yellow-600">
                    Token: {apiService.getToken() ? 'Present' : 'None'}
                  </p>
                </div>
                <div className="flex gap-2">
                  {!isAuthenticated ? (
                    <button
                      onClick={handleManualAuth}
                      className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm"
                    >
                      Test Authentication
                    </button>
                  ) : (
                    <button
                      onClick={handleLogout}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                    >
                      Logout
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            {showCreatePost && (
              <CreatePost 
                onClose={() => setShowCreatePost(false)} 
                onPostCreated={handlePostCreated}
              />
            )}
            {posts.map((post) => (
              <PostCard 
                key={post.id} 
                post={post} 
                onAddComment={handleAddComment}
                onPostUpdate={handlePostUpdate}
              />
            ))}
          </div>
        );
      
      case 'rabbis':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {users.map((user) => (
              <ProfileCard 
                key={user.id} 
                user={user} 
                onUserClick={handleUserClick}
                onUserUpdate={handleUserUpdate}
              />
            ))}
          </div>
        );
      
      case 'study':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">שיעורים קרובים</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {studySessions.map((session) => (
                <StudySessionCard 
                  key={session.id} 
                  session={session} 
                  onSessionUpdate={handleSessionUpdate}
                />
              ))}
            </div>
          </div>
        );
      
      case 'events':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">אירועים קרובים</h2>
            <p className="text-gray-600">אין אירועים קרובים כרגע</p>
          </div>
        );
      
      case 'topics':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">נושאים פופולריים</h2>
            <div className="flex flex-wrap justify-center gap-3">
              {['הלכה', 'תלמוד', 'תנ"ך', 'מחשבת ישראל', 'חסידות', 'מוסר'].map((topic) => (
                <span
                  key={topic}
                  className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full font-medium"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        );
      
      case 'favorites':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">מועדפים</h2>
            <p className="text-gray-600">אין פריטים מועדפים עדיין</p>
          </div>
        );
      
      case 'user-profile':
        return selectedUserId ? (
          <UserProfile 
            userId={selectedUserId} 
            onBack={handleBackFromProfile}
          />
        ) : null;
      
      case 'settings':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">הגדרות</h2>
            <p className="text-gray-600">דף הגדרות יהיה זמין בקרוב</p>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Header */}
      <div className="hidden md:block">
        <Header />
      </div>
      
      {/* Mobile Header */}
      <div className="md:hidden">
        <MobileHeader 
          onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          isMenuOpen={isMobileMenuOpen}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Desktop Sidebar */}
          <div className="hidden md:block">
            <Sidebar 
              activeTab={activeTab} 
              onTabChange={handleTabChange} 
              onCreatePost={handleCreatePost}
              onUserClick={handleUserClick}
            />
          </div>
          
          {/* Main Content */}
          <div className="flex-1">
            {renderContent()}
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className="md:hidden">
        <MobileSidebar 
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          activeTab={activeTab} 
          onTabChange={handleTabChange} 
          onCreatePost={handleCreatePost}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          onUserClick={handleUserClick}
        />
      </div>
      
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
        onModeChange={setAuthMode}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default App;
