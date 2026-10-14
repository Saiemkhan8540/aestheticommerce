import React, { useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import orderCompletedVideo from "../../../Images/orderPlacedsuccessful.webm";
import Navbar from '../../Navbar/Navbar'
import Footsec from '../../Footersection/Footersection'
import "./OrderPlaced.css";

const OrderPlaced = () => {
  const [showInvoice, setShowInvoice] = useState(false);
  const location = useLocation();
  const { orderNumber: urlOrderNumber } = useParams();
  const navigate = useNavigate();

  const orderData = location.state?.orderDetails || {};

  const orderDetails = {
    orderNumber: urlOrderNumber || orderData.orderNumber || "Unknown",
    orderDate: orderData.orderDate,
    estimatedDelivery: orderData.estimatedDelivery,
    status: orderData.status,
    transactionId: orderData.transactionId,
  };

  // Use actual products from order data or fallback to dummy data
  const products = orderData.products;

  const shippingAddress = orderData.shippingAddress;

  const paymentInfo = {
    method: orderData.paymentMethod?.name || "Credit Card",
    cardNumber:
      orderData.paymentMethod?.id === "cod"
        ? "Cash on Delivery"
        : "**** **** **** 3456",
    cardType: orderData.paymentMethod?.id === "cod" ? "" : "Visa",
  };

  const orderSummary = orderData.orderSummary;

  const progressSteps = [
    { label: "Order Placed", completed: true, current: true },
    { label: "Processing", completed: false, current: false },
    { label: "Shipped", completed: false, current: false },
    { label: "Delivered", completed: false, current: false },
  ];

  const handleBackToShopping = () => {
    navigate("/products");
  };
  const handleTrackOrder = () => {
    navigate("/OrderList");
  };
  const handleViewOrders = () => {
    navigate("/orders");
  };

  // Format order number for display (show last 8 characters if it's a MongoDB ID)
  const formatOrderNumber = (orderNumber) => {
    if (typeof orderNumber === 'string' && orderNumber.length > 20) {
      // MongoDB ObjectId is 24 characters, show last 8
      return `#${orderNumber.slice(-8).toUpperCase()}`;
    }
    return orderNumber;
  };

  return (
    <div className="app-container">
      {/* Success Header */}
      <div className="header">
        <div className="header-content">
          <div className="header-nav">
            <button onClick={handleBackToShopping} className="back-link">
              <i className="fas fa-arrow-left"></i>
              <span>Back to Shopping</span>
            </button>
            <div className="order-info">
              <div className="order-label"></div>
              <div className="order-number"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="main-content">
        {/* Success Message */}
        <div className="success-order-number">
            <p className="order-number-display">
              Order Number: {formatOrderNumber(orderDetails.orderNumber)}
            </p>
          </div>
        <div className="success-section">
          <h1 className="success-title">Order Placed Successfully!</h1>
          <p className="success-description">
            Thank you for your purchase. Your order has been confirmed and will
            be processed soon.
          </p>

          <div className="success-icon">
            {/* <i className="fas fa-check"></i> */}

            <video
              autoPlay
              loop
              muted
              playsInline
              preload="auto" // ensures faster start
              style={{
                maxWidth: "100%",
                height: "auto",
                borderRadius: "12px",
              }}
            >
              <source src={orderCompletedVideo} type="video/webm" />
              Your browser does not support the video tag.
            </video>
          </div>
         
        </div>

        {/* Order Status */}
        <div className="status-card">
          <div className="status-header">
            <div>
              <h2 className="status-title">Order Status</h2>
              <p className="delivery-info">
                Estimated delivery:{" "}
                <span className="delivery-date">
                  {orderDetails.estimatedDelivery}
                </span>
              </p>
            </div>
            <div className="status-actions">
              <button onClick={handleTrackOrder} className="track-btn">
                <i className="fas fa-truck"></i>
                Track Order
              </button>
              <button onClick={handleBackToShopping} className="continue-btn">
                Continue Shopping
              </button>
            </div>
          </div>

          {/* Progress Indicator {/* Progress Indicator */}
          <div className="OrderPlacedTimeline">
            {/* Order Confirmed - Always Active */}
            <div className="OrderPlacedTimelineItem">
              <div className="OrderPlacedTimelineDot OrderPlacedTimelineDotActive"></div>
              <div>
                <p className="OrderPlacedTimelineText">
                  Order Confirmed
                  {/* , {orderDetails.orderDate} */}
                </p>
              </div>
            </div>
            {/* Processing */}
            <div className="OrderPlacedTimelineItem">
              <div className="OrderPlacedTimelineDot"></div>
              <div>
                <p className="OrderPlacedTimelineText">
                  Processing
                  {/* , {orderDetails.orderDate} */}
                </p>
              </div>
            </div>
            {/* Shipped */}
            <div className="OrderPlacedTimelineItem">
              <div className="OrderPlacedTimelineDot"></div>
              <div>
                <p className="OrderPlacedTimelineText">
                  Shipped
                  {/* , {orderDetails.orderDate} */}
                </p>
              </div>
            </div>
            {/* Out for Delivery */}
            <div className="OrderPlacedTimelineItem">
              <div className="OrderPlacedTimelineDot"></div>
              <div>
                <p className="OrderPlacedTimelineText">
                  Out for Delivery
                  {/* , {orderDetails.orderDate} */}
                </p>
              </div>
            </div>
            {/* Delivered */}
            <div className="OrderPlacedTimelineItem">
              <div className="OrderPlacedTimelineDot"></div>
              <div>
                <p className="OrderPlacedTimelineText">
                  Delivered
                  {/* , {orderDetails.orderDate} */}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="content-grid">
          {/* Order Details */}
          <div className="left-column">
            {/* Product Information */}
            <div className="card1">
              <h3 className="card-title1">Order Details</h3>
              {products.map((product, index) => (
                <div key={index} className="product-item1">
                  <div className="product-image4">
                    <img
                      src={product.image || product.img}
                      alt={product.name || product.title}
                    />
                  </div>
                  <div className="product-info4">
                    <h4 className="product-name4">
                      {product.name || product.title}
                    </h4>
                    <p className="product-description4">
                      {product.description || ""}
                    </p>
                    <div className="product-details4">
                      <span className="quantity4">Qty: {product.quantity}</span>
                      <span className="price4">
                        ₹{((product.price ?? product.product?.offeredPrice) * product.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Price Breakdown */}
              <div className="price-breakdown">
                <div className="price-row">
                  <span>Subtotal</span>
                  <span>₹{orderSummary.subtotal.toFixed(2)}</span>
                </div>
                <div className="price-row">
                  <span>Shipping</span>
                  <span>
                    {orderSummary.shipping === 0
                      ? "Free"
                      : `₹${orderSummary.shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="price-row">
                  <span>Taxes</span>
                  <span>₹{orderSummary.taxes.toFixed(2)}</span>
                </div>
                <div className="price-total">
                  <div className="total-row">
                    <span>Total</span>
                    <span>₹{orderSummary.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Information */}
            <div className="OrderPlacedcard">
              <h3 className="card-title">Shipping Information</h3>
              <div className="shipping-info">
                <div className="shipping-name">
                  <span className="name">{shippingAddress.name}</span>
                  <span className="address-type">{shippingAddress.type}</span>
                </div>
                <p className="shipping-phone">{shippingAddress.phone}</p>
                <p className="shipping-address">{shippingAddress.address}</p>
              </div>
            </div>
          </div>

          {/* Payment & Actions */}
          <div className="right-column">
            {/* Payment Information */}
            <div className="OrderPlacedcard">
              <h3 className="card-title">Payment Information</h3>
              <div className="payment-info">
                <div className="payment-row">
                  <span>Payment Method</span>
                  <span className="payment-value">{paymentInfo.method}</span>
                </div>
                <div className="payment-row">
                  <span>Card Number</span>
                  <div className="card-info">
                    <span className="payment-value">
                      {paymentInfo.cardNumber}
                    </span>
                    <i className="fab fa-cc-visa"></i>
                  </div>
                </div>
                <div className="payment-row">
                  <span>Transaction ID</span>
                  <span className="payment-value transaction-id">
                    {orderDetails.transactionId}
                  </span>
                </div>
                <div className="payment-row">
                  <span>Payment Status</span>
                  <span className="payment-status">
                    {orderData.paymentMethod?.id === "cod" ? "Pending" : "Paid"}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="OrderPlacedcard-quick">
              <h3 className="card-title">Quick Actions</h3>
              <div className="OrderPlaced-action-buttons">
              <button
  onClick={() => setShowInvoice(true)}
  className="OrderPlaced-action-btn OrderPlaced-invoice-btn"
>
  <i className="fas fa-download"></i>
  Download Invoice
</button>
<button className="OrderPlaced-action-btn OrderPlaced-help-btn">
  <i className="fas fa-headset"></i>
  Need Help?
</button>
<button className="OrderPlaced-action-btn OrderPlaced-share-btn">
  <i className="fas fa-share"></i>
  Share Order Details
</button>

              </div>
            </div>

            {/* Order Summary Card */}
            <div className="summary-card">
              <div className="summary-content">
                <i className="fas fa-gift"></i>
                <h4 className="summary-title">Thank You for Your Order!</h4>
                <p className="summary-description">
                  We'll send you shipping updates via email and SMS.
                </p>
                <button onClick={handleBackToShopping} className="summary-btn">
                  <i className="fas fa-shopping-bag"></i>
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Modal */}
      {showInvoice && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-content">
              <div className="modal-header">
                <h3 className="modal-title">Download Invoice</h3>
                <button
                  onClick={() => setShowInvoice(false)}
                  className="modal-close"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="modal-body">
                <i className="fas fa-file-invoice"></i>
                <p className="modal-description">
                  Your invoice is ready for download
                </p>
                <div className="modal-actions">
                  <button
                    onClick={() => setShowInvoice(false)}
                    className="modal-cancel"
                  >
                    Cancel
                  </button>
                  <button className="modal-download">
                    <i className="fas fa-download"></i>
                    Download
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderPlaced;