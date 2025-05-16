import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Skeleton
} from '@mui/material';
import { fetchAds, fetchDashboardData } from '../../store/slices/userDashboardSlice';
import AdsCarousel from '../../components/adsCarousel';
import MiniProductCard from '../../components/miniProductPage';

const DashboardSection = ({ title, items }) => {
  const [expanded, setExpanded] = useState(false);
  const displayItems = expanded ? items : items.slice(0, 6);

  return (
    <Box mb={4}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Box
        component="div"
        sx={{
          display: 'flex',
          overflowX: 'auto',
          whiteSpace: 'nowrap',
          pl: 2,
          pr: 2,
          gap: 2,
          pb: 1,
          '&::-webkit-scrollbar': { height: 6 },
          '&::-webkit-scrollbar-track': { background: 'transparent' },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: 'rgba(0,0,0,0.2)',
            borderRadius: 4
          }
        }}
      >
        {displayItems.map((product) => (
          <Box key={product._id} flex="0 0 auto" minWidth={200}>
            <MiniProductCard product={product} />
          </Box>
        ))}

        {!expanded && items.length > 6 && (
          <Box flex="0 0 auto" minWidth={200}>
            <Card
              onClick={() => setExpanded(true)}
              sx={{
                cursor: 'pointer',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 2,
                boxShadow: 2
              }}
            >
              <CardContent>
                <Typography variant="body1" color="primary" align="center">
                  See More
                </Typography>
              </CardContent>
            </Card>
          </Box>
        )}
      </Box>
    </Box>
  );
};

const UserDashboardPage = () => {
  const dispatch = useDispatch();
  const { ads, topSellers, deals, newArrivals, loading, error } = useSelector(
    (state) => state.userDashboard
  );

  useEffect(() => {
    dispatch(fetchAds());
    dispatch(fetchDashboardData());
  }, [dispatch]);

  if (loading) {
    return (
      <Container maxWidth={false} disableGutters sx={{ mt: 4, overflowX: 'hidden' }}>
        <Box mb={4}>
          <Skeleton variant="rectangular" width="100%" height={300} />
        </Box>
        <DashboardSection title="Top Sellers" items={[]} loading={true} />
        <DashboardSection title="Deals" items={[]} loading={true} />
        <DashboardSection title="New Arrivals" items={[]} loading={true} />
      </Container>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" mt={4}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth={false} disableGutters sx={{ mt: 4, overflowX: 'hidden' }}>
      <Box mb={4}>
        <AdsCarousel ads={ads} />
      </Box>

      <DashboardSection title="Top Sellers" items={topSellers}/>
      <DashboardSection title="Deals" items={deals}/>
      <DashboardSection title="New Arrivals" items={newArrivals}/>
    </Container>
  );
};

export default React.memo(UserDashboardPage);