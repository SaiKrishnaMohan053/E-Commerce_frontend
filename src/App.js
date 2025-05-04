import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { jwtDecode } from "jwt-decode";

import Layout from "./components/layout";
import PageLoader from "./components/loading.js";
import { showAlert } from "./store/slices/alertSlice.js";
import HomePage from "./pages/homepage";
import Login from "./pages/userPages/login.js";
import Register from "./pages/userPages/register.js";
import Profile from "./pages/userPages/profile.js";
import ResetPassword from "./pages/userPages/resetpass.js";
import CategoryProductsPage from "./pages/productPages/categoryProductsPage.js";
import ProductPage from "./pages/productPages/productPage.js";
import CartPage from "./pages/orderPages/cartPage.js";
import WishlistPage from "./pages/userPages/wishlistPage.js";
import CheckoutPage from "./pages/orderPages/checkoutPage.js";
import OrderSuccessPage from "./pages/orderPages/orderSuccessPage.js";
import OrdersPage from "./pages/orderPages/ordersPage.js";
import OrderDetailPage from "./pages/orderPages/orderDetailPage.js";
import Admin from "./pages/adminPages/adminUser.js";
import AdminOrder from "./pages/adminPages/adminOrder.js";
import AddProduct from "./pages/adminPages/addProduct.js";
import { logout } from "./store/slices/authSlice.js"; 


const App = () => {
  const { user, loading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const storedUser = JSON.parse(localStorage.getItem('user'));
  let isAdmin = false;
  let isApproved = false;

  if (storedUser?.token) {
    try {
      const decoded = jwtDecode(storedUser.token);
      isAdmin = decoded?.isAdmin;
      isApproved = decoded?.isApproved;
    } catch (err) {
      dispatch(showAlert("Invalid token", "error"));
    }
  }

  useEffect(() => {
    if (storedUser?.token || user?.token) {
      try {
        const decoded = jwtDecode(storedUser.token || user?.token);
        const isTokenExpired = decoded.exp * 1000 < Date.now();

        if (isTokenExpired) {
          dispatch(logout());
          localStorage.removeItem("user");
          dispatch(showAlert("Session expired. Please log in again.", "warning"));
        } else {
          isAdmin = decoded?.isAdmin;
          isApproved = decoded?.isApproved;
        }
      } catch (err) {
        dispatch(showAlert("Invalid token", "error"));
      }
    }
  }, [dispatch, storedUser, user]);

  return (
    <Layout>
      {loading && <PageLoader />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
        <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/admin" element={isAdmin ? <Admin /> : <Navigate to="/" />} />
        <Route path="/admin/orders" element={isAdmin ? <AdminOrder /> : <Navigate to="/" />} />
        <Route path="/category/:category" element={<CategoryProductsPage isAdmin={user?.isAdmin} />} />
        <Route path="/category/:category/:subCategory" element={<CategoryProductsPage isAdmin={user?.isAdmin} />} />
        <Route path="/admin/add-product" element={isAdmin && <AddProduct />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order-success" element={<OrderSuccessPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/orders/:id" element={<OrderDetailPage />} />
      </Routes>
    </Layout>
  );
};

export default App;