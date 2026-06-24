import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { Sun, Moon, UserCog } from 'lucide-react';
import Home from './pages/Home';
import AllBooks from './pages/AllBooks';
import BooksByTag from './pages/BooksByTag';
import Profile from './pages/Profile';
import LoginRegister from './pages/LoginRegister';
import BookPage from './pages/BookPage';
import ReadBook from './pages/ReadBook';
import AdminPanel from './pages/AdminPanel';
import { useTheme } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';

const createRipple = (event) => {
  const button = event.currentTarget;
  const ripple = document.createElement('span');
  const rect = button.getBoundingClientRect();
  const size = Math.max(button.clientWidth, button.clientHeight);
  
  ripple.classList.add('ripple');
  ripple.style.width = ripple.style.height = `${size}px`;
  ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
  ripple.style.top = `${event.clientY - rect.top - size / 2}px`;
  
  const oldRipples = button.querySelectorAll('.ripple');
  oldRipples.forEach(r => r.remove());
  
  button.appendChild(ripple);
  setTimeout(() => ripple.remove(), 600);
};

function AppContent() {
  const { user, loading, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Определяем, запущено ли приложение в Telegram
  const isTelegram = window.Telegram?.WebApp !== undefined;

  useEffect(() => {
    if (isTelegram) {
      const tg = window.Telegram.WebApp;
      
      // Устанавливаем цвета в зависимости от темы
      if (theme === 'dark') {
        tg.setHeaderColor('#000000');
        tg.setBackgroundColor('#000000');
        tg.setBottomBarColor('#000000');
      } else {
        tg.setHeaderColor('#ffffff');
        tg.setBackgroundColor('#ffffff');
        tg.setBottomBarColor('#ffffff');
      }
      
      // Расширяем приложение на весь экран
      tg.expand();
      
      // Уведомляем, что приложение готово
      tg.ready();
    }
  }, [theme, isTelegram]);

  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }

  return (
    <div className="app-wrapper">
      {user && (
        <>
          {/* Плавающие кнопки в правом верхнем углу */}
          <div className="floating-header">
            <div className="floating-actions">
              <button 
                onClick={toggleTheme} 
                className="theme-toggle-btn-floating" 
                onMouseDown={createRipple}
              >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              </button>
              {user?.is_admin && (
                <Link to="/admin" className="admin-link-floating" onMouseDown={createRipple}>
                  <UserCog size={20} />
                </Link>
              )}
            </div>
          </div>

          <main className="app-main">
            <Routes>
              <Route path="/login" element={<LoginRegister />} />
              <Route path="/" element={user ? <Home /> : <Navigate to="/login" />} />
              <Route path="/books" element={user ? <AllBooks /> : <Navigate to="/login" />} />
              <Route path="/books/tag/:tag" element={user ? <BooksByTag /> : <Navigate to="/login" />} />
              <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
              <Route path="/user/:username" element={user ? <Profile /> : <Navigate to="/login" />} />
              <Route path="/book/:id" element={user ? <BookPage /> : <Navigate to="/login" />} />
              <Route path="/read/:id/:pageNum" element={user ? <ReadBook /> : <Navigate to="/login" />} />
              <Route path="/admin" element={user?.is_admin ? <AdminPanel /> : <Navigate to="/" />} />
            </Routes>
          </main>

          <nav className={`app-footer ${isTelegram ? 'telegram-footer' : ''}`}>
            <div className="footer-container">
              <Link to="/" className="footer-link" onMouseDown={createRipple}>
                <span>Главная</span>
              </Link>
              <Link to="/books" className="footer-link" onMouseDown={createRipple}>
                <span>Все книги</span>
              </Link>
              <Link to={`/user/${user.username}`} className="footer-link" onMouseDown={createRipple}>
                <span>Профиль</span>
              </Link>
            </div>
          </nav>
        </>
      )}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;