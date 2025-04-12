import React, { useEffect } from "react";
import { Snackbar, Alert } from "@mui/material";

const SnackbarAlert = ({ message, severity = "info", open, setOpen }) => {
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        setOpen(false);
      }, 5000); // Auto-close after 5 seconds

      return () => clearTimeout(timer);
    }
  }, [open, setOpen]);

  return (
    <Snackbar
      open={open}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left", // 👈 move to bottom-left
      }}
    >
      <Alert
        severity={severity}
        onClose={() => setOpen(false)}
        sx={{ width: "100%", fontSize: "0.95rem" }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default SnackbarAlert;