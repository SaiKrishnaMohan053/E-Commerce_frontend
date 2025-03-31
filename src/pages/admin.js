import React, { useEffect, useState, memo } from "react";
import {
  Box, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Dialog, DialogActions,
  DialogContent, DialogTitle, TextField, Typography, IconButton,
  CircularProgress, DialogContentText, useMediaQuery,
  InputAdornment
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUsers, approveUser, rejectUser,
  deleteUser, editUser
} from "../store/slices/authSlice.js";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import SnackbarAlert from "../components/snackbarAlert.js";
import { useTheme } from "@mui/material/styles";

const cellStyle = {
  fontSize: { xs: "12px", sm: "13px" },
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  maxWidth: { xs: 80, sm: 120, md: 160 },
};

const AdminManagement = () => {
  const dispatch = useDispatch();
  const { users, loading } = useSelector((state) => state.auth);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectUserId, setRejectUserId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const filteredUsers = users.filter(user => {
    const term = searchTerm.toLowerCase();
    return (
      user.storeName?.toLowerCase().includes(term) ||
      user.ownerName?.toLowerCase().includes(term) ||
      user.address?.toLowerCase().includes(term)
    );
  });

  const handleApprove = async (userId) => {
    setSubmitting(true);
    await dispatch(approveUser(userId));
    setSnack({ open: true, message: "User approved successfully", severity: "success" });
    dispatch(fetchUsers());
    setSubmitting(false);
  };

  const handleRejectConfirm = async () => {
    if (rejectUserId && rejectReason.trim()) {
      setSubmitting(true);
      await dispatch(rejectUser({ userId: rejectUserId, reason: rejectReason }));
      setSnack({ open: true, message: "User removed and notified", severity: "info" });
      setRejectReason("");
      setRejectUserId(null);
      setRejectDialogOpen(false);
      dispatch(fetchUsers());
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setSubmitting(true);
    await dispatch(deleteUser(deleteUserId));
    setSnack({ open: true, message: "User deleted successfully", severity: "warning" });
    setDeleteUserId(null);
    setDeleteDialogOpen(false);
    dispatch(fetchUsers());
    setSubmitting(false);
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setEditDialogOpen(true);
  };

  const handleEditSave = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(selectedUser.email)) {
      setSnack({ open: true, message: "Invalid email format.", severity: "error" });
      return;
    }
    setSubmitting(true);
    await dispatch(editUser(selectedUser));
    setEditDialogOpen(false);
    setSnack({ open: true, message: "User updated successfully", severity: "success" });
    dispatch(fetchUsers());
    setSubmitting(false);
  };

  const handleOpenRejectDialog = (userId) => {
    setRejectUserId(userId);
    setRejectDialogOpen(true);
  };

  const handleOpenDeleteDialog = (userId) => {
    setDeleteUserId(userId);
    setDeleteDialogOpen(true);
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: "100vw", overflowX: "auto" }}>
      <Typography variant="h5" mb={2} fontSize={{ xs: "20px", sm: "24px" }}>
        Admin - User Management
      </Typography>

      <TextField
        placeholder="Search by Store Name, Owner Name or Address"
        variant="outlined"
        size="small"
        fullWidth
        sx={{ mb: 2, maxWidth: 400 }}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          )
        }}
      />

      {loading ? (
        <Typography>Loading users...</Typography>
      ) : (
        <TableContainer component={Paper} sx={{ maxHeight: "80vh", overflow: "auto" }}>
          <Table stickyHeader size={isMobile ? "small" : "medium"}>
            <TableHead sx={{ backgroundColor: "#f0f0f0" }}>
              <TableRow>
                <TableCell><b>Store Name</b></TableCell>
                <TableCell><b>Owner Name</b></TableCell>
                <TableCell><b>Email</b></TableCell>
                <TableCell><b>Phone</b></TableCell>
                <TableCell><b>Address</b></TableCell>
                <TableCell><b>EIN</b></TableCell>
                <TableCell><b>Sales Tax License</b></TableCell>
                <TableCell><b>ABC License</b></TableCell>
                <TableCell><b>Status</b></TableCell>
                <TableCell><b>Actions</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((user) => (
                <MemoizedUserRow
                  key={user._id}
                  user={user}
                  handleApprove={handleApprove}
                  handleReject={handleOpenRejectDialog}
                  handleEditClick={handleEditClick}
                  handleDelete={handleOpenDeleteDialog}
                  submitting={submitting}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <TextField label="Store Name" fullWidth margin="dense" value={selectedUser?.storeName || ""} onChange={(e) => setSelectedUser({ ...selectedUser, storeName: e.target.value })} />
          <TextField label="Owner Name" fullWidth margin="dense" value={selectedUser?.ownerName || ""} onChange={(e) => setSelectedUser({ ...selectedUser, ownerName: e.target.value })} />
          <TextField label="Email" fullWidth margin="dense" value={selectedUser?.email || ""} onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })} />
          <TextField label="Phone Number" fullWidth margin="dense" value={selectedUser?.phoneNumber || ""} onChange={(e) => setSelectedUser({ ...selectedUser, phoneNumber: e.target.value })} />
          <TextField label="Address" fullWidth margin="dense" value={selectedUser?.address || ""} onChange={(e) => setSelectedUser({ ...selectedUser, address: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleEditSave} disabled={submitting}>
            {submitting ? <CircularProgress size={20} sx={{ color: "white" }} /> : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)}>
        <DialogTitle>Reject User</DialogTitle>
        <DialogContent>
          <TextField
            label="Reason for rejection"
            fullWidth
            margin="dense"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleRejectConfirm} disabled={submitting}>
            {submitting ? <CircularProgress size={20} sx={{ color: "white" }} /> : "Submit"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to permanently delete this user?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDeleteConfirm} disabled={submitting}>
            {submitting ? <CircularProgress size={20} sx={{ color: "white" }} /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const MemoizedUserRow = memo(({ user, handleApprove, handleReject, handleEditClick, handleDelete, submitting }) => (
  <TableRow hover>
    <TableCell sx={cellStyle}>{user.storeName || "—"}</TableCell>
    <TableCell sx={cellStyle}>{user.ownerName || "—"}</TableCell>
    <TableCell sx={{ ...cellStyle }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, maxWidth: 180, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        <Typography noWrap sx={{ overflow: "hidden", textOverflow: "ellipsis" }}>
          {user.email || "—"}
        </Typography>
        {user.isAdmin && <AdminPanelSettingsIcon fontSize="small" color="primary" titleAccess="Admin" />}
      </Box>
    </TableCell>
    <TableCell sx={cellStyle}>{user.phoneNumber || "—"}</TableCell>
    <TableCell sx={cellStyle}>{user.address || "—"}</TableCell>
    <TableCell sx={cellStyle}>{user.einNumber || "—"}</TableCell>
    <TableCell sx={cellStyle}>
      {user.salesTaxLicense ? (
        <Button
          variant="text"
          size="small"
          href={typeof user.salesTaxLicense === 'object' ? user.salesTaxLicense.url : user.salesTaxLicense}
          target="_blank"
          rel="noopener noreferrer"
        >
          View
        </Button>
      ) : "—"}
    </TableCell>
    <TableCell sx={cellStyle}>
      {user.abcLicense ? (
        <Button
          variant="text"
          size="small"
          href={typeof user.abcLicense === 'object' ? user.abcLicense.url : user.abcLicense}
          target="_blank"
          rel="noopener noreferrer"
        >
          View
        </Button>
      ) : "—"}
    </TableCell>
    <TableCell>
      {user.isApproved ? (
        <Typography sx={{ color: "green", fontWeight: 500 }}>Approved</Typography>
      ) : (
        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton size="small" color="primary" onClick={() => handleApprove(user._id)} disabled={submitting}>
            <CheckCircleIcon />
          </IconButton>
          <IconButton size="small" color="error" onClick={() => handleReject(user._id)} disabled={submitting}>
            <CancelIcon />
          </IconButton>
        </Box>
      )}
    </TableCell>
    <TableCell align="center">
      <Box sx={{ display: "flex", gap: 1 }}>
        {user.isApproved && !user.isAdmin && (
          <>
            <IconButton size="small" onClick={() => handleEditClick(user)} disabled={submitting}>
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={() => handleDelete(user._id)} sx={{ color: "error.main" }} disabled={submitting}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </>
        )}
      </Box>
    </TableCell>
  </TableRow>
));

export default AdminManagement;