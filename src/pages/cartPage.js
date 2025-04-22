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
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";
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
  const { items = [] } = useSelector((state) => state.cart);

  const [searchTerm, setSearchTerm] = useState("");
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
    dispatch(fetchCart())
      .unwrap()
      .catch(() => alertSnackbar("Failed to load cart", "error"));
  }, [dispatch]);

  const filteredItems = useMemo(() => {
    if(!searchTerm) return items;
    return items.filter(item => {
      return item.productId.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
    })
  }, [items, searchTerm]);

  const totalPrice = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.qty, 0),
    [items]
  );

  const handleQuantityChange = (item, newQty) => {
    dispatch(
      updateCartItem({
        productId: item.productId._id,
        flavor: item.flavor,
        qty: newQty,
      })
    )
      .unwrap()
      .then(() => alertSnackbar("Quantity updated"))
      .catch(() => alertSnackbar("Failed to update quantity", "error"));
  };

  const handleRemoveItem = (item) => {
    dispatch(
      removeCartItem({ productId: item.productId._id, flavor: item.flavor })
    )
      .unwrap()
      .then(() => alertSnackbar("Item removed"))
      .catch(() => alertSnackbar("Failed to remove item", "error"));
  };

  const handleClearCart = () => {
    dispatch(clearCart())
      .unwrap()
      .then(() => alertSnackbar("Cart cleared"))
      .catch(() => alertSnackbar("Failed to clear cart", "error"));
  };

  return (
    <Container maxWidth="md" sx={{ py: 4, px: { xs: 2, sm: 0 } }}>
      <Typography
        variant="h5"
        fontWeight="bold"
        mb={3}
        fontSize={{ xs: "1.25rem", sm: "1.5rem", md: "1.75rem", lg: "2rem" }}
      >
        Your Cart
      </Typography>
      <Box mb={2} display="flex" justifyContent="center">
        <TextField 
          fullWidth
          size="small"
          sx={{ maxWidth: 400, "& .MuiInputBase-root": { height: 36 }  }}
          label="search cart items"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small"/>
              </InputAdornment>
            )
          }}
        />
      </Box>

      {filteredItems.length === 0 ? (
        <Typography
          variant="body1"
          fontSize={{ xs: "0.875rem", sm: "1rem", md: "1.125rem", lg: "1.25rem" }}
        >
          {searchTerm ? `No items found for "${searchTerm}"` : "Your cart is empty."}
        </Typography>
      ) : (
        <>
          <Box display="flex" flexDirection="column" gap={2} alignItems="center">
            {filteredItems.map((item, index) => {
              const image = item.productId?.images?.[0];
              const rawLimit = item.productId.purchaseLimit;
              const purchaseLimit = rawLimit && rawLimit > 0 ? rawLimit : Infinity;
              const currentQty = item.qty;
              const imgSrc = image?.url || "image.png";

              return (
                <Card
                  key={index}
                  variant="outlined"
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },                   alignItems: { xs: "flex-start", sm: "center" },
                    alignItems: "center",
                    width: "100%",
                    maxWidth: { xs: 360, sm: 700 },
                    mx: "auto",
                    p: 1,
                    borderRadius: 2,
                    boxShadow: 2,
                    mb: 2,
                  }}                  
                >
                  <CardMedia
                    component="img"
                    image={imgSrc}
                    alt={item.productId?.name}
                    sx={{ 
                      width: { xs: 60, sm: 70 },
                      height: { xs: 60, sm: 70 },
                      objectFit: "cover",
                      borderRadius: 1,
                      mr: { xs: 0, sm: 2 },
                      mb: { xs: 1, sm: 0 },
                     }}
                  />
                  <CardContent sx={{ flex: 1, py: 1 }}>
                    <Typography fontWeight="bold" fontSize="1rem">
                      {item.productId?.name || "Unnamed Product"}
                    </Typography>
                    {item.flavor && (
                      <Typography fontSize="0.85rem" color="text.secondary">
                        Flavor: {item.flavor}
                      </Typography>
                    )}
                    <Typography fontSize="0.9rem" color="text.secondary">
                      Price: ${item.price.toFixed(2)}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1} mt={1}>
                      <IconButton
                        size="small"
                        onClick={() =>
                          handleQuantityChange(item, Math.max(1, currentQty - 1))
                        }
                        disabled={currentQty <= 1}
                      >
                        <RemoveIcon fontSize="inherit"/>
                      </IconButton>
                      <TextField
                        type="number"
                        size="small"
                        value={currentQty}
                        onChange={(e) => {
                          let v = Number(e.target.value);
                          if (v < 1) v = 1;
                          if (v > purchaseLimit) v = purchaseLimit;
                          handleQuantityChange(item, v);
                        }}
                        inputProps={{
                          min: 1,
                          max: purchaseLimit === Infinity ? undefined : purchaseLimit,
                          style: { textAlign: "center" },
                        }}
                        sx={{ width: 60 }}
                      />
                      <IconButton
                        size="small"
                        onClick={() =>
                          handleQuantityChange(item, Math.min(purchaseLimit, currentQty + 1))
                        }
                        disabled={currentQty >= purchaseLimit}
                      >
                        <AddIcon />
                      </IconButton>
                    </Box>
                  </CardContent>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mt={2}
                  >
                    <Typography fontWeight="bold" fontSize="1rem">
                      ${(item.qty * item.price).toFixed(2)}
                    </Typography>
                    <IconButton
                      color="error"
                      onClick={() => handleRemoveItem(item)}
                      size="large"
                      sx={{ p: 1 }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Card>
              );
            })}
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <Typography variant="h6" fontSize="1.25rem">
              Total: ${totalPrice.toFixed(2)}
            </Typography>
            <Button variant="outlined" color="error" onClick={handleClearCart}>
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