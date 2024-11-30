import React, { useState, useEffect } from 'react';
import { 
  Box, 
  useTheme, 
  useMediaQuery, 
  Typography, 
  Paper, 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  styled,
  TableHead
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import StockSelector from '../components/StockSelector';
import CompareChart from '../components/CompareChart';
import NoStockMessage from '../components/NoStockMessage';
import { setSelectedStock } from '../store/optionChainSlice';
import { getSymbolConfig } from '../constants/symbols';
import { Stock } from '../types';
import { common } from '../styles/theme/common';
import { api } from '../services/api';
import { RootState } from '../store/store';
import { colors } from '../styles/theme/colors';

const PROXY_URL = `http://${window.location.hostname}:4000/api`;

interface CompareData {
  metrics?: {
    totalCallOI: number;
    totalPutOI: number;
    pcr: number;
    atmStrike: number;
    atmCallOI: number;
    atmPutOI: number;
    changePCR: number;
    status: string;
    spotPrice: number;
    maxCallOI: number;
    maxPutOI: number;
    maxCallOIStrike: number;
    maxPutOIStrike: number;
    maxCallChangeOI: number;
    maxPutChangeOI: number;
    maxCallChangeOIStrike: number;
    maxPutChangeOIStrike: number;
  };
  loading: boolean;
  error: string | null;
}

interface FormattedValue {
  value: string;
  color: string;
}

interface MetricRow {
  label: string;
  value: string | FormattedValue;
  value2: string | FormattedValue;
  value3: string | FormattedValue;
  type: 'number' | 'pcr' | 'status';
}

// Styled components
const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: '16px',
  boxShadow: '0 4px 20px 0 rgba(0,0,0,0.1)',
  marginTop: theme.spacing(2),
  overflowX: 'auto',
  '& .MuiTableCell-root': {
    borderBottom: '1px solid rgba(224, 224, 224, 0.4)',
    padding: theme.spacing(2),
  },
  '& .MuiTableRow-root:last-child .MuiTableCell-root': {
    borderBottom: 'none',
  },
  '& .MuiTableHead-root': {
    '& .MuiTableRow-root': {
      backgroundColor: '#0A2F57',
      '& .MuiTableCell-root': {
        color: '#fff',
        fontWeight: 'bold'
      }
    }
  }
}));

const LabelCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 700,
  color: '#000000',
  backgroundColor: 'rgba(0, 0, 0, 0.02)',
  width: '40%',
  '& .header': {
    fontWeight: 'bold'
  }
}));

const ValueCell = styled(TableCell)(({ theme }) => ({
  color: theme.palette.text.secondary,
}));

