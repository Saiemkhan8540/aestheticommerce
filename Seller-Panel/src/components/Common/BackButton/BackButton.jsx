import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import './BackButton.css';

/**
 * Reusable BackButton component for consistent navigation across the platform.
 * Prioritizes browser history and falls back to a logical parent route.
 */
const BackButton = ({ 
  to, 
  label = "Back", 
  variant = "ghost", 
  className = "",
  showLabel = true 
}) => {
  const navigate = useNavigate();

  const handleBack = (e) => {
    e.preventDefault();
    // Use window.history to check if we can go back safely
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else if (to) {
      navigate(to, { replace: true });
    } else {
      // Ultimate fallback
      navigate('/home', { replace: true });
    }
  };

  return (
    <button 
      onClick={handleBack}
      className={`back-nav-btn variant-${variant} ${className}`}
      aria-label={label}
      type="button"
    >
      <ArrowLeft size={18} className="back-icon" />
      {showLabel && <span className="back-label">{label}</span>}
    </button>
  );
};

export default BackButton;
