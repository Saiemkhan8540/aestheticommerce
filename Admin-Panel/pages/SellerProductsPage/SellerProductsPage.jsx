import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import BackButton from '../../src/component/Common/BackButton/BackButton';
import './SellerProductsPage.css';

const API = import.meta.env.VITE_API_URL;

const SellerProductsPage = () => {
  const [products, setProducts] = useState([]);
  const { sellerId } = useParams();

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const token = localStorage.getItem('adminToken');
        await fetch(`${API}/api/admin/products/${productId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setProducts(products.filter(p => p._id !== productId));
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
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

    fetchProducts();
  }, [sellerId]);

  return (
    <div className="seller-products-page">
      <div className="page-header">
        <h1>Seller Products</h1>
        <BackButton to="/sellers" className="back-btn" />
      </div>
      <table className="products-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>MRP</th>
            <th>Category</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map(product => (
            <tr key={product._id}>
              <td>{product.name}</td>
              <td>{product.description}</td>
              <td>{product.mrp}</td>
              <td>{product.category}</td>
              <td className={`status-${product.approvalStatus.toLowerCase()}`}>{product.approvalStatus}</td>
              <td>
                <button onClick={() => handleDelete(product._id)} className="delete-btn">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SellerProductsPage;