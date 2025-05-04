import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
  IconButton,
  useMediaQuery,
  Skeleton,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteIcon from "@mui/icons-material/Delete";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";

import { fetchWishlist, addWishlistItem, removeWishlistItem } from "../../store/slices/wishlistSlice";
import { addToCart, updateCartItem, removeCartItem } from "../../store/slices/cartSlice";
import { fetchSingleProduct, fetchProductsByCategory } from "../../store/slices/productSlice";
import MiniProductCard from "./miniProductPage";
import ProductImages from "../../components/productImg";
import { showAlert } from "../../store/slices/alertSlice";

const ProductPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width:600px)");
  const { selectedProduct, loading } = useSelector((state) => state.product);
  const { user } = useSelector((state) => state.auth);
  const cartItems = useSelector((state) => state.cart.items);
  const { items: wishlistItem } = useSelector((state) => state.wishlist);

  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedFlavor, setSelectedFlavor] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (id && id !== selectedProduct?._id) {
      dispatch(fetchSingleProduct(id));
    }
  }, [id, dispatch, selectedProduct?._id]);  

  useEffect(() => {
    if (selectedProduct && selectedProduct.category) {
      dispatch(
        fetchProductsByCategory({ category: selectedProduct.category, excludeId: selectedProduct._id })
      )
        .unwrap()
        .then((res) => {
          setRelatedProducts(res.products || res);
        })
        .catch((err) => {
          dispatch(showAlert({ message: "Error fetching related products", severity: "error" }));
        });
    }
  }, [dispatch, selectedProduct]);  

  useEffect(() => {
    dispatch(fetchWishlist())
  },[dispatch])

  const inWishlist = useMemo(
    () => wishlistItem.some(p => p._id === selectedProduct?._id),
    [wishlistItem, selectedProduct?._id]
  );

  const sortedFlavors = React.useMemo(() => {
    return Array.isArray(selectedProduct?.flavors)
      ? [...selectedProduct.flavors].sort((a, b) =>
          a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
        )
      : [];
  }, [selectedProduct?.flavors]);

  useEffect(() => {
    if (sortedFlavors.length > 0) {
      setSelectedFlavor(sortedFlavors[0].name);
    }
  }, [sortedFlavors]);

  if (loading || !selectedProduct) {
    return (
      <Box p={isMobile ? 2 : 4}>
        <Box display="flex" flexDirection={isMobile ? "column" : "row"} gap={4}>
          <Box width={isMobile ? "100%" : "50%"}>
            <Skeleton variant="rectangular" width="100%" height={isMobile ? 200 : 300} />
          </Box>
          <Box width={isMobile ? "100%" : "40%"}>
            <Skeleton variant="text" width="60%" height={40} />
            <Skeleton variant="text" width="80%" />
            <Box display="flex" gap={2} mt={2}>
              <Skeleton variant="rectangular" width={120} height={40} />
              <Skeleton variant="rectangular" width={120} height={40} />
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }

  const flavorInfo = selectedProduct?.flavors?.find(
    (flavor) => flavor.name === selectedFlavor
  );

  const purchaseLimit = selectedProduct?.purchaseLimit > 0
    ? selectedProduct.purchaseLimit
    : Infinity;
  const cartItem = cartItems.find(
    it =>
      it.productId._id === selectedProduct?._id &&
      (!selectedProduct.flavors?.length || it.flavor === selectedFlavor)
  );
  const qtyInCart = cartItem?.qty || 0;

  const basePrice =
  (flavorInfo?.price !== undefined ? flavorInfo.price : selectedProduct?.price) ?? 0;

    const finalPrice = selectedProduct?.isDeal
    ? selectedProduct.discountType === "fixed"
        ? (parseFloat(basePrice) - parseFloat(selectedProduct.discountValue)).toFixed(2)
        : (parseFloat(basePrice) - (parseFloat(basePrice) * parseFloat(selectedProduct.discountValue)) / 100)
    : basePrice.toFixed(2);

    const isOutOfStock = selectedProduct.flavors?.length > 0
  ? flavorInfo?.stock === 0
  : selectedProduct.stock === 0;

  const handleAddToCart = () => {
    if (!user) {
      navigate("/login");
    } else {
      const price = selectedProduct.isDeal
      ? parseFloat(finalPrice)
      : parseFloat(basePrice);
  
    dispatch(addToCart({
      productId: selectedProduct._id,
      flavor: selectedFlavor || null,
      qty: Number(quantity),
      price: parseFloat(price)
    }))
      .unwrap()
      .then(() => dispatch(showAlert({ message: "Product added to cart", severity: "success" })))
      .catch(() => dispatch(showAlert({ message: "Failed to add product to cart", severity: "error" })));
    }
  }; 
  
  const handleInc = () =>
    dispatch(updateCartItem({
      productId: selectedProduct._id,
      flavor: selectedFlavor || null,
      qty: qtyInCart + 1
    }));
  
  const handleDec = () => {
    if (qtyInCart > 1) {
      dispatch(updateCartItem({
        productId: selectedProduct._id,
        flavor: selectedFlavor || null,
        qty: qtyInCart - 1
      }));
    } else {
      dispatch(removeCartItem({
        productId: selectedProduct._id,
        flavor: selectedFlavor || null
      }));
    }
  };
  
  const handleRemove = () => {
    dispatch(removeCartItem({
      productId: selectedProduct._id,
      flavor: selectedFlavor || null
    }));  
  }
  
  return (
    <Box p={isMobile ? 2 : 4}>
      <Box
        display="flex"
        flexDirection={isMobile ? "column" : "row"}
        gap={4}
        alignItems="center"
        justifyContent="center"
      >
        <Box width={isMobile ? "100%" : "50%"}>
          <ProductImages images={selectedProduct.images} />
        </Box>

        <Box width={isMobile ? "100%" : "40%"}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            mb={2}
          >
            <Typography variant="h4" fontWeight="bold">
              {selectedProduct.name}
            </Typography>

            <IconButton
              onClick={() => {
                if (!user) {
                  return navigate("/login");
                }
                // toggle
                dispatch(
                  inWishlist
                    ? removeWishlistItem(selectedProduct._id)
                    : addWishlistItem(selectedProduct._id)
                );
              }}
              aria-label={inWishlist ? "Remove from favorites" : "Add to favorites"}
            >
              {inWishlist
                ? <FavoriteIcon color="error" />
                : <FavoriteBorderIcon />}
            </IconButton>
          </Box>

          <Typography variant="body1" color="text.secondary" mb={2}>
            {selectedProduct.description}
          </Typography>

          { sortedFlavors.length > 0 && (
            <Box mb={2}>
              <Typography fontSize="14px" mb={0.5}>
                Flavor
              </Typography>
              <TextField
                select
                fullWidth
                size="small"
                value={selectedFlavor}
                onChange={(e) => setSelectedFlavor(e.target.value)}
              >
                {sortedFlavors.map((flavor) => (
                  <MenuItem key={flavor.name} value={flavor.name}>
                    {flavor.name}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          )}

          {user && (
            <Box mb={1}>
              {selectedProduct.isDeal && (
                <>
                  <Box
                    display="inline-block"
                    px={1.2}
                    py={0.3}
                    mb={1}
                    sx={{
                      backgroundColor: "#FFA726",
                      color: "white",
                      fontWeight: "bold",
                      borderRadius: "6px",
                      fontSize: "13px",
                    }}
                  >
                    🔥 Deal
                  </Box>
                  <Typography color="green" fontWeight="bold">
                    {selectedProduct.discountType === "fixed"
                      ? `Special Deal: -$${selectedProduct.discountValue} Off`
                      : `Special Deal: -${selectedProduct.discountValue}% Off`}
                  </Typography>
                </>
              )}

              {selectedProduct.isDeal && (
                <Typography fontSize="16px" mt={0.5}>
                  <span style={{ textDecoration: "line-through", color: "#888", marginRight: 6 }}>
                    ${selectedProduct.price.toFixed(2)}
                  </span>
                  <span style={{ color: "green", fontWeight: "bold" }}>
                    ${finalPrice}
                  </span>
                </Typography>
              )}

              {!selectedProduct.isDeal && (
                <Typography variant="h6" fontWeight="bold" mt={1}>
                   ${typeof basePrice === "number" ? basePrice.toFixed(2) : "0.00"}
                </Typography>
              )}
            </Box>
          )}

          {isOutOfStock && (
            <Typography color="error" fontWeight="bold" mt={1}>
              Out of Stock
            </Typography>
          )}

          {cartItem ? (
            <Box display="flex" alignItems="center" gap={1} mt={2}>
              <IconButton type="button" size="small" onClick={handleDec}>
                {qtyInCart > 1
                  && <RemoveIcon />}
              </IconButton>

              <TextField
                type="number"
                size="small"
                value={qtyInCart}
                onChange={(e) => {
                  let v = Number(e.target.value) || 1;
                  v = Math.max(1, Math.min(purchaseLimit, v));
                  dispatch(updateCartItem({
                    productId: selectedProduct._id,
                    flavor: selectedFlavor || null,
                    qty: v
                  }));
                }}
                inputProps={{
                  min: 1,
                  max: purchaseLimit === Infinity ? undefined : purchaseLimit,
                  style: { textAlign: "center" },
                }}
                sx={{ width: 60 }}
              />

              <IconButton type="button" size="small" onClick={handleInc} disabled={qtyInCart >= purchaseLimit}>
                <AddIcon />
              </IconButton>

              <IconButton type="button" size="small" onClick={handleRemove}>
                <DeleteIcon color="error" />
              </IconButton>
            </Box>
          ) : (
            <Box display="flex" alignItems="center" gap={2} mt={2}>
              <Box>
                <Typography fontSize="14px">Quantity</Typography>
                <TextField
                  type="number"
                  size="small"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  inputProps={{ min: 1 }}
                  sx={{ width: "80px" }}
                />
              </Box>
              <Button
                type="button"
                onClick={handleAddToCart}
                variant="contained"
                size="large"
                startIcon={<ShoppingCartIcon />}
                disabled={isOutOfStock}
                sx={{ borderRadius: 2, height: "40px", mt: isMobile ? 1 : 3 }}
              >
                {isOutOfStock ? "Out of Stock" : "ADD TO CART"}
              </Button>
            </Box>
          )}
          {purchaseLimit < Infinity && (
            <Typography variant="caption" color="text.secondary">
              {`Limit: ${purchaseLimit}`}
            </Typography>
          )}
            {!user && (
              <Typography fontSize="14px" mt={2} color="gray">
                * Please login to see price details and purchase
              </Typography>
            )}
          </Box>
        </Box>

        <Box mt={4}>
          <Typography variant="h6" mb={2}>Related Products</Typography>

          {relatedProducts.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No related products found.
            </Typography>
          ) : (
            <Box
              sx={{
                display: "flex",
                overflowX: "auto",
                gap: 2,
                pb: 1,
                px: 1,
                "&::-webkit-scrollbar": {
                  height: "8px",
                },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "#ccc",
                  borderRadius: "4px",
                },
              }}
            >
              {relatedProducts.slice(0, 6).map((item) => (
                <Box
                  key={item._id}
                  sx={{
                    minWidth: 160,
                    maxWidth: 180,
                    flexShrink: 0,
                  }}
                >
                  <MiniProductCard product={item} />
                </Box>
              ))}

              <Box
                sx={{
                  minWidth: 160,
                  maxWidth: 180,
                  flexShrink: 0,
                  backgroundColor: "#f5f5f5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 2,
                  boxShadow: 0,
                  p: 2,
                  cursor: "pointer",
                  transition: "all 0.3s ease-in-out",
                  "&:hover": {
                    backgroundColor: "#fff",
                  },
                }}
                onClick={() =>
                  navigate(`/category/${selectedProduct.category}`)
                }
              >
                <Typography
                  sx={{
                    color: "#00bcd4",
                    fontWeight: 600,
                    textTransform: "none",
                    fontSize: "14px",
                    "&:hover": {
                      color: "#00bcd4",
                    },
                  }}
                >
                  See More
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
    </Box>
  );
};

export default ProductPage;