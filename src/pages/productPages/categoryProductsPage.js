import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import {
  Box,
  Grid,
  Container,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination,
  Card,
  CardContent,
  Skeleton,
  Button,
} from "@mui/material";
import { jwtDecode } from "jwt-decode";
import AddIcon from "@mui/icons-material/Add";
import axios from "axios";

import ProductCard from "../../components/productCard/productCard.js";
import {
  fetchProductsByCategory,
  deleteProductById,
  updateProductStock,
  editProductDetails,
} from "../../store/slices/productSlice";
import { showAlert } from "../../store/slices/alertSlice";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const CategoryProducts = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { products, loading, error, totalPages } = useSelector((state) => state.product);
  const { category, subCategory } = useParams();
  const subCategories = subCategory;

  const [restockAlerts, setRestockAlerts] = useState([]);
  const [sortOption, setSortOption] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const highlightId = searchParams.get("highlight") || null;
  const initialPage = Number(searchParams.get("page")) || 1;
  const [currentPage, setCurrentPage] = useState(initialPage);
  const productsPerPage = 12;

  const prevFilters = useRef({ category, subCategories, sortOption });

  useEffect(() => {
    if (
      prevFilters.current.category !== category ||
      prevFilters.current.subCategories !== subCategories ||
      prevFilters.current.sortOption !== sortOption
    ) {
      const params = new URLSearchParams(searchParams);
      params.set("page", "1");
      setCurrentPage(1);
      setSearchParams(params);
      prevFilters.current = { category, subCategories, sortOption };
    }
  }, [category, subCategories, sortOption, searchParams, setSearchParams]);

  useEffect(() => {
    dispatch(
      fetchProductsByCategory({
        category,
        subCategories,
        sort: sortOption,
        page: currentPage,
        limit: productsPerPage,
      })
    );
  }, [dispatch, category, subCategories, sortOption, currentPage, productsPerPage]);

  const handlePageChange = (event, pageNum) => {
    setCurrentPage(pageNum);
    setSearchParams({ page: pageNum.toString() });
  };

  const storedUser = JSON.parse(localStorage.getItem("user"));
  let isAdmin = false;
  if (storedUser?.token) {
    try {
      const decoded = jwtDecode(storedUser.token);
      isAdmin = decoded?.isAdmin;
    } catch (err) {
      dispatch(showAlert({ message: "Invalid token", severity: "error" }));
    }
  }

  useEffect(() => {
    async function loadAlerts() {
      try {
        const { data } = await axios.get(`${API_URL}/api/admin/restock-alerts`);
        setRestockAlerts(data);
      } catch (err) {
        console.error(err);
      }
    }
    if (isAdmin) loadAlerts();
  }, [isAdmin]);
  
  const alertsByProduct = React.useMemo(() => {
    return restockAlerts.reduce((acc, alert) => {
      const id = alert.product._id;
      if (!acc[id]) acc[id] = [];
      acc[id].push({
        flavorName: alert.flavorName || 'Default',
        avgWeeklySales: Math.round(alert.avgWeeklySales),
        reorderPoint:   Math.round(alert.reorderPoint),
        salesVelocity:  alert.salesVelocity
      });
      return acc;
    }, {});
  }, [restockAlerts]);

  const handleDelete = (product) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      dispatch(deleteProductById(product._id));
      dispatch(showAlert({ message: "Product deleted successfully", severity: "success" }));
    }
  };

  const handleUpdateStock = ({ id, stock, name }) => {
    dispatch(updateProductStock({ id, stock, name }));
    dispatch(showAlert({ message: "Stock updated successfully", severity: "success" }));
  };

  const handleEdit = (updatedProduct) => {
    dispatch(editProductDetails(updatedProduct));
    dispatch(showAlert({ message: "Product updated successfully", severity: "success" }));
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

  const displayedProducts = React.useMemo(() => {
    if (!highlightId || products.length === 0) return products;
    const list = [...products];
    const idx = list.findIndex((p) => p._id === highlightId);
    if (idx > 0) {
      const [item] = list.splice(idx, 1);
      list.unshift(item);
    }
    return list;
  }, [products, highlightId]);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box
        mb={3}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography
          variant="h5"
          fontWeight="bold"
          sx={{ fontSize: { xs: "1.3rem", sm: "1.6rem", md: "1.8rem" } }}
        >
          {category} {subCategory ? `- ${subCategory}` : ""}
        </Typography>

        {isAdmin && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              const params = new URLSearchParams();
              params.set("category", category);
              if (subCategories) params.set("subCategories", subCategories);
              navigate(`/admin/add-product?${params.toString()}`);
            }}
          >
            Add Product
          </Button>
        )}
      </Box>

      {loading ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 3,
            p: 2,
          }}
        >
          {Array.from({ length: productsPerPage }).map((_, idx) => (
            <Card key={idx} sx={{ p: 1 }}>
              <Skeleton variant="rectangular" height={140} />
              <CardContent>
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="40%" />
              </CardContent>
            </Card>
          ))}
        </Box>
      ) : error ? (
        <Typography color="error" textAlign="center">
          {error.message || error}
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
          {displayedProducts.length === 0 ? (
            <Typography textAlign="center">No products found</Typography>
          ) : (
            <Grid container spacing={3} alignItems="stretch">
              {displayedProducts.map((product) => {
                const flavorAlerts = alertsByProduct[product._id] || [];
                const borderColor =
                  flavorAlerts.some(a => a.salesVelocity === 'Slow') ? 'red' :
                  flavorAlerts.some(a => a.salesVelocity === 'Fast') ? 'green' : 
                  flavorAlerts.some(a => a.salesVelocity === 'Average') ? 'yellow' :
                                        'transparent';

                return (
                  <Grid item key={product._id} xs={12} sm={12} md={6} lg={3}>
                    <Box
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'transform 0.2s',
                        '&:hover': { transform: 'translateY(-4px)' },
                        border: `1.5px solid ${borderColor}`,
                        borderRadius: 1
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
                        flavorAlerts={flavorAlerts}
                      />
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          )}
          {totalPages > 1 && (
            <Box mt={4} display="flex" justifyContent="center">
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                siblingCount={1}
                boundaryCount={2}
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default CategoryProducts;