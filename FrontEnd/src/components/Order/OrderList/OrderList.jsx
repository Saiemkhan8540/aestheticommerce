import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  getMyOrders,
  getOrderById,
  clearCurrentOrder,
} from "../../../Redux/orderSlice";
import { Search, Star } from "lucide-react";
import { Button } from "../../../ui/Button";
import "./OrderList.css";
import {
  getEstimatedDelivery,
  formatEstimatedDeliveryDate,
  isInDeliveryWindow,
} from "../../../utils/deliveryEta";

const OrderList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.user);
  const { myOrders, currentOrder, loading, error } = useSelector(
    (state) => state.orders
  );

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!user || !token) {
      toast.error("Please login to view your orders");
      navigate("/login", { replace: true });
      return;
    }
    fetchOrders();
  }, [user, token, navigate]);

  const fetchOrders = async () => {
    try {
      await dispatch(getMyOrders()).unwrap();
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      toast.error("Failed to load orders");
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "delivered";
      case "shipped":
        return "shipped";
      case "pending":
        return "pending";
      case "dispatched":
        return "dispatched";
      case "cancelled":
        return "cancelled";
      default:
        return "default";
    }
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
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handleViewOrder = async (order) => {
    try {
      await dispatch(getOrderById(order._id)).unwrap();
      setSelectedOrder(order);
    } catch (err) {
      console.error("Failed to fetch order details:", err);
      toast.error("Failed to load order details");
    }
  };

  const handleCloseModal = () => {
    setSelectedOrder(null);
    dispatch(clearCurrentOrder());
  };

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
    // Fallback if no human orderId yet: derive from mongo id (not ideal but stable per item)
    const fallbackBase = String(order?._id || "").replace(/[^0-9]/g, "").padEnd(18, "0");
    return `${fallbackBase}${index}`;
  };

  const handleOrderClick = (order, productItem, index) => {
    const orderId = order.orderId || order._id;
    const itemId = deriveItemId(order, productItem, index);
    if (itemId) {
      navigate(`/order_Details?order_id=${orderId}&item_id=${itemId}`);
    } else {
      navigate(`/order_Details?order_id=${orderId}`);
    }
  };

  const filteredOrders = myOrders.filter((order) => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    const statusLower = (order.deliveryStatus || '').toLowerCase();
    const dateStr = new Date(order.createdAt)
      .toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
      .toLowerCase();
    return (
      order._id?.toLowerCase().includes(searchLower) ||
      statusLower.includes(searchLower) ||
      dateStr.includes(searchLower) ||
      order.products?.some(
        (item) =>
          item.product?.name?.toLowerCase().includes(searchLower) ||
          item.product?.description?.toLowerCase().includes(searchLower)
      )
    );
  });

  if (loading && myOrders.length === 0) {
    return (
      <div className="orderlist-container">
        <div className="orderlist-wrapper">
          <div className="orderlist-loading-container">
            <div className="orderlist-loading-spinner"></div>
            <p>Loading your orders...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="orderlist-container">
        <div className="orderlist-wrapper">
          <div className="orderlist-error-container">
            <div className="orderlist-error-icon">⚠️</div>
            <h3>Error Loading Orders</h3>
            <p>{error}</p>
            <Button onClick={fetchOrders} variant="default" size="lg">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="orderlist-container">
      <div className="orderlist-wrapper">
        {/* Search Bar */}
        <div className="orderlist-search-container">
          <div className="search-wrapper">
            <div className="search-input-wrapper">
              <input
                type="text"
                placeholder="Search your orders here"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="orderlist-search-input"
              />
            </div>
            <Button className="orderList-search-button">
              <Search className="orderList-search-icon" />
              Search Orders
            </Button>
          </div>
        </div>

        {/* Orders List */}
        <div className="orderlist-orders-section">
          <div className="orders-grid">
            {filteredOrders.length === 0 ? (
              <div className="orderlist-empty-state">
                <div className="orderlist-empty-icon">📦</div>
                <h3>No orders found</h3>
                <p>You haven't placed any orders yet</p>
                <Button
                  onClick={() => navigate("/products")}
                  variant="default"
                  size="lg"
                >
                  Start Shopping
                </Button>
              </div>
            ) : (
              filteredOrders.map((order) =>
                order.products?.map((productItem, productIndex) => (
                  <div
                    key={`${order._id}-${productIndex}`}
                    className="orderlist-order-card"
                  >
                    <div className="order-content" onClick={() => handleOrderClick(order, productItem, productIndex)}>
                      <div className="order-layout">
                        {/* Product Image */}
                        <div className="product-image-container">
                          <img
                            src={
                              productItem.product?.images?.[0] ||
                              productItem.product?.image ||
                              "/placeholder.svg"
                            }
                            alt={productItem.product?.name || "Product"}
                            className="orderlist-product-image"
                          />
                        </div>

                        {/* Product Info */}

                        <div className="orderList-product-info">
                          <button

                            className="orderList-product-title"
                          >
                            <h3 className="orderlist-line-clamp-2">
                              {productItem.product?.name ||
                                `Product ${productIndex + 1}`}
                            </h3>
                          </button>
                          {/* Display the per-item itemId for clarity */}
                          {/* {(() => {
                            const idToShow = deriveItemId(order, productItem, productIndex);
                            return idToShow ? (
                              <p className="orderList-product-subtitle">
                                Item ID: {idToShow}
                              </p>
                            ) : null;
                          })()} */}
                          <p className="orderList-product-subtitle">
                            Quantity: {productItem.quantity}
                            {productItem.status?.toLowerCase() !== 'delivered' && ` | Expected Date: ${getExpectedDeliveryDate(order.createdAt, order.deliveryStatus)}`}
                          </p>
                          {/* {order.products.length > 1 && (
                            <p className="order-multiple-items">
                              Part of order with {order.products.length} items
                            </p>
                          )} */}
                        </div>

                        {/* Price - Centered */}
                        <div className="orderlist-price-section">
                          <div className="price-container">
                            <p className="orderlist-price-amount">
                              ₹{(productItem.price ?? productItem.product?.offeredPrice) * productItem.quantity}
                            </p>
                          </div>
                        </div>
                        {/* Status */}
                        <div className="status-section">
                          <div className="status-indicator">
                            <div
                              className={`orderlist-status-dot orderlist-status-dot-${getStatusColor(
                                productItem.status || order.deliveryStatus
                              )}`}
                            ></div>
                            <span className="status-text">
                              {(() => {
                                const s = (productItem.status || order.deliveryStatus || '').toLowerCase();
                                // Get the item's tracking update time if available
                                const getItemUpdate = () => {
                                  if (productItem.trackingInfo?.updatedAt) {
                                    return formatDate(productItem.trackingInfo.updatedAt);
                                  }
                                  return formatDate(order.createdAt);
                                };

                                if (s === 'delivered') return `Delivered on ${getItemUpdate()}`;
                                if (s === 'shipped') return `Shipped on ${getItemUpdate()}`;
                                if (s === 'out for delivery') return `Out for delivery on ${getItemUpdate()}`;
                                if (s === 'dispatched') return `Dispatched on ${getItemUpdate()}`;
                                if (s === 'pending') return 'Processing';
                                if (s === 'cancelled') return 'Cancelled';
                                return 'Processing';
                              })()}
                            </span>
                          </div>

                          {/* Expected Delivery Date */}
                          {(order.deliveryStatus || '').toLowerCase() === "dispatched" && (
                            <p className="expected-delivery-date">
                              Expected delivery: {" "}
                              {getExpectedDeliveryDate(
                                order.createdAt,
                                order.deliveryStatus
                              )}
                            </p>
                          )}

                          {/* Delivered Date */}
                          {(order.deliveryStatus || '').toLowerCase() === "delivered" && (
                            <p className="delivered-date">
                              Delivered on {formatDate(order.createdAt)}
                            </p>
                          )}

                          <p className="status-message">
                            {(productItem.status || order.deliveryStatus || '').toLowerCase() === "delivered"
                              ? "Your item has been delivered"
                              : (productItem.status || order.deliveryStatus || '').toLowerCase() === "out for delivery"
                                ? "Your item is out for delivery"
                                : (productItem.status || order.deliveryStatus || '').toLowerCase() === "shipped"
                                  ? "Your item is on the way"
                                  : (productItem.status || order.deliveryStatus || '').toLowerCase() === "dispatched"
                                    ? "We are preparing your order"
                                    : (productItem.status || order.deliveryStatus || '').toLowerCase() === "cancelled"
                                      ? "This order has been cancelled"
                                      : "We are Processing your order"}
                          </p>

                          {order.deliveryStatus === "delivered" && (
                            <button className="orderlist-review-button">
                              <Star className="star-icon" />
                              Rate & Review Product
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )
            )}
          </div>
        </div>

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="orderlist-modal-overlay">
            <div className="orderlist-modal-content">
              <div className="orderlist-modal-header">
                <h2 className="orderlist-modal-title">Order Details</h2>
                <button
                  onClick={handleCloseModal}
                  className="orderlist-close-button"
                >
                  ×
                </button>
              </div>

              <div className="orderlist-modal-body">
                <div className="order-details-grid">
                  {/* Left Column - Order Details */}
                  <div className="order-details-left">
                    {/* Product Info */}
                    <div className="orderlist-detail-card">
                      <div className="orderlist-detail-card-content">
                        <div className="product-details">
                          <img
                            src={
                              selectedOrder.products?.[0]?.product
                                ?.images?.[0] ||
                              selectedOrder.products?.[0]?.product?.image ||
                              "/placeholder.svg"
                            }
                            alt={
                              selectedOrder.products?.[0]?.product?.name ||
                              "Product"
                            }
                            className="orderlist-product-details-image"
                          />
                          <div className="product-details-info">
                            <h1 className="product-details-title">
                              {selectedOrder.products?.[0]?.product?.name ||
                                `Order #${selectedOrder._id
                                  .slice(-8)
                                  .toUpperCase()}`}
                            </h1>
                            <p className="product-details-subtitle">
                              {selectedOrder.products?.length || 0}{" "}
                              {selectedOrder.products?.length === 1
                                ? "Item"
                                : "Items"}
                            </p>
                            <p className="product-details-seller">
                              Order Date: {formatDate(selectedOrder.createdAt)}
                            </p>
                            <div className="product-details-price">
                              <span className="price-main">
                                ₹
                                {selectedOrder.totalAmount ||
                                  calculateTotal(selectedOrder.products || [])}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Order Timeline */}
                    <div className="orderlist-detail-card">
                      <div className="orderlist-detail-card-content">
                        <div className="timeline">
                          <div className="timeline-item">
                            <div className="orderlist-timeline-dot"></div>
                            <div>
                              <p className="timeline-text">
                                Order Confirmed,{" "}
                                {formatDate(selectedOrder.createdAt)}
                              </p>
                            </div>
                          </div>
                          {selectedOrder.deliveryStatus === "delivered" && (
                            <div className="timeline-item">
                              <div className="orderlist-timeline-dot"></div>
                              <div>
                                <p className="timeline-text">
                                  Delivered,{" "}
                                  {formatDate(selectedOrder.createdAt)}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Delivery & Price Details */}
                  <div className="order-details-right">
                    {/* Delivery Details */}
                    <div className="orderlist-detail-card">
                      <div className="orderlist-detail-card-header">
                        <h3 className="orderlist-detail-card-title">
                          Delivery details
                        </h3>
                      </div>
                      <div className="orderlist-detail-card-content">
                        <div className="delivery-details">
                          <div className="orderlist-delivery-item">
                            <div className="orderlist-delivery-icon">🏠</div>
                            <div className="delivery-info">
                              <p className="delivery-label">Home</p>
                              <p className="delivery-value">
                                {selectedOrder.shippingAddress
                                  ? `${selectedOrder.shippingAddress.street}, ${selectedOrder.shippingAddress.city}, ${selectedOrder.shippingAddress.state} ${selectedOrder.shippingAddress.pincode}`
                                  : "No shipping address provided"}
                              </p>
                            </div>
                          </div>
                          <div className="orderlist-delivery-item">
                            <div className="orderlist-delivery-icon">👤</div>
                            <div className="delivery-info">
                              <p className="delivery-label">
                                {selectedOrder.shippingAddress?.fullName ||
                                  "N/A"}
                              </p>
                              <p className="delivery-value">
                                {selectedOrder.shippingAddress?.phone || "N/A"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Price Details */}
                    <div className="orderlist-detail-card">
                      <div className="orderlist-detail-card-header">
                        <h3 className="orderlist-detail-card-title">
                          Price Details
                        </h3>
                      </div>
                      <div className="orderlist-detail-card-content">
                        <div className="price-details">
                          <div className="orderlist-price-row">
                            <span>Total Amount</span>
                            <span>
                              ₹
                              {selectedOrder.totalAmount ||
                                calculateTotal(selectedOrder.products || [])}
                            </span>
                          </div>
                          <hr className="price-divider" />
                          <div className="orderlist-price-total-row">
                            <span>Final Amount</span>
                            <span>
                              ₹
                              {selectedOrder.totalAmount ||
                                calculateTotal(selectedOrder.products || [])}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderList;