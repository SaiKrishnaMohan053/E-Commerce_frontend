import axios from "axios";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { logout } from "./authSlice";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

const initialState = {
  items: [],
  totalItems: 0,
  fetchLoading: false,
  updateLoading: false,
  removeLoading: false,
  error: null,
};

export const fetchCart = createAsyncThunk(
  "cart/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const token = JSON.parse(localStorage.getItem("user"))?.token;
      const { data } = await axios.get(`${API_BASE_URL}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data;
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || "Failed to fetch cart",
        status: error.response?.status || 500,
      });
    }
  }
);

export const addToCart = createAsyncThunk(
  "cart/addItem",
  async ({ productId, flavor, qty, price }, { rejectWithValue }) => {
    try {
      const token = JSON.parse(localStorage.getItem("user"))?.token;
      const payload = {
        productId,
        qty: qty,
        price: parseFloat(price),
        ...(flavor ? { flavor } : {}),
      };
      const { data } = await axios.post(
        `${API_BASE_URL}/api/cart/add`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return data;
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || "Failed to add to cart",
        status: error.response?.status || 500,
      });
    }
  }
);

export const updateCartItem = createAsyncThunk(
  "cart/updateItem",
  async ({ productId, flavor, qty }, { rejectWithValue }) => {
    try {
      const token = JSON.parse(localStorage.getItem("user"))?.token;
      const { data } = await axios.put(
        `${API_BASE_URL}/api/cart/update`,
        { productId, flavor, qty },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return data;
    } catch (error) {
      return rejectWithValue({ message: error.response?.data?.message });
    }
  }
);

export const removeCartItem = createAsyncThunk(
  "cart/removeItem",
  async ({ productId, flavor }, { rejectWithValue }) => {
    try {
      const token = JSON.parse(localStorage.getItem("user"))?.token;
      const { data } = await axios.delete(
        `${API_BASE_URL}/api/cart/remove`,
        {
          data: { productId, flavor },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return data;
    } catch (error) {
      return rejectWithValue({ message: error.response?.data?.message });
    }
  }
);

export const clearCart = createAsyncThunk(
  "cart/clear",
  async (_, { rejectWithValue }) => {
    try {
      const token = JSON.parse(localStorage.getItem("user"))?.token;
      const { data } = await axios.post(
        `${API_BASE_URL}/api/cart/clear`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return data;
    } catch (error) {
      return rejectWithValue({ message: error.response?.data?.message });
    }
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.fetchLoading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, { payload }) => {
        state.fetchLoading = false;
        state.items = payload.items || [];
        state.totalItems = state.items.reduce((sum, i) => sum + i.qty, 0);
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.fetchLoading = false;
        state.error = action.payload || {message: "Failed to fetch cart"};
      })
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.totalItems = action.payload.totalItems;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: "Failed to add to cart" };
      })
      .addCase(updateCartItem.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(updateCartItem.fulfilled, (state, { payload }) => {
        state.updateLoading = false;
        state.items = payload.items || [];
        state.totalItems = state.items.reduce((sum, i) => sum + i.qty, 0);
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload || { message: "Failed to update cart item" };
      })
      .addCase(removeCartItem.pending, (state) => {
        state.removeLoading = true;
        state.error = null;
      })
      .addCase(removeCartItem.fulfilled, (state, { payload }) => {
        state.removeLoading = false;
        state.items = payload.items || [];
        state.totalItems = state.items.reduce((sum, i) => sum + i.qty, 0);
      })
      .addCase(removeCartItem.rejected, (state, action) => {
        state.removeLoading = false;
        state.error = action.payload || { message: "Failed to remove cart item" };
      })
      .addCase(clearCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearCart.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.items = payload.items || [];
        state.totalItems = 0;
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: "Failed to clear cart" };
      })
      .addCase(logout, () => initialState);
  },
});

export default cartSlice.reducer;