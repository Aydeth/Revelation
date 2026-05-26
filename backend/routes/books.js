const express = require('express');
const { Pool } = require('pg');
const { getBookText } = require('../utils/bookParser');
const router = express.Router();

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const CHARS_PER_PAGE = 2000; // Количество символов на страницу

// ============================================
// 1. ПОЛУЧИТЬ ВСЕ КНИГИ (для ленты)
// ============================================
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, title, author, cover_url, rating_avg, publication_year 
      FROM books 
      ORDER BY id
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching books:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// 2. ПОЛУЧИТЬ КНИГУ ПО ID (без текста)
// ============================================
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`
      SELECT id, title, author, description, cover_url, publication_year, rating_avg, rating_count 
      FROM books 
      WHERE id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching book:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// 3. ПОЛУЧИТЬ СТРАНИЦУ КНИГИ (с разбивкой)
// ============================================
router.get('/:id/page/:pageNum', async (req, res) => {
  const { id, pageNum } = req.params;
  const userId = req.user?.userId;
  const pageNumber = parseInt(pageNum);
  
  try {
    // Получаем информацию о книге
    const bookResult = await pool.query(`
      SELECT title, author, file_path 
      FROM books 
      WHERE id = $1
    `, [id]);
    
    if (bookResult.rows.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }
    
    const book = bookResult.rows[0];
    const fullText = getBookText(book.file_path);
    
    // Разбиваем текст на страницы
    const totalChars = fullText.length;
    const totalPages = Math.ceil(totalChars / CHARS_PER_PAGE);
    
    // Проверяем, что страница существует
    if (pageNumber < 1 || pageNumber > totalPages) {
      return res.status(404).json({ error: 'Page not found' });
    }
    
    // Вырезаем нужную страницу
    const start = (pageNumber - 1) * CHARS_PER_PAGE;
    const end = Math.min(start + CHARS_PER_PAGE, totalChars);
    const pageText = fullText.substring(start, end);
    
    // Получаем прогресс пользователя
    let savedPage = 1;
    let savedPercent = 0;
    
    if (userId) {
      const progressResult = await pool.query(`
        SELECT last_read_position 
        FROM user_book_status 
        WHERE user_id = $1 AND book_id = $2
      `, [userId, id]);
      
      if (progressResult.rows[0] && progressResult.rows[0].last_read_position) {
        const rawProgress = progressResult.rows[0].last_read_position;
        // Прогресс хранится как "страница.процент" (например "3.45")
        const progressStr = String(rawProgress);
        const parts = progressStr.split('.');
        savedPage = parseInt(parts[0]) || 1;
        savedPercent = parts[1] ? parseFloat(`0.${parts[1]}`) : 0;
      }
    }
    
    res.json({
      id: parseInt(id),
      title: book.title,
      author: book.author,
      pageNumber: pageNumber,
      totalPages: totalPages,
      text: pageText,
      savedPage: savedPage,
      savedPercent: savedPercent
    });
  } catch (err) {
    console.error('Error fetching page:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// 4. СОХРАНИТЬ ПРОГРЕСС ЧТЕНИЯ (страница.процент)
// ============================================
router.post('/:id/progress', async (req, res) => {
  const { id } = req.params;
  const { position } = req.body;
  const userId = req.user?.userId;
  
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // Проверяем формат позиции (должен быть "страница.процент")
  if (!position || typeof position !== 'string') {
    return res.status(400).json({ error: 'Invalid position format' });
  }
  
  try {
    await pool.query(`
      INSERT INTO user_book_status (user_id, book_id, last_read_position, updated_at, status)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP, 'reading')
      ON CONFLICT (user_id, book_id) 
      DO UPDATE SET last_read_position = $3, updated_at = CURRENT_TIMESTAMP, status = 'reading'
    `, [userId, id, position]);
    
    res.json({ success: true, progress: position });
  } catch (err) {
    console.error('Error saving progress:', err);
    res.status(500).json({ error: 'Database error: ' + err.message });
  }
});

// ============================================
// 5. УСТАНОВИТЬ СТАТУС КНИГИ (read/reading/want_to_read)
// ============================================
router.post('/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const userId = req.user?.userId;
  
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  if (!status || !['read', 'reading', 'want_to_read'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  
  try {
    await pool.query(`
      INSERT INTO user_book_status (user_id, book_id, status, updated_at)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id, book_id) 
      DO UPDATE SET status = $3, updated_at = CURRENT_TIMESTAMP
    `, [userId, id, status]);
    
    res.json({ success: true });
  } catch (err) {
    console.error('Error saving status:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// 6. ПОЛУЧИТЬ ПРОГРЕСС КНИГИ ДЛЯ ПОЛЬЗОВАТЕЛЯ
// ============================================
router.get('/:id/progress', async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.userId;
  
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    const result = await pool.query(`
      SELECT last_read_position 
      FROM user_book_status 
      WHERE user_id = $1 AND book_id = $2
    `, [userId, id]);
    
    const progress = result.rows[0]?.last_read_position || '1.0';
    res.json({ progress: progress });
  } catch (err) {
    console.error('Error fetching progress:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;