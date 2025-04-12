import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  Box,
  Grid,
  Container,
  Typography,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination,
} from "@mui/material";
import ProductCard from "../components/productCard";
import {
  fetchProductsByCategory,
  deleteProductById,
  updateProductStock,
  editProductDetails,
} from "../store/slices/productSlice";
import { jwtDecode } from "jwt-decode";
import SnackbarAlert from "../components/snackbarAlert";

const CategoryProducts = () => {
  const dispatch = useDispatch();
  const { category, subCategory } = useParams();
  const subCategories = subCategory;
  const [sortOption, setSortOption] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const { products, loading, error } = useSelector((state) => state.product);
  console.log("Products:", products);
  
  const [currentPage, setCurrentPage] = useState(1);
  const productsperPage = 12;

  const handlePageChange = (page) => {
    setCurrentPage(page);
  }

  const allProducts = products || [];

  const totalPages = Math.max(1, Math.ceil(allProducts.length / productsperPage));
  const indexOfLastProduct = currentPage * productsperPage;
  const indexOfFirstProduct = indexOfLastProduct - productsperPage;
  const currentProducts = allProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  const storedUser = JSON.parse(localStorage.getItem("user"));
  let isAdmin = false;
  if (storedUser?.token) {
    try {
      const decoded = jwtDecode(storedUser.token);
      isAdmin = decoded?.isAdmin;
    } catch (err) {
      console.error("Invalid token", err);
    }
  }

  useEffect(() => {
    dispatch(fetchProductsByCategory({ category, subCategories, sort: sortOption }));
    setCurrentPage(1);
  }, [dispatch, category, subCategories, sortOption]);

  const handleDelete = (product) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      dispatch(deleteProductById(product._id));
      setSnackbarMessage("Product deleted successfully");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    }
  };

  const handleUpdateStock = ({ id, stock, name }) => {
    dispatch(updateProductStock({ id, stock, name }));
    setSnackbarMessage("Stock updated successfully");
    setSnackbarSeverity("success");
    setSnackbarOpen(true);
  };

  const handleEdit = (updatedProduct) => {
    dispatch(editProductDetails(updatedProduct));
    setSnackbarMessage("Product updated successfully");
    setSnackbarSeverity("success");
    setSnackbarOpen(true);
  };

  const handleAddToCart = (product) => {
    alert(`Add to cart: ${product.name}`);
  };

  const handleIncrement = (product) => {
    alert(`Increment quantity for: ${product.name}`);
  };

  const handleDecrement = (product) => {
    alert(`Decrement quantity for: ${product.name}`);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography
        variant="h5"
        mb={3}
        textAlign="center"
        fontWeight="bold"
        sx={{ fontSize: { xs: "1.3rem", sm: "1.6rem", md: "1.8rem" } }}
      >
        {category} {subCategory ? `- ${subCategory}` : ""}
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={5}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error" textAlign="center">
          {error}
        </Typography>
      ) : (
        <>
         <FormControl sx={{ minWidth: 150, mb: 2 }} size="small">
          <InputLabel id="sort-label">Sort By</InputLabel>
          <Select
            labelId="sort-label"
            value={sortOption}
            label="Sort By"
            onChange={(e) => setSortOption(e.target.value)}
          >
            <MenuItem value="">None</MenuItem>
            <MenuItem value="price_asc">Price: Low to High</MenuItem>
            <MenuItem value="price_desc">Price: High to Low</MenuItem>
            <MenuItem value="newest">Newest First</MenuItem>
            <MenuItem value="popularity">Popularity</MenuItem>
          </Select>
        </FormControl>
        {currentProducts.length === 0 ? (
          <Typography textAlign= "center">No products found</Typography>
        ) : (
          <Grid container spacing={3} alignItems="stretch">
            {currentProducts.map((product) => (
              <Grid item key={product._id} xs={12} sm={12} md={6} lg={3}>
                <Box
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    transition: "transform 0.2s ease-in-out",
                    "&:hover": {
                      transform: "translateY(-4px)",
                    },
                  }}
                >
                  <ProductCard
                    product={product}
                    isAdmin={isAdmin}
                    onDelete={handleDelete}
                    onUpdateStock={handleUpdateStock}
                    onEdit={handleEdit}
                    onAddToCart={handleAddToCart}
                    onIncrement={handleIncrement}
                    onDecrement={handleDecrement}
                    quantity={0}
                  />
                </Box>
              </Grid>
            ))}
          </Grid>
        )}
          {totalPages > 1 && (
            <Box mt={4} display="flex" justifyContent="center">
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={(e, page) => handlePageChange(page)}
                color="primary"
                siblingCount={1}
                boundaryCount={1}
              />
            </Box>
          )}
        </>
      )}
      <SnackbarAlert
        message={snackbarMessage}
        severity={snackbarSeverity}
        open={snackbarOpen}
        setOpen={setSnackbarOpen}
      />
    </Container>
  );
};

export default CategoryProducts;