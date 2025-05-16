import React, { useState, useEffect, useRef } from 'react';
import { Box, IconButton } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

const AdsCarousel = ({ ads = [], autoPlayInterval = 5000 }) => {
  const [current, setCurrent] = useState(0);
  const length = ads.length;
  const trackRef = useRef(null);

  const nextSlide = () => {
    setCurrent(prev => (prev + 1) % length);
  };

  const prevSlide = () => {
    setCurrent(prev => (prev - 1 + length) % length);
  };

  useEffect(() => {
    if (length <= 1) return;
    const id = setInterval(nextSlide, autoPlayInterval);
    return () => clearInterval(id);
  }, [length, autoPlayInterval]);

  useEffect(() => {
    if (trackRef.current) {
      trackRef.current.style.transform = `translateX(-${current * 100}vw)`;
    }
  }, [current]);

  if (length === 0) return null;

  return (
    <Box
      position="relative"
      width="100vw"
      sx={{
        ml: 'calc(-50vw + 50%)',
        overflow: 'hidden'
      }}
    >
      <Box
        ref={trackRef}
        sx={{
          display: 'flex',
          width: `${length * 100}vw`,
          transition: 'transform 0.6s ease-in-out'
        }}
      >
        {ads.map((ad, idx) => (
          <Box
            key={idx}
            component="a"
            href={ad.link}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              flex: '0 0 100vw', 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: { xs: 200, sm: 300 },
              boxSizing: 'border-box',
            }}
          >
            <Box
              component="img"
              src={ad.imageUrl}
              alt={ad.altText || `ad-${idx}`}
              sx={{
                maxHeight: { xs: 180, sm: 300 },
                width: 'auto',
                objectFit: 'contain',
                cursor: 'pointer',
                mx: 'auto'
              }}
              onClick={() => window.open(ad.link, '_blank')}
            />
          </Box>
        ))}
      </Box>

      {length > 1 && (
        <>
          <IconButton
            onClick={prevSlide}
            sx={{
              position: 'absolute',
              top: '50%',
              left: 16,
              transform: 'translateY(-50%)',
              bgcolor: 'rgba(255,255,255,0.7)',
              '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
            }}
          >
            <ArrowBackIosNewIcon />
          </IconButton>

          <IconButton
            onClick={nextSlide}
            sx={{
              position: 'absolute',
              top: '50%',
              right: 16,
              transform: 'translateY(-50%)',
              bgcolor: 'rgba(255,255,255,0.7)',
              '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
            }}
          >
            <ArrowForwardIosIcon />
          </IconButton>
        </>
      )}
    </Box>
  );
};

export default React.memo(AdsCarousel);