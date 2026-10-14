
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import './BuyNowDialog.css';

const BuyNowDialog = ({ isOpen, onClose, product, quantity }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    paymentMethod: 'cod'
  });
  
  const [formErrors, setFormErrors] = useState({});
  
  if (!isOpen) return null;
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when typing
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.address.trim()) errors.address = 'Address is required';
    if (!formData.city.trim()) errors.city = 'City is required';
    if (!formData.state.trim()) errors.state = 'State is required';
    
    if (!formData.pincode.trim()) {
      errors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      errors.pincode = 'Pincode must be 6 digits';
    }
    
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      errors.phone = 'Phone number must be 10 digits';
    }
    
    return errors;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    // Process order
    toast.success('Order placed successfully!');
    onClose();
    navigate('/orders'); // Redirect to orders page
  };

  return (
    <div className="dialog-overlay">
      <div className="dialog-content">
        <div className="dialog-header">
          <h2>Complete Your Purchase</h2>
          <button className="close-button" onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>
        
        <div className="dialog-body">
          <div className="order-summary">
            <h3>Order Summary</h3>
            <div className="order-product">
              <img src={product.images[0]} alt={product.name} className="product-thumbnail" />
              <div className="product-details">
                <h4>{product.name}</h4>
                <div className="order-quantity">Quantity: {quantity}</div>
                <div className="order-price">
                  <span className="final-price">₹{((product.offeredPrice ?? product.price) * quantity).toFixed(2)}</span>
                  {product.originalPrice && (
                    <span className="original-price">₹{(product.originalPrice * quantity).toFixed(2)}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="shipping-form">
            <h3>Shipping Details</h3>
            
            <div className="form-group">
              <label htmlFor="name">Full Name*</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className={formErrors.name ? 'error' : ''}
              />
              {formErrors.name && <span className="error-message">{formErrors.name}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="address">Address*</label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter your complete address"
                className={formErrors.address ? 'error' : ''}
                rows="3"
              />
              {formErrors.address && <span className="error-message">{formErrors.address}</span>}
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">City*</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                  className={formErrors.city ? 'error' : ''}
                />
                {formErrors.city && <span className="error-message">{formErrors.city}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="state">State*</label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="State"
                  className={formErrors.state ? 'error' : ''}
                />
                {formErrors.state && <span className="error-message">{formErrors.state}</span>}
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="pincode">Pincode*</label>
                <input
                  type="text"
                  id="pincode"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="6-digit pincode"
                  maxLength={6}
                  className={formErrors.pincode ? 'error' : ''}
                />
                {formErrors.pincode && <span className="error-message">{formErrors.pincode}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="phone">Phone Number*</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="10-digit phone number"
                  className={formErrors.phone ? 'error' : ''}
                />
                {formErrors.phone && <span className="error-message">{formErrors.phone}</span>}
              </div>
            </div>
            
            <div className="form-group payment-methods">
              <label className="label-title">Payment Method*</label>
              
              <div className="payment-options">
                <label className="payment-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={formData.paymentMethod === 'cod'}
                    onChange={handleChange}
                  />
                  <span className="radio-label">Cash on Delivery</span>
                </label>
                
                <label className="payment-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="online"
                    checked={formData.paymentMethod === 'online'}
                    onChange={handleChange}
                  />
                  <span className="radio-label">Online Payment</span>
                </label>
              </div>
            </div>
            
            <div className="form-actions">
              <button type="button" className="cancel-button" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="confirm-button">
                Confirm Order
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BuyNowDialog;