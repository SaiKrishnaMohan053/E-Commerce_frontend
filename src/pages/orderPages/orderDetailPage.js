import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Divider,
  TextField,
  List,
  ListItemButton,
  ListItemText,
  Chip,
  Skeleton,
} from "@mui/material";
import { jwtDecode } from "jwt-decode";
import { fetchOrderById, updateOrderStatus, uploadInvoice, cancelOrder, resetOrderState } from "../../store/slices/orderSlice";
import { showAlert } from "../../store/slices/alertSlice";

const statusColorMap = {
  Pending:   "default",
  Processing: "info",  
  "Order Ready": "success",
  Delivered: "primary",    
  Pickedup: "primary",
  Cancelled: "error", 
};

const OrderDetailPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { current: order, loading, error } = useSelector((state) => state.order);
  const { user } = useSelector((state) => state.auth);
    
  const [status, setStatus] = useState("");
  const [invoice, setInvoice] = useState(null);  

  const token = user.token
  const isAdmin = React.useMemo(() => {
    if (!token) return false;
    try {
      return jwtDecode(token).isAdmin === true;
    } catch {
      console.warn("Failed to decode token");
      return false;
    }
  }, [token]);

  useEffect(() => {
    dispatch(fetchOrderById(id));
    return () => {
      dispatch(resetOrderState());
    };
  }, [dispatch, id]);

  useEffect(() => {
    if (order?.status) {
        setStatus(order.status);
    }
  }, [order]);

  if (!order) return null;

  const total = order.orderItems.reduce((sum, i) => sum + i.qty * i.price, 0).toFixed(2);

  const handleUpdateSatus = () => {
    dispatch(updateOrderStatus({orderId: order._id, status: status }))
  }
  const handleUploadInvoice = () => {
    dispatch(uploadInvoice({orderId: order._id, file: invoice }))
  }

  const handleCancel = async () => {
    dispatch(cancelOrder(order._id));
    dispatch(showAlert({ message: "Order cancelled successfully", severity: "success" }));
  };

  if (loading) {
    return (
      <Box maxWidth={800} mx="auto" py={4} px={2}>
        <Skeleton variant="rectangular" width={120} height={32} /> {/* back button */}
        <Skeleton variant="text" width="40%" height={40} sx={{ mt: 2 }} />
        <Skeleton variant="text" width="60%" />
        <Divider sx={{ my: 2 }} />
        <Box>
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} variant="text" width={i % 2 ? "50%" : "80%"} height={30} />
          ))}
        </Box>
        <Divider sx={{ my: 2 }} />
        <Box>
          <Skeleton variant="text" width="20%" height={32} />
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} variant="rectangular" width="100%" height={48} sx={{ my: 1 }} />
          ))}
        </Box>
        <Divider sx={{ my: 2 }} />
        <Skeleton variant="text" width="30%" height={32} />
        {isAdmin && (
          <Box mt={4}>
            <Skeleton variant="text" width="25%" height={32} />
            <Skeleton variant="rectangular" width="60%" height={48} sx={{ mt: 1 }} />
            <Skeleton variant="rectangular" width="60%" height={48} sx={{ mt: 2 }} />
          </Box>
        )}
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" mt={4} align="center">
        {error}
      </Typography>
    );
  }
  return (
    <Box maxWidth={800} mx="auto" py={4} px={2}>
      <Button variant="text" onClick={() => navigate(isAdmin ? '/admin/orders' : '/orders')}>
        &laquo; Back to Orders
      </Button>

      <Typography variant="h4" mb={2}>
        Order Details
      </Typography>

      <Typography><strong>Order #:</strong> {order._id}</Typography>
      <Typography><strong>User:</strong> {order.user.storeName}</Typography>
      <Typography><strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}</Typography>
      <Typography>
        <strong>Method:</strong> {order.orderMethod === 'pickup' ? 'Pick Up' : 'Delivery'}
      </Typography>
      {order.orderMethod === 'delivery' && (
        <Typography><strong>Address:</strong> {order.shippingAddress.address}</Typography>
      )}
      <Box mt={1} display="flex" alignItems="center">
        <Typography variant="subtitle1" mr={1}>
          <strong>Status:</strong>
        </Typography>
        <Chip
          label={order.status}
          color={statusColorMap[order.status] || "default"}
          variant="outlined"
          size="small"
        />
      </Box>
      {!isAdmin && order.invoiceUrl && (
        <Box mt={2}>
            <Typography variant="h6">Invoice</Typography>
            <Button
            component="a"
            href={order.invoiceUrl}
            target="_blank"
            rel="noopener"
            size="small"
            variant="outlined"
            sx={{ mt: 1 }}
            >
            Download Invoice
            </Button>
        </Box>
        )}
      <Divider sx={{ my: 2 }} />

      <Typography variant="h6" mb={1}>Items</Typography>
      <List>
        {order.orderItems.map((item) => (
          <ListItemButton key={item._id} disableGutters>
            <Box display="flex" alignItems="center" width="100%">
              <Box
                component="img"
                src={item.product?.images[0]?.url || "/placeholder.png"}
                alt={item.name}
                sx={{ width: 60, height: 60, objectFit: "cover", mr: 2, borderRadius: 1 }}
              />
              <ListItemText
                primary={`${item.name} x ${item.qty} = $${(
                  item.qty * item.price
                ).toFixed(2)}`}
                secondary={item.flavor ? `Flavor: ${item.flavor}` : null}
              />
            </Box>
          </ListItemButton>
        ))}
      </List>

      <Divider sx={{ my: 2 }} />

      <Box textAlign="right">
        <Typography variant="h6">Total: ${total}</Typography>
      </Box>

      {isAdmin && (
        <Box mt={4} p={2} sx={{ border: "1px solid #ddd", borderRadius: 1 }}>
            <Typography variant="h6">Admin Actions</Typography>
            <Box display="flex" alignItems="center" mt={2}>
            <TextField
                select
                label="Status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                SelectProps={{ native: true }}
            >
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Order Ready">Order Ready</option>
                <option value="Delivered">Delivered</option>
                <option value="Pickedup">Picked Up</option>
                <option value="Cancelled">Cancelled</option>
            </TextField>
            <Button
                variant="contained"
                onClick={handleUpdateSatus}
                sx={{ ml: 2 }}
                disabled={loading}
            >
                Update Status
            </Button>
            </Box>

            <Box display="flex" alignItems="center" mt={3}>
            <input
                type="file"
                accept="application/pdf,image/*"
                onChange={(e) => setInvoice(e.target.files[0])}
            />
            <Button
                variant="outlined"
                onClick={handleUploadInvoice}
                sx={{ ml: 2 }}
                disabled={!invoice || loading}
            >
                Upload Invoice
            </Button>
            </Box>
        </Box>
      )}
      {['Pending', 'Processing'].includes(order.status) && (
          <Box mt={3}>
            <Button
              variant="outlined"
              color="error"
              onClick={handleCancel}
              disabled={loading}
            >
              {loading ? "Cancelling…" : "Cancel Order"}
            </Button>
          </Box>
        )}
    </Box>
  );
};

export default OrderDetailPage;