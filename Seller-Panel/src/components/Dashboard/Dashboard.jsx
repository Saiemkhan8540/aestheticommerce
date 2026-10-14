import React, { useEffect } from "react";
import { FaRupeeSign, FaBox, FaShoppingCart, FaUsers } from "react-icons/fa";
import "./Dashboard.css";
import EnchancedTable from "../ProductTable/ProductTable";
// import OrderTable from "../OrderTable/OrderTable";
import BarChart from "../Charts/BarChart";
import DashboardCard from "../DashboardCards/DashboardCard";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchSellerStats,
  resetOrdersAndStats,
} from "../../Redux/dashboardSlice";
import {
  // fetchOverviewStats,
  fetchSalesGraph,
  resetStats,
} from "../../Redux/statsSlice";
import LineChart from "../Charts/LineChart";
import OrderTable from "../OrderTable/OrderTable";

function Dashboard() {
  const dispatch = useDispatch();

  // Redux states
  const {
    stats: dashboardStats,
    isLoading: dashboardLoading,
    isError: dashboardError,
    message: dashboardMsg,
  } = useSelector((state) => state.dashboard);

  const {
    salesGraph,
    isLoading: graphLoading,
    isError: graphError,
    message: graphMsg,
  } = useSelector((state) => state.stats);

  // Auth (Redux-only)
  const authState = useSelector((state) => state.auth);
  const seller = authState?.seller ?? null;
  const token = authState?.token ?? null;

  // 🟢 Fetch Stats
  useEffect(() => {
    const id = seller?._id || seller?.sellerId || seller?.id;
    if (!id || !token) {
      dispatch(resetOrdersAndStats());
      dispatch(resetStats());
      return;
    }

    dispatch(fetchSellerStats({ sellerId: id, token }));
    dispatch(fetchSalesGraph("month"));

    return () => {
      dispatch(resetOrdersAndStats());
      dispatch(resetStats());
    };
  }, [dispatch, seller, token]);

  // If no seller
  if (!seller) {
    return (
      <div className="dashboard-background">
        <div className="dashboard-overview-content">
          <div className="dashboard-welcome-box">
            <div className="dashboard-welcome-text">
              <h1>Welcome, Seller</h1>
              <p>Please log in to view your dashboard statistics.</p>
              <Link to="/login">
                <button className="dashboard-add-btn">Go to Login</button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 🧮 Dashboard Cards Config
  const cardsConfig = [
    {
      label: "Total Revenue",
      valueKey: "totalRevenue",
      prefix: "₹",
      icon: <FaRupeeSign />,
    },
    {
      label: "Total Orders",
      valueKey: "totalOrders",
      prefix: "",
      icon: <FaShoppingCart />,
    },
    {
      label: "Total Products",
      valueKey: "totalProducts",
      prefix: "",
      icon: <FaBox />,
    },
    {
      label: "Total Customers",
      valueKey: "totalCustomers",
      prefix: "",
      icon: <FaUsers />,
    },
  ];

  // 🧾 Transform Data for Charts
  const transformSalesData = (data) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return [
        { day: "Mon", revenue: 0, profit: 0, loss: 0 },
        { day: "Tue", revenue: 0, profit: 0, loss: 0 },
        { day: "Wed", revenue: 0, profit: 0, loss: 0 },
        { day: "Thu", revenue: 0, profit: 0, loss: 0 },
        { day: "Fri", revenue: 0, profit: 0, loss: 0 },
        { day: "Sat", revenue: 0, profit: 0, loss: 0 },
        { day: "Sun", revenue: 0, profit: 0, loss: 0 },
      ];
    }

    return data.map((item) => {
      const date = new Date(item.date);
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const dayName = dayNames[date.getDay()];
      return {
        day: dayName,
        revenue: item.totalSales || 0,
        profit: 0,
        loss: 0,
      };
    });
  };

  // 🟣 Transform Data for Line Chart
  const transformSalesToLineData = (data) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return [
        {
          id: "Revenue",
          color: "#16A34A",
          data: [
            { x: "Mon", y: 0 },
            { x: "Tue", y: 0 },
            { x: "Wed", y: 0 },
          ],
        },
      ];
    }

    const formattedData = data.map((item) => {
      const date = new Date(item.date);
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const dayName = dayNames[date.getDay()];
      return { x: dayName, y: item.totalSales || 0 };
    });

    return [
      {
        id: "Revenue",
        color: "#16A34A",
        data: formattedData,
      },
    ];
  };

  // Prepare chart data
  const barChartData = transformSalesData(salesGraph);
  const lineChartData = transformSalesToLineData(salesGraph);

  return (
    <div className="dashboard-background">
      <div className="dashboard-overview-content">
        {/* Welcome Box */}
        <div className="dashboard-welcome-box">
          <div className="dashboard-welcome-text">
            <h1>Welcome, {seller?.sellerName || "Seller"}</h1>
            <p>
              Here's what's happening in your store today. See the statistics at
              once.
            </p>
            <Link to="/addProduct">
              <button className="dashboard-add-btn">
                <span className="add-icon">＋</span> Add Product
              </button>
            </Link>
          </div>
          <div className="dashboard-welcome-image">
            <img
              src="https://cdni.iconscout.com/illustration/premium/thumb/mobile-shop-6772181-5619359.png"
              alt="Dashboard Illustration"
            />
          </div>
        </div>

        {/* Cards */}
        <div className="dashboard-cards-row">
          {dashboardLoading ? (
            cardsConfig.map((config) => (
              <DashboardCard
                key={config.label}
                label={config.label}
                value="..."
                icon={config.icon}
                isLoading
              />
            ))
          ) : dashboardError ? (
            <div className="dashboard-error-message">
              <p>Error loading stats: {dashboardMsg}</p>
            </div>
          ) : (
            cardsConfig.map((config) => {
              const value = dashboardStats?.[config.valueKey] ?? 0;
              const displayValue = `${config.prefix}${value}`;
              return (
                <DashboardCard
                  key={config.label}
                  label={config.label}
                  value={displayValue}
                  trend="+0%"
                  subtext="from last month"
                  icon={config.icon}
                />
              );
            })
          )}
        </div>
      </div>

      {/* Tables */}
      <div className="dashboard-table-section">
        <EnchancedTable />
      </div>
      <div className="dashboard-table-section">
        <OrderTable />
      </div>

      {/* Charts */}
      <div className="dashboard-charts-section">
        <h2>Sales Performance</h2>

        {/* Bar Chart */}
        <div className="dashboard-chart-barchart">
          {graphLoading ? (
            <div
              style={{ textAlign: "center", padding: "40px", color: "#888" }}
            >
              <p>Loading sales graph...</p>
            </div>
          ) : graphError ? (
            <div
              style={{ textAlign: "center", padding: "40px", color: "#e95a5a" }}
            >
              <p>Error loading graph data: {graphMsg}</p>
            </div>
          ) : (
            <BarChart
              title="Daily Sales Overview"
              data={barChartData}
              keys={["revenue"]}
              indexBy="day"
            />
          )}
        </div>

        {/* Line Chart (now dynamic from Redux) */}
        <div
          className="dashboard-chart-linechart"
          style={{ marginTop: "40px" }}
        >
          {graphLoading ? (
            <div
              style={{ textAlign: "center", padding: "40px", color: "#888" }}
            >
              <p>Loading sales trends...</p>
            </div>
          ) : (
            <LineChart
              data={lineChartData}
              title="Revenue Trend (This Month)"
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
