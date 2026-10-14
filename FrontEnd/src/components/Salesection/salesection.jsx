import React, { useState, useEffect } from "react";
import "./salesection.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const SaleSection = () => {
  const navigate = useNavigate();
  const [activeBanner, setActiveBanner] = useState(null);
  
  // Ensure we have a fallback for apiBase if the env var is missing
  const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchActiveBanner = async () => {
      try {
        const response = await axios.get(`${apiBase}/api/banners/active`);
        if (response.data.success && response.data.banner) {
          console.log("Active banner found:", response.data.banner);
          setActiveBanner(response.data.banner);
        } else {
          console.log("No active banner found from API");
        }
      } catch (error) {
        console.error("Error fetching active banner:", error);
      }
    };
    fetchActiveBanner();
  }, [apiBase]);

  const handleClick = () => {
    if (activeBanner?.redirectUrl) {
      navigate(activeBanner.redirectUrl);
    } else {
      navigate(`/products?tag=${encodeURIComponent("gift")}`);
    }
  };

  return (
    <div className="salesection-wrapper">
      <div className="sale-heading-line">
        HANDMADE - AESTHETIC - GIFTS - DECOR - CRAFTS - ART - HANDMADE - AESTHETIC - GIFTS - DECOR - CRAFTS - ART
      </div>
      <div className="mobile-sale-heading-line">
        HANDMADE - GIFTS - DECOR
      </div>
      <div 
        className={`sale-banner-box ${activeBanner ? "custom-banner" : "default-banner"}`} 
        onClick={handleClick}
        style={activeBanner ? {
          backgroundImage: `url("${activeBanner.imageUrl}")`, // Added quotes for safety
          backgroundSize: "cover",
          backgroundPosition: "center"
        } : {}}
      >
        {/* Only show default text if NO active banner is found */}
        {!activeBanner && (
          <>
            <span>Featured collection</span>
            <h2>Handmade pieces for thoughtful gifting</h2>
            <p>Explore curated decor, art, and creator-made gifts for every occasion</p>
          </>
        )}
      </div>
    </div>
  );
};

export default SaleSection;
