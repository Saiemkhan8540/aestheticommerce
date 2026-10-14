import React, { useState } from "react";
import { Upload, X } from "lucide-react";
import "./ReviewInput.css";

const ReviewInput = ({ onSubmit, submitting = false }) => {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadedPreviews, setUploadedPreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [uploadProgress, setUploadProgress] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;
    
    setIsUploading(true);
    const nextFiles = [...uploadedFiles, ...files].slice(0, 5);
    const nextPreviews = [
      ...uploadedPreviews,
      ...files.map((f) => URL.createObjectURL(f)),
    ].slice(0, 5);
    
    // Simulate upload progress for each new file
    const newProgress = {};
    files.forEach((file, index) => {
      const fileIndex = uploadedFiles.length + index;
      newProgress[fileIndex] = 0;
      
      // Simulate progress increment
      const interval = setInterval(() => {
        setUploadProgress(prev => ({
          ...prev,
          [fileIndex]: Math.min(prev[fileIndex] + Math.random() * 20, 100)
        }));
      }, 100);
      
      // Complete upload after random time
      setTimeout(() => {
        clearInterval(interval);
        setUploadProgress(prev => {
          const updated = {
            ...prev,
            [fileIndex]: 100
          };
          
          // Check if all uploads are complete
          const allComplete = Object.values(updated).every(p => p === 100);
          if (allComplete) {
            setIsUploading(false);
          }
          
          return updated;
        });
      }, 1000 + Math.random() * 2000);
    });
    
    setUploadProgress(prev => ({ ...prev, ...newProgress }));
    setUploadedFiles(nextFiles);
    setUploadedPreviews(nextPreviews);
  };

  const removeImage = (index) => {
    const urlToRevoke = uploadedPreviews[index];
    if (urlToRevoke) {
      URL.revokeObjectURL(urlToRevoke);
    }
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
    setUploadedPreviews((prev) => prev.filter((_, i) => i !== index));
    setUploadProgress((prev) => {
      const newProgress = { ...prev };
      delete newProgress[index];
      return newProgress;
    });
  };

  const handleSubmit = async () => {
    if (rating === 0 || reviewText.trim() === "" || isUploading || submitting || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError("");

    try {
      if (onSubmit) {
        await onSubmit({
          stars: rating,
          text: reviewText,
          files: uploadedFiles,
        });
      }

      uploadedPreviews.forEach((url) => URL.revokeObjectURL(url));

      setRating(0);
      setReviewText("");
      setUploadedFiles([]);
      setUploadedPreviews([]);
      setUploadProgress({});
    } catch (error) {
      console.error("Review submission failed:", error);
      const message =
        error?.message ||
        error?.response?.data?.error ||
        "Failed to submit review. Please try again.";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const InteractiveStar = ({ starNumber }) => {
    const isFilled = starNumber <= (hoveredStar || rating);
    return (
      <button
        type="button"
        className="ReviewInput-star-button"
        onMouseEnter={() => setHoveredStar(starNumber)}
        onMouseLeave={() => setHoveredStar(0)}
        onClick={() => setRating(starNumber)}
      >
        <svg
          className={`ReviewInput-star-svg ${isFilled ? "filled" : ""}`}
          viewBox="0 0 24 24"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      </button>
    );
  };

  const isSubmitDisabled =
    rating === 0 ||
    reviewText.trim() === "" ||
    isUploading ||
    isSubmitting ||
    submitting;

  return (
    <div className="ReviewInput-card">
      <div className="ReviewInput-container">
        {/* User Avatar */}
        <div className="ReviewInput-avatar">
          <div className="ReviewInput-avatar-fallback">You</div>
        </div>

        {/* Review Form */}

        <div className="ReviewInput-form">
          <h3 className="ReviewInput-title">Write a Review</h3>

          {/* Rating Input */}
          <div className="ReviewInput-field">
            <label className="ReviewInput-label">Overall Rating *</label>
            <div className="ReviewInput-rating-container">
              {[1, 2, 3, 4, 5].map((star) => (
                <InteractiveStar key={star} starNumber={star} />
              ))}
              {rating > 0 && (
                <span className="ReviewInput-rating-text">
                  {rating === 1 && "Poor"}
                  {rating === 2 && "Fair"}
                  {rating === 3 && "Good"}
                  {rating === 4 && "Very Good"}
                  {rating === 5 && "Excellent"}
                </span>
              )}
            </div>
          </div>

          {/* Review Text */}
          {rating > 0 && (
            <div className="div">
              <div className="ReviewInput-field">
                <label className="ReviewInput-label">Your Review </label>
                <textarea
                  className="ReviewInput-textarea"
                  placeholder="Share details about your experience with this product..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  maxLength={1000}
                />
                <div className="ReviewInput-character-count">
                  <span>{reviewText.length}/1000 characters</span>
                </div>
              </div>

              {/* Image Upload */}
              <div className="ReviewInput-field">
                <label className="ReviewInput-label">Add Photos</label>
                <div className="ReviewInput-upload-container">
                  {/* Upload Button - Always first/left */}
                  {uploadedPreviews.length < 5 && (
                    <label className="ReviewInput-upload-label">
                      <Upload size={20} className="ReviewInput-upload-icon" />
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="ReviewInput-file-input"
                      />
                    </label>
                  )}

                  {/* Uploaded Images - Always after upload button */}
                  {uploadedPreviews.map((image, index) => (
                    <div key={index} className="ReviewInput-image-preview">
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`Upload ${index + 1}`}
                        className="ReviewInput-preview-image"
                      />
                      {/* Progress Bar */}
                      {uploadProgress[index] !== undefined && uploadProgress[index] < 100 && (
                        <div className="ReviewInput-progress-bar">
                          <div 
                            className="ReviewInput-progress-fill" 
                            style={{ width: `${uploadProgress[index]}%` }}
                          ></div>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="ReviewInput-remove-button"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
                <p className="ReviewInput-upload-help">
                  Upload up to 5 photos (JPG, PNG, max 5MB each)
                </p>
              </div>

              {/* Submit Button */}
              <div className="ReviewInput-actions">
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitDisabled}
                  className="ReviewInput-submit-button"
                >
                  {isSubmitting || submitting
                    ? "Submitting..."
                    : isUploading
                    ? "Uploading..."
                    : "Submit Review"}
                </button>
                {/* <span className="ReviewInput-required-text">* Required fields</span> */}
              </div>
              {submitError && (
                <p className="ReviewInput-error" role="alert">
                  {submitError}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewInput;