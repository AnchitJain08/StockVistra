import React, { Suspense, lazy } from 'react';
import { Box, useTheme, useMediaQuery, Typography, CircularProgress } from '@mui/material';
import StockSelector from '../components/StockSelector';
import { common } from '../styles/theme/common';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { setSelectedStock } from '../store/optionChainSlice';

// Lazy load components
const DetailedMetrics = lazy(() => import('../components/DetailedMetrics'));
const OptionChainTable = lazy(() => import('../components/OptionChainTable'));
const ChartSection = lazy(() => import('../components/ChartSection'));

const LoadingFallback = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
    <CircularProgress />
  </Box>
);

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
        ...common.spacing.page,
      }}
    >
      <Box sx={{
        ...common.layout.card,
        borderRadius: common.borderRadius.large,
        boxShadow: common.shadows.card,
        minHeight: `calc(100vh - ${theme.spacing(isMobile ? 4 : 6)})`,
        maxWidth: common.layout.maxWidth,
        transition: common.transitions.default,
        '&:hover': {
          boxShadow: common.shadows.cardHover,
        }
      }}>
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
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 600,
                color: '#000000',
                whiteSpace: 'nowrap',
                letterSpacing: '0.01em',
                textTransform: 'uppercase',
                minWidth: 'fit-content'
              }}
            >
              Option Chain
            </Typography>
            <StockSelector 
              onSelect={handleStockSelect}
              selectedSymbol={selectedStock?.symbol || null}
            />
          </Box>
          {selectedStock ? (
            <Suspense fallback={<LoadingFallback />}>
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
                <Box sx={{ width: '100%' }}>
                  <ChartSection />
                </Box>
              </Box>
            </Suspense>
          ) : (
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                minHeight: '200px',
                color: 'text.secondary',
                textAlign: 'center',
                p: 3
              }}
            >
              <Typography variant="h6">
                Please select a stock to view
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default OptionChainPage;
