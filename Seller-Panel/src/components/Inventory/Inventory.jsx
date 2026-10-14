import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchInventoryManagement } from "../../Redux/statsSlice";
import { Search, Filter, Edit2, Trash2, Plus } from "lucide-react";
import "./Inventory.css";

const InventoryManagement = () => {
  const dispatch = useDispatch();
  const { inventoryManagement, isLoading, isError, message } = useSelector(
    (state) => state.stats
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Fetch data from backend
  useEffect(() => {
    dispatch(fetchInventoryManagement());
  }, [dispatch]);

  const getStatusClass = (status) => {
    switch (status) {
      case "In Stock":
        return "status-in-stock";
      case "Low Stock":
        return "status-low-stock";
      case "Out of Stock":
        return "status-out-stock";
      default:
        return "";
    }
  };

  // Early UI states
  if (isLoading) {
    return (
      <div className="inventory-container">
        <h2>Loading inventory data...</h2>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="inventory-container">
        <h2>Error loading inventory data</h2>
        <p>{message}</p>
      </div>
    );
  }

  if (!inventoryManagement) {
    return (
      <div className="inventory-container">
        <h2>No inventory data available</h2>
      </div>
    );
  }

  // Extract data
  const { alertCards = [], products = [] } = inventoryManagement;

  // Category options
  const categories = ["All Categories", ...new Set(products.map((p) => p.category))];

  // Search & Filter logic
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All Categories" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // ✅ Updated Alert Card (handles ₹ conversion for numeric or string values)
  const AlertCard = ({ title, product, count }) => {
  const formattedCount =
    typeof count === "string"
      ? count.replace(/\$/g, "₹")
      : typeof count === "number"
      ? `₹${count.toLocaleString("en-IN")}`
      : count;
      
    return (
      <div className="inventory-alert-card">
        <h3 className="alert-title">{title}</h3>
        <div className="alert-content">
          {product && <span className="alert-product">{product}</span>}
          <span className="alert-badge">{formattedCount}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="inventory-container">
      {/* Header */}
      <div className="inventory-header">
        <h1 className="inventory-title">Inventory Management</h1>
        <Link to="/addProduct" className="link-no-underline">
          <button className="add-product-btn">
            <Plus size={20} /> Add Product
          </button>
        </Link>
      </div>

      {/* Alert Cards */}
      <div className="alert-cards-grid">
        {alertCards.length > 0 ? (
          alertCards.map((card, idx) => <AlertCard key={idx} {...card} />)
        ) : (
          <p>No alerts available</p>
        )}
      </div>

      {/* Search + Filter */}
      <div className="search-filter-section">
        <div className="search-box">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search Products"
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="dropdown-container">
          <button
            className="filter-btn"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <Filter size={20} /> {selectedCategory}{" "}
            <span className="dropdown-arrow">▼</span>
          </button>
          {dropdownOpen && (
            <ul className="dropdown-list">
              {categories.map((cat, idx) => (
                <li
                  key={idx}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setDropdownOpen(false);
                  }}
                  className={cat === selectedCategory ? "active-category" : ""}
                >
                  {cat}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Product Table */}
      <div className="product-inventory-section">
        <h2 className="section-title">Product Inventory</h2>
        <div className="table-container">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Price</th>
                <th>Status</th>
                <th>Total Sold</th>
                <th>Revenue</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td className="product-name">
                      <div className="product-cell">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="product-thumb"
                          />
                        ) : (
                          <div className="product-thumb placeholder"></div>
                        )}
                        <span>{product.name}</span>
                      </div>
                    </td>
                    <td>{product.category}</td>
                    <td>{product.stock}</td>
                    <td>₹{(Number(product.price) || 0).toFixed(2)}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(product.status)}`}>
                        {product.status}
                      </span>
                    </td>
                    <td>{product.totalSold}</td>
                    <td>₹{(Number(product.revenue) || 0).toFixed(2)}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="action-btn edit-btn">
                          <Edit2 size={18} />
                        </button>
                        <button className="action-btn delete-btn">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="no-data">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InventoryManagement;