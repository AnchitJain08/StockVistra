import React from 'react';
import { Box, useTheme, useMediaQuery, Typography, Paper } from '@mui/material';
import StockSelector from '../components/StockSelector';
import DetailedMetrics from '../components/DetailedMetrics';
import OptionChainTable from '../components/OptionChainTable';
import NoStockMessage from '../components/NoStockMessage';
import { common } from '../styles/theme/common';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { setSelectedStock } from '../store/optionChainSlice';

const OptionChainPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const dispatch = useDispatch();
  const selectedStock = useSelector((state: RootState) => state.optionChain.selectedStock);

  const handleStockSelect = (symbol: string) => {
    dispatch(setSelectedStock({ symbol }));
  };

  return (
    <Box
      component="main"
      sx={{
        ...common.layout.mainContent,
        p: 2,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          ...common.layout.card,
          borderRadius: common.borderRadius.large,
          boxShadow: common.shadows.card,
          minHeight: `calc(100dvh - ${theme.spacing(isMobile ? 4 : 6)})`,
          maxWidth: common.layout.maxWidth,
          transition: common.transitions.default,
          '&:hover': {
            boxShadow: common.shadows.cardHover,
          }
        }}
      >
        <Box
          sx={{
            ...common.spacing.content,
            flex: 1,
            '& > *:not(:last-child)': {
              mb: 2
            }
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 3,
            flexWrap: { xs: 'wrap', sm: 'nowrap' }
          }}>
            <Box 
              className="css-1xz3dvu"
              sx={{
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Typography 
                variant="subtitle1"
                className="css-1blsivr-MuiTypography-root"
                sx={{
                  fontWeight: 'medium',
                  color: theme.palette.text.secondary
                }}
              >
                Option Chain
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 3,
                flexWrap: { xs: 'wrap', sm: 'nowrap' }
              }}>
                <StockSelector 
                  onSelect={handleStockSelect}
                  selectedSymbol={selectedStock?.symbol || null}
                />
              </Box>
            </Box>
          </Box>
          
          {selectedStock ? (
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2
            }}>
              <Box sx={{ width: '100%' }}>
                <DetailedMetrics />
              </Box>
              <Box sx={{ width: '100%' }}>
                <OptionChainTable />
              </Box>
            </Box>
          ) : (
            <NoStockMessage />
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default OptionChainPage;