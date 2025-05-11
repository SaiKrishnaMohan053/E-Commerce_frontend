import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  IconButton
} from "@mui/material";
import TextField from "@mui/material/TextField";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import Draggable from "react-draggable";
import CloseIcon from "@mui/icons-material/Close";

function DateRangeBox({ onApply, onClose }) {
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  return (
    <Draggable handle=".draggable-header">
      <Box sx={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 1300,
        width: 300,
        bgcolor: "white",
        p: 2,
        boxShadow: 6,
        borderRadius: 2,
        }}
      >
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Box className="draggable-header" sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, cursor: "move" }}>
            <Typography variant="subtitle1">Custom Date Range</Typography>
            <IconButton size="small" onClick={onClose}><CloseIcon/></IconButton>
          </Box>

          <DatePicker
            label="From"
            value={fromDate}
            onChange={newVal => setFromDate(newVal)}
            renderInput={params => <TextField {...params} fullWidth margin="dense" size="small" />}
          />

          <DatePicker
            label="To"
            value={toDate}
            onChange={newVal => setToDate(newVal)}
            renderInput={params => <TextField {...params} fullWidth margin="dense" size="small" />}
          />

          <Box mt={2} display="flex" justifyContent="space-between">
            <Button onClick={onClose}>Cancel</Button>
            <Button variant="contained" disabled={!fromDate || !toDate} onClick={() => onApply(fromDate, toDate)}>
              Apply
            </Button>
          </Box>
        </LocalizationProvider>
      </Box>
    </Draggable>
  );
}

export default DateRangeBox;