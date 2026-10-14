import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import ordersReducer from './ordersSlice';
import deliveryTaskReducer from './deliveryTaskSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        orders: ordersReducer,
        deliveryTasks: deliveryTaskReducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export default store;
