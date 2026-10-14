import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import './GlobalSearchPage.css';

const GlobalSearchPage = () => {
  const BASE_URL = import.meta.env.VITE_API_URL;

  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const navigate = useNavigate();
  const [riders, setRiders] = useState([]);
  const [products, setProducts] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (query) {
      searchAll(query);
    } else {
      setProducts([]);
      setSellers([]);
      setRiders([]);
    }
  }, [query]);

  const searchAll = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setProducts([]);
      setSellers([]);
      setRiders([]);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('adminToken');

      if (!token) {
        setError('No authentication token found. Please log in.');
        setLoading(false);
        return;
      }

      const [pendingRes, approvedRes, rejectedRes, sellersRes ,pendingRidersRes,activeRidersRes] = await Promise.all([
        axios.get(`${BASE_URL}/api/admin/products?status=pending`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(err => ({ data: [] })),

        axios.get(`${BASE_URL}/api/admin/products?status=approved`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(err => ({ data: [] })),

        axios.get(`${BASE_URL}/api/admin/products?status=rejected`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(err => ({ data: [] })),

        fetch(`${BASE_URL}/api/admin/sellers`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then(res => (res.ok ? res.json() : []))
          .catch(() => []),
        
        axios.get(`${BASE_URL}/api/admin/riders/pending`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => ({ data: { data: [] } })),

        axios.get(`${BASE_URL}/api/admin/riders/active`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => ({ data: { data: [] } })),
      ]);

      const allProducts = [
        ...(pendingRes.data || []),
        ...(approvedRes.data || []),
        ...(rejectedRes.data || []),
      ];

      const allRiders = [
        ...(pendingRidersRes.data?.data || []),
        ...(activeRidersRes.data?.data || []),
      ];

      const allSellers = Array.isArray(sellersRes) ? sellersRes : [];

      const lowercasedQuery = searchQuery.toLowerCase().trim();

      const filteredProducts = allProducts.filter((product) => {
        try {
          const productName = (product.name || '').toLowerCase();
          const sellerName = (product.sellerId?.sellerName || '').toLowerCase();
          const storeName = (product.sellerId?.storeName || '').toLowerCase();
          const description = (product.description || '').toLowerCase();
          const status = (product.status || '').toLowerCase();
          const category = (product.category || '').toLowerCase();

          return (
            productName.includes(lowercasedQuery) ||
            sellerName.includes(lowercasedQuery) ||
            storeName.includes(lowercasedQuery) ||
            description.includes(lowercasedQuery) ||
            status.includes(lowercasedQuery) ||
            category.includes(lowercasedQuery)
          );
        } catch {
          return false;
        }
      });

      const filteredSellers = allSellers.filter((seller) => {
        try {
          const sellerName = (seller.sellerName || '').toLowerCase();
          const storeName = (seller.storeName || '').toLowerCase();
          const email = (seller.email || '').toLowerCase();
          const phone = (seller.phone || '').toLowerCase();

          return (
            sellerName.includes(lowercasedQuery) ||
            storeName.includes(lowercasedQuery) ||
            email.includes(lowercasedQuery) ||
            phone.includes(lowercasedQuery)
          );
        } catch {
          return false;
        }
      });
      const filteredRiders = allRiders.filter((rider) => {
        try {
          const name = (rider.name || '').toLowerCase();
          const email = (rider.email || '').toLowerCase();
          const phone = (rider.phone || '').toLowerCase();
          const city = (rider.currentCity || '').toLowerCase();

          return (
            name.includes(lowercasedQuery) ||
            email.includes(lowercasedQuery) ||
            phone.includes(lowercasedQuery) ||
            city.includes(lowercasedQuery)
          );
        } catch {
          return false;
        }
      });

      setRiders(filteredRiders);
      setProducts(filteredProducts);
      setSellers(filteredSellers);
    } catch (err) {
      console.error('[GlobalSearch] Failed to fetch search results:', err);
      setError('Failed to fetch search results. Please try again.');
    }

    setLoading(false);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'approved':
        return 'badge-approved';
      case 'rejected':
        return 'badge-rejected';
      case 'pending':
        return 'badge-pending';
      default:
        return '';
    }
  };

  const filteredResults = () => {
  if (activeTab === 'products') return { products, sellers: [], riders: [] };
  if (activeTab === 'sellers') return { products: [], sellers, riders: [] };
  if (activeTab === 'riders') return { products: [], sellers: [], riders };
  return { products, sellers, riders };
};

  const results = filteredResults();
  const totalResults = results.products.length + results.sellers.length + results.riders.length;

  return (
    <div className="global-search-page">
      <div className="search-header">
        <h1>Search Results</h1>
        {query && <p className="search-query">Showing results for: <strong>"{query}"</strong></p>}
        <p className="search-count">{totalResults} result{totalResults !== 1 ? 's' : ''} found</p>
      </div>

      <div className="search-tabs">
        <button className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
          All ({products.length + sellers.length + riders.length})
        </button>
        <button className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>
          Products ({products.length})
        </button>
        <button className={`tab-btn ${activeTab === 'sellers' ? 'active' : ''}`} onClick={() => setActiveTab('sellers')}>
          Sellers ({sellers.length})
        </button>
        <button className={`tab-btn ${activeTab === 'riders' ? 'active' : ''}`}onClick={() => setActiveTab('riders')}>
          Riders ({riders.length})
        </button>
      </div>

      {loading ? (
        <div className="search-loading">Loading...</div>
      ) : error ? (
        <div className="search-error">
          <p>{error}</p>
        </div>
      ) : (
        <div className="search-results">
          {!query ? (
            <div className="no-query">
              <p>Enter a search term in the top bar to search across all products and sellers.</p>
            </div>
          ) : totalResults === 0 ? (
            <div className="no-results">
              <p>No results found for "{query}"</p>
              <p className="no-results-hint">Try different keywords or check your spelling</p>
            </div>
          ) : (
            <>
              {results.products.length > 0 && (
                <div className="results-section">
                  <h2 className="section-title">Products</h2>
                  <div className="products-grid">
                    {results.products.map((product) => (
                      <div key={product._id} className="product-card">
                        {product.images && product.images.length > 0 && (
                          <img src={product.images[0]} alt={product.name || 'Product'} className="product-image" />
                        )}
                        <div className="product-info">
                          <h3 className="product-name">{product.name || 'Unnamed Product'}</h3>
                          {product.status && (
                            <span className={`status-badge ${getStatusBadgeClass(product.status)}`}>
                              {product.status}
                            </span>
                          )}
                          <p className="product-price">₹{product.mrp || 0}</p>
                          <p className="product-seller">
                            <strong>Seller:</strong> {product.sellerId?.sellerName || 'N/A'}
                          </p>
                          <p className="product-store">
                            <strong>Store:</strong> {product.sellerId?.storeName || 'N/A'}
                          </p>
                          {product.description && (
                            <p className="product-description">{product.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
                      {results.riders.length > 0 && (
                        <div className="results-section">
                          <h2 className="section-title">Riders</h2>
                          <div className="sellers-grid">
                            {results.riders.map((rider) => (
                              <div key={rider._id} className="seller-card">
                                <div className="seller-avatar">
                                  {rider.name?.charAt(0).toUpperCase()}
                                </div>
                                <div className="seller-info">
                                  <h3 className="seller-name">{rider.name}</h3>
                                  <p><strong>Email:</strong> {rider.email}</p>
                                  <p><strong>Phone:</strong> {rider.phone}</p>
                                  <p><strong>City:</strong> {rider.currentCity || 'N/A'}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

              {results.sellers.length > 0 && (
                <div className="results-section">
                  <h2 className="section-title">Sellers</h2>
                  <div className="sellers-grid">
                    {results.sellers.map((seller) => (
                      <div key={seller._id} className="seller-card">
                        <div className="seller-avatar">
                          {seller.sellerName.charAt(0).toUpperCase()}
                        </div>
                        <div className="seller-info">
                          <h3 className="seller-name">{seller.sellerName}</h3>
                          <p className="seller-store"><strong>Store:</strong> {seller.storeName}</p>
                          <p className="seller-email"><strong>Email:</strong> {seller.email}</p>
                          <p className="seller-phone"><strong>Phone:</strong> {seller.phone}</p>
                          <button
                            className="view-products-btn"
                            onClick={() => navigate(`/sellers/${seller._id}/products`)}
                          >
                            View Products
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalSearchPage;
