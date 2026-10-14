import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import TopBar from "../component/TopBar/TopBar";
import "./AdminLayout.css";

const AdminLayout = ({ children, onLogout }) => {
  const location = useLocation();
  // const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const navItems = [
    { path: "/", label: "Dashboard" },
    { path: "/products", label: "Products" },
    { path: "/sellers", label: "Sellers" },
    { path: "/orders", label: "Orders" },
    { path: "/reports", label: "Reports" },
    { path: "/analytics", label: "Analytics" },
    { path: "/contact-messages", label: "Contact Messages" },
    { path: "/riders", label: "Riders" },
    { path: "/banners", label: "Banners" },
  ];

  return (
    <div className="admin-layout">
      <button
        className={`hamburger-btn ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"}`}
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
      >
        <span
          className={`hamburger-line ${isSidebarOpen ? "open" : ""}`}
        ></span>
        <span
          className={`hamburger-line ${isSidebarOpen ? "open" : ""}`}
        ></span>
        <span
          className={`hamburger-line ${isSidebarOpen ? "open" : ""}`}
        ></span>
      </button>

      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={toggleSidebar}></div>
      )}

      <aside className={`sidebar ${isSidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-logo">Aestheticommerce</h2>
          <p className="sidebar-subtitle">Admin Panel</p>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? "active" : ""}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <main
        className={`main-content ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"}`}
      >
        <TopBar onLogout={onLogout} />
        <div className="content-wrapper">{children}</div>
      </main>
    </div>
  );
};

export default AdminLayout;
