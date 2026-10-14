import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchSellerProducts } from "../../src/Redux/dashboardSlice";
import BackButton from "../../src/components/Common/BackButton/BackButton";
import "./ProductDetailPage.css";

import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";

const SellerProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux state
  const { products, isLoading } = useSelector((state) => state.dashboard);
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!products || products.length === 0) {
      dispatch(fetchSellerProducts(token));
    }
  }, [dispatch, products, token]);

  const product = products?.find((p) => p._id === id);

  // Image & Zoom State
  const [mainImage, setMainImage] = useState("");
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (product?.images?.length > 0) {
      setMainImage(product.images);
    }
  }, [product]);

  // External Zoom Logic
  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    let x = ((e.clientX - left) / width) * 100;
    let y = ((e.clientY - top) / height) * 100;

    // Constrain within 0-100%
    x = Math.max(0, Math.min(x, 100));
    y = Math.max(0, Math.min(y, 100));

    setZoomPos({ x, y });
  };

  // Loader state
  if (isLoading) {
    return (
      <div className="product-detail-wrapper loading-state">
        <div className="loader"></div>
        <p>Loading product details...</p>
      </div>
    );
  }

  // If product not found
  if (!product) {
    return (
      <div className="product-detail-wrapper error-state">
        <BackButton to="/products" label="Back to Products" />
        <p>Product not found.</p>
      </div>
    );
  }

  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - (product.discountedPrice || product.price)) / product.originalPrice) * 100) 
    : 0;

  return (
    <div className="product-detail-wrapper">
      <div className="header-actions">
        <BackButton to="/products" label="Back to Inventory" />
      </div>

      <div className="product-detail-card">
        <div className="product-gallery" style={{ position: 'relative' }}>
          <div 
            className="main-image-container zoom-source"
            onMouseEnter={() => setIsZooming(true)}
            onMouseLeave={() => setIsZooming(false)}
            onMouseMove={handleMouseMove}
          >
            <img src={mainImage || "/placeholder-image.png"} alt={product.name} className="main-image" />
            
            {/* Tracking Lens */}
            {isZooming && (
              <div 
                className="zoom-lens" 
                style={{ left: `${zoomPos.x}%`, top: `${zoomPos.y}%` }}
              ></div>
            )}

            {product.discountPercentage > 0 && (
              <div className="discount-badge">-{product.discountPercentage}%</div>
            )}
          </div>

          {/* External Zoom Panel */}
          {isZooming && mainImage && (
            <div 
              className="external-zoom-panel"
              style={{
                backgroundImage: `url(${mainImage})`,
                backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`
              }}
            ></div>
          )}

          {product.images && product.images.length > 1 && (
            <div className="thumbnail-scroll">
              {product.images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`thumb-${i}`}
                  className={`thumbnail ${mainImage === img ? "active" : ""}`}
                  onClick={() => setMainImage(img)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="product-info-section">
          
          <div className="header-status">
            <span className={`status-badge ${product.inStock > 0 ? "active" : "out-of-stock"}`}>
              <span className="dot"></span>
              {product.inStock > 0 ? "Active Listing" : "Out of Stock"}
            </span>
          </div>

          <div className="product-header">
            <h1 className="product-title">{product.name}</h1>
            {/* <p className="product-id">Product ID: <span>{product._id}</span></p> */}
          </div>

          <div className="seller-metrics-grid">
            <div className="metric-card simple-box">
              <div className="metric-label">Selling Price</div>
              <div className="metric-value">
                ₹ {product.sellingPrice || product.price ? Number(product.sellingPrice || product.price).toFixed(2) : "0.00"}
              </div>
            </div>

            <div className="metric-card simple-box">
              <div className="metric-label">MRP</div>
              <div className="metric-value-row">
                <span className="metric-value strikethrough">
                  ₹ {product.originalPrice || product.mrp ? Number(product.originalPrice || product.mrp).toFixed(2) : "0.00"}
                </span>
                {discountPercentage > 0 && (
                  <span className="save-text"> | Save {discountPercentage}%</span>
                )}
              </div>
            </div>

            <div className="metric-card simple-box">
              <div className="metric-label">Current Stock</div>
              <div className="metric-value-row">
                <span className={`metric-value ${product.inStock > 0 ? "text-green" : "text-red"}`}>
                  {product.inStock || 0} Units
                </span>
                <div className="stock-bar-container">
                  <div 
                    className="stock-bar-fill" 
                    style={{ width: `${Math.min(((product.inStock || 0) / 50) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="metric-card simple-box">
              <div className="metric-label">Total Sold</div>
              <div className="metric-value-row space-between">
                <span className="metric-value">142 Units</span>
                <div className="sparkline-chart">
                  <svg viewBox="0 0 60 20" width="60" height="20">
                    <path d="M0 20 L 0 15 Q 10 8, 20 12 T 40 8 L 60 2 L 60 20 Z" fill="#eaf4ef" />
                    <path d="M0 15 Q 10 8, 20 12 T 40 8 L 60 2" fill="none" stroke="#6eb98c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="description-container">
            <h3>Description</h3>
            <div className="description-content">
              <MDXEditor
                markdown={product?.description ?? ""}
                readOnly
                plugins={[headingsPlugin(), listsPlugin(), quotePlugin()]}
                contentEditableClassName="clean-editor-content"
              />
            </div>
          </div>

          {/* <div className="seller-action-buttons">
            <button className="btn btn-edit" onClick={handleEdit}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16" style={{marginRight: '8px'}}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              Edit Product
            </button>
            <button className="btn btn-delete" onClick={handleDelete}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16" style={{marginRight: '8px'}}><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
              Delete Product
            </button>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default SellerProductDetailPage;
