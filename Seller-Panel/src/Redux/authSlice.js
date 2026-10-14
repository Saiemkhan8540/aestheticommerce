import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authService from "./authService";
import axios from "axios";
import { updateSellerProfile } from "./sellerSlice";

// Get token from localStorage (persistence after refresh)
const sellerToken = localStorage.getItem("sellerToken");

// SELLER REGISTER
export const registerSeller = createAsyncThunk(
  "auth/registerSeller",
  async (sellerData, { rejectWithValue }) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL;

      // Check if files are present
      if (sellerData.aadharFile || sellerData.panFile) {
        // Use FormData for multipart upload
        const fd = new FormData();

        // Add text fields
        fd.append("sellerName", sellerData.sellerName);
        fd.append("email", sellerData.email);
        fd.append("password", sellerData.password);
        fd.append("phone", sellerData.phone);
        fd.append("storeName", sellerData.storeName);
        fd.append("gstNumber", sellerData.gstNumber);
        fd.append("registrationNumber", sellerData.registrationNumber);
        fd.append("businessType", sellerData.businessType);
        fd.append("businessAddress", JSON.stringify(sellerData.businessAddress));
        fd.append("bankDetails", JSON.stringify(sellerData.bankDetails));
        fd.append("aadharNumber", sellerData.aadharNumber);
        fd.append("panNumber", sellerData.panNumber);
        fd.append("addressProof", sellerData.addressProof);

        // Add files
        if (sellerData.aadharFile) fd.append("aadharFile", sellerData.aadharFile);
        if (sellerData.panFile) fd.append("panFile", sellerData.panFile);

        const response = await axios.post(`${API_URL}/api/seller/register`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (response.data.success) {
          localStorage.setItem("sellerToken", response.data.token);
          return response.data;
        } else {
          throw new Error(response.data.message || "Registration failed");
        }
      } else {
        // No files, use regular JSON
        const response = await axios.post(`${API_URL}/api/seller/register`, sellerData);
        if (response.data.success) {
          localStorage.setItem("sellerToken", response.data.token);
          return response.data;
        } else {
          throw new Error(response.data.message || "Registration failed");
        }
      }
    } catch (error) {
      console.error("Register error:", error);
      const message = error?.response?.data?.message || error?.message || "Registration failed";
      return rejectWithValue(message);
    }
  }
);

// SELLER LOGIN
export const loginSeller = createAsyncThunk(
  "auth/loginSeller",
  async (loginData, thunkAPI) => {
    try {
      return await authService.loginSeller(loginData);
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);


//SELLER FORGOT PASSWORD
export const forgotPasswordSeller = createAsyncThunk(
  "auth/forgotPassword",
  async(email,thunkAPI) =>{
    try{
      return await authService.forgotPasswordSeller(email);
    }catch(error){
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
)

export const verifOtp = createAsyncThunk(
  "auth/verifyOtp",
  async(verifyOtpData, thunkAPI)=>{
    try{
      return await authService.verifOtp(verifyOtpData);
    }catch(error){
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
)

// RESET PASSWORD
export const resetPasswordSeller = createAsyncThunk(
  "auth/resetPasswordSeller",
  async(resetPasswordData, thunkAPI) =>{
    try{
      return await authService.resetPasswordSeller(resetPasswordData);
    }catch(error){
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);


// LOGOUT
export const logoutSeller = createAsyncThunk("auth/logout", async () => {
  return authService.logout();
});

// LOAD CURRENT SELLER USING TOKEN
export const loadCurrentSeller = createAsyncThunk(
  "auth/loadCurrentSeller",
  async (_, thunkAPI) => {
    try {
      const token = localStorage.getItem("sellerToken");
      if (!token) {
        return thunkAPI.rejectWithValue("No token found");
      }

      const API_URL = import.meta.env.VITE_API_URL;
      const response = await axios.get(`${API_URL}/api/seller/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.data?.success || !response.data?.seller) {
        return thunkAPI.rejectWithValue("Failed to load seller profile");
      }

      return { seller: response.data.seller, token };
    } catch (error) {
      console.error("loadCurrentSeller error:", error);
      // On 401/403, clear token
      if (error.response && [401, 403].includes(error.response.status)) {
        localStorage.removeItem("sellerToken");
      }
      const message =
        error.response?.data?.message || error.message || "Failed to load seller profile";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const initialState = {
  seller: null,
  token: sellerToken || null, // load persisted token
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: "",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    restoreSellerFromSession: (state, action) => {
      state.seller = action.payload.seller;
      state.token = action.payload.token;
      state.message = "Session Restored";
    },
    setSellerOnboardingCompleted: (state) => {
      if (state.seller) {
        state.seller = {
          ...state.seller,
          onboardingCompleted: true,
        };
      }
    },
    resetAuthState: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      // REGISTER SELLER
      .addCase(registerSeller.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(registerSeller.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.seller = action.payload.seller;
        state.token = action.payload.token;

        // persist to localStorage
        localStorage.setItem("sellerToken", action.payload.token);
      })
      .addCase(registerSeller.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // LOGIN SELLER
      .addCase(loginSeller.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loginSeller.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.seller = action.payload.seller;
        state.token = action.payload.token;

        // persist to localStorage
        localStorage.setItem("sellerToken", action.payload.token);
      })
      .addCase(loginSeller.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // FORGOT PASSWORD
      .addCase(forgotPasswordSeller.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(forgotPasswordSeller.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.seller = action.payload.seller; // Assuming API returns seller data
        state.message = action.payload.message; // Assuming API returns a message
      })
      .addCase(forgotPasswordSeller.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // VERIFY OTP
      .addCase(verifOtp.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(verifOtp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.seller = action.payload.seller; // Assuming API returns seller data
        state.token = action.payload.token; // Assuming API returns a new token after OTP verification
        // You can update seller data or message based on API response
        state.message = action.payload.message; // Assuming API returns a message
        sessionStorage.setItem("tempSeller", JSON.stringify(action.payload));
      })
      .addCase(verifOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      //Reset Password
      .addCase(resetPasswordSeller.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(resetPasswordSeller.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = action.payload.message; // Assuming API returns a message
      })
      .addCase(resetPasswordSeller.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // LOAD CURRENT SELLER
      .addCase(loadCurrentSeller.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadCurrentSeller.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.seller = action.payload.seller;
        state.token = action.payload.token;
      })
      .addCase(loadCurrentSeller.rejected, (state, action) => {
        state.isLoading = false;
        // do not set isError for "No token found" to avoid noise
        if (action.payload !== "No token found") {
          state.isError = true;
          state.message = action.payload;
        }
      })

      // LOGOUT
      .addCase(logoutSeller.fulfilled, (state) => {
        state.seller = null;
        state.token = null;
        localStorage.removeItem("sellerToken");
      })

      // Sync auth seller when profile is updated
      .addCase(updateSellerProfile.fulfilled, (state, action) => {
        if (state.seller && action.payload) {
          state.seller = {
            ...state.seller,
            sellerName: action.payload.sellerName ?? state.seller.sellerName,
            storeName: action.payload.storeName ?? state.seller.storeName,
            email: action.payload.email ?? state.seller.email,
            phone: action.payload.phone ?? state.seller.phone,
          };
        }
      });
  },
});

export const { resetAuthState, restoreSellerFromSession, setSellerOnboardingCompleted } =
  authSlice.actions;
export default authSlice.reducer;