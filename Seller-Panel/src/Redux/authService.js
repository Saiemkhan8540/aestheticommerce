import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

// REGISTER SELLER
const registerSeller = async (sellerData) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/seller/register`, sellerData);

    if (response.data.success && response.data.token) {
      localStorage.setItem("sellerToken", response.data.token);
    }

    return response.data;
  } catch (error) {
    console.error("Registration error:", error);
    const message =
      error.response?.data?.message || error.message || "Registration failed";
    throw new Error(message);
  }
};

// LOGIN SELLER
const loginSeller = async (loginData) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/seller/login`, loginData);

    if (response.data.success && response.data.token) {
      localStorage.setItem("sellerToken", response.data.token);
    }

    return response.data;
  } catch (error) {
    console.error("Login error:", error);
    const message =
      error.response?.data?.message || error.message || "Login failed";
    throw new Error(message);
  }
};

const forgotPasswordSeller = async (email)=>{
  try{
    const response = await axios.post(`${BASE_URL}/api/seller/forgot-password`, {email});
    return response.data;
  } catch(error){
    throw error;
  }
}

const verifOtp = async (verifyOtpData) =>{
  try{
    const response = await axios.post(`${BASE_URL}/api/seller/verify-password-otp`, verifyOtpData);
    return response.data;
  }catch(error){
    throw error;
  }
}

const resetPasswordSeller = async (resetPasswordData) =>{
  try{
    const response = await axios.post(`${BASE_URL}/api/seller/reset-password`, resetPasswordData);
    return response.data;
  }catch(error){
    throw error;
  }
}

// LOGOUT
const logout = () => {
  localStorage.removeItem("sellerToken");
};

const authService = {
  registerSeller,
  loginSeller,
  forgotPasswordSeller,
  logout,
  verifOtp,
  resetPasswordSeller,
};

export default authService;
