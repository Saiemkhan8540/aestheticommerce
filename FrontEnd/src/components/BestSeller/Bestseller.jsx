import React, { useRef, useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "./Bestseller.css";
import { getSellerBannerImage } from "../categoryBannerImages";

const BASE_URL = import.meta.env.VITE_API_URL || '';

const BestSellers = () => {
  const containerRef = useRef(null);
  const navigate = useNavigate();

  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSellers = async () => {
      try {
        const response = await fetch(`${BASE_URL}/products/shops`);
        const data = await response.json();

        if (Array.isArray(data)) {
          setSellers(data.slice(0, 10));
        }
      } catch (error) {
        console.error("Error fetching top sellers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSellers();
  }, []);

  const scroll = (direction) => {
    const { current } = containerRef;
    if (current) {
      const cardWidth = current.offsetWidth / 3;
      if (direction === "left") {
        current.scrollBy({ left: -cardWidth, behavior: "smooth" });
      } else {
        current.scrollBy({ left: cardWidth, behavior: "smooth" });
      }
    }
  };

  const handleClick = (storeName) => {
    navigate(`/shop-products?store=${encodeURIComponent(storeName)}`);
  };

  return (
    <section className="best-sellers-section">
      <h2 className="best-sellers-title">The Best Sellers</h2>
      <Link to="/shops" className="best-sellers-banner-link" style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className="best-sellers-banner">
          <div>
            <span>Curated shops</span>
            <h3>Discover customer-favorite handmade collections</h3>
          </div>
        </div>
      </Link>
      <div className="slider-wrapper">
        <button className="arrow left" onClick={() => scroll("left")}>
          <ChevronLeft size={24} />
        </button>

        <div className="slider" ref={containerRef}>
          {loading ? (
            <p style={{ padding: "20px" }}>Loading sellers...</p>
          ) : sellers.length > 0 ? (
            sellers.map((seller, index) => (
              <Link
                to={`/shop-products?store=${encodeURIComponent(seller.storeName)}`}
                className="seller-card"
                key={seller.sellerId || index}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div className="image-wrapper">
                  <img
                    src={
                      seller.img ||
                      getSellerBannerImage(seller.storeName, index)
                    }
                    alt={seller.storeName}
                  />
                  <div className="shop-details">
                    <p className="shop-details-name">{seller.storeName}</p>
                    <span className="shop-details-cta shop-details-cta--desktop">
                      Click for more info
                    </span>
                    <span className="shop-details-cta shop-details-cta--mobile">
                      Tap for more info
                    </span>
                  </div>
                </div>
                <p className="seller-card-name">{seller.storeName}</p>
                <span className="seller-card-hint">View shop</span>
              </Link>
            ))
          ) : (
            <p style={{ padding: "20px" }}>No best sellers found.</p>
          )}
        </div>

        <button className="arrow right" onClick={() => scroll("right")}>
          <ChevronRight size={24} />
        </button>
      </div>
    </section>
  );
};

export default BestSellers;
