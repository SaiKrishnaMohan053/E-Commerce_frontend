import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

const isTokenExpired = (token) => {
  try {
    const decoded = jwtDecode(token);
    return decoded.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

let user = JSON.parse(localStorage.getItem("user"));
if (user?.token && isTokenExpired(user.token)) {
  console.log("Token expired. Logging out user.");
  localStorage.removeItem("user");
  user = null;
}

const setAuthHeader = (token) => {
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common["Authorization"];
  }
};

const getUserIdFromToken = (token) => {
  try {
    const decoded = jwtDecode(token);    
    return decoded?.id || null;
  } catch (error) {
    return null;
  }
};

export const loginUser = createAsyncThunk("auth/login", async (userData, { rejectWithValue }) => {
  try {
    const { data } = await axios.post(`${API_BASE_URL}/api/users/login`, userData);
    localStorage.setItem("user", JSON.stringify(data));
    setAuthHeader(data.token);
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Login failed. Please try again.");
  }
});

export const registerUser = createAsyncThunk("auth/register", async (userData, { rejectWithValue }) => {
  try {
    const formData = new FormData();
    Object.keys(userData).forEach((key) => {
      formData.append(key, userData[key]);
    });

    const { data } = await axios.post(`${API_BASE_URL}/api/users/register`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Registration failed. Please check your details.");
  }
});

export const forgotPassword = createAsyncThunk("auth/forgotPassword", async (email, { rejectWithValue }) => {
  try {
    const { data } = await axios.post(`${API_BASE_URL}/api/users/forgot-password`, { email });
    return data.message;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to send reset link. Try again.");
  }
});

export const resetPassword = createAsyncThunk("auth/resetPassword", async ({ token, newPassword }, { rejectWithValue }) => {
  try {
    const { data } = await axios.post(`${API_BASE_URL}/api/users/reset-password`, { resetToken: token, newPassword });
    return data.message;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Password reset failed. Try again.");
  }
});

export const fetchUserProfile = createAsyncThunk("auth/fetchProfile", async (userIdFromParams, { rejectWithValue, getState }) => {
  try {
    const { auth } = getState();
    let token = auth.user?.token;

    if (!token) {
      const localUser = JSON.parse(localStorage.getItem("user"));
      token = localUser?.token;
    }

    if (!token) throw new Error("User token is missing");

    const userId = userIdFromParams || getUserIdFromToken(token);
    if (!userId) throw new Error("User ID not found in token or param.");

    const { data } = await axios.get(`${API_BASE_URL}/api/users/profile/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
      
    return data;
  } catch (error) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch profile."
    );
  }
});
  
export const updateUserProfile = createAsyncThunk("auth/updateProfile", async (userData, { rejectWithValue, getState }) => {
  try {
    const authState = getState().auth;
    let user = authState.user;
  
    if (!user || !user.token) {
      user = JSON.parse(localStorage.getItem("user"));
      if (!user || !user.token) {
        throw new Error("User authentication token is missing.");
      }
    }
  
    const userId = getUserIdFromToken(user.token);
  
    if (!userId) throw new Error("User ID not found in token.");
    const response = await axios.put(`${API_BASE_URL}/api/users/profile/`, userData, {
      headers: { Authorization: `Bearer ${user.token}` },
    });
  
    if (!response.data || !response.data.message) {
      throw new Error("Invalid response from server.");
    }
  
    const updatedUser = { ...user, ...userData };
    localStorage.setItem("user", JSON.stringify(updatedUser));
  
    return updatedUser;
  } catch (error) {
    console.error("Profile Update Error:", error.response?.data || error.message);
    return rejectWithValue(error.response?.data?.message || "Profile update failed.");
  }
});       

export const logoutUser = () => (dispatch) => {
  localStorage.removeItem("user");
  setAuthHeader(null);
  dispatch(logout());
};

export const fetchUsers = createAsyncThunk("admin/fetchUsers", async (_, { rejectWithValue }) => {
  try {
    const token = JSON.parse(localStorage.getItem("user"))?.token;
    const { data } = await axios.get(`${API_BASE_URL}/api/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to fetch users.");
  }
});

export const approveUser = createAsyncThunk("admin/approveUser", async (userId, { rejectWithValue }) => {
  try {
    const token = JSON.parse(localStorage.getItem("user"))?.token;
    await axios.put(`${API_BASE_URL}/api/users/approve/${userId}`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return userId;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to approve user.");
  }
});

export const rejectUser = createAsyncThunk("admin/rejectUser", async ({ userId, reason }, { rejectWithValue }) => {
  try {
    const token = JSON.parse(localStorage.getItem("user"))?.token;
    await axios.delete(`${API_BASE_URL}/api/users/reject-user/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { reason }, 
    });
    return userId;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to reject user.");
  }
});

export const deleteUser = createAsyncThunk("admin/deleteUser", async (userId, { rejectWithValue }) => {
  try {
    const token = JSON.parse(localStorage.getItem("user"))?.token;
    await axios.delete(`${API_BASE_URL}/api/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return userId;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to delete user.");
  }
});

export const editUser = createAsyncThunk("admin/editUser", async (userData, { rejectWithValue }) => {
  try {
    const token = JSON.parse(localStorage.getItem("user"))?.token;
    const { data } = await axios.put(`${API_BASE_URL}/api/users/${userData._id}`, userData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to edit user.");
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user,
    loading: false,
    error: null,
    message: null, 
    users: [],
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.message = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearMessage: (state) => {
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })      
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.message = "Profile updated successfully!";
        state.user = action.payload;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(approveUser.fulfilled, (state, action) => {
        state.users = state.users.map(user =>
          user._id === action.payload ? { ...user, isApproved: true } : user
        );
      })
      .addCase(rejectUser.fulfilled, (state, action) => {
        state.users = state.users.filter(user => user._id !== action.payload);
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter(user => user._id !== action.payload);
      })
      .addCase(editUser.fulfilled, (state, action) => {
        state.users = state.users.map(user =>
          user._id === action.payload._id ? action.payload : user
        );
      })      
  },
});

export const { logout, clearError, clearMessage } = authSlice.actions;
export default authSlice.reducer;