import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchOrdersAPI } from '../services/deliveryService';

// Async thunk for fetching orders
export const fetchOrders = createAsyncThunk(
    'orders/fetchOrders',
    async (_, { rejectWithValue }) => {
        try {
            const data = await fetchOrdersAPI();
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch orders');
        }
    }
);

const filterHistoryOrders = (orders, searchTerm, activeFilter) => {
    let history = orders.filter(order => 
        ['Delivered', 'Cancelled', 'Failed'].includes(order.status)
    );

    if (activeFilter === 'Delivered' || activeFilter === 'Cancelled') {
        history = history.filter(order => order.status === activeFilter);
    }

    if (searchTerm) {
        history = history.filter(order => {
            const addressStr = order.address && typeof order.address === 'object'
                ? `${order.address.street}, ${order.address.city}, ${order.address.state}`
                : order.address || '';
            return (
                order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.productTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                addressStr.toLowerCase().includes(searchTerm.toLowerCase())
            );
        });
    }

    return history;
};

const ordersSlice = createSlice({
    name: 'orders',
    initialState: {
        orders: [],
        filteredOrders: [],
        searchTerm: '',
        // activeFilter: 'Dispatched',
        activeFilter: 'All History',
        loading: false,
        error: null,
    },
    reducers: {
        setSearchTerm: (state, action) => {
            state.searchTerm = action.payload;
            // state.filteredOrders = filterOrders(state.orders, state.searchTerm, state.activeFilter);
            state.filteredOrders = filterHistoryOrders(state.orders, state.searchTerm, state.activeFilter);
        },
        setActiveFilter: (state, action) => {
            state.activeFilter = action.payload;
            state.filteredOrders = filterHistoryOrders(state.orders, state.searchTerm, state.activeFilter);
        },
        clearOrders: (state) => {
            state.orders = [];
            state.filteredOrders = [];
            state.searchTerm = '';
            // state.activeFilter = 'Dispatched';
            state.activeFilter = 'All History';
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchOrders.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.orders = action.payload;
                state.filteredOrders = filterHistoryOrders(action.payload, state.searchTerm, state.activeFilter);
            })
            .addCase(fetchOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

// Helper function to filter orders
const filterOrders = (orders, searchTerm, activeFilter) => {
    let filtered = orders;

    // Apply status filter
    if (activeFilter !== 'All Orders') {
        filtered = filtered.filter(order => order.status === activeFilter);
    }

    // Apply search
    if (searchTerm) {
        filtered = filtered.filter(order => {
            const addressStr = order.address && typeof order.address === 'object'
                ? `${order.address.street}, ${order.address.city}, ${order.address.state},${order.address.pincode || order.address.zipCode || ''}`
                : order.address || '';
            return (
                order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.productTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                addressStr.toLowerCase().includes(searchTerm.toLowerCase())
            );
        });
    }

    return filtered;
};

export const { setSearchTerm, setActiveFilter, clearOrders } = ordersSlice.actions;
export default ordersSlice.reducer;
