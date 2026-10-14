import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ReportsPage.css';
import toast from 'react-hot-toast';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';

const ReportsPage = () => {

  const API = import.meta.env.VITE_API_URL;

  const [stats, setStats] = useState({
    totalProducts: 0,
    approvedProducts: 0,
    pendingProducts: 0,
    rejectedProducts: 0,
    totalSellers: 0,
    activeSellers: 0,
    verifiedSellers: 0,
    unverifiedSellers: 0
  });

  const [products, setProducts] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [categoryStats, setCategoryStats] = useState([]);

  const fetchReportsData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const headers = { Authorization: `Bearer ${token}` };

      const [pendingRes, approvedRes, rejectedRes, sellersRes, categoryRes] = await Promise.all([
        axios.get(`${API}/api/admin/products?status=pending`, { headers }),
        axios.get(`${API}/api/admin/products?status=approved`, { headers }),
        axios.get(`${API}/api/admin/products?status=rejected`, { headers }),
        fetch(`${API}/api/admin/sellers`, {
          headers: { Authorization: `Bearer ${token}` }
        }).then(res => res.json()),
        axios.get(`${API}/api/admin/stats/category-stats`, { headers })

      ]);

      const allProducts = [
        ...(pendingRes.data || []),
        ...(approvedRes.data || []),
        ...(rejectedRes.data || [])
      ];
      const allSellers = Array.isArray(sellersRes) ? sellersRes : [];

      setProducts(allProducts);
      setSellers(allSellers);

      const verifiedCount = allSellers.filter(s => s.verificationStatus === 'verified').length;
      const activeCount = allSellers.filter(seller => {
        const sellerProducts = allProducts.filter(
          p => (p.sellerId?._id === seller._id || p.sellerId === seller._id) && 
               p.approvalStatus === 'approved'
        );
        return sellerProducts.length > 0;
      }).length;

      setStats({
        totalProducts: allProducts.length,
        approvedProducts: approvedRes.data?.length || 0,
        pendingProducts: pendingRes.data?.length || 0,
        rejectedProducts: rejectedRes.data?.length || 0,
        totalSellers: allSellers.length,
        activeSellers: activeCount,
        verifiedSellers: verifiedCount,
        unverifiedSellers: allSellers.length - verifiedCount
      });

      setCategoryStats(categoryRes.data.data || []);
      setLastUpdated(new Date());
      setLoading(false);

    } catch (error) {
      console.error('Failed to fetch reports data:', error);
      toast.error('Failed to fetch reports data');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportsData();
  }, []);

  useEffect(() => {
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchReportsData();
        toast.success('Reports refreshed');
      }, 30000);
    }
    return () => interval && clearInterval(interval);
  }, [autoRefresh]);

  const productStatusData = [
    { name: 'Approved', value: stats.approvedProducts, color: '#28a745' },
    { name: 'Pending', value: stats.pendingProducts, color: '#ffc107' },
    { name: 'Rejected', value: stats.rejectedProducts, color: '#dc3545' }
  ].filter(item => item.value > 0);

  const overviewData = [
    { category: 'Approved Products', count: stats.approvedProducts },
    { category: 'Total Sellers', count: stats.totalSellers },
    { category: 'Active Sellers', count: stats.activeSellers }
  ];

  const sellerStatusData = [
    { name: 'Verified', value: stats.verifiedSellers, color: '#20BFA5' },
    { name: 'Unverified', value: stats.unverifiedSellers, color: '#ffc107' }
  ].filter(item => item.value > 0);

  const topSellers = sellers
    .map(seller => ({
      name: seller.sellerName || 'Unknown',
      products: products.filter(
        p => (p.sellerId?._id === seller._id || p.sellerId === seller._id) && 
             p.approvalStatus === 'approved'
      ).length
    }))
    .filter(s => s.products > 0)
    .sort((a, b) => b.products - a.products)
    .slice(0, 10);

  const productDistribution = [
    { status: 'Approved', count: stats.approvedProducts, color: '#28a745' },
    { status: 'Pending', count: stats.pendingProducts, color: '#ffc107' },
    { status: 'Rejected', count: stats.rejectedProducts, color: '#dc3545' }
  ];

  const productCategoryData = categoryStats.map(item => ({
    name: item.category,
    value: item.count,
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1919'];


  if (loading) return <div className="reports-loading">Loading reports...</div>;

  return (
    <div className="reports-page">
      <div className="reports-header">
        <div className="header-content">
          <div>
            <h1>Reports</h1>
            <p>Real-time overview of platform performance and statistics</p>
          </div>
          <div className="header-controls">
            <button 
              onClick={fetchReportsData} 
              className="refresh-btn"
              title="Refresh data"
            >
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
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>📦</div>
          <div className="stat-content">
            <h3>{stats.totalProducts}</h3>
            <p>Total Products</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)' }}>✅</div>
          <div className="stat-content">
            <h3>{stats.approvedProducts}</h3>
            <p>Approved Products</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #ffc107 0%, #ff9800 100%)' }}>⏳</div>
          <div className="stat-content">
            <h3>{stats.pendingProducts}</h3>
            <p>Pending Products</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)' }}>❌</div>
          <div className="stat-content">
            <h3>{stats.rejectedProducts}</h3>
            <p>Rejected Products</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #17a2b8 0%, #138496 100%)' }}>👥</div>
          <div className="stat-content">
            <h3>{stats.totalSellers}</h3>
            <p>Total Sellers</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #6610f2 0%, #6f42c1 100%)' }}>🚀</div>
          <div className="stat-content">
            <h3>{stats.activeSellers}</h3>
            <p>Active Sellers</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #20BFA5 0%, #1aa891 100%)' }}>✓</div>
          <div className="stat-content">
            <h3>{stats.verifiedSellers}</h3>
            <p>Verified Sellers</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)' }}>⚠️</div>
          <div className="stat-content">
            <h3>{stats.unverifiedSellers}</h3>
            <p>Unverified Sellers</p>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h2>Platform Overview</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={overviewData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#20BFA5" radius={[8, 8, 0, 0]} barSize={50} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h2>Product Status Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={productStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {productStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h2>Seller Verification Status</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sellerStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {sellerStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {topSellers.length > 0 && (
          <div className="chart-card chart-card-wide">
            <h2>Top 10 Sellers by Product Count</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topSellers} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={150} />
                <Tooltip />
                <Legend />
                <Bar dataKey="products" fill="#667eea" radius={[0, 8, 8, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="chart-card">
          <h2>Product Category Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={productCategoryData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end"
                height={60}
                tick={{ fontSize: 12 }}
              />
              <YAxis />
              <Tooltip 
                formatter={(value, name, props) => [value, 'Number of Products']}
                labelFormatter={(label) => `Category: ${label}`}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="value" 
                name="Products"
                stroke="#20BFA5" 
                activeDot={{ r: 8 }} 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h2>Product Status Breakdown</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={productDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={50}>
                {productDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="summary-section">
        <h2>Quick Summary</h2>
        <div className="summary-grid">
          <div className="summary-item">
            <span className="summary-label">Approval Rate:</span>
            <span className="summary-value">
              {stats.totalProducts > 0 
                ? ((stats.approvedProducts / stats.totalProducts) * 100).toFixed(1) 
                : 0}%
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Pending Rate:</span>
            <span className="summary-value">
              {stats.totalProducts > 0 
                ? ((stats.pendingProducts / stats.totalProducts) * 100).toFixed(1) 
                : 0}%
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Rejection Rate:</span>
            <span className="summary-value">
              {stats.totalProducts > 0 
                ? ((stats.rejectedProducts / stats.totalProducts) * 100).toFixed(1) 
                : 0}%
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Verification Rate:</span>
            <span className="summary-value">
              {stats.totalSellers > 0 
                ? ((stats.verifiedSellers / stats.totalSellers) * 100).toFixed(1) 
                : 0}%
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Avg Products/Seller:</span>
            <span className="summary-value">
              {stats.totalSellers > 0 
                ? (stats.totalProducts / stats.totalSellers).toFixed(1) 
                : 0}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Active Seller Rate:</span>
            <span className="summary-value">
              {stats.totalSellers > 0 
                ? ((stats.activeSellers / stats.totalSellers) * 100).toFixed(1) 
                : 0}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;