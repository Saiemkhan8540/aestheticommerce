import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../../src/component/Common/BackButton/BackButton';
import './SellerPage.css';
import Pagination from '../../src/component/Pagination/Pagination';

const API = import.meta.env.VITE_API_URL;

const SellersPage = () => {
  const [sellers, setSellers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const itemsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSellers = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${API}/api/admin/sellers`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        setSellers(data);
      } catch (error) {
        console.error('Error fetching sellers:', error);
      }
    };

    fetchSellers();
  }, []);

  const handleViewDetails = (sellerId) => {
    navigate(`/seller/${sellerId}`);
  };


  // Filter sellers
  const filteredSellers = sellers.filter((seller) => {
    if (localSearchTerm === '') return true;
    const lowercasedTerm = localSearchTerm.toLowerCase();

    const name = String(seller?.sellerName || '').toLowerCase();
    const store = String(seller?.storeName || '').toLowerCase();
    const email = String(seller?.email || '').toLowerCase();

    return (
      name.includes(lowercasedTerm) ||
      store.includes(lowercasedTerm) ||
      email.includes(lowercasedTerm)
    );
  });

  // Sort sellers
  const sortedSellers = [...filteredSellers].sort((a, b) => {
    let compareA;
    let compareB;

    if (sortBy === 'name') {
      compareA = String(a?.sellerName || '').toLowerCase();
      compareB = String(b?.sellerName || '').toLowerCase();
    } else if (sortBy === 'store') {
      compareA = String(a?.storeName || '').toLowerCase();
      compareB = String(b?.storeName || '').toLowerCase();
    } else if (sortBy === 'date') {
      const dateA = a?.createdAt || a?._id;
      const dateB = b?.createdAt || b?._id;
      compareA = dateA ? new Date(dateA) : new Date(0);
      compareB = dateB ? new Date(dateB) : new Date(0);
    } else if (sortBy === 'products') {
      compareA = typeof a?.productCount === 'number' ? a.productCount : Number(a?.productCount) || 0;
      compareB = typeof b?.productCount === 'number' ? b.productCount : Number(b?.productCount) || 0;
    } else {
      compareA = 0;
      compareB = 0;
    }

    if (sortOrder === 'asc') {
      if (compareA > compareB) return 1;
      if (compareA < compareB) return -1;
      return 0;
    } else {
      if (compareA < compareB) return 1;
      if (compareA > compareB) return -1;
      return 0;
    }
  });

  // Paginate sellers
  const totalPages = Math.ceil(sortedSellers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSellers = sortedSellers.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getStatusBadge = (status) => {
    let badgeStyle = {};
    switch (status) {
      case 'verified':
        badgeStyle = { backgroundColor: '#2ecc71', color: 'white' };
        break;
      case 'pending':
        badgeStyle = { backgroundColor: '#f39c12', color: 'white' };
        break;
      case 'rejected':
        badgeStyle = { backgroundColor: '#e74c3c', color: 'white' };
        break;
      default:
        badgeStyle = { backgroundColor: '#bdc3c7', color: 'white' };
    }
    return <span className="status-badge" style={badgeStyle}>{status}</span>;
  };

  return (
    <div className="sellers-page">
      <div className="page-header">
        <h1>Sellers</h1>
        <BackButton to="/dashboard" className="back-btn" />
      </div>
      <div className="sellers-controls">
        <div className="sellers-search-container">
          <input
            type="text"
            placeholder="Search sellers..."
            value={localSearchTerm}
            onChange={(e) => setLocalSearchTerm(e.target.value)}
            className="local-search-input"
          />
        </div>
        <div className="sort-container">
          <label htmlFor="seller-sort-select">Sort by:</label>
          <select 
            id="seller-sort-select"
            className="sort-select" 
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field);
              setSortOrder(order);
              setCurrentPage(1);
            }}
          >
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="store-asc">Store (A-Z)</option>
            <option value="store-desc">Store (Z-A)</option>
            <option value="products-asc">Products (Least to Most)</option>
            <option value="products-desc">Products (Most to Least)</option>
            <option value="date-desc">Date (Newest)</option>
            <option value="date-asc">Date (Oldest)</option>
          </select>
        </div>
      </div>
      <table className="sellers-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Store Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Products</th>
            <th>Verification Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedSellers.map((seller) => (
            <tr key={seller._id}>
              <td>{seller?.sellerName || '—'}</td>
              <td>{seller?.storeName || '—'}</td>
              <td>{seller?.email || '—'}</td>
              <td>{seller?.phone || '—'}</td>
              <td>
                <span className="product-count-badge">
                  {seller.productCount || 0}
                </span>
              </td>
              <td>{getStatusBadge(seller.verificationStatus)}</td>
              <td>
                <button className="action-btn view-details-btn" onClick={() => handleViewDetails(seller._id)}>👁️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        itemsPerPage={itemsPerPage}
        totalItems={sortedSellers.length}
      />
    </div>
  );
};

export default SellersPage;