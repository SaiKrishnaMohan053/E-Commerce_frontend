import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  Skeleton,
  Alert,
  Stack,
  Pagination,
} from "@mui/material";
import { fetchMyOrders } from "../../store/slices/orderSlice";

const statusColorMap = {
  Pending:   "default",    
  Processing: "info",       
  "Order Ready": "success",
  Delivered: "primary",    
  Pickedup: "primary", 
  Cancelled: "error",      
};

const OrdersPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { myOrders, loading, error, page, totalPages } = useSelector((state) => state.order);

  const formattedOrders = useMemo(() => {
    if (!Array.isArray(myOrders)) return [];
    
    const dateOpts = { year: "numeric", month: "long", day: "numeric" };
    return myOrders.map((order) => {
      const total = order.orderItems
        .reduce((sum, i) => sum + i.qty * i.price, 0);
      const date = new Date(order.createdAt).toLocaleDateString(
        "en-US",
        dateOpts
      );
      return { ...order, total, date };
    });
  }, [myOrders]);
  

  useEffect(() => {
    dispatch(fetchMyOrders({ page, limit: 10 }));
  }, [dispatch]);

  const handlePageChange = (_, value) => {
    dispatch(fetchMyOrders({ page: value, limit: 10 }));
  };

  if (loading) {
    return (
      <Box maxWidth={800} mx="auto" py={4} px={2} sx={{ overflowX: 'auto' }}>
        <TableContainer component={Paper} elevation={2}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell><Skeleton variant="text" width={80} /></TableCell>
                <TableCell><Skeleton variant="text" width={100} /></TableCell>
                <TableCell align="right"><Skeleton variant="text" width={60} /></TableCell>
                <TableCell><Skeleton variant="text" width={80} /></TableCell>
                <TableCell align="right"><Skeleton variant="text" width={80} /></TableCell>
                <TableCell align="right"><Skeleton variant="text" width={80} /></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.from({ length: 5 }).map((_, idx) => (
                <TableRow key={idx} hover>
                  {[...Array(6)].map((__, cellIdx) => (
                    <TableCell key={cellIdx} sx={{ py: 1 }}>
                      <Skeleton variant="rectangular" width="100%" height={24} />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  }  

  if (error) {
    return (
      <Box mx="auto" maxWidth={800} p={2}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }  

  return (
    <Stack spacing={3} maxWidth={800} mx="auto" py={4}>
      <Typography variant="h4" mb={3}>My Orders</Typography>
      {formattedOrders.length === 0 ? (
        <Box textAlign="center">
          <img src="/empty-box.svg" alt="No orders" width={120} />
          <Typography>No past orders yet!</Typography>
          <Button onClick={() => navigate('/')}>Go Shopping</Button>
        </Box>
      ) : (
        <>
        <Box sx={{ overflowX: "auto" }}>
          <TableContainer component={Paper} elevation={2}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Order #</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell>Method</TableCell>
                  <TableCell align="right">Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {formattedOrders.map((order) => (
                  <TableRow key={order._id} hover>
                    <TableCell>{order._id}</TableCell>
                    <TableCell>
                      <time dateTime={order.createdAt}>{order.date}</time>
                    </TableCell>
                    <TableCell align="right">
                      ${order.total.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {order.orderMethod === 'pickup' ? 'Pick Up' : 'Delivery'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={order.status}
                        color={statusColorMap[order.status] || "default"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        aria-label="view"
                        size="small"
                        variant="outlined"
                        onClick={() => navigate(`/orders/${order._id}`)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Stack alignItems="center" mt={3}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={handlePageChange}
          color="primary"
          siblingCount={1}
          boundaryCount={2}
        />
        </Stack>
        </>
      )}
    </Stack>
  );
};

export default OrdersPage;