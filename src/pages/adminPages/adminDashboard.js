import React, { useEffect, useState } from "react";
import { Box, Typography, Button, Stack, Badge } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import AdminUserManagement from "./adminUser";
import AdminOrderManagement from "./adminOrder";
import AdminAnalytics from "./adminAnalytics";
import { fetchUsers } from "../../store/slices/authSlice";

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const unapprovedCount = useSelector((state) => state.auth.unapprovedCount);

  const [activeTab, setActiveTab] = useState("users");

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Welcome Admin
      </Typography>

      <Stack direction="row" spacing={2} mb={3}>
        <Badge badgeContent={unapprovedCount} color="error" invisible={unapprovedCount === 0} overlap="rectangular">
          <Button
            variant={activeTab === "users" ? "contained" : "outlined"}
            onClick={() => setActiveTab("users")}
          >
            Users
          </Button>
        </Badge>        
        <Button
          variant={activeTab === "orders" ? "contained" : "outlined"}
          onClick={() => setActiveTab("orders")}
        >
          Orders
        </Button>
        <Button
          variant={activeTab === "analytics" ? "contained" : "outlined"}
          onClick={() => setActiveTab("analytics")}
        >
          Analytics
        </Button>
      </Stack>

      {activeTab === "users" && <AdminUserManagement />}
      {activeTab === "orders" && <AdminOrderManagement />}
      {activeTab === "analytics" && <AdminAnalytics />}
    </Box>
  );
};

export default AdminDashboard;