import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  TextField,
  MenuItem,
  Button,
  useMediaQuery,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { fetchSingleProduct, fetchProductsByCategory } from "../store/slices/productSlice";
import MiniProductCard from "./miniProductPage";
import ProductImages from "../components/productImg";

const ProductPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width:600px)");
  const { selectedProduct, loading } = useSelector((state) => state.product);
  const { user } = useSelector((state) => state.auth);

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
          console.error("Error fetching related products:", err);
        });
    }
  }, [dispatch, selectedProduct]);  

  useEffect(() => {
    if (selectedProduct?.flavors && selectedProduct.flavors.length > 0) {
      setSelectedFlavor(selectedProduct.flavors[0]?.name || "");
    }
  }, [selectedProduct]);

  if (loading || !selectedProduct) return <CircularProgress />;

  const flavorInfo = selectedProduct.flavors?.find(
    (flavor) => flavor.name === selectedFlavor
  );

  const basePrice =
  (flavorInfo?.price !== undefined ? flavorInfo.price : selectedProduct?.price) ?? 0;

    const finalPrice = selectedProduct?.isDeal
    ? selectedProduct.discountType === "amount"
        ? (parseFloat(basePrice) - parseFloat(selectedProduct.discountValue)).toFixed(2)
        : (parseFloat(basePrice) - (parseFloat(basePrice) * parseFloat(selectedProduct.discountValue)) / 100)
    : basePrice.toFixed(2);

    const isOutOfStock = selectedProduct.flavors?.length > 0
  ? flavorInfo?.stock === 0
  : selectedProduct.stock === 0;

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
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {selectedProduct.name}
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={2}>
            {selectedProduct.description}
          </Typography>

          {selectedProduct.flavors && selectedProduct.flavors.length > 0 && (
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
                {selectedProduct.flavors.map((flavor) => (
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
                    {selectedProduct.discountType === "amount"
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

            <Box display="flex" alignItems="center" gap={2} mt={2}>
              <Box>
                <Typography fontSize="14px">Quantity</Typography>
                <TextField
                  type="number"
                  size="small"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  inputProps={{ min: 1 }}
                  sx={{ width: "80px" }}
                />
              </Box>
              <Button
                variant="contained"
                size="large"
                startIcon={<ShoppingCartIcon />}
                disabled={isOutOfStock}
                sx={{ borderRadius: 2, height: "40px", mt: isMobile ? 1 : 3 }}
              >
                {isOutOfStock ? "Out of Stock" : "ADD TO CART"}
              </Button>
            </Box>

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