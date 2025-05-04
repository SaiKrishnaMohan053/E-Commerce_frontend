import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API = process.env.REACT_APP_API_BASE_URL;

export const fetchWishlist = createAsyncThunk(
  'wishlist/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const token = JSON.parse(localStorage.getItem('user')).token;
      const { data } = await axios.get(
        `${API}/api/users/wishlist`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const addWishlistItem = createAsyncThunk(
  'wishlist/add',
  async (productId, { rejectWithValue }) => {
    try {
      const token = JSON.parse(localStorage.getItem('user')).token;
      const { data } = await axios.post(
        `${API}/api/users/wishlist/${productId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const removeWishlistItem = createAsyncThunk(
  'wishlist/remove',
  async (productId, { rejectWithValue }) => {
    try {
      const token = JSON.parse(localStorage.getItem('user')).token;
      const { data } = await axios.delete(
        `${API}/api/users/wishlist/${productId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const slice = createSlice({
  name: 'wishlist',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchWishlist.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.items = payload;
      })
      .addCase(fetchWishlist.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })

      .addCase(addWishlistItem.fulfilled, (state, { payload }) => {
        state.items = payload;
      })
      .addCase(removeWishlistItem.fulfilled, (state, { payload }) => {
        state.items = payload;
      });
  },
});

export default slice.reducer;