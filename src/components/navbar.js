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
  ListItem,
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
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../store/slices/authSlice.js";
import { jwtDecode } from "jwt-decode";


const Navbar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const cartItemCount = useSelector((state) => state.cart?.items.length || 0);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [adminMenuAnchor, setAdminMenuAnchor] = useState(null);

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
            <ListItem button onClick={() => navigate("/admin")} sx={{ py: 1.5 }}>
              <ListItemIcon><AccountCircleIcon color="primary" /></ListItemIcon>
              <ListItemText primary="Users" primaryTypographyProps={{ fontSize: 16 }} />
            </ListItem>
            <ListItem button onClick={() => navigate("/admin/add-product")} sx={{ py: 1.5 }}>
              <ListItemIcon><AddIcon color="primary" /></ListItemIcon>
              <ListItemText primary="Add a Product" primaryTypographyProps={{ fontSize: 16 }} />
            </ListItem>
          </>
        ) : (
          <>
            <ListItem button onClick={() => navigate("/orders")} sx={{ py: 1.5 }}>
              <ListItemIcon><ShoppingCartIcon /></ListItemIcon>
              <ListItemText primary="My Orders" primaryTypographyProps={{ fontSize: 16 }} />
            </ListItem>
            <ListItem button onClick={() => navigate("/wishlist")} sx={{ py: 1.5 }}>
              <ListItemIcon><FavoriteBorderIcon /></ListItemIcon>
              <ListItemText primary="Wishlist" primaryTypographyProps={{ fontSize: 16 }} />
            </ListItem>
          </>
        )}
  
        <Divider sx={{ my: 1 }} />
  
        <ListItem button onClick={() => navigate("/cart")} sx={{ py: 1.5 }}>
          <ListItemIcon><ShoppingCartIcon color="error" /></ListItemIcon>
          <ListItemText primary={`Cart (${cartItemCount})`} primaryTypographyProps={{ fontSize: 16 }} />
        </ListItem>
  
        {user ? (
          <>
            <ListItem button onClick={() => navigate("/profile")} sx={{ py: 1.5 }}>
              <ListItemIcon><AccountCircleIcon /></ListItemIcon>
              <ListItemText primary="Profile" primaryTypographyProps={{ fontSize: 16 }} />
            </ListItem>
            <ListItem button onClick={handleLogout} sx={{ py: 1.5 }}>
              <ListItemIcon><LogoutIcon color="error" /></ListItemIcon>
              <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: 16 }} />
            </ListItem>
          </>
        ) : (
          <ListItem button onClick={() => navigate("/login")} sx={{ py: 1.5 }}>
            <ListItemIcon><LoginIcon /></ListItemIcon>
            <ListItemText primary="Login" primaryTypographyProps={{ fontSize: 16 }} />
          </ListItem>
        )}
      </List>
    </Box>
  );  

  return (
    <AppBar position="static" sx={{ backgroundColor: "#1976d2", py: 1 }}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {isMobile && (
            <IconButton color="inherit" edge="start" onClick={toggleDrawer(true)}>
              <MenuIcon />
            </IconButton>
          )}
          <Typography
            variant="h6"
            sx={{ cursor: "pointer", fontWeight: "bold" }}
            onClick={() => navigate("/")}
          >
            C-Store & Novelty
          </Typography>
        </Box>

        <TextField
          variant="outlined"
          size="small"
          placeholder="Search..."
          sx={{ width: isMobile ? "45%" : "30%", backgroundColor: "white", borderRadius: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

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
                </Menu>
              </>
            ) : (
              <>
                <Button color="inherit" sx={{ textTransform: "none", mr: 2 }} onClick={() => navigate("/orders")}>My Orders</Button>
                <Button color="inherit" sx={{ textTransform: "none", mr: 2 }} onClick={() => navigate("/wishlist")}>Wishlist</Button>
              </>
            )}

            <IconButton color="inherit" sx={{ mr: 2 }} onClick={() => navigate("/cart") }>
              <Badge badgeContent={cartItemCount} color="error">
                <ShoppingCartIcon fontSize="large" />
              </Badge>
            </IconButton>

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
      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        {drawerContent}
      </Drawer>
    </AppBar>
  );
};

export default Navbar;