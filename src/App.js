import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import HomePage from "./pages/homepage";
import Login from "./pages/login";
import Register from "./pages/register";
import Profile from "./pages/profile";
import ResetPassword from "./pages/resetpass";
import Admin from "./pages/adminUser.js";
import CategoryProductsPage from "./pages/categoryProductsPage.js";
import ProductPage from "./pages/productPage.js";
import Layout from "./components/layout";
import PageLoader from "./components/loading.js";
import SnackbarAlert from "./components/snackbarAlert.js";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "./store/slices/authSlice.js"; 
import { jwtDecode } from "jwt-decode";
import AddProduct from "./pages/addProduct.js";

const App = () => {
  const { user, loading } = useSelector((state) => state.auth);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("info");

  const storedUser = JSON.parse(localStorage.getItem('user'));
  let isAdmin = false;
  let isApproved = false;

  useEffect(() => {
    if (storedUser?.token || user?.token) {
      try {
        const decoded = jwtDecode(storedUser.token || user?.token);
        const isTokenExpired = decoded.exp * 1000 < Date.now();

        if (isTokenExpired) {
          dispatch(logout());
          localStorage.removeItem("user");
          setSnackbarMessage("Session expired. Please log in again.");
          setSnackbarSeverity("warning");
          setSnackbarOpen(true);
        } else {
          isAdmin = decoded?.isAdmin;
          isApproved = decoded?.isApproved;
        }
      } catch (err) {
        console.error("Invalid token", err);
      }
    }
  }, [dispatch, storedUser, user]);

  if (storedUser?.token) {
    try {
      const decoded = jwtDecode(storedUser.token);
      isAdmin = decoded?.isAdmin;
      isApproved = decoded?.isApproved;
    } catch (err) {
      console.error("Invalid token on access check", err);
    }
  }

  return (
    <Layout>
      {loading && <PageLoader />}

      <SnackbarAlert
        open={snackbarOpen}
        setOpen={setSnackbarOpen}
        message={snackbarMessage}
        severity={snackbarSeverity}
      />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
        <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/admin" element={isAdmin ? <Admin /> : <Navigate to="/" />} />
        <Route path="/category/:category" element={<CategoryProductsPage isAdmin={user?.isAdmin} />} />
        <Route path="/category/:category/:subCategory" element={<CategoryProductsPage isAdmin={user?.isAdmin} />} />
        <Route path="/admin/add-product" element={isAdmin && <AddProduct />} />
        <Route path="/product/:id" element={<ProductPage />} />
      </Routes>
    </Layout>
  );
};

export default App;