import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/homepage";
import Login from "./pages/login";
import Register from "./pages/register";
import Profile from "./pages/profile";
import ResetPassword from "./pages/resetpass";
import Admin from "./pages/admin";
import Layout from "./components/layout";
import PageLoader from "./components/loading.js";
import { useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";

const App = () => {
  const { user, loading } = useSelector((state) => state.auth);

  let isAdmin = false;
  let isApproved = false;

  if (user?.token) {
    try {
      const decoded = jwtDecode(user.token);
      isAdmin = decoded?.isAdmin;
      isApproved = decoded?.isApproved;
    } catch (err) {
      console.error("Invalid token", err);
    }
  }

  return (
    <Layout>
      {/* Global Full Page Loader */}
      {loading && <PageLoader />}

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
        <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/admin" element={isAdmin ? <Admin /> : <Navigate to="/" />} />
      </Routes>
    </Layout>
  );
};

export default App;