// src/components/DashboardCard/DashboardCard.jsx
import React from "react";
import "./DashboardCard.css";

const DashboardCard = ({ label, value, trend, subtext, icon, isLoading }) => {
  if (isLoading) {
    return (
      <div className="dashboard-card-box dashboard-card-loading">
        <div className="dashboard-card-skeleton"></div>
      </div>
    );
  }

  return (
    <div className="dashboard-card-box">
      <div className="dashboard-card-icon">{icon}</div>
      <div className="dashboard-card-label">{label}</div>
      <div className="dashboard-card-value">{value}</div>
      <div className="dashboard-card-trend">
        <span className="dashboard-card-trend-up">{trend}</span>
        <span className="dashboard-card-trend-desc">{subtext}</span>
      </div>
    </div>
  );
};

export default DashboardCard;