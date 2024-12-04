import React, { useState, useEffect } from 'react';
import { Box, useTheme, useMediaQuery, Typography, Paper } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import StockSelector from '../components/StockSelector';
import DetailedMetrics from '../components/DetailedMetrics';
import SymbolDataTable from '../components/SymbolDataTable';
import AnalysisChart from '../components/AnalysisChart';
import NoStockMessage from '../components/NoStockMessage';
import { setSelectedStock, setOptionChainData, setLoading, setError } from '../store/optionChainSlice';
import { getSymbolConfig } from '../constants/symbols';
import { common } from '../styles/theme/common';
import { api } from '../services/api';
import { RootState } from '../store/store';
import { TimeRange } from '../components/BaseChart';

interface SymbolData {
  timeStamp: string;
  'Total Call OI': number;
  'Total Put OI': number;
  'PCR': string;
  'ATM Strike': number;
  'ATM CE OI': number;
  'ATM PE OI': number;
  'Change PCR': string;
  'Market Status': string;
  'Spot Price': number;
}

const PROXY_URL = `http://${window.location.hostname}:4000/api`;

const AnalysisPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const dispatch = useDispatch();
  const selectedStock = useSelector((state: RootState) => state.optionChain.selectedStock);
  const [favSymbols, setFavSymbols] = useState<string[]>([]);
  const [symbolData, setSymbolData] = useState<SymbolData[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>('1H');

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const favorites = await api.getFavorites();
        setFavSymbols(favorites);
      } catch (error) {
        console.error('Error fetching favorites:', error);
      }
    };
    fetchFavorites();
  }, []);

  useEffect(() => {
    const fetchSymbolData = async () => {
      if (!selectedStock?.symbol) {
        setSymbolData([]);
        return;
      }

      try {
        const response = await fetch(`${PROXY_URL}/symbol-data/${selectedStock.symbol}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch symbol data: ${response.statusText}`);
        }
        const data = await response.json();
        
        if (Array.isArray(data) && data.length > 0) {
          setSymbolData(data);
        } else if (data && typeof data === 'object') {
          setSymbolData([data]);
        } else {
          setSymbolData([]);
        }
      } catch (error) {
        console.error('Error fetching symbol data:', error);
        setSymbolData([]);
      }
    };

    fetchSymbolData();

    const handleRefresh = (event: CustomEvent) => {
      if (event.detail.symbol === selectedStock?.symbol) {
        fetchSymbolData();
      }
    };

    window.addEventListener('refreshSymbolData', handleRefresh as EventListener);

    return () => {
      window.removeEventListener('refreshSymbolData', handleRefresh as EventListener);
    };
  }, [selectedStock?.symbol]);

  useEffect(() => {
    const fetchOptionChain = async () => {
      if (!selectedStock?.symbol) return;
      
      dispatch(setLoading(true));
      try {
        const response = await api.getOptionChain(selectedStock.symbol);
        dispatch(setOptionChainData(response.optionChain));
        dispatch(setError(null));
      } catch (err) {
        console.error('Error fetching option chain data:', err);
        dispatch(setError('Failed to fetch option chain data'));
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchOptionChain();
  }, [selectedStock?.symbol, dispatch]);

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
              Favorite Stocks
            </Typography>
            <Box className="css-raoz7y" sx={{ width: '396px !important', p: '0 !important' }}>
              <StockSelector
                onSelect={(symbol) => {
                  const config = getSymbolConfig(symbol);
                  if (config) {
                    dispatch(setSelectedStock({ symbol, name: config.name }));
                  }
                }}
                selectedSymbol={selectedStock?.symbol || null}
                filterSymbols={favSymbols}
              />
            </Box>
          </Box>
          
          {selectedStock ? (
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 0
            }}>
              <Box sx={{ width: '100%' }}>
                <DetailedMetrics />
              </Box>
              
              <Box sx={{ width: '100%' }}>
                <AnalysisChart 
                  data={symbolData} 
                  timeRange={timeRange}
                  onTimeRangeChange={setTimeRange}
                />
              </Box>

              <Box sx={{ width: '100%' }}>
                <Typography variant="h6">
                  Historical Data
                </Typography>
                <Box sx={{ 
                  maxHeight: '25rem', 
                  overflowY: 'auto',
                  '&::-webkit-scrollbar': {
                    width: '0.5rem',
                  },
                  '&::-webkit-scrollbar-track': {
                    backgroundColor: 'rgba(0,0,0,0.05)',
                    borderRadius: '0.25rem',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: 'rgba(0,0,0,0.2)',
                    borderRadius: '0.25rem',
                    '&:hover': {
                      backgroundColor: 'rgba(0,0,0,0.3)',
                    },
                  },
                }}>
                  <SymbolDataTable data={symbolData} timeRange={timeRange} />
                </Box>
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

export default AnalysisPage;
