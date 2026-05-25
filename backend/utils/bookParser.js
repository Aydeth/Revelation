const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const BOOKS_DIR = path.join(__dirname, '../books');

function parseBookFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Извлекаем метаданные
  const metadataMatch = content.match(/===МЕТАДАННЫЕ===\n([\s\S]*?)\n===КОНЕЦ МЕТАДАННЫХ===\n/);
  if (!metadataMatch) {
    throw new Error('No metadata found in ' + filePath);
  }
  
  const metadata = {};
  metadataMatch[1].split('\n').forEach(line => {
    const [key, value] = line.split(': ');
    if (key && value) {
      metadata[key.trim()] = value.trim();
    }
  });
  
  // Извлекаем текст (без метаданных)
  const text = content.replace(/===МЕТАДАННЫЕ===\n[\s\S]*?\n===КОНЕЦ МЕТАДАННЫХ===\n/, '');
  
  return {
    title: metadata['Название'] || 'Unknown',
    author: metadata['Автор'] || 'Unknown',
    year: parseInt(metadata['Год']) || null,
    cover: metadata['Обложка'] || null,
    text: text,
    fileName: path.basename(filePath)
  };
}

async function syncBooks() {
  // Проверяем, существует ли папка books
  if (!fs.existsSync(BOOKS_DIR)) {
    console.log('❌ Папка books не найдена, создаём...');
    fs.mkdirSync(BOOKS_DIR, { recursive: true });
    return;
  }
  
  const files = fs.readdirSync(BOOKS_DIR).filter(f => f.endsWith('.txt'));
  
  if (files.length === 0) {
    console.log('⚠️ В папке books нет .txt файлов');
    return;
  }
  
  for (const file of files) {
    const filePath = path.join(BOOKS_DIR, file);
    const book = parseBookFile(filePath);
    
    // Проверяем, есть ли книга в БД
    const result = await pool.query('SELECT id FROM books WHERE title = $1', [book.title]);
    
    if (result.rows.length === 0) {
      // Добавляем новую книгу
      await pool.query(`
        INSERT INTO books (title, author, publication_year, cover_url, file_path)
        VALUES ($1, $2, $3, $4, $5)
      `, [book.title, book.author, book.year, book.cover, book.fileName]);
      console.log(`✅ Добавлена книга: ${book.title}`);
    } else {
      console.log(`⏭️ Книга уже существует: ${book.title}`);
    }
  }
}

function getBookText(fileName) {
  const filePath = path.join(BOOKS_DIR, fileName);
  const content = fs.readFileSync(filePath, 'utf-8');
  // Возвращаем только текст без метаданных
  return content.replace(/===МЕТАДАННЫЕ===\n[\s\S]*?\n===КОНЕЦ МЕТАДАННЫХ===\n/, '');
}

module.exports = { syncBooks, getBookText, parseBookFile };