import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { Sun, Moon, UserCog, Compass, Library, User } from 'lucide-react';
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
      const version = tg.version || '6.0';
      
      // Проверяем версию перед вызовом методов
      if (tg.isVersionAtLeast('6.1')) {
        if (theme === 'dark') {
          tg.setHeaderColor('#000000');
          tg.setBackgroundColor('#000000');
          tg.setBottomBarColor('#000000');
        } else {
          tg.setHeaderColor('#ffffff');
          tg.setBackgroundColor('#ffffff');
          tg.setBottomBarColor('#ffffff');
        }
      }
      
      tg.expand();
      tg.ready();
    }
  }, [theme, isTelegram]);

  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }

  return (
    <div className="app-wrapper">
      {user ? (
        <>
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
              <Route path="/" element={<Home />} />
              <Route path="/books" element={<AllBooks />} />
              <Route path="/books/tag/:tag" element={<BooksByTag />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/user/:username" element={<Profile />} />
              <Route path="/book/:id" element={<BookPage />} />
              <Route path="/read/:id/:pageNum" element={<ReadBook />} />
              <Route path="/admin" element={user?.is_admin ? <AdminPanel /> : <Navigate to="/" />} />
            </Routes>
          </main>

          <nav className={`app-footer ${isTelegram ? 'telegram-footer' : ''}`}>
            <div className="footer-container">
              <Link to="/" className="footer-link" onMouseDown={createRipple}>
                <Compass size={20} />
                <span>Главная</span>
              </Link>
              <Link to="/books" className="footer-link" onMouseDown={createRipple}>
                <Library size={20} />
                <span>Все книги</span>
              </Link>
              <Link to={`/user/${user.username}`} className="footer-link" onMouseDown={createRipple}>
                <User size={20} />
                <span>Профиль</span>
              </Link>
            </div>
          </nav>
        </>
      ) : (
        <Routes>
          <Route path="/login" element={<LoginRegister />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
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