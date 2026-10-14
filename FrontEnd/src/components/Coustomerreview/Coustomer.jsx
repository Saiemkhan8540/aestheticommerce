import React from "react";
import "./Coustomer.css";

const reviews = [
  {
    name: "Aarav Sharma",
    rating: 5,
    review:
      "The products are lit and I really enjoyed the gift sent to me through your website. They were perfect!",
  },
  {
    name: "Priya Nair",
    rating: 4.5,
    review:
      "Absolutely loved the decor items. Smooth delivery and great packaging!",
  },
  {
    name: "Kabir Khan",
    rating: 4,
    review:
      "Amazing selection of gifts. Will definitely come back for more!",
  },
  {
    name: "Ananya Iyer",
    rating: 4,
    review:
      "Amazing selection of gifts. Will definitely come back for more!",
  },
];

const StarRating = ({ rating }) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 !== 0;

  return (
    <div className="stars">
      {[...Array(fullStars)].map((_, i) => (
        <span key={`full-${i}`}>&#9733;</span>
      ))}
      {halfStar && <span key="half">&#9733;</span>}
    </div>
  );
};

const TestimonialCard = ({ name, rating, review }) => {
  return (
    <div className="customer-review-card">
      <div className="profile-img-placeholder" aria-hidden="true"></div>
      <h3>{name}</h3>
      <StarRating rating={rating} />
      <p>
        {review} <span className="read-more">read more</span>
      </p>
    </div>
  );
};

const Customer = () => {
  return (
    <section className="customer-review-section">
      <div className="customer-review-header">
        <h2>WHY TO CHOOSE US?</h2>
        <p className="reviews-link">Here Are Our Genuine Reviews</p>
      </div>
      <div className="customer-review-container">
        {reviews.map((review, index) => (
          <TestimonialCard key={index} {...review} />
        ))}
      </div>
    </section>
  );
};

export default Customer;
