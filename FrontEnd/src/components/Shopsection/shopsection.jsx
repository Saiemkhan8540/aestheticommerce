import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import './shopsection.css';
import { getCategoryBannerImages } from "../categoryBannerImages";

const BASE_URL = import.meta.env.VITE_API_URL || '';

function OccasionThumbnail({ item, image }) {
  const tag = item.tag || "Special Occasion";

  return (
    <Link
      to={`/products?tag=${encodeURIComponent(tag)}`}
      className="occasion-card"
      aria-label={`Shop ${tag}`}
    >
      <span className="occasion-image-wrap">
        <img
          src={image}
          alt={tag}
          className="occasion-image"
          loading="lazy"
        />
      </span>
      <span className="occasion-content">
        <span className="occasion-title" style={{ textTransform: "capitalize" }}>
          {tag}
        </span>
        <span className="occasion-arrow" aria-hidden="true">&rarr;</span>
      </span>
    </Link>
  );
}

function Shopsection() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch(`${BASE_URL}/home/tags`);
        const data = await response.json();

        if (data.success) {
          setItems(data.tags);
        }
      } catch (error) {
        console.error("Error fetching shop section tags:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, []);

  const visibleItems = useMemo(() => {
    return items
      .filter(item => {
        const tagName = (item.tag || item || "").toLowerCase();
        const excluded = ["birthday gift", "birthday", "eid greeting", "eid greetings"];
        return !excluded.includes(tagName);
      })
      .slice(0, 8); // 8 items fills the 4-column grid perfectly
  }, [items]);

  const categoryImages = useMemo(() => getCategoryBannerImages(visibleItems), [visibleItems]);

  return (
    <div className="shop-section">
      <div className="shop-heading">Shop for Special Occasions &rarr;</div>
      <div className="shop-grid">
        {!loading && items.length > 0 ? (
          visibleItems.map((item, index) => (
            <OccasionThumbnail key={`${item.tag}-${index}`} item={item} image={categoryImages[index]} />
          ))
        ) : (
          <div className="shop-loading">
            Loading occasions...
          </div>
        )}
      </div>
    </div>
  );
}

export default Shopsection;
