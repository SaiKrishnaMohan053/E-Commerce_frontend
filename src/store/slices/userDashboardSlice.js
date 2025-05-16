import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

export const fetchAds = createAsyncThunk(
  "userDashboard/fetchAds",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${API_BASE}/api/admin/getAds`);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchDashboardData = createAsyncThunk(
  "userDashboard/fetchDashboardData",
  async (
    {
      sellersLimit = 20,
      dealsLimit = 10,
      arrivalsLimit = 10,
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const { data } = await axios.get(
        `${API_BASE}/api/products/getDashboard?sellersLimit=${sellersLimit}&dealsLimit=${dealsLimit}&arrivalsLimit=${arrivalsLimit}`
      );
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const userDashboardSlice = createSlice({
  name: "userDashboard",
  initialState: {
    ads: [],
    topSellers: [],
    deals: [],
    newArrivals: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAds.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAds.fulfilled, (state, action) => {
        state.loading = false;
        state.ads = action.payload;
      })
      .addCase(fetchAds.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.topSellers = action.payload.topSellers;
        state.deals = action.payload.deals;
        state.newArrivals = action.payload.newArrivals;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default userDashboardSlice.reducer;