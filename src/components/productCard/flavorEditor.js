import React from "react";
import { Box, TextField, IconButton, Button, Typography } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

const FlavorEditor = ({
  editFlavors,
  isIndividualPricing,
  editPrice,
  setEditPrice,
  handleFlavorChange,
  handleDeleteFlavor,
  handleAddFlavor,
}) => {
  return (
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
            onChange={(e) => handleFlavorChange(idx, "name", e.target.value)}
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
          <IconButton
            color="error"
            onClick={() => handleDeleteFlavor(idx)}
            size="small"
          >
            <DeleteIcon />
          </IconButton>
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
  );
};

export default FlavorEditor;