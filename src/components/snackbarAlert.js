import React, { useEffect } from "react";
import { Snackbar, Alert, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";

const SnackbarAlert = ({ message, severity = "info", open, setOpen }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        setOpen(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [open, setOpen]);

  return (
    <Snackbar
      open={open}
      anchorOrigin={{ vertical: isMobile ? "bottom" : "top", horizontal: "center" }}
      sx={{ maxWidth: isMobile ? "90%" : "400px", mx: "auto" }}
    >
      <Alert severity={severity} sx={{ width: "100%", fontSize: isMobile ? "0.85rem" : "1rem" }}>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default SnackbarAlert;