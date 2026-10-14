import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  fetchFavoritesFromBackend,
  removeFavoriteFromBackend,
} from "../../Redux/favoritesSlice";
import { addToCartWithBackendSync } from "../../Redux/cartSlice";
import Navbar from "../Navbar/Navbar";
import BackButton from "../Common/BackButton/BackButton";
import "./FavoritesPage.css";

const FavoritesPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.user);
  const { items: favoritesIds, loading } = useSelector(
    (state) => state.favorites
  );
  const { cartItems } = useSelector((state) => state.cart);

  const [favorites, setFavorites] = useState([]);
  const [error, setError] = useState(null);

  const slugify = (str) =>
    str
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  const getProductURL = (product) => {
    const categorySlug = product.category
      ? slugify(product.category)
      : "products";
    const subcategorySlug = product.subcategory
      ? slugify(product.subcategory)
      : "general";
    const productNameSlug = slugify(product.name);
    const productIdSlug = product._id ? slugify(product._id) : "";

    return `/${categorySlug}/${subcategorySlug}/${productNameSlug}/${productIdSlug}`;
  };

  useEffect(() => {
    if (!user || !token) {
      toast.error("Please login to view your favorites");
      navigate("/login", { replace: true });
      return;
    }
    fetchFavorites();
  }, [user, token, navigate]);

  const fetchFavorites = async () => {
    try {
      setError(null);
      const result = await dispatch(fetchFavoritesFromBackend()).unwrap();
      setFavorites(result);
    } catch (err) {
      console.error("Failed to fetch favorites:", err);
      setError("Failed to load favorites. Please try again.");
      toast.error("Failed to load favorites");
    }
  };

  const handleRemoveFavorite = async (productId) => {
    try {
      await dispatch(removeFavoriteFromBackend(productId)).unwrap();
      setFavorites((prev) => prev.filter((fav) => fav._id !== productId));
      toast.success("Removed from favorites");
    } catch (err) {
      console.error("Failed to remove favorite:", err);
      toast.error("Failed to remove from favorites");
    }
  };

  const handleAddToCart = async (product) => {
    try {
      // Check if product is already in cart
      const existingItem = cartItems.find(
        (item) => item.productId === product._id
      );

      if (existingItem) {
        toast.info("Product is already in your cart");
        return;
      }

      // Add to cart with backend sync
      await dispatch(
        addToCartWithBackendSync({
          id: product._id,
          name: product.name,
          price: product.offeredPrice ?? product.price,
          image: product.images?.[0] || product.image,
        })
      ).unwrap();

      toast.success("Added to cart successfully!");
    } catch (err) {
      console.error("Failed to add to cart:", err);
      toast.error("Failed to add to cart");
    }
  };

  if (loading) {
    return (
      <div className="favorites-container">
        <div className="favorites-wrapper">
          <BackButton to="/" label="Back" />
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading your favorites...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="favorites-container">
        <div className="favorites-wrapper">
          <BackButton to="/" label="Back" />
          <div className="error-container">
            <i className="fas fa-exclamation-triangle error-icon"></i>
            <h3>Error Loading Favorites</h3>
            <p>{error}</p>
            <button onClick={fetchFavorites} className="retry-btn">
              <i className="fas fa-redo"></i>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="favorites-container">
        <div className="favorites-wrapper">
          <BackButton to="/" label="Back" />
          {/* Header */}
          <div className="favoriteheader">
            <h1 className="favoritetitle">My Favorites</h1>
            <p className="subtitle">Your saved items and wishlist</p>
          </div>

          {/* Favorites List */}
          <div className="favorites-section">
            {favorites.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-heart empty-icon"></i>
                <h3>No favorites found</h3>
                <p>You haven't added any items to your favorites yet</p>
                <button
                  onClick={() => navigate("/products")}
                  className="start-shopping-btn"
                >
                  <i className="fas fa-shopping-cart"></i>
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="favorites-grid">
  {favorites.map((product) => (
    <div key={product._id} className="favorite-item">
      <div className="favorite-item-top">
        <img
          src={product.images?.[0] || product.image}
          alt={product.name}
        />
        <div className="favorite-details">
          <h4>{product.name}</h4>
          <p>₹{product.offeredPrice ?? product.price}</p>
          <p className="product-desc-mobile">{product.description}</p>
        </div>
      </div>
      <div className="favorite-actions">
        <button onClick={() =>{
          handleAddToCart(product);
          handleRemoveFavorite(product._id);
          toast.success("Added to cart successfully!");
        }}>
          Add to Cart
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(getProductURL(product));
          }}
        >
          View Details
        </button>
        <button onClick={() => handleRemoveFavorite(product._id)}>
          Remove
        </button>
      </div>
    </div>
  ))}
</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default FavoritesPage;