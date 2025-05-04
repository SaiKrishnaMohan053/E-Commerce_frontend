import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Box,
  Badge,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import SearchIcon from "@mui/icons-material/Search";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import MenuIcon from "@mui/icons-material/Menu";
import AddIcon from "@mui/icons-material/Add";
import ListAltIcon from "@mui/icons-material/ListAlt";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

import { logoutUser } from "../store/slices/authSlice.js";
import { fetchCart } from "../store/slices/cartSlice.js";

const Navbar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const cartItemCount = useSelector((state) => state.cart?.items.length || 0);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [adminMenuAnchor, setAdminMenuAnchor] = useState(null);

  useEffect(() => {
    if (user) {
      dispatch(fetchCart());
    }
  }, [dispatch, user]);

  useEffect(() => {
    const delaySearch = setTimeout(async () => {
      if (searchTerm.length > 1) {
        try {
          const { data } = await axios.get(
            `${API_BASE_URL}/api/products/getProducts?name=${searchTerm}`
          );
          setSearchResults(data.products || []);
        } catch (err) {
          console.error("Search failed:", err);
          setSearchResults([]);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);
  
    return () => clearTimeout(delaySearch);
  }, [searchTerm, API_BASE_URL]);       

  useEffect(() => {
    if (!user) {
      const localUser = JSON.parse(localStorage.getItem("user"));
      if (localUser) {
        dispatch({ type: "auth/setUser", payload: localUser });
      }
    }
  }, [user, dispatch]);

  let isAdmin = false;
  const token = user?.token || JSON.parse(localStorage.getItem("user"))?.token;
  if (token) {
    const decodedToken = jwtDecode(token);
    isAdmin = decodedToken?.isAdmin || false;
  }

  const goToOrders = () => {
    if(!user) {
      navigate("/login");
    } else {
      navigate("/orders");
    }
  }

  const goToCart = () => {
    if(!user) {
      navigate("/login");
    } else {
      navigate("/cart");
    }
  }

  const goToWishlist = () => {
    if(!user) {
      navigate("/login");
    } else {
      navigate("/wishlist");
    }
  }

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/login");
  };

  const handleAdminMenuClick = (event) => {
    setAdminMenuAnchor(event.currentTarget);
  };

  const handleAdminMenuClose = () => {
    setAdminMenuAnchor(null);
  };

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  const drawerContent = (
    <Box
      sx={{
        width: 260,
        bgcolor: "#f9f9f9",
        height: "100%",
        px: 1,
      }}
      role="presentation"
      onClick={toggleDrawer(false)}
    >
      <List>
        {isAdmin ? (
          <>
            <Typography variant="h6" sx={{ px: 2, py: 1, color: "#1976d2" }}>Admin</Typography>
            <ListItemButton onClick={() => navigate("/admin")} sx={{ py: 1.5 }}>
              <ListItemIcon><AccountCircleIcon color="primary" /></ListItemIcon>
              <ListItemText primary="Users" primaryTypographyProps={{ fontSize: 16 }} />
            </ListItemButton>
            <ListItemButton onClick={() => navigate("/admin/add-product")} sx={{ py: 1.5 }}>
              <ListItemIcon><AddIcon color="primary" /></ListItemIcon>
              <ListItemText primary="Add a Product" primaryTypographyProps={{ fontSize: 16 }} />
            </ListItemButton>
            <ListItemButton onClick={() => navigate("/admin/orders")} sx={{ py: 1.5 }}>
              <ListItemIcon><ListAltIcon color="primary" /></ListItemIcon>
              <ListItemText primary="orders" primaryTypographyProps={{ fontSize: 16 }} />
            </ListItemButton>
          </>
        ) : (
          <>
            <ListItemButton onClick={goToOrders} sx={{ py: 1.5 }}>
              <ListItemIcon><ShoppingCartIcon /></ListItemIcon>
              <ListItemText primary="My Orders" primaryTypographyProps={{ fontSize: 16 }} />
            </ListItemButton>
            <ListItemButton onClick={goToWishlist} sx={{ py: 1.5 }}>
              <ListItemIcon><FavoriteBorderIcon /></ListItemIcon>
              <ListItemText primary="Wishlist" primaryTypographyProps={{ fontSize: 16 }} />
            </ListItemButton>
          </>
        )}
  
        <Divider sx={{ my: 1 }} />
  
        {!isAdmin && (
          <ListItemButton onClick={goToCart} sx={{ py: 1.5 }}>
            <ListItemIcon><ShoppingCartIcon color="error" /></ListItemIcon>
            <ListItemText primary={`Cart (${cartItemCount})`} primaryTypographyProps={{ fontSize: 16 }} />
          </ListItemButton>
        )}
  
        {user ? (
          <>
            <ListItemButton onClick={() => navigate("/profile")} sx={{ py: 1.5 }}>
              <ListItemIcon><AccountCircleIcon /></ListItemIcon>
              <ListItemText primary="Profile" primaryTypographyProps={{ fontSize: 16 }} />
            </ListItemButton>
            <ListItemButton onClick={handleLogout} sx={{ py: 1.5 }}>
              <ListItemIcon><LogoutIcon color="error" /></ListItemIcon>
              <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: 16 }} />
            </ListItemButton>
          </>
        ) : (
          <ListItemButton onClick={() => navigate("/login")} sx={{ py: 1.5 }}>
            <ListItemIcon><LoginIcon /></ListItemIcon>
            <ListItemText primary="Login" primaryTypographyProps={{ fontSize: 16 }} />
          </ListItemButton>
        )}
      </List>
    </Box>
  );  

  return (
    <Box sx={{position: "relative"}}>
    <AppBar position="static" sx={{ backgroundColor: "#1976d2", py: 1 }}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
      <Box
          sx={{ width: 120, height: 40, cursor: "pointer" }}
          onClick={() => navigate("/")}
        >
          <img src="" alt="Your Brand" style={{ width: 120, height: 40 }} />
      </Box>

        <Box sx={{ position: "relative", width: isMobile ? "45%" : "30%", mx: "auto" }}>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            fullWidth
            sx={{
              backgroundColor: "white",
              borderRadius: 1,
              position: "relative",
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          {searchTerm.length > 1 && (
            <Box
              sx={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                mt: "-2px",
                bgcolor: "#fff",
                border: "1px solid #ccc",
                borderTop: "none",
                borderRadius: "0 0 8px 8px",
                zIndex: 10,
                overflow: "hidden",
                boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
              }}
            >
              {searchResults.length > 0 ? (
                searchResults.map((product) => (
                  <Box
                    key={product._id}
                    onClick={() => {
                      if (isAdmin) {
                        navigate(
                          `/category/${product.category}?highlight=${product._id}`
                        );
                      } else {
                        if (location.pathname !== `/product/${product._id}`) {
                          navigate(`/product/${product._id}`);
                        }
                      }
                        setSearchTerm("");
                        setSearchResults([]);
                    }}
                    sx={{
                      px: 2,
                      py: 1.2,
                      cursor: "pointer",
                      fontSize: "0.95rem",
                      color: "#333",
                      "&:hover": {
                        backgroundColor: "#f0f0f0",
                      },
                    }}
                  >
                    {product.name}
                  </Box>
                ))
              ) : (
                <Box
                  sx={{
                    px: 2,
                    py: 1.2,
                    fontSize: "0.95rem",
                    color: "#999",
                    fontWeight: 400,
                  }}
                >
                  No results found
                </Box>
              )}
            </Box>
          )}
        </Box>
        {isMobile && (
            <IconButton color="inherit" edge="start" onClick={toggleDrawer(true)}>
              <MenuIcon />
            </IconButton>
          )}
        {!isMobile && (
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {isAdmin ? (
              <>
                <Button
                  color="inherit"
                  onClick={handleAdminMenuClick}
                  endIcon={<ArrowDropDownIcon />}
                  sx={{ textTransform: "none", mr: 2, fontWeight: "bold" }}
                >
                  Admin
                </Button>
                <Menu
                  anchorEl={adminMenuAnchor}
                  open={Boolean(adminMenuAnchor)}
                  onClose={handleAdminMenuClose}
                >
                  <MenuItem onClick={() => { navigate("/admin"); handleAdminMenuClose(); }}>Users</MenuItem>
                  <MenuItem onClick={() => { navigate("/admin/add-product"); handleAdminMenuClose(); }}>Add a Product</MenuItem>
                  <MenuItem onClick={() => { navigate("/admin/orders"); handleAdminMenuClose(); }}>Orders</MenuItem>
                </Menu>
              </>
            ) : (
              <>
                <Button color="inherit" sx={{ textTransform: "none", mr: 2 }} onClick={goToOrders}>My Orders</Button>
                <Button color="inherit" sx={{ textTransform: "none", mr: 2 }} onClick={goToWishlist}>Wishlist</Button>
              </>
            )}

            {!isAdmin && (
              <IconButton color="inherit" sx={{ mr: 2 }} onClick={goToCart}>
                <Badge badgeContent={cartItemCount} color="error">
                  <ShoppingCartIcon fontSize="large" />
                </Badge>
              </IconButton>
            )}

            {user ? (
              <>
                <IconButton color="inherit" onClick={() => navigate("/profile")} sx={{ mr: 1 }}>
                  <AccountCircleIcon fontSize="large" />
                </IconButton>
                <Button color="inherit" onClick={handleLogout}>Logout</Button>
              </>
            ) : (
              <Button color="inherit" onClick={() => navigate("/login")}>Login</Button>
            )}
          </Box>
        )}
      </Toolbar>
      <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer(false)} PaperProps={{ sx: (theme) => ({ zIndex: theme.zIndex.drawer + 1})}}>
        {drawerContent}
      </Drawer>
    </AppBar>
    </Box>
  );  
};

export default Navbar;