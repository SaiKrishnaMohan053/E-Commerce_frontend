import React, { useState } from "react";
import {
  Box,
  Container,
  Button,
  TextField,
  Typography,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Grid,
} from "@mui/material";
import { useDispatch } from "react-redux";

import { createProduct } from "../../store/slices/productSlice";
import { showAlert } from "../../store/slices/alertSlice";

const AddProduct = () => {
  const dispatch = useDispatch();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [subCategories, setSubCategories] = useState("");
  const [description, setDescription] = useState("");
  const [purchaseLimit, setPurchaseLimit] = useState("");
  const [isDeal, setIsDeal] = useState(false);
  const [discountType, setDiscountType] = useState("");
  const [discountValue, setDiscountValue] = useState(0);
  const [flavors, setFlavors] = useState([]);
  const [stock, setStock] = useState(0);
  const [price, setPrice] = useState(0);
  const [files, setFiles] = useState([]);
  const [isIndividualPricing, setIsIndividualPricing] = useState(false);

  const handleFlavorChange = (index, field, value) => {
    const newFlavors = [...flavors];
    newFlavors[index][field] = value;
    setFlavors(newFlavors);
  };

  const handleAddFlavor = () => {
    const newFlavor = {
      name: "",
      stock: 0,
      ...(isIndividualPricing ? { price: 0 } : {}),
    };
    setFlavors([...flavors, newFlavor]);
  };

  const resetForm = () => {
    setName("");
    setCategory("");
    setSubCategories("");
    setDescription("");
    setPrice(0);
    setStock(0);
    setPurchaseLimit(0);
    setIsDeal(false);
    setDiscountType("");
    setDiscountValue(0);
    setIsIndividualPricing(false);
    setFlavors([]);
    setFiles([]);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      dispatch(showAlert({ message: "Product name is required", severity: "error" }));
      return;
    }
    if (!category.trim()) {
      dispatch(showAlert({ message: "Category is required", severity: "error" }));
      return;
    }
    if (!description.trim()) {
      dispatch(showAlert({ message: "Description is required", severity: "error" }));
      return;
    }    

    const formData = new FormData();
    formData.append("name", name);
    formData.append("category", category);
    formData.append("subCategories", subCategories);
    formData.append("description", description);
    formData.append("purchaseLimit", purchaseLimit);
    formData.append("isDeal", isDeal);
    if (discountType) formData.append("discountType", discountType);
    formData.append("discountValue", discountValue);

    const isFlavored = flavors.length > 0;
    if (isFlavored) {
      formData.append("flavors", JSON.stringify(flavors));
      if (!isIndividualPricing) {
        formData.append("price", price);
      }
    } else {
      formData.append("price", price);
      formData.append("stock", stock);
    }

    for (const file of files) {
      formData.append("files", file);
    }

    try {
        await dispatch(createProduct(formData)).unwrap();
        dispatch(showAlert({ message: "Product added successfully!", severity: "success" }));
        resetForm();
      } catch (err) {
        dispatch(showAlert({ message: "Failed to add product", severity: "error" }));
      }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h5" fontWeight="bold" textAlign="center" gutterBottom>Add New Product</Typography>

      <TextField label="Name" fullWidth margin="dense" value={name} onChange={(e) => setName(e.target.value)} />
      <TextField label="Category" fullWidth margin="dense" value={category} onChange={(e) => setCategory(e.target.value)} />
      <TextField label="Sub Categories (comma-separated)" fullWidth margin="dense" value={subCategories} onChange={(e) => setSubCategories(e.target.value)} />
      <TextField label="Description" fullWidth multiline rows={3} margin="dense" value={description} onChange={(e) => setDescription(e.target.value)} />
      <TextField label="Purchase Limit" fullWidth margin="dense" value={purchaseLimit} onChange={(e) => setPurchaseLimit(e.target.value)} />

      <FormControlLabel
        control={<Switch checked={isDeal} onChange={(e) => setIsDeal(e.target.checked)} />}
        label="Deal?"
      />

      {isDeal && (
        <>
          <FormControl fullWidth margin="dense">
            <InputLabel>Discount Type</InputLabel>
            <Select value={discountType} onChange={(e) => setDiscountType(e.target.value)}>
              <MenuItem value="percent">Percent</MenuItem>
              <MenuItem value="fixed">Fixed</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Discount Value"
            type="number"
            fullWidth
            margin="dense"
            value={discountValue}
            onChange={(e) => setDiscountValue(e.target.value)}
          />
        </>
      )}

      <FormControlLabel
        control={<Switch checked={isIndividualPricing} onChange={(e) => setIsIndividualPricing(e.target.checked)} />}
        label="Use individual prices for each flavor"
      />

      <Button variant="outlined" sx={{ mt: 2 }} onClick={handleAddFlavor}>
        Add Flavor
      </Button>

      {flavors.map((flavor, index) => (
        <Grid container spacing={1} key={index} mt={1}>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Flavor"
              value={flavor.name}
              onChange={(e) => handleFlavorChange(index, "name", e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid item xs={6} sm={4}>
            <TextField
              label="Stock"
              type="number"
              value={flavor.stock}
              onChange={(e) => handleFlavorChange(index, "stock", parseFloat(e.target.value))}
              fullWidth
            />
          </Grid>
          {isIndividualPricing && (
            <Grid item xs={6} sm={4}>
              <TextField
                label="Price"
                type="number"
                value={flavor.price || 0}
                onChange={(e) => handleFlavorChange(index, "price", parseFloat(e.target.value))}
                fullWidth
              />
            </Grid>
          )}
        </Grid>
      ))}

      {!isIndividualPricing && flavors.length > 0 && (
        <TextField
          label="Shared Price"
          type="number"
          fullWidth
          margin="dense"
          value={price}
          onChange={(e) => setPrice(parseFloat(e.target.value))}
        />
      )}

      {flavors.length === 0 && (
        <>
          <TextField
            label="Price"
            type="number"
            fullWidth
            margin="dense"
            value={price}
            onChange={(e) => setPrice(parseFloat(e.target.value))}
          />
          <TextField
            label="Stock"
            type="number"
            fullWidth
            margin="dense"
            value={stock}
            onChange={(e) => setStock(parseFloat(e.target.value))}
          />
        </>
      )}

        <Button
        component="label"
        variant="outlined"
        size="small"
        sx={{ mt: 1, width: "fit-content" }}
        >
        Upload Images
        <input
            type="file"
            accept="image/*"
            hidden
            multiple
            onChange={(e) => {
              if(e.target.files) {
                setFiles(Array.from(e.target.files))
              }
            }}
        />
        </Button>
        {files.length > 0 && (
            <Box mt={1}>
                {files.map((file, index) => (
                <Typography key={index} variant="caption" display="block">
                    {file.name}
                </Typography>
                ))}
            </Box>
        )}

      <Button variant="contained" color="primary" fullWidth sx={{ mt: 3 }} onClick={handleSubmit}>
        Add Product
      </Button>
    </Container>
  );
};

export default AddProduct;