import React from 'react';
import { Container, Box, Typography, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Welcome to Biodiversity Explorer
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Discover and document the incredible biodiversity around you
        </Typography>
      </Box>

      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          component={RouterLink}
          to="/observation"
          sx={{ minWidth: 200 }}
        >
          Add Observation
        </Button>
        <Button
          variant="outlined"
          color="primary"
          size="large"
          component={RouterLink}
          to="/species"
          sx={{ minWidth: 200 }}
        >
          Explore Species
        </Button>
        <Button
          variant="outlined"
          color="primary"
          size="large"
          component={RouterLink}
          to="/community"
          sx={{ minWidth: 200 }}
        >
          Community
        </Button>
      </Box>
    </Container>
  );
};

export default Home;
