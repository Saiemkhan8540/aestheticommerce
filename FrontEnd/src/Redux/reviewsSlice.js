import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import reviewsService from "./reviewsService";

export const fetchReviews = createAsyncThunk(
  "reviews/fetch",
  async (productId, thunkAPI) => {
    try {
      return await reviewsService.fetchProductReviews(productId);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.error || "Failed to load reviews");
    }
  }
);

export const submitReview = createAsyncThunk(
  "reviews/submit",
  async ({ productId, stars, text, photos }, thunkAPI) => {
    try {
      const state = thunkAPI.getState();
      
      // Try multiple ways to get the token
      let token = state.user?.token;
      
      if (!token) {
        // Try getting from localStorage
        try {
          const userFromStorage = JSON.parse(localStorage.getItem("user") || "null");
          token = userFromStorage?.token;
        } catch (e) {
          console.error('Error parsing user from localStorage:', e);
        }
      }
      
      // Also try alternative storage keys that might be used
      if (!token) {
        token = localStorage.getItem("token") || localStorage.getItem("authToken");
      }
      
      console.log('Token found:', token ? 'Yes' : 'No'); // Debug log
      console.log('User state:', state.user); // Debug log
      
      if (!token) {
        return thunkAPI.rejectWithValue("Please login to submit a review");
      }
      
      const result = await reviewsService.createProductReview(
        { productId, stars, text, photos }, 
        token
      );
      return result;
    } catch (err) {
      console.error('Submit review error:', err);
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || 
        err.response?.data?.error || 
        err.message || 
        "Failed to submit review"
      );
    }
  }
);

export const markHelpful = createAsyncThunk(
  "reviews/markHelpful",
  async ({ productId, reviewId }, thunkAPI) => {
    try {
      const state = thunkAPI.getState();
      const token = state.user?.token || JSON.parse(localStorage.getItem("user") || "null")?.token;
      if (!token) return thunkAPI.rejectWithValue("Please login");
      const res = await reviewsService.markReviewHelpful({ productId, reviewId }, token);
      return res;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.error || "Failed to update helpful");
    }
  }
);

const reviewsSlice = createSlice({
  name: "reviews",
  initialState: {
    items: [],
    loading: false,
    submitLoading: false,
    error: null,
  },
  reducers: {
    clearReviews: (state) => {
      state.items = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload || [];
      })
      .addCase(fetchReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(submitReview.pending, (state) => {
        state.submitLoading = true;
        state.error = null;
      })
      .addCase(submitReview.fulfilled, (state, action) => {
        state.submitLoading = false;
        // After submit, the API returns the entire updated product; take reviews from it
        state.items = action.payload?.reviews || state.items;
      })
      .addCase(submitReview.rejected, (state, action) => {
        state.submitLoading = false;
        state.error = action.payload;
      })
      .addCase(markHelpful.fulfilled, (state, action) => {
        const { reviewId, helpfulCount } = action.payload || {};
        if (!reviewId) return;
        state.items = (state.items || []).map((r) =>
          (r._id === reviewId) ? { ...r, helpfulCount } : r
        );
      });
  },
});

export const { clearReviews } = reviewsSlice.actions;
export default reviewsSlice.reducer;