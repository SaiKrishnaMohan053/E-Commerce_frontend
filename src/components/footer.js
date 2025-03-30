import React from "react";
import { Box, Typography, Grid } from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: "#f5f5f5",
        py: { xs: 3, sm: 4 },
        mt: 4,
        borderTop: "2px solid #ddd",
      }}
    >
      <Grid
        container
        spacing={3}
        justifyContent="center"
        alignItems="center"
        sx={{
          px: { xs: 2, sm: 6 },
          textAlign: { xs: "center", sm: "left" },
        }}
      >
        <Grid
          item
          xs={12}
          sm={4}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: { xs: "center", sm: "flex-start" },
          }}
        >
          <LocationOnIcon sx={{ color: "#d32f2f", mr: 1 }} />
          <Typography variant="body1">1230 Montlimar Dr, Mobile, AL 36609</Typography>
        </Grid>

        <Grid
          item
          xs={12}
          sm={4}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: { xs: "center", sm: "center" },
          }}
        >
          <PhoneIcon sx={{ color: "#d32f2f", mr: 1 }} />
          <Typography variant="body1">
            <a href="tel:+12513814072" style={{ textDecoration: "none", color: "inherit" }}>
              +1 (251) 381-4072
            </a>
          </Typography>
        </Grid>

        <Grid
          item
          xs={12}
          sm={4}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: { xs: "center", sm: "flex-end" },
          }}
        >
          <EmailIcon sx={{ color: "#d32f2f", mr: 1 }} />
          <Typography variant="body1">
            <a href="mailto:support@cstore.com" style={{ textDecoration: "none", color: "inherit" }}>
              support@cstore.com
            </a>
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Footer;