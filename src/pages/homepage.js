import React from "react";
import { Outlet } from "react-router-dom";
import { Box, Container, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";

const HomePage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        px: { xs: 2, sm: 3, md: 6 },
      }}
    >
      <Container
        maxWidth="lg"
        sx={{
          mt: isMobile ? 3 : 5,
          flexGrow: 1,
          py: { xs: 2, sm: 4 },
        }}
      >
        <Outlet />
      </Container>
    </Box>
  );
};

export default HomePage;