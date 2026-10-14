import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

// Axios config helper
const getConfig = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

// 📊 Overview stats
export const getOverviewStats = async (filter = "month", token) => {
  const res = await axios.get(`${BASE_URL}/api/stats/overview?filter=${filter}`, getConfig(token));
  return res.data.data;
};

// 📈 Sales graph stats
export const getSalesGraph = async (filter = "month", token) => {
  const res = await axios.get(`${BASE_URL}/api/stats/sales-graph?filter=${filter}`, getConfig(token));
  return res.data.data;
};

// 📦 Order status distribution
export const getOrderStatusStats = async (filter = "month", token) => {
  const res = await axios.get(`${BASE_URL}/api/stats/order-status?filter=${filter}`, getConfig(token));
  return res.data.data;
};

// 🗂️ Category-wise stats
export const getCategoryStats = async (filter = "month", token) => {
  const res = await axios.get(`${BASE_URL}/api/stats/category-stats?filter=${filter}`, getConfig(token));
  return res.data.data;
};

// 🏬 Inventory metrics
export const getInventoryStats = async (token) => {
  const res = await axios.get(`${BASE_URL}/api/stats/inventory`, getConfig(token));
  return res.data.data;
};

// ✅ Inventory management data
export const getInventoryManagementData = async (token) => {
  const res = await axios.get(`${BASE_URL}/api/stats/inventory-management`, getConfig(token));
  return res.data.data;
};

const statsService = {
  getOverviewStats,
  getSalesGraph,
  getOrderStatusStats,
  getCategoryStats,
  getInventoryStats,
  getInventoryManagementData,
};

export default statsService;
