import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchReviews, submitReview } from "../../../Redux/reviewsSlice";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ReviewCard from "../../Review/ReviewCard/ReviewCard";
import ReviewInput from "../../Review/ReviewInput/ReviewInput.jsx";
// import RatingBreakdown from "../RatingBreakdown/RatingBreakdown";
// import RatingStars from "../../Product/RatingStars/RatingStars.jsx";
import "./OrderReview.css";

// Helper: Conditionally render the ReviewInput based on auth and whether user already reviewed
const ConditionalReviewInput = ({ productId }) => {
  const dispatch = useDispatch();
  const { items: reviews } = useSelector((s) => s.reviews);
  const { user, token } = useSelector((s) => s.user);

  if (!user || !token) {
    return (
      <div className="ProductReview-login-required">
        <p>Please login to write a review.</p>
      </div>
    );
  }

  const hasReviewed = (reviews || []).some((r) => String(r.user?._id || r.user) === String(user?._id));
  if (hasReviewed) return null;

  return (
    <ReviewInput onSubmit={async ({ stars, text, files }) => {
      await dispatch(submitReview({ productId, stars, text, photos: files }));
      // Refresh reviews to show the new review immediately
      dispatch(fetchReviews(productId));
    }} />
  );
};

class ReviewsErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch() {}
  render() {
    if (this.state.hasError) {
      return (
        <section className="ProductReview-reviews-section">
          <div className="ProductReview-reviews-container">
            <div className="ProductReview-loading">Reviews temporarily unavailable.</div>
          </div>
        </section>
      );
    }
    return this.props.children;
  }
}

// Custom Dropdown Component
const CustomDropdown = ({ value, onChange, options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(
    options.find(opt => opt.value === value) || options[0]
  );

  const handleOptionClick = (option) => {
    setSelectedOption(option);
    onChange(option.value);
    setIsOpen(false);
  };

  const handleClickOutside = (e) => {
    if (!e.target.closest('.ProductReview-dropdown-container')) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    const newSelected = options.find(opt => opt.value === value);
    if (newSelected) {
      setSelectedOption(newSelected);
    }
  }, [value, options]);

  return (
    <div className="ProductReview-dropdown-container">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="ProductReview-dropdown-button"
      >
        <span>{selectedOption.label}</span>
        <svg 
          className={`ProductReview-chevron-icon ${isOpen ? 'ProductReview-chevron-open' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>
      
      <div className={`ProductReview-dropdown-menu ${isOpen ? 'ProductReview-dropdown-open' : ''}`}>
        <div className="ProductReview-dropdown-menu-inner">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => handleOptionClick(option)}
              className="ProductReview-dropdown-option"
            >
              <span>{option.label}</span>
              {selectedOption.value === option.value && (
                <svg className="ProductReview-check-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const ProductReviews = ({ productId }) => {
  const dispatch = useDispatch();
  const { items: reviews, loading } = useSelector((s) => s.reviews);
  const { user } = useSelector((s) => s.user);
  const [sortBy, setSortBy] = useState("most-recent");
  const [showAll, setShowAll] = useState(false);

  const sortOptions = [
    { value: "most-recent", label: "Most Recent" },
    { value: "highest-rated", label: "Highest Rated" },
    { value: "lowest-rated", label: "Lowest Rated" },
    { value: "most-helpful", label: "Most Helpful" }
  ];

  useEffect(() => {
    if (productId) dispatch(fetchReviews(productId));
  }, [productId, dispatch]);

  const ratingData = useMemo(() => {
    const counts = [0, 0, 0, 0, 0, 0];
    (reviews || []).forEach((r) => {
      const s = Math.min(5, Math.max(1, Number(r.stars || r.rating || 0)));
      counts[s] += 1;
    });
    const total = reviews?.length || 0;
    return [5, 4, 3, 2, 1].map((s) => ({
      stars: s,
      count: counts[s],
      percentage: total ? Math.round((counts[s] / total) * 100) : 0,
    }));
  }, [reviews]);

  const totalReviews = reviews?.length || 0;
  const averageRating = totalReviews
    ? (
        reviews.reduce((acc, r) => acc + Number(r.stars || r.rating || 0), 0) /
        totalReviews
      ).toFixed(1)
    : "0.0";

  const sorted = useMemo(() => {
    const copy = [...(reviews || [])];
    switch (sortBy) {
      case "highest-rated":
        return copy.sort((a, b) => (b.stars || 0) - (a.stars || 0));
      case "lowest-rated":
        return copy.sort((a, b) => (a.stars || 0) - (b.stars || 0));
      case "most-helpful":
        return copy.sort((a, b) => (b.helpfulCount || 0) - (a.helpfulCount || 0));
      default:
        return copy.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  }, [reviews, sortBy]);

  // In OrderDetails: show only the logged-in user's review card (if present)
  const myReview = useMemo(() => {
    if (!user) return null;
    return (reviews || []).find((r) => String(r.user?._id || r.user) === String(user._id)) || null;
  }, [reviews, user]);

  const displayed = myReview ? [myReview] : [];

  return (
    <ReviewsErrorBoundary>
      <section className="ProductReview-reviews-section">
        <div className="ProductReview-reviews-container">
          {/* Section Header */}
        

     

          {/* Reviews Grid */}
          <div className="ProductReview-reviews-grid">
            {loading ? (
              <div className="ProductReview-loading">Loading reviews...</div>
            ) : (
              displayed.map((r, idx) => {
                const fn = r.user?.fullname;
                const nameStr = typeof fn === "object"
                  ? [fn.firstname, fn.lastname].filter(Boolean).join(" ") || "Anonymous"
                  : (fn || r.user?.name || "Anonymous");
                return (
                  <ReviewCard
                    key={r._id || idx}
                    review={{
                      id: r._id || idx,
                      productId: productId,
                      name: nameStr,
                      avatar: "",
                      rating: r.stars,
                      date: r.createdAt,
                      text: r.text,
                      images: r.photos || [],
                      helpfulCount: r.helpfulCount || 0,
                    }}
                  />
                );
              })
            )}
          </div>

         

          {/* Review Input - Show only if user hasn't reviewed yet */}
          {!myReview && <ConditionalReviewInput productId={productId} />}
        </div>
      </section>
    </ReviewsErrorBoundary>
  );
};

export default ProductReviews;