import React, { useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Box, Typography, Button, Divider, Stack, Skeleton, Alert } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { useNavigate, useLocation } from "react-router-dom";

import { resetOrderState, setCurrentOrder } from "../../store/slices/orderSlice";

const OrderSuccessPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { state } = useLocation();
  const locationOrder = state?.order || null; 
  const { current: reduxOrder, loading, error} = useSelector((state) => state.order);
  const order = locationOrder || reduxOrder;

  useEffect(() => {
    if (locationOrder) {
      dispatch(setCurrentOrder(locationOrder));
    }
    if (!order) {
      navigate("/");
    }
    return () => {
      dispatch(resetOrderState());
    };
  }, [dispatch, locationOrder, navigate]);

  useEffect(() => {
    window.scrollTo(0,0);
  }, []);  

  const total = useMemo(
    () => order.orderItems.reduce((sum, i) => sum + i.qty * i.price, 0),
    [order.orderItems]
  );
  
  if (loading) {
    return (
      <Box textAlign="center" py={6} px={2}>
        <Skeleton variant="circular" width={80} height={80} />
        <Skeleton variant="text" width="60%" height={40} sx={{ my: 2 }} />
        <Skeleton
          variant="rectangular"
          width="90%"
          height={200}
          sx={{ mx: "auto", my: 2 }}
        />
        <Skeleton variant="rectangular" width="40%" height={40} sx={{ mx: "auto" }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box maxWidth={500} mx="auto" py={6} px={2}>
        <Alert severity="error">
          {typeof error === "string" ? error : error.message || "Failed to load order details."}
        </Alert>
        <Box textAlign="center" mt={4}>
          <Button variant="contained" onClick={() => navigate("/orders")}>
            View My Orders
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box textAlign="center" py={6} px={2}>
      <CheckCircleOutlineIcon color="success" sx={{ fontSize: 80 }} />
      <Typography variant="h4" mt={2} mb={1}>
        Thank you for your order!
      </Typography>
      <Typography variant="subtitle1" mb={3}>
        Your order <strong>{order.orderNumber}</strong> has been placed successfully.
      </Typography>

      <Divider sx={{ my: 3 }} />

      <Box textAlign="left" maxWidth={{ xs: '100%', sm: 500 }} mx="auto">
        <Typography variant="h6">Order Details</Typography>
        <Typography>
          <strong>Method:</strong> {order.orderMethod === "pickup" ? "Pick Up" : "Delivery"}
        </Typography>
        {order.orderMethod === "delivery" && (
          <Typography>
            <strong>Address:</strong> {order.shippingAddress.address}
          </Typography>
        )}
        <Typography>
          <strong>Items:</strong>
        </Typography>
        {order.orderItems.map((item) => (
          <Box key={item.product} display="flex" justifyContent="space-between" my={1}>
            <Typography>
              {item.name} x {item.qty}
            </Typography>
            <Typography>${(item.qty * item.price).toFixed(2)}</Typography>
          </Box>
        ))}
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" textAlign="right">
          Total: ${total.toFixed(2)}
        </Typography>
      </Box>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
        <Button aria-label="Continue Shopping" autoFocus variant="contained" size="large" onClick={() => navigate("/")}>
          Continue Shopping
        </Button>
        <Button
          aria-label="View Order Details"
          variant="outlined"
          size="large"
          onClick={() => navigate(`/orders/${order._id}`)}
        >
          View Order Details
        </Button>
      </Stack>
    </Box>
  );
};

export default OrderSuccessPage;