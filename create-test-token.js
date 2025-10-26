const jwt = require('jsonwebtoken');

// Создаем новый JWT токен
const token = jwt.sign(
  { 
    userId: 2, 
    sessionId: 'test-session-' + Date.now(),
    iat: Math.floor(Date.now() / 1000)
  }, 
  'your-super-secret-jwt-key-here'
);

console.log('New JWT token:', token);
