import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const authHeader = (getState) => {
  const token = getState().user.token;
  return { Authorization: `Bearer ${token}` };
};

const addressService = {
  async getAll(getState) {
    const res = await axios.get(`${API_URL}/api/addresses`, {
      headers: authHeader(getState),
    });
    return res.data.data;
  },
  async create(getState, payload) {
    const res = await axios.post(`${API_URL}/api/addresses`, payload, {
      headers: authHeader(getState),
    });
    return res.data.data;
  },
  async update(getState, addressId, payload) {
    const res = await axios.put(`${API_URL}/api/addresses/${addressId}`, payload, {
      headers: authHeader(getState),
    });
    return res.data.data;
  },
  async remove(getState, addressId) {
    await axios.delete(`${API_URL}/api/addresses/${addressId}`, {
      headers: authHeader(getState),
    });
    return addressId;
  },
  async setDefault(getState, addressId) {
    const res = await axios.patch(`${API_URL}/api/addresses/${addressId}/default`, {}, {
      headers: authHeader(getState),
    });
    return res.data.data;
  },
};

export default addressService;