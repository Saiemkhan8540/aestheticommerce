import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const authHeader = (getState) => {
  const token = getState().user.token;
  return { Authorization: `Bearer ${token}` };
};

const cartService = {
  async get(getState) {
    const res = await axios.get(`${API_URL}/users/cart`, { headers: authHeader(getState) });
    return res.data.cart;
  },
  async add(getState, { productId, quantity, price }) {
    const res = await axios.post(`${API_URL}/users/cart`, { productId, quantity, price }, { headers: authHeader(getState) });
    return res.data.cart;
  },
  async update(getState, itemId, quantity) {
    const res = await axios.put(`${API_URL}/users/cart/${itemId}`, { quantity }, { headers: authHeader(getState) });
    return res.data.cart;
  },
  async remove(getState, itemId) {
    const res = await axios.delete(`${API_URL}/users/cart/${itemId}`, { headers: authHeader(getState) });
    return res.data.cart;
  },
  async clear(getState) {
    await axios.delete(`${API_URL}/users/cart`, { headers: authHeader(getState) });
    return [];
  },
};

export default cartService;