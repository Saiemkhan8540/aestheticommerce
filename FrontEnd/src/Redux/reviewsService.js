import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const getAuthHeader = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export const fetchProductReviews = async (productId) => {
  const res = await axios.get(`${API_URL}/products/${productId}/reviews`);
  return res.data;
};

export const createProductReview = async ({ productId, stars, text, photos }, token) => {
  console.log('Creating review with token:', token ? 'Token exists' : 'No token'); // Debug log
  
  const formData = new FormData();
  formData.append("stars", String(stars));
  formData.append("text", text || "");
  (photos || []).forEach((file) => formData.append("photos", file));

  // Fixed: Don't duplicate Authorization header
  const config = {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    },
  };

  console.log('Request config:', config); // Debug log
  
  try {
    const res = await axios.post(
      `${API_URL}/products/${productId}/reviews`,
      formData,
      config
    );
    return res.data;
  } catch (error) {
    console.error('Review submission error:', error.response?.data || error.message);
    throw error;
  }
};

export const markReviewHelpful = async ({ productId, reviewId }, token) => {
  const res = await axios.post(
    `${API_URL}/products/${productId}/reviews/${reviewId}/helpful`,
    {},
    getAuthHeader(token)
  );
  return res.data;
};

const reviewsService = { fetchProductReviews, createProductReview, markReviewHelpful };
export default reviewsService;