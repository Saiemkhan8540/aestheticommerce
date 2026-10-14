import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchReviews, submitReview, clearReviews } from "../../../Redux/reviewsSlice";
import { getMyOrders } from "../../../Redux/orderSlice";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ReviewCard from "../ReviewCard/ReviewCard";
import ReviewInput from "../ReviewInput/ReviewInput";
import RatingBreakdown from "../RatingBreakdown/RatingBreakdown";
import RatingStars from "../../Product/RatingStars/RatingStars.jsx";
import "./ProductReview.css";

// Helper: Conditionally render the ReviewInput based on auth, purchase status, and whether user already reviewed
const ConditionalReviewInput = ({ productId }) => {
  const dispatch = useDispatch();
  const { items: reviews, submitLoading, error: reviewsError } = useSelector((s) => s.reviews);
  const { user, token } = useSelector((s) => s.user);
  const { myOrders, loading: ordersLoading, error: ordersError } = useSelector((s) => s.orders);

  // Validate productId
  if (!productId) {
    console.warn('ConditionalReviewInput: productId is missing or undefined');
    return null;
  }

  // Debug: Log the current state
  console.log('ConditionalReviewInput state:', {
    user: user?._id,
    token: !!token,
    myOrders: myOrders,
    ordersLoading,
    ordersError,
    productId,
    productIdType: typeof productId
  });

  if (!user || !token) {
    // return (
    //   <div className="ProductReview-login-required">
    //     <p>Please login to write a review.</p>
    //   </div>
    // );
    return null; // Show nothing if user is not logged in
  }

  // Show loading state while fetching orders
  if (ordersLoading) {
    // return (
    //   <div className="ProductReview-loading">
    //     <p>Checking purchase status...</p>
    //   </div>
    // );
    return null;   // Show nothing while loading
  }

  // Show error if orders failed to load
  if (ordersError) {
    // console.error('Error loading orders:', ordersError);
    // return (
    //   <div className="ProductReview-error">
    //     <p>Error checking purchase status. Please try again.</p>
    //   </div>
    // );
    return null; // Show nothing on error
  }

  // Check if user has purchased this product
  const hasPurchased = (myOrders || []).some(order => {
    // Check if order has products array
    if (!order.products || !Array.isArray(order.products)) {
      return false;
    }
    
    // Check each product in the order
    return order.products.some(product => {
      // The backend populates products.product, so we need to check product.product._id
      const productIdToCheck = product.product?._id || product.productId || product.product || product.id;
      const matches = String(productIdToCheck) === String(productId);
      return matches;
    });
  });

  console.log('Purchase check result:', { 
    userId: user?._id, 
    productId, 
    hasPurchased, 
    orderCount: myOrders?.length || 0
  });

  if (!hasPurchased) {
    // return (
    //   <div className="ProductReview-purchase-required">
    //     <p>You can only write a review after purchasing this product.</p>
    //   </div>
    // );
    return null;  // Show nothing if user hasn't purchased the product
  }

  const hasReviewed = (reviews || []).some((r) => String(r.user?._id || r.user) === String(user?._id));
  if (hasReviewed) return null;

  return (
    <ReviewInput
      submitting={submitLoading}
      onSubmit={async ({ stars, text, files }) => {
        await dispatch(submitReview({ productId, stars, text, photos: files })).unwrap();
        await dispatch(fetchReviews(productId));
      }}
    />
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
  const { myOrders } = useSelector((s) => s.orders);
  const { user, token } = useSelector((s) => s.user);
  const [sortBy, setSortBy] = useState("most-recent");
  const [showAll, setShowAll] = useState(false);

  // Validate productId
  if (!productId) {
    console.warn('ProductReviews: productId is missing or undefined');
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'orange' }}>
        <h3>Product ID Missing</h3>
        <p>Unable to load reviews for this product.</p>
      </div>
    );
  }

  // Debug: Log orders when they change
  useEffect(() => {
    if (myOrders && myOrders.length > 0) {
      console.log('Orders received:', myOrders);
    }
  }, [myOrders]);

  const sortOptions = [
    { value: "most-recent", label: "Most Recent" },
    { value: "highest-rated", label: "Highest Rated" },
    { value: "lowest-rated", label: "Lowest Rated" },
    { value: "most-helpful", label: "Most Helpful" }
  ];

  useEffect(() => {
    if (productId) {
      dispatch(clearReviews());
      dispatch(fetchReviews(productId));
    }
  }, [productId, dispatch]);

  // Fetch orders to check purchase status
  useEffect(() => {
    if (user && token) {
      dispatch(getMyOrders()).catch(error => {
        console.error('Error fetching orders:', error);
      });
    }
  }, [dispatch, user, token]);

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

  const displayed = showAll ? sorted : sorted.slice(0, 3);

    return (
    <ReviewsErrorBoundary>
      <section className="ProductReview-reviews-section">
        <div className="ProductReview-reviews-container">
          {/* Section Header */}
          <div className="ProductReview-section-header">
            <h2 className="ProductReview-section-title">Customer Reviews</h2>
            <div className="ProductReview-rating-summary">
              <RatingStars rating={Number(averageRating)} size="lg" />
              <span className="ProductReview-avg-rating">{averageRating}</span>
              <span className="ProductReview-out-of">out of 5</span>
            </div>
            <p className="ProductReview-review-count">Based on {totalReviews} reviews</p>
          </div>

          {/* Rating Breakdown */}
          <RatingBreakdown data={ratingData} totalReviews={totalReviews} />

          {/* Sort Options */}
          <div className="ProductReview-reviews-toolbar">
            <h3 className="ProductReview-reviews-title">Reviews ({totalReviews})</h3>
            <div className="ProductReview-sort-container">
              <CustomDropdown
                value={sortBy}
                onChange={setSortBy}
                options={sortOptions}
              />
            </div>
          </div>

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
                      _id: r._id || idx,
                      name: nameStr,
                      avatar: "",
                      rating: r.stars,
                      date: r.createdAt,
                      text: r.text,
                      images: r.photos || [],
                      helpfulCount: r.helpfulCount || 0,
                      productId: productId, // Pass the productId for helpful button
                      product: productId, // Alternative field name
                    }}
                    allReviews={displayed.map((review, index) => ({
                      id: review._id || index,
                      _id: review._id || index,
                      name: (() => {
                        const fn = review.user?.fullname;
                        return typeof fn === "object"
                          ? [fn.firstname, fn.lastname].filter(Boolean).join(" ") || "Anonymous"
                          : (fn || review.user?.name || "Anonymous");
                      })(),
                      images: review.photos || [],
                      helpfulCount: review.helpfulCount || 0,
                    }))}
                  />
                );
              })
            )}
          </div>

          {/* Load More Button */}
          {!showAll && totalReviews > 3 && (
            <div className="ProductReview-load-more-container">
              <button 
                className="ProductReview1-load-more-btn" 
                onClick={() => setShowAll(true)}
              >
                Show More Reviews
              </button>
            </div>
          )}

          {/* Review Input - Hide if the current user has already reviewed */}
          <ConditionalReviewInput productId={productId} />
        </div>
      </section>
    </ReviewsErrorBoundary>
  );
};

export default ProductReviews;