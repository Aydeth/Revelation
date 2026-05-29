require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Статическая папка для загруженных файлов
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const authRoutes = require('./routes/auth');
const booksRoutes = require('./routes/books');
const uploadRoutes = require('./routes/upload');
const authMiddleware = require('./middleware/auth');

// Публичные маршруты
app.use('/api/auth', authRoutes);

// Защищённые маршруты
app.use('/api/books', authMiddleware, booksRoutes);
app.use('/api/upload', authMiddleware, uploadRoutes);

// Health check
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

// Временный маршрут для миграции
app.get('/api/migrate', async (req, res) => {
  const { Pool } = require('pg');
  const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    await pool.query('ALTER TABLE user_book_status ADD COLUMN IF NOT EXISTS rating INTEGER CHECK (rating >= 1 AND rating <= 5)');
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT');
    res.json({ success: true, message: 'Migration completed' });
  } catch (err) {
    console.error('Migration error:', err);
    res.status(500).json({ error: err.message });
  }
});