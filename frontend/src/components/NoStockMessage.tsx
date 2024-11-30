import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';

const NoStockMessage = () => {
  const theme = useTheme();
  
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '300px',
        width: '100%'
      }}
    >
      <Typography
        variant="h6"
        sx={{
          color: theme.palette.text.secondary,
          textAlign: 'center'
        }}
      >
        Select a stock to view details
      </Typography>
    </Box>
  );
};

export default NoStockMessage;
