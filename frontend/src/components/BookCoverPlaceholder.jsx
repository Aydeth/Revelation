export default function BookCoverPlaceholder({ title, author, id }) {
  const generateGradient = (seed) => {
    const colors = [
      ['#c9ccff', '#a659ff'],
      ['#ffd4a8', '#ff6b6b'],
      ['#a8e6cf', '#55c7a6'],
      ['#ffb3ba', '#ff6b8a'],
      ['#bae1ff', '#4a9eff'],
      ['#f9e79f', '#f4a460'],
      ['#d5b8ff', '#8b5cf6'],
      ['#ffd1dc', '#ff6f91']
    ];
    
    const index = (id || 0) % colors.length;
    return `linear-gradient(0deg, ${colors[index][0]} 0%, ${colors[index][1]} 100%)`;
  };

  return (
    <div 
      className="book-cover-placeholder"
      style={{
        width: '100%',
        height: '100%',
        background: generateGradient(id || 0),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '8px',
        textAlign: 'center',
        borderRadius: 'inherit'
      }}
    >
      <div 
        className="placeholder-title"
        style={{
          fontSize: '14px',
          fontWeight: '600',
          color: '#1A1A1A',
          lineHeight: 1.3,
          maxHeight: '60%',
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 4,
          WebkitBoxOrient: 'vertical',
          wordBreak: 'break-word'
        }}
      >
        {title}
      </div>
      <div 
        className="placeholder-author"
        style={{
          fontSize: '11px',
          color: 'rgba(0, 0, 0, 0.5)',
          marginTop: '6px',
          maxWidth: '90%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}
      >
        {author}
      </div>
    </div>
  );
}