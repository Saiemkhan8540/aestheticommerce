import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import favoritesService from './favoritesService';

// Async thunks for backend persistence
export const fetchFavoritesFromBackend = createAsyncThunk(
  'favorites/fetchFromBackend',
  async (_, { getState, rejectWithValue }) => {
    try {
      const getStateFn = () => getState();
      const favoritesData = await favoritesService.getAll(getStateFn);
      return favoritesData;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addFavoriteToBackend = createAsyncThunk(
  'favorites/addToBackend',
  async (productId, { getState, rejectWithValue }) => {
    try {
      const getStateFn = () => getState();
      const favoritesData = await favoritesService.add(getStateFn, productId);
      return favoritesData;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const removeFavoriteFromBackend = createAsyncThunk(
  'favorites/removeFromBackend',
  async (productId, { getState, rejectWithValue }) => {
    try {
      const getStateFn = () => getState();
      const favoritesData = await favoritesService.remove(getStateFn, productId);
      return favoritesData;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  items: [],
  loading: false,
  error: null
};

const getFavoriteId = (favorite) => {
  if (!favorite) return null;
  return typeof favorite === 'object' ? favorite._id : favorite;
};

const normalizeFavoriteIds = (favorites = []) =>
  favorites.map(getFavoriteId).filter(Boolean);

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    toggleFavorite: (state, action) => {
      const id = action.payload;
      if (state.items.includes(id)) {
        state.items = state.items.filter(item => item !== id);
      } else {
        state.items.push(id);
      }
    },
    setFavoritesFromBackend: (state, action) => {
      state.items = normalizeFavoriteIds(action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch favorites from backend
      .addCase(fetchFavoritesFromBackend.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFavoritesFromBackend.fulfilled, (state, action) => {
        state.loading = false;
        state.items = normalizeFavoriteIds(action.payload);
      })
      .addCase(fetchFavoritesFromBackend.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add favorite to backend
      .addCase(addFavoriteToBackend.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addFavoriteToBackend.fulfilled, (state, action) => {
        state.loading = false;
        state.items = normalizeFavoriteIds(action.payload);
      })
      .addCase(addFavoriteToBackend.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Remove favorite from backend
      .addCase(removeFavoriteFromBackend.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFavoriteFromBackend.fulfilled, (state, action) => {
        state.loading = false;
        state.items = normalizeFavoriteIds(action.payload);
      })
      .addCase(removeFavoriteFromBackend.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { toggleFavorite, setFavoritesFromBackend } = favoritesSlice.actions;
export default favoritesSlice.reducer;
