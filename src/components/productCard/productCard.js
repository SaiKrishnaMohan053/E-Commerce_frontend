import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import InventoryIcon from "@mui/icons-material/Inventory";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";

import { addToCart,updateCartItem, removeCartItem } from "../../store/slices/cartSlice";
import { addWishlistItem, removeWishlistItem } from "../../store/slices/wishlistSlice";
import ProductImages from "../productImg";
import EditModal from "./editModal";
import StockUpdateModal from "./stockUpdateModal";
import DeleteModal from "./deleteModal";

const ProductCard = ({
  product,
  isAdmin,
  onEdit,
  onUpdateStock,
  onDelete,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state) => Boolean(state.auth.user));
  const cartItems = useSelector((state) => state.cart.items);
  const inWishlist = useSelector((state) => state.wishlist.items.some(item => item._id === product._id));

  const sortFlavorsAZ = (flavors = []) =>
    [...flavors].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
    ); 
  const initialFlavors = product.flavors
    ? sortFlavorsAZ(product.flavors)
    : [];
  const [selectedFlavorForCart, setSelectedFlavorForCart] = useState(
    product.flavors?.[0]?.name || ""
  );
  const purchaseLimit = product.purchaseLimit && product.purchaseLimit > 0
    ? product.purchaseLimit
    : Infinity;
  const cartItem = cartItems.find(
    (it) =>
      it.productId._id === product._id &&
      (!product.flavors?.length || it.flavor === selectedFlavorForCart)
  );
  const qty = cartItem?.qty || 0;

  const [editFlavors, setEditFlavors] = useState(initialFlavors);
  const [editName, setEditName] = useState(product.name);
  const [editDescription, setEditDescription] = useState(product.description);
  const [editPrice, setEditPrice] = useState(product.price || 0);
  const [editStock, setEditStock] = useState(product.stock || 0);
  const [editIsDeal, setEditIsDeal] = useState(product.isDeal || false);
  const [editLimit, setEditLimit] = useState(product.purchaseLimit || 0);
  const [editDiscountType, setEditDiscountType] = useState(
    product.discountType || ""
  );
  const [editDiscountValue, setEditDiscountValue] = useState(
    product.discountValue || 0
  );
  const [newImages, setNewImages] = useState([]);

  const [selectedFlavorForStock, setSelectedFlavorForStock] = useState(
    initialFlavors[0]?.name || ""
  );
  const [newStock, setNewStock] = useState(
    initialFlavors[0]?.stock || product.stock || 0
  );
  const [editOpen, setEditOpen] = useState(false);
  const [stockOpen, setStockOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [readMore, setReadMore] = useState(false);

  const initializeEditValues = () => {
    setEditName(product.name);
    setEditDescription(product.description);
    setEditPrice(product.price || 0);
    setEditStock(product.stock || 0);
    setEditIsDeal(product.isDeal || false);
    setEditLimit(product.purchaseLimit || 0);
    setEditDiscountType(product.discountType || "");
    setEditDiscountValue(product.discountValue || 0);
    setEditFlavors(sortFlavorsAZ(product.flavors));
    setNewImages([]);
  };

  const DESCRIPTION_LIMIT = 50;
  const fullDescription = product.description || "";
  const shortDescription =
    fullDescription.length > DESCRIPTION_LIMIT
      ? fullDescription.substring(0, DESCRIPTION_LIMIT) + "..."
      : fullDescription;
  const toggleReadMore = () => setReadMore(!readMore);

  const originalFlavors = product.flavors && product.flavors.length > 0;
  const hasFlavors = editFlavors && editFlavors.length > 0;
  const isIndividualPricing =
    hasFlavors &&
    editFlavors.some((f) => f.price !== undefined && f.price !== null);

  const availableStock =
    (editFlavors && editFlavors.length > 0
      ? editFlavors.find((f) => f.name === selectedFlavorForCart)?.stock
      : product.flavors &&
        product.flavors.find((f) => f.name === selectedFlavorForCart)?.stock) ||
    product.stock ||
    0;

  const getDiscountedPrice = () => {
    let basePrice = 0;

    if (hasFlavors && isIndividualPricing) {
      const flavorName = isAdmin ? selectedFlavorForStock : selectedFlavorForCart;
      const selectedFlavorObj = product.flavors.find((f) => f.name === flavorName);
      basePrice = selectedFlavorObj?.price || 0;
    } else {
      basePrice = parseFloat(editPrice);
    }

    if (!product.isDeal || !product.discountType) return null;

    if (product.discountType === "percent") {
      return basePrice - (basePrice * parseFloat(product.discountValue)) / 100;
    } else if (product.discountType === "fixed") {
      return basePrice - parseFloat(product.discountValue);
    }
    return null;
  };

  const handleDeleteFlavor = (idx) => {
    const newFlavors = [...editFlavors];
    newFlavors.splice(idx, 1);
    setEditFlavors(newFlavors);
  };

  const handleFlavorChange = (index, field, value) => {
    setEditFlavors((prev) =>
      prev.map((flavor, idx) =>
        idx === index
          ? { 
              ...flavor,
              [field]: value 
            }
          : flavor
      )
    );
  };

  const handleAddFlavor = () => {
    const newFlavor = {
      name: "",
      stock: 0,
      ...(isIndividualPricing ? { price: 0 } : {}),
    };
    setEditFlavors([...editFlavors, newFlavor]);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setNewImages(files);
  };

  const handleSubmitEdit = () => {
    const formData = new FormData();
    formData.append("_id", product._id);
    formData.append("name", editName);
    formData.append("description", editDescription);
    formData.append("purchaseLimit", editLimit);
    formData.append("isDeal", editIsDeal);
    formData.append("discountType", editDiscountType);
    formData.append("discountValue", editDiscountValue);
    formData.append("category", product.category);
    formData.append(
      "subCategories",
      product.subCategories ? product.subCategories.join(",") : ""
    );

    if (!editName.trim()) {
      alert("Product name is required.");
      return;
    }

    if (!editDescription.trim()) {
      alert("Product description is required.");
      return;
    }

    if (!hasFlavors && (parseFloat(editPrice) === 0 || editPrice === "")) {
      alert("Price is required for non-flavored products.");
      return;
    }

    if (hasFlavors) {
      const hasEmptyFlavor = editFlavors.some((f) => !f.name.trim());
      if (hasEmptyFlavor) {
        alert("Each flavor must have a name.");
        return;
      }
    }

    if (hasFlavors) {
      if (isIndividualPricing) {
        formData.append("flavors", JSON.stringify(editFlavors));
      } else {
        formData.append("price", parseFloat(editPrice));
        formData.append(
          "flavors",
          JSON.stringify(editFlavors.map((f) => ({ ...f, price: undefined })))
        );
      }
      formData.append("stock", "");
    } else {
      formData.append("price", parseFloat(editPrice));
      formData.append("stock", parseFloat(editStock));
    }

    newImages.forEach((file) => {
      formData.append("files", file);
    });

    for (let pair of formData.entries()) {
      console.log(`${pair[0]}: ${pair[1]}`);
    }

    onEdit(formData);
    setEditOpen(false);
  };

  const handleSubmitStock = () => {
    const payload = {
      id: product._id,
      stock: parseFloat(newStock),
      ...(hasFlavors ? { name: selectedFlavorForStock } : {}),
    };
    onUpdateStock(payload);
    setStockOpen(false);
  };

  const handleConfirmDelete = () => {
    onDelete(product);
    setDeleteOpen(false);
  };

  const handleFlavorChangeForStock = (e) => {
    const flavor = e.target.value;
    setSelectedFlavorForStock(flavor);
    const flavorObj = product.flavors.find((f) => f.name === flavor);
    setNewStock(flavorObj?.stock || 0);
  };

  const handleFlavorChangeForCart = (e) => {
    setSelectedFlavorForCart(e.target.value);
  };

  const handleAddToCart = () => {
    if(!isLoggedIn){
      navigate("/login");
    }
    
    const qty = 1;
    const flavor = hasFlavors ? selectedFlavorForCart : null;
    const rawPrice = getDiscountedPrice() ??
      (hasFlavors && isIndividualPricing
        ? product.flavors.find((f) => f.name === selectedFlavorForCart)?.price
        : product.price);
  
    const price = parseFloat(rawPrice);
  
    dispatch(addToCart({
      productId: product._id,
      flavor : flavor || null,
      qty: Number(qty),
      price: parseFloat(price)
    }))
  };    

  const handleClick = () => {
    navigate(`/product/${product._id}`);
  };

  const handleIncrease = () =>
    dispatch(updateCartItem({
      productId: product._id,
      flavor: cartItem?.flavor,
      qty: qty + 1
    }));
  
  const handleDecrease = () => {
    if (qty > 1) {
      dispatch(updateCartItem({
        productId: product._id,
        flavor: cartItem?.flavor,
        qty: qty - 1
      }));
    } else {
      dispatch(removeCartItem({
        productId: product._id,
        flavor: cartItem?.flavor
      }));
    }
  };
  
  const handleRemove = () => {
    dispatch(removeCartItem({
      productId: product._id,
      flavor: cartItem?.flavor
    }));  
  }

  const renderPrice = () => {
    const discounted = getDiscountedPrice();
    const flavorName = isAdmin ? selectedFlavorForStock : selectedFlavorForCart;
    const flavorPrice =
      hasFlavors && isIndividualPricing
        ? product.flavors.find((f) => f.name === flavorName)?.price
        : null;
    const basePrice =
      flavorPrice !== null && flavorPrice !== undefined
        ? parseFloat(flavorPrice)
        : parseFloat(editPrice);

    if (discounted !== null && discounted < basePrice) {
      const discountLabel =
        product.discountType === "percent"
          ? `(-${product.discountValue}%)`
          : `(-$${parseFloat(product.discountValue).toFixed(2)})`;

      return (
        <Box display="flex" alignItems="center" gap={1}>
          <Typography
            variant="body2"
            sx={{
              textDecoration: "line-through",
              color: "gray",
              fontSize: { xs: "0.9rem", sm: "1rem" },
            }}
          >
            ${parseFloat(basePrice).toFixed(2)}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontStyle: "italic",
              color: "green",
              fontSize: { xs: "0.75rem", sm: "0.9rem" },
            }}
          >
            {discountLabel}
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: "green",
              fontWeight: "bold",
              fontSize: { xs: "1rem", sm: "1.2rem", md: "1.3rem" },
            }}
          >
            ${parseFloat(discounted).toFixed(2)}
          </Typography>
        </Box>
      );
    } else {
      return (
        <Typography
          variant="h6"
          sx={{
            mt: 1,
            fontWeight: "bold",
            fontSize: { xs: "1rem", sm: "1.2rem", md: "1.4rem" },
          }}
        >
          ${parseFloat(basePrice).toFixed(2)}
        </Typography>
      );
    }
  };

  return (
    <Card
      sx={{
        position: "relative",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxShadow: 3,
        borderRadius: 2,
        p: 2,
        minHeight: { xs: "auto", sm: 380, md: 420 },
      }}
    >
      <IconButton
        onClick={() =>
          inWishlist
            ? dispatch(removeWishlistItem(product._id))
            : dispatch(addWishlistItem(product._id))
        }
        sx={{
          position: 'absolute',
          top: 12,
          right: 20,
          zIndex: 1,
        }}
        aria-label={inWishlist ? "Remove from favorites" : "Add to favorites"}
      >
        {inWishlist ? (
          <FavoriteIcon color="error" />
        ) : (
          <FavoriteBorderIcon />
        )}
      </IconButton>
      <CardContent
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          gap: 1,
          p: 0,
        }}
      >
        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            overflow: "hidden",
          }}
        >
          <ProductImages images={product.images} altText={product.name} />
        </Box>

        <Typography
          onClick={isAdmin ? null : handleClick}
          variant="subtitle1"
          fontWeight="bold"
          sx={{
            fontSize: { xs: "1rem", sm: "1.1rem", md: "1.2rem" },
            lineHeight: 1.3,
            height: 48,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            cursor: isAdmin ? "default" : "pointer",
          }}
        >
          {product.name}
        </Typography>

        {isLoggedIn && product.isDeal && product.discountType && (
          <Typography
            variant="body2"
            sx={{
              display: "inline-block",
              backgroundColor: "#ffa726",
              color: "#fff",
              fontSize: "0.75rem",
              px: 1,
              py: 0.3,
              borderRadius: 1,
              fontWeight: 600,
              width: "fit-content",
            }}
          >
            🔥 Deal
          </Typography>
        )}

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            flexWrap: "wrap",
            minHeight: 30,
          }}
        >
          {isLoggedIn && renderPrice()}
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            mb: 1,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              fontSize: "0.95rem",
              color: "text.secondary",
              wordBreak: "break-word",
              overflow: "hidden",
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: readMore ? "none" : 2,
            }}
          >
            {readMore ? fullDescription : shortDescription}
          </Typography>

          {fullDescription.length > DESCRIPTION_LIMIT && (
            <Button
              size="small"
              onClick={toggleReadMore}
              sx={{
                textTransform: "none",
                fontSize: "0.75rem",
                mt: 0.5,
                minWidth: "fit-content",
                color: "#1976d2",
              }}
            >
              {readMore ? "Read Less" : "Read More"}
            </Button>
          )}
        </Box>

        {Number(availableStock) === 0 && (
          <Typography
            variant="h6"
            sx={{
              color: "red",
              fontWeight: "bold",
              fontSize: { xs: "1rem", sm: "1.2rem", md: "1.4rem" },
            }}
          >
            Out of Stock
          </Typography>
        )}
      </CardContent>

      {isAdmin ? (
        <Box display="flex" justifyContent="space-around" pb={{ xs: 1, sm: 2 }}>
          <IconButton
            color="primary"
            onClick={() => {
              initializeEditValues();
              setEditOpen(true);
            }}
            sx={{
              fontSize: { xs: "1rem", sm: "1.2rem", md: "1.4rem" },
            }}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            color="warning"
            onClick={() => {
              const defaultFlavor = product.flavors?.[0]?.name || "";
              setSelectedFlavorForStock(defaultFlavor);
              setNewStock(
                product.flavors?.find((f) => f.name === defaultFlavor)?.stock ||
                  product.stock ||
                  0
              );
              setStockOpen(true);
            }}
            sx={{
              fontSize: { xs: "1rem", sm: "1.2rem", md: "1.4rem" },
            }}
          >
            <InventoryIcon />
          </IconButton>
          <IconButton
            color="error"
            onClick={() => setDeleteOpen(true)}
            sx={{
              fontSize: { xs: "1rem", sm: "1.2rem", md: "1.4rem" },
            }}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ) : (
        <Box mt="auto" sx={{ p: 1 }}>
          {hasFlavors && (
            <FormControl fullWidth size="small" sx={{ mt: 1, mb: 1 }}>
              <InputLabel>Flavor</InputLabel>
              <Select
                value={selectedFlavorForCart}
                onChange={handleFlavorChangeForCart}
                label="Flavor"
              >
                {(editFlavors && editFlavors.length > 0
                  ? editFlavors
                  : product.flavors).map((f) => (
                  <MenuItem key={f.name} value={f.name}>
                    {f.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          { cartItem ? (
            <Box display="flex" alignItems="center" gap={1}>
              <IconButton type="button" size="small" onClick={handleDecrease}>
                { qty > 1 && <RemoveIcon /> }
              </IconButton>

              <TextField
                type="number"
                value={qty}
                size="small"
                onChange={(e) => {
                  let v = Number(e.target.value) || 1;
                  v = Math.max(1, Math.min(purchaseLimit, v));
                  dispatch(updateCartItem({
                    productId: product._id,
                    flavor: cartItem.flavor,
                    qty: v
                  }));
                }}
                inputProps={{
                  min: 1,
                  max: purchaseLimit === Infinity ? undefined : purchaseLimit,
                  style: { textAlign: "center" },
                }}
                sx={{ width: 60 }}
              />

              <IconButton
                type="button"
                size="small"
                onClick={handleIncrease}
                disabled={qty >= purchaseLimit}
              >
                <AddIcon />
              </IconButton>

              <IconButton type="button" size="small" onClick={handleRemove}>
                <DeleteIcon color="error" />
              </IconButton>
            </Box>
          ) : (
            <Button
              type="button"
              variant="contained"
              fullWidth
              onClick={handleAddToCart}
              disabled={Number(availableStock) === 0}
            >
              Add to Cart
            </Button>
          )}
        </Box>
      )}
      {purchaseLimit < Infinity && (
        <Typography variant="caption" color="text.secondary">
          {`Limit: ${purchaseLimit}`}
        </Typography>
      )}
      <EditModal
        open={editOpen}
        handleClose={() => setEditOpen(false)}
        product={product}
        editName={editName}
        setEditName={setEditName}
        editDescription={editDescription}
        setEditDescription={setEditDescription}
        editPrice={editPrice}
        setEditPrice={setEditPrice}
        editStock={editStock}
        setEditStock={setEditStock}
        editIsDeal={editIsDeal}
        setEditIsDeal={setEditIsDeal}
        editLimit={editLimit}
        setEditLimit={setEditLimit}
        editDiscountType={editDiscountType}
        setEditDiscountType={setEditDiscountType}
        editDiscountValue={editDiscountValue}
        setEditDiscountValue={setEditDiscountValue}
        originalFlavors={originalFlavors}
        editFlavors={editFlavors}
        isIndividualPricing={isIndividualPricing}
        handleFlavorChange={handleFlavorChange}
        handleDeleteFlavor={handleDeleteFlavor}
        handleAddFlavor={handleAddFlavor}
        newImages={newImages}
        handleImageChange={handleImageChange}
        handleSubmitEdit={handleSubmitEdit}
      />

      <StockUpdateModal
        open={stockOpen}
        handleClose={() => setStockOpen(false)}
        product={product}
        selectedFlavorForStock={selectedFlavorForStock}
        handleFlavorChangeForStock={handleFlavorChangeForStock}
        newStock={newStock}
        setNewStock={setNewStock}
        handleSubmitStock={handleSubmitStock}
      />

      <DeleteModal
        open={deleteOpen}
        handleClose={() => setDeleteOpen(false)}
        product={product}
        handleConfirmDelete={handleConfirmDelete}
      />
    </Card>
  );
};

export default ProductCard;