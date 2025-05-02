import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  TextField,
  Button,
  CircularProgress,
  Container,
  Typography,
  Paper,
  Box,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useNavigate, Link } from "react-router-dom";
import { registerUser, clearMessage, clearError } from "../../store/slices/authSlice.js";
import { showAlert } from "../../store/slices/alertSlice.js";

const Register = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, message, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    ownerName: "",
    storeName: "",
    email: "",
    phoneNumber: "",
    address: "",
    einNumber: "",
    abcLicense: null,
    salesTaxLicense: null,
  });

  useEffect(() => {
    if (message) {
      dispatch(showAlert({ message: message, severity: "success" }));
      dispatch(clearMessage());
    }
    if (error) {
      dispatch(showAlert({ message: error, severity: "error" }));
      dispatch(clearError());
    }
  }, [message, error, dispatch]);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[0-9]{10}$/;

  const isFormValid = () =>
    formData.ownerName &&
    formData.storeName &&
    emailRegex.test(formData.email) &&
    phoneRegex.test(formData.phoneNumber) &&
    formData.address &&
    formData.einNumber &&
    formData.salesTaxLicense;

  const handleFileChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.files[0] });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!emailRegex.test(formData.email)) {
      dispatch(showAlert({ message: "Please enter a valid email address.", severity: "error" }));
      return;
    }

    if (!phoneRegex.test(formData.phoneNumber)) {
      dispatch(showAlert({ message: "Please enter a valid 10-digit phone number.", severity: "error" }));
      return;
    }

    const resultAction = await dispatch(registerUser(formData));

    if (registerUser.fulfilled.match(resultAction)) {
      dispatch(showAlert({ message: "Registration successful! Awaiting admin approval.", severity: "success" }));
      navigate("/login");
    }
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: { xs: 2, sm: 4 },
      }}
    >
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 3, width: "100%", maxWidth: 500 }}>
        <Typography variant="h4" textAlign="center" fontWeight="bold" gutterBottom>
          Register
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField label="Owner Name" name="ownerName" fullWidth margin="normal" onChange={handleChange} required />
          <TextField label="Store Name" name="storeName" fullWidth margin="normal" onChange={handleChange} required />
          <TextField label="Email" name="email" fullWidth margin="normal" type="email" onChange={handleChange} required />
          <TextField label="Phone Number" name="phoneNumber" fullWidth margin="normal" onChange={handleChange} required />
          <TextField label="Address" name="address" fullWidth margin="normal" onChange={handleChange} required />
          <TextField label="EIN Number" name="einNumber" fullWidth margin="normal" onChange={handleChange} required />

          <Box sx={{ mt: 2 }}>
            <Typography variant="body1">Upload ABC License (.pdf, .jpg, .jpeg, .png)</Typography>
            <input
              type="file"
              name="abcLicense"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
            />
          </Box>

          <Box sx={{ mt: 2 }}>
            <Typography variant="body1">Upload Sales Tax License (.pdf, .jpg, .jpeg, .png)</Typography>
            <input
              type="file"
              name="salesTaxLicense"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              required
            />
          </Box>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={loading || !isFormValid()}
            sx={{ mt: 3, py: 1.5 }}
          >
            {loading ? <CircularProgress size={24} sx={{ color: "#fff" }} /> : "Register"}
          </Button>
        </form>

        <Typography textAlign="center" mt={2}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#1976d2", fontWeight: "bold" }}>
            Login
          </Link>
        </Typography>
      </Paper>
    </Container>
  );
};

export default Register;