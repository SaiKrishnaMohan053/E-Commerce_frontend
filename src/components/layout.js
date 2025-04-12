import React from "react";
import Navbar from "./navbar";
import Footer from "./footer";
import CategoriesMenu from "./categoriesMenu";
import { Container, Box } from "@mui/material";

const Layout = ({ children }) => {
  return (
    <>
      <Navbar />
      <CategoriesMenu />
      <Box
        component="main"
        sx={{
          minHeight: "80vh",
          mt: { xs: 2, sm: 4 },
          px: { xs: 1, sm: 3, md: 5 },
        }}
      >
        <Container disableGutters maxWidth="xl">
          {children}
        </Container>
      </Box>
      <Footer />
    </>
  );
};

export default React.memo(Layout);