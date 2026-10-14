import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Async thunks
export const fetchAddresses = createAsyncThunk(
  'addresses/fetchAddresses',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().user.token;
      if (!token) {
        throw new Error('No authentication token');
      }

      console.log('Fetching addresses...');
      console.log('API URL:', `${API_URL}/api/addresses`);
      console.log('Token:', token);

      const response = await axios.get(`${API_URL}/api/addresses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      console.log('Addresses fetched successfully:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching addresses:', error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch addresses'
      );
    }
  }
);

export const createAddress = createAsyncThunk(
  'addresses/createAddress',
  async (addressData, { getState, rejectWithValue }) => {
    try {
      const token = getState().user.token;
      if (!token) {
        throw new Error('No authentication token');
      }

      console.log('Creating address with data:', addressData);
      console.log('API URL:', `${API_URL}/api/addresses`);
      console.log('Token:', token);

      const response = await axios.post(`${API_URL}/api/addresses`, addressData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      console.log('Address created successfully:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('Error creating address:', error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create address'
      );
    }
  }
);

export const updateAddress = createAsyncThunk(
  'addresses/updateAddress',
  async ({ addressId, addressData }, { getState, rejectWithValue }) => {
    try {
      const token = getState().user.token;
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await axios.put(
        `${API_URL}/api/addresses/${addressId}`,
        addressData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update address'
      );
    }
  }
);

export const deleteAddress = createAsyncThunk(
  'addresses/deleteAddress',
  async (addressId, { getState, rejectWithValue }) => {
    try {
      const token = getState().user.token;
      if (!token) {
        throw new Error('No authentication token');
      }

      await axios.delete(`${API_URL}/api/addresses/${addressId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return addressId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete address'
      );
    }
  }
);

export const setDefaultAddress = createAsyncThunk(
  'addresses/setDefaultAddress',
  async (addressId, { getState, rejectWithValue }) => {
    try {
      const token = getState().user.token;
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await axios.patch(
        `${API_URL}/api/addresses/${addressId}/default`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to set default address'
      );
    }
  }
);

const initialState = {
  addresses: [],
  loading: false,
  error: null,
  success: false,
  message: '',
};

const addressSlice = createSlice({
  name: 'addresses',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
      state.message = '';
    },
    resetAddressState: (state) => {
      state.addresses = [];
      state.loading = false;
      state.error = null;
      state.success = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch addresses
      .addCase(fetchAddresses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses = action.payload;
        state.error = null;
      })
      .addCase(fetchAddresses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create address
      .addCase(createAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses.push(action.payload);
        state.success = true;
        state.message = 'Address created successfully';
        state.error = null;
      })
      .addCase(createAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update address
      .addCase(updateAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAddress.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.addresses.findIndex(
          (addr) => addr._id === action.payload._id
        );
        if (index !== -1) {
          state.addresses[index] = action.payload;
        }
        state.success = true;
        state.message = 'Address updated successfully';
        state.error = null;
      })
      .addCase(updateAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete address
      .addCase(deleteAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses = state.addresses.filter(
          (addr) => addr._id !== action.payload
        );
        state.success = true;
        state.message = 'Address deleted successfully';
        state.error = null;
      })
      .addCase(deleteAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Set default address
      .addCase(setDefaultAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(setDefaultAddress.fulfilled, (state, action) => {
        state.loading = false;
        // Update all addresses to set isDefault to false
        state.addresses = state.addresses.map((addr) => ({
          ...addr,
          isDefault: false,
        }));
        // Set the target address as default
        const index = state.addresses.findIndex(
          (addr) => addr._id === action.payload._id
        );
        if (index !== -1) {
          state.addresses[index] = action.payload;
        }
        state.success = true;
        state.message = 'Default address updated successfully';
        state.error = null;
      })
      .addCase(setDefaultAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSuccess, resetAddressState } = addressSlice.actions;
export default addressSlice.reducer;