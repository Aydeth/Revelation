export default function StarRating({ rating }) {
  const fullStars = Math.floor(rating || 0);
  const emptyStars = 5 - fullStars;
  
  return (
    <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
      {[...Array(fullStars)].map((_, i) => (
        <span key={`full-${i}`} className="star-filled">★</span>
      ))}
      {[...Array(emptyStars)].map((_, i) => (
        <span key={`empty-${i}`} className="star-empty">★</span>
      ))}
    </div>
  );
}