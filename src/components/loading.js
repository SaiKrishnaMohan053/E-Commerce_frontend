import React from "react";
import { CircularProgress, Box, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";

const PageLoader = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const loaderSize = isMobile ? 40 : 60;

  return (
    <Box
      aria-label="Page is loading"
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        bgcolor: "rgba(255,255,255,0.6)",
        backdropFilter: "blur(2px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1300,
      }}
    >
      <CircularProgress size={loaderSize} />
    </Box>
  );
};

export default PageLoader;