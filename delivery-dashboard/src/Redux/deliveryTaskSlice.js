import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchActiveDeliveryTaskAPI,
  acceptDeliveryTaskAPI,
  updateTaskStatusAPI,
  rejectDeliveryTaskAPI,
  fetchNearbyDeliveriesAPI,
  updateLocationAPI
} from "../services/deliveryService.js";

// 1. Fetch Nearby Deliveries Thunk
export const getNearbyDeliveries = createAsyncThunk(
  "deliveryTasks/getNearbyDeliveries",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchNearbyDeliveriesAPI();
      return response.data; // Array of nearby tasks
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch nearby deliveries");
    }
  }
);

// 2. Update Location Thunk
export const updateDriverLocation = createAsyncThunk(
  "deliveryTasks/updateLocation",
  async ({ lng, lat }, { rejectWithValue, dispatch }) => {
    try {
      await updateLocationAPI(lng, lat);
      dispatch(getNearbyDeliveries());
      return { lng, lat };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update location");
    }
  }
);

// 3. Fetch Active Task
export const getActiveTask = createAsyncThunk(
  "deliveryTasks/getActiveTask",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchActiveDeliveryTaskAPI();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch active task");
    }
  }
);

// 4. Accept Task
export const acceptTask = createAsyncThunk(
  "deliveryTasks/acceptTask",
  async (taskId, { rejectWithValue, dispatch }) => {
    try {
      const response = await acceptDeliveryTaskAPI(taskId);
      dispatch(getActiveTask());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to accept task");
    }
  }
);

// 5. Update Status
export const updateTaskStatus = createAsyncThunk(
  "deliveryTasks/updateTaskStatus",
  async ({ taskId, status }, { rejectWithValue, dispatch }) => {
    try {
      await updateTaskStatusAPI(taskId, status);
      if (status === "Delivered") {
        dispatch(clearActiveTask());
      } else {
        dispatch(getActiveTask());
      }
      return status;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update status");
    }
  }
);

// 6. Reject Task
export const rejectTask = createAsyncThunk(
  "deliveryTasks/rejectTask",
  async (taskId, { rejectWithValue, dispatch }) => {
    try {
      await rejectDeliveryTaskAPI(taskId);
      dispatch(clearActiveTask());
      return taskId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to reject task");
    }
  }
);

const deliveryTaskSlice = createSlice({
  name: "deliveryTasks",
  initialState: {
    tasks: [],
    activeTask: null,
    nearbyTasks: [],
    locationError: false,
    loading: false,
    actionLoading: false,
    error: null,
  },
  reducers: {
    addDeliveryTask: (state, action) => {
      const incoming = action.payload;
      const id = incoming._id || incoming.taskId;
      if (!id) return;

      // Maintain legacy tasks array (if used elsewhere)
      const existsInTasks = state.tasks.find(
        (t) => (t._id || t.taskId) === id,
      );
      if (!existsInTasks) {
        state.tasks.unshift(incoming);
      }

      // Also ensure nearbyTasks reflects socket-pushed tasks
      const idx = state.nearbyTasks.findIndex(
        (t) => (t._id || t.taskId) === id,
      );
      if (idx >= 0) {
        state.nearbyTasks[idx] = {
          ...state.nearbyTasks[idx],
          ...incoming,
        };
      } else {
        state.nearbyTasks.unshift(incoming);
      }
    },
    removeDeliveryTask: (state, action) => {
      state.tasks = state.tasks.filter(t => t.taskId !== action.payload);
    },
    clearTasks: (state) => {
      state.tasks = [];
      state.nearbyTasks = [];
    },
    clearActiveTask: (state) => {
      state.activeTask = null;
    },
    upsertNearbyTask: (state, action) => {
      const incoming = action.payload;
      const id = incoming._id || incoming.taskId;
      if (!id) return;
      const idx = state.nearbyTasks.findIndex(
        (t) => (t._id || t.taskId) === id,
      );
      if (idx >= 0) {
        state.nearbyTasks[idx] = {
          ...state.nearbyTasks[idx],
          ...incoming,
        };
      } else {
        state.nearbyTasks.unshift(incoming);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Active Task
      .addCase(getActiveTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getActiveTask.fulfilled, (state, action) => {
        state.loading = false;
        state.activeTask = action.payload;
      })
      .addCase(getActiveTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Nearby Tasks
      .addCase(getNearbyDeliveries.pending, (state) => {
        state.loading = true;
        state.locationError = false;
      })
      .addCase(getNearbyDeliveries.fulfilled, (state, action) => {
        state.loading = false;
        state.nearbyTasks = action.payload || [];
        state.locationError = false;
      })
      .addCase(getNearbyDeliveries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        if (action.payload === "Update Location First") {
          state.locationError = true;
        }
      })
      // Action Loading States
      .addMatcher(
        (action) => action.type.endsWith('/pending') && !action.type.includes('getActiveTask') && !action.type.includes('getNearbyDeliveries'),
        (state) => { state.actionLoading = true; }
      )
      // 🔴 FIXED SYNTAX HERE: Removed the semicolon that was breaking the chain
      .addMatcher(
        (action) => (action.type.endsWith('/fulfilled') || action.type.endsWith('/rejected')) && !action.type.includes('getActiveTask') && !action.type.includes('getNearbyDeliveries'),
        (state) => { state.actionLoading = false; }
      );
  }
});

export const { addDeliveryTask, removeDeliveryTask, clearTasks, clearActiveTask } = deliveryTaskSlice.actions;
export default deliveryTaskSlice.reducer;