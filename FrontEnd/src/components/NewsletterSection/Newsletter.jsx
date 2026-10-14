import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './Newsletter.css';

function Newsletter() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/subscribe`, { email });
      toast.success(response.data.msg || "Subscribed successfully!");
      setEmail('');
    } catch (error) {
      const errorMsg = error.response?.data?.msg || "Something went wrong. Please try again.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="newsletter-banner">
      <div className="newsletter-content">
        <p className="newsletter-text">
          Get info about <strong>exclusive deals, offers, gifts</strong> and many more...
        </p>
        <form className="newsletter-form" onSubmit={handleSubmit}>
          <div className="newsletter-input-wrapper">
            <input 
              type="email" 
              placeholder="Enter your email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <button type="submit" disabled={loading}>
              {loading ? "Subscribing..." : "Subscribe"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default Newsletter;
