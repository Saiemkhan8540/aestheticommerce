import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import SearchBar from "../../SearchBar/searchbar.jsx";
import "./BlogHome.css";

const BANNER_ROTATION_MS = 8000;

const slides = [
  {
    image: 'https://images.unsplash.com/photo-1712581927725-6448bbf45c84?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3DS',
    title: 'Welcome to the Blogverse',
    description: 'Shop Local. Style Global.',
    to: '/blog',
    cta: 'Explore Blogs',
  },
  {
    image: 'https://images.unsplash.com/photo-1701933802512-bf4ab4bf6918?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    title: 'Feature of the Day',
    description: '7 Steps to Design a Bed Room.',
    to: `/blog?tag=${encodeURIComponent('home decor')}`,
    cta: 'Read More',
  },
  {
    image: 'https://images.unsplash.com/photo-1686636340985-93d40e2f843d?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    title: 'Must-Read Blogs',
    description: '5 Rules of Eco-Friendly Gift Giving!',
    to: `/blog?tag=${encodeURIComponent('eco-friendly')}`,
    cta: 'Read More',
  }
];

const BlogHome = ({ onCreateClick, searchQuery = "", onSearchChange }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, BANNER_ROTATION_MS);
    return () => clearInterval(interval);
  }, []);

  const { image, title, description, to, cta } = slides[index];

  return (
    <div className="blog-home-container">
      <div className="hero-header">
        <SearchBar
          variant="embedded"
          value={searchQuery}
          onChange={onSearchChange}
          placeholder="Search blogs..."
          showCategory={false}
          showTrending={false}
        />

        <button className="create-btn" onClick={onCreateClick}>
          Create Your Own Blog
        </button>
      </div>

      <Link
        to={to}
        className="hero-slide"
        style={{ backgroundImage: `url(${image})` }}
        aria-label={`${title}: ${description}`}
      >
        <h2 className="hero-title">{title}</h2>
        <p className="hero-description">{description}</p>
        <span className="hero-slide-cta">{cta}</span>
      </Link>

      {/* <LatestBlogSection /> */}
    </div>
  );
};

export default BlogHome;