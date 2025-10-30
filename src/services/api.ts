const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

interface User {
  id: number;
  name: string;
  email: string;
  title?: string;
  expertise?: string;
  bio?: string;
  avatar?: string;
  followers: number;
  following: number;
  posts_count: number;
  created_at: string;
}

interface Post {
  id: number;
  user_id: number;
  content: string;
  category: string;
  likes: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
  author_name: string;
  author_title?: string;
  author_avatar?: string;
  comments?: Comment[];
}

interface Comment {
  id: number;
  post_id: number;
  user_id: number;
  content: string;
  created_at: string;
  author_name: string;
  author_avatar?: string;
}

interface StudySession {
  id: number;
  title: string;
  description?: string;
  speaker_id: number;
  speaker_name: string;
  speaker_title?: string;
  date_time: string;
  duration?: number;
  max_participants?: number;
  current_participants: number;
  category?: string;
  created_at: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

class ApiService {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('authToken');
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = this.getToken();

    // Only log for follow endpoints to reduce noise
    if (endpoint.includes('/follow') || endpoint.includes('/register')) {
      console.log(`API Request: ${options.method || 'GET'} ${url}`);
      console.log('Token present:', !!token);
    }

    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (endpoint.includes('/follow') || endpoint.includes('/register')) {
      console.log(`Response status: ${response.status}`);
    }

    if (!response.ok) {
      const error = await response.json();
      console.error('API Error:', error);
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  // Auth endpoints
  async register(userData: {
    name: string;
    email: string;
    password: string;
    title?: string;
    expertise?: string;
    bio?: string;
  }): Promise<AuthResponse> {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    this.setToken(response.token);
    return response;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(response.token);
    return response;
  }

  logout() {
    this.clearToken();
  }

  // Posts endpoints
  async getPosts(): Promise<Post[]> {
    return this.request('/posts');
  }

  async createPost(postData: { content: string; category: string }): Promise<Post> {
    return this.request('/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  }

  async likePost(postId: number): Promise<{ liked: boolean }> {
    return this.request(`/posts/${postId}/like`, {
      method: 'POST',
    });
  }

  async addComment(postId: number, content: string): Promise<Comment> {
    return this.request(`/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  // Users endpoints
  async getUsers(): Promise<User[]> {
    return this.request('/users');
  }

  async getUser(userId: number): Promise<User> {
    return this.request(`/users/${userId}`);
  }

  async followUser(userId: number): Promise<{ following: boolean }> {
    return this.request(`/users/${userId}/follow`, {
      method: 'POST',
    });
  }

  async getFollowStatus(userId: number): Promise<{ following: boolean }> {
    return this.request(`/users/${userId}/follow-status`);
  }

  async getUserPosts(userId: number): Promise<Post[]> {
    return this.request(`/users/${userId}/posts`);
  }

  // Study sessions endpoints
  async getStudySessions(): Promise<StudySession[]> {
    return this.request('/study-sessions');
  }

  async createStudySession(sessionData: {
    title: string;
    description?: string;
    date_time: string;
    duration?: number;
    max_participants?: number;
    category?: string;
  }): Promise<StudySession> {
    return this.request('/study-sessions', {
      method: 'POST',
      body: JSON.stringify(sessionData),
    });
  }

  async registerForSession(sessionId: number): Promise<{ registered: boolean; participants: number }> {
    return this.request(`/study-sessions/${sessionId}/register`, {
      method: 'POST',
    });
  }

  async getSessionRegistrationStatus(sessionId: number): Promise<{ registered: boolean }> {
    return this.request(`/study-sessions/${sessionId}/registration-status`);
  }

  async getUserRegisteredSessions(userId: number): Promise<StudySession[]> {
    return this.request(`/users/${userId}/registered-sessions`);
  }
}

export const apiService = new ApiService();
export default apiService;
