// src/components/ShopPage/ShopPage.jsx
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchShops } from '../../Redux/productSlice';
import './ShopCom.css';
import RatingStars from '../Product/RatingStars/RatingStars';

const ShopCom = () => {
  const dispatch = useDispatch();
  const shops = useSelector(state => state.products?.shops || []);
  const loading = useSelector(state => state.products?.shopsLoading || false);

  useEffect(() => {
    dispatch(fetchShops());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="shop-container">
        <div className="loading-state">
          <h2>Loading shops...</h2>
          <p>Please wait while we fetch the latest shop information.</p>
        </div>
      </div>
    );
  }

  if (shops.length === 0) {
    return (
      <div className="shop-container">
        <div className="no-shops-state">
          <h2>No shops available</h2>
          <p>There are currently no shops with products available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="shop-container">
      <Section title="Available Shops" items={shops} />
    </div>
  );
};

const Section = ({ title, items }) => (
  <div className="shop-section">
    <h2>{title}</h2>
    <div className="shop-cards">
      {items.map((shop, index) => (
        <Link
          to={`/shop-products?store=${encodeURIComponent(shop.storeName)}`}
          className="shop-card"
          key={shop.sellerId?.toString() || index}
        >
          <img src={shop.img} alt={shop.storeName} />
          <div className="shop-info">
            <h3>{shop.storeName}</h3>
            <div className="shop-stats">
              <RatingStars rating={shop.rating} />
              <span className="products">{shop.products} Products</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  </div>
);

export default ShopCom;