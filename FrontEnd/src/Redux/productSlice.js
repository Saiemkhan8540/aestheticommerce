import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const fetchProducts = createAsyncThunk(
  "products/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const searchParams = new URLSearchParams();
      // if (params.category != null && params.category !== "") searchParams.set("category", params.category);
      if (params.category != null && params.category !== "") {
        if (params.category.includes(",")) {
          // If there are multiple categories, append them individually
          const cats = params.category.split(",");
          cats.forEach((c) => searchParams.append("category", c));
        } else {
          // If it's just one category
          searchParams.set("category", params.category);
        }
      }
      if (params.subcategory != null && params.subcategory !== "") searchParams.set("subcategory", params.subcategory);
      if (params.tag != null && params.tag !== "") searchParams.set("tag", params.tag);
      if (params.tags != null && Array.isArray(params.tags) && params.tags.length > 0) {
        searchParams.set("tags", params.tags.join(","));
      } else if (params.tags != null && typeof params.tags === "string") searchParams.set("tags", params.tags);
      if (params.store != null && params.store !== "") searchParams.set("store", params.store);
      if (params.minPrice != null && params.minPrice !== "" && params.minPrice !== Infinity)
        searchParams.set("minPrice", String(params.minPrice));
      if (params.maxPrice != null && params.maxPrice !== "" && params.maxPrice !== Infinity)
        searchParams.set("maxPrice", String(params.maxPrice));
      if (params.inStock === true) searchParams.set("inStock", "true");
      if (params.minDiscount != null && params.minDiscount !== "" && params.minDiscount !== undefined)
        searchParams.set("minDiscount", String(params.minDiscount));
      if (params.sort != null && params.sort !== "") searchParams.set("sort", params.sort);
      if (params.page != null) searchParams.set("page", String(params.page));
      if (params.limit != null) searchParams.set("limit", String(params.limit));
      if (params.minRating != null) searchParams.set("minRating", String(params.minRating));
      if (params.readyToDispatch != null && params.readyToDispatch !== "") searchParams.set("readyToDispatch", params.readyToDispatch);
      if (params.orderingOptions != null && params.orderingOptions !== "") searchParams.set("orderingOptions", params.orderingOptions);
      if (params.deliverTo != null && params.deliverTo !== "") searchParams.set("deliverTo", params.deliverTo);
      const query = searchParams.toString();
      const url = query ? `${API_URL}/products?${query}` : `${API_URL}/products`;
      const response = await axios.get(url);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

export const fetchShops = createAsyncThunk(
  "products/fetchShops",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/products/shops`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

export const fetchProductById = createAsyncThunk(
  "products/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/products/${id}`);
      return response.data;
    } catch (err) {
      if (err.response?.status === 404) {
        return rejectWithValue("Product not found");
      }
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

const PRODUCTS_PER_PAGE = 5;

const updatedSortOptions = [
  { label: "Relevance", value: "default", direction: "asc" },
  { label: "Lowest Price", value: "sellingPrice", direction: "asc" },
  { label: "Highest Price", value: "sellingPrice", direction: "desc" },
  { label: "Top Customer Reviews", value: "rating", direction: "desc" },
  { label: "Most Recent", value: "id", direction: "desc" },
];

const initialState = {
  products: [],
  filteredProducts: [],
  totalProductCount: 0,
  shops: [],
  shopsLoading: false,
  shopsError: null,
  sortOption: updatedSortOptions[0],
  filterOptions: {
    inStock: false,
    priceRange: [0, Infinity],
    categories: [],
    subcategories: [],
    tags: [],
    categoryFilter: "",
    subcategoryFilter: "",
    minDiscount: null,
    storeName: "", // ✅ Updated field to storeName
    minRating: null,
  },
  currentPage: 1,
  itemsPerPage: PRODUCTS_PER_PAGE,
  updatedSortOptions,
  loading: false,
  error: null,
  // Single product (detail page)
  currentProduct: null,
  currentProductLoading: false,
  currentProductError: null,
};

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setSortOption(state, action) {
      state.sortOption = action.payload;
      state.currentPage = 1;
    },
    setFilterOptions(state, action) {
      state.filterOptions = { ...state.filterOptions, ...action.payload };
      state.currentPage = 1;
    },
    setCurrentPage(state, action) {
      state.currentPage = action.payload;
    },
    resetFilters(state) {
      state.filterOptions = initialState.filterOptions;
      state.sortOption = updatedSortOptions[0];
      state.currentPage = 1;
    },

    // No-op: filtering is now done server-side via fetchProducts(params)
    filterProducts(state) {
      // Kept for backward compatibility; list comes from server
    },

    setPaginatedProducts(state) {
      const start = (state.currentPage - 1) * state.itemsPerPage;
      state.paginatedProducts = state.filteredProducts.slice(
        start,
        start + state.itemsPerPage
      );
    },
    clearCurrentProduct(state) {
      state.currentProduct = null;
      state.currentProductError = null;
      state.currentProductLoading = true;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        const payload = action.payload;
        state.filteredProducts = Array.isArray(payload?.products) ? payload.products : [];
        state.totalProductCount = typeof payload?.totalCount === "number" ? payload.totalCount : 0;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message || "Failed to fetch products";
      })
      .addCase(fetchShops.pending, (state) => {
        state.shopsLoading = true;
        state.shopsError = null;
      })
      .addCase(fetchShops.fulfilled, (state, action) => {
        state.shopsLoading = false;
        state.shops = Array.isArray(action.payload) ? action.payload : [];
        state.shopsError = null;
      })
      .addCase(fetchShops.rejected, (state, action) => {
        state.shopsLoading = false;
        state.shops = [];
        state.shopsError = action.payload || action.error?.message || "Failed to fetch shops";
      })
      .addCase(fetchProductById.pending, (state) => {
        state.currentProductLoading = true;
        state.currentProductError = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.currentProductLoading = false;
        state.currentProduct = action.payload;
        state.currentProductError = null;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.currentProductLoading = false;
        state.currentProduct = null;
        state.currentProductError = action.payload || action.error.message;
      });
  },
});

export const {
  setSortOption,
  setFilterOptions,
  resetFilters,
  filterProducts,
  setCurrentPage,
  setPaginatedProducts,
  clearCurrentProduct,
} = productSlice.actions;

export default productSlice.reducer;
