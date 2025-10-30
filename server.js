const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const db = new sqlite3.Database('./rabbis.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
    initializeDatabase();
  }
});

// Initialize database tables
function initializeDatabase() {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    title TEXT,
    expertise TEXT,
    bio TEXT,
    avatar TEXT,
    followers INTEGER DEFAULT 0,
    following INTEGER DEFAULT 0,
    posts_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Posts table
  db.run(`CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL,
    likes INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // Comments table
  db.run(`CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts (id),
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // Likes table
  db.run(`CREATE TABLE IF NOT EXISTS likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts (id),
    FOREIGN KEY (user_id) REFERENCES users (id),
    UNIQUE(post_id, user_id)
  )`);

  // Follows table
  db.run(`CREATE TABLE IF NOT EXISTS follows (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    follower_id INTEGER NOT NULL,
    following_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (follower_id) REFERENCES users (id),
    FOREIGN KEY (following_id) REFERENCES users (id),
    UNIQUE(follower_id, following_id)
  )`);

  // Session registrations table
  db.run(`CREATE TABLE IF NOT EXISTS session_registrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES study_sessions (id),
    FOREIGN KEY (user_id) REFERENCES users (id),
    UNIQUE(session_id, user_id)
  )`);

  // Study sessions table
  db.run(`CREATE TABLE IF NOT EXISTS study_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    speaker_id INTEGER NOT NULL,
    date_time DATETIME NOT NULL,
    duration INTEGER,
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,
    category TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (speaker_id) REFERENCES users (id)
  )`);

  // Insert sample data
  insertSampleData();
}

// Insert sample data
function insertSampleData() {
  // Check if data already exists
  db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
    if (err || row.count > 0) return;

    // Sample users
    const users = [
      ['הרב ישראל מאיר לאו', 'rabbi.lau@example.com', 'password123', 'הרב הראשי לישראל', 'הלכה', 'רב ראשי ודיין, מחבר ספרים רבים', 'י', 1500, 50, 247],
      ['הרב דוד לאו', 'rabbi.david@example.com', 'password123', 'ראש ישיבה', 'תורה', 'ראש ישיבת תפארת ירושלים', 'ד', 800, 30, 156],
      ['הרב שלמה משה עמאר', 'rabbi.amar@example.com', 'password123', 'הראשון לציון', 'הלכה', 'הראשון לציון והרב הראשי לישראל לשעבר', 'ש', 1200, 40, 189],
      ['הרב יצחק יוסף', 'rabbi.yosef@example.com', 'password123', 'הרב הראשי לישראל', 'הלכה', 'הרב הראשי לישראל וראש מועצת הרבנות הראשית', 'י', 2000, 60, 312],
      ['הרב יעקב שאגא', 'rabbi.shaga@example.com', 'password123', 'דיין', 'מוסר', 'דיין בבית הדין הרבני הגדול', 'י', 600, 25, 98]
    ];

    const insertUser = db.prepare("INSERT INTO users (name, email, password, title, expertise, bio, avatar, followers, following, posts_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    
    users.forEach(user => {
      insertUser.run(user);
    });
    insertUser.finalize();

    // Sample posts
    setTimeout(() => {
      const posts = [
        [1, 'בשעה טובה! היום נדון בנושא החשוב של הלכות שבת בעולם המודרני. כיצד אנו מתמודדים עם אתגרים טכנולוגיים תוך שמירה על קדושת השבת? מוזמנים לשתף את דעתכם וחוויות אישיות.', 'halacha', 45, 12],
        [2, 'שיעור חדש בפרשת השבוע: פרשת וישלח. נלמד על כוחה של התפילה והמשמעות העמוקה של המאבק בין יעקב למלאך. השיעור יתקיים היום בשעה 19:00 בישיבה.', 'torah', 32, 8],
        [3, 'שאלה לדיון: מהי הגישה הנכונה ללימוד מוסר בדורנו? האם עלינו להדגיש את הפחד מהעונש או את האהבה למצוות? אשמח לשמוע דעות שונות מהרבנים והתלמידים.', 'mussar', 28, 15],
        [4, 'התרגשות גדולה! הספר החדש שלי "שולחן ערוך המודרני" יוצא לאור השבוע. הספר עוסק ביישום הלכות השולחן ערוך בחיים העכשוויים, עם דוגמאות והנחיות מעשיות.', 'halacha', 67, 23],
        [5, 'מחשבה ליום: התורה אינה רק ספר לימוד, אלא דרך חיים. כל יום מציב בפנינו הזדמנות חדשה לגדול ולהתקרב לבורא עולם דרך לימוד ומעשים טובים.', 'chassidus', 41, 9]
      ];

      const insertPost = db.prepare("INSERT INTO posts (user_id, content, category, likes, comments_count) VALUES (?, ?, ?, ?, ?)");
      
      posts.forEach(post => {
        insertPost.run(post);
      });
      insertPost.finalize();
    }, 1000);
  });
}

