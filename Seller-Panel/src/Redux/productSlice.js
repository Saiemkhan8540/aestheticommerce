import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

// 🔹 Async thunk for adding a product
export const addProduct = createAsyncThunk(
  "products/addProduct",
  async (productData, { getState, rejectWithValue }) => {
    try {
      const formData = new FormData();

// Fees defaults
const logisticsFee = 60;
const transactionFee = 10;
const platformFee = productData.platformFee || 0;

const sellingPrice = Number(productData.sellingPrice || 0);
const discountPercentage = Number(productData.discountPercentage || 0);

const calculatedPrice = sellingPrice + logisticsFee + transactionFee + platformFee;
const discountAmount = (calculatedPrice * discountPercentage) / 100;
const mrp = calculatedPrice + discountAmount;

// Append all non-image fields
Object.keys(productData).forEach((key) => {
  if (key !== "images") {
    formData.append(key, productData[key]);
  }
});

// Append images properly
if (Array.isArray(productData.images)) {
  productData.images.forEach((file) => formData.append("images", file));
} else if (productData.images) {
  formData.append("images", productData.images);
}

// Overwrite calculated fields
formData.set("mrp", mrp);
formData.set("platformFee", platformFee);
formData.set("logisticsFee", logisticsFee);
formData.set("transactionFee", transactionFee);
formData.set("discountPercentage", discountPercentage);


      const token = getState().auth.token;

      const res = await axios.post(`${BASE_URL}/api/products`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// 🔹 Slice
const productSlice = createSlice({
  name: "products",
  initialState: {
    items: [],
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    clearSuccess: (state) => {
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(addProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
        state.success = true;
      })
      .addCase(addProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  },
});

export default productSlice.reducer;
export const { clearSuccess } = productSlice.actions;