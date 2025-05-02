import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Container, Box, Snackbar, Alert } from "@mui/material";
import Navbar from "./navbar";
import Footer from "./footer";
import CategoriesMenu from "./categoriesMenu";
import { hideAlert } from "../store/slices/alertSlice";

const Layout = ({ children }) => {
  const dispatch = useDispatch();
  const { open, message, severity } = useSelector((state) => state.alert);

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

        <Snackbar
          open={open}
          autoHideDuration={5000}
          onClose={() => dispatch(hideAlert())}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        >
          <Alert
            onClose={() => dispatch(hideAlert())}
            severity={severity}
            variant="filled"
            sx={{ minWidth: 300, maxWidth: "80vw", }}
          >
            {message}
          </Alert>
        </Snackbar>
      </Box>
      <Footer />
    </>
  );
};

export default React.memo(Layout);