import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
} from "@mui/material";
import FlavorEditor from "./flavorEditor"; 

const EditModal = ({
  open,
  handleClose,
  product,
  editName,
  setEditName,
  editDescription,
  setEditDescription,
  editPrice,
  setEditPrice,
  editStock,
  setEditStock,
  editIsDeal,
  setEditIsDeal,
  editLimit,
  setEditLimit,
  editDiscountType,
  setEditDiscountType,
  editDiscountValue,
  setEditDiscountValue,
  originalFlavors,
  editFlavors,
  isIndividualPricing,
  handleFlavorChange,
  handleDeleteFlavor,
  handleAddFlavor,
  newImages,
  handleImageChange,
  handleSubmitEdit,
}) => {
  return (
    <Dialog
      open={open}
      onClose={handleClose}
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
        {originalFlavors ? (
            <FlavorEditor
                editFlavors={editFlavors}
                isIndividualPricing={isIndividualPricing}
                editPrice={editPrice}
                setEditPrice={setEditPrice}
                handleFlavorChange={handleFlavorChange}
                handleDeleteFlavor={handleDeleteFlavor}
                handleAddFlavor={handleAddFlavor}
            />
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
          onChange={(e) =>
            setEditLimit(parseFloat(e.target.value) || 0)
          }
          fullWidth
          margin="dense"
        />
        <FormControl fullWidth margin="dense">
          <InputLabel>Is Deal?</InputLabel>
          <Select
            value={product.isDeal ? "true" : "false"}
            onChange={(e) =>
              setEditIsDeal(e.target.value === "true")
            }
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
                onChange={(e) =>
                  setEditDiscountType(e.target.value)
                }
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
              onChange={(e) =>
                setEditDiscountValue(parseFloat(e.target.value) || 0)
              }
              fullWidth
              margin="dense"
            />
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmitEdit}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditModal;