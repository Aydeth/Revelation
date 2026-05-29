import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import EditProfileModal from '../components/EditProfileModal';
import './Profile.css';

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

export default function Profile() {
  const { user, logout } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);

  if (!user) return null;

  const shelves = [
    { id: 'reading', name: 'Читаю', count: 0 },
    { id: 'read', name: 'Прочитано', count: 0 },
    { id: 'want_to_read', name: 'Буду читать', count: 0 }
  ];

  const handleLogout = () => {
    logout();
  };

  const handleShelfClick = (shelfId) => {
    console.log('Shelf clicked:', shelfId);
    // TODO: перейти на страницу с книгами этой полки
  };

  const joinedDate = user.created_at 
    ? new Date(user.created_at).toLocaleDateString('ru-RU')
    : 'неизвестно';

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Левая колонка - аватар и кнопки */}
        <div className="profile-left">
          <div className="profile-avatar">
            <img 
              src={user.avatar_url || 'https://via.placeholder.com/240x240?text=Avatar'} 
              alt={user.username}
            />
          </div>
          <div className="profile-username">
            {user.username}
          </div>
          <button 
            className="edit-profile-btn" 
            onClick={() => setShowEditModal(true)}
            onMouseDown={createRipple}
          >
            Редактировать профиль
          </button>
          <button 
            className="logout-btn" 
            onClick={handleLogout}
            onMouseDown={createRipple}
          >
            Выйти
          </button>
        </div>

        {/* Правая колонка - полки */}
        <div className="profile-right">
          <div className="profile-shelves">
            <h2>Мои полки</h2>
            <div className="shelves-list">
              {shelves.map(shelf => (
                <div 
                  key={shelf.id} 
                  className="shelf-card"
                  onClick={() => handleShelfClick(shelf.id)}
                  onMouseDown={createRipple}
                >
                  <div className="shelf-info">
                    <h3>{shelf.name}</h3>
                  </div>
                  <div className="shelf-count">
                    {shelf.count} книг
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showEditModal && (
        <EditProfileModal onClose={() => setShowEditModal(false)} />
      )}
    </div>
  );
}