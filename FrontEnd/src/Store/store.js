import { configureStore } from '@reduxjs/toolkit';
import authSlice from '../Redux/authSlice';
import blogReducer from '../Redux/blogSlice';
import userSlice from '../Redux/userSlice';
import productReducer from "../Redux/productSlice";
import favoritesReducer from "../Redux/favoritesSlice";
import cartReducer from "../Redux/cartSlice";
import addressReducer from "../Redux/addressSlice";
import orderReducer from "../Redux/orderSlice";
import reviewsReducer from "../Redux/reviewsSlice";
import invoiceReducer from "../Redux/documentSlice"; // ✅ Add this import

const store = configureStore({
  reducer: {
    user: authSlice,
    blogs: blogReducer,
    profile: userSlice,
    products: productReducer,
    favorites: favoritesReducer,
    cart: cartReducer,
    addresses: addressReducer,
    orders: orderReducer,
    reviews: reviewsReducer,
    invoice: invoiceReducer, // ✅ Add reducer here
  },
});

export default store;
