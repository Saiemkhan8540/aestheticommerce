// src/redux/statsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import statsService from "./statsService";

// Helper to get token
const getToken = () => localStorage.getItem("sellerToken");

// ⚙️ Utility to handle error messages
const handleError = (error, defaultMsg) =>
  (error.response && error.response.data && error.response.data.message) ||
  error.message ||
  defaultMsg;

// ===============================
// 🔹 Async Thunks
// ===============================

// 1️⃣ Overview Stats
export const fetchOverviewStats = createAsyncThunk(
  "stats/fetchOverview",
  async (filter = "month", thunkAPI) => {
    try {
      const token = getToken();
      return await statsService.getOverviewStats(filter, token);
    } catch (error) {
      return thunkAPI.rejectWithValue(handleError(error, "Failed to fetch overview stats"));
    }
  }
);

// 2️⃣ Sales Graph
export const fetchSalesGraph = createAsyncThunk(
  "stats/fetchSalesGraph",
  async (filter = "month", thunkAPI) => {
    try {
      const token = getToken();
      return await statsService.getSalesGraph(filter, token);
    } catch (error) {
      return thunkAPI.rejectWithValue(handleError(error, "Failed to fetch sales graph"));
    }
  }
);

// 3️⃣ Order Status Distribution
export const fetchOrderStatusStats = createAsyncThunk(
  "stats/fetchOrderStatus",
  async (filter = "month", thunkAPI) => {
    try {
      const token = getToken();
      return await statsService.getOrderStatusStats(filter, token);
    } catch (error) {
      return thunkAPI.rejectWithValue(handleError(error, "Failed to fetch order status stats"));
    }
  }
);

// 4️⃣ Category Stats
export const fetchCategoryStats = createAsyncThunk(
  "stats/fetchCategoryStats",
  async (filter = "month", thunkAPI) => {
    try {
      const token = getToken();
      return await statsService.getCategoryStats(filter, token);
    } catch (error) {
      return thunkAPI.rejectWithValue(handleError(error, "Failed to fetch category stats"));
    }
  }
);

// 5️⃣ Inventory Metrics (Legacy)
export const fetchInventoryStats = createAsyncThunk(
  "stats/fetchInventory",
  async (_, thunkAPI) => {
    try {
      const token = getToken();
      return await statsService.getInventoryStats(token);
    } catch (error) {
      return thunkAPI.rejectWithValue(handleError(error, "Failed to fetch inventory stats"));
    }
  }
);

// ✅ 6️⃣ NEW: Inventory Management Data (Comprehensive)
export const fetchInventoryManagement = createAsyncThunk(
  "stats/fetchInventoryManagement",
  async (_, thunkAPI) => {
    try {
      const token = getToken();
      return await statsService.getInventoryManagementData(token);
    } catch (error) {
      return thunkAPI.rejectWithValue(handleError(error, "Failed to fetch inventory management data"));
    }
  }
);

// ===============================
// 🔸 Slice Definition
// ===============================
const statsSlice = createSlice({
  name: "stats",
  initialState: {
    overview: null,
    salesGraph: [],
    orderStatus: [],
    categoryStats: [],
    inventory: null,
    inventoryManagement: null, // ✅ NEW: For inventory management page
    filter: "month",
    isLoading: false,
    isError: false,
    isSuccess: false,
    message: "",
  },
  reducers: {
    setFilter: (state, action) => {
      state.filter = action.payload;
    },
    resetStats: (state) => {
      state.overview = null;
      state.salesGraph = [];
      state.orderStatus = [];
      state.categoryStats = [];
      state.inventory = null;
      state.inventoryManagement = null;
      state.filter = "month";
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      // ===============================
      // Overview
      // ===============================
      .addCase(fetchOverviewStats.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchOverviewStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.overview = action.payload;
        state.isSuccess = true;
      })
      .addCase(fetchOverviewStats.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // ===============================
      // Sales Graph
      // ===============================
      .addCase(fetchSalesGraph.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchSalesGraph.fulfilled, (state, action) => {
        state.isLoading = false;
        state.salesGraph = action.payload;
        state.isSuccess = true;
      })
      .addCase(fetchSalesGraph.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // ===============================
      // Order Status
      // ===============================
      .addCase(fetchOrderStatusStats.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchOrderStatusStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderStatus = action.payload;
        state.isSuccess = true;
      })
      .addCase(fetchOrderStatusStats.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // ===============================
      // Category Stats
      // ===============================
      .addCase(fetchCategoryStats.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCategoryStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categoryStats = action.payload;
        state.isSuccess = true;
      })
      .addCase(fetchCategoryStats.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // ===============================
      // Inventory (Legacy)
      // ===============================
      .addCase(fetchInventoryStats.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchInventoryStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.inventory = action.payload;
        state.isSuccess = true;
      })
      .addCase(fetchInventoryStats.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // ===============================
      // ✅ Inventory Management (NEW)
      // ===============================
      .addCase(fetchInventoryManagement.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchInventoryManagement.fulfilled, (state, action) => {
        state.isLoading = false;
        state.inventoryManagement = action.payload;
        state.isSuccess = true;
      })
      .addCase(fetchInventoryManagement.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { setFilter, resetStats } = statsSlice.actions;
export default statsSlice.reducer;