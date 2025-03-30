import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  Snackbar,
  Alert,
  Container,
  Typography,
  InputAdornment,
  IconButton,
  Paper,
  CircularProgress,
  useMediaQuery,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useDispatch } from "react-redux";
import { useTheme } from "@mui/material/styles";
import { resetPassword } from "../store/slices/authSlice.js";

const ResetPassword = () => {
  const { token } = useParams();
  const [newPassword, setNewPassword] = useState("");
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState("info");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const getPasswordStrength = (password) => {
    if (password.length < 6) return "Weak";
    if (/[A-Z]/.test(password) && /\d/.test(password)) return "Strong";
    return "Medium";
  };

  const getStrengthColor = (strength) => {
    switch (strength) {
      case "Weak":
        return theme.palette.error.main;
      case "Medium":
        return theme.palette.warning.main;
      case "Strong":
        return theme.palette.success.main;
      default:
        return theme.palette.text.primary;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      setAlertMessage("Password must be at least 6 characters long.");
      setAlertSeverity("error");
      setAlertOpen(true);
      return;
    }

    setSubmitting(true);
    const result = await dispatch(resetPassword({ token, newPassword }));
    setSubmitting(false);

    if (resetPassword.fulfilled.match(result)) {
      setAlertMessage("Password successfully reset! Redirecting...");
      setAlertSeverity("success");
      setTimeout(() => navigate("/login"), 3000);
    } else {
      setAlertMessage("Invalid or expired token. Try again.");
      setAlertSeverity("error");
    }

    setAlertOpen(true);
  };

  return (
    <Container
      maxWidth="xs"
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        px: { xs: 2, sm: 4 },
      }}
    >
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 3, width: "100%" }}>
        <Typography variant="h4" textAlign="center" fontWeight="bold" gutterBottom>
          Reset Password
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            label="New Password"
            type={showPassword ? "text" : "password"}
            fullWidth
            margin="normal"
            required
            onChange={(e) => setNewPassword(e.target.value)}
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

          {newPassword && (
            <Typography
              variant="caption"
              sx={{
                display: "block",
                mt: 0.5,
                fontWeight: 500,
                color: getStrengthColor(getPasswordStrength(newPassword)),
              }}
            >
              Strength: {getPasswordStrength(newPassword)}
            </Typography>
          )}

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={submitting}
            sx={{
              mt: 2,
              py: 1.5,
              fontWeight: "bold",
              textTransform: "none",
              fontSize: "1rem",
            }}
          >
            {submitting ? <CircularProgress size={24} sx={{ color: "white" }} /> : "Submit"}
          </Button>
        </form>

        <Snackbar open={alertOpen} autoHideDuration={5000} onClose={() => setAlertOpen(false)}>
          <Alert severity={alertSeverity} variant="filled">
            {alertMessage}
          </Alert>
        </Snackbar>
      </Paper>
    </Container>
  );
};

export default ResetPassword;