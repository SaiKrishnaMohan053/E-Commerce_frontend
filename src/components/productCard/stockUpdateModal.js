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
} from "@mui/material";

const StockUpdateModal = ({
  open,
  handleClose,
  product,
  selectedFlavorForStock,
  handleFlavorChangeForStock,
  newStock,
  setNewStock,
  handleSubmitStock,
}) => {
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      sx={{
        "& .MuiDialog-paper": {
          width: { xs: "95%", sm: "90%", md: "80%" },
        },
      }}
    >
      <DialogTitle>Update Stock</DialogTitle>
      <DialogContent>
        {product.flavors && product.flavors.length > 0 && (
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
          onChange={(e) =>
            setNewStock(parseFloat(e.target.value) || 0)
          }
          fullWidth
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmitStock}>
          Update
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StockUpdateModal;