import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ReadBook.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ReadBook() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const contentRef = useRef(null);
  const saveTimeoutRef = useRef(null);
  const restoredRef = useRef(false);
  const scrollListenerRef = useRef(null);

  // Загрузка книги
  useEffect(() => {
    const fetchBook = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/api/books/${id}/read`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBook(response.data);
      } catch (err) {
        console.error('Ошибка:', err);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBook();
    document.body.classList.add('read-mode');
    
    return () => {
      document.body.classList.remove('read-mode');
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [id, navigate]);

  // Восстановление скролла (один раз после рендера)
  useEffect(() => {
    if (!loading && contentRef.current && book && !restoredRef.current) {
      const savedProgress = book.progress || 0;
      
      if (savedProgress > 0) {
        const element = contentRef.current;
        const scrollHeight = element.scrollHeight;
        const clientHeight = element.clientHeight;
        const targetScroll = (savedProgress / 100) * (scrollHeight - clientHeight);
        element.scrollTop = targetScroll;
        console.log(`🔄 Восстановлен скролл: ${savedProgress}%`);
      }
      restoredRef.current = true;
    }
  }, [loading, book]);

  // Сохранение прогресса
  const saveProgress = async (position) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/books/${id}/progress`, 
        { position },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log(`💾 Сохранено: ${position}%`);
    } catch (err) {
      console.error('❌ Ошибка:', err.response?.status);
    }
  };

  // Обработка скролла
  const handleScroll = () => {
    if (!contentRef.current || !restoredRef.current) return;
    
    const element = contentRef.current;
    const scrollHeight = element.scrollHeight;
    const clientHeight = element.clientHeight;
    
    if (scrollHeight <= clientHeight) return;
    
    const scrollPercent = element.scrollTop / (scrollHeight - clientHeight);
    const currentProgress = Math.floor(scrollPercent * 100);
    
    // Сохраняем только если прогресс изменился
    if (currentProgress !== book?.progress) {
      // Обновляем состояние книги
      setBook(prev => ({ ...prev, progress: currentProgress }));
      
      // Сохраняем с задержкой
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        saveProgress(currentProgress);
      }, 1000);
    }
  };

  // Выход
  const handleExit = async () => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    if (book?.progress > 0) {
      await saveProgress(book.progress);
    }
    navigate(`/book/${id}`);
  };

  if (loading) return <div className="loading">Загрузка...</div>;
  if (!book) return null;

  const chapters = book.text?.split(/\n(?=ГЛАВА|ЧАСТЬ)/) || [];

  return (
    <div className="read-container">
      <div className="read-header">
        <button className="back-btn" onClick={handleExit}>
          ← Вернуться
        </button>
        <div className="read-title">
          <h2>{book.title}</h2>
          <p>{book.author}</p>
        </div>
        <div className="progress-indicator">
          {book.progress || 0}%
        </div>
      </div>

      <div className="read-content" ref={contentRef} onScroll={handleScroll}>
        {chapters.map((chapter, index) => {
          const lines = chapter.split('\n');
          const title = lines[0].replace(/^#+\s*/, '').trim();
          const text = lines.slice(1).join('\n');
          return (
            <div key={index} className="chapter">
              {title && <h3 className="chapter-title">{title}</h3>}
              {text.split('\n').map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}