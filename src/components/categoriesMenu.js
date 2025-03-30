import React, { useState, useRef, memo } from "react";
import {
  Menu,
  MenuItem,
  Box,
  Typography,
  IconButton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import MedicationIcon from "@mui/icons-material/Medication";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import VapeFreeIcon from "@mui/icons-material/VapeFree";
import CheckroomIcon from "@mui/icons-material/Checkroom";
import TwoWheelerIcon from "@mui/icons-material/TwoWheeler";
import ManIcon from "@mui/icons-material/Man";
import DevicesIcon from "@mui/icons-material/Devices";
import WeekendIcon from "@mui/icons-material/Weekend";
import FaceRetouchingNaturalIcon from "@mui/icons-material/FaceRetouchingNatural";
import ShoppingBasketIcon from "@mui/icons-material/ShoppingBasket";

const categories = [
  { name: "Medicines", icon: <MedicationIcon />, subcategories: [] },
  { name: "Supplements", icon: <FitnessCenterIcon />, subcategories: [] },
  { name: "Vapes", icon: <VapeFreeIcon />, subcategories: ["Disposable", "Flavored"] },
  { name: "T-Shirts", icon: <CheckroomIcon />, subcategories: [] },
  { name: "Two Wheelers", icon: <TwoWheelerIcon />, subcategories: ["Petrol Vehicles", "Electric Vehicles"] },
  { name: "Fashion", icon: <ManIcon />, subcategories: ["Men", "Women", "Kids"] },
  { name: "Electronics", icon: <DevicesIcon />, subcategories: ["Mobiles", "Laptops", "Accessories"] },
  { name: "Home & Furniture", icon: <WeekendIcon />, subcategories: ["Decor", "Kitchen", "Bedroom"] },
  { name: "Beauty & Health", icon: <FaceRetouchingNaturalIcon />, subcategories: ["Skincare", "Haircare", "Makeup"] },
  { name: "Groceries", icon: <ShoppingBasketIcon />, subcategories: ["Fruits", "Vegetables", "Dairy"] },
];

const CategoryItem = memo(({ category, handleOpen, navigate, anchorEl, currentCategory, handleClose }) => (
  <div key={category.name}>
    <Typography
      tabIndex={0}
      role="button"
      aria-haspopup={category.subcategories.length > 0}
      aria-expanded={currentCategory === category}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          category.subcategories.length > 0
            ? handleOpen(e, category)
            : navigate(`/category/${category.name}`);
        }
      }}
      sx={{
        cursor: "pointer",
        fontWeight: "bold",
        fontSize: { xs: "14px", sm: "16px" },
        padding: { xs: "6px", sm: "8px" },
        display: "flex",
        alignItems: "center",
        gap: 1,
        "&:hover": { color: "#1976d2" },
      }}
      onClick={(e) =>
        category.subcategories.length > 0
          ? handleOpen(e, category)
          : navigate(`/category/${category.name}`)
      }
    >
      {category.icon} {category.name}
      {category.subcategories.length > 0 && " ▼"}
    </Typography>

    {category.subcategories.length > 0 && (
      <Menu
        anchorEl={anchorEl}
        open={currentCategory === category}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
        sx={{ mt: 1 }}
      >
        {category.subcategories.map((sub) => (
          <MenuItem
            key={sub}
            onClick={() => {
              navigate(`/category/${category.name}/${sub}`);
              handleClose();
            }}
          >
            {sub}
          </MenuItem>
        ))}
      </Menu>
    )}
  </div>
));

const CategoriesMenu = () => {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentCategory, setCurrentCategory] = useState(null);

  const handleOpen = (event, category) => {
    setAnchorEl(event.currentTarget);
    setCurrentCategory(category);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setCurrentCategory(null);
  };

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        backgroundColor: "#f8f9fa",
        padding: "10px 0",
        borderBottom: "1px solid #ddd",
        position: "relative",
        maxWidth: "100vw",
        overflowX: "hidden",
      }}
    >
      <IconButton
        sx={{
          position: "absolute",
          left: 0,
          zIndex: 1,
          backgroundColor: "white",
          boxShadow: "1px 1px 5px rgba(0,0,0,0.2)",
          width: { xs: "30px", sm: "40px" },
          height: { xs: "30px", sm: "40px" },
        }}
        onClick={() => handleScroll("left")}
        aria-label="Scroll Left"
      >
        <ArrowBackIosNewIcon fontSize="small" />
      </IconButton>

      <Box
        ref={scrollRef}
        sx={{
          display: "flex",
          gap: "20px",
          whiteSpace: "nowrap",
          overflowX: "auto",
          scrollBehavior: "smooth",
          padding: "0 50px",
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        {categories.map((category) => (
          <CategoryItem
            key={category.name}
            category={category}
            handleOpen={handleOpen}
            handleClose={handleClose}
            anchorEl={anchorEl}
            currentCategory={currentCategory}
            navigate={navigate}
          />
        ))}
      </Box>

      <IconButton
        sx={{
          position: "absolute",
          right: 0,
          zIndex: 1,
          backgroundColor: "white",
          boxShadow: "1px 1px 5px rgba(0,0,0,0.2)",
          width: { xs: "30px", sm: "40px" },
          height: { xs: "30px", sm: "40px" },
        }}
        onClick={() => handleScroll("right")}
        aria-label="Scroll Right"
      >
        <ArrowForwardIosIcon fontSize="small" />
      </IconButton>
    </Box>
  );
};

export default CategoriesMenu;