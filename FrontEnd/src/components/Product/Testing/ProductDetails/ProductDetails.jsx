import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchProductById,
  clearCurrentProduct,
} from "../../../../Redux/productSlice";
import {
  Star,
  Heart,
  ShoppingCart,
  Plus,
  Minus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Button } from "../../../../ui/Button";
import RatingStars from "../../RatingStars/RatingStars.jsx";
import ProductReviews from "../../../Review/ProductReview/ProductReview.jsx";
import { motion as Motion, AnimatePresence } from "framer-motion";
import Breadcrumb from "../ShopM/Breadcrumb/Breadcrumb.jsx";
import Navbar from "../../../Navbar/Navbar.jsx";
import Footersec from "../../../Footersection/Footersection.jsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../../ui/dialog";
import "./ProductDetails.css";
import { addToCartWithBackendSync } from "../../../../Redux/cartSlice";
import {
  addFavoriteToBackend,
  removeFavoriteFromBackend,
} from "../../../../Redux/favoritesSlice";

import SEO from "../../../../utils/SEO.jsx";
import DeliveryEstimateBanner from "../../../Common/DeliveryEstimateBanner/DeliveryEstimateBanner";
import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";

export const slugify = (str) =>
  str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const ProductDetails = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    currentProduct: product,
    currentProductLoading: loading,
    currentProductError: productError,
  } = useSelector((state) => state.products);
  const favorites = useSelector((state) => state.favorites.items);
  const effectivePrice =
    product?.offeredPrice ?? product?.sellingPrice ?? product?.price;

  useEffect(() => {
    if (productId) {
      dispatch(clearCurrentProduct());
      dispatch(fetchProductById(productId));
    }
    return () => {
      dispatch(clearCurrentProduct());
    };
  }, [productId, dispatch]);

  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [showZoom, setShowZoom] = useState(false);
  const [showBuyNowDialog, setShowBuyNowDialog] = useState(false);
  const [pincode, setPincode] = useState("");
  const [deliveryAvailability, setDeliveryAvailability] = useState(null);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

  const imageRef = useRef(null);

  const media = [
    ...(product?.images?.map((img) => ({ type: "image", url: img })) || []),
    ...(product?.productVideo
      ? [{ type: "video", url: product.productVideo }]
      : []),
  ];

  const handleNextMedia = () => {
    setSelectedMediaIndex((prevIndex) => (prevIndex + 1) % media.length);
  };

  const handlePrevMedia = () => {
    setSelectedMediaIndex(
      (prevIndex) => (prevIndex - 1 + media.length) % media.length,
    );
  };

  const handleImageHover = (e) => {
    if (media[selectedMediaIndex]?.type === "video") {
      setShowZoom(false);
      return;
    }
    if (e.target.closest(".carousel-button")) {
      setShowZoom(false);
      return;
    }
    if (!imageRef.current) return;
    const { left, top, width, height } =
      imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPosition({ x, y });
    setShowZoom(true);
  };

  const handleImageLeave = () => {
    setShowZoom(false);
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    try {
      await dispatch(
        addToCartWithBackendSync({
          id: product._id,
          name: product.name,
          price: effectivePrice,
          image: product.images[0],
          quantity,
        }),
      ).unwrap();
      toast.success(`${quantity} x ${product.name} added to cart!`);
    } catch (error) {
      console.error("Failed to add to cart:", error);
      toast.error("Failed to add to cart");
    }
  };

  const handleBuyNow = async () => {
    try {
      // Buy now is completely independent of add to cart
      // Navigate directly to checkout with product info in URL params or state
      navigate("/order-checkout", {
        state: {
          buyNowProduct: {
            id: product._id,
            name: product.name,
            price: effectivePrice,
            mrp: product.mrp ?? product.originalPrice,
            image: product.images[0],
            quantity: Number(quantity) || 1,
            category: product.category,
            subcategory: product.subcategory,
          },
          isBuyNow: true,
        },
      });
    } catch (error) {
      console.error("Failed to process buy now:", error);
      toast.error("Failed to process buy now request");
    }
  };

  const handleFavoriteToggle = async () => {
    if (!product) return;

    try {
      if (isFavorite) {
        await dispatch(removeFavoriteFromBackend(product._id)).unwrap();
        toast.success(`${product.name} removed from favorites`);
      } else {
        await dispatch(addFavoriteToBackend(product._id)).unwrap();
        toast.success(`${product.name} added to favorites`);
      }
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
      toast.error("Failed to update favorites");
    }
  };

  const handleCheckPincode = () => {
    if (!pincode || pincode.trim() === "") {
      toast.error("Please enter a pincode");
      return;
    }
    if (pincode.length !== 6) {
      toast.error("Please enter a valid 6-digit pincode");
      return;
    }

    if (/^\d{6}$/.test(pincode)) {
      setDeliveryAvailability(true);
      toast.success("Delivery available in your area!");
    } else {
      setDeliveryAvailability(false);
      toast.error("Please enter a valid 6-digit pincode");
    }
  };

  const isFavorite = favorites.includes(product?._id);

  const discount =
    product?.originalPrice && effectivePrice < product.originalPrice
      ? Math.round(
        ((product.originalPrice - effectivePrice) / product.originalPrice) *
        100,
      )
      : 0;

  const getBreadcrumbItems = () => {
    if (!product) return [];
    const items = [{ label: "Products", href: "/products" }];
    const categorySlug = slugify(product.category);
    const subcategorySlug = slugify(product.subcategory);

    if (product.category) {
      items.push({ label: product.category, href: `/${categorySlug}` });
    }
    if (product.subcategory) {
      items.push({
        label: product.subcategory,
        href: `/${categorySlug}/${subcategorySlug}`,
      });
    }
    items.push({ label: product.name, href: "" });
    return items;
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading product...</p>
        </div>
        <Footersec />
      </>
    );
  }

  if (!loading && !product) {
    return (
      <>
        <Navbar />
        <div className="not-found-container">
          <h2 className="not-found-title">Product Not Found</h2>
          <p className="not-found-message">
            {productError || "The product you are looking for does not exist."}
          </p>
          <Button
            className="back-to-shop-btn"
            onClick={() => navigate("/shop")}
          >
            Return to Shop
          </Button>
        </div>
        <Footersec />
      </>
    );
  }
  const productSchema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    image: product.images,
    description: product.description,
    sku: product._id,
    brand: {
      "@type": "Brand",
      name: "Aestheticommerce",
    },
    aggregateRating: product.rating
      ? {
        "@type": "AggregateRating",
        ratingValue: product.rating,
        reviewCount: product.reviewCount || 1,
      }
      : undefined,
    offers: {
      "@type": "Offer",
      url: `https://aestheticommerce.com/${product.category}/${product.subcategory}/${product.name}/${productId}`,
      priceCurrency: "INR",
      price: product.sellingPrice || product.price,
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  const shortdesc =
    product.description?.length > 150
      ? product.description.slice(0, 150)
      : product.description;

  console.log("product schema", productSchema);
  console.log("product :- ", product);
  return (
    <>
      <SEO
        title={`${product.name}| Buy ${product.category} Online |Aestheticommerce`}
        description={`${shortdesc} Shop authentic ${product.subcategory} at best price. Fast delivery across India.`}
        keywords={`${product.name},${product.subcategory},${product.category},aesthetic art online , aesthetic handmade art`}
        url={`https://aestheticommerce.com/${product.category}/${product.subcategory}/${product.name}/${productId}`}
        image={product.images[0]}
        schema={productSchema}
      />
      <Navbar />
      <Breadcrumb
        className="breadcrumb-container"
        items={getBreadcrumbItems()}
      />

      <div className="product-detail-container">
        <div className="product-detail-content">
          {/* Mobile/Tablet Header - Title and Rating Only (Hidden on Desktop) */}
          {/* <div className="mobile-product-header">
            <h1 className="product-title1">{product.name}</h1>
            <div className="rating-container23">
              <RatingStars rating={product.rating} />
            </div>
          </div> */}

          <div className="thumbnail-column">
            <div className="thumbnail-container">
              {media.map((item, index) => (
                <div
                  key={index}
                  className={`thumbnail-item ${selectedMediaIndex === index
                      ? "selected-thumbnail"
                      : "dimmed-thumbnail"
                    }`}
                  onClick={() => setSelectedMediaIndex(index)}
                >
                  {item.type === "video" ? (
                    <video src={item.url} className="thumbnail-image" />
                  ) : (
                    <img
                      src={item.url}
                      alt={`${product.name} thumbnail ${index + 1}`}
                      className="thumbnail-image"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div
            className="main-image-container"
            onMouseMove={handleImageHover}
            onMouseLeave={handleImageLeave}
            ref={imageRef}
          >
            {media.length > 1 && (
              <button
                className="carousel-button left"
                onClick={handlePrevMedia}
                aria-label="Previous media"
              >
                <ChevronLeft size={24} />
              </button>
            )}

            <div className="main-image-wrapper">
              {/* <AnimatePresence mode="popLayout"> */}
              <AnimatePresence>
                <Motion.div
                  key={selectedMediaIndex}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.3 }}
                  className="image-animation-container"
                >
                  {media[selectedMediaIndex]?.type === "video" ? (
                    <video
                      src={media[selectedMediaIndex].url}
                      controls
                      autoPlay
                      muted
                      className="main-product-image"
                      style={{ objectFit: "contain" }}
                    />
                  ) : (
                    <img
                      src={media[selectedMediaIndex]?.url}
                      alt={product.name}
                      className="main-product-image"
                    />
                  )}
                </Motion.div>
                {/* </AnimatePresence> */}

                {/* Mobile dots indicator - only show on mobile */}
                {media.length > 1 && (
                  <div className="mobile-dots-container">
                    {media.map((_, index) => (
                      <button
                        key={index}
                        className={`mobile-dot ${selectedMediaIndex === index ? "active" : ""
                          }`}
                        onClick={() => setSelectedMediaIndex(index)}
                        aria-label={`Go to media ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </AnimatePresence>

              <button
                onClick={handleFavoriteToggle}
                className={`favorite-button ${isFavorite ? "favorite-active" : ""
                  }`}
                aria-label={
                  isFavorite ? "Remove from favorites" : "Add to favorites"
                }
              >
                <Heart size={20} fill={isFavorite ? "currentColor" : "none"} />
              </button>
            </div>

            {media.length > 1 && (
              <button
                className="carousel-button right"
                onClick={handleNextMedia}
                aria-label="Next media"
              >
                <ChevronRight size={24} />
              </button>
            )}

            {showZoom && media[selectedMediaIndex]?.type === "image" && (
              <div className="zoom-overlay">
                <div
                  className="zoom-content"
                  style={{
                    backgroundImage: `url(${media[selectedMediaIndex].url})`,
                    backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                  }}
                />
              </div>
            )}
          </div>

          <div
            className={`product-card-details ${showZoom ? "details-dimmed" : ""
              }`}
          >
            {/* Desktop Header - Title and Rating (Hidden on Mobile/Tablet) */}
            <div className="desktop-product-header">
              <h1 className="product-title1">{product.name}</h1>
              <div className="rating-container23">
                <RatingStars rating={product.rating} />
              </div>
            </div>

            {/* Price and stock above description */}
            <div className="product-details-content product-details-top">
              <div className="price-container">
                <div className="price-wrapper">
                  <span className="current-price1">₹{effectivePrice}</span>
                  {(product.mrp || product.originalPrice) && (
                    <span className="original-price">
                      ₹{product.mrp || product.originalPrice}
                    </span>
                  )}
                  {discount > 0 && (
                    <span className="discount-text">{discount}% off</span>
                  )}
                </div>
              </div>
              <div className="stock-status">
                <span
                  className={`stock-badge ${product.inStock ? "in-stock" : "out-of-stock"
                    }`}
                >
                  {product.inStock ? "In Stock" : "Out of Stock"}
                </span>
              </div>
            </div>
            {/* Quantity, pincode, actions */}
            <div className="product-details-content">
              <div className="quantity-section">
                <span className="quantity-label">Quantity:</span>
                <div className="quantity-selector">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="quantity-btn"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="quantity-value">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= 10}
                    className="quantity-btn"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              <div className="pincode-section">
                <div className="pincode-checker">
                  <input
                    type="text"
                    placeholder="Enter pincode"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && handleCheckPincode()
                    }
                    className="pincode-input"
                    maxLength={6}
                  />
                  <button onClick={handleCheckPincode} className="check-btn">
                    Check
                  </button>
                </div>
                {deliveryAvailability !== null && (
                  <p
                    style={{
                      marginTop: "8px",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: deliveryAvailability ? "#10b981" : "#ef4444",
                    }}
                  >
                    {deliveryAvailability
                      ? "Delivery available"
                      : "Not available in your area"}
                  </p>
                )}
              </div>

              <DeliveryEstimateBanner />

              <div className="description-container">
                <h3 className="section-title">Description</h3>
                <div
                  className={`product-description description-content ${!descriptionExpanded ? "description-collapsed" : ""
                    }`}
                >
                  <MDXEditor
                    markdown={product?.description ?? ""}
                    readOnly
                    plugins={[headingsPlugin(), listsPlugin(), quotePlugin()]}
                    contentEditableClassName="clean-editor-content"
                  />
                </div>
                {(product?.description ?? "").trim() && (
                  <button
                    type="button"
                    className="description-read-more-btn"
                    onClick={() => setDescriptionExpanded((prev) => !prev)}
                  >
                    {descriptionExpanded ? "Read less" : "Read more"}
                  </button>
                )}
              </div>

              <div className="action-buttons1">
                <Button
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className="add-to-cart-btn1"
                >
                  <ShoppingCart size={18} />
                  <span>Add to Cart</span>
                </Button>

                <Button
                  onClick={handleBuyNow}
                  disabled={!product.inStock}
                  className="buy-now-btn"
                >
                  <span>Buy Now</span>
                </Button>
              </div>

              {product.tags && product.tags.length > 0 && (
                <div className="tags-container">
                  {product.tags.map((tag) => (
                    <span key={tag} className="product-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showBuyNowDialog && (
        <Dialog open={showBuyNowDialog} onOpenChange={setShowBuyNowDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Purchase</DialogTitle>
              <DialogDescription>
                Buy {quantity} × {product.name} for ₹
                {(effectivePrice * quantity).toFixed(2)}?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowBuyNowDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  handleAddToCart();
                  navigate("/checkout");
                }}
              >
                Proceed to Checkout
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      <ProductReviews productId={product._id} />
      <Footersec />
    </>
  );
};

export default ProductDetails;
