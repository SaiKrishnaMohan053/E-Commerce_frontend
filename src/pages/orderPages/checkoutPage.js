import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  RadioGroup,
  FormControlLabel,
  Radio,
  Skeleton,
  Alert,
} from "@mui/material";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

import { fetchUserProfile } from "../../store/slices/authSlice";
import { placeOrder, clearAdjustments } from "../../store/slices/orderSlice";
import { clearCart, fetchCart } from "../../store/slices/cartSlice";
import { showAlert } from "../../store/slices/alertSlice";

const CheckoutPage = () => {
  const dispatch = useDispatch();
  const Navigate = useNavigate();
  const { items = [] } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  const { loading, error } = useSelector((state) => state.order);
    
  const [address, setAddress] = useState("");
  const [orderMethod, setOrderMethod] = useState("pickup");
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    dispatch(fetchCart());
    if (user?.token) {
      try {
        const { id: userId } = jwtDecode(user.token);
        dispatch(fetchUserProfile(userId));
      } catch (err) {
        dispatch(showAlert({ message: err.message, severity: "error" }));
      }
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (user?.address) setAddress(user.address);
  }, [user]);

  const totalPrice = useMemo(
    () => items.reduce((sum, i) => sum + i.qty * i.price, 0),
    [items]
  );  

  const handlePlaceOrder = async () => {
    const orderItems = items.map((i) => ({
      name: i.productId.name,
      qty: i.qty,
      flavor: i.flavor,
      price: i.price,
      image: i.productId.images[0],
      product: i.productId._id,
    }));

    const orderData = {
      orderItems,
      orderMethod: orderMethod,
      shippingAddress: { address },
    };
  
    const resAction = await dispatch(placeOrder(orderData));

    if (placeOrder.fulfilled.match(resAction)) {
      const { order, adjustments = [] } = resAction.payload;

      if (adjustments.length > 0) {
        const messages = adjustments.map((adj) => {
          const name = items.find(
            (it) => it.productId._id === adj.productId
          )?.productId.name;
          return `${name}${adj.flavor ? ` (${adj.flavor})` : ""}: only ${adj.availableQty} in stock`;
        });
        dispatch(showAlert({ message: `Quantities adjusted: ${messages.join("; ")}`, severity: "warning" }));
      } else {
        dispatch(showAlert({ message: "Order placed successfully!", severity: "success" }));
      }

      dispatch(clearCart());
      dispatch(clearAdjustments());
      Navigate("/order-success", { state: { order } });
    } else {
      dispatch(showAlert({ message: "Order failed", severity: "error" }));
    }
  };

  if (loading) {
    return (
      <Box maxWidth={600} mx="auto" py={4} px={2}>
        <Skeleton variant="text" width="40%" height={40} />
        <Skeleton variant="rectangular" height={150} sx={{ my: 2 }} />
        <Skeleton variant="rectangular" height={250} sx={{ my: 2 }} />
        <Skeleton variant="rectangular" height={48} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box maxWidth={600} mx="auto" py={4} px={2}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box maxWidth={600} mx="auto" py={4} px={2}>
      <Typography variant="h4" mb={3}>
        Checkout
      </Typography>

      {items.length === 0 ? (
        <Typography>Your cart is empty.</Typography>
      ) : (
        <>
          <Box mb={2}>
            <Typography variant="h6">Order Method</Typography>
            <RadioGroup
              row
              value={orderMethod}
              onChange={(e) => setOrderMethod(e.target.value)}
            >
              <FormControlLabel
                value="pickup"
                control={<Radio />}
                label="Pick Up"
              />
              <FormControlLabel
                value="delivery"
                control={<Radio />}
                label="Delivery"
              />
            </RadioGroup>
          </Box>

          {orderMethod === "pickup" ? (
            <Box mb={3}>
              <Typography variant="h6">Store Pickup Location</Typography>
              <Typography>1230 Montlimar Dr, Mobile, AL 36609</Typography>
            </Box>
          ) : (
            <Box mb={3}>
              <Typography variant="h6">Delivery Address</Typography>
              {editing ? (
                <TextField
                  fullWidth
                  multiline
                  minRows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  sx={{ mt: 1 }}
                />
              ) : (
                <Typography mt={1}>{address}</Typography>
              )}
              <Button size="small" onClick={() => setEditing(!editing)} sx={{ mt: 1 }}>
                {editing ? "Save Address" : "Edit Address"}
              </Button>
            </Box>
          )}

          <Box mb={2}>
            <Typography variant="h6">Order Summary</Typography>
            <Typography>Total: ${totalPrice.toFixed(2)}</Typography>
          </Box>

          <Button
            variant="contained"
            size="large"
            fullWidth
            sx={{
              width: { xs: '100%', sm: 300 },
              mx: { sm: 'auto' }              
            }}
            onClick={handlePlaceOrder}
            disabled={loading || (orderMethod === "delivery" && !address)}
          >
            {loading ? <CircularProgress size={24} /> : "Place Order"}
          </Button>
        </>
      )}
    </Box>
  );
};

export default CheckoutPage;