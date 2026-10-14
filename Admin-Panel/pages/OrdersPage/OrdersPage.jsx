import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './OrdersPage.css';
import Pagination from '../../src/component/Pagination/Pagination';

const API = import.meta.env.VITE_API_URL;

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('adminToken');
        const response = await axios.get(`${API}/api/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(response.data);
      } catch (err) {
        setError('Failed to fetch orders.');
      }
      setLoading(false);
    };

    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(order => {
    const searchTermLower = searchTerm.toLowerCase();
    const sellerNames = [...new Set(order.products.map(p => p.sellerId?.name || p.sellerName).filter(Boolean))].join(', ').toLowerCase();
    const sellerIds = [...new Set(order.products.map(p => p.sellerId?._id).filter(Boolean))].join(', ').toLowerCase();
    const customerName = [
      order.shippingAddress?.fullName,
      order.user?.fullname?.firstname,
      order.user?.fullname?.lastname,
      order.user?.name,
      order.user?.email,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return (
      order.orderId?.toLowerCase().includes(searchTermLower) ||
      sellerNames.includes(searchTermLower) ||
      sellerIds.includes(searchTermLower) ||
      customerName.includes(searchTermLower)
    );
  });

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewOrder = (orderId) => {
    navigate(`/orders/${orderId}`);
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="orders-page">
      <h1>All Orders</h1>
      <div className="orders-controls">
        <input
          type="text"
          placeholder="Search by Order ID, customer, seller name, or seller ID..."
          className="local-search-input"
          value={searchTerm}
          onChange={e => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>
      <div className="orders-table-wrapper">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Sellers</th>
              <th>Total Amount</th>
              <th>Payment Status</th>
              <th>Delivery Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedOrders.map(order => {
              const sellerEntries = [
                ...new Map(
                  order.products
                    .map(product => {
                      const sellerId = product.sellerId?._id || product.sellerId;
                      const sellerName =
                        product.sellerId?.name ||
                        product.sellerName ||
                        product.storeName ||
                        'Unknown Seller';

                      if (!sellerId && !sellerName) return null;
                      return [sellerId || sellerName, sellerName];
                    })
                    .filter(Boolean)
                ).entries(),
              ];
              const userFullName = [
                order.user?.fullname?.firstname,
                order.user?.fullname?.lastname,
              ]
                .filter(Boolean)
                .join(" ");
              const customerName =
                order.shippingAddress?.fullName || userFullName || "N/A";
              return (
                <tr key={order._id}>
                  <td>
                    <button
                      type="button"
                      className="order-id-button"
                      onClick={() => handleViewOrder(order._id)}
                    >
                      {order.orderId}
                    </button>
                  </td>
                  <td>
                    <div className="customer-cell">
                      <span className="customer-name">{customerName}</span>
                    </div>
                  </td>
                  <td>
                    <div className="seller-stack">
                      {sellerEntries.length > 0 ? (
                        sellerEntries.map(([sellerKey, sellerName]) => (
                          <span key={sellerKey} className="seller-pill">
                            {sellerName}
                          </span>
                        ))
                      ) : (
                        <span className="seller-pill muted">N/A</span>
                      )}
                    </div>
                  </td>
                  <td className="amount-cell">₹{order.totalAmount}</td>
                  <td>
                    <span className={`status-chip payment ${String(order.paymentStatus || '').toLowerCase()}`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td>
                    <span className={`status-chip delivery ${String(order.deliveryStatus || '').toLowerCase().replace(/\s+/g, '-')}`}>
                      {order.deliveryStatus}
                    </span>
                  </td>
                  <td className="date-cell">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      type="button"
                      className="action-btn view-order-btn"
                      onClick={() => handleViewOrder(order._id)}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        itemsPerPage={itemsPerPage}
        totalItems={filteredOrders.length}
      />
    </div>
  );
};

export default OrdersPage;
