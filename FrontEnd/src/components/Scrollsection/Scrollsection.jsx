import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./Scrollsection.css";
import { getCategoryBannerImages } from "../categoryBannerImages";

const BASE_URL = import.meta.env.VITE_API_URL || '';

const ScrollSection = () => {
  const scrollRef = useRef(null);
  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch(`${BASE_URL}/home/tags`);
        const data = await response.json();

        if (data.success) {
          // Keep all items to pass to image generator to track used images, avoiding duplicates
          setAllItems(data.tags);
        }
      } catch (error) {
        console.error("Error fetching scroll section tags:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, []);

  const items = useMemo(() => allItems.slice(7), [allItems]);

  useEffect(() => {
    const container = scrollRef.current;

    if (!container || items.length === 0) return;

    let intervalId;

    const autoScroll = () => {
      if (container) {
        const scrollAmount = container.clientWidth;

        if (container.scrollLeft + scrollAmount >= container.scrollWidth) {
          container.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          container.scrollBy({ left: scrollAmount, behavior: "smooth" });
        }
      }
    };

    intervalId = setInterval(autoScroll, 8000);

    return () => clearInterval(intervalId);
  }, [items]);

  const categoryImages = useMemo(() => getCategoryBannerImages(allItems).slice(7), [allItems]);

  return (
    <div className="scroll-wrapper">
      <h6 className="scroll-heading">
        SHOP - SHOP - SHOP - SHOP - SHOP - SHOP - SHOP - SHOP - SHOP - SHOP - SHOP - SHOP - SHOP - SHOP - SHOP - SHOP - SHOP - SHOP - SHOP
      </h6>
      <h6 className="mobile-scroll-heading">
        SHOP - SHOP - SHOP - SHOP - SHOP
      </h6>

      <div className="scroll-container" ref={scrollRef}>
        {!loading && items.length > 0 ? (
          items.map((item, i) => (
            <Link
              key={i}
              to={`/products?tag=${encodeURIComponent(item.tag)}`}
              className="scroll-card"
            >
              <div className="scroll-item">
                <img
                  src={categoryImages[i]}
                  alt={item.tag}
                  className="scroll-image"
                />
              </div>
              <p className="item-text" style={{ textTransform: "capitalize" }}>
                {item.tag}
              </p>
            </Link>
          ))
        ) : (
          <p style={{ padding: "20px" }}>Loading tags...</p>
        )}
      </div>
    </div>
  );
};

export default ScrollSection;
