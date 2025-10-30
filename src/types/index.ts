export interface User {
  id: string;
  name: string;
  title: string;
  yeshiva?: string;
  location?: string;
  bio?: string;
  avatar?: string;
  expertise: string[];
  followers: number;
  following: number;
  joinedAt: Date;
}

export interface Post {
  id: string;
  authorId: string;
  author: User;
  content: string;
  category: 'torah' | 'halacha' | 'chassidus' | 'mussar' | 'general';
  likes: number;
  comments: Comment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  author: User;
  content: string;
  likes: number;
  createdAt: Date;
}

export interface StudySession {
  id: string;
  title: string;
  description: string;
  hostId: string;
  host: User;
  topic: string;
  startTime: Date;
  duration: number;
  participants: string[];
  maxParticipants: number;
}
