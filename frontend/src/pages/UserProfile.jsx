import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './UserProfile.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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

export default function UserProfile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedShelf, setSelectedShelf] = useState('reading');
  const [shelfBooks, setShelfBooks] = useState([]);
  const [shelfLoading, setShelfLoading] = useState(false);

  const isOwnProfile = currentUser?.username === username;

  // Загрузка пользователя
  useEffect(() => {
    const fetchUser = async () => {
      try {
        console.log('Fetching user:', username);
        const response = await axios.get(`${API_URL}/api/auth/user/${username}`);
        console.log('User data:', response.data);
        setProfileUser(response.data);
      } catch (err) {
        console.error('User not found:', err);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    
    if (username) {
      fetchUser();
    }
  }, [username, navigate]);

  // Загрузка книг с выбранной полки
  useEffect(() => {
    if (!profileUser) return;
    
    const fetchShelfBooks = async () => {
      setShelfLoading(true);
      try {
        console.log('Fetching shelf:', profileUser.username, selectedShelf);
        const response = await axios.get(`${API_URL}/api/auth/user/${profileUser.username}/shelf/${selectedShelf}`);
        console.log('Shelf books:', response.data);
        setShelfBooks(response.data);
      } catch (err) {
        console.error('Error fetching shelf books:', err);
        setShelfBooks([]);
      } finally {
        setShelfLoading(false);
      }
    };
    
    fetchShelfBooks();
  }, [profileUser, selectedShelf]);

  const shelves = [
    { id: 'reading', name: 'Читаю' },
    { id: 'read', name: 'Прочитано' },
    { id: 'want_to_read', name: 'Буду читать' }
  ];

  if (loading) {
    return <div className="loading">Загрузка профиля...</div>;
  }
  
  if (!profileUser) {
    return <div className="loading">Пользователь не найден</div>;
  }

  return (
    <div className="user-profile-page">
      <div className="user-profile-container">
        {/* Левая колонка - аватар и ник */}
        <div className="user-profile-left">
          <div className="user-profile-avatar">
            <img 
              src={profileUser.avatar_url || 'https://via.placeholder.com/240x240?text=Avatar'} 
              alt={profileUser.username}
            />
          </div>
          <div className="user-profile-username">
            {profileUser.username}
          </div>
          <div className="user-profile-joined">
            Присоединился: {new Date(profileUser.created_at).toLocaleDateString('ru-RU')}
          </div>
        </div>

        {/* Правая колонка - полки */}
        <div className="user-profile-right">
          <div className="user-profile-shelves">
            <div className="shelves-tabs">
              {shelves.map(shelf => (
                <button
                  key={shelf.id}
                  className={`shelf-tab ${selectedShelf === shelf.id ? 'active' : ''}`}
                  onClick={() => setSelectedShelf(shelf.id)}
                  onMouseDown={createRipple}
                >
                  {shelf.name}
                </button>
              ))}
            </div>
            
            <div className="shelf-books-list">
              {shelfLoading ? (
                <div className="empty-shelf">Загрузка...</div>
              ) : shelfBooks.length === 0 ? (
                <div className="empty-shelf">
                  Нет книг на этой полке
                </div>
              ) : (
                shelfBooks.map(book => (
                  <Link 
                    to={`/book/${book.id}`} 
                    key={book.id}
                    className="shelf-book-card"
                    onMouseDown={createRipple}
                  >
                    <div className="shelf-book-cover">
                      <img 
                        src={book.cover_url || 'https://via.placeholder.com/60x90?text=No+Cover'} 
                        alt={book.title}
                      />
                    </div>
                    <div className="shelf-book-info">
                      <h4>{book.title}</h4>
                      <p>{book.author}</p>
                      <span className="shelf-book-year">{book.publication_year}</span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}