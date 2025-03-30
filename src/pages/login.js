import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, forgotPassword, clearMessage, clearError } from "../store/slices/authSlice.js";
import {
  TextField,
  Button,
  Container,
  Typography,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  InputAdornment,
  IconButton,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import SnackbarAlert from "../components/snackbarAlert";

const Login = () => {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotDialogOpen, setForgotDialogOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, user, error, message } = useSelector((state) => state.auth);

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState("success");

  useEffect(() => {
    if (user) {
      if (!user.isApproved) {
        setAlertMessage("Your account is pending approval. You cannot make purchases yet.");
        setAlertSeverity("warning");
        setAlertOpen(true);
      } else {
        navigate("/");
      }
    }
  }, [user, navigate]);

  useEffect(() => {
    if (error) {
      setAlertMessage(error);
      setAlertSeverity("error");
      setAlertOpen(true);
      dispatch(clearError());
    }

    if (message) {
      setAlertMessage(message);
      setAlertSeverity("success");
      setAlertOpen(true);
      dispatch(clearMessage());
    }
  }, [error, message, dispatch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setAlertMessage("Please enter a valid email address.");
      setAlertSeverity("error");
      setAlertOpen(true);
      return;
    }

    dispatch(loginUser(formData));
  };

  const handleForgotSubmit = () => {
    if (!forgotEmail) {
      setAlertMessage("Please enter your email.");
      setAlertSeverity("error");
      setAlertOpen(true);
      return;
    }

    dispatch(forgotPassword(forgotEmail));
    setForgotDialogOpen(false);
  };

  return (
    <>
      <Container
        maxWidth="sm"
        sx={{
          mt: { xs: 5, sm: 8 },
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "80vh",
          px: { xs: 2, sm: 4 },
        }}
      >
        <Card
          sx={{
            boxShadow: 3,
            p: { xs: 2, sm: 3 },
            borderRadius: 3,
            width: "100%",
            maxWidth: 450,
          }}
        >
          <CardContent>
            <Typography variant="h4" textAlign="center" fontWeight="bold" gutterBottom>
              Login
            </Typography>

            <SnackbarAlert
              open={alertOpen}
              setOpen={setAlertOpen}
              severity={alertSeverity}
              message={alertMessage}
            />

            <form onSubmit={handleSubmit}>
              <TextField
                label="Email"
                type="email"
                name="email"
                fullWidth
                margin="normal"
                variant="outlined"
                onChange={handleChange}
                required
              />
              <TextField
                label="Password"
                type={showPassword ? "text" : "password"}
                name="password"
                fullWidth
                margin="normal"
                variant="outlined"
                onChange={handleChange}
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading || !formData.email || !formData.password}
                sx={{
                  mt: 2,
                  py: 1.5,
                  fontSize: "1rem",
                  backgroundColor: "#1976d2",
                  "&:hover": { backgroundColor: "#1565c0" },
                }}
              >
                {loading ? <CircularProgress size={24} sx={{ color: "white" }} /> : "Login"}
              </Button>

              <Button
                variant="text"
                fullWidth
                sx={{
                  mt: 2,
                  textTransform: "none",
                  color: "#1976d2",
                  fontWeight: "bold",
                  fontSize: "0.9rem",
                }}
                onClick={() => setForgotDialogOpen(true)}
              >
                Forgot Password?
              </Button>

              <Typography textAlign="center" mt={2}>
                Don't have an account? {" "}
                <Link to="/register" style={{ color: "#1976d2", fontWeight: "bold" }}>
                  Register
                </Link>
              </Typography>
            </form>
          </CardContent>
        </Card>
      </Container>

      <Dialog open={forgotDialogOpen} onClose={() => setForgotDialogOpen(false)}>
        <DialogTitle>Forgot Password?</DialogTitle>
        <DialogContent>
          <TextField
            label="Enter your email"
            type="email"
            fullWidth
            variant="outlined"
            value={forgotEmail}
            onChange={(e) => setForgotEmail(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setForgotDialogOpen(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleForgotSubmit} color="primary" variant="contained">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Login;