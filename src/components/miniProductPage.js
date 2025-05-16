import React from "react";
import { useSelector } from "react-redux";
import { Card, CardMedia, CardContent, Typography, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

const MiniProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const flavorPrice = product.flavors?.[0]?.price;
  const price = flavorPrice !== undefined ? flavorPrice : product.price || 0;

  let finalPrice = price;
  if (product.isDeal) {
    if (product.discountType === "percent") {
      finalPrice = parseFloat(price) - (parseFloat(price) * parseFloat(product.discountValue)) / 100;
    } else if (product.discountType === "fixed") {
      finalPrice = parseFloat(price) - parseFloat(product.discountValue);
    }
  }

  return (
    <Card
      sx={{
        cursor: "pointer",
        borderRadius: 2,
        boxShadow: 2,
        overflow: "hidden",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
      onClick={() => navigate(`/product/${product._id}`)}
    >
      <CardMedia
        component="img"
        height="140"
        image={product.images?.[0]?.url || product.image?.url || "/placeholder.png"}
        alt={product.name}
        sx={{ objectFit: "contain", backgroundColor: "#f8f8f8" }}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography
          variant="subtitle2"
          fontWeight="bold"
          gutterBottom
          noWrap
        >
          {product.name}
        </Typography>
        {user && ( 
          <Box display="flex" alignItems="center" gap={1}>
            {product.isDeal ? (
              <>
                <Typography
                  variant="body2"
                  sx={{ textDecoration: "line-through", color: "gray" }}
                >
                  ${price.toFixed(2)}
                </Typography>
                <Typography variant="body1" fontWeight="bold" color="green">
                  ${finalPrice.toFixed(2)}
                </Typography>
              </>
            ) : (
              <Typography variant="body1" fontWeight="bold">
                ${price.toFixed(2)}
              </Typography>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default MiniProductCard;