import React, { useEffect, useState } from "react";
import "./Checkout.css";
import { useSelector, useDispatch } from "react-redux";
import "react-toastify/dist/ReactToastify.css";
import Address from "../../Address/AddressUI/Address";
import { useNavigate, useLocation } from "react-router-dom";
import { fetchAddresses, createAddress, updateAddress } from "../../../Redux/addressSlice";
import { clearCartFromBackend } from "../../../Redux/cartSlice";
import { createOrder } from "../../../Redux/orderSlice";
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  cancelPendingRazorpayOrder
} from "../../../Redux/orderSlice";
import { toast } from "react-toastify";
import axios from "axios";
import { formatEstimatedDelivery } from "../../../utils/deliveryEta";
import { GST_PERCENT, GST_RATE } from "../../../utils/pricingConstants";
import DeliveryEstimateBanner from "../../Common/DeliveryEstimateBanner/DeliveryEstimateBanner";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { cartItems, totalAmount } = useSelector((state) => state.cart);
  const { addresses, loading } = useSelector((state) => state.addresses);
  const { user, token } = useSelector((state) => state.user);

  // Check if this is a buy now flow
  const isBuyNow = location.state?.isBuyNow;
  const buyNowProduct = location.state?.buyNowProduct;
  console.log("isBuyNow", isBuyNow);
  console.log("cartItems", cartItems);

  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState("");
  const [discountCode, setDiscountCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountError, setDiscountError] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  useEffect(() => {
    if (!user || !token) {
      navigate("/login", { replace: true });
      return;
    }
    dispatch(fetchAddresses());
  }, [dispatch, user, token, navigate]);

  // Redirect when Buy Now flow has no/invalid product (e.g. refresh or direct URL)
  useEffect(() => {
    if (isBuyNow && (!buyNowProduct || !buyNowProduct.id)) {
      navigate("/products", { replace: true });
    }
  }, [isBuyNow, buyNowProduct, navigate]);

  const paymentMethods = [
    // { id: 'card', name: 'Credit/Debit Card', icon: '💳', description: 'Visa, Mastercard, RuPay' },
    {
      id: "online",
      name: "Online Payment",
      icon: "📱",
      description: "Pay Online using Razorpay",
    },
    // { id: 'netbanking', name: 'Internet Banking', icon: '🏦', description: 'All major banks supported' },
    {
      id: "cod",
      name: "Cash on Delivery",
      icon: "💰",
      description: "Pay when you receive",
    },
  ];

  // Totals - handle both cart and buy now scenarios (use offeredPrice for buy-now to match product API)
  const unitPrice = isBuyNow
    ? (buyNowProduct?.offeredPrice ??
      buyNowProduct?.price ??
      buyNowProduct?.sellingPrice)
    : undefined;
  const buyNowQty = isBuyNow ? Number(buyNowProduct?.quantity) || 1 : 0;
  const rawSubtotal = isBuyNow ? Number(unitPrice) * buyNowQty : totalAmount;
  const subtotal = Number.isFinite(rawSubtotal) ? rawSubtotal : 0;
  const shipping = 0;
  const rawTaxes = Number((subtotal * GST_RATE).toFixed(2));
  const taxes = Number.isFinite(rawTaxes) ? rawTaxes : 0;
  const delivery=0;
 
  
 

  const handleApplyCoupon = async () => {
  if (!discountCode.trim()) return;
  setIsValidating(true);
  setDiscountError("");

  try {
    const res = await axios.post(
      `${API_URL}/api/coupons/validate`,
      { code: discountCode, cartTotal: subtotal },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log("cartTotal sent:", subtotal);        // ← ADD THIS
    console.log("Full coupon response:", res.data);  // ← ADD THIS


    setDiscountAmount(res.data.data.discountAmount);
  
    setDiscountApplied(true);
    toast.success("Coupon applied successfully!");
  } catch (err) {
       console.log("Coupon error full:", err.response);  // ← ADD THIS
    console.log("Coupon error message:", err.response?.data);  
    setDiscountError(err.response?.data?.message || "Invalid coupon");
    setDiscountApplied(false);
    setDiscountAmount(0);
  } finally {
    setIsValidating(false);
  }
};
const handleRemoveCoupon = () => {
  setDiscountCode("");
  setDiscountApplied(false);
  setDiscountAmount(0);
  setDiscountError("");
};
const rawTotal = subtotal + shipping + taxes + delivery - discountAmount;
 const total = Number.isFinite(rawTotal) ? rawTotal : 0;
 

  // const handleAddressSubmit = async (addressData) => {
  //   try {
  //     const res = await dispatch(createAddress(addressData)).unwrap();
  //     setSelectedAddressId(res._id);
  //     setShowAddressForm(false);
  //   } catch {
  //     // Address create failed; form/API may show error
  //   }
  // };
  const handleAddressSubmit = async (addressData) => {
    try {
      let res;
      if (editingAddress) {
        // If we have an editingAddress, dispatch updateAddress
        res = await dispatch(
          updateAddress({ addressId: editingAddress._id, addressData })
        ).unwrap();
      } else {
        // Otherwise, create a new one
        res = await dispatch(createAddress(addressData)).unwrap();
      }
      setSelectedAddressId(res._id);
      setShowAddressForm(false);
      setEditingAddress(null); // Clear the editing state after saving
    } catch (err) {
      toast.error(err?.message || "Failed to save address");
    }
  };

  const selectedAddressObj =
    addresses.find((a) => a._id === selectedAddressId) || addresses[0] || null;

  console.log("selectedAddressId", selectedAddressId);
  console.log("selectedAddressObj", selectedAddressObj);

  const isPlaceOrderDisabled =
    !selectedAddressId ||
    !selectedPayment ||
    (!isBuyNow && cartItems.length === 0);

  console.log("isPlaceOrderDisabled", isPlaceOrderDisabled);

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      alert("Please select a shipping address");
      return;
    }

    if (!selectedPayment) {
      alert("Please select a payment method");
      return;
    }

    // Build orderData (used by backend verify route)
    const orderData = {
      products: isBuyNow
        ? [
          {
            product: buyNowProduct.id,
            quantity: buyNowProduct.quantity ?? 1,
            price:
              buyNowProduct.offeredPrice ??
              buyNowProduct.price ??
              buyNowProduct.sellingPrice ??
              0,
          },
        ]
        : cartItems.map((item) => ({
          product: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
      totalAmount: total,
      discountCode: discountApplied ? discountCode.toUpperCase() : null, 
       pricingBreakdown:{
      subtotal ,
      gstPercent: GST_PERCENT,
      gstAmount: taxes,
      shippingCharge: shipping,
       deliveryCharge: delivery,
        discountCode: discountApplied ? discountCode.toUpperCase() : null,
         discountAmount: discountApplied ? discountAmount : 0,
 },
      shippingAddress: {
        fullName: selectedAddressObj.name,
        phone: selectedAddressObj.phone,
        street: `${selectedAddressObj.address}, ${selectedAddressObj.locality}`,
        city: selectedAddressObj.city,
        state: selectedAddressObj.state,
        pincode: selectedAddressObj.pincode,
      },
    };

    const createOrderSection = async (createdOrder, tansactionId) => {
      try {
        console.log("createdOrderFUNCTION:- ", createdOrder);
        if (!isBuyNow) {
          try {
            await dispatch(clearCartFromBackend()).unwrap();
          } catch (e) {
            console.error("Cart clear failed:", e);
            toast.warning("Order placed. Cart could not be cleared.");
          }
        }

        const orderNumber = createdOrder._id;
        const paymentMethodName =
          paymentMethods.find((method) => method.id === selectedPayment)
            ?.name || selectedPayment;

        const orderPlacedAt = new Date();
        const estimatedDelivery = formatEstimatedDelivery(orderPlacedAt);

        navigate(`/order-placed/${orderNumber}`, {
          state: {
            orderDetails: {
              orderNumber,
              orderDate: new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              }),
              estimatedDelivery,
              status: "Order Confirmed",
              transactionId: tansactionId,
              products: isBuyNow ? [buyNowProduct] : cartItems,
              shippingAddress: {
                name: selectedAddressObj.name,
                phone: selectedAddressObj.phone,
                address: `${selectedAddressObj.address}, ${selectedAddressObj.locality}, ${selectedAddressObj.city}, ${selectedAddressObj.state} ${selectedAddressObj.pincode}`,
                type: selectedAddressObj.addressType || "home",
              },
              paymentMethod: { id: selectedPayment, name: paymentMethodName },
              orderSummary: { subtotal, shipping, taxes, total },
            },
          },
        });
        return;
      } catch (err) {
        console.log("Order creaction fail");
        toast.error(
          typeof err === "string"
            ? err
            : err?.message || "Order creaction fail.",
        );
      }
    };

    // For now, support only Razorpay for online payments.
    // If user selects COD, just show a message (or you can later restore COD flow).
    if (selectedPayment === "cod") {
      const codOrderData = {
        ...orderData,
        paymentMethode: "COD",
      };

      try {
        const createdOrder = await dispatch(createOrder(codOrderData)).unwrap();
        const tansactionId = `TXN${Math.floor(
          100000000 + Math.random() * 900000000,
        )}`;
        console.log("createdOrderCOD:- ", createdOrder);
        createOrderSection(createdOrder, tansactionId);
      } catch (err) {
        const message =
          typeof err === "string"
            ? err
            : err?.message || "Failed to place COD order. Please try again.";
        toast.error(message);
      }
      return;
    }

    if (!window.Razorpay) {
      toast.error("Payment service not loaded. Please refresh and try again.");
      return;
    }

    try {
      // 1) Create Razorpay order
      const rzpOrder = await dispatch(createRazorpayOrder(orderData)).unwrap();

      const options = {
        key: rzpOrder.key_id,
        amount: rzpOrder.amount, // in paise
        currency: rzpOrder.currency || "INR",
        name: "Aestheticommerce",
        order_id: rzpOrder.orderId,
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: selectedAddressObj?.phone || "",
        },
        handler: async function (response) {
          try {
            const createdOrder = await dispatch(
              verifyRazorpayPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderData,
              }),
            ).unwrap();

            console.log("createdOrder:- ", createdOrder);
            createOrderSection(createdOrder, response.razorpay_payment_id);
          } catch (err) {
            toast.error(
              typeof err === "string"
                ? err
                : err?.message ||
                "Payment verification failed. If money is debited, contact support.",
            );
          }
        },
        modal: {
          ondismiss: function () {
            toast.info(
              "Payment cancelled. You can try again when you're ready.",
            );
            dispatch(cancelPendingRazorpayOrder(rzpOrder.orderId));
            // We do NOT navigate away here so the user can easily click "Place Order" again to retry.
          },
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", function (response) {
        // toast.error("Payment failed. Please try again.");
        console.error("Payment Error Code:", response.error.code);
        console.error("Payment Error Description:", response.error.description);

        dispatch(cancelPendingRazorpayOrder(rzpOrder.orderId));
        // We show the exact reason to the user so they know what went wrong
        toast.error(
          `Payment failed: ${response.error.description || "Please try again."}`,
        );
        rzp.close();
      });

      rzp.open();
    } catch (err) {
      console.error("Error creating Razorpay order:", err);
      toast.error(err?.message || "Failed to start payment. Please try again.");
    }
  };

  // Don't render checkout when Buy Now state is missing (redirect in progress)
  if (isBuyNow && (!buyNowProduct || !buyNowProduct.id)) {
    return null;
  }

  if (loading && addresses.length === 0) {
    return (
      <div className="checkout-container">
        <div
          className="checkout-wrapper"
          style={{ padding: "2rem", textAlign: "center" }}
        >
          <div className="loading-spinner" />
          <p>Loading your addresses...</p>
        </div>
      </div>
    );
  }

  if (showAddressForm) {
    return (
      <div className="address-form-overlay">
        <div className="address-form-container">
          <div className="address-form-header">
            {/* <button
              onClick={() => setShowAddressForm(false)}
              className="back-to-checkout-btn"
            > */}
            <button
              onClick={() => {
                setShowAddressForm(false);
                setEditingAddress(null); // Clear state if user cancels
              }}
              className="back-to-checkout-btn"
            >
              <i className="fas fa-arrow-left"></i>
              Back to Checkout
            </button>
          </div>
          <Address
            onAddressSubmit={handleAddressSubmit}
            initialData={editingAddress}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <div className="checkout-wrapper">
        <div className="checkout-grid">
          {/* Left Column - Shipping & Payment */}
          <div className="checkout-main">
            {/* Address Section */}
            <div className="checkout-section">
              <h2 className="section-title">Shipping Address</h2>
              {addresses.length === 0 ? (
                <button
                  onClick={() => setShowAddressForm(true)}
                  className="add-address-btn"
                >
                  <i className="fas fa-plus add-icon"></i>
                  <p className="add-text">Add Shipping Address</p>
                  <p className="add-subtext">
                    Click to add your delivery address
                  </p>
                </button>
              ) : (
                <div className="address-list">
                  {addresses.map((address) => (
                    <div
                      key={address._id}
                      className={`address-item ${selectedAddressId === address._id ? "selected" : ""}`}
                      onClick={() => setSelectedAddressId(address._id)}
                    >
                      <div className="address-content">
                        <div className="address-header">
                          <span className="address-name">{address.name}</span>
                          <span className="address-type-badge">
                            {address.addressType || "home"}
                          </span>
                        </div>
                        <p className="address-phone">{address.phone}</p>
                        <p className="address-details">
                          {address.address}, {address.locality}, {address.city},{" "}
                          {address.state} {address.pincode}
                        </p>
                        {/* Delivery Availability Indicator */}
                        <p
                          style={{
                            marginTop: "8px",
                            fontSize: "13px",
                            color: /^\d{6}$/.test(String(address.pincode ?? ""))
                              ? "#10b981"
                              : "#ef4444",
                            fontWeight: "600",
                          }}
                        >
                          {/^\d{6}$/.test(String(address.pincode ?? ""))
                            ? "Delivery Available"
                            : "Invalid pincode"}
                        </p>
                      </div>
                      {/* <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowAddressForm(true);
                        }}
                        className="edit-address-btn"
                      >
                        <span>Edit</span>
                      </button> */}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingAddress(address); // Tell the state which address to edit
                          setShowAddressForm(true);
                        }}
                        className="edit-address-btn"
                      >
                        <span>Edit</span>
                      </button>
                    </div>
                  ))}
                  <button
                    // onClick={() => setShowAddressForm(true)}
                    onClick={() => {
                      setEditingAddress(null);
                      setShowAddressForm(true);
                    }}
                    className="add-another-btn"
                  >
                    <i className="fas fa-plus"></i>
                    <span>Add Another Address</span>
                  </button>
                </div>
              )}
            </div>

            {/* Payment Methods Section */}
            <div className="checkout-section">
              <h2 className="section-title">Payment Options</h2>
              <div className="payment-methods">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className={`payment-method ${selectedPayment === method.id ? "selected" : ""}`}
                    data-payment={method.id}
                  >
                    <label className="payment-method-label">
                      <input
                        type="radio"
                        name="payment"
                        value={method.id}
                        checked={selectedPayment === method.id}
                        onChange={(e) => setSelectedPayment(e.target.value)}
                        className="hidden-radio"
                      />
                      <div className="payment-method-content">
                        {/* <div className="payment-radio">
                          {selectedPayment === method.id && <div className="radio-dot"></div>}
                        </div> */}
                        <div className="payment-info1">
                          <span className="payment-icon">{method.icon}</span>
                          <div>
                            <p className="payment-name">{method.name}</p>
                            <p className="payment-description">
                              {method.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </label>

                    {/* Payment Method Details */}

                    {/* {selectedPayment === method.id && (
                      <div className="payment-form">
                        {method.id === 'card' && (
                          <div className="form-fields">
                            <div className="form-field">
                              <label className="form-label">Card Number</label>
                              <input type="text" className="form-input" placeholder="1234 5678 9012 3456" />
                            </div>
                            <div className="form-row">
                              <div className="form-field">
                                <label className="form-label">Expiry Date</label>
                                <input type="text" className="form-input" placeholder="MM/YY" />
                              </div>
                              <div className="form-field">
                                <label className="form-label">CVV</label>
                                <input type="text" className="form-input" placeholder="123" />
                              </div>
                            </div>
                            <div className="form-field">
                              <label className="form-label">Card Holder Name</label>
                              <input type="text" className="form-input" placeholder="John Doe" />
                            </div>
                          </div>
                        )}
                        
                        {method.id === 'upi' && (
                          <div className="form-fields">
                            <div className="form-field">
                              <label className="form-label">UPI ID</label>
                              <input type="text" className="form-input" placeholder="username@upi" />
                            </div>
                            <div className="form-field">
                              <label className="form-label">Mobile Number</label>
                              <input type="text" className="form-input" placeholder="+91 98765 43210" />
                            </div>
                          </div>
                        )}
                        
                        {method.id === 'netbanking' && (
                          <div className="form-fields">
                            <div className="form-field">
                              <label className="form-label">Select Bank</label>
                              <select className="form-input">
                                <option value="">Choose your bank</option>
                                <option value="sbi">State Bank of India</option>
                                <option value="hdfc">HDFC Bank</option>
                                <option value="icici">ICICI Bank</option>
                                <option value="axis">Axis Bank</option>
                                <option value="kotak">Kotak Mahindra Bank</option>
                              </select>
                            </div>
                          </div>
                        )} */}

                    {/* {method.id === 'cod' && (
                          <div className="form-fields">
                            <div className="cod-message">
                              <p>💡 You can pay with cash when your order is delivered.</p>
                              <p>No additional charges for cash on delivery.</p>
                            </div>
                          </div>
                        )} */}
                    {/* </div>
                    )} */}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="checkout-sidebar">
            <div className="order-summary">
              {/* {isBuyNow && (
                <div className="buy-now-indicator">
                  <span className="buy-now-badge">Buy Now</span>
                  <p className="buy-now-text">Purchasing this item directly</p>
                </div>
              )} */}
              <h2 className="section-title">Order Summary</h2>

              {/* Cart Items or Buy Now Product */}
              <div className="cart-items-summary">
                {isBuyNow ? (
                  <div key={buyNowProduct.id} className="product-item2">
                    <div className="product-image1">
                      <img
                        src={buyNowProduct.image}
                        alt={buyNowProduct.name}
                        className="product-img1"
                      />
                    </div>
                    <div className="product-details1">
                      <h3 className="product-name">{buyNowProduct.name}</h3>
                      <div className="product-meta">
                        <span className="product-quantity">
                          Qty: {buyNowProduct.quantity ?? 1}
                        </span>
                        <span className="product-price">
                          ₹
                          {(
                            (buyNowProduct.offeredPrice ??
                              buyNowProduct.price ??
                              buyNowProduct.sellingPrice ??
                              buyNowProduct.mrp ??
                              0) * (buyNowProduct.quantity || 1)
                          ).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  cartItems.map((item) => (
                    <div key={item.productId} className="product-item2">
                      <div className="product-image1">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="product-img1"
                        />
                      </div>
                      <div className="product-details1">
                        <h3 className="product-name">{item.title}</h3>
                        <div className="product-meta">
                          <span className="product-quantity">
                            Qty: {item.quantity}
                          </span>
                          <span className="product-price">
                            ₹
                            {(
                              (item.price ?? item.product?.offeredPrice) *
                              item.quantity
                            ).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <DeliveryEstimateBanner />

            {/* Discount Code */}
<div className="discount-section">
  {!discountApplied ? (
    <>
      <div className="discount-input-group">
        <input
          type="text"
          placeholder="Discount code"
          value={discountCode}
          onChange={(e) => { setDiscountCode(e.target.value); setDiscountError(""); }}
          className="discount-input"
        />
        <button
          className="discount-btn"
          onClick={handleApplyCoupon}
          disabled={isValidating || !discountCode.trim()}
        >
          {isValidating ? "Checking..." : "Apply"}
        </button>
      </div>
      {discountError && (
        <p style={{ color: "#ef4444", fontSize: "13px", marginTop: "6px" }}>
          {discountError}
        </p>
      )}
    </>
  ) : (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f0fdf4", padding: "10px", borderRadius: "8px" }}>
      <span style={{ color: "#10b981", fontWeight: "600" }}>
        🎉 {discountCode.toUpperCase()} — ₹{discountAmount.toFixed(2)} off
      </span>
      <button onClick={handleRemoveCoupon} style={{ color: "#ef4444", background: "none", border: "none", cursor: "pointer" }}>
        Remove
      </button>
    </div>
  )}
</div>

              {/* Price Breakdown */}
              <div className="price-breakdown">
                <div className="price-row">
                  <span className="price-label">Delivery Charges</span>
                  <span className="pricae-value">
                    {delivery===0 ? "Free":`₹${delivery.toFixed(2)}`}
                  </span>
                </div>
                 <div className="price-row">
                  <span className="price-label">GST({GST_PERCENT}%)</span>
                  <span className="pricae-value">
                    ₹{taxes.toFixed(2)}
                  </span>
                </div>
                <div className="price-row">
                  <span className="price-label">Subtotal</span>
                  <span className="price-value">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="price-row">
                  <span className="price-label">
                    Shipping <i className="fas fa-info-circle info-icon"></i>
                  </span>
                  <span className="price-value">
                    {shipping === 0 ? "Free" : `₹${shipping.toFixed(2)}`}
                  </span>
                </div>
                {discountApplied && (
  <div className="price-row">
    <span className="price-label" style={{ color: "#10b981" }}>
      Discount ({discountCode.toUpperCase()})
    </span>
    <span className="price-value" style={{ color: "#10b981" }}>
      - ₹{discountAmount.toFixed(2)}
    </span>
  </div>
)}
                <div className="price-total">
                  <div className="total-row">
                    <span className="total-label">Total</span>
                    <div className="total-amount">
                      <div className="total-value">₹{total.toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                disabled={isPlaceOrderDisabled}
                className={`place-order-btn1 ${isPlaceOrderDisabled ? "disabled" : "active"
                  }`}
                onClick={handlePlaceOrder}
              >
                <i className="fas fa-lock"></i>
                Place Order • ₹{total.toFixed(2)}
              </button>
              <p className="security-note">
                Your payment information is secure and encrypted
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
