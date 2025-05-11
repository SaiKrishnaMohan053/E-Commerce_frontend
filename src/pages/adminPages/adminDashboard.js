import React, { useState } from "react";
import { Box, Typography, Button, Stack } from "@mui/material";
import AdminUserManagement from "./adminUser";
import AdminOrderManagement from "./adminOrder";
import AdminAnalytics from "./adminAnalytics";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("users");

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Welcome Admin
      </Typography>

      <Stack direction="row" spacing={2} mb={3}>
        <Button
          variant={activeTab === "users" ? "contained" : "outlined"}
          onClick={() => setActiveTab("users")}
        >
          Users
        </Button>
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