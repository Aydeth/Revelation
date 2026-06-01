const express = require('express');
const { Pool } = require('pg');
const router = express.Router();

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false }
});

// Middleware для проверки прав администратора
const isAdmin = async (req, res, next) => {
  const userId = req.userId;
  
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    const result = await pool.query('SELECT is_admin FROM users WHERE id = $1', [userId]);
    if (!result.rows[0]?.is_admin) {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
    next();
  } catch (err) {
    console.error('Admin check error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ============================================
// АДМИН-МАРШРУТЫ ДЛЯ КНИГ
// ============================================

// Создать книгу
router.post('/books', async (req, res) => {
  const { title, author, description, publication_year, cover_url, file_url, tags } = req.body;
  
  if (!title || !author) {
    return res.status(400).json({ error: 'Title and author are required' });
  }
  
  try {
    const result = await pool.query(`
      INSERT INTO books (title, author, description, publication_year, cover_url, file_path, tags)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [title, author, description, publication_year, cover_url, file_url, tags]);
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error creating book:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Обновить книгу
router.put('/books/:id', async (req, res) => {
  const { id } = req.params;
  const { title, author, description, publication_year, cover_url, file_url, tags } = req.body;
  
  try {
    const result = await pool.query(`
      UPDATE books 
      SET title = $1, author = $2, description = $3, publication_year = $4, cover_url = $5, file_path = $6, tags = $7
      WHERE id = $8
      RETURNING *
    `, [title, author, description, publication_year, cover_url, file_url, tags, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating book:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Удалить книгу
router.delete('/books/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    // Удаляем связанные отзывы и статусы
    await pool.query('DELETE FROM reviews WHERE book_id = $1', [id]);
    await pool.query('DELETE FROM user_book_status WHERE book_id = $1', [id]);
    await pool.query('DELETE FROM books WHERE id = $1', [id]);
    
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting book:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;