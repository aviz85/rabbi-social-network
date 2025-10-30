const request = require('supertest');
const app = require('../server');

describe('API Endpoints', () => {
  let authToken;
  let userId;

  describe('Authentication', () => {
    test('POST /api/auth/register - should register a new user', async () => {
      const userData = {
        name: 'Test Rabbi',
        email: 'test@rabbi.com',
        password: 'password123',
        title: 'Test Rabbi',
        expertise: 'Testing',
        bio: 'Test rabbi for testing purposes'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user.name).toBe(userData.name);
      expect(response.body.user.email).toBe(userData.email);

      authToken = response.body.token;
      userId = response.body.user.id;
    });

    test('POST /api/auth/register - should not register user with existing email', async () => {
      const userData = {
        name: 'Another Rabbi',
        email: 'test@rabbi.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.error).toBe('Email already exists');
    });

    test('POST /api/auth/login - should login with valid credentials', async () => {
      const loginData = {
        email: 'test@rabbi.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe(loginData.email);
    });

    test('POST /api/auth/login - should not login with invalid credentials', async () => {
      const loginData = {
        email: 'test@rabbi.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.error).toBe('Invalid credentials');
    });
  });

  describe('Posts', () => {
    test('GET /api/posts - should get all posts', async () => {
      const response = await request(app)
        .get('/api/posts')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      
      if (response.body.length > 0) {
        expect(response.body[0]).toHaveProperty('id');
        expect(response.body[0]).toHaveProperty('content');
        expect(response.body[0]).toHaveProperty('category');
        expect(response.body[0]).toHaveProperty('author_name');
      }
    });

    test('POST /api/posts - should create a new post with authentication', async () => {
      const postData = {
        content: 'This is a test post from our test rabbi',
        category: 'torah'
      };

      const response = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(postData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.content).toBe(postData.content);
      expect(response.body.category).toBe(postData.category);
    });

    test('POST /api/posts - should not create post without authentication', async () => {
      const postData = {
        content: 'This should not work',
        category: 'torah'
      };

      const response = await request(app)
        .post('/api/posts')
        .send(postData)
        .expect(401);

      expect(response.body.error).toBe('Access token required');
    });

    test('POST /api/posts - should not create post with missing data', async () => {
      const postData = {
        content: 'Missing category'
      };

      const response = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(postData)
        .expect(400);

      expect(response.body.error).toBe('Content and category are required');
    });
  });

  describe('Post Interactions', () => {
    let postId;

    beforeAll(async () => {
      // Get a post ID for testing
      const postsResponse = await request(app).get('/api/posts');
      if (postsResponse.body.length > 0) {
        postId = postsResponse.body[0].id;
      }
    });

    test('POST /api/posts/:id/like - should like a post with authentication', async () => {
      if (!postId) {
        console.log('Skipping like test - no posts available');
        return;
      }

      const response = await request(app)
        .post(`/api/posts/${postId}/like`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('liked');
    });

    test('POST /api/posts/:id/like - should not like post without authentication', async () => {
      if (!postId) {
        console.log('Skipping like test - no posts available');
        return;
      }

      const response = await request(app)
        .post(`/api/posts/${postId}/like`)
        .expect(401);

      expect(response.body.error).toBe('Access token required');
    });

    test('POST /api/posts/:id/comments - should add comment with authentication', async () => {
      if (!postId) {
        console.log('Skipping comment test - no posts available');
        return;
      }

      const commentData = {
        content: 'This is a test comment'
      };

      const response = await request(app)
        .post(`/api/posts/${postId}/comments`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(commentData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.content).toBe(commentData.content);
    });

    test('POST /api/posts/:id/comments - should not add comment without authentication', async () => {
      if (!postId) {
        console.log('Skipping comment test - no posts available');
        return;
      }

      const commentData = {
        content: 'This should not work'
      };

      const response = await request(app)
        .post(`/api/posts/${postId}/comments`)
        .send(commentData)
        .expect(401);

      expect(response.body.error).toBe('Access token required');
    });
  });

  describe('Users', () => {
    test('GET /api/users - should get all users', async () => {
      const response = await request(app)
        .get('/api/users')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      
      if (response.body.length > 0) {
        expect(response.body[0]).toHaveProperty('id');
        expect(response.body[0]).toHaveProperty('name');
        expect(response.body[0]).toHaveProperty('email');
        expect(response.body[0]).not.toHaveProperty('password');
      }
    });

    test('GET /api/users/:id - should get specific user', async () => {
      const response = await request(app)
        .get(`/api/users/${userId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('email');
      expect(response.body).not.toHaveProperty('password');
    });

    test('GET /api/users/:id - should return 404 for non-existent user', async () => {
      const response = await request(app)
        .get('/api/users/99999')
        .expect(404);

      expect(response.body.error).toBe('User not found');
    });
  });

  describe('Study Sessions', () => {
    test('GET /api/study-sessions - should get all study sessions', async () => {
      const response = await request(app)
        .get('/api/study-sessions')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      
      if (response.body.length > 0) {
        expect(response.body[0]).toHaveProperty('id');
        expect(response.body[0]).toHaveProperty('title');
        expect(response.body[0]).toHaveProperty('speaker_name');
      }
    });

    test('POST /api/study-sessions - should create study session with authentication', async () => {
      const sessionData = {
        title: 'Test Study Session',
        description: 'This is a test study session',
        date_time: '2024-12-01T19:00:00',
        duration: 90,
        max_participants: 50,
        category: 'halacha'
      };

      const response = await request(app)
        .post('/api/study-sessions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(sessionData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(sessionData.title);
    });

    test('POST /api/study-sessions - should not create session without authentication', async () => {
      const sessionData = {
        title: 'This should not work'
      };

      const response = await request(app)
        .post('/api/study-sessions')
        .send(sessionData)
        .expect(401);

      expect(response.body.error).toBe('Access token required');
    });
  });

  describe('Error Handling', () => {
    test('Should handle 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/nonexistent')
        .expect(404);
    });

    test('Should handle invalid JSON', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send('invalid json')
        .expect(400);
    });
  });
});
