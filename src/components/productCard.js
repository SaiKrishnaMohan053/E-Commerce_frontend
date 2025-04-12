import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import InventoryIcon from "@mui/icons-material/Inventory";
import ProductImages from "./productImg";

const ProductCard = ({
  product,
  isAdmin,
  onEdit,
  onUpdateStock,
  onDelete,
  onAddToCart,
}) => {
  const navigate = useNavigate();
  const isLoggedIn = useSelector((state) => Boolean(state.auth.user));

  const initializeEditValues = () => {
    setEditName(product.name);
    setEditDescription(product.description);
    setEditPrice(product.price || 0);
    setEditStock(product.stock || 0);
    setEditIsDeal(product.isDeal || false);
    setEditLimit(product.purchaseLimit || 0);
    setEditDiscountType(product.discountType || "");
    setEditDiscountValue(product.discountValue || 0);
    setEditFlavors(product.flavors ? JSON.parse(JSON.stringify(product.flavors)) : []);
    setNewImages([]);
  };

  const initialFlavors = product.flavors ? JSON.parse(JSON.stringify(product.flavors)) : [];  
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

  const [selectedFlavorForCart, setSelectedFlavorForCart] = useState(
    product.flavors?.[0]?.name || ""
  );

  const [editOpen, setEditOpen] = useState(false);
  const [stockOpen, setStockOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [readMore, setReadMore] = useState(false);
  const DESCRIPTION_LIMIT = 100;
  const fullDescription = product.description || "";
  const shortDescription =
    fullDescription.length > DESCRIPTION_LIMIT
      ? fullDescription.substring(0, DESCRIPTION_LIMIT) + "..."
      : fullDescription;
  const toggleReadMore = () => setReadMore(!readMore);

  const hasFlavors = product.flavors && product.flavors.length > 0;
  const isIndividualPricing = hasFlavors && editFlavors.some((f) => f.price !== undefined && f.price !== null);

  const availableStock =
    hasFlavors
      ? product.flavors.find((f) => f.name === selectedFlavorForCart)?.stock || 0
      : product.stock || 0;

  const getDiscountedPrice = () => {
    let basePrice = 0;
  
    if (hasFlavors && isIndividualPricing) {
      const flavorName = isAdmin ? selectedFlavorForStock : selectedFlavorForCart;
      const selectedFlavorObj = product.flavors.find((f) => f.name === flavorName);
      basePrice = selectedFlavorObj?.price || 0;
    } else {
      basePrice = editPrice;
    }
  
    if (!product.isDeal || !product.discountType) return null;
  
    if (product.discountType === "percent") {
      return basePrice - (basePrice * product.discountValue) / 100;
    } else if (product.discountType === "fixed") {
      return basePrice - product.discountValue;
    }
    return null;
  };
  
  const renderPrice = () => {
    const discounted = getDiscountedPrice();
    const flavorName = isAdmin ? selectedFlavorForStock : selectedFlavorForCart;
    const flavorPrice =
      hasFlavors && isIndividualPricing
        ? product.flavors.find((f) => f.name === flavorName)?.price
        : null;
    const basePrice =
      flavorPrice !== null && flavorPrice !== undefined ? flavorPrice : editPrice;
  
      if (discounted !== null && discounted < basePrice) {
        const discountLabel =
          product.discountType === "percent"
            ? `(-${product.discountValue}%)`
            : `(-$${Number(product.discountValue).toFixed(2)})`;
      
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
              ${Number(basePrice).toFixed(2)}
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
              ${Number(discounted).toFixed(2)}
            </Typography>
          </Box>
        );
      }
       else {
      return (
        <Typography
          variant="h6"
          sx={{
            mt: 1,
            fontWeight: "bold",
            fontSize: { xs: "1rem", sm: "1.2rem", md: "1.4rem" },
          }}
        >
          ${Number(basePrice).toFixed(2)}
        </Typography>
      );
    }
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
  
    if (!hasFlavors && (editPrice === undefined || editPrice === null || editPrice === "")) {
      alert("Price is required for non-flavored products.");
      return;
    }
  
    if (hasFlavors) {
      const hasEmptyFlavor = editFlavors.some(f => !f.name.trim());
      if (hasEmptyFlavor) {
        alert("Each flavor must have a name.");
        return;
      }
    }

    if (hasFlavors) {
      if (isIndividualPricing) {
        formData.append("flavors", JSON.stringify(editFlavors));
      } else {
        formData.append("price", editPrice);
        formData.append(
          "flavors",
          JSON.stringify(editFlavors.map((f) => ({ ...f, price: undefined })))
        );
      }
      formData.append("stock", "");
    } else {
      formData.append("price", editPrice);
      formData.append("stock", editStock);
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

  const handleFlavorChange = (index, field, value) => {
    const newFlavors = [...editFlavors];
    newFlavors[index][field] = value;
    setEditFlavors(newFlavors);
  };

  const handleAddFlavor = () => {
    const newFlavor = {
      name: "",
      stock: 0,
      ...(isIndividualPricing ? { price: 0 } : {}),
    };
    setEditFlavors([...editFlavors, newFlavor]);
  };

  const handleSubmitStock = () => {
    const payload = {
      id: product._id,
      stock: Number(newStock),
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
    if (hasFlavors) {
      onAddToCart(product, selectedFlavorForCart);
    } else {
      onAddToCart(product);
    }
  };

  const handleClick = () => {
    navigate(`/product/${product._id}`);
  };

  return (
    <Card
      sx={{
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
          onClick={!isAdmin ? handleClick : undefined}
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
            }}>
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
                product.flavors?.find((f) => f.name === defaultFlavor)?.stock || product.stock || 0
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
                {product.flavors.map((f) => (
                  <MenuItem key={f.name} value={f.name}>
                    {f.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          {Number(availableStock) === 0 ? (
            <Button variant="contained" fullWidth disabled>
              Out of Stock
            </Button>
          ) : (
            <Button variant="contained" fullWidth onClick={handleAddToCart}>
              Add to Cart
            </Button>
          )}
        </Box>
      )}

      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        maxWidth="sm"
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            width: { xs: "95%", sm: "90%", md: "80%" },
          },
        }}
      >
        <DialogTitle>Edit Product</DialogTitle>
        <DialogContent dividers>
          <TextField
            label="Name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            fullWidth
            margin="dense"
          />
          <TextField
            label="Description"
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            fullWidth
            multiline
            rows={3}
            margin="dense"
          />
          {hasFlavors ? (
            <>
              <Typography mt={2} fontWeight="bold">
                Flavors
              </Typography>
              {editFlavors.map((flavor, idx) => (
                <Box
                  key={idx}
                  display="flex"
                  gap={1}
                  mt={1}
                  flexDirection={{ xs: "column", sm: "row" }}
                >
                  <TextField
                    label="Flavor Name"
                    value={flavor.name}
                    onChange={(e) =>
                      handleFlavorChange(idx, "name", e.target.value)
                    }
                    fullWidth
                  />
                  {isIndividualPricing && (
                    <TextField
                      label="Price"
                      type="number"
                      value={flavor.price}
                      onChange={(e) =>
                        handleFlavorChange(idx, "price", parseFloat(e.target.value) || 0)
                      }
                      sx={{ width: { xs: "100%", sm: 100 } }}
                    />
                  )}
                  <TextField
                    label="Stock"
                    type="number"
                    value={flavor.stock}
                    onChange={(e) =>
                      handleFlavorChange(idx, "stock", parseFloat(e.target.value) || 0)
                    }
                    sx={{ width: { xs: "100%", sm: 100 } }}
                  />
                </Box>
              ))}
              <Box mt={2}>
                <Button variant="outlined" onClick={handleAddFlavor}>
                  Add Flavor
                </Button>
              </Box>
              {!isIndividualPricing && (
                <TextField
                  label="Shared Price"
                  type="number"
                  value={editPrice}
                  onChange={(e) => setEditPrice(parseFloat(e.target.value) || 0)}
                  fullWidth
                  margin="dense"
                />
              )}
            </>
          ) : (
            <>
              <TextField
                label="Price"
                type="number"
                value={editPrice}
                onChange={(e) => setEditPrice(parseFloat(e.target.value) || 0)}
                fullWidth
                margin="dense"
              />
              <TextField
                label="Stock"
                type="number"
                value={editStock}
                onChange={(e) => setEditStock(parseFloat(e.target.value) || 0)}
                fullWidth
                margin="dense"
              />
            </>
          )}

          <Box mt={2}>
            <Typography variant="subtitle1">Edit Images</Typography>
            <Button variant="outlined" component="label">
              Upload New Images
              <input
                type="file"
                accept="image/*,application/pdf"
                hidden
                multiple
                onChange={handleImageChange}
              />
            </Button>
            {newImages.length > 0 && (
              <Box mt={1} display="flex" gap={1} flexWrap="wrap">
                {newImages.map((file, index) => (
                  <Typography key={index} variant="caption">
                    {file.name}
                  </Typography>
                ))}
              </Box>
            )}
          </Box>
          <TextField
            label="Purchase Limit"
            type="number"
            value={editLimit}
            onChange={(e) => setEditLimit(parseFloat(e.target.value) || 0)}
            fullWidth
            margin="dense"
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Is Deal?</InputLabel>
            <Select
              value={product.isDeal ? "true" : "false"}
              onChange={(e) => setEditIsDeal(e.target.value === "true")}
              label="Is Deal?"
            >
              <MenuItem value="false">No</MenuItem>
              <MenuItem value="true">Yes</MenuItem>
            </Select>
          </FormControl>
          {editIsDeal && (
              <>
                <FormControl fullWidth margin="dense">
                  <InputLabel>Discount Type</InputLabel>
                  <Select
                    value={editDiscountType}
                    onChange={(e) => setEditDiscountType(e.target.value)}
                    label="Discount Type"
                  >
                    <MenuItem value="percent">Percent</MenuItem>
                    <MenuItem value="fixed">Fixed</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  label="Discount Value"
                  type="number"
                  value={editDiscountValue}
                  onChange={(e) => setEditDiscountValue(parseFloat(e.target.value) || 0)}
                  fullWidth
                  margin="dense"
                />
              </>
            )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            initializeEditValues();   
            setEditOpen(false);     
          }}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmitEdit}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={stockOpen}
        onClose={() => setStockOpen(false)}
        sx={{
          "& .MuiDialog-paper": {
            width: { xs: "95%", sm: "90%", md: "80%" },
          },
        }}
      >
        <DialogTitle>Update Stock</DialogTitle>
        <DialogContent>
          {hasFlavors && (
            <FormControl fullWidth margin="normal">
              <InputLabel>Flavor</InputLabel>
              <Select
                value={selectedFlavorForStock}
                onChange={handleFlavorChangeForStock}
                label="Flavor"
              >
                {product.flavors.map((f) => (
                  <MenuItem key={f.name} value={f.name}>
                    {f.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          <TextField
            type="number"
            label="New Stock"
            value={newStock}
            onChange={(e) => setNewStock(parseFloat(e.target.value) || 0)}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            const defaultFlavor = product.flavors?.[0]?.name || "";
            setSelectedFlavorForStock(defaultFlavor);
            setNewStock(
              product.flavors?.find((f) => f.name === defaultFlavor)?.stock || product.stock || 0
            );
            setStockOpen(false);
          }}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmitStock}>
            Update
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        sx={{
          "& .MuiDialog-paper": {
            width: { xs: "95%", sm: "90%", md: "80%" },
          },
        }}
      >
        <DialogTitle>Delete Product</DialogTitle>
        <DialogContent>
          Are you sure you want to delete <b>{product.name}</b>?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleConfirmDelete}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default ProductCard;