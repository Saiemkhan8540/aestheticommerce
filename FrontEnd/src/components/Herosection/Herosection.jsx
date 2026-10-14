import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Herosection.css";
import Banner1 from "../../Images/Gift.jpg";
import Banner2 from "../../Images/Birthday.jpg";
import Banner3 from "../../Images/Diya.jpg";
import Banner4 from "../../Images/IMG_5.png";
import Banner5 from "../../Images/Baby.jpg";
import Banner6 from "../../Images/IMG_1.jpeg";

const largeBannerSlides = [
  {
    image: Banner1,
    title: "Explore Unique Gifts",
    subtitle: "Find the perfect present for every occasion.",
    to: `/products?tag=${encodeURIComponent("personalized gift")}`,
    cta: "Explore",
  },
  {
    image: Banner2,
    title: "Explore Unique Gifts",
    subtitle: "Find the perfect present for every occasion.",
    to: `/products?tag=${encodeURIComponent("birthday gift")}`,
    cta: "Explore",
  },
  {
    image: Banner3,
    title: "Explore Unique Gifts",
    subtitle: "Find the perfect present for every occasion.",
    to: `/products?tag=${encodeURIComponent("diwali ethnic decor")}`,
    cta: "Explore",
  },
];

const BANNER_ROTATION_MS = 8000;

const smallBannerSlides = [
  {
    image: Banner4,
    title: "New Arrivals",
    subtitle: "Fresh decor pieces just for you!",
    to: `/products?tag=${encodeURIComponent("house party")}`,
    cta: "Shop Now",
  },
  {
    image: Banner5,
    title: "New Arrivals",
    subtitle: "Fresh decor pieces just for you!",
    to: `/products?tag=${encodeURIComponent("baby shower")}`,
    cta: "Shop Now",
  },
  {
    image: Banner6,
    title: "New Arrivals",
    subtitle: "Fresh decor pieces just for you!",
    to: `/products?tag=${encodeURIComponent("dinner dates")}`,
    cta: "Shop Now",
  },
];

const HeroSection = () => {
  const [currentLargeImage, setCurrentLargeImage] = useState(0);
  const [currentSmallImage, setCurrentSmallImage] = useState(0);

  const activeLargeSlide = largeBannerSlides[currentLargeImage];
  const activeSmallSlide = smallBannerSlides[currentSmallImage];

  // Preload images to prevent flickering and speed up rendering
  useEffect(() => {
    const allImages = [
      ...largeBannerSlides.map((slide) => slide.image),
      ...smallBannerSlides.map((slide) => slide.image),
    ];
    allImages.forEach((src) => {
      const img = new Image();
      if (src === largeBannerSlides[0].image || src === smallBannerSlides[0].image) {
        img.fetchPriority = "high";
      }
      img.src = src;
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLargeImage((prev) => (prev + 1) % largeBannerSlides.length);
      setCurrentSmallImage((prev) => (prev + 1) % smallBannerSlides.length);
    }, BANNER_ROTATION_MS);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="hero-section">
      <div className="hero-container">
        <Link
          to={activeLargeSlide.to}
          className="banner large-banner"
          style={{
            backgroundImage: `linear-gradient(90deg, rgba(255,255,255,0.42), rgba(255,255,255,0.04)), url(${activeLargeSlide.image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            transition: "background-image 0.7s ease-in-out",
            textDecoration: "none",
          }}
        >
          <h2>{activeLargeSlide.title}</h2>
          <p>{activeLargeSlide.subtitle}</p>
          <span className="banner-cta">{activeLargeSlide.cta}</span>
        </Link>

        <Link
          to={activeSmallSlide.to}
          className="banner small-banner"
          style={{
            backgroundImage: `linear-gradient(90deg, rgba(255,255,255,0.42), rgba(255,255,255,0.04)), url(${activeSmallSlide.image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            transition: "background-image 0.7s ease-in-out",
            textDecoration: "none",
          }}
        >
          <h3>{activeSmallSlide.title}</h3>
          <p>{activeSmallSlide.subtitle}</p>
          <span className="banner-cta banner-cta--small">{activeSmallSlide.cta}</span>
        </Link>
      </div>
    </section>
  );
};

export default HeroSection;