// JWT middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
}

// Routes

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, title, expertise, bio } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    db.run(
      'INSERT INTO users (name, email, password, title, expertise, bio) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, title, expertise, bio],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Email already exists' });
          }
          return res.status(500).json({ error: 'Database error' });
        }

        const token = jwt.sign({ id: this.lastID, email }, process.env.JWT_SECRET || 'your-secret-key');
        res.status(201).json({ token, user: { id: this.lastID, name, email, title, expertise } });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'your-secret-key');
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, title: user.title, expertise: user.expertise } });
  });
});

// Posts routes
app.get('/api/posts', (req, res) => {
  const query = `
    SELECT p.*, u.name as author_name, u.title as author_title, u.avatar as author_avatar
    FROM posts p
    JOIN users u ON p.user_id = u.id
    ORDER BY p.created_at DESC
  `;

  db.all(query, [], (err, posts) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    // Get comments for each post
    const postsWithComments = posts.map(post => {
      return new Promise((resolve) => {
        db.all(
          'SELECT c.*, u.name as author_name, u.avatar as author_avatar FROM comments c JOIN users u ON c.user_id = u.id WHERE c.post_id = ? ORDER BY c.created_at ASC',
          [post.id],
          (err, comments) => {
            resolve({ ...post, comments: comments || [] });
          }
        );
      });
    });

    Promise.all(postsWithComments).then(results => {
      res.json(results);
    });
  });
});

app.post('/api/posts', authenticateToken, (req, res) => {
  const { content, category } = req.body;
  const userId = req.user.id;

  if (!content || !category) {
    return res.status(400).json({ error: 'Content and category are required' });
  }

  db.run(
    'INSERT INTO posts (user_id, content, category) VALUES (?, ?, ?)',
    [userId, content, category],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      // Update user's posts count
      db.run('UPDATE users SET posts_count = posts_count + 1 WHERE id = ?', [userId]);

      res.status(201).json({ id: this.lastID, content, category, user_id: userId });
    }
  );
});

app.post('/api/posts/:id/like', authenticateToken, (req, res) => {
  const postId = req.params.id;
  const userId = req.user.id;

  db.run(
    'INSERT OR IGNORE INTO likes (post_id, user_id) VALUES (?, ?)',
    [postId, userId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (this.changes === 0) {
        // Unlike
        db.run('DELETE FROM likes WHERE post_id = ? AND user_id = ?', [postId, userId]);
        db.run('UPDATE posts SET likes = likes - 1 WHERE id = ?', [postId]);
        res.json({ liked: false });
      } else {
        // Like
        db.run('UPDATE posts SET likes = likes + 1 WHERE id = ?', [postId]);
        res.json({ liked: true });
      }
    }
  );
});

app.post('/api/posts/:id/comments', authenticateToken, (req, res) => {
  const postId = req.params.id;
  const { content } = req.body;
  const userId = req.user.id;

  if (!content) {
    return res.status(400).json({ error: 'Content is required' });
  }

  db.run(
    'INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)',
    [postId, userId, content],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      // Update post's comments count
      db.run('UPDATE posts SET comments_count = comments_count + 1 WHERE id = ?', [postId]);

      res.status(201).json({ id: this.lastID, content, post_id: postId, user_id: userId });
    }
  );
});

// Users routes
app.get('/api/users', (req, res) => {
  db.all('SELECT id, name, email, title, expertise, bio, avatar, followers, following, posts_count FROM users ORDER BY followers DESC', [], (err, users) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(users);
  });
});

app.get('/api/users/:id', (req, res) => {
  const userId = req.params.id;

  db.get(
    'SELECT id, name, email, title, expertise, bio, avatar, followers, following, posts_count FROM users WHERE id = ?',
    [userId],
    (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    }
  );
});

// Study sessions routes
app.get('/api/study-sessions', (req, res) => {
  const query = `
    SELECT ss.*, u.name as speaker_name, u.title as speaker_title
    FROM study_sessions ss
    JOIN users u ON ss.speaker_id = u.id
    ORDER BY ss.date_time ASC
  `;

  db.all(query, [], (err, sessions) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(sessions);
  });
});

app.post('/api/study-sessions', authenticateToken, (req, res) => {
  const { title, description, date_time, duration, max_participants, category } = req.body;
  const speakerId = req.user.id;

  if (!title || !date_time) {
    return res.status(400).json({ error: 'Title and date_time are required' });
  }

  db.run(
    'INSERT INTO study_sessions (title, description, speaker_id, date_time, duration, max_participants, category) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [title, description, speakerId, date_time, duration, max_participants, category],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.status(201).json({ id: this.lastID, title, description, speaker_id: speakerId, date_time, duration, max_participants, category });
    }
  );
});

// Follow/Unfollow routes
app.post('/api/users/:id/follow', authenticateToken, (req, res) => {
  const userIdToFollow = req.params.id;
  const currentUserId = req.user.id;

  if (userIdToFollow === currentUserId.toString()) {
    return res.status(400).json({ error: 'Cannot follow yourself' });
  }

  db.run(
    'INSERT OR IGNORE INTO follows (follower_id, following_id) VALUES (?, ?)',
    [currentUserId, userIdToFollow],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (this.changes === 0) {
        // Unfollow
        db.run('DELETE FROM follows WHERE follower_id = ? AND following_id = ?', [currentUserId, userIdToFollow]);
        
        // Update follower counts
        db.run('UPDATE users SET followers = followers - 1 WHERE id = ?', [userIdToFollow]);
        db.run('UPDATE users SET following = following - 1 WHERE id = ?', [currentUserId]);
        
        res.json({ following: false });
      } else {
        // Follow
        db.run('UPDATE users SET followers = followers + 1 WHERE id = ?', [userIdToFollow]);
        db.run('UPDATE users SET following = following + 1 WHERE id = ?', [currentUserId]);
        
        res.json({ following: true });
      }
    }
  );
});

// Get follow status
app.get('/api/users/:id/follow-status', authenticateToken, (req, res) => {
  const userIdToCheck = req.params.id;
  const currentUserId = req.user.id;

  db.get(
    'SELECT * FROM follows WHERE follower_id = ? AND following_id = ?',
    [currentUserId, userIdToCheck],
    (err, follow) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ following: !!follow });
    }
  );
});

// Get user's posts
app.get('/api/users/:id/posts', (req, res) => {
  const userId = req.params.id;
  
  const query = `
    SELECT p.*, u.name as author_name, u.title as author_title, u.avatar as author_avatar
    FROM posts p
    JOIN users u ON p.user_id = u.id
    WHERE p.user_id = ?
    ORDER BY p.created_at DESC
  `;

  db.all(query, [userId], (err, posts) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    // Get comments for each post
    const postsWithComments = posts.map(post => {
      return new Promise((resolve) => {
        db.all(
          'SELECT c.*, u.name as author_name, u.avatar as author_avatar FROM comments c JOIN users u ON c.user_id = u.id WHERE c.post_id = ? ORDER BY c.created_at ASC',
          [post.id],
          (err, comments) => {
            resolve({ ...post, comments: comments || [] });
          }
        );
      });
    });

    Promise.all(postsWithComments).then(results => {
      res.json(results);
    });
  });
});

// Session registration routes
app.post('/api/study-sessions/:id/register', authenticateToken, (req, res) => {
  const sessionId = req.params.id;
  const userId = req.user.id;

  // Check if session exists and has space
  db.get('SELECT * FROM study_sessions WHERE id = ?', [sessionId], (err, session) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    if (session.current_participants >= session.max_participants) {
      return res.status(400).json({ error: 'Session is full' });
    }

    // Register or unregister
    db.run(
      'INSERT OR IGNORE INTO session_registrations (session_id, user_id) VALUES (?, ?)',
      [sessionId, userId],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        if (this.changes === 0) {
          // Unregister
          db.run('DELETE FROM session_registrations WHERE session_id = ? AND user_id = ?', [sessionId, userId]);
          db.run('UPDATE study_sessions SET current_participants = current_participants - 1 WHERE id = ?', [sessionId]);
          res.json({ registered: false, participants: session.current_participants - 1 });
        } else {
          // Register
          db.run('UPDATE study_sessions SET current_participants = current_participants + 1 WHERE id = ?', [sessionId]);
          res.json({ registered: true, participants: session.current_participants + 1 });
        }
      }
    );
  });
});

// Get registration status
app.get('/api/study-sessions/:id/registration-status', authenticateToken, (req, res) => {
  const sessionId = req.params.id;
  const userId = req.user.id;

  db.get(
    'SELECT * FROM session_registrations WHERE session_id = ? AND user_id = ?',
    [sessionId, userId],
    (err, registration) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ registered: !!registration });
    }
  );
});

// Get user's registered sessions
app.get('/api/users/:id/registered-sessions', authenticateToken, (req, res) => {
  const userId = req.params.id;

  const query = `
    SELECT ss.*, u.name as speaker_name, u.title as speaker_title
    FROM study_sessions ss
    JOIN users u ON ss.speaker_id = u.id
    JOIN session_registrations sr ON ss.id = sr.session_id
    WHERE sr.user_id = ?
    ORDER BY ss.date_time ASC
  `;

  db.all(query, [userId], (err, sessions) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(sessions);
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
