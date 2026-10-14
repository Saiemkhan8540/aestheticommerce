import React from 'react';
import { MapPin, User, Mail, Calendar, Clock, Phone, Store, X } from 'lucide-react';
import './OrderDetailCard.css';

export function OrderDetailCard({ order }) {
    // // Handle both old string format and new object format for address
    // const fullAddress = order.address && typeof order.address === 'object'
    //     ? `${order.address.street}, ${order.address.city}, ${order.address.state} ${order.address.pincode || order.address.zipCode || ''}`
    //     : order.address || 'Address not available';

    // // Safely handle status
    // const orderStatus = order.status || 'Unknown';
    // const statusClass = orderStatus.toLowerCase().replace(/\s+/g, '-');
    // console.log("orderDetails:- ",order);

    const fullAddress = order.address && typeof order.address === 'object'
        ? `${order.address.street}, ${order.address.city}, ${order.address.state} ${order.address.pincode || order.address.zipCode || ''}`
        : order.address || 'Address not available';

    const orderStatus = order.status || 'Unknown';
    const statusClass = orderStatus.toLowerCase().replace(/\s+/g, '-');

    // Create a fallback array if the backend hasn't been updated yet
    const displayItems = order.items && order.items.length > 0 
        ? order.items 
        : [{
            name: order.productTitle,
            image: order.productImage,
            quantity: order.quantity,
            price: order.price
        }];

    return (
        <div className="order-detail-card">
            <div className="order-detail-card-header">
                <p className="order-detail-id">Order ID: {order.orderId}</p>
                <span className={`status-badge1 status-${statusClass}`}>
                    {orderStatus}
                </span>
            </div>

            <div className="order-detail-card-content">
                {/* <div className="order-detail-product-section">
                    <div className="order-detail-image-container">
                        <img
                            src={order.productImage || "/placeholder.svg"}
                            alt={order.productTitle} loading="lazy"
                            className="order-detail-image"
                        />
                    </div>
                    <div className="order-detail-product-info">
                        <h2 className="order-detail-title">{order.productTitle}</h2>
                        <div className="order-detail-product-detail">
                            <span className="order-detail-detail-label">Quantity :</span>
                            <span className="order-detail-detail-value">{order.quantity || 'N/A'}</span>
                        </div>
                        <div className="order-detail-product-detail">
                            <span className="order-detail-detail-label">Price :</span>
                            <span className="order-detail-detail-value">
                                {order.price ? `₹${order.price.toFixed(2)}` : 'N/A'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="order-detail-separator"></div>

                <div className="order-detail-section">
                    <h3 className="order-detail-section-title">
                        <MapPin className="order-detail-icon" />
                        Delivery Address
                    </h3>
                    <p className="order-detail-text">{fullAddress}</p>
                </div> */}

                {/* Loop through all items and display them */}
                <div className="order-detail-products-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {displayItems.map((item, index) => (
                        <div key={index} className="order-detail-product-section" style={{ borderBottom: index !== displayItems.length - 1 ? '1px solid #e5e7eb' : 'none', paddingBottom: index !== displayItems.length - 1 ? '16px' : '0' }}>
                            <div className="order-detail-image-container">
                                <img
                                    src={item.image || "/placeholder.svg"}
                                    alt={item.name} 
                                    loading="lazy"
                                    className="order-detail-image"
                                />
                            </div>
                            <div className="order-detail-product-info">
                                <h2 className="order-detail-title">{item.name}</h2>
                                <div className="order-detail-product-detail">
                                    <span className="order-detail-detail-label">Quantity :</span>
                                    <span className="order-detail-detail-value">{item.quantity || 'N/A'}</span>
                                </div>
                                <div className="order-detail-product-detail">
                                    <span className="order-detail-detail-label">Price :</span>
                                    <span className="order-detail-detail-value">
                                        {item.price ? `₹${item.price.toFixed(2)}` : 'N/A'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="order-detail-separator" style={{ marginTop: '16px' }}></div>

                {/* The rest of your existing component (Delivery Address, Customer Details, etc.) stays exactly the same below here */}
                <div className="order-detail-section">
                    <h3 className="order-detail-section-title">
                        <MapPin className="order-detail-icon" />
                        Delivery Address
                    </h3>
                    <p className="order-detail-text">{fullAddress}</p>
                </div>

                <div className="order-detail-separator"></div>

                {/* Cancellation Info - Show only if cancelled */}
                {orderStatus === 'Cancelled' && (order.cancelledBy || order.cancelReason) && (
                    <>
                        <div className="order-detail-section">
                            <h3 className="order-detail-section-title order-detail-cancel-title">
                                <X className="order-detail-icon" />
                                Cancellation Details
                            </h3>
                            <div className="order-detail-cancel-info">
                                <p className="order-detail-cancel-by">
                                    <strong>Cancelled by:</strong> {order.cancelledBy === 'user' ? 'Customer' : order.cancelledBy === 'delivery_partner' ? 'Delivery Partner' : 'N/A'}
                                </p>
                                {order.cancelReason && (
                                    <p className="order-detail-cancel-reason">
                                        <strong>Reason:</strong> {order.cancelReason}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="order-detail-separator"></div>
                    </>
                )}

                <div className="order-detail-grid">
                    <div className="order-detail-info-section">
                        <h3 className="order-detail-info-title">Customer Details</h3>
                        <div className="order-detail-info-list">
                            <div className="order-detail-info-item">
                                <User className="order-detail-icon" />
                                {order.customerName || 'N/A'}
                            </div>
                            <div className="order-detail-info-item">
                                <Phone className="order-detail-icon" />
                                {order.customerPhone && order.customerPhone !== 'N/A' ? (
                                    <a href={`tel:${order.customerPhone}`} className="order-detail-link">
                                        {order.customerPhone}
                                    </a>
                                ) : 'N/A'}
                            </div>
                            <div className="order-detail-info-item">
                                <Mail className="order-detail-icon" />
                                {order.customerEmail && order.customerEmail !== 'N/A' ? (
                                    <a href={`mailto:${order.customerEmail}`} className="order-detail-link">
                                        {order.customerEmail}
                                    </a>
                                ) : 'N/A'}
                            </div>

                        </div>
                    </div>
                    <div className="order-detail-info-section">
                        <h3 className="order-detail-info-title">Seller Details</h3>
                        <div className="order-detail-info-list">
                            <div className="order-detail-info-item">
                                <Store className="order-detail-icon" />
                                {order.sellerName || 'N/A'}
                            </div>

                            <div className="order-detail-info-item">
                                <Phone className="order-detail-icon" />
                                {order.sellerPhone && order.sellerPhone !== 'N/A' ? (
                                    <a href={`tel:${order.sellerPhone}`} className="order-detail-link">
                                        {order.sellerPhone}
                                    </a>
                                ) : 'N/A'}
                            </div>
                            <div className="order-detail-info-item">
                                <Mail className="order-detail-icon" />
                                {order.sellerEmail && order.sellerEmail !== 'N/A' ? (
                                    <a href={`mailto:${order.sellerEmail}`} className="order-detail-link">
                                        {order.sellerEmail}
                                    </a>
                                ) : 'N/A'}
                            </div>
                        </div>
                    </div>
                    <div className="order-detail-info-section">
                        <h3 className="order-detail-info-title">Order Timeline</h3>
                        <div className="order-detail-info-list">
                            <div className="order-detail-info-item">
                                <Calendar className="order-detail-icon" />
                                Ordered: {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : 'N/A'}
                            </div>
                            <div className="order-detail-info-item">
                                <Clock className="order-detail-icon" />
                                Est. Delivery: {order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString() : 'N/A'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

