import React from 'react';

const SimpleModal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999
      }}
      onClick={handleBackdropClick}
    >
      <div 
        style={{
          background: '#1a1a1a',
          borderRadius: '12px',
          maxWidth: '600px',
          width: '90%',
          maxHeight: '80vh',
          overflow: 'auto',
          padding: '2rem',
          position: 'relative',
          border: '1px solid #333'
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '15px',
            right: '20px',
            background: 'none',
            border: 'none',
            fontSize: '28px',
            color: '#e50914',
            cursor: 'pointer'
          }}
        >
          ×
        </button>
        <h2 style={{ color: '#e50914', marginBottom: '1rem' }}>{title}</h2>
        <div style={{ color: '#e0e0e0' }}>{children}</div>
      </div>
    </div>
  );
};

export default SimpleModal;