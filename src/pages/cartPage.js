import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
  TextField,
  IconButton,
  Button,
  Divider,
  Container,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../store/slices/cartSlice";
import SnackbarAlert from "../components/snackbarAlert";

const CartPage = () => {
  const dispatch = useDispatch();
  const { items = [], loading } = useSelector((state) => state.cart);
  const [orderMethod, setOrderMethod] = useState("pickup");

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const alertSnackbar = (msg, sev = "success") => {
    setSnackbarMsg(msg);
    setSnackbarSeverity(sev);
    setSnackbarOpen(true);
  };
  

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const totalPrice = useMemo(() =>
    items.reduce((sum, item) => sum + item.price * item.qty, 0),
  [items]);  
  
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h5" fontWeight="bold" mb={3} fontSize={{ xs: "1.25rem", sm: "1.5rem", md: "1.75rem", lg: "2rem" }}>
        Your Cart
      </Typography>

      {items.length === 0 ? (
        <Typography variant="body1" fontSize={{ xs: "0.875rem", sm: "1rem", md: "1.125rem", lg: "1.25rem" }}>Your cart is empty.</Typography>
      ) : (
        <>
          <Box display="flex" flexDirection="column" gap={2}>            
            {items.map((item, index) => {                
              const image = item.productId?.images?.[0];
              const rawLimit = item.productId.purchaseLimit;              
              const purchaseLimit = rawLimit && rawLimit > 0 ? rawLimit : Infinity;
              const currentQty = item.qty;
              
              const imgSrc = image?.url || "image.png";
              return (
                <Card
                  key={index}
                  sx={{
                    width: "100%",
                    maxWidth: 700,
                    mx: "auto",
                    display: "flex",
                    alignItems: "center",
                    padding: 1,
                    borderRadius: 2,
                    boxShadow: 2,
                  }}
                >
                  <CardMedia
                    component="img"
                    image={imgSrc}
                    alt={item.productId?.name}
                    sx={{
                      width: 70,
                      height: 70,
                      objectFit: "cover",
                      borderRadius: 1,
                      mr: 2,
                    }}
                  />
                  <CardContent sx={{ flex: 1, py: 1 }}>
                    <Typography fontWeight="bold" fontSize={{ xs: "1rem", sm: "1.1rem", md: "1.2rem", lg: "1.3rem" }}>
                      {item.productId?.name || "Unnamed Product"}
                    </Typography>
                    {item.flavor && (
                      <Typography fontSize={{ xs:"0.75rem", sm: "0.8rem", md: "0.8125rem", lg: "0.875rem" }} color="text.secondary">
                        Flavor: {item.flavor}
                      </Typography>
                    )}
                    <Typography fontSize={{ xs:"0.9rem", sm: "1rem", md: "1.1rem", lg: "1.2rem" }} color="text.secondary">
                      Price: ${parseFloat(item.price).toFixed(2)}
                    </Typography>
                    <TextField
                    type="number"
                    size="small"
                    value={currentQty}
                    onChange={(e) => {
                        let v = Number(e.target.value);
                        if (v < 1) v = 1;
                        if (v > purchaseLimit) v = purchaseLimit;
                        dispatch(updateCartItem({
                        productId: item.productId._id,
                        flavor: item.flavor,
                        qty: v,
                        }))
                        .unwrap()
                        .then(() => alertSnackbar("Item quantity updated"))
                        .catch(() => alertSnackbar("Failed to update item quantity", "error"))
                    }}
                    inputProps={{
                        min: 1,
                        max: purchaseLimit === Infinity ? undefined : purchaseLimit
                    }}
                    sx={{ width: 70, mt: 1 }}
                    />
                  </CardContent>
                  <Typography fontWeight="bold" fontSize={{ xs:"0.9rem", sm: "1rem", md: "1.1rem", lg: "1.2rem" }} pr={2}>
                    ${(item.qty * item.price).toFixed(2)}
                  </Typography>
                  <IconButton
                    color="error"
                    onClick={() =>
                        dispatch(
                          removeCartItem({
                            productId: item.productId._id,
                            flavor: item.flavor,
                          })
                        )
                        .unwrap()
                        .then(() => alertSnackbar("Item removed from cart"))
                        .catch(() => alertSnackbar("Failed to remove item from cart", "error"))
                    }
                  >
                    <DeleteIcon />
                  </IconButton>
                </Card>
              );
            })}
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            flexWrap="wrap"
            gap={2}
          >
            <Typography variant="h6" fontSize={{ xs: "1.1rem", sm: "1.25rem", md: "1.4rem", lg: "1.5rem" }}>
              Total: ${totalPrice.toFixed(2)}
            </Typography>
            <Button
                variant="outlined"
                color="error"
                onClick={
                  () => dispatch(clearCart())
                  .unwrap()
                  .then(() => alertSnackbar("Cart cleared successfully"))
                  .catch(() => alertSnackbar("Failed to clear cart", "error"))
                }
                sx={{ mr: 2 }}
              >
                Clear Cart
              </Button>
          </Box>
            <Box mt={4} maxWidth={400} mx="auto">
            <FormControl component="fieldset" fullWidth>
                <RadioGroup
                row
                name="order-method"
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
            </FormControl>

            <Box display="flex" justifyContent="center" mt={2}>
            <Button
                variant="contained"
                size="large"
                onClick={() => {
                    console.log("Placing order with method:", orderMethod);
                }}
            >
                Place Order
            </Button>
            </Box>
            </Box>
        </>
      )}
      <SnackbarAlert
        message={snackbarMsg}
        severity={snackbarSeverity}
        open={snackbarOpen}
        setOpen={setSnackbarOpen}
      />
    </Container>
  );
};

export default CartPage;