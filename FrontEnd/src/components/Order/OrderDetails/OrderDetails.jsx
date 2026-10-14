import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Image from "../../../Images/img_png.png";
import ReviewCard from "../../Review/ReviewCard/ReviewCard";
import OrderReview from "../OrderReview/OrderReview";
import { downloadInvoice, downloadLabel } from "../../../Redux/documentSlice";
import CancelOrderModal from "../CancelOrderModal/CancelOrderModal";



import { User } from "lucide-react";
import {
  getOrderById,
  clearCurrentOrder,
  cancelOrder,
  submitOrderRating,
  clearError,
} from "../../../Redux/orderSlice";
import { fetchReviews } from "../../../Redux/reviewsSlice";
import {
  ChevronRight,
  Home,
  MessageCircle,
  Download,
  Star,
  ChevronDown,
  X,
} from "lucide-react";
import "./OrderDetails.css";
import {
  getEstimatedDelivery,
  formatEstimatedDeliveryDate,
  isInDeliveryWindow,
} from "../../../utils/deliveryEta";

const OrderDetails = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, token } = useSelector((state) => state.user);
  const { currentOrder, loading, error } = useSelector((state) => state.orders);
  const { items: productReviews } = useSelector((state) => state.reviews);

  const orderId = searchParams.get("order_id") || searchParams.get("OrderId") || searchParams.get("orderId");
  const itemId = searchParams.get("item_id") || searchParams.get("ItemId") || searchParams.get("itemId");

  // Determine which product item in the order to show based on itemId
  // OrderDetails.jsx - Fixed selectedItem memo
  const selectedItem = React.useMemo(() => {
    if (!currentOrder || !Array.isArray(currentOrder.products)) return null;

    if (itemId) {
      // Try to match by itemId first
      const foundById = currentOrder.products.find((p) => String(p.itemId) === String(itemId));
      if (foundById) return foundById;

      // If no match by itemId, try to match using the same derivation logic as OrderList
      const deriveItemId = (order, productItem, index) => {
        if (productItem?.itemId) return productItem.itemId;
        const orderId = order?.orderId || "";
        const base = orderId.startsWith("OD") ? orderId.slice(2) : "";
        if (base) {
          try {
            return String(BigInt(base) + BigInt(index));
          } catch (_) {
            return `${base}${index}`;
          }
        }
        const fallbackBase = String(order?._id || "").replace(/[^0-9]/g, "").padEnd(18, "0");
        return `${fallbackBase}${index}`;
      };

      // Check each product with the same derivation method
      for (let i = 0; i < currentOrder.products.length; i++) {
        const derivedId = deriveItemId(currentOrder, currentOrder.products[i], i);
        if (String(derivedId) === String(itemId)) {
          return currentOrder.products[i];
        }
      }
    }

    return currentOrder.products[0] || null;
  }, [currentOrder, itemId]);

  const slugify = (str) =>
    str
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  const getProductURL = (product) => {
    const categorySlug = product.category
      ? slugify(product.category)
      : "products";
    const subcategorySlug = product.subcategory
      ? slugify(product.subcategory)
      : "general";
    const productNameSlug = slugify(product.name);
    const productIdSlug = product._id ? slugify(product._id) : "";

    return `/${categorySlug}/${subcategorySlug}/${productNameSlug}/${productIdSlug}`;
  };

  // Rating state
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewPhotos, setReviewPhotos] = useState([]);
  const [reviewPhotoPreviews, setReviewPhotoPreviews] = useState([]);
  const [isRatingSubmitted, setIsRatingSubmitted] = useState(false);
  const [ratingText, setRatingText] = useState("");

  // Cancel modal state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // Load existing rating if available
  useEffect(() => {
    if (currentOrder?.rating?.stars) {
      setRating(currentOrder.rating.stars);
      setRatingText(currentOrder.rating.text || "");
      setIsRatingSubmitted(true);
    }
  }, [currentOrder]);

  // Fetch product reviews for the selected item when available
  useEffect(() => {
    if (selectedItem?.product?._id) {
      dispatch(fetchReviews(selectedItem.product._id));
    }
  }, [selectedItem, dispatch]);

  // Refresh order details when product reviews change (in case review was submitted from ProductDetail)
  useEffect(() => {
    if (productReviews && productReviews.length > 0 && selectedItem?.product?._id) {
      const userReview = productReviews.find(
        (r) => String(r.user?._id || r.user) === String(user?._id)
      );
      if (userReview && !currentOrder.rating) {
        // User has reviewed the product but order doesn't have rating, refresh order
        fetchOrderDetails();
      }
    }
  }, [productReviews, currentOrder, user, selectedItem]);

  // Check if user has already reviewed this product
  const hasUserReviewedProduct = () => {
    if (!user || !productReviews) return false;
    return productReviews.some((r) => String(r.user?._id || r.user) === String(user._id));
  };

  const getLoggedInUserReview = () => {
    if (!user || !productReviews) return null;
    return productReviews.find((r) => String(r.user?._id || r.user) === String(user._id)) || null;
  };

  useEffect(() => {
    if (!user || !token) {
      toast.error("Please login to view order details");
      navigate("/login", { replace: true });
      return;
    }

    if (orderId) {
      fetchOrderDetails();
    }

    return () => {
      dispatch(clearCurrentOrder());
    };
  }, [orderId, user, token, navigate, dispatch]);

  const fetchOrderDetails = async () => {
    try {
      await dispatch(getOrderById(orderId)).unwrap();
    } catch (err) {
      console.error("Failed to fetch order details:", err);
      toast.error("Failed to load order details");
    }
  };

  const handleCancelOrder = async (cancelReason) => {
    if (!currentOrder) return;

    setIsCancelling(true);
    try {
      await dispatch(cancelOrder({ orderId: currentOrder._id, cancelReason })).unwrap();
      toast.success("Order cancelled successfully");
      setShowCancelModal(false);
      // Refresh order details to get updated status
      await fetchOrderDetails();
    } catch (err) {
      console.error("Failed to cancel order:", err);
      toast.error(err.message || "Failed to cancel order");
    } finally {
      setIsCancelling(false);
    }
  };

  // Handle Invoice Download 

  const handleDownloadInvoice = async () => {
    console.log("Invoice button clicked, orderId:", currentOrder?._id);
    if (!currentOrder?._id) {
      console.warn("No orderId found for invoice");
      return;
    }
    try {
      await dispatch(downloadInvoice(currentOrder._id)).unwrap();
      console.log("Invoice download dispatched");
    } catch (err) {
      console.error("Invoice download error:", err);
      toast.error(err || "Failed to download invoice");
    }
  };

  const handleDownloadLabel = async () => {
    console.log("Label button clicked, orderId:", currentOrder?._id);
    if (!currentOrder?._id) {
      console.warn("No orderId found for label");
      return;
    }
    try {
      await dispatch(downloadLabel(currentOrder._id)).unwrap();
      console.log("Label download dispatched");
    } catch (err) {
      console.error("Label download error:", err);
      toast.error(err || "Failed to download label");
    }
  };



  const handleRatingSubmit = async () => {
    // if (rating === 0) {
    //   toast.error("Please select a rating");
    //   return;
    // }

    // Check if order is delivered before submitting rating
    // if (currentOrder.deliveryStatus !== "Delivered") {
    //   toast.error("Can only rate delivered orders");
    //   return;
    // }

    try {
      const ratingData = {
        stars: rating,
        text: ratingText,
        photos: reviewPhotos,
      };

      await dispatch(
        submitOrderRating({
          orderId: currentOrder._id,
          ratingData,
        })
      ).unwrap();

      toast.success(`Rating submitted: ${rating} stars`);
      setIsRatingSubmitted(true);
      setReviewPhotos([]);
      setReviewPhotoPreviews([]);

      // Refresh order details to get updated data
      await fetchOrderDetails();

      // Refresh product reviews to sync with the new review for the selected item
      if (selectedItem?.product?._id) {
        dispatch(fetchReviews(selectedItem.product._id));
      }
    } catch (error) {
      console.error("Failed to submit rating:", error);
      const msg =
        error?.response?.data?.message ||
        (typeof error === "string" ? error : error?.message) ||
        "Failed to submit rating";
      toast.error(msg);
      dispatch(clearError());
    }
  };

  const handleRatingChange = (newRating) => {
    setRating(newRating);
    setRatingText(getRatingText(newRating));
  };

  const getRatingText = (stars) => {
    switch (stars) {
      case 1:
        return "Poor";
      case 2:
        return "Fair";
      case 3:
        return "Good";
      case 4:
        return "Very Good";
      case 5:
        return "Excellent";
      default:
        return "";
    }
  };

  const handlePhotoUpload = (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;
    const nextFiles = [...reviewPhotos, ...files].slice(0, 6);
    const nextPreviews = [
      ...reviewPhotoPreviews,
      ...files.map((f) => URL.createObjectURL(f)),
    ].slice(0, 6);
    setReviewPhotos(nextFiles);
    setReviewPhotoPreviews(nextPreviews);
  };

  const removePhotoAt = (index) => {
    const nextFiles = reviewPhotos.filter((_, i) => i !== index);
    const nextPreviews = reviewPhotoPreviews.filter((_, i) => i !== index);
    setReviewPhotos(nextFiles);
    setReviewPhotoPreviews(nextPreviews);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };


  const getExpectedDeliveryDate = (orderDate, status) => {
    if (status === "delivered" || status === "cancelled") return null;

    const eta = getEstimatedDelivery(orderDate);

    if (isInDeliveryWindow(orderDate)) {
      return eta.toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    }

    return formatEstimatedDeliveryDate(orderDate, eta);
  };

  const calculateTotal = (items) => {
    return items.reduce((total, item) => total + (item.price ?? item.product?.offeredPrice) * item.quantity, 0);
  };

  if (loading) {
    return (
      <div className="order-details-container">
        <div className="order-details-wrapper">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentOrder) {
    return (
      <div className="order-details-container">
        <div className="order-details-wrapper">
          <div className="error-container">
            <h3>Error Loading Order</h3>
            <p>{error || "Order not found"}</p>
            <button onClick={() => navigate("/OrderList")} className="back-btn">
              Back to Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="order-details-container">
        <div className="order-details-wrapper">
          {/* Breadcrumb */}
          <nav className="breadcrumb">
            <button onClick={() => navigate("/")} className="breadcrumb-link">
              Home
            </button>
            <ChevronRight className="breadcrumb-separator" />
            <button
              onClick={() => navigate("/profile")}
              className="breadcrumb-link"
            >
              Profile
            </button>
            <ChevronRight className="breadcrumb-separator" />
            {/* <button
              onClick={() => navigate("/OrderList")}
              className="breadcrumb-link"
            > */}
            <button
              onClick={() => navigate("/OrderList")}
              className="breadcrumb-link"
            >
              My Orders
            </button>
            <ChevronRight className="breadcrumb-separator" />
            <span className="breadcrumb-current">
              {currentOrder._id.slice(-8).toUpperCase()}
            </span>
          </nav>

          <div className="order-details-grid">
            {/* Left Column - Order Details */}
            <div className="order-details-left">
              {/* Product Info */}
              <div className="detail-card">
                <div className="detail-card-content">
                  {/* Product Info Section */}
                  <div
                    className="product-details"
                    onClick={(e) => {
                      e.stopPropagation();
                      const product = selectedItem?.product;
                      if (product) navigate(getProductURL(product));
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <img
                      src={
                        selectedItem?.product?.images?.[0] ||
                        selectedItem?.product?.image ||
                        "/placeholder.svg"
                      }
                      alt={selectedItem?.product?.name || "Product"}
                      className="product-details-image"
                    />
                    <div className="product-details-info">
                      <h1 className="product-details-title">
                        {selectedItem?.product?.name ||
                          `Order #${currentOrder._id.slice(-8).toUpperCase()}`}
                      </h1>
                      <p className="product-details-seller">
                        {(selectedItem?.status || currentOrder.deliveryStatus)?.toLowerCase() !== 'delivered' && `Expected Date: ${getExpectedDeliveryDate(currentOrder.createdAt, currentOrder.deliveryStatus)}`}
                      </p>
                      <div className="product-details-price">
                        <span className="price-main">
                          ₹
                          {((selectedItem?.price ?? selectedItem?.product?.offeredPrice) * (selectedItem?.quantity ?? 0)) || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Order Timeline */}
                  <hr className="product-timeline-divider" />

                  {/* Order Timeline Section */}
                  <div
                    className={`timeline ${(selectedItem?.status || currentOrder.deliveryStatus) === "Cancelled"
                      ? "timeline-cancelled"
                      : (selectedItem?.status || currentOrder.deliveryStatus) === "Dispatched"
                        ? "timeline-dispatched"
                        : (selectedItem?.status || currentOrder.deliveryStatus) === "Shipped"
                          ? "timeline-shipped"
                          : (selectedItem?.status || currentOrder.deliveryStatus) === "Out for Delivery"
                            ? "timeline-out-for-delivery"
                            : (selectedItem?.status || currentOrder.deliveryStatus) === "Delivered"
                              ? "timeline-delivered"
                              : ""
                      }`}
                  >
                    {/* Order Confirmed - Always Active */}
                    <div className="timeline-item">
                      <div className="timeline-dot timeline-dot-active"></div>
                      <div>
                        <p className="timeline-text">
                          Order Confirmed, {formatDate(currentOrder.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* Show other timeline items only if not cancelled */}
                    {(selectedItem?.status || currentOrder.deliveryStatus) !== "Cancelled" && (
                      <>
                        {/* Dispatched */}
                        <div className="timeline-item">
                          <div
                            className={`timeline-dot ${(selectedItem?.status || currentOrder.deliveryStatus) === "Dispatched" ||
                              (selectedItem?.status || currentOrder.deliveryStatus) === "Shipped" ||
                              (selectedItem?.status || currentOrder.deliveryStatus) === "Out for Delivery" ||
                              (selectedItem?.status || currentOrder.deliveryStatus) === "Delivered"
                              ? "timeline-dot-active"
                              : ""
                              }`}
                          ></div>
                          <div>
                            <p className="timeline-text">Dispatched</p>
                          </div>
                        </div>

                        {/* Shipped */}
                        <div className="timeline-item">
                          <div
                            className={`timeline-dot ${(selectedItem?.status || currentOrder.deliveryStatus) === "Shipped" ||
                              (selectedItem?.status || currentOrder.deliveryStatus) === "Out for Delivery" ||
                              (selectedItem?.status || currentOrder.deliveryStatus) === "Delivered"
                              ? "timeline-dot-active"
                              : ""
                              }`}
                          ></div>
                          <div>
                            <p className="timeline-text">Shipped</p>
                          </div>
                        </div>

                        {/* Out for Delivery */}
                        <div className="timeline-item">
                          <div
                            className={`timeline-dot ${(selectedItem?.status || currentOrder.deliveryStatus) === "Out for Delivery" ||
                              (selectedItem?.status || currentOrder.deliveryStatus) === "Delivered"
                              ? "timeline-dot-active"
                              : ""
                              }`}
                          ></div>
                          <div>
                            <p className="timeline-text">Out for Delivery</p>
                          </div>
                        </div>

                        {/* Delivered */}
                        <div className="timeline-item">
                          <div
                            className={`timeline-dot ${(selectedItem?.status || currentOrder.deliveryStatus) === "Delivered"
                              ? "timeline-dot-active"
                              : ""
                              }`}
                          ></div>
                          <div>
                            <p className="timeline-text">Delivered</p>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Cancelled - Show only if cancelled */}
                    {selectedItem?.status === "Cancelled" && (
                      <div className="timeline-item">
                        <div className="timeline-dot timeline-dot-cancelled"></div>
                        <div>
                          <p className="timeline-text timeline-text-cancelled">
                            Cancelled,{" "}
                            {formatDate(
                              currentOrder.cancelledAt || currentOrder.createdAt
                            )}
                          </p>
                          {/* {selectedItem?.cancelledBy && (
                            <p className="timeline-cancel-info">
                              <strong>
                                Cancelled by {selectedItem.cancelledBy === 'user' ? 'User' : 'Delivery Partner'}:
                              </strong>{" "}
                              {selectedItem.cancelReason || 'No reason provided'}
                            </p>
                          )} */}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Chat Support */}
              {/* <div className="detail-card">
                <div className="detail-card-content">
                  <button className="chat-button">
                    <MessageCircle className="chat-icon" />
                    Chat with us
                  </button>
                </div>
              </div> */}

              {/* Rating Section - Only show for delivered orders */}


              <OrderReview productId={selectedItem?.product?._id} />


            </div>

            {/* Right Column - Delivery & Price Details */}
            <div className="order-details-right">
              {/* Delivery Details */}
              <div className="detail-card">
                <div className="detail-card-header">
                  <h3 className="detail-card-title">Delivery details</h3>
                </div>
                <div className="detail-card-content">
                  <div className="delivery-details">
                    <div className="delivery-item">
                      <Home className="delivery-icon" />
                      <div className="delivery-info">
                        <p className="delivery-label">Home</p>
                        <p className="delivery-value">
                          {currentOrder.shippingAddress
                            ? `${currentOrder.shippingAddress.street}, ${currentOrder.shippingAddress.city}, ${currentOrder.shippingAddress.state} ${currentOrder.shippingAddress.pincode}`
                            : "No shipping address provided"}
                        </p>
                      </div>
                    </div>
                    <div className="delivery-item">
                      <div className="delivery-avatar">
                        <div className="avatar-icon">
                          <User />
                        </div>
                      </div>
                      <div className="delivery-info">
                        <p className="delivery-label">
                          {currentOrder.shippingAddress?.fullName || "N/A"}
                        </p>
                        <p className="delivery-value">
                          {currentOrder.shippingAddress?.phone || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Price Details */}
              <div className="detail-card">
                <div className="detail-card-header">
                  <h3 className="detail-card-title">Price Details</h3>
                </div>
                <div className="detail-card-content">
                  <div className="price-details">
                    {/* Listing Price */}
                    <div className="price-row">
                      <span>Listing Price</span>
                      <span className="orderList-strike-price">
                        ₹
                        {(selectedItem?.product?.originalPrice || selectedItem?.price) ?? selectedItem?.product?.offeredPrice}
                      </span>
                    </div>

                    {/* Selling Price */}
                    <div className="price-row">
                      <span>Selling Price</span>
                      <span>₹{selectedItem?.price ?? selectedItem?.product?.offeredPrice}</span>
                    </div>

                    <hr className="price-divider" />

                    {/* Total Amount */}
                    <div className="price-total-row">
                      <span>Total Amount</span>
                      <span>
                        ₹{currentOrder?.totalAmount || calculateTotal(currentOrder.products || [])}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {/* Action Buttons */}
              <div className="action-buttons-container">

                {/* Always visible buttons */}
                {[
                  { label: "Download Invoice", onClick: handleDownloadInvoice, Icon: Download },
                  { label: "Download Label", onClick: handleDownloadLabel, Icon: Download },
                ].map(({ label, onClick, Icon }) => (
                  <button key={label} className="download-button" onClick={onClick}>
                    <Icon className="download-icon" />
                    {label}
                  </button>
                ))}

                {/* Cancel / Cancelled button */}
                {((selectedItem?.status).toLowerCase() === "dispatched" || (selectedItem?.status).toLowerCase() === "shipped" || (selectedItem?.status).toLowerCase() === "pending") && (
                  <button onClick={() => setShowCancelModal(true)} className="cancel-button">
                    <X className="cancel-icon" />
                    Cancel Order
                  </button>
                )}

                {(currentOrder.deliveryStatus || "").toLowerCase() === "cancelled" && (
                  <button disabled className="cancel-button cancelled">
                    <X className="cancel-icon" />
                    Order Cancelled
                  </button>
                )}

              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Cancel Order Modal */}
      <CancelOrderModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelOrder}
        loading={isCancelling}
      />

    </>);
};

export default OrderDetails;