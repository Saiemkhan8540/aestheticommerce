import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const authHeader = (getState) => {
  const token = getState().user.token;
  return { Authorization: `Bearer ${token}` };
};

const favoritesService = {
  async getAll(getState) {
    const res = await axios.get(`${API_URL}/users/favorites`, {
      headers: authHeader(getState),
    });
    return res.data.favorites;
  },
  async add(getState, productId) {
    const res = await axios.post(`${API_URL}/users/favorites`, { productId }, {
      headers: authHeader(getState),
    });
    return res.data.favorites;
  },
  async remove(getState, productId) {
    const res = await axios.delete(`${API_URL}/users/favorites/${productId}`, {
      headers: authHeader(getState),
    });
    return res.data.favorites;
  },
};

export default favoritesService;