import React, { useState, useEffect, useCallback } from 'react';
import './Toast.css';

const Toast = ({ message, type, onClose }) => {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    // Wait for animation to finish before calling parent's onClose
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 500); // Must match the slideOut animation duration
  }, [onClose]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        handleClose();
      }, 5000); // Auto-close after 5 seconds

      return () => clearTimeout(timer);
    }
  }, [message, handleClose]);

  if (!message) {
    return null;
  }

  return (
    <div className={`toast toast-${type} ${isClosing ? 'closing' : ''}`}>
      <p>{message}</p>
      <button onClick={handleClose} className="toast-close-btn">&times;</button>
    </div>
  );
};

export default Toast;
