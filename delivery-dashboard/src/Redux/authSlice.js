import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { loginDeliveryAPI, verifyTokenAPI, logoutDeliveryAPI , registerDeliveryAPI} from '../services/deliveryService';

// Async thunk for login
export const loginDelivery = createAsyncThunk(
    'auth/login',
    async ({ email, password }, { rejectWithValue }) => {
        try {
            const response = await loginDeliveryAPI(email, password);
            localStorage.setItem('deliveryToken', response.token);
            localStorage.setItem("riderId", response.partner.id);
            return response.token;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Invalid email or password');
        }
    }
);

export const registerDelivery = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await registerDeliveryAPI(userData);
      return response.message || "Registration successful";
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Registration failed";

      return rejectWithValue(message);
    }
  }
);

// Async thunk for token verification
export const verifyToken = createAsyncThunk(
    'auth/verifyToken',
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('deliveryToken');
            if (!token) {
                return null;
            }

            await verifyTokenAPI();
            return token;
        } catch (error) {
            localStorage.removeItem('deliveryToken');
            return rejectWithValue('Token verification failed');
        }
    }
);

// Async thunk for logout
export const logoutDelivery = createAsyncThunk(
    'auth/logout',
    async (_, { rejectWithValue }) => {
        try {
            await logoutDeliveryAPI();
        } catch (error) {
            // Still clear local state even if API call fails
            return rejectWithValue(error.response?.data?.message || 'Logout failed');
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        isDelivery:  !!localStorage.getItem("deliveryToken"),
        loading: false,
        error: null,
        token: localStorage.getItem('deliveryToken') || null,
    },
    reducers: {
        logout: (state) => {
            state.isDelivery = false;
            state.token = null;
            state.error = null;
            localStorage.removeItem('deliveryToken');
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Login
            .addCase(loginDelivery.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginDelivery.fulfilled, (state, action) => {
                state.loading = false;
                state.isDelivery = true;
                state.token = action.payload;
                state.error = null;
            })
            .addCase(loginDelivery.rejected, (state, action) => {
                state.loading = false;
                state.isDelivery = false;
                state.error = action.payload;
                state.token = null;
            })
            // Verify Token
            .addCase(verifyToken.pending, (state) => {
                state.loading = true;
            })
            .addCase(verifyToken.fulfilled, (state, action) => {
                state.loading = false;

                if (action.payload) {
                    state.isDelivery = true;
                    state.token = action.payload;
                }
            })
            .addCase(verifyToken.rejected, (state) => {
                state.loading = false;
                state.isDelivery = false;
                state.token = null;
            })
            .addCase(registerDelivery.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerDelivery.fulfilled, (state) => {
                state.loading = false;
                state.error = null;
            })
            .addCase(registerDelivery.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
