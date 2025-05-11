import React, { useState, useEffect, useRef, memo } from "react";
import {
  Box,
  Typography,
  Menu,
  MenuItem,
  IconButton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import MedicationIcon from "@mui/icons-material/Medication";
import VapeFreeIcon from "@mui/icons-material/VapeFree";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import LightIcon from "@mui/icons-material/Light";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";
import LocalFloristIcon from "@mui/icons-material/LocalFlorist";

const API_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

const FALLBACK_ICON = {
  Medicines:           <MedicationIcon />,
  Disposables:         <VapeFreeIcon />,
  Supplements:         <FitnessCenterIcon />,
  "Incense Sticks":    <WhatshotIcon />,
  "Lighters & Butanes":<LightIcon />,
  Grinders:            <PrecisionManufacturingIcon />,
  Cannabis:            <LocalFloristIcon />,
};

const CategoryItem = memo(({
  category,
  handleOpen,
  handleClose,
  anchorEl,
  currentCategory,
  navigate
}) => {
  const hasSubs = category.subCategories.length > 0;

  return (
    <Box key={category.category}>
      <Typography
        tabIndex={0}
        role="button"
        aria-haspopup={hasSubs}
        aria-expanded={currentCategory === category.category}
        onKeyDown={e => {
          if (e.key === "Enter" || e.key === " ") {
            hasSubs
              ? handleOpen(e, category.category)
              : navigate(`/category/${category.category}`);
          }
        }}
        onClick={e => {
          hasSubs
            ? handleOpen(e, category.category)
            : navigate(`/category/${category.category}`);
        }}
        sx={{
          whiteSpace: "nowrap",
          cursor: "pointer",
          display: "flex",
          flexShrink: 0,
          alignItems: "center",
          gap: 1,
          fontWeight: "bold",
          fontSize: { xs: "14px", sm: "16px" },
          px: { xs: 1, sm: 2 },
          "&:hover": { color: "#1976d2" },
        }}
      >
        {category.imageUrl
          ? <Box
              component="img"
              src={category.imageUrl}
              alt={category.category}
              sx={{ width: 24, height: 24, objectFit: "cover", borderRadius: "4px" }}
            />
          : FALLBACK_ICON[category.category] || null
        }
        {category.category}
        {hasSubs && " ▼"}
      </Typography>

      {hasSubs && (
        <Menu
          anchorEl={anchorEl}
          open={currentCategory === category.category}
          onClose={handleClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          transformOrigin={{ vertical: "top", horizontal: "center" }}
          sx={{ mt: 1 }}
        >
          {category.subCategories.map(sub => (
            <MenuItem
              key={sub}
              onClick={() => {
                navigate(`/category/${category.category}/${sub}`);
                handleClose();
              }}
            >
              {sub}
            </MenuItem>
          ))}
        </Menu>
      )}
    </Box>
  );
});

const CategoriesMenu = () => {
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentCategory, setCurrentCategory] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/products/getCategories`);
        setCategories(data);
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    })();
  }, []);

  const handleOpen = (e, cat) => {
    setAnchorEl(e.currentTarget);
    setCurrentCategory(cat);
  };
  const handleClose = () => {
    setAnchorEl(null);
    setCurrentCategory(null);
  };

  const handleScroll = dir => {
    const c = scrollRef.current;
    if (!c) return;
    const amt = 200;
    const max = c.scrollWidth - c.clientWidth;
    const left = dir === "left"
      ? Math.max(0, c.scrollLeft - amt)
      : Math.min(max, c.scrollLeft + amt);
    c.scrollTo({ left, behavior: "smooth" });
  };

  return (
    <Box
      sx={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        bgcolor: "#f8f9fa",
        py: 1,
        borderBottom: 1,
        borderColor: "divider",
        overflowX: "hidden",
        whiteSpace: "nowrap",
      }}
    >
      <IconButton
        onClick={() => handleScroll("left")}
        sx={{ position: "absolute", left: 0, zIndex: 1, bgcolor: "background.paper" }}
        aria-label="Scroll Left"
      >
        <ArrowBackIosNewIcon fontSize="small" />
      </IconButton>

      <Box
        ref={scrollRef}
        sx={{
          display: "flex",
          gap: 2,
          px: 5,
          overflowX: "auto",
          scrollBehavior: "smooth",
          whiteSpace: "nowrap",
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        {categories.map(cat => (
          <CategoryItem
            key={cat.category}
            category={cat}
            handleOpen={handleOpen}
            handleClose={handleClose}
            anchorEl={anchorEl}
            currentCategory={currentCategory}
            navigate={navigate}
          />
        ))}
      </Box>

      <IconButton
        onClick={() => handleScroll("right")}
        sx={{ position: "absolute", right: 0, zIndex: 1, bgcolor: "background.paper" }}
        aria-label="Scroll Right"
      >
        <ArrowForwardIosIcon fontSize="small" />
      </IconButton>
    </Box>
  );
};

export default CategoriesMenu;