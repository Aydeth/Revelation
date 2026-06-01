-- ============================================
-- 1. ПРИНУДИТЕЛЬНАЯ ОЧИСТКА (удаляем ВСЕ таблицы)
-- ============================================
-- DROP TABLE IF EXISTS user_book_status CASCADE;
-- DROP TABLE IF EXISTS reviews CASCADE;
-- DROP TABLE IF EXISTS books CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;

-- ============================================
-- 2. СОЗДАНИЕ ТАБЛИЦ ЗАНОВО
-- ============================================

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE books (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  description TEXT,
  cover_url TEXT,
  publication_year INTEGER,
  file_path VARCHAR(255),
  tags TEXT,
  rating_avg DECIMAL(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_book_status (
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
  status VARCHAR(20) CHECK (status IN ('read', 'reading', 'want_to_read')),
  last_read_position DECIMAL(5,2) DEFAULT 0,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, book_id)
);

CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);