import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL; // e.g., http://localhost:5000

const register = async (userData) => {
  const res = await axios.post(`${API_URL}/users/register`, userData);
  localStorage.setItem("user", JSON.stringify(res.data));
  return res.data;
};

const login = async (userData) => {
  const res = await axios.post(`${API_URL}/users/login`, userData);
  localStorage.setItem("user", JSON.stringify(res.data));
  return res.data;
};

const forgotPassword = async (email) => {
  const res = await axios.post(`${API_URL}/users/forgot-password`, {email});
  console.log("email in forgot password service:- ", res.data);
  localStorage.setItem("user", JSON.stringify(res.data));
  return res.data;
}

const verifOtp = async (verifyOtpData) =>{
  const res = await axios.post(`${API_URL}/users/verify-otp`,verifyOtpData);
  return res.data;
}

const resetPassword = async (resetPasswordData) =>{
  const res = await axios.post(`${API_URL}/users/reset-password`,resetPasswordData);
  return res.data;
}

const authService = { register, login, forgotPassword, verifOtp,resetPassword };
export default authService;
