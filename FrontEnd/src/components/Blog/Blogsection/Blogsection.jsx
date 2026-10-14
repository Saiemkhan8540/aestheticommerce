import React, { useState, useEffect } from 'react';
import './Blogsection.css';
const API_URL = import.meta.env.API_URL ;

const BlogSection = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const fetchBlogs = async () => {
    try {
      const response = await fetch('${API_URL}/blogs'); // Ensure this URL is correct
      if (response.ok) {
        const data = await response.json();
        setFeedbacks(data); // consider renaming 'feedbacks' to 'blogs'
      } else {
        throw new Error('Failed to fetch blogs');
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  fetchBlogs();
}, []);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (feedbacks.length === 0) {
    return <div className="no-feedback">No Blog available yet.</div>;
  }

  return (
    <section className="feedback-section">
      <h2>WHY TO CHOOSE US?</h2>
      <p className="subtitle">Here Are Our Genuine Reviews</p>
      
      <div className="feedback-grid">
        {feedbacks.map((feedback) => (
          <div key={feedback._id} className="feedback-card">
            <div className="profile-img-container">
              <img 
                src={feedback.profilePicture} 
                alt={`${feedback.name}'s profile`} 
                className="profile-img" 
              />
            </div>
            <h3>{feedback.name}</h3>
            <div className="stars">
              {Array(5).fill().map((_, index) => (
                <span 
                  key={index} 
                  className={`star ${index < feedback.rating ? 'filled' : ''}`}
                >
                  ★
                </span>
              ))}
            </div>
            <p className="comment">{feedback.comment}</p>
            <a href="#" className="read-more">read more</a>
          </div>
        ))}
      </div>
    </section>
  );
};

export default BlogSection;