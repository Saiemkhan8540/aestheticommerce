import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './MyProducts.module.css';
import Layout from '../../src/components/Layouts/Layout';
import { useNavigate } from 'react-router-dom';

const BASE_URL = import.meta.env.VITE_API_URL;

const MyProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem('sellerToken');
        const response = await axios.get(`${BASE_URL}/api/seller/products`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProducts(response.data);
      } catch (err) {
        setError('Failed to fetch products.');
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  if (loading) return <p>Loading your products...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <Layout>
      <div className={styles.container}>
        <h1>My Products</h1>
      {products.length === 0 ? (
        <p>You haven't added any products yet.</p>
      ) : (
        <div className={styles.productList}>
          {products.map(product => (
            <div key={product._id} className={styles.productCard}>
              <div className={styles.imageWrapper}>
                <img src={product.images[0]} alt={product.name} className={styles.productImage} />
                {product.productVideo && (
                  <div className={styles.videoBadge}>
                    <span>Video</span>
                  </div>
                )}
              </div>
              <div className={styles.productDetails}>
                <h3>{product.name}</h3>
                <p><strong>Status:</strong> 
                  <span className={`${styles.status} ${styles[product.approvalStatus]}`}>
                    {product.approvalStatus}
                  </span>
                </p>
                {product.approvalStatus === 'rejected' && product.adminNotes && (
                  <p className={styles.rejectionReason}><strong>Reason:</strong> {product.adminNotes}</p>
                )}
                <button
                    className={styles.updateBtn}
                    onClick={() => navigate(`/products/${product._id}/update-details`)}
                  >
                    Update
                  </button>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </Layout>
  );
};

export default MyProducts;