import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ReadBook.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const CHARS_PER_PAGE = 2000;

export default function ReadBook() {
  const { id, pageNum } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(parseInt(pageNum) || 1);
  const [totalPages, setTotalPages] = useState(0);
  const [scrollPercent, setScrollPercent] = useState(0);
  const contentRef = useRef(null);
  const saveTimeoutRef = useRef(null);
  const restoredRef = useRef(false);

  // Загрузка страницы
  useEffect(() => {
    const fetchPage = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/api/books/${id}/page/${currentPage}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const data = response.data;
        setBook(data);
        setTotalPages(data.totalPages);
        
        // Восстанавливаем позицию на странице
        if (data.savedPage === currentPage && data.savedPercent > 0) {
          setScrollPercent(data.savedPercent);
        } else {
          setScrollPercent(0);
        }
        
      } catch (err) {
        console.error('Ошибка:', err);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPage();
    document.body.classList.add('read-mode');
    
    return () => {
      document.body.classList.remove('read-mode');
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [id, currentPage, navigate]);

  // Восстановление скролла после рендера
  useEffect(() => {
    if (!loading && contentRef.current && !restoredRef.current) {
      if (scrollPercent > 0) {
        const element = contentRef.current;
        const scrollHeight = element.scrollHeight;
        const clientHeight = element.clientHeight;
        const targetScroll = scrollPercent * (scrollHeight - clientHeight);
        element.scrollTop = targetScroll;
        console.log(`🔄 Восстановлен: страница ${currentPage}, позиция ${Math.round(scrollPercent * 100)}%`);
      }
      restoredRef.current = true;
    }
  }, [loading, scrollPercent, currentPage]);

  // Сохранение прогресса
  const saveProgress = async (page, percent) => {
    const positionValue = `${page}.${Math.floor(percent * 100)}`;
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/books/${id}/progress`, 
        { position: positionValue },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log(`💾 Сохранено: страница ${page}, позиция ${Math.floor(percent * 100)}%`);
    } catch (err) {
      console.error('❌ Ошибка:', err.response?.status);
    }
  };

  // Обработка скролла
  const handleScroll = () => {
    if (!contentRef.current) return;
    
    const element = contentRef.current;
    const scrollHeight = element.scrollHeight;
    const clientHeight = element.clientHeight;
    
    if (scrollHeight <= clientHeight) return;
    
    const percent = element.scrollTop / (scrollHeight - clientHeight);
    setScrollPercent(percent);
    
    // Сохраняем с задержкой
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveProgress(currentPage, percent);
    }, 1000);
  };

  // Навигация по страницам
  const goToPrevPage = () => {
    if (currentPage > 1) {
      // Сохраняем прогресс перед уходом
      saveProgress(currentPage, scrollPercent);
      setCurrentPage(currentPage - 1);
      restoredRef.current = false;
      setScrollPercent(0);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      saveProgress(currentPage, scrollPercent);
      setCurrentPage(currentPage + 1);
      restoredRef.current = false;
      setScrollPercent(0);
    }
  };

  // Выход
  const handleExit = async () => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    await saveProgress(currentPage, scrollPercent);
    navigate(`/book/${id}`);
  };

  // Сохранение при закрытии
  useEffect(() => {
    const handleBeforeUnload = () => {
      const positionValue = `${currentPage}.${Math.floor(scrollPercent * 100)}`;
      const token = localStorage.getItem('token');
      if (token) {
        const url = `${API_URL}/api/books/${id}/progress`;
        const data = JSON.stringify({ position: positionValue });
        navigator.sendBeacon(url, new Blob([data], { type: 'application/json' }));
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [id, currentPage, scrollPercent]);

  if (loading) return <div className="loading">Загрузка...</div>;
  if (!book) return null;

  // Разбиваем текст на главы (для отображения)
  const paragraphs = book.text?.split('\n') || [];

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
        <div className="page-indicator">
          {currentPage} / {totalPages}
        </div>
      </div>

      <div className="read-content" ref={contentRef} onScroll={handleScroll}>
        {paragraphs.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>

      <div className="read-footer">
        <button 
          className={`nav-btn ${currentPage === 1 ? 'disabled' : ''}`}
          onClick={goToPrevPage}
          disabled={currentPage === 1}
        >
          ← Назад
        </button>
        
        <div className="page-info">
          {currentPage} / {totalPages}
        </div>
        
        <button 
          className={`nav-btn ${currentPage === totalPages ? 'disabled' : ''}`}
          onClick={goToNextPage}
          disabled={currentPage === totalPages}
        >
          Вперёд →
        </button>
        
        <button className="settings-btn">
          ⚙️
        </button>
      </div>
    </div>
  );
}