
import React, { useState, useRef } from 'react';
import './ImageGallery.css';

const ImageGallery = ({ images, productName }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [showZoom, setShowZoom] = useState(false);
  
  const imageRef = useRef(null);
  
  const handleImageHover = (e) => {
    if (!imageRef.current) return;
    
    const { left, top, width, height } = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    
    setZoomPosition({ x, y });
    setShowZoom(true);
  };

  const handleImageLeave = () => {
    setShowZoom(false);
  };
  
  const navigateImage = (direction) => {
    if (direction === 'next') {
      setSelectedImageIndex((prev) => (prev + 1) % images.length);
    } else {
      setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  return (
    <div className="image-gallery-container">
      {/* Left Column: Thumbnails */}
      <div className="thumbnails-column">
        {images.map((image, index) => (
          <div 
            key={index}
            className={`thumbnail ${selectedImageIndex === index ? 'active' : ''}`}
            onClick={() => setSelectedImageIndex(index)}
          >
            <img 
              src={image} 
              alt={`${productName} thumbnail ${index + 1}`}
              className="thumbnail-image"
              loading="lazy"
            />
          </div>
        ))}
      </div>

      {/* Middle Column: Main Image */}
      <div 
        className="main-image-container"
        onMouseMove={handleImageHover}
        onMouseLeave={handleImageLeave}
        ref={imageRef}
      >
        <img 
          src={images[selectedImageIndex]} 
          alt={productName}
          className="main-image"
          loading="lazy"
        />
        
        {/* Navigation Arrows */}
        <button 
          className="image-nav-button prev" 
          onClick={(e) => {
            e.preventDefault();
            navigateImage('prev');
          }}
          aria-label="Previous image"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        
        <button 
          className="image-nav-button next" 
          onClick={(e) => {
            e.preventDefault();
            navigateImage('next');
          }}
          aria-label="Next image"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      {/* Right Column: Zoom View (only visible on hover) */}
      {showZoom && (
        <div className="zoom-view-container">
          <div 
            className="zoom-view"
            style={{
              backgroundImage: `url(${images[selectedImageIndex]})`,
              backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
              backgroundSize: '200%',
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ImageGallery;