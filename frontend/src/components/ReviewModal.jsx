import { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import './ReviewModal.css';

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

const StarRatingInput = ({ rating, onRatingChange }) => {
  const [hoverRating, setHoverRating] = useState(0);
  
  return (
    <div className="review-star-input">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          className="review-star-btn"
          onClick={() => onRatingChange(star)}
          onMouseEnter={() => setHoverRating(star)}
          onMouseLeave={() => setHoverRating(0)}
        >
          <span style={{ color: (hoverRating || rating) >= star ? '#F1C40F' : '#DFE2ED' }}>
            ★
          </span>
        </button>
      ))}
    </div>
  );
};

export default function ReviewModal({ onClose, onSubmit, loading, existingReview }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const isEdit = !!existingReview;

  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating || 0);
      setComment(existingReview.comment || '');
    } else {
      setRating(0);
      setComment('');
    }
  }, [existingReview]);

  const handleSubmit = () => {
    if (rating === 0) {
      alert('Пожалуйста, поставьте оценку');
      return;
    }
    onSubmit(rating, comment);
  };

  return (
    <div className="review-modal-overlay" onClick={onClose}>
      <div className="review-modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="review-modal-header">
          <h3>{isEdit ? 'Изменить отзыв' : 'Написать отзыв'}</h3>
          <button className="review-close-btn" onClick={onClose} onMouseDown={createRipple}>
            <X size={20} />
          </button>
        </div>

        <div className="review-modal-body">
          <div className="review-rating-section">
            <label>Ваша оценка</label>
            <StarRatingInput rating={rating} onRatingChange={setRating} />
          </div>

          <div className="review-comment-section">
            <label>Комментарий</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Поделитесь впечатлениями о книге..."
              rows={4}
            />
          </div>
        </div>

        <div className="review-modal-footer">
          <button 
            className="review-cancel-btn" 
            onClick={onClose}
            onMouseDown={createRipple}
          >
            Отмена
          </button>
          <button 
            className="review-submit-btn" 
            onClick={handleSubmit}
            disabled={loading}
            onMouseDown={createRipple}
          >
            <Check size={16} />
            {loading ? 'Сохранение...' : (isEdit ? 'Сохранить' : 'Опубликовать')}
          </button>
        </div>
      </div>
    </div>
  );
}