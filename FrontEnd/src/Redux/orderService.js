import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const authHeader = (getState) => {
  const token = getState().user.token;
  return { Authorization: `Bearer ${token}` };
};

const orderService = {
  async listMy(getState) {
    const res = await axios.get(`${API_URL}/api/orders/my-orders`, { headers: authHeader(getState) });
    return res.data;
  },
  async getById(getState, orderId) {
    const res = await axios.get(`${API_URL}/api/orders/${orderId}`, { headers: authHeader(getState) });
    return res.data;
  },
  async create(getState, payload) {
    const res = await axios.post(`${API_URL}/api/orders`, payload, { headers: authHeader(getState) });
    return res.data;
  },
  async createRazorpayOrder(getState, payload) {
    const res = await axios.post(
      `${API_URL}/api/payment/create-order`,
      payload,
      { headers: authHeader(getState) }
    );
    return res.data;
  },

  async verifyRazorpayPayment(getState, payload) {
    console.log("verifyRazorpayPaymentSrivec:- ",getState,payload);
    const res = await axios.post(
      `${API_URL}/api/payment/verify`,
      payload,
      { headers: authHeader(getState) }
    );
    return res.data;
  },

  async cancelOrder(getState, orderId, cancelReason) {
    const res = await axios.patch(`${API_URL}/api/orders/${orderId}/cancel`, { cancelReason }, { headers: authHeader(getState) });
    return res.data;
  },
  async cancelPendingRazorpayOrder(getState, razorpayOrderId) {
    const res = await axios.delete(`${API_URL}/api/payment/cancel-pending/${razorpayOrderId}`, { headers: authHeader(getState) });
    return res.data;
  },
  async submitRating(getState, orderId, ratingData) {
    const formData = new FormData();
    formData.append('stars', ratingData.stars);
    if (ratingData.text) formData.append('text', ratingData.text);
    if (Array.isArray(ratingData.photos)) {
      ratingData.photos.forEach((file) => formData.append('photos', file));
    }
    const res = await axios.post(`${API_URL}/api/orders/${orderId}/rating`, formData, { headers: authHeader(getState) });
    return res.data;
  },
};

export default orderService;