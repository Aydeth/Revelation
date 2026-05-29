import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import './ReadBook.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ReadBook() {
  const { id, pageNum } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPageChanging, setIsPageChanging] = useState(false);
  const [currentPage, setCurrentPage] = useState(parseInt(pageNum) || 1);
  const [totalPages, setTotalPages] = useState(0);
  const contentRef = useRef(null);

  // Загрузка страницы
  const fetchPage = useCallback(async (page) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/books/${id}/page/${page}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = response.data;
      setBook(prev => ({ ...prev, ...data }));
      setTotalPages(data.totalPages);
      
      // Скролл в начало после загрузки
      setTimeout(() => {
        if (contentRef.current) {
          contentRef.current.scrollTop = 0;
        }
      }, 0);
    } catch (err) {
      console.error('Ошибка:', err);
      navigate('/');
    } finally {
      setLoading(false);
      setIsPageChanging(false);
    }
  }, [id, navigate]);

  // Загрузка при монтировании
  useEffect(() => {
    setLoading(true);
    fetchPage(currentPage);
    
    document.body.classList.add('read-mode');
    return () => {
      document.body.classList.remove('read-mode');
    };
  }, [currentPage, fetchPage]);

  // Сохранение прогресса
  const saveProgress = async (page) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/books/${id}/progress`, 
        { position: `${page}.0` },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error('Ошибка сохранения:', err);
    }
  };

  // Переход на предыдущую страницу
  const goToPrevPage = () => {
    if (currentPage > 1 && !isPageChanging) {
      setIsPageChanging(true);
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      saveProgress(newPage);
    }
  };

  // Переход на следующую страницу
  const goToNextPage = () => {
    if (currentPage < totalPages && !isPageChanging) {
      setIsPageChanging(true);
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      saveProgress(newPage);
    }
  };

  // Выход
  const handleExit = async () => {
    await saveProgress(currentPage);
    navigate(`/book/${id}`);
  };

  // Сохранение при закрытии
  useEffect(() => {
    const handleBeforeUnload = () => {
      const token = localStorage.getItem('token');
      if (token) {
        const url = `${API_URL}/api/books/${id}/progress`;
        const data = JSON.stringify({ position: `${currentPage}.0` });
        navigator.sendBeacon(url, new Blob([data], { type: 'application/json' }));
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [id, currentPage]);

  // Если ещё нет данных книги, показываем загрузку внутри читалки
  if (loading && !book) {
    return (
      <div className="read-container">
        <div className="read-header">
          <button className="back-btn" onClick={handleExit}>
            <ArrowLeft size={20} />
          </button>
          <div className="read-title">
            <h2>Загрузка...</h2>
          </div>
        </div>
        <div className="read-content loading-content">
          <div className="loader">Загрузка текста...</div>
        </div>
        <div className="read-footer">
          <button className="nav-btn disabled" disabled>
            <ChevronLeft size={20} />
          </button>
          <div className="page-info">-- / --</div>
          <button className="nav-btn disabled" disabled>
            <ChevronRight size={20} />
          </button>
          <button className="settings-btn">
            <Settings size={20} />
          </button>
        </div>
      </div>
    );
  }

  // Если нет книги, ничего не показываем
  if (!book) return null;

  const paragraphs = book.text?.split('\n') || [];

  return (
    <div className="read-container">
      <div className="read-header">
        <button className="back-btn" onClick={handleExit}>
          <ArrowLeft size={20} />
        </button>
        <div className="read-title">
          <h2>{book.title}</h2>
          <p>{book.author}</p>
        </div>
      </div>

      <div className={`read-content ${isPageChanging ? 'fade-out' : ''}`} ref={contentRef}>
        {isPageChanging ? (
          <div className="page-loader">
            <div className="loader">Загрузка страницы...</div>
          </div>
        ) : (
          paragraphs.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))
        )}
      </div>

      <div className="read-footer">
        <button 
          className={`nav-btn ${currentPage === 1 || isPageChanging ? 'disabled' : ''}`}
          onClick={goToPrevPage}
          disabled={currentPage === 1 || isPageChanging}
        >
          <ChevronLeft size={20} />
        </button>
        
        <div className="page-info">
          {currentPage} / {totalPages}
        </div>
        
        <button 
          className={`nav-btn ${currentPage === totalPages || isPageChanging ? 'disabled' : ''}`}
          onClick={goToNextPage}
          disabled={currentPage === totalPages || isPageChanging}
        >
          <ChevronRight size={20} />
        </button>
        
        <button className="settings-btn">
          <Settings size={20} />
        </button>
      </div>
    </div>
  );
}