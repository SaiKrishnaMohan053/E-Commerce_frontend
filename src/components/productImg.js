import React, { useState } from "react";
import { Box, CardMedia } from "@mui/material";

const ProductImages = ({ images = [], altText = "Product Image" }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const hasImages = images && images.length > 0;

  const fallbackImage = "https://via.placeholder.com/300x220?text=No+Image";

  return (
    <Box sx={{ position: "relative", width: "100%", px: 1 }}>
      <CardMedia
        component="img"
        sx={{
          width: "100%",
          height: { xs: 180, sm: 220, md: 260 },
          objectFit: "contain",
          border: "1px solid #ccc",
          borderRadius: 1,
          backgroundColor: "#fff",
        }}
        image={hasImages ? images[selectedIndex].url : (fallbackImage || null)}
        alt={altText || "Product Image"}
      />
      {hasImages && (
        <Box
          mt={1}
          display="flex"
          justifyContent="center"
          gap={1}
          overflow="auto"
        >
          {images.map((img, idx) => (
            <Box
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setSelectedIndex(idx)}
              tabIndex={0}
              role="button"
              aria-label={`View image ${idx + 1}`}
              sx={{
                cursor: "pointer",
                border: idx === selectedIndex ? "2px solid #1976d2" : "1px solid #ccc",
                borderRadius: 1,
                flexShrink: 0,
                width: 60,
                height: 60,
                outline: "none",
                "&:focus": {
                  border: "2px solid #1976d2",
                },
              }}
            >
              <CardMedia
                title={`Thumbnail ${idx + 1}`}
                component="img"
                image={img.url}
                loading="lazy"
                alt={`${altText} thumbnail ${idx + 1}`}
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default ProductImages;