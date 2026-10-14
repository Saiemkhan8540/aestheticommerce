import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import './AnalyticsPage.css';

const AnalyticsPage = () => {
  const BASE_URL = import.meta.env.VITE_API_URL;

  const [salesData, setSalesData] = useState([]);
  const [userData, setUserData] = useState([]);
  const [weeklyActiveUsers, setWeeklyActiveUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const headers = { Authorization: `Bearer ${token}` };

      const [salesResponse, userResponse, weeklyActiveUsersResponse] = await Promise.all([
        axios.get(`${BASE_URL}/api/admin/analytics/sales`, { headers }),
        axios.get(`${BASE_URL}/api/admin/analytics/users`, { headers }),
        axios.get(`${BASE_URL}/api/admin/analytics/weekly-active-users`, { headers }),
      ]);

      setSalesData(salesResponse.data || []);
      setUserData(userResponse.data || []);
      setWeeklyActiveUsers(weeklyActiveUsersResponse.data || []);

      setLastUpdated(new Date());
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
      toast.error('Failed to fetch analytics data');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  useEffect(() => {
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchAnalyticsData();
        toast.success('Analytics refreshed');
      }, 30000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  if (loading) {
    return <div className="analytics-loading">Loading analytics...</div>;
  }

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <div>
          <h1>Real-Time Analytics</h1>
          <p>Track platform performance and trends over time</p>
        </div>
        <div className="analytics-controls">
          <button onClick={fetchAnalyticsData} className="refresh-btn">
            🔄 Refresh
          </button>
          <label className="auto-refresh-toggle">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            <span>Auto-refresh (30s)</span>
          </label>
          <div className="last-updated">
            Updated: {lastUpdated.toLocaleTimeString()}
          </div>
        </div>
      </div>

      <div className="charts-container">
        <div className="chart-card">
          <h2>Monthly Sales</h2>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, (dataMax) => Math.ceil(dataMax * 1.1)]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="sales" fill="#8884d8" barSize={70} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="charts-grid-half">
          <div className="chart-card">
            <h2>User Registrations (Monthly)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={userData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, (dataMax) => Math.ceil(dataMax * 1.1)]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="users" fill="#82ca9d" barSize={70} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h2>Weekly Active Users</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyActiveUsers}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;