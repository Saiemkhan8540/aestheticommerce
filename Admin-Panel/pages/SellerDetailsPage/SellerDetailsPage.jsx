import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BackButton from '../../src/component/Common/BackButton/BackButton';
import './SellerDetailsPage.css';

const API = import.meta.env.VITE_API_URL;

const SellerDetailsPage = () => {
  const { sellerId } = useParams();
  const navigate = useNavigate();
    const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSellerDetails = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${API}/api/admin/sellers/${sellerId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        setSeller(data);
      } catch (error) {
        console.error('Error fetching seller details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSellerDetails();

    const fetchSellerProducts = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${API}/api/admin/sellers/${sellerId}/products`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching seller products:', error);
      }
    };

    fetchSellerProducts();
  }, [sellerId]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this seller?')) {
      try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${API}/api/admin/sellers/${sellerId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (response.ok) {
          alert('Seller deleted successfully.');
          navigate('/sellers');
        } else {
          alert('Failed to delete seller.');
        }
      } catch (error) {
        console.error('Error deleting seller:', error);
      }
    }
  };

  const handleBlock = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API}/api/admin/sellers/${sellerId}/block`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isBlocked: !seller.isBlocked }),
      });
      const data = await response.json();
      setSeller(data);
    } catch (error) {
      console.error('Error blocking seller:', error);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!seller) return <div>Seller not found</div>;

  return (
    <div className="seller-details-page">
      <div className="details-header">
        <h1>{seller.storeName}</h1>
        <div className="action-buttons">
          <button onClick={handleDelete} className="action-btn delete-btn">Delete</button>
          <button onClick={handleBlock} className={`action-btn ${seller.isBlocked ? 'unblock-btn' : 'block-btn'}`}>
            {seller.isBlocked ? 'Unblock' : 'Block'}
          </button>
          <BackButton to="/sellers" className="action-btn back-btn" />
        </div>
      </div>

      <div className="seller-details-layout">
        <div className="seller-details-sidebar">
          <div className="detail-card">
            <h2>Contact Information</h2>
            <p><strong>Name:</strong> {seller.sellerName}</p>
            <p><strong>Email:</strong> {seller.email}</p>
            <p><strong>Phone:</strong> {seller.phone}</p>
          </div>

          <div className="detail-card">
            <h2>Business Details</h2>
            <p><strong>Type:</strong> {seller.businessType}</p>
            <p><strong>GST:</strong> {seller.gstNumber || 'N/A'}</p>
            <p><strong>Address:</strong> {`${seller.businessAddress?.street || ''}, ${seller.businessAddress?.city || ''}`}</p>
          </div>

          <div className="detail-card">
            <h2>KYC & Verification</h2>
            <p><strong>Status:</strong> {seller.verificationStatus}</p>
            <p><a href={`${API}/${seller.governmentIdProof}`} target="_blank" rel="noopener noreferrer">View ID Proof</a></p>
            <p><a href={`${API}/${seller.addressProof}`} target="_blank" rel="noopener noreferrer">View Address Proof</a></p>
          </div>

          <div className="detail-card">
            <h2>Banking Details</h2>
            <p><strong>Account Holder:</strong> {seller.bankDetails?.accountHolderName}</p>
            <p><strong>Account Number:</strong> {seller.bankDetails?.accountNumber}</p>
            <p><strong>IFSC:</strong> {seller.bankDetails?.ifscCode}</p>
          </div>
        </div>

        <div className="product-list-main">
          <h2>Products</h2>
          {products.length > 0 ? (
            <table className="products-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {products
                  .filter(product => product.approvalStatus === 'approved')
                  .map(product => (
                    <tr key={product._id}>
                      <td>
                        <img src={product.images[0]} alt={product.name} className="product-thumbnail" />
                      </td>
                      <td>{product.name}</td>
                      <td>₹{product.price}</td>
                      <td>{product.approvalStatus}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          ) : (
            <p>No products found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerDetailsPage;