import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import Sidebar from "../Sidebar/Sidebar";
import Footer from "../Footer/Footer";
import "./Layout.css";

const DashboardLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="dashboard-layout">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <Navbar /> {/* Fixed navbar at top */}
      <div className={`dashboard-content ${collapsed ? "collapsed" : ""}`}>
        <div className="dashboard-main">
          {children || <Outlet />}
        </div>
        <Footer collapsed={collapsed} />
      </div>
    </div>
  );
};

export default DashboardLayout;