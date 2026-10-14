import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProductPage.css';
import toast from 'react-hot-toast';
import ConfirmationModal from '../../src/component/ConfirmationModal/ConfirmationModal';
import Pagination from '../../src/component/Pagination/Pagination';

const API = import.meta.env.VITE_API_URL;

const PRODUCT_BADGES = [
  { key: 'bestSeller', label: 'Bestseller' },
  { key: 'trending', label: 'Trending' },
  { key: 'featured', label: 'Featured' },
  { key: 'newArrival', label: 'New Arrival' },
  { key: 'mostPopular', label: 'Most Popular' },
  { key: 'topRated', label: 'Top Rated' },
  { key: 'onSale', label: 'On Sale' },
  { key: 'limitedStock', label: 'Limited Stock' },
];

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const itemsPerPage = 10;

  const fetchProductsByStatus = async (status) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${API}/api/admin/products?status=${status}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(response.data);
    } catch (err) {
      setError('Failed to fetch products.');
      toast.error('Failed to fetch products.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProductsByStatus(activeTab);
    setCurrentPage(1);
  }, [activeTab]);

  const handleApproveClick = (product) => {
    setSelectedProduct(product);
    setModalAction('approve');
    setModalIsOpen(true);
  };

  const handleRejectClick = (product) => {
    setSelectedProduct(product);
    setModalAction('reject');
    setModalIsOpen(true);
  };

  const handleDeleteClick = (product) => {
    setSelectedProduct(product);
    setModalAction('delete');
    setModalIsOpen(true);
  };

  const handleConfirmAction = () => {
    if (modalAction === 'approve') {
      handleApprove(selectedProduct._id);
    } else if (modalAction === 'reject') {
      handleReject(selectedProduct._id);
    } else if (modalAction === 'delete') {
      handleDelete(selectedProduct._id);
    }
    setModalIsOpen(false);
    setSelectedProduct(null);
    setModalAction(null);
  };

  const handleApprove = async (productId) => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(`${API}/api/admin/products/${productId}/approve`, {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProducts(products.filter(p => p._id !== productId));
      toast.success('Product approved successfully!');
    } catch (err) {
      toast.error('Failed to approve product.');
    }
  };

  const handleDelete = async (productId) => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`${API}/api/admin/products/${productId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProducts(products.filter(p => p._id !== productId));
      toast.success('Product deleted successfully!');
    } catch (err) {
      toast.error('Failed to delete product.');
    }
  };

  const handleReject = async (productId) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (reason) {
      try {
        const token = localStorage.getItem('adminToken');
        await axios.put(`${API}/api/admin/products/${productId}/reject`,
          { adminNotes: reason },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setProducts(products.filter(p => p._id !== productId));
        toast.success('Product rejected successfully!');
      } catch (err) {
        toast.error('Failed to reject product.');
      }
    }
  };

  const handleBadgeChange = async (productId, badgeKey, checked) => {
    const previousProducts = products;

    setProducts(currentProducts =>
      currentProducts.map(product =>
        product._id === productId
          ? {
              ...product,
              badges: {
                ...(product.badges || {}),
                [badgeKey]: checked,
              },
            }
          : product
      )
    );

    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.put(
        `${API}/api/admin/products/${productId}/badges`,
        { badges: { [badgeKey]: checked } },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setProducts(currentProducts =>
        currentProducts.map(product =>
          product._id === productId ? response.data : product
        )
      );
      toast.success('Product badge updated.');
    } catch (err) {
      setProducts(previousProducts);
      if (err.response?.status === 404) {
        toast.error('Badge endpoint not found. Please deploy or restart the backend.');
      } else {
        toast.error('Failed to update product badge.');
      }
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  // Filter products
  const filteredProducts = products.filter(product => {
    if (localSearchTerm === '') return true;
    const lowercasedTerm = localSearchTerm.toLowerCase();
    return (
      product.name.toLowerCase().includes(lowercasedTerm) ||
      (product.sellerId && product.sellerId.sellerName.toLowerCase().includes(lowercasedTerm)) ||
      product.description.toLowerCase().includes(lowercasedTerm)
    );
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let compareA;
    let compareB;

    if (sortBy === 'name') {
      compareA = a.name.toLowerCase();
      compareB = b.name.toLowerCase();
    } else if (sortBy === 'date') {
      compareA = new Date(a.createdAt || a._id);
      compareB = new Date(b.createdAt || b._id);
    } else if (sortBy === 'price') {
      // Use MRP as the admin-facing main price
      compareA = Number(a.mrp) || 0;
      compareB = Number(b.mrp) || 0;
    }

    if (sortOrder === 'asc') {
      return compareA > compareB ? 1 : -1;
    }

    return compareA < compareB ? 1 : -1;
  });

  // Paginate products
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = sortedProducts.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) return <div className="products-loading">Loading...</div>;
  if (error) return <div className="products-error">{error}</div>;

  return (
    <>
      <ConfirmationModal
        isOpen={modalIsOpen}
        onClose={() => setModalIsOpen(false)}
        onConfirm={handleConfirmAction}
        title={`Confirm ${modalAction}`}
      >
        <p>Are you sure you want to {modalAction} this product?</p>
      </ConfirmationModal>
      
      <div className="products-page">
        <div className="products-header">
          <h1>Product Management</h1>
          <p>Review, approve, and manage all products</p>
        </div>

        <div className="products-controls">
          <div className="products-tabs">
            <button 
              className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`} 
              onClick={() => setActiveTab('pending')}
            >
              Pending
            </button>
            <button 
              className={`tab-btn ${activeTab === 'approved' ? 'active' : ''}`} 
              onClick={() => setActiveTab('approved')}
            >
              Approved
            </button>
            <button 
              className={`tab-btn ${activeTab === 'rejected' ? 'active' : ''}`} 
              onClick={() => setActiveTab('rejected')}
            >
              Rejected
            </button>
          </div>

          <div className="products-search-container">
            <input
              type="text"
              placeholder="Search products..."
              value={localSearchTerm}
              onChange={(e) => setLocalSearchTerm(e.target.value)}
              className="local-search-input"
            />
          </div>

          <div className="sort-container">
            <label htmlFor="sort-select">Sort by:</label>
            <select 
              id="sort-select"
              className="sort-select" 
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order);
                setCurrentPage(1);
              }}
            >
              <option value="date-desc">Date (Newest)</option>
              <option value="date-asc">Date (Oldest)</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="price-asc">Price (Low to High)</option>
              <option value="price-desc">Price (High to Low)</option>
            </select>
          </div>
        </div>

        <div className="products-content">
          {paginatedProducts.length === 0 ? (
            <div className="no-products">No products to display.</div>
          ) : (
            <>
              <div className="products-grid">
                {paginatedProducts.map(product => (
                <div key={product._id} className="product-card">
                  <div className="product-media-container">
                    <img src={product.images[0]} alt={product.name} className="product-image" />
                  </div>
                  <div className="product-info">
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-price">₹{product.mrp}</p>

                    {product.productVideo && (
                      <div className="admin-product-video">
                        <p className="product-badges-title">Product Video</p>
                        <video 
                          src={product.productVideo} 
                          controls 
                          width="100%" 
                          className="product-video-player"
                        />
                      </div>
                    )}

                    <div className="product-price-breakdown">
                      <p>
                        <span className="label">Seller price</span>
                        <span>₹{Number(product.sellingPrice) || 0}</span>
                      </p>
                      <p>
                        <span className="label">Platform fee</span>
                        <span>₹{Number(product.platformFee) || 0}</span>
                      </p>
                      <p>
                        <span className="label">Logistics fee</span>
                        <span>₹{Number(product.logisticsFee) || 0}</span>
                      </p>
                      <p>
                        <span className="label">Transaction fee</span>
                        <span>₹{Number(product.transactionFee) || 0}</span>
                      </p>
                      <p>
                        <span className="label">Discount</span>
                        <span>{Number(product.discountPercentage) || 0}%</span>
                      </p>
                    </div>
                    <p className="product-seller">
                      <strong>Seller:</strong> {product.sellerId ? product.sellerId.sellerName : 'N/A'}
                    </p>
                    <p className="product-store">
                      <strong>Store:</strong> {product.sellerId ? product.sellerId.storeName : 'N/A'}
                    </p>
                    <p className="product-phone">
                      <strong>Phone:</strong> {product.sellerId ? product.sellerId.phone : 'N/A'}
                    </p>
                    <p className="product-description">{product.description}</p>
                    <div className="product-badges-admin">
                      <p className="product-badges-title">Badges</p>
                      <div className="product-badges-grid">
                        {PRODUCT_BADGES.map(badge => (
                          <label key={badge.key} className="product-badge-toggle">
                            <input
                              type="checkbox"
                              checked={Boolean(product.badges?.[badge.key])}
                              onChange={(e) =>
                                handleBadgeChange(product._id, badge.key, e.target.checked)
                              }
                            />
                            <span>{badge.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="product-actions">
                    {activeTab === 'pending' && (
                      <>
                        <button onClick={() => handleApproveClick(product)} className="btn-approve">
                          Approve
                        </button>
                        <button onClick={() => handleRejectClick(product)} className="btn-reject">
                          Reject
                        </button>
                      </>
                    )}
                    <button onClick={() => handleDeleteClick(product)} className="btn-delete">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              </div>
              
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                itemsPerPage={itemsPerPage}
                totalItems={sortedProducts.length}
              />
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ProductsPage;
