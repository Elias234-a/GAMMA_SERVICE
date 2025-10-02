import React from 'react';
import { Box, Typography } from '@mui/material';

const Home: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Welcome to the Dashboard
      </Typography>
      <Typography variant="body1">
        This is the home page of your application. You can start customizing this page with your content.
      </Typography>
    </Box>
  );
};

export default Home;
