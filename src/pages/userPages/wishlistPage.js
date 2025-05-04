import React, { useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Card,
  CardMedia,
  IconButton,
  Skeleton,
  Divider
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import {
  fetchWishlist,
  removeWishlistItem,
} from '../../store/slices/wishlistSlice';
import { addToCart } from '../../store/slices/cartSlice';
import { showAlert } from '../../store/slices/alertSlice';

const WishlistPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, loading, error } = useSelector(state => state.wishlist);

  useEffect(() => {
    dispatch(fetchWishlist())
      .unwrap()
      .catch(err => dispatch(showAlert({ message: err, severity: 'error' })));
  }, [dispatch]);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        {[1,2,3,4,5,6].map(i => (
          <Skeleton key={i} variant="rectangular" height={100} sx={{ mb: 2 }} />
        ))}
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        My Wishlist
      </Typography>

      {items.length === 0 ? (
        <Typography>Your wishlist is empty.</Typography>
      ) : (
        <Box display="flex" flexDirection="column" gap={2}>
          {items.map(item => (
            <Card
              key={item._id}
              variant="outlined"
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: 'center',
                p: { xs: 1, sm: 2 },
                borderRadius: 2,
                boxShadow: 1,
                gap: { xs: 1, sm: 2 },
                width: '100%',
                maxWidth: 600,
                mx: 'auto'
              }}
            >
              <CardMedia
                component="img"
                image={item.images[0]?.url}
                alt={item.name}
                sx={{
                  width: { xs: 80, sm: 100 },
                  height: { xs: 80, sm: 100 },
                  objectFit: 'contain',
                  borderRadius: 1,
                }}
              />
            
              <Box flexGrow={1} onClick={() => navigate(`/product/${item._id}`)} sx={{ textAlign: { xs: 'center', sm: 'left' }, cursor: 'pointer' }}>
                <Typography variant="subtitle1" fontWeight="bold" noWrap>
                  {item.name}
                </Typography>
              </Box>
            
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: { xs: 'center', sm: 'flex-end' },
                  width: { xs: '100%', sm: 'auto' },
                  gap: 1,
                  mt: { xs: 1, sm: 0 },
                }}
              >
                <IconButton
                  color="primary"
                  onClick={() => {
                    dispatch(addToCart({
                      productId: item._id,
                      qty: 1,
                      price: item.price ?? 0
                    }));
                    dispatch(showAlert({ message: 'Item added to cart', severity: 'success' }));
                    dispatch(removeWishlistItem(item._id));
                  }}
                  aria-label="Add to cart"
                >
                  <ShoppingCartIcon />
                </IconButton>

                <Divider orientation="vertical" flexItem sx={{
                  display: { xs: 'none', sm: 'block' },
                  mx: 1
                }} />

                <IconButton
                  color="error"
                  onClick={() => {
                    dispatch(removeWishlistItem(item._id))
                      .unwrap()
                      .then(() => dispatch(showAlert({ message: 'Item removed from wishlist', severity: 'success' })))
                      .catch(err => dispatch(showAlert({ message: err, severity: 'error' })));
                  }}
                  aria-label="Remove from wishlist"
                >
                  <DeleteIcon />
                </IconButton>
              </Box>            
            </Card>          
          ))}
        </Box>
      )}
    </Container>
  );
};

export default WishlistPage;