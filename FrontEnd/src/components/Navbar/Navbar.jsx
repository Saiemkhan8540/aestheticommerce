import React, { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import "./Navbar.css";
import { useSelector } from "react-redux";
import {
  fetchCategories,
  fetchTopSellers,
  buildProductColumn,
  buildBlogColumn,
} from "../../api/navigationApi";
// import { AiFillHeart } from "react-icons/ai";
// // import { FiShoppingCart, FiChevronDown } from "react-icons/fi";
// import { FiShoppingCart } from "react-icons/fi";
// import { CgProfile } from "react-icons/cg";
import logo from "../../Images/Asset9.png"
import {
  Heart,
  ShoppingCart,
  User,
  Menu,
  X,
  Home,
  Grid2X2,
  Store,
  BookOpen,
} from "lucide-react";
import { IoBagOutline } from "react-icons/io5";
import { useRef } from "react";

// Static content placeholders for Shops and Blogs since there's no dynamic multi-column APIs yet
const STATIC_SHOP_COLS = [
  {
    heading: "Featured Shops",
    headingTo: "/shops",
    links: [
      { label: "Artisan Crafts", to: "/shops" },
      { label: "Vintage Finds", to: "/shops" },
      { label: "Handmade Jewelry", to: "/shops" },
      { label: "Home Decor", to: "/shops" },
    ]
  },
  {
    heading: "Trending Sellers",
    headingTo: "/shops",
    links: [
      { label: "Fashion Boutiques", to: "/shops" },
      { label: "Digital Art", to: "/shops" },
      { label: "Beauty & Personal Care", to: "/shops" },
    ]
  }
];

const Navbar = () => {
  const { user, token } = useSelector((state) => state.user);
  // Get cart and favorites count from Redux
  const cartCount = useSelector((state) => state.cart.totalQuantity);
  const favoritesCount = useSelector((state) => state.favorites.items.length);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const timeoutRef = useRef(null); // Add this line
  const [navMenuLoading, setNavMenuLoading] = useState(false);
  const [productMegaMenu, setProductMegaMenu] = useState([]);
const [topSellers, setTopSellers] = useState([]);
const [shopMegaMenu, setShopMegaMenu] = useState([]);
const [blogMegaMenu, setBlogMegaMenu] = useState([]);

  // const [productMegaMenu, setProductMegaMenu] = useState([]);
  // const [topSellers, setTopSellers] = useState([]);
  // const [shopMegaMenu, setShopMegaMenu] = useState([]);
  // const [blogMegaMenu, setBlogMegaMenu] = useState([]);
  // const [navMenuLoading, setNavMenuLoading] = useState(true);

  // Add these two functions
  const handleMouseEnter = (menuName) => {
    // If user hovers back in, cancel the closing timer
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveDropdown(menuName);
  };

  const handleMouseLeave = () => {
    // Wait 200 milliseconds before closing
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 200);
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [categories, topSels] = await Promise.all([
          fetchCategories(),
          fetchTopSellers()
        ]);
        if (cancelled) return;
        const productCols = categories.map(buildProductColumn);
        const blogCols = categories.map(buildBlogColumn);
        setProductMegaMenu(productCols);
        setTopSellers(topSels);
        setShopMegaMenu(STATIC_SHOP_COLS);
        setBlogMegaMenu(blogCols);
      } catch {
        if (!cancelled) {
          setProductMegaMenu([]);
          setTopSellers([]);
          setShopMegaMenu(STATIC_SHOP_COLS);
          setBlogMegaMenu([]);
        }
      } finally {
        if (!cancelled) setNavMenuLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Function to handle link clicks and close dropdown
  const handleLinkClick = () => {
    setActiveDropdown(null);
  };

  return (
    <nav className="navbar">
      {/* Mobile top bar */}
      {/* Mobile top bar */}
      <div className="mobile-topbar">
        <Link to="/" className="navbar-logo-link mob-only">
          <img src={logo} alt="Aestheticommerce" className="navbar-logo-img-mob" />
          <h2 className="navbar-logo-text-mob">estheticommerce</h2>
        </Link>
        <div className="mobile-topbar-right">

          {user && token ? (
            <div className="mobile-nav-group-items">


              <Link to="/favorites" className="mobile-profile-icon" aria-label="Favorites">
                <Heart />
                {favoritesCount > 0 && (
                  <span className="badge">{favoritesCount}</span>
                )}
              </Link>

              <Link to="/profile" className="mobile-profile-icon" aria-label="Profile">
                <User />
              </Link>
            </div>
          ) : (
            <Link
              to="/login"
              className="mobile-login_button"
              aria-label="Sign in"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>

      <Link to="/" className="navbar-logo-link desktop-only">
        <img src={logo} alt="Aestheticommerce" className="navbar-logo-img" />
        <h2 className="navbar-logo-text">estheticommerce</h2>
      </Link>

      <div className="make-space">
        <ul className="navbar-links">
          <li>
            <Link to="/">Home</Link>
          </li>
          <li
            className="navbar-dropdown"
            onMouseEnter={() => handleMouseEnter("products")}
            onMouseLeave={handleMouseLeave}
          >
            <div className="nav-link-wrapper">
              <Link to="/products" className="nav-link nav-link-product">
                Products
              </Link>
              {/* <FiChevronDown className="dropdown-arrow" /> */}
              {activeDropdown === "products" && (
                <div className="mega-dropdown">
                  <div className="mega-dropdown-content">
                    <div className="mega-dropdown-categories">
                      {navMenuLoading && (
                        <div className="mega-dropdown-col">
                          <div className="mega-dropdown-heading">Loading…</div>
                        </div>
                      )}
                      {!navMenuLoading && productMegaMenu.length === 0 && (
                        <div className="mega-dropdown-col">
                          <div className="mega-dropdown-heading">No categories yet</div>
                        </div>
                      )}
                      {!navMenuLoading &&
                        productMegaMenu.map((col) => (
                          <div className="mega-dropdown-col" key={col.heading}>
                            <Link
                              to={col.headingTo}
                              className="mega-dropdown-heading-link"
                              onClick={handleLinkClick}
                            >
                              <div className="mega-dropdown-heading">
                                {col.heading}
                              </div>
                            </Link>

                            <ul>
                              {col.links.map((item) => (
                                <li key={`${item.label}-${item.to}`}>
                                  <Link to={item.to} onClick={handleLinkClick}>
                                    {item.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                    </div>
                    <div className="mega-dropdown-top-items">
                      <div className="mega-dropdown-top-heading">
                        Best Sellers
                      </div>
                      {topSellers.length > 0 ? (
                        <div className="mega-dropdown-top-list">
                          {topSellers.map((s, idx) => {
                            const shopUrl = `/shop-products?store=${encodeURIComponent(s.storeName || s.sellerName || "")}`;
                            return (
                              <Link to={shopUrl} key={s.sellerId || idx} className="mega-top-product-card" onClick={handleLinkClick}>
                                <img src={s.img || "https://images.pexels.com/photos/3735644/pexels-photo-3735644.jpeg"} alt={s.storeName} className="mega-top-product-img" />
                                <div className="mega-top-product-info">
                                  <span className="mega-top-product-name">{s.storeName || s.sellerName || "Shop"}</span>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="mega-top-product-empty">
                          No top sellers.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </li>
          <li
            className="navbar-dropdown"
            onMouseEnter={() => handleMouseEnter("shops")}
            onMouseLeave={handleMouseLeave}
          >
            <div className="nav-link-wrapper">
              <Link to="/shops" className="nav-link">
                Shops
              </Link>
              {/* <FiChevronDown className="dropdown-arrow" /> */}
              {activeDropdown === "shops" && (
                <div className="mega-dropdown">
                  <div className="mega-dropdown-content">
                    <div className="mega-dropdown-categories">
                      {navMenuLoading && (
                        <div className="mega-dropdown-col mega-dropdown-col-shop">
                          <div className="mega-dropdown-heading-shop">Loading…</div>
                        </div>
                      )}
                      {!navMenuLoading && shopMegaMenu.length === 0 && (
                        <div className="mega-dropdown-col mega-dropdown-col-shop">
                          <div className="mega-dropdown-heading-shop">No categories yet</div>
                        </div>
                      )}
                      {!navMenuLoading &&
                        shopMegaMenu.map((col) => (
                          <div
                            className="mega-dropdown-col mega-dropdown-col-shop"
                            key={col.heading}
                          >
                            <Link
                              to={col.headingTo}
                              className="mega-dropdown-heading-link"
                              onClick={handleLinkClick}
                            >
                              <div className="mega-dropdown-heading-shop">
                                {col.heading}
                              </div>
                            </Link>
                            <ul>
                              {col.links.map((item) => (
                                <li key={`${item.label}-${item.to}`}>
                                  <Link to={item.to} onClick={handleLinkClick}>
                                    {item.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                    </div>
                    <div className="mega-dropdown-img">
                      <img
                        src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=facearea&w=400&h=250"
                        alt="Crafts"
                      />
                      <div className="mega-dropdown-shop-img-caption">
                        Featured Crafts
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </li>
          <li
            className="navbar-dropdown"
            onMouseEnter={() => handleMouseEnter("blogs")}
            onMouseLeave={handleMouseLeave}
          >
            <div className="nav-link-wrapper">
              <Link to="/blog" className="nav-link">
                Blogs
              </Link>
              {/* <FiChevronDown className="dropdown-arrow" /> */}
              {activeDropdown === "blogs" && (
                <div className="mega-dropdown">
                  <div className="mega-dropdown-content">
                    <div className="mega-dropdown-categories">
                      {navMenuLoading && (
                        <div className="mega-dropdown-col mega-dropdown-col-blog">
                          <div className="mega-dropdown-heading-blog">Loading…</div>
                        </div>
                      )}
                      {!navMenuLoading && blogMegaMenu.length === 0 && (
                        <div className="mega-dropdown-col mega-dropdown-col-blog">
                          <div className="mega-dropdown-heading-blog">No categories yet</div>
                        </div>
                      )}
                      {!navMenuLoading &&
                        blogMegaMenu.map((col) => (
                          <div
                            className="mega-dropdown-col mega-dropdown-col-blog"
                            key={col.heading}
                          >
                            <Link
                              to={col.headingTo}
                              className="mega-dropdown-heading-link"
                              onClick={handleLinkClick}
                            >
                              <div className="mega-dropdown-heading-blog">
                                {col.heading}
                              </div>
                            </Link>
                            <ul>
                              {col.links.map((item) => (
                                <li key={`${item.label}-${item.to}`}>
                                  <Link to={item.to} onClick={handleLinkClick}>
                                    {item.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                    </div>
                    <div className="mega-dropdown-img">
                      <img
                        src="https://images.unsplash.com/photo-1746812625962-24a25f68d633?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                        alt="Blogs"
                      />
                      <Link
                        to="/blog"
                        className="mega-dropdown-blog-caption"
                        onClick={handleLinkClick}
                      >
                        Explore all blogs
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </li>
          <li>
            <Link to="/contact">Contact Us</Link>
          </li>
        </ul>
      </div>

      {user && token ? (
        <div className="navbar-icons">
          <Link to="/favorites" className="nav-icon" aria-label="Favorites">
            <Heart />
            {favoritesCount > 0 && (
              <span className="badge">{favoritesCount}</span>
            )}
          </Link>
          <Link to="/cart" className="nav-icon" aria-label="Cart">
            <ShoppingCart />
            {cartCount > 0 && <span className="badge">{cartCount}</span>}
          </Link>
          <Link to="/profile" className="nav-icon" aria-label="Profile">
            <User />
          </Link>
        </div>
      ) : (
        <Link to="/login" className="login_button">
          Sign in
        </Link>
      )}

      {/* mobile bottom nav */}
      <div className="bottom-nav-spacer" />
      <nav className="mobile-bottom-nav" aria-label="Primary">
        <NavLink
          to="/"
          end
          className={({ isActive }) => `mb-item ${isActive ? "active" : ""}`}
          aria-label="Home"
        >
          <Home size={22} />
          <span>Home</span>
        </NavLink>
        <NavLink
          to="/products"
          className={({ isActive }) => `mb-item ${isActive ? "active" : ""}`}
          aria-label="Products"
        >
          <Grid2X2 size={22} />
          <span>Products</span>
        </NavLink>
        <NavLink
          to="/shops"
          className={({ isActive }) => `mb-item ${isActive ? "active" : ""}`}
          aria-label="Shops"
        >
          <Store size={22} />
          <span>Shops</span>
        </NavLink>
        <NavLink
          to="/blog"
          className={({ isActive }) => `mb-item ${isActive ? "active" : ""}`}
          aria-label="Blogs"
        >
          <BookOpen size={22} />
          <span>Blogs</span>
        </NavLink>
        <NavLink
          to="/cart"
          className={({ isActive }) =>
            `mb-item relative ${isActive ? "active" : ""}`
          }
          aria-label="Cart"
        >
          <ShoppingCart size={22} />
          <span>Cart</span>
          {cartCount > 0 && <span className="mb-badge">{cartCount}</span>}
        </NavLink>
      </nav>
    </nav>
  );
};

export default Navbar;
