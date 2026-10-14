import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import BackButton from '../../src/component/Common/BackButton/BackButton';
import './OrderDetailsPage.css';

const API = import.meta.env.VITE_API_URL;

const formatCurrency = (amount) => `₹${Number(amount || 0).toLocaleString('en-IN')}`;

const formatDateTime = (value) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';

  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const getCustomerName = (order) => {
  const userFullName = [
    order?.user?.fullname?.firstname,
    order?.user?.fullname?.lastname,
  ]
    .filter(Boolean)
    .join(' ');

  return order?.shippingAddress?.fullName || userFullName || order?.user?.name || 'N/A';
};

const getCustomerEmail = (order) => order?.user?.email || 'N/A';
const getCustomerPhone = (order) => order?.shippingAddress?.phone || order?.user?.phone || 'N/A';

const getFullAddress = (address) => {
  if (!address) return 'N/A';

  const parts = [address.street, address.city, address.state, address.pincode].filter(Boolean);
  return parts.length ? parts.join(', ') : 'N/A';
};

const getStatusClassName = (status) =>
  String(status || 'unknown')
    .toLowerCase()
    .replace(/\s+/g, '-');

const OrderDetailsPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      setError('');

      try {
        const token = localStorage.getItem('adminToken');
        const response = await axios.get(`${API}/api/orders/${orderId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setOrder(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch order details.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const orderSummary = useMemo(() => {
    if (!order) return [];

    const totalItems = Array.isArray(order.products)
      ? order.products.reduce((sum, product) => sum + Number(product.quantity || 0), 0)
      : 0;

    return [
      { label: 'Order ID', value: order.orderId || 'N/A' },
      { label: 'Placed On', value: formatDateTime(order.createdAt) },
      { label: 'Items', value: totalItems },
      { label: 'Order Total', value: formatCurrency(order.totalAmount) },
    ];
  }, [order]);

  if (loading) return <div className="order-details-state">Loading order details...</div>;
  if (error) return <div className="order-details-state error">{error}</div>;
  if (!order) return <div className="order-details-state error">Order not found.</div>;

  return (
    <div className="order-details-page">
      <div className="order-details-header">
        <div>
          <p className="order-details-eyebrow">Order Overview</p>
          <h1>{order.orderId}</h1>
          <p className="order-details-subtitle">
            Review customer info, shipping details, item breakdown, and current order progress.
          </p>
        </div>
        <BackButton to="/orders" label="Back to Orders" className="order-details-back-btn" />
      </div>

      <div className="order-summary-grid">
        {orderSummary.map((item) => (
          <div key={item.label} className="summary-card">
            <span className="summary-label">{item.label}</span>
            <strong className="summary-value">{item.value}</strong>
          </div>
        ))}
      </div>

      <div className="order-details-top-grid">
        <section className="details-card">
          <div className="details-card-header">
            <h2>Customer Details</h2>
            <div className="status-group">
              <span className={`status-chip payment ${getStatusClassName(order.paymentStatus)}`}>
                {order.paymentStatus}
              </span>
              <span className={`status-chip delivery ${getStatusClassName(order.deliveryStatus)}`}>
                {order.deliveryStatus}
              </span>
            </div>
          </div>
          <div className="details-list">
            <div className="details-row">
              <span>Name</span>
              <strong>{getCustomerName(order)}</strong>
            </div>
            <div className="details-row">
              <span>Email</span>
              <strong>{getCustomerEmail(order)}</strong>
            </div>
            <div className="details-row">
              <span>Phone</span>
              <strong>{getCustomerPhone(order)}</strong>
            </div>
            <div className="details-row">
              <span>Payment Method</span>
              <strong>{order.paymentMethode || 'N/A'}</strong>
            </div>
          </div>
        </section>

        <section className="details-card">
          <div className="details-card-header">
            <h2>Shipping Address</h2>
          </div>
          <div className="shipping-card-body">
            <strong>{order.shippingAddress?.fullName || 'N/A'}</strong>
            <p>{getCustomerPhone(order)}</p>
            <p>{getFullAddress(order.shippingAddress)}</p>
          </div>
        </section>
      </div>

      <section className="details-card">
        <div className="details-card-header">
          <h2>Order Items</h2>
        </div>

        <div className="order-items-table-wrap">
          <table className="order-items-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Seller</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Subtotal</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {order.products?.map((item) => {
                const imageSource = item.product?.images?.[0];
                const itemSubtotal = Number(item.quantity || 0) * Number(item.price || 0);

                return (
                  <tr key={item.itemId || item._id}>
                    <td>
                      <div className="product-cell">
                        {imageSource ? (
                          <img
                            src={imageSource}
                            alt={item.product?.name || item.productName || 'Order item'}
                            className="product-thumb"
                          />
                        ) : (
                          <div className="product-thumb placeholder">No Image</div>
                        )}
                        <div>
                          <strong>{item.product?.name || item.productName || 'Unnamed product'}</strong>
                          <span>{item.itemId || item._id}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="seller-cell">
                        <strong>{item.sellerId?.name || item.sellerName || 'Unknown Seller'}</strong>
                        <span>{item.storeName || 'Marketplace'}</span>
                      </div>
                    </td>
                    <td>{item.quantity || 0}</td>
                    <td>{formatCurrency(item.price)}</td>
                    <td>{formatCurrency(itemSubtotal)}</td>
                    <td>
                      <span className={`status-chip delivery ${getStatusClassName(item.status)}`}>
                        {item.status || 'Pending'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default OrderDetailsPage;
