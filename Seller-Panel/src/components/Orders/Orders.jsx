import React, { useState, useRef, useEffect } from "react";
import "./Orders.css";
import OrderTable from "../OrderTable/OrderTable";
import {
  FaBox,
  FaCheckCircle,
  FaClock,
  FaShippingFast,
  FaChevronDown,
} from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrderStatusStats } from "../../Redux/statsSlice";
import { fetchSellerOrders } from "../../Redux/dashboardSlice";

const Orders = () => {
  const [timeFilter, setTimeFilter] = useState("month");
  const [activeTab, setActiveTab] = useState("orders");
  const [openDropdown, setOpenDropdown] = useState(null);

  const dispatch = useDispatch();

  // 🟢 Get order status stats from stats slice
  const {
    orderStatus,
    isLoading: statsLoading,
    isError: statsError,
    message: statsMessage,
  } = useSelector((state) => state.stats);

  // 🟣 Get total orders from dashboard slice
  const {
    orders,
    isLoading: ordersLoading,
    isError: ordersError,
  } = useSelector((state) => state.dashboard);

  // Seller identity comes from Redux auth slice; token is persisted via localStorage in authSlice
  const authState = useSelector((state) => state.auth || {});
  const token = authState?.token ?? localStorage.getItem("sellerToken");
  const seller = authState?.seller ?? null;
  const sellerId =
    seller?._id ||
    seller?.sellerId ||
    seller?.id ||
    null;

  // 🧭 Log Redux slice data for debugging
  useEffect(() => {
    console.log("🔍 [Orders.jsx] Current Redux Stats Slice:", {
      orderStatus,
      statsLoading,
      statsError,
      statsMessage,
    });
  }, [orderStatus, statsLoading, statsError, statsMessage]);

  // 🔹 Fetch orders and stats when component mounts or filter changes
  useEffect(() => {
    if (sellerId && token) {
      console.log("🚀 Fetching seller orders and order status stats...", {
        sellerId,
        timeFilter,
      });

      // Fetch total orders from dashboard
      dispatch(fetchSellerOrders({ sellerId, token }));

      // Fetch order status distribution from stats
      if (activeTab === "orders") {
        dispatch(fetchOrderStatusStats(timeFilter));
      }
    } else {
      console.warn("⚠️ Missing sellerId or token, skipping fetch");
    }
  }, [dispatch, timeFilter, activeTab, sellerId, token]);

  // 🔹 Dropdown setup
  const timeOptions = [
    { label: "Today", value: "today" },
    { label: "This Week", value: "week" },
    { label: "This Month", value: "month" },
    { label: "This Year", value: "year" },
  ];

  const dropdownRefs = {
    time: useRef(),
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRefs.time.current &&
        !dropdownRefs.time.current.contains(event.target)
      ) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Render order stats cards with actual values from orders
  const renderStatsCards = () => {
    const isLoading = statsLoading || ordersLoading;
    const isError = statsError || ordersError;

    if (isLoading) {
      return (
        <div className="order-stats-cards">
          <div className="loading-placeholder">Loading order statistics...</div>
        </div>
      );
    }

    if (isError) {
      return (
        <div className="order-stats-cards">
          <p style={{ color: "red" }}>
            Error: {statsMessage || "Failed to load stats"}
          </p>
        </div>
      );
    }

    // 🧩 Calculate actual stats from orders array
    // Total items count (each product in an order is counted separately)
    let totalOrderItems = 0;
    let delivered = 0;
    let dispatched = 0;
    let shipped = 0;
    let outForDelivery = 0;
    let cancelled = 0;

    console.group("📊 Order Status Calculation from Orders Array");
    console.log("Total orders (groups):", orders?.length || 0);

    // Iterate through each order and count items by status
    // This matches the data structure used in OrderTable.jsx
    if (Array.isArray(orders)) {
      orders.forEach((order) => {
        // Backend returns sellerProducts, not products
        const products = order.sellerProducts || order.products || [];

        products.forEach((item) => {
          totalOrderItems++;

          // Normalize status to lowercase for comparison
          const status = (item.status || "").toLowerCase();

          if (status === "delivered") {
            delivered++;
          } else if (status === "dispatched") {
            dispatched++;
          } else if (status === "shipped") {
            shipped++;
          } else if (status === "out for delivery") {
            outForDelivery++;
          } else if (status === "cancelled") {
            cancelled++;
          }
        });
      });
    }

    console.log("📈 Calculated Stats:", {
      totalOrderItems,
      delivered,
      dispatched,
      shipped,
      outForDelivery,
      cancelled,
    });
    console.groupEnd();

    const cards = [
      {
        title: "Total Orders",
        value: totalOrderItems,
        icon: <FaBox />,
        color: "#20BFA5",
      },
      {
        title: "Dispatched Orders",
        value: dispatched,
        icon: <FaClock />,
        color: "#3B82F6",
      },
      {
        title: "Shipped Orders",
        value: shipped,
        icon: <FaShippingFast />,
        color: "#8B5CF6",
      },
      {
        title: "Delivered Orders",
        value: delivered,
        icon: <FaCheckCircle />,
        color: "#10B981",
      },
    ];

    return (
      <div className="order-stats-cards">
        {cards.map((stat, i) => (
          <div className="order-stat-card" key={i}>
            <div className="stat-info">
              <p>{stat.title}</p>
              <h2 className="stat-value">{stat.value.toLocaleString()}</h2>
            </div>
            <div className="stat-icon">{stat.icon}</div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="orders-page">
      <div>
        {/* Header + Time Dropdown */}
        <div className="orders-header-section">
          <h1 className="orders-header">
            {activeTab === "orders" ? "Orders Overview" : "Returns & Refunds"}
          </h1>

          <div className="dropdown-container" ref={dropdownRefs.time}>
            <div
              className="time-filter"
              onClick={() =>
                setOpenDropdown(openDropdown === "time" ? null : "time")
              }
            >
              {timeOptions.find((t) => t.value === timeFilter)?.label}
              <FaChevronDown style={{ marginLeft: "8px" }} />
            </div>
            {openDropdown === "time" && (
              <ul className="dropdown-list">
                {timeOptions.map((option) => (
                  <li
                    key={option.value}
                    className={
                      option.value === timeFilter ? "active-category" : ""
                    }
                    onClick={() => {
                      setTimeFilter(option.value);
                      setOpenDropdown(null);
                    }}
                  >
                    {option.label}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* ✅ Stats Cards */}
        {activeTab === "orders" && renderStatsCards()}

        {/* Tabs */}
        <div className="orders-filter-section">
          <div className="orders-tabs">
            <button
              className={`tab ${activeTab === "orders" ? "active" : ""}`}
              onClick={() => setActiveTab("orders")}
            >
              Orders
            </button>
            <button
              className={`tab ${activeTab === "refunds" ? "active" : ""}`}
              onClick={() => setActiveTab("refunds")}
            >
              Returns & Refunds
            </button>
          </div>
        </div>

        {/* Conditional Content */}
        <div className="table-wrap">
          {activeTab === "orders" ? (
            <OrderTable timeFilter={timeFilter} />
          ) : (
            <div className="development-message">
              <div
                style={{
                  textAlign: "center",
                  padding: "60px 20px",
                  color: "#6b7280",
                  fontSize: "18px",
                }}
              >
                <FaClock
                  style={{
                    fontSize: "48px",
                    marginBottom: "16px",
                    color: "#9ca3af",
                  }}
                />
                <h3 style={{ marginBottom: "8px", color: "#374151" }}>
                  Still in Development
                </h3>
                <p>Returns & Refunds feature is coming soon!</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;
