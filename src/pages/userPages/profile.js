import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  TextField,
  Button,
  CircularProgress,
  Container,
  Typography,
  Box,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import { fetchUserProfile, updateUserProfile } from "../../store/slices/authSlice";
import { showAlert } from "../../store/slices/alertSlice";

const Profile = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    ownerName: "",
    storeName: "",
    email: "",
    phoneNumber: "",
    address: "",
  });

  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setFormData({
        ownerName: user.ownerName || "",
        storeName: user.storeName || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        address: user.address || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const isFormChanged = () => {
    return (
      user &&
      (
        user.ownerName !== formData.ownerName ||
        user.storeName !== formData.storeName ||
        user.phoneNumber !== formData.phoneNumber ||
        user.address !== formData.address
      )
    );
  };

  const handleUpdate = async () => {
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phoneNumber)) {
      dispatch(showAlert({ message: "Please enter a valid phone number.", severity: "error" }));
      return;
    }

    const resultAction = await dispatch(updateUserProfile(formData));

    if (updateUserProfile.fulfilled.match(resultAction)) {
      dispatch(showAlert({ message: "Profile updated successfully!", severity: "success" }));
      setEditMode(false);
    } else {
      dispatch(showAlert({ message: "Failed to update profile. Please try again.", severity: "error" }));
    }
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        px: { xs: 2, sm: 3 },
        py: { xs: 4, sm: 6 },
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Typography variant="h4" textAlign="center" mb={3} fontWeight="bold">
        Profile
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : (
        <form style={{ width: "100%" }}>
          <TextField
            name="ownerName"
            label="Owner Name"
            value={formData.ownerName}
            onChange={handleChange}
            fullWidth
            disabled={!editMode}
            margin="normal"
          />
          <TextField
            name="storeName"
            label="Store Name"
            value={formData.storeName}
            onChange={handleChange}
            fullWidth
            disabled={!editMode}
            margin="normal"
          />
          <TextField
            name="email"
            label="Email"
            value={formData.email}
            fullWidth
            disabled
            margin="normal"
          />
          <TextField
            name="phoneNumber"
            label="Phone Number"
            value={formData.phoneNumber}
            onChange={handleChange}
            fullWidth
            disabled={!editMode}
            margin="normal"
          />
          <TextField
            name="address"
            label="Address"
            value={formData.address}
            onChange={handleChange}
            fullWidth
            disabled={!editMode}
            margin="normal"
          />

          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
            {editMode ? (
              <Button
                variant="contained"
                color="primary"
                onClick={handleUpdate}
                disabled={!isFormChanged() || loading}
              >
                {loading ? (
                  <CircularProgress size={20} sx={{ color: "#fff" }} />
                ) : (
                  "Save Changes"
                )}
              </Button>
            ) : (
              <Button
                variant="contained"
                color="secondary"
                onClick={() => setEditMode(true)}
              >
                Edit Profile
              </Button>
            )}
          </Box>
        </form>
      )}
    </Container>
  );
};

export default Profile;