import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Feed.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Feed() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingBookId, setPendingBookId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/api/books`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBooks(response.data);
      } catch (err) {
        console.error('Error fetching books:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  // Группировка книг по годам
  const booksByYear = books.reduce((acc, book) => {
    const year = book.publication_year || 'Неизвестно';
    if (!acc[year]) acc[year] = [];
    acc[year].push(book);
    return acc;
  }, {});

  const sortedYears = Object.keys(booksByYear).sort((a, b) => {
    if (a === 'Неизвестно') return 1;
    if (b === 'Неизвестно') return -1;
    return parseInt(b) - parseInt(a);
  });

  const handleMouseDown = (bookId, e) => {
    // Создаём ripple эффект
    const card = e.currentTarget;
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    const rect = card.getBoundingClientRect();
    const size = Math.max(card.clientWidth, card.clientHeight);
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
    
    // Удаляем старые ripple элементы
    const oldRipples = card.querySelectorAll('.ripple');
    oldRipples.forEach(r => r.remove());
    
    card.appendChild(ripple);
    setTimeout(() => ripple.remove(), 500);
    
    setPendingBookId(bookId);
  };

  const handleMouseUp = (bookId) => {
    if (pendingBookId === bookId) {
      navigate(`/book/${bookId}`);
      setPendingBookId(null);
    }
  };

  const handleMouseLeave = () => {
    setPendingBookId(null);
  };

  if (loading) return <div className="loading">Загрузка книг...</div>;

  return (
    <div className="feed-container">
      <div className="feed-header">
        <h1>Библиотека</h1>
      </div>
      
      <div className="books-list">
        {sortedYears.map(year => (
          <div key={year}>
            <div className="year-divider">{year}</div>
            {booksByYear[year].map(book => (
              <div
                key={book.id}
                className="book-card"
                onMouseDown={(e) => handleMouseDown(book.id, e)}
                onMouseUp={() => handleMouseUp(book.id)}
                onMouseLeave={handleMouseLeave}
              >
                <div className="book-cover">
                  {book.cover_url ? (
                    <img src={book.cover_url} alt={book.title} />
                  ) : (
                    <div className="cover-placeholder">{book.title[0]}</div>
                  )}
                </div>
                <div className="book-main">
                  <div className="book-title">{book.title}</div>
                  <div className="book-author">{book.author}</div>
                  <div className="book-rating">
                    <span className="rating-stars">
                      {'★'.repeat(Math.floor(book.rating_avg || 0))}
                      {'☆'.repeat(5 - Math.floor(book.rating_avg || 0))}
                    </span>
                    <span className="rating-value">{book.rating_avg || 'Нет оценок'}</span>
                  </div>
                  <div className="book-date">{book.publication_year}</div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}