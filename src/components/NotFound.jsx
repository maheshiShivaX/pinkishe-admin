// components/NotFound.jsx
import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100vh">
      <Typography variant="h2" color="error">
        404 - Page Not Found
      </Typography>
      <Button variant="contained" color="primary" onClick={() => navigate('/login')}>
        Go to Login
      </Button>
    </Box>
  );
};

export default NotFound;
