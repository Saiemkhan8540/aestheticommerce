import { Link, useSearchParams } from "react-router-dom";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBlogs } from "../../../Redux/blogSlice";
import "./BlogHome.css";

const AUTO_SLIDE_INTERVAL = 4500;

const matchesBlogSearch = (blog, query) => {
  const haystack = [
    blog.title,
    blog.content,
    blog.author,
    ...(Array.isArray(blog.tags) ? blog.tags : []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
};

const LatestBlogSection = ({ searchQuery = "" }) => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const tagFilter = searchParams.get("tag");
  const { blogs = [], loading, error } = useSelector((state) => state.blogs);
  const normalizedSearch = searchQuery.trim().toLowerCase();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Responsive grouping: 2 cards per slide on mobile (< 768px), 4 cards on desktop
  const cardsPerSlide = window.innerWidth < 768 ? 2 : 4;

  useEffect(() => {
    dispatch(fetchBlogs(tagFilter ? { tag: tagFilter } : {}));
  }, [dispatch, tagFilter]);

  const filteredBlogs = useMemo(() => {
    if (!Array.isArray(blogs) || blogs.length === 0) return [];
    if (!normalizedSearch) return blogs;
    return blogs.filter((blog) => matchesBlogSearch(blog, normalizedSearch));
  }, [blogs, normalizedSearch]);

  // Create slides based on dynamic cardsPerSlide
  const slides = useMemo(() => {
    if (filteredBlogs.length === 0) return [];
    const grouped = [];
    for (let i = 0; i < filteredBlogs.length; i += cardsPerSlide) {
      grouped.push(filteredBlogs.slice(i, i + cardsPerSlide));
    }
    return grouped;
  }, [filteredBlogs, cardsPerSlide]);

  // Auto-slide logic
  useEffect(() => {
    if (slides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
    }, AUTO_SLIDE_INTERVAL);

    return () => clearInterval(interval);
  }, [slides.length]);

  // Reset to first slide when blogs or search change
  useEffect(() => {
    setCurrentSlideIndex(0);
  }, [filteredBlogs.length, normalizedSearch]);

  const resolveImageSrc = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    const baseUrl = import.meta.env.VITE_API_URL || "";
    return `${baseUrl}${imagePath}`;
  };

  const handlePrev = () => {
    if (slides.length === 0) return;
    setCurrentSlideIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    if (slides.length === 0) return;
    setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
  };

  const goToSlide = (index) => {
    setCurrentSlideIndex(index);
  };

  const sectionTitle = tagFilter
    ? `${tagFilter
        .split("-")
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")} Blogs`
    : "Latest Blogs";

  if (loading) return <div className="loading-state">Loading blogs...</div>;
  if (error) return <div className="error-state">Error: {error}</div>;
  if (slides.length === 0) {
    const emptyMessage = normalizedSearch
      ? `No blogs match "${searchQuery.trim()}".`
      : tagFilter
        ? `No blogs found for "${sectionTitle}".`
        : "No blogs found.";

    return <div className="empty-state">{emptyMessage}</div>;
  }

  return (
    <section className="latest-blog-section">
      <h2>{sectionTitle}</h2>

      <div className="blog-slider">
        <div className="blog-slider-window">
          <div
            className="blog-slider-track"
            style={{
              transform: `translateX(-${currentSlideIndex * 100}%)`,
              display: 'flex',
              width: '100%'
            }}
          >
            {slides.map((group, slideIndex) => (
              <div className="blog-slide" key={slideIndex} style={{ flex: '0 0 100%', width: '100%' }}>
                {group.map((blog) => {
                  const imageSrc = resolveImageSrc(blog.image);
                  return (
                    <article className="blog-card" key={blog._id}>
                    <Link to={`/blogs/${blog._id}`} key={blog._id} className="blog-card-link">
                        {imageSrc && (
                          <div className="blog-cover-wrapper">
                            <img
                              className="blog-cover"
                              src={imageSrc}
                              alt={blog.title}
                              loading="lazy"
                            />
                          </div>
                        )}
                        <div className="blog-content">
                          <h2>{blog.title}</h2>
                          {/* <h3>{blog.author}</h3> */}
                          <p>{blog.content?.slice(0, 100)}...</p>
                        </div>
                      </Link>
                    </article>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {slides.length > 1 && (
          <div className="slider-controls-container">
            <button
              className="slider-control slider-control--left"
              onClick={handlePrev}
              aria-label="Previous slide"
            >
              ‹
            </button>
            <button
              className="slider-control slider-control--right"
              onClick={handleNext}
              aria-label="Next slide"
            >
              ›
            </button>
          </div>
        )}
      </div>

      {/* Slide Indicators - moved outside blog-slider */}
      {slides.length > 1 && (
        <div className="slide-indicators">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`slide-indicator ${index === currentSlideIndex ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default LatestBlogSection;
