import axios from "axios";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

export const createProduct = createAsyncThunk(
  "products/create",
  async (formData, { rejectWithValue }) => {
    try {
      const token = JSON.parse(localStorage.getItem("user"))?.token;
      const { data } = await axios.post(`${API_BASE_URL}/api/products/addProduct`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      return data;
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || "Failed to create product",
        status: error.response?.status || 500,
      });      
    }
  }
);

export const fetchProductsByCategory = createAsyncThunk(
  "products/fetchByCategory",
  async ({ category, subCategories, sort, excludeId }, { rejectWithValue }) => {
    try {
      let query = `${API_BASE_URL}/api/products/getProducts?category=${encodeURIComponent(category)}`;
      if (subCategories) query += `&subCategories=${encodeURIComponent(subCategories)}`;
      if (sort) query += `&sort=${sort}`;
      if (excludeId) query += `&excludeId=${excludeId}`;

      const { data } = await axios.get(query);
      console.log("Fetched Products:", data);
      
      return data;
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || "Failed to fetch products by category",
        status: error.response?.status || 500,
      });      
    }
  }
);

export const fetchSingleProduct = createAsyncThunk(
  "product/fetchSingle",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/products/getProductById/${id}`);
      return data;
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || "Failed to fetch product",
        status: error.response?.status || 500,
      });      
    }
  }
);

export const deleteProductById = createAsyncThunk(
  "products/delete",
  async (id, { rejectWithValue }) => {
    try {
      const token = JSON.parse(localStorage.getItem("user"))?.token;
      await axios.delete(`${API_BASE_URL}/api/products/deleteProduct/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return id;
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || "Failed to delete product",
        status: error.response?.status || 500,
      });      
    }
  }
);

export const updateProductStock = createAsyncThunk(
  "products/updateStock",
  async ({ id, name, stock }, { rejectWithValue }) => {
    try {
      const token = JSON.parse(localStorage.getItem("user"))?.token;
      const payload = name ? { name, stock } : { stock };
      const { data } = await axios.put(
        `${API_BASE_URL}/api/products/updateStock/${id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return data;
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || "Failed to update product stock",
        status: error.response?.status || 500,
      });      
    }
  }
);

export const editProductDetails = createAsyncThunk(
  "products/edit",
  async (payload, { rejectWithValue }) => {
    try {
      const token = JSON.parse(localStorage.getItem("user"))?.token;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const { data } = await axios.put(
        `${API_BASE_URL}/api/products/editProduct/${payload.get("_id") || payload._id}`,
        payload,
        config
      );
      return data;
    } catch (error) {
      console.error("Edit Error:", error.response?.data);
      return rejectWithValue({
        message: error.response?.data?.message || "Failed to edit product",
        status: error.response?.status || 500,
      });      
    }
  }
);

const productSlice = createSlice({
  name: "product",
  initialState: {
    products: [],
    loading: false,
    error: null,
    selectedProduct: null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductsByCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductsByCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products || [];
      })
      .addCase(fetchProductsByCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteProductById.fulfilled, (state, action) => {
        state.products = state.products.filter((p) => p._id !== action.payload);
      })
      .addCase(updateProductStock.fulfilled, (state, action) => {
        state.products = state.products.map((p) =>
          p._id === action.payload._id ? action.payload : p
        );
      })
      .addCase(editProductDetails.fulfilled, (state, action) => {
        state.products = state.products.map((p) =>
          p._id === action.payload._id ? action.payload : p
        );
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.products.push(action.payload);
      }) 
      .addCase(fetchSingleProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSingleProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProduct = action.payload;
      })
      .addCase(fetchSingleProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })         
  },
});

export default productSlice.reducer;