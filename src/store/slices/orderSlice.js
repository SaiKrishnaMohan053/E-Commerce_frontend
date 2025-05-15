import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

export const placeOrder = createAsyncThunk(
  "order/place",
  async (orderData, { rejectWithValue }) => {
    try {
      const token = JSON.parse(localStorage.getItem("user"))?.token;    
      const { data } = await axios.post(
        `${API_BASE_URL}/api/orders/addOrder`,
        orderData,
        { headers: { Authorization: `Bearer ${token}` } }
      ); 
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data.message || err.message);
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  "order/updateStatus",
  async ({ orderId, status }, { rejectWithValue }) => {
    try {
      const token = JSON.parse(localStorage.getItem("user"))?.token;
      const { data } = await axios.patch(
        `${API_BASE_URL}/api/orders/updateOrderStatus/${orderId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return { orderId, status: data.status };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const uploadInvoice = createAsyncThunk(
  "order/uploadInvoice",
  async ({ orderId, file }, { rejectWithValue }) => {
    try {
      const token = JSON.parse(localStorage.getItem("user"))?.token;
      const formData = new FormData();
      formData.append("invoice", file);

      const { data } = await axios.post(
        `${API_BASE_URL}/api/orders/uploadInvoice/${orderId}/invoice`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return { orderId, invoiceUrl: data.invoiceUrl };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchMyOrders = createAsyncThunk(
  "orders/fetchMyOrders",
  async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const token = JSON.parse(localStorage.getItem("user"))?.token;
      const { data } = await axios.get(
        `${API_BASE_URL}/api/orders/getMyOrders?page=${page}&limit=${limit}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchOrderById = createAsyncThunk(
  "order/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const token = JSON.parse(localStorage.getItem("user"))?.token;
      const { data } = await axios.get(
        `${API_BASE_URL}/api/orders/getOrderById/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data.message || err.message);
    }
  }
);

export const fetchAllOrders = createAsyncThunk(
  "order/fetchAll",
  async ({ page = 1, limit = 10, status = "" }, { rejectWithValue }) => {
    try {
      const token = JSON.parse(localStorage.getItem("user"))?.token;
      const qs = new URLSearchParams({ page, limit, ...(status && { status }) });

      const { data } = await axios.get(
        `${API_BASE_URL}/api/orders/getOrders?${qs}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const cancelOrder = createAsyncThunk(
  "order/cancel",
  async (orderId, { rejectWithValue }) => {
    try {
      const token = JSON.parse(localStorage.getItem("user"))?.token;
      const { data } = await axios.patch(
        `${API_BASE_URL}/api/orders/cancelOrder/${orderId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return { orderId, status: data.status };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const orderSlice = createSlice({
  name: "order",
  initialState: {
    current: null,
    adjustments: [],
    myOrders: [],
    allOrders: [],
    page: 1,
    totalPages: 1,
    totalOrders: 0,
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    clearAdjustments: (state) => {
      state.adjustments = [];
    },
    resetOrderState: (state) => {
      state.current = null;
      state.success = false;
      state.error = null;
      state.loading = false;
      state.adjustments = [];
    },
    setCurrentOrder: (state, action) => {
      state.current = action.payload;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(placeOrder.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
        state.adjustments = [];
      })
      .addCase(placeOrder.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.current = payload.order;
        state.adjustments = payload.adjustments || [];
        state.success = true;
        state.error = null;
      })
      .addCase(placeOrder.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })

      .addCase(fetchMyOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyOrders.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.myOrders = payload.orders || [];
        state.page = payload.page;
        state.totalPages = payload.totalPages;
        state.totalOrders = payload.totalOrders;
      })
      .addCase(fetchMyOrders.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.current = payload;
      })
      .addCase(fetchOrderById.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(fetchAllOrders.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllOrders.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.allOrders    = payload.orders || [];
        state.page         = payload.page;
        state.totalPages   = payload.totalPages;
        state.totalOrders  = payload.totalOrders;
      })
      .addCase(fetchAllOrders.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(updateOrderStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, { payload }) => {
        state.loading = false;
        if (state.current && state.current._id === payload.orderId) {
          state.current.status = payload.status;
        }
      })
      .addCase(updateOrderStatus.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(uploadInvoice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadInvoice.fulfilled, (state, { payload }) => {
        state.loading = false;
        if (state.current && state.current._id === payload.orderId) {
          state.current.invoiceUrl = payload.invoiceUrl;
        }
      })
      .addCase(uploadInvoice.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(cancelOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelOrder.fulfilled, (state, { payload }) => {
        state.loading = false;
        const { orderId, status } = payload;
        if (state.current?._id === orderId) {
          state.current.status = status;
        }
        state.myOrders = state.myOrders.map((o) =>
          o._id === orderId ? { ...o, status } : o
        );
      })
      .addCase(cancelOrder.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
  },
});

export const { resetOrderState, setCurrentOrder, clearAdjustments } = orderSlice.actions;
export default orderSlice.reducer;