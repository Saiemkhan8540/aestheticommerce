// src/pages/Statistics/Statistics.jsx
import React, { useEffect } from "react";
import "./Statistics.css";
import { FaRupeeSign, FaBox, FaShoppingCart, FaUsers } from "react-icons/fa";
import DashboardCard from "../DashboardCards/DashboardCard";
import BarChart from "../Charts/BarChart";
import LineChart from "../Charts/LineChart";
import { useDispatch, useSelector } from "react-redux";
import {
  // fetchOverviewStats,
  fetchSalesGraph,
  resetStats,
} from "../../Redux/statsSlice";
import {
  fetchSellerStats,
  resetOrdersAndStats,
} from "../../Redux/dashboardSlice";

const Statistics = () => {
  const dispatch = useDispatch();

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

  const authState = useSelector((state) => state.auth || {});
  const seller = authState?.seller ?? null;
  const token = authState?.token || localStorage.getItem("sellerToken");

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

  const transformSalesData = (data) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return [
        { day: "Mon", revenue: 0 },
        { day: "Tue", revenue: 0 },
        { day: "Wed", revenue: 0 },
        { day: "Thu", revenue: 0 },
        { day: "Fri", revenue: 0 },
        { day: "Sat", revenue: 0 },
        { day: "Sun", revenue: 0 },
      ];
    }
    return data.map((item) => {
      const date = new Date(item.date);
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const dayName = dayNames[date.getDay()];
      return { day: dayName, revenue: item.totalSales || 0 };
    });
  };

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

  const barChartData = transformSalesData(salesGraph);
  const lineChartData = transformSalesToLineData(salesGraph);

  return (
    <div className="stats-container">
      <div className="stats-page">
        <h1 className="stats-header">Store Statistics Overview</h1>

        {/* Charts Section (Moved to Top) */}
        <div className="charts-wrapper">
          {/* Bar Chart */}
          <div className="bar-chart-section">
            {graphLoading ? (
              <p className="loading-text">Loading sales graph...</p>
            ) : graphError ? (
              <p className="error-text">Error loading graph data: {graphMsg}</p>
            ) : (
              <BarChart
                title="Daily Sales Overview"
                data={barChartData}
                keys={["revenue"]}
                indexBy="day"
              />
            )}
          </div>

          {/* Line Chart */}
          <div className="line-chart-section">
            {graphLoading ? (
              <p className="loading-text">Loading sales trends...</p>
            ) : (
              <LineChart
                data={lineChartData}
                title="Revenue Trend (This Month)"
              />
            )}
          </div>
        </div>

        {/* Cards Section (Moved to Bottom) */}
        <div className="stats-cards">
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
            <div className="stats-error-message">
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
    </div>
  );
};

export default Statistics;
