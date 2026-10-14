import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

// Get seller profile
const getSellerProfile = async (token) => {
  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };

  const response = await axios.get(`${BASE_URL}/api/seller/profile`, config);

  if (response.data.success) {
    return response.data.seller;
  } else {
    throw new Error(response.data.message || "Failed to fetch profile");
  }
};

// Update seller profile
const updateSellerProfile = async (profileData, token) => {
  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };

  // If FormData, axios will set Content-Type with boundary automatically
  const response = await axios.put(
    `${BASE_URL}/api/seller/profile`,
    profileData,
    config
  );

  if (response.data.success) {
    return response.data.seller;
  } else {
    throw new Error(response.data.message || "Failed to update profile");
  }
};

const sellerService = {
  getSellerProfile,
  updateSellerProfile,
};

export default sellerService;