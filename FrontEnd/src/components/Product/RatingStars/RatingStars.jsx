import React from "react";
import "./RatingStars.css";

const RatingStars = ({ rating }) => {
  const fullStars = Math.floor(rating);
  const partial = rating - fullStars;
  const emptyStars = 5 - Math.ceil(rating);

  const StarSVG = ({ fillPercentage = 0, filled = false, index }) => (
    <svg width="16" height="16" viewBox="0 0 24 24" className="star-svg">
      <defs>
        <linearGradient id={`grad-${index}-${fillPercentage}`}>
          <stop offset={`${fillPercentage}%`} stopColor="#f59e0b" />
          <stop offset={`${fillPercentage}%`} stopColor="#d1d5db" />
        </linearGradient>
      </defs>
      <path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        fill={
          filled 
            ? "#f59e0b" 
            : fillPercentage > 0 
              ? `url(#grad-${index}-${fillPercentage})` 
              : "#d1d5db"
        }
        stroke="none"
      />
    </svg>
  );

  return (
    <div className="rating-stars2">
      {/* Full stars */}
      {[...Array(fullStars)].map((_, i) => (
        <StarSVG key={`full-${i}`} filled={true} index={i} />
      ))}
      
      {/* Partial star */}
      {partial > 0 && (
        <StarSVG 
          key="partial" 
          fillPercentage={partial * 100} 
          index="partial" 
        />
      )}
      
      {/* Empty stars */}
      {[...Array(emptyStars)].map((_, i) => (
        <StarSVG key={`empty-${i}`} index={`empty-${i}`} />
      ))}
      
      <span className="ratingstar-number">({rating})</span>
    </div>
  );
};

export default RatingStars;