import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import documentService from "./documentService";

// Download Invoice
export const downloadInvoice = createAsyncThunk(
  "document/downloadInvoice",
  async (orderId, { rejectWithValue }) => {
    try {
      return await documentService.getInvoice(orderId);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Invoice download failed"
      );
    }
  }
);

// Download Label
export const downloadLabel = createAsyncThunk(
  "document/downloadLabel",
  async (orderId, { rejectWithValue }) => {
    try {
      return await documentService.getLabel(orderId);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Label download failed"
      );
    }
  }
);

const documentSlice = createSlice({
  name: "document",
  initialState: {
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Invoice
      .addCase(downloadInvoice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(downloadInvoice.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(downloadInvoice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Label
      .addCase(downloadLabel.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(downloadLabel.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(downloadLabel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default documentSlice.reducer;