const ComparePage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const dispatch = useDispatch();
  const selectedStock = useSelector((state: RootState) => state.optionChain.selectedStock);
  const [selectedStock2, setSelectedStock2] = useState<Stock | null>(null);
  const [selectedStock3, setSelectedStock3] = useState<Stock | null>(null);
  const [compareData, setCompareData] = useState<CompareData>({
    loading: false,
    error: null
  });
  const [compareData2, setCompareData2] = useState<CompareData>({
    loading: false,
    error: null
  });
  const [compareData3, setCompareData3] = useState<CompareData>({
    loading: false,
    error: null
  });
  const [historicalData1, setHistoricalData1] = useState<any[]>([]);
  const [historicalData2, setHistoricalData2] = useState<any[]>([]);
  const [historicalData3, setHistoricalData3] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState('15M');
  const [favSymbols, setFavSymbols] = useState<string[]>([]);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const favorites = await api.getFavorites();
        console.log('Fetched favorites:', favorites);
        setFavSymbols(favorites);
      } catch (error) {
        console.error('Error fetching favorites:', error);
      }
    };
    fetchFavorites();
  }, []);

  const isAtLeastOneFavorite = favSymbols && (
    (selectedStock?.symbol && favSymbols.includes(selectedStock.symbol)) ||
    (selectedStock2?.symbol && favSymbols.includes(selectedStock2.symbol)) ||
    (selectedStock3?.symbol && favSymbols.includes(selectedStock3.symbol))
  );

  console.log('Debug chart visibility:', {
    favSymbols,
    selectedStock: selectedStock?.symbol,
    selectedStock2: selectedStock2?.symbol,
    selectedStock3: selectedStock3?.symbol,
    isAtLeastOneFavorite
  });

  const formatIndianNumber = (value: number | undefined): string => {
    if (value === undefined || value === null) return 'N/A';
    const numStr = value.toString();
    const parts = numStr.split('.');
    const integerPart = parts[0];
    const decimalPart = parts[1] || '';
    
    if (integerPart.length <= 3) {
      return decimalPart ? `${integerPart}.${decimalPart}` : integerPart;
    }
    
    let formattedInteger = integerPart.slice(-3);
    
    let remaining = integerPart.slice(0, -3);
    while (remaining.length > 0) {
      formattedInteger = `${remaining.slice(-2)},${formattedInteger}`;
      remaining = remaining.slice(0, -2);
    }
    
    return decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger;
  };

  const formatPCR = (value: number | undefined): FormattedValue => {
    if (value === undefined || value === null) return { value: 'N/A', color: '#000000' };
    const pcrValue = value.toFixed(2);
    return {
      value: pcrValue,
      color: value > 1 ? '#22c55e' : value < 1 ? '#ef4444' : '#000000'
    };
  };

  const formatMarketStatus = (status: string | undefined): FormattedValue => {
    if (!status) return { value: 'N/A', color: '#000000' };
    const upperStatus = status.toUpperCase();
    let color;
    switch (upperStatus) {
      case 'STRONG BULLISH':
        color = colors.table.status['strong-bullish'];
        break;
      case 'BULLISH':
        color = colors.table.status['bullish'];
        break;
      case 'BEARISH':
        color = colors.table.status['bearish'];
        break;
      case 'STRONG BEARISH':
        color = colors.table.status['strong-bearish'];
        break;
      default:
        color = '#000000';
    }
    return {
      value: upperStatus,
      color
    };
  };

  const metricsData: MetricRow[] = [
    { label: 'Total Call OI', value: formatIndianNumber(compareData.metrics?.totalCallOI), value2: formatIndianNumber(compareData2.metrics?.totalCallOI), value3: formatIndianNumber(compareData3.metrics?.totalCallOI), type: 'number' },
    { label: 'Total Put OI', value: formatIndianNumber(compareData.metrics?.totalPutOI), value2: formatIndianNumber(compareData2.metrics?.totalPutOI), value3: formatIndianNumber(compareData3.metrics?.totalPutOI), type: 'number' },
    { label: 'PCR', value: formatPCR(compareData.metrics?.pcr), value2: formatPCR(compareData2.metrics?.pcr), value3: formatPCR(compareData3.metrics?.pcr), type: 'pcr' },
    { label: 'ATM Strike', value: formatIndianNumber(compareData.metrics?.atmStrike), value2: formatIndianNumber(compareData2.metrics?.atmStrike), value3: formatIndianNumber(compareData3.metrics?.atmStrike), type: 'number' },
    { label: 'ATM CE OI', value: formatIndianNumber(compareData.metrics?.atmCallOI), value2: formatIndianNumber(compareData2.metrics?.atmCallOI), value3: formatIndianNumber(compareData3.metrics?.atmCallOI), type: 'number' },
    { label: 'ATM PE OI', value: formatIndianNumber(compareData.metrics?.atmPutOI), value2: formatIndianNumber(compareData2.metrics?.atmPutOI), value3: formatIndianNumber(compareData3.metrics?.atmPutOI), type: 'number' },
    { label: 'Change PCR', value: formatPCR(compareData.metrics?.changePCR), value2: formatPCR(compareData2.metrics?.changePCR), value3: formatPCR(compareData3.metrics?.changePCR), type: 'pcr' },
    { label: 'Market Status', value: formatMarketStatus(compareData.metrics?.status), value2: formatMarketStatus(compareData2.metrics?.status), value3: formatMarketStatus(compareData3.metrics?.status), type: 'status' },
    { label: 'Spot Price', value: formatIndianNumber(compareData.metrics?.spotPrice), value2: formatIndianNumber(compareData2.metrics?.spotPrice), value3: formatIndianNumber(compareData3.metrics?.spotPrice), type: 'number' },
    { label: 'Max Call OI', value: formatIndianNumber(compareData.metrics?.maxCallOI), value2: formatIndianNumber(compareData2.metrics?.maxCallOI), value3: formatIndianNumber(compareData3.metrics?.maxCallOI), type: 'number' },
    { label: 'Max Put OI', value: formatIndianNumber(compareData.metrics?.maxPutOI), value2: formatIndianNumber(compareData2.metrics?.maxPutOI), value3: formatIndianNumber(compareData3.metrics?.maxPutOI), type: 'number' },
    { label: 'Max Call OI Strike', value: formatIndianNumber(compareData.metrics?.maxCallOIStrike), value2: formatIndianNumber(compareData2.metrics?.maxCallOIStrike), value3: formatIndianNumber(compareData3.metrics?.maxCallOIStrike), type: 'number' },
    { label: 'Max Put OI Strike', value: formatIndianNumber(compareData.metrics?.maxPutOIStrike), value2: formatIndianNumber(compareData2.metrics?.maxPutOIStrike), value3: formatIndianNumber(compareData3.metrics?.maxPutOIStrike), type: 'number' },
    { label: 'Max Call Change OI', value: formatIndianNumber(compareData.metrics?.maxCallChangeOI), value2: formatIndianNumber(compareData2.metrics?.maxCallChangeOI), value3: formatIndianNumber(compareData3.metrics?.maxCallChangeOI), type: 'number' },
    { label: 'Max Put Change OI', value: formatIndianNumber(compareData.metrics?.maxPutChangeOI), value2: formatIndianNumber(compareData2.metrics?.maxPutChangeOI), value3: formatIndianNumber(compareData3.metrics?.maxPutChangeOI), type: 'number' },
    { label: 'Max Call Change OI Strike', value: formatIndianNumber(compareData.metrics?.maxCallChangeOIStrike), value2: formatIndianNumber(compareData2.metrics?.maxCallChangeOIStrike), value3: formatIndianNumber(compareData3.metrics?.maxCallChangeOIStrike), type: 'number' },
    { label: 'Max Put Change OI Strike', value: formatIndianNumber(compareData.metrics?.maxPutChangeOIStrike), value2: formatIndianNumber(compareData2.metrics?.maxPutChangeOIStrike), value3: formatIndianNumber(compareData3.metrics?.maxPutChangeOIStrike), type: 'number' }
  ];

  const renderMetricsTable = (metrics1: any, metrics2: any, metrics3: any) => {
    if (!metrics1 && !metrics2 && !metrics3) return null;

    return (
      <StyledTableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Metric</TableCell>
              <TableCell>{selectedStock?.symbol || 'Stock 1'}</TableCell>
              <TableCell>{selectedStock2?.symbol || 'Stock 2'}</TableCell>
              <TableCell>{selectedStock3?.symbol || 'Stock 3'}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {metricsData.map((row, index) => (
              <TableRow key={index}>
                <LabelCell>
                  <Typography className="header" variant="subtitle2">
                    {row.label}
                  </Typography>
                </LabelCell>
                <ValueCell>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: typeof row.value === 'object' ? row.value.color : '#000000',
                      fontWeight: 400
                    }}
                  >
                    {typeof row.value === 'object' ? row.value.value : row.value}
                  </Typography>
                </ValueCell>
                <ValueCell>
                  {metrics2 && (
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: typeof row.value2 === 'object' ? row.value2.color : '#000000',
                        fontWeight: 400
                      }}
                    >
                      {typeof row.value2 === 'object' ? row.value2.value : row.value2}
                    </Typography>
                  )}
                </ValueCell>
                <ValueCell>
                  {metrics3 && (
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: typeof row.value3 === 'object' ? row.value3.color : '#000000',
                        fontWeight: 400
                      }}
                    >
                      {typeof row.value3 === 'object' ? row.value3.value : row.value3}
                    </Typography>
                  )}
                </ValueCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </StyledTableContainer>
    );
  };

  const handleStockSelect = (symbol: string) => {
    const config = getSymbolConfig(symbol);
    if (config) {
      dispatch(setSelectedStock({ symbol, name: config.name }));
    }
  };

  const handleStock2Select = (symbol: string) => {
    const config = getSymbolConfig(symbol);
    if (config) {
      setSelectedStock2({ symbol, name: config.name });
    }
  };

  const handleStock3Select = (symbol: string) => {
    const config = getSymbolConfig(symbol);
    if (config) {
      setSelectedStock3({ symbol, name: config.name });
    }
  };

  useEffect(() => {
    const fetchSymbolData = async (symbol: string | undefined, setData: React.Dispatch<React.SetStateAction<any[]>>) => {
      if (!symbol) {
        setData([]);
        return;
      }

      try {
        const response = await fetch(`${PROXY_URL}/symbol-data/${symbol}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch symbol data: ${response.statusText}`);
        }
        const data = await response.json();
        
        if (Array.isArray(data) && data.length > 0) {
          const formattedData = data.map(item => ({
            timeStamp: item.timeStamp,
            PCR: item.PCR
          }));
          setData(formattedData);
        } else if (data && typeof data === 'object') {
          const formattedData = [{
            timeStamp: data.timeStamp,
            PCR: data.PCR
          }];
          setData(formattedData);
        } else {
          setData([]);
        }
      } catch (error) {
        console.error('Error fetching symbol data:', error);
        setData([]);
      }
    };

    // Fetch data for both symbols
    fetchSymbolData(selectedStock?.symbol, setHistoricalData1);
    fetchSymbolData(selectedStock2?.symbol, setHistoricalData2);
    fetchSymbolData(selectedStock3?.symbol, setHistoricalData3);

    // Set up real-time updates
    const handleRefresh = (event: CustomEvent) => {
      if (event.detail.symbol === selectedStock?.symbol) {
        fetchSymbolData(selectedStock?.symbol, setHistoricalData1);
      }
      if (event.detail.symbol === selectedStock2?.symbol) {
        fetchSymbolData(selectedStock2?.symbol, setHistoricalData2);
      }
      if (event.detail.symbol === selectedStock3?.symbol) {
        fetchSymbolData(selectedStock3?.symbol, setHistoricalData3);
      }
    };

    window.addEventListener('refreshSymbolData', handleRefresh as EventListener);

    return () => {
      window.removeEventListener('refreshSymbolData', handleRefresh as EventListener);
    };
  }, [selectedStock?.symbol, selectedStock2?.symbol, selectedStock3?.symbol]);

  useEffect(() => {
    const fetchOptionChainData = async (stock: Stock | null, setData: React.Dispatch<React.SetStateAction<CompareData>>, setHistoricalData: React.Dispatch<React.SetStateAction<any[]>>) => {
      if (!stock?.symbol) {
        setData({ loading: false, error: null });
        return;
      }

      setData(prev => ({ ...prev, loading: true, error: null }));
      try {
        const response = await api.getOptionChain(stock.symbol);
        const optionChainData = response.optionChain;
        
        let totalCallOI = 0;
        let totalPutOI = 0;
        let maxCallOI = 0;
        let maxPutOI = 0;
        let maxCallOIStrike = 0;
        let maxPutOIStrike = 0;
        let maxCallChangeOI = 0;
        let maxPutChangeOI = 0;
        let maxCallChangeOIStrike = 0;
        let maxPutChangeOIStrike = 0;
        let spotPrice = optionChainData[0]?.underlyingValue || 0;
        
        const atmStrike = optionChainData.reduce((closest, current) => {
          return Math.abs(current.strikePrice - spotPrice) < Math.abs(closest - spotPrice) 
            ? current.strikePrice 
            : closest;
        }, optionChainData[0]?.strikePrice || 0);
        
        let atmCallOI = 0;
        let atmPutOI = 0;

        optionChainData.forEach(item => {
          totalCallOI += item.calls?.openInterest || 0;
          totalPutOI += item.puts?.openInterest || 0;
          
          const callOI = item.calls?.openInterest || 0;
          const putOI = item.puts?.openInterest || 0;
          const callChangeOI = item.calls?.changeinOpenInterest || 0;
          const putChangeOI = item.puts?.changeinOpenInterest || 0;
          
          if (callOI > maxCallOI) {
            maxCallOI = callOI;
            maxCallOIStrike = item.strikePrice;
          }
          if (putOI > maxPutOI) {
            maxPutOI = putOI;
            maxPutOIStrike = item.strikePrice;
          }
          if (callChangeOI > maxCallChangeOI) {
            maxCallChangeOI = callChangeOI;
            maxCallChangeOIStrike = item.strikePrice;
          }
          if (putChangeOI > maxPutChangeOI) {
            maxPutChangeOI = putChangeOI;
            maxPutChangeOIStrike = item.strikePrice;
          }
          
          if (item.strikePrice === atmStrike) {
            atmCallOI = callOI;
            atmPutOI = putOI;
          }
        });
        
        const pcr = totalCallOI === 0 ? 0 : totalPutOI / totalCallOI;
        const changePCR = atmCallOI === 0 ? 0 : atmPutOI / atmCallOI;
        const status = pcr > 1 ? 'Bullish' : pcr < 1 ? 'Bearish' : 'Neutral';

        // Format timestamp in a consistent way
        const now = new Date();
        const timestamp = now.toLocaleString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });

        // Set historical data for PCR chart
        const historicalPCRData = [{
          timeStamp: timestamp,
          PCR: pcr.toFixed(2)
        }];
        setHistoricalData(prev => [...prev.slice(-60), ...historicalPCRData]); // Keep last 60 data points

        setData({
          metrics: {
            totalCallOI,
            totalPutOI,
            pcr,
            atmStrike,
            atmCallOI,
            atmPutOI,
            changePCR,
            status,
            spotPrice,
            maxCallOI,
            maxPutOI,
            maxCallOIStrike,
            maxPutOIStrike,
            maxCallChangeOI,
            maxPutChangeOI,
            maxCallChangeOIStrike,
            maxPutChangeOIStrike,
          },
          loading: false,
          error: null
        });
      } catch (error) {
        setData({ loading: false, error: 'Failed to fetch option chain data' });
      }
    };

    fetchOptionChainData(selectedStock, setCompareData, setHistoricalData1);
    fetchOptionChainData(selectedStock2, setCompareData2, setHistoricalData2);
    fetchOptionChainData(selectedStock3, setCompareData3, setHistoricalData3);

    // Set up polling for real-time updates
    const pollInterval = setInterval(() => {
      fetchOptionChainData(selectedStock, setCompareData, setHistoricalData1);
      fetchOptionChainData(selectedStock2, setCompareData2, setHistoricalData2);
      fetchOptionChainData(selectedStock3, setCompareData3, setHistoricalData3);
    }, 60000); // Poll every minute

    return () => clearInterval(pollInterval);
  }, [selectedStock, selectedStock2, selectedStock3]);

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
            flexDirection: { xs: 'column', md: 'row' },
            gap: { xs: 2, md: 3 },
            my: 3,
            px: 2.5,
            justifyContent: 'center',
            alignItems: 'flex-start',
            width: '100%'
          }}>
            {/* Stock 1 */}
            <Box 
              className="css-1xz3dvu"
              sx={{
                display: 'flex',
                flexDirection: 'column',
                width: '396px',
                pl: 3
              }}
            >
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                height: 32,
                mb: 1
              }}>
                <Typography 
                  variant="subtitle1" 
                  className="css-1blsivr-MuiTypography-root"
                  sx={{
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                    fontSize: '0.9375rem'
                  }}
                >
                  Stock 1
                </Typography>
              </Box>
              <Box className="css-raoz7y" sx={{ width: '100% !important', p: '0 !important' }}>
                <StockSelector
                  onSelect={handleStockSelect}
                  selectedSymbol={selectedStock?.symbol || null}
                  hideMic={true}
                />
              </Box>
            </Box>

            {/* Stock 2 */}
            <Box 
              className="css-1xz3dvu"
              sx={{
                display: 'flex',
                flexDirection: 'column',
                width: '396px',
                pl: 3
              }}
            >
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                height: 32,
                mb: 1
              }}>
                <Typography 
                  variant="subtitle1"
                  className="css-1blsivr-MuiTypography-root"
                  sx={{
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                    fontSize: '0.9375rem'
                  }}
                >
                  Stock 2
                </Typography>
              </Box>
              <Box className="css-raoz7y" sx={{ width: '100% !important', p: '0 !important' }}>
                <StockSelector
                  onSelect={handleStock2Select}
                  selectedSymbol={selectedStock2?.symbol || null}
                  hideMic={true}
                />
              </Box>
            </Box>

            {/* Stock 3 */}
            <Box 
              className="css-1xz3dvu"
              sx={{
                display: 'flex',
                flexDirection: 'column',
                width: '396px',
                pl: 3,
                pr: 3
              }}
            >
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                height: 32,
                mb: 1
              }}>
                <Typography 
                  variant="subtitle1"
                  className="css-1blsivr-MuiTypography-root"
                  sx={{
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                    fontSize: '0.9375rem'
                  }}
                >
                  Stock 3
                </Typography>
              </Box>
              <Box className="css-raoz7y" sx={{ width: '100% !important', p: '0 !important' }}>
                <StockSelector
                  onSelect={handleStock3Select}
                  selectedSymbol={selectedStock3?.symbol || null}
                  hideMic={true}
                />
              </Box>
            </Box>
          </Box>
            
          {selectedStock || selectedStock2 || selectedStock3 ? (
            <>
              {favSymbols && isAtLeastOneFavorite && (
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: common.borderRadius.default,
                    boxShadow: common.shadows.card,
                    overflow: 'hidden',
                    height: '400px',
                    mb: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    '& > div': {
                      flex: 1,
                      minHeight: 0
                    },
                    '&:hover': {
                      boxShadow: common.shadows.cardHover,
                    }
                  }}
                >
                  <CompareChart
                    data1={historicalData1}
                    data2={historicalData2}
                    data3={historicalData3}
                    symbol1={selectedStock?.symbol || ''}
                    symbol2={selectedStock2?.symbol || ''}
                    symbol3={selectedStock3?.symbol || ''}
                    timeRange={timeRange}
                    onTimeRangeChange={setTimeRange}
                  />
                </Paper>
              )}

              <Box sx={{ 
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                mt: 0
              }}>
                <Box sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'row' },
                  gap: { xs: 2, md: 3 },
                  my: 0,
                  px: 2.5,
                  justifyContent: 'center',
                  alignItems: 'flex-start',
                  width: '100%'
                }}>
                </Box>
                
                {/* Table Section */}
                <Box sx={{ 
                  borderRadius: 2,
                  bgcolor: '#FFFFFF',
                  overflow: 'hidden',
                  mt: 0
                }}>
                  <TableContainer>
                    {renderMetricsTable(compareData.metrics, compareData2.metrics, compareData3.metrics)}
                  </TableContainer>
                </Box>
              </Box>
            </>
          ) : (
            <NoStockMessage />
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default ComparePage;
