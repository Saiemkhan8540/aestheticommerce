// src/Redux/sellerSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import sellerService from "./sellerService"; // Import the new service

// Fetch seller profile
export const fetchSellerProfile = createAsyncThunk(
  "seller/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("sellerToken");
      if (!token) {
        return rejectWithValue("No token found. Please login again.");
      }

      const data = await sellerService.getSellerProfile(token);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch seller profile"
      );
    }
  }
);


// Add a new async thunk to update the seller profile
export const updateSellerProfile = createAsyncThunk(
  "seller/updateProfile",
  async (profileData, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const token = auth?.token;
      
      if (!token) {
        return rejectWithValue("No token found. Please login again.");
      }
      
      const data = await sellerService.updateSellerProfile(profileData, token);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.message ||
        "Failed to update seller profile"
      );
    }
  }
);

const sellerSlice = createSlice({
  name: "seller",
  initialState: {
    profile: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearSellerProfile: (state) => {
      state.profile = null;
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Cases for fetching the profile
      .addCase(fetchSellerProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSellerProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchSellerProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Cases for updating the profile
      .addCase(updateSellerProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSellerProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload; // Update the profile with the new data from the backend
      })
      .addCase(updateSellerProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSellerProfile } = sellerSlice.actions;
export default sellerSlice.reducer;