import React, { useState, useEffect } from "react";
import RatingStars from "../../Product/RatingStars/RatingStars.jsx";
import { FaThumbsUp } from "react-icons/fa6";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "../../../Images/img_png.png";
import "./ReviewCard.css";
import { useDispatch, useSelector } from "react-redux";
import { markHelpful } from "../../../Redux/reviewsSlice";

const ReviewCard = ({ review, allReviews = [] }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedReviewIndex, setSelectedReviewIndex] = useState(0);
  const dispatch = useDispatch();
  const { user, token } = useSelector((s) => s.user);
  
  // Fix: Handle both _id and id for review identification
  const reviewId = review?._id || review?.id;
  const [helpfulCount, setHelpfulCount] = useState(
    typeof review?.helpfulCount === 'number' ? review.helpfulCount : 0
  );

  // Update helpfulCount when review prop changes
  useEffect(() => {
    if (typeof review?.helpfulCount === 'number') {
      setHelpfulCount(review.helpfulCount);
    }
  }, [review?.helpfulCount]);
  
  const [hasVoted, setHasVoted] = useState(false);

  const safeReview = {
    id: reviewId,
    name: review?.name || "Anonymous",
    avatar: review?.avatar || "",
    rating: Number(review?.rating ?? 0) || 0,
    date: review?.date || new Date().toISOString(),
    text: (typeof review?.text === 'string' ? review.text : '') || '',
    images: Array.isArray(review?.images) ? review.images : [],
  };

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return isNaN(d.getTime())
      ? 'N/A'
      : d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const shouldTruncate = safeReview.text.length > 200;
  const displayText = isExpanded || !shouldTruncate ? safeReview.text : safeReview.text.substring(0, 200) + "...";

  const handleHelpful = async () => {
    if (hasVoted) return;
    if (!user || !token) return;
    
    console.log('Helpful button clicked:', {
      reviewId,
      productId: review?.productId || review?.product,
      currentHelpfulCount: helpfulCount,
      user: user._id
    });

    try {
      // Fix: Use the correct reviewId and get productId from the review context
      const res = await dispatch(markHelpful({ 
        productId: review?.productId || review?.product, 
        reviewId: reviewId 
      })).unwrap();
      
      console.log('Helpful response:', res);
      
      if (typeof res?.helpfulCount === 'number') {
        setHelpfulCount(res.helpfulCount);
        setHasVoted(true);
      }
    } catch (e) {
      console.error('Failed to mark helpful:', e);
      // no-op UI
    }
  };

  const handleImageClick = (index, reviewIndex) => {
    setSelectedImageIndex(index);
    setSelectedReviewIndex(reviewIndex);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
  };

  // Fixed image navigation - similar to ProductDetails implementation
  const navigateImage = (direction) => {
    // Collect all images from all reviews
    const allImages = [];
    allReviews.forEach((reviewItem, reviewIdx) => {
      if (reviewItem?.images && Array.isArray(reviewItem.images) && reviewItem.images.length > 0) {
        reviewItem.images.forEach((image, imageIdx) => {
          allImages.push({
            reviewIndex: reviewIdx,
            imageIndex: imageIdx,
            image: image
          });
        });
      }
    });

    console.log('Navigation debug:', {
      direction,
      allImages: allImages.length,
      currentReviewIndex: selectedReviewIndex,
      currentImageIndex: selectedImageIndex,
      allReviews: allReviews.map(r => ({ 
        id: r.id, 
        images: r.images?.length || 0 
      }))
    });

    if (allImages.length === 0) return;

    // Find current position in global image array
    const currentGlobalIndex = allImages.findIndex(
      item => item.reviewIndex === selectedReviewIndex && item.imageIndex === selectedImageIndex
    );

    console.log('Current global index:', currentGlobalIndex);

    if (currentGlobalIndex === -1) return;

    let nextGlobalIndex;
    if (direction === 'next') {
      nextGlobalIndex = (currentGlobalIndex + 1) % allImages.length;
    } else {
      nextGlobalIndex = (currentGlobalIndex - 1 + allImages.length) % allImages.length;
    }

    const nextImage = allImages[nextGlobalIndex];
    console.log('Next image:', nextImage);
    
    setSelectedReviewIndex(nextImage.reviewIndex);
    setSelectedImageIndex(nextImage.imageIndex);
  };

  // Calculate navigation button states
  const getNavigationState = () => {
    // Count total images across all reviews
    const totalImages = allReviews.reduce((sum, reviewItem) => {
      return sum + (Array.isArray(reviewItem?.images) ? reviewItem.images.length : 0);
    }, 0);

    console.log('Navigation state debug:', {
      totalImages,
      selectedReviewIndex,
      selectedImageIndex,
      allReviews: allReviews.map(r => ({ 
        id: r.id, 
        images: r.images?.length || 0 
      }))
    });

    if (totalImages === 0) return { canGoLeft: false, canGoRight: false };

    // Find current global position
    let currentGlobalIndex = 0;
    for (let i = 0; i <= selectedReviewIndex; i++) {
      const reviewItem = allReviews[i];
      const images = Array.isArray(reviewItem?.images) ? reviewItem.images : [];
      if (i === selectedReviewIndex) {
        currentGlobalIndex += selectedImageIndex;
        break;
      }
      currentGlobalIndex += images.length;
    }

    const canGoLeft = currentGlobalIndex > 0;
    const canGoRight = currentGlobalIndex < totalImages - 1;

    console.log('Navigation state result:', {
      currentGlobalIndex,
      totalImages,
      canGoLeft,
      canGoRight
    });

    return { canGoLeft, canGoRight };
  };

  const { canGoLeft, canGoRight } = getNavigationState();

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      closeImageModal();
    } else if (e.key === 'ArrowLeft') {
      navigateImage('prev');
    } else if (e.key === 'ArrowRight') {
      navigateImage('next');
    }
  };

  // Get current image info for display
  const getCurrentImageInfo = () => {
    const allImages = [];
    allReviews.forEach((reviewItem) => {
      if (reviewItem?.images && Array.isArray(reviewItem.images)) {
        reviewItem.images.forEach((image) => {
          allImages.push(image);
        });
      }
    });

    // Calculate current position
    let currentGlobalIndex = 0;
    for (let i = 0; i <= selectedReviewIndex; i++) {
      const reviewItem = allReviews[i];
      const images = Array.isArray(reviewItem?.images) ? reviewItem.images : [];
      if (i === selectedReviewIndex) {
        currentGlobalIndex += selectedImageIndex;
        break;
      }
      currentGlobalIndex += images.length;
    }

    const result = {
      currentIndex: currentGlobalIndex + 1,
      totalImages: allImages.length
    };

    console.log('Image counter debug:', {
      selectedReviewIndex,
      selectedImageIndex,
      currentGlobalIndex,
      result
    });

    return result;
  };

  const imageInfo = getCurrentImageInfo();

  return (
    <div className="ReviewCard-review-card">
      <div className="ReviewCard-review-top">
        <div className="ReviewCard-avatar-circle">{safeReview.name?.charAt(0) || "U"}</div>
        <div className="ReviewCard-review-content">
          <div className="ReviewCard-review-header">
            <h4>{safeReview.name}</h4>
            <span className="ReviewCard-dot">•</span>
            <span className="ReviewCard-muted">{formatDate(safeReview.date)}</span>
          </div>
          <p className="ReviewCard-review-text">{displayText}</p>
          <div className="ReviewCard-mb-8">
            <RatingStars rating={safeReview.rating} />
          </div>
          
          {shouldTruncate && (
            <button className="ReviewCard-link-btn" onClick={() => setIsExpanded(!isExpanded)}>
              {isExpanded ? "Read Less" : "Read More"}
            </button>
          )}
          {safeReview.images && safeReview.images.length > 0 && (
            <div className="ReviewCard-review-images">
              {safeReview.images.map((image, index) => {
                const base = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                let src = image || '';
                if (src && !(src.startsWith('http://') || src.startsWith('https://'))) {
                  src = src.startsWith('/') ? `${base}${src}` : `${base}/${src}`;
                }
                return <img key={index} src={src} alt={`Review ${index + 1}`} onClick={() => handleImageClick(index, allReviews.findIndex(r => (r._id || r.id) === reviewId))} />;
              })}
            </div>
          )}
          <div className="ReviewCard-review-actions">
            {/* Fix: Always show helpful button, but conditionally show count */}
            <button className="ReviewCard-ghost-btn" onClick={handleHelpful} disabled={hasVoted}>
              <FaThumbsUp />
              {helpfulCount > 0 && ` (${helpfulCount})`}
            </button>
            {/* <button className="ReviewCard-ghost-btn">Report</button> */}
          </div>
        </div>
      </div>

      {showImageModal && (
        <div className="ReviewCard-image-modal" onKeyDown={handleKeyDown} tabIndex={0}>
          <div className="ReviewCard-image-modal-content">
            {/* Image Counter */}
            <div className="image-counter">
              {imageInfo.currentIndex} of {imageInfo.totalImages}
            </div>
            
            {/* Current Image */}
            {(() => {
              const base = import.meta.env.VITE_API_URL || 'http://localhost:5000';
              const currentReview = allReviews[selectedReviewIndex] || review;
              const images = Array.isArray(currentReview?.images) ? currentReview.images : [];
              let src = images[selectedImageIndex] || '';
              if (src && !(src.startsWith('http://') || src.startsWith('https://'))) {
                src = src.startsWith('/') ? `${base}${src}` : `${base}/${src}`;
              }
              return <img src={src} alt="Review" />;
            })()}
            
            {/* Close Button */}
            <button className="ReviewCard-image-modal-close" onClick={closeImageModal}>
              <X />
            </button>
            
            {/* Navigation Buttons */}
            <button 
              className="ReviewCard-image-modal-prev" 
              onClick={() => navigateImage('prev')}
              disabled={!canGoLeft}
              style={{ opacity: canGoLeft ? 1 : 0.5, cursor: canGoLeft ? 'pointer' : 'not-allowed' }}
            >
              <ChevronLeft />
            </button>
            <button 
              className="ReviewCard-image-modal-next" 
              onClick={() => navigateImage('next')}
              disabled={!canGoRight}
              style={{ opacity: canGoRight ? 1 : 0.5, cursor: canGoRight ? 'pointer' : 'not-allowed' }}
            >
              <ChevronRight />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewCard;