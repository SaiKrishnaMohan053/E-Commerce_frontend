import React, { useEffect, useMemo, useState } from "react";
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
  Skeleton,
  Chip,
  Stack,
  Pagination,
  TextField,
} from "@mui/material";
import { fetchAllOrders } from "../../store/slices/orderSlice";

const statusColorMap = {
  Pending:   "default",
  Processing: "info",
  "Order Ready": "success",
  Delivered: "primary",
  Pickedup: "primary",
  Cancelled: "error",
};

const AdminOrdersPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { allOrders, loading, error, page, totalPages } = useSelector((state) => state.order);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    dispatch(fetchAllOrders({ page: 1, limit: 10, status: statusFilter }));
  }, [dispatch, statusFilter]);

  const onPageChange = (_, value) => {
    dispatch(fetchAllOrders({ page: value, limit: 10, status: statusFilter }));
  };

  const formatted = useMemo(() => {
    if (!Array.isArray(allOrders)) return [];
    const dateOpts = { year: "numeric", month: "short", day: "numeric" };
    return allOrders.map(o => ({
      ...o,
      date: new Date(o.createdAt).toISOString(undefined, dateOpts).split('T')[0],
      total: o.orderItems.reduce((sum, i) => sum + i.qty * i.price, 0)
    }));
  }, [allOrders]);

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return formatted;
    return formatted.filter(o =>
      o.user.storeName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [formatted, searchTerm]);

  if (loading) {
    return (
      <Box maxWidth={800} mx="auto" py={4} px={2}>
        <Skeleton variant="text" width="30%" height={40} />
        <Skeleton variant="rectangular" width="100%" height={40} sx={{ my: 2 }} />
        {Array.from({ length: 5 }).map((_, idx) => (
          <Skeleton
            key={idx}
            variant="rectangular"
            width="100%"
            height={48}
            sx={{ mb: 1 }}
          />
        ))}
      </Box>
    );
  }
  if (error) return <Typography color="error" mt={4} align="center">{error}</Typography>;

  return (
    <Stack spacing={3} maxWidth={1000} mx="auto" py={4}>
      <Typography variant="h4" mb={3}>All Orders (Admin)</Typography>

      <TextField
        placeholder="Search by Store Name…"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        size="small"
        fullWidth
      />

      <Box mb={2} display="flex" flexWrap="wrap" gap={1}>
        {["", "Pending", "Processing", "Order Ready", "Delivered", "Pickedup", "Cancelled"].map(s => (
          <Button
            key={s || "all"}
            size="small"
            variant={statusFilter === s ? "contained" : "outlined"}
            onClick={() => setStatusFilter(s)}
          >
            {s === "" ? "All" : s}
          </Button>
        ))}
      </Box>

      {filtered.length === 0 ? (
        <Typography>No orders to display.</Typography>
      ) : (
        <>
          <Box sx={{ overflowX: "auto" }}>
            <TableContainer component={Paper}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Order #</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell align="right">Store Name</TableCell>
                    <TableCell align="right">Total</TableCell>
                    <TableCell>Method</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map((o) => (
                    <TableRow key={o._id} hover>
                      <TableCell>{o._id}</TableCell>
                      <TableCell>{o.date}</TableCell>
                      <TableCell align="right">{o.user.storeName}</TableCell>
                      <TableCell align="right">${o.total.toFixed(2)}</TableCell>
                      <TableCell>{o.orderMethod}</TableCell>
                      <TableCell>
                        <Chip
                          label={o.status}
                          color={statusColorMap[o.status] || "default"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => navigate(`/orders/${o._id}`)}
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

          <Stack alignItems="center">
            <Pagination
              count={totalPages}
              page={page}
              onChange={onPageChange}
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

export default AdminOrdersPage;