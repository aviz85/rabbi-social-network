const sqlite3 = require('sqlite3').verbose();

// Global test setup
beforeAll(() => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-jwt-secret';
});

// Clean up after all tests
afterAll(() => {
  // Close any database connections if needed
});
