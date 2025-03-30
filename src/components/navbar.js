import React, { useState } from "react";
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
  Slide,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import SearchIcon from "@mui/icons-material/Search";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import MenuIcon from "@mui/icons-material/Menu";
import PeopleIcon from "@mui/icons-material/People";
import AddBoxIcon from "@mui/icons-material/AddBox";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ListAltIcon from "@mui/icons-material/ListAlt";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
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

  let isAdmin = false;
  let adminName = "Admin";
  if (user?.token) {
    const decodedToken = jwtDecode(user.token);
    isAdmin = decodedToken?.isAdmin || false;
    if (user?.ownerName) {
      adminName = user.ownerName;
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
    <Slide direction="right" in={drawerOpen} mountOnEnter unmountOnExit>
      <Box sx={{ width: 250, p: 2 }} role="presentation" onClick={toggleDrawer(false)}>
        <List>
          {isAdmin ? (
            <>
              <ListItem button onClick={() => navigate("/admin")}> 
                <ListItemIcon><PeopleIcon /></ListItemIcon>
                <ListItemText primary="Users" />
              </ListItem>
              <ListItem button onClick={() => navigate("/admin/add-product")}>
                <ListItemIcon><AddBoxIcon /></ListItemIcon>
                <ListItemText primary="Add a Product" />
              </ListItem>
            </>
          ) : (
            <>
              <ListItem button onClick={() => navigate("/orders")}>
                <ListItemIcon><ListAltIcon /></ListItemIcon>
                <ListItemText primary="My Orders" />
              </ListItem>
              <ListItem button onClick={() => navigate("/wishlist")}>
                <ListItemIcon><FavoriteIcon /></ListItemIcon>
                <ListItemText primary="Wishlist" />
              </ListItem>
            </>
          )}
          <Divider />
          <ListItem button onClick={() => navigate("/cart")}>
            <ListItemIcon><ShoppingCartIcon /></ListItemIcon>
            <ListItemText primary={`Cart (${cartItemCount})`} />
          </ListItem>
          {user ? (
            <>
              <ListItem button onClick={() => navigate("/profile")}> 
                <ListItemIcon><AccountCircleIcon /></ListItemIcon>
                <ListItemText primary="Profile" />
              </ListItem>
              <ListItem button onClick={handleLogout}>
                <ListItemIcon><ExitToAppIcon /></ListItemIcon>
                <ListItemText primary="Logout" />
              </ListItem>
            </>
          ) : (
            <ListItem button onClick={() => navigate("/login")}> 
              <ListItemIcon><LoginIcon /></ListItemIcon>
              <ListItemText primary="Login" />
            </ListItem>
          )}
        </List>
      </Box>
    </Slide>
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
                  {adminName}
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