import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import dashboardService from "./dashboardService";

// Initial state
const initialState = {
  stats: null,
  products: [],
  orders: [],
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: "",
};

// Async thunk to fetch stats
export const fetchSellerStats = createAsyncThunk(
  "dashboard/fetchStats",
  async ({ sellerId, token }, thunkAPI) => {
    try {
      return await dashboardService.getSellerStats(sellerId, token);
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Async thunk to fetch seller products
export const fetchSellerProducts = createAsyncThunk(
  "dashboard/fetchProducts",
  async ({infoType,token}, thunkAPI) => {
    try {
      return await dashboardService.getSellerProducts({infoType,token});
    } catch (error) {
      console.error("❌ fetchSellerProducts error:", error.response?.data || error.message);
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Async thunk to fetch delete seller product
export const deleteSellerProduct = createAsyncThunk(
  "dashboard/deleteProduct",
  async ({productId,token}, thunkAPI) =>{
    try{
      return await dashboardService.deleteSellerProduct(productId,token);
    }catch(error){
      console.log("❌ deleteSellerProduct got error:", error.response?.data || error.message)
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
)

// 🔹 UPDATED: Async thunk to fetch seller orders (now takes sellerId + token)
export const fetchSellerOrders = createAsyncThunk(
  "dashboard/fetchOrders",
  async ({ sellerId, token }, thunkAPI) => {
    try {
      return await dashboardService.getSellerOrders(sellerId, token);
    } catch (error) {
      console.error("❌ fetchSellerOrders error:", error.response?.data || error.message);
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Slice
const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    reset: (state) => {
      state.stats = null;
      state.products = [];
      state.orders = [];
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = "";
      state.infoType = "active"
    },
    resetOrders: (state) => {
      state.orders = [];
    },
    resetOrdersAndStats: (state) => {
      state.stats = null;
      state.orders = [];
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = "";
      // Do not clear products so Product page keeps list when navigating away from Dashboard/Orders
    },
    setInfoType: (state, action)=>{
      state.infoType = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Stat reducers
      .addCase(fetchSellerStats.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchSellerStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.stats = action.payload;
      })
      .addCase(fetchSellerStats.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.stats = null;
      })

      // Products reducers
      .addCase(fetchSellerProducts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchSellerProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.products = action.payload.products;
      })
      .addCase(fetchSellerProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        // Do not clear products on reject; keep existing list so a failed/cancelled request doesn't wipe the UI
      })

      // Delete Product reducers
      .addCase(deleteSellerProduct.pending, (state)=>{
        state.isLoading = true;
      })
      .addCase(deleteSellerProduct.fulfilled, (state,action)=>{
        state.isLoading = false;
        state.isSuccess = true;
      })
      .addCase(deleteSellerProduct.rejected, (state,action)=>{
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // Orders reducers
      .addCase(fetchSellerOrders.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchSellerOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.orders = action.payload;
      })
      .addCase(fetchSellerOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.orders = [];
      });
  },
});

export const { reset, resetOrders, resetOrdersAndStats, setInfoType } = dashboardSlice.actions;
export default dashboardSlice.reducer;