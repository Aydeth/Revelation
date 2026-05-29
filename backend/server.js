require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/auth');
const booksRoutes = require('./routes/books');
const authMiddleware = require('./middleware/auth');

// ============================================
// Публичные маршруты (без middleware)
// ============================================
app.post('/api/auth/login', authRoutes);
app.post('/api/auth/register', authRoutes);

// ============================================
// Защищённые маршруты (с middleware)
// ============================================
app.get('/api/auth/me', authMiddleware, authRoutes);
app.put('/api/auth/profile', authMiddleware, authRoutes);
app.use('/api/books', authMiddleware, booksRoutes);

// ============================================
// Health check
// ============================================
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

app.get('/', (req, res) => {
  res.json({ message: 'Book Social API is running' });
});

// Синхронизация книг
const { syncBooks } = require('./utils/bookParser');
syncBooks().catch(console.error);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});