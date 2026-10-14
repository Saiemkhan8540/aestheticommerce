import React, { useState, useRef, useEffect } from 'react';
import { Users, Heart, Star, MessageCircle, Calendar, DollarSign } from 'lucide-react';
import { FaChevronDown } from "react-icons/fa";
import './CustomerInsight.css';

export default function CustomerInsights() {
  const dropdownRef = useRef();
  const [timeFilter, setTimeFilter] = useState("today");
  const [openDropdown, setOpenDropdown] = useState(false);

  const timeOptions = [
    { label: "Today", value: "today" },
    { label: "This Week", value: "week" },
    { label: "This Month", value: "month" },
    { label: "This Year", value: "year" },
  ];

  /* ================= Metrics Data ================= */
  const metrics = {
    today: [
      { title: "Total Customers", value: "120", change: "+5%", icon: <Users size={36} />, color: "green" },
      { title: "Customer Rating", value: "4.7", change: "+0.1", icon: <Star size={36} />, color: "purple" },
      { title: "Total Reviews", value: "45", change: "Based on 30 orders", icon: <Heart size={36} />, color: "orange" },
      { title: "Avg. Order Value", value: "$42.50", change: "+3%", icon: <DollarSign size={36} />, color: "blue" },
    ],
    week: [
      { title: "Total Customers", value: "580", change: "+12%", icon: <Users size={36} />, color: "green" },
      { title: "Customer Rating", value: "4.8", change: "+0.2", icon: <Star size={36} />, color: "purple" },
      { title: "Total Reviews", value: "320", change: "Based on 290 orders", icon: <Heart size={36} />, color: "orange" },
      { title: "Avg. Order Value", value: "$78.20", change: "+6%", icon: <DollarSign size={36} />, color: "blue" },
    ],
    month: [
      { title: "Total Customers", value: "3,553", change: "+12% this month", icon: <Users size={36} />, color: "green" },
      { title: "Customer Rating", value: "4.8", change: "+0.2 from last month", icon: <Star size={36} />, color: "purple" },
      { title: "Total Reviews", value: "1,234", change: "Based on 1,000 orders", icon: <Heart size={36} />, color: "orange" },
      { title: "Avg. Order Value", value: "$87.50", change: "+8.2% increase", icon: <DollarSign size={36} />, color: "blue" },
    ],
    year: [
      { title: "Total Customers", value: "42,300", change: "+15% this year", icon: <Users size={36} />, color: "green" },
      { title: "Customer Rating", value: "4.85", change: "+0.3 from last year", icon: <Star size={36} />, color: "purple" },
      { title: "Total Reviews", value: "15,500", change: "Based on 12,000 orders", icon: <Heart size={36} />, color: "orange" },
      { title: "Avg. Order Value", value: "$92.00", change: "+10% increase", icon: <DollarSign size={36} />, color: "blue" },
    ],
  };

  /* ================= Pie Chart Data ================= */
  const pieData = {
    today: [
      { label: "New Customers", value: 70, color: "#228B22" },
      { label: "Loyal Customers", value: 40, color: "#20BFA5" },
      { label: "Inactive Customers", value: 10, color: "#013220" },
    ],
    week: [
      { label: "New Customers", value: 320, color: "#228B22" },
      { label: "Loyal Customers", value: 200, color: "#20BFA5" },
      { label: "Inactive Customers", value: 60, color: "#013220" },
    ],
    month: [
      { label: "New Customers", value: 1245, color: "#228B22" },
      { label: "Loyal Customers", value: 1598, color: "#20BFA5" },
      { label: "Inactive Customers", value: 710, color: "#013220" },
    ],
    year: [
      { label: "New Customers", value: 15200, color: "#228B22" },
      { label: "Loyal Customers", value: 21000, color: "#20BFA5" },
      { label: "Inactive Customers", value: 6100, color: "#013220" },
    ],
  };

  /* ================= Bar Chart Data ================= */
  const chartData = {
    today: [{ month: 'TODAY', new: 70, repeat: 40 }],
    week: [
      { month: 'MON', new: 50, repeat: 30 },
      { month: 'TUE', new: 80, repeat: 50 },
      { month: 'WED', new: 60, repeat: 35 },
      { month: 'THU', new: 90, repeat: 55 },
      { month: 'FRI', new: 70, repeat: 45 },
      { month: 'SAT', new: 85, repeat: 60 },
      { month: 'SUN', new: 60, repeat: 35 },
    ],
    month: [
      { month: 'JAN', new: 110, repeat: 60 },
      { month: 'FEB', new: 70, repeat: 75 },
      { month: 'MAR', new: 155, repeat: 85 },
      { month: 'APR', new: 190, repeat: 90 },
      { month: 'MAY', new: 220, repeat: 100 },
      { month: 'JUN', new: 290, repeat: 120 },
    ],
    year: [
      { month: 'Q1', new: 450, repeat: 320 },
      { month: 'Q2', new: 600, repeat: 400 },
      { month: 'Q3', new: 780, repeat: 520 },
      { month: 'Q4', new: 900, repeat: 650 },
    ],
  };
  const maxValue = Math.max(...chartData[timeFilter].flatMap(d => [d.new, d.repeat])) || 1;

  /* ================= Support Tickets ================= */
  const tickets = {
    today: [
      { id: 'TIC-101', customer: 'John Smith', subject: 'Return Request', status: 'Open', date: '2025-10-09', lastReply: '2 hours ago' },
      { id: 'TIC-102', customer: 'Anna Wilson', subject: 'Payment Issue', status: 'In Progress', date: '2025-10-09', lastReply: '1 hour ago' },
    ],
    week: [
      { id: 'TIC-103', customer: 'Mark Davis', subject: 'Shipping Delay', status: 'Resolved', date: '2025-10-07', lastReply: '3 days ago' },
      { id: 'TIC-104', customer: 'Lucy Gray', subject: 'Refund Query', status: 'Open', date: '2025-10-06', lastReply: '2 days ago' },
    ],
    month: [
      { id: 'TIC-105', customer: 'Peter Pan', subject: 'Product Inquiry', status: 'Resolved', date: '2025-09-28', lastReply: '5 days ago' },
      { id: 'TIC-106', customer: 'Mary Jane', subject: 'Wrong Item', status: 'In Progress', date: '2025-09-25', lastReply: '1 week ago' },
    ],
    year: [
      { id: 'TIC-107', customer: 'Bruce Wayne', subject: 'Bulk Order', status: 'Resolved', date: '2025-05-12', lastReply: '5 months ago' },
      { id: 'TIC-108', customer: 'Clark Kent', subject: 'Account Issue', status: 'Open', date: '2025-03-19', lastReply: '7 months ago' },
    ],
  };

  const pieArray = pieData[timeFilter];
  const totalCustomers = pieArray.reduce((s, d) => s + d.value, 0);

  /* ================= Close dropdown on outside click ================= */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="dashboard">

      {/* Header */}
      <div className="header-container">
        <h1>Customer Insights</h1>
        <div className="time-dropdown-container" ref={dropdownRef}>
          <div className="time-filter" onClick={() => setOpenDropdown(!openDropdown)}>
            {timeOptions.find((t) => t.value === timeFilter).label}
            <FaChevronDown style={{ marginLeft: "8px" }} />
          </div>
          {openDropdown && (
            <ul className="dropdown-list">
              {timeOptions.map((option) => (
                <li
                  key={option.value}
                  className={option.value === timeFilter ? "active" : ""}
                  onClick={() => {
                    setTimeFilter(option.value);
                    setOpenDropdown(false);
                  }}
                >
                  {option.label}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="metrics-grid">
        {metrics[timeFilter].map((stat, idx) => (
          <div className={`metric-card ${stat.color}`} key={idx}>
            <div className="metric-content">
              <div className="metric-info">
                <div className="metric-title">{stat.title}</div>
                <div className="metric-value">{stat.value}</div>
                <div className="metric-change">{stat.change}</div>
              </div>
              <div className="metric-icon">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="charts-grid">
        {/* Pie Chart */}
        <div className="chart-card">
          <h2 className="chart-title">Customer Segmentation</h2>
          <div className="segmentation-content">
            <div className="pie-chart">
              <svg viewBox="0 0 200 200" className="pie-svg">
                {pieArray.reduce((acc, cur, idx) => {
                  const total = totalCustomers;
                  const prev = pieArray.slice(0, idx).reduce((s, d) => s + d.value, 0);
                  const start = (prev / total) * 360;
                  const end = ((prev + cur.value) / total) * 360;
                  const largeArc = end - start > 180 ? 1 : 0;
                  const x1 = 100 + 80 * Math.cos((Math.PI / 180) * start);
                  const y1 = 100 + 80 * Math.sin((Math.PI / 180) * start);
                  const x2 = 100 + 80 * Math.cos((Math.PI / 180) * end);
                  const y2 = 100 + 80 * Math.sin((Math.PI / 180) * end);
                  acc.push(
                    <path
                      key={idx}
                      d={`M100,100 L${x1},${y1} A80,80 0 ${largeArc},1 ${x2},${y2} Z`}
                      fill={cur.color}
                    />
                  );
                  return acc;
                }, [])}
              </svg>
            </div>
            <div className="legend">
              {pieArray.map((d, idx) => (
                <div className="legend-item" key={idx}>
                  <div className="legend-dot" style={{background: d.color}}></div>
                  <div>
                    <div className="legend-label">{d.label}</div>
                    <div className="legend-value">{d.value} customers ({Math.round((d.value/totalCustomers)*100)}%)</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="chart-card">
          <h2 className="chart-title">Purchase Frequency & Value</h2>
          <div className="bar-chart-wrapper">
            <div className="y-axis">
              {Array.from({ length: 6 }).map((_, idx) => {
                const value = Math.round(maxValue - (maxValue / 5) * idx);
                return <div key={idx} className="y-tick">{value}</div>;
              })}
            </div>
            <div className="chart-area">
              {chartData[timeFilter].map((data, idx) => (
                <div key={idx} className="bar-group">
                  <div className="bars">
                    <div
                      className="bar new"
                      style={{ height: `${(data.new / maxValue) * 180}px` }}
                      title={`New: ${data.new}`}
                    ></div>
                    <div
                      className="bar repeat"
                      style={{ height: `${(data.repeat / maxValue) * 180}px` }}
                      title={`Repeat: ${data.repeat}`}
                    ></div>
                  </div>
                  <div className="bar-label">{data.month}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="chart-legend">
            <div className="chart-legend-item">
              <div className="chart-legend-dot new"></div> New
            </div>
            <div className="chart-legend-item">
              <div className="chart-legend-dot repeat"></div> Repeat
            </div>
          </div>
        </div>
      </div>

      {/* Support Tickets Table */}
      <div className="support-card">
        <h2 className="support-title">Customer Support Tickets</h2>
        <div className="table-container">
          <table className="support-table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Customer</th>
                <th>Subject</th>
                <th>Status</th>
                <th>Date</th>
                <th>Last Reply</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tickets[timeFilter].map(ticket => (
                <tr key={ticket.id}>
                  <td>{ticket.id}</td>
                  <td>{ticket.customer}</td>
                  <td>{ticket.subject}</td>
                  <td>
                    <span className={`status-badge ${ticket.status.toLowerCase().replace(' ', '-')}`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td>{ticket.date}</td>
                  <td>{ticket.lastReply}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn"><MessageCircle size={18} /></button>
                      <button className="action-btn"><Calendar size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}