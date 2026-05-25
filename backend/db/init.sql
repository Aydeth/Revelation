-- ============================================
-- 1. ОЧИСТКА (удаляем старые данные)
-- ============================================
TRUNCATE TABLE user_book_status CASCADE;
TRUNCATE TABLE books RESTART IDENTITY CASCADE;

-- ============================================
-- 2. СОЗДАНИЕ ТАБЛИЦ (если их нет)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS books (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  description TEXT,
  cover_url TEXT,
  publication_year INTEGER,
  file_url TEXT,
  rating_avg DECIMAL(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_book_status (
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
  status VARCHAR(20) CHECK (status IN ('read', 'reading', 'want_to_read')),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, book_id)
);

-- ============================================
-- 3. НАПОЛНЕНИЕ (добавляем книги)
-- ============================================
INSERT INTO books (title, author, description, publication_year, cover_url) VALUES
  ('Преступление и наказание', 'Фёдор Достоевский', 'Роман о моральных дилеммах и раскаянии студента Родиона Раскольникова.', 1866, 'https://covers.openlibrary.org/b/id/8225959-L.jpg'),
  ('Война и мир', 'Лев Толстой', 'Эпопея о жизни русского общества в эпоху Наполеоновских войск.', 1869, 'https://covers.openlibrary.org/b/id/10548645-L.jpg'),
  ('Анна Каренина', 'Лев Толстой', 'Трагическая история любви замужней женщины и офицера.', 1877, 'https://covers.openlibrary.org/b/id/8225113-L.jpg'),
  ('Мёртвые души', 'Николай Гоголь', 'Сатирическая поэма о чиновнике, скупающем мёртвые крестьянские души.', 1842, 'https://covers.openlibrary.org/b/id/8232991-L.jpg'),
  ('Отцы и дети', 'Иван Тургенев', 'Роман о конфликте поколений и нигилизме.', 1862, 'https://covers.openlibrary.org/b/id/8225945-L.jpg');