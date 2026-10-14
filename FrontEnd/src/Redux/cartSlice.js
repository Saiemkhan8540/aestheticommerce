import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import cartService from './cartService';

const initialState = {
  cartItems: [],
  totalQuantity: 0,
  totalAmount: 0,
  loading: false,
  error: null
};

// Async thunks for backend persistence
export const fetchCartFromBackend = createAsyncThunk(
  'cart/fetchFromBackend',
  async (_, { getState, rejectWithValue }) => {
    try {
      const getStateFn = () => getState();
      const cartData = await cartService.get(getStateFn);
      return cartData;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const syncCartToBackend = createAsyncThunk(
  'cart/syncToBackend',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const { cartItems } = state.cart;
      const getStateFn = () => state;

      // Clear existing cart and add all items
      await cartService.clear(getStateFn);

      // Add each item to backend
      for (const item of cartItems) {
        await cartService.add(getStateFn, {
          productId: item.productId,
          quantity: item.quantity,
          price: item.price
        });
      }

      return cartItems;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const clearCartFromBackend = createAsyncThunk(
  'cart/clearFromBackend',
  async (_, { getState, rejectWithValue }) => {
    try {
      const getStateFn = () => getState();
      await cartService.clear(getStateFn);
      return [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addToCartWithBackendSync = createAsyncThunk(
  'cart/addToCartWithBackendSync',
  async (item, { getState, rejectWithValue }) => {
    try {
      const getStateFn = () => getState();
      const updatedCart = await cartService.add(getStateFn, {
        productId: item.id,
        quantity: item.quantity ?? 1,
        price: item.price,
      });
      return updatedCart;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Helper to map backend cart items to frontend shape
const mapBackendCartToItems = (backendCart) =>
  (backendCart || []).map((item) => ({
    itemId: item._id,
    productId: item.product?._id || item.product,
    title: item.product?.name || item.product?.title,
    price: item.product?.offeredPrice ?? item.price,
    image: item.product?.images?.[0] || item.product?.image,
    quantity: item.quantity,
  }));

export const removeFromCartWithBackendSync = createAsyncThunk(
  'cart/removeFromCartWithBackendSync',
  async (itemId, { getState, rejectWithValue }) => {
    try {
      const getStateFn = () => getState();
      const updatedCart = await cartService.remove(getStateFn, itemId);
      return updatedCart;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateCartItemQuantityWithBackendSync = createAsyncThunk(
  'cart/updateCartItemQuantityWithBackendSync',
  async ({ itemId, quantity }, { getState, rejectWithValue }) => {
    try {
      const getStateFn = () => getState();
      const updatedCart = await cartService.update(getStateFn, itemId, quantity);
      return updatedCart;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload; // { id, title, price, image }
      const existingItem = state.cartItems.find(i => i.productId === item.id);

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.cartItems.push({
          productId: item.id,
          title: item.name,
          price: item.price,
          image: item.image,
          quantity: 1
        });
      }

      state.totalQuantity += 1;
      state.totalAmount += item.price;
    },
    removeFromCart: (state, action) => {
      const productId = action.payload;
      const item = state.cartItems.find(i => i.productId === productId);

      if (item) {
        state.totalQuantity -= item.quantity;
        state.totalAmount -= item.price * item.quantity;
        state.cartItems = state.cartItems.filter(i => i.productId !== productId);
      }
    },
    decreaseQuantity: (state, action) => {
      const productId = action.payload;
      const item = state.cartItems.find(i => i.productId === productId);

      if (item && item.quantity > 1) {
        item.quantity -= 1;
        state.totalQuantity -= 1;
        state.totalAmount -= item.price;
      } else if (item && item.quantity === 1) {
        state.cartItems = state.cartItems.filter(i => i.productId !== productId);
        state.totalQuantity -= 1;
        state.totalAmount -= item.price;
      }
    },
    clearCart: (state) => {
      state.cartItems = [];
      state.totalQuantity = 0;
      state.totalAmount = 0;
    },
    setCartFromBackend: (state, action) => {
      const backendCart = action.payload;
      state.cartItems = backendCart.map(item => ({
        itemId: item._id,
        productId: item.product._id || item.product,
        title: item.product.name || item.product.title,
        price: item.product?.offeredPrice ?? item.price,
        image: item.product.images?.[0] || item.product.image,
        quantity: item.quantity
      }));

      // Recalculate totals
      state.totalQuantity = state.cartItems.reduce((total, item) => total + item.quantity, 0);
      state.totalAmount = state.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch cart from backend
      .addCase(fetchCartFromBackend.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCartFromBackend.fulfilled, (state, action) => {
        state.loading = false;
        const backendCart = action.payload;
        state.cartItems = backendCart.map(item => ({
          itemId: item._id,
          productId: item.product._id || item.product,
          title: item.product.name || item.product.title,
          price: item.product?.offeredPrice ?? item.price,
          image: item.product.images?.[0] || item.product.image,
          quantity: item.quantity
        }));

        // Recalculate totals
        state.totalQuantity = state.cartItems.reduce((total, item) => total + item.quantity, 0);
        state.totalAmount = state.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
      })
      .addCase(fetchCartFromBackend.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Sync cart to backend
      .addCase(syncCartToBackend.pending, (state) => {
        state.loading = true;
      })
      .addCase(syncCartToBackend.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(syncCartToBackend.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Clear cart from backend
      .addCase(clearCartFromBackend.pending, (state) => {
        state.loading = true;
      })
      .addCase(clearCartFromBackend.fulfilled, (state) => {
        state.loading = false;
        state.cartItems = [];
        state.totalQuantity = 0;
        state.totalAmount = 0;
      })
      .addCase(clearCartFromBackend.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add to cart with backend sync
      .addCase(addToCartWithBackendSync.pending, (state) => {
        state.loading = true;
      })
      .addCase(addToCartWithBackendSync.fulfilled, (state, action) => {
        state.loading = false;
        const backendCart = action.payload;
        state.cartItems = mapBackendCartToItems(backendCart);
        state.totalQuantity = state.cartItems.reduce((total, item) => total + item.quantity, 0);
        state.totalAmount = state.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
      })
      .addCase(addToCartWithBackendSync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Remove from cart with backend sync
      .addCase(removeFromCartWithBackendSync.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeFromCartWithBackendSync.fulfilled, (state, action) => {
        state.loading = false;
        const backendCart = action.payload;
        state.cartItems = mapBackendCartToItems(backendCart);
        state.totalQuantity = state.cartItems.reduce((total, item) => total + item.quantity, 0);
        state.totalAmount = state.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
      })
      .addCase(removeFromCartWithBackendSync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update cart item quantity with backend sync
      .addCase(updateCartItemQuantityWithBackendSync.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateCartItemQuantityWithBackendSync.fulfilled, (state, action) => {
        state.loading = false;
        const backendCart = action.payload;
        state.cartItems = mapBackendCartToItems(backendCart);
        state.totalQuantity = state.cartItems.reduce((total, item) => total + item.quantity, 0);
        state.totalAmount = state.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
      })
      .addCase(updateCartItemQuantityWithBackendSync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { addToCart, removeFromCart, decreaseQuantity, clearCart, setCartFromBackend } = cartSlice.actions;
export default cartSlice.reducer;