import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;


export const fetchUserProfile = createAsyncThunk('user/fetchUserProfile',
  async (token, thunkAPI) => {
    console.log('Thunk received token:', token); // Add this
    try {
      const profile = await axios.get(`${API_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` }

      });
      return profile.data.user;
    } catch (error) {

      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');

    }

  }
);

export const updateUserProfile = createAsyncThunk(
  'user/updateUserProfile',
  async (userData, thunkAPI) => {

    try {

      const state = thunkAPI.getState();
      const token = state.user.token;

      const res = await axios.put(
        `${API_URL}/users/update-profile`,
        userData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      return res.data.user;

    } catch (error) {

      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 'Failed to update profile'
      );

    }

  }
);

//update avatar 
export const updateAvatar = createAsyncThunk(
  'user/updateAvatar',
  async (formData, thunkAPI) => {
    try {
      const state = thunkAPI.getState();
      const token = state.user.token; // Make sure token is stored in your user slice
      const res = await axios.put(`${API_URL}/users/avatar`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      return res.data; // Backend should return { avatar: 'url-to-avatar' }
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to update avatar');
    }
  }
);

const initialState = {
  profile: null,
  status: 'idle',
  error: null
}

const userSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.profile = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
       // updateAvatar
    builder
      .addCase(updateAvatar.fulfilled, (state, action) => {
        if (state.profile) {
          state.profile.avatar = action.payload.avatar; // update avatar URL in profile
        }
      });

      builder
  .addCase(updateUserProfile.pending, (state) => {
    state.status = 'loading';
  })
  .addCase(updateUserProfile.fulfilled, (state, action) => {
    state.status = 'succeeded';
    state.profile = action.payload; 
  })
  .addCase(updateUserProfile.rejected, (state, action) => {
    state.status = 'failed';
    state.error = action.payload;
  });
  }
});

export default userSlice.reducer;