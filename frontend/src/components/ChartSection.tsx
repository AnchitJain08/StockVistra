import React, { useState, useMemo } from 'react';
import { Box, ToggleButton, ToggleButtonGroup, Typography, useTheme, useMediaQuery, Paper, IconButton, SwipeableDrawer } from '@mui/material';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine
} from 'recharts';
import { common } from '../styles/theme/common';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

type ChartType = 'pcr' | 'oiAnalysis' | 'ivSkew' | 'volumeAnalysis' | 'technicalIndicators';

interface ChartOption {
  value: ChartType;
  label: string;
  shortLabel: string;
  description: string;
}

const chartOptions: ChartOption[] = [
  {
    value: 'pcr',
    label: 'Put-Call Ratio',
    shortLabel: 'PCR',
    description: 'Track market sentiment through Put-Call Ratio trends'
  },
  {
    value: 'oiAnalysis',
    label: 'OI Analysis',
    shortLabel: 'OI',
    description: 'Open Interest distribution across strikes'
  },
  {
    value: 'ivSkew',
    label: 'IV Skew',
    shortLabel: 'IV',
    description: 'Implied Volatility distribution analysis'
  },
  {
    value: 'volumeAnalysis',
    label: 'Volume Analysis',
    shortLabel: 'VOL',
    description: 'Trading volume analysis across strikes'
  },
  {
    value: 'technicalIndicators',
    label: 'Technicals',
    shortLabel: 'TECH',
    description: 'Technical indicators including RSI and MACD'
  }
];

const ChartSection: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [selectedChart, setSelectedChart] = useState<ChartType>('pcr');
  const [infoOpen, setInfoOpen] = useState(false);
  
  const selectedOption = chartOptions.find(opt => opt.value === selectedChart);
  const optionChainData = useSelector((state: RootState) => state.optionChain.optionChainData);

  // Memoize processed data
  const processedData = useMemo(() => {
    if (!optionChainData?.length) return [];
    const data = optionChainData.map(item => ({
      ...item,
      strikePrice: item.strikePrice,
      spotPrice: (item.calls.lastPrice + item.puts.lastPrice) / 2 || 0,
      pcr: Number((item.puts.openInterest / (item.calls.openInterest || 1)).toFixed(2)),
      callOI: item.calls.openInterest,
      putOI: item.puts.openInterest,
      callIV: item.calls.impliedVolatility,
      putIV: item.puts.impliedVolatility,
      callVolume: item.calls.totalTradedVolume,
      putVolume: item.puts.totalTradedVolume
    }));
    // Sort by strike price for better visualization
    return data.sort((a, b) => a.strikePrice - b.strikePrice);
  }, [optionChainData]);

  const chartData = useMemo(() => {
    return processedData;
  }, [processedData]);

  const rsiData = useMemo(() => {
    if (!chartData.length) return [];
    const data = calculateRSI(chartData.map(item => ({
      ...item,
      price: item.spotPrice
    })));
    return data.filter(item => item.rsi !== null);
  }, [chartData]);

  const macdData = useMemo(() => {
    if (!chartData.length) return [];
    return calculateMACD(chartData.map(item => ({
      ...item,
      price: item.spotPrice
    })));
  }, [chartData]);

  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: isMobile ? 
        { top: 5, right: 5, bottom: 20, left: 35 } :
        { top: 10, right: 20, bottom: 30, left: 50 }
    };

    switch (selectedChart) {
      case 'pcr':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
              <XAxis 
                dataKey="strikePrice" 
                angle={isMobile ? -45 : 0}
                textAnchor={isMobile ? "end" : "middle"}
                height={isMobile ? 40 : 30}
                tick={{ fontSize: isMobile ? 10 : 12 }}
              />
              <YAxis 
                tick={{ fontSize: isMobile ? 10 : 12 }}
                width={isMobile ? 30 : 40}
              />
              <Tooltip 
                contentStyle={{ 
                  background: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 8,
                  padding: '8px 12px'
                }}
              />
              <Legend 
                verticalAlign="top"
                height={20}
                wrapperStyle={{ fontSize: isMobile ? 10 : 12 }}
              />
              <Line type="monotone" dataKey="pcr" stroke="#2196f3" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'oiAnalysis':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
              <XAxis 
                dataKey="strikePrice" 
                angle={isMobile ? -45 : 0}
                textAnchor={isMobile ? "end" : "middle"}
                height={isMobile ? 40 : 30}
                tick={{ fontSize: isMobile ? 10 : 12 }}
              />
              <YAxis 
                tick={{ fontSize: isMobile ? 10 : 12 }}
                width={isMobile ? 30 : 40}
              />
              <Tooltip 
                contentStyle={{ 
                  background: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 8,
                  padding: '8px 12px'
                }}
              />
              <Legend 
                verticalAlign="top"
                height={20}
                wrapperStyle={{ fontSize: isMobile ? 10 : 12 }}
              />
              <Bar dataKey="callOI" name="Call OI" fill={theme.palette.success.main} />
              <Bar dataKey="putOI" name="Put OI" fill={theme.palette.error.main} />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'ivSkew':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
              <XAxis 
                dataKey="strikePrice" 
                angle={isMobile ? -45 : 0}
                textAnchor={isMobile ? "end" : "middle"}
                height={isMobile ? 40 : 30}
                tick={{ fontSize: isMobile ? 10 : 12 }}
              />
              <YAxis 
                tick={{ fontSize: isMobile ? 10 : 12 }}
                width={isMobile ? 30 : 40}
              />
              <Tooltip 
                contentStyle={{ 
                  background: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 8,
                  padding: '8px 12px'
                }}
              />
              <Legend 
                verticalAlign="top"
                height={20}
                wrapperStyle={{ fontSize: isMobile ? 10 : 12 }}
              />
              <Line type="monotone" dataKey="callIV" name="Call IV" stroke={theme.palette.success.main} dot={false} />
              <Line type="monotone" dataKey="putIV" name="Put IV" stroke={theme.palette.error.main} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'volumeAnalysis':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
              <XAxis 
                dataKey="strikePrice" 
                angle={isMobile ? -45 : 0}
                textAnchor={isMobile ? "end" : "middle"}
                height={isMobile ? 40 : 30}
                tick={{ fontSize: isMobile ? 10 : 12 }}
              />
              <YAxis 
                tick={{ fontSize: isMobile ? 10 : 12 }}
                width={isMobile ? 30 : 40}
              />
              <Tooltip 
                contentStyle={{ 
                  background: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 8,
                  padding: '8px 12px'
                }}
              />
              <Legend 
                verticalAlign="top"
                height={20}
                wrapperStyle={{ fontSize: isMobile ? 10 : 12 }}
              />
              <Area type="monotone" dataKey="callVolume" name="Call Volume" stroke={theme.palette.success.main} fill={theme.palette.success.light} />
              <Area type="monotone" dataKey="putVolume" name="Put Volume" stroke={theme.palette.error.main} fill={theme.palette.error.light} />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'technicalIndicators':
        const technicalData = rsiData.map(item => ({
          ...item,
          ...macdData.find(m => m.strikePrice === item.strikePrice)
        })).filter(item => item.rsi !== null && item.macd !== undefined);

        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={technicalData}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
              <XAxis 
                dataKey="strikePrice" 
                angle={isMobile ? -45 : 0}
                textAnchor={isMobile ? "end" : "middle"}
                height={isMobile ? 40 : 30}
                tick={{ fontSize: isMobile ? 10 : 12 }}
              />
              <YAxis 
                yAxisId="rsi"
                domain={[0, 100]}
                tick={{ fontSize: isMobile ? 10 : 12 }}
                width={isMobile ? 30 : 40}
                orientation="right"
              />
              <YAxis 
                yAxisId="macd"
                tick={{ fontSize: isMobile ? 10 : 12 }}
                width={isMobile ? 30 : 40}
                orientation="left"
              />
              <Tooltip 
                contentStyle={{ 
                  background: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 8,
                  padding: '8px 12px'
                }}
                formatter={(value: any) => [Number(value).toFixed(2)]}
              />
              <Legend 
                verticalAlign="top"
                height={20}
                wrapperStyle={{ fontSize: isMobile ? 10 : 12 }}
              />
              {/* RSI Reference Lines */}
              <ReferenceLine y={70} yAxisId="rsi" stroke={theme.palette.error.main} strokeDasharray="3 3" />
              <ReferenceLine y={30} yAxisId="rsi" stroke={theme.palette.success.main} strokeDasharray="3 3" />
              {/* RSI Line */}
              <Line 
                yAxisId="rsi"
                type="monotone" 
                dataKey="rsi" 
                name="RSI" 
                stroke={theme.palette.primary.main} 
                dot={false}
              />
              {/* MACD Lines */}
              <Line 
                yAxisId="macd"
                type="monotone" 
                dataKey="macd" 
                name="MACD" 
                stroke={theme.palette.secondary.main} 
                dot={false}
              />
              <Line 
                yAxisId="macd"
                type="monotone" 
                dataKey="signal" 
                name="Signal" 
                stroke={theme.palette.warning.main} 
                dot={false}
              />
              <Bar 
                yAxisId="macd"
                dataKey="histogram" 
                name="Histogram" 
                fill={theme.palette.info.main} 
                opacity={0.5}
              />
            </LineChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: 0,
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        background: theme.palette.background.paper,
        overflow: 'hidden',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        minHeight: isMobile ? '400px' : '500px'
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        flex: 1,
        minHeight: 0
      }}>
        <Box sx={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: 'center',
          p: 0,
          borderBottom: `1px solid ${theme.palette.divider}`,
          width: '100%',
          position: 'relative',
          height: isMobile ? '112px' : '56px',
          backgroundColor: theme.palette.background.paper
        }}>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            position: isMobile ? 'relative' : 'absolute',
            left: isMobile ? 'auto' : '24px',
            height: isMobile ? '56px' : '100%',
            zIndex: 1,
            width: '100%',
            px: isMobile ? 2 : 0,
            borderBottom: isMobile ? `1px solid ${theme.palette.divider}` : 'none',
            justifyContent: isMobile ? 'space-between' : 'flex-start'
          }}>
            <Typography 
              variant={isMobile ? "subtitle1" : "h6"}
              sx={{ 
                fontWeight: 500,
                color: theme.palette.text.primary,
                fontSize: isMobile ? '1rem' : '1rem',
                letterSpacing: '-0.01em'
              }}
            >
              {selectedOption?.label}
            </Typography>
            <IconButton
              size="small"
              onClick={() => setInfoOpen(true)}
              sx={{ 
                ml: 1,
                color: theme.palette.text.secondary,
                padding: isMobile ? '8px' : '4px',
                '&:hover': {
                  color: theme.palette.text.primary
                }
              }}
            >
              <InfoOutlinedIcon fontSize={isMobile ? "medium" : "small"} />
            </IconButton>
          </Box>
          
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            position: isMobile ? 'relative' : 'absolute',
            left: 0,
            right: 0,
            height: isMobile ? '56px' : '100%',
            px: 2,
            zIndex: 2
          }}>
            <ToggleButtonGroup
              value={selectedChart}
              exclusive
              onChange={(_, value) => value && setSelectedChart(value)}
              aria-label="chart type"
              size={isMobile ? "small" : "medium"}
              sx={{
                width: isMobile ? '100%' : 'auto',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '40px',
                backgroundColor: theme.palette.action.hover,
                padding: '3px',
                borderRadius: '12px',
                '.MuiToggleButton-root': {
                  flex: isMobile ? 1 : 'initial',
                  minWidth: isMobile ? '0' : '120px',
                  maxWidth: isMobile ? '120px' : 'none',
                  height: '34px',
                  lineHeight: '34px',
                  px: isMobile ? 1 : 2,
                  mx: '2px',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  textTransform: 'none',
                  letterSpacing: '-0.01em',
                  color: theme.palette.text.secondary,
                  borderRadius: '10px !important',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  '&:hover': {
                    backgroundColor: `${theme.palette.action.hover} !important`
                  },
                  '&.Mui-selected': {
                    backgroundColor: `${theme.palette.background.paper} !important`,
                    color: theme.palette.text.primary,
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
                    '&:hover': {
                      backgroundColor: `${theme.palette.background.paper} !important`
                    }
                  }
                }
              }}
            >
              {chartOptions.map((option) => (
                <ToggleButton 
                  key={option.value} 
                  value={option.value}
                  title={option.description}
                >
                  {isMobile ? option.shortLabel : option.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>
        </Box>

        <Box sx={{ 
          flex: 1,
          minHeight: 0,
          position: 'relative',
          height: isMobile ? '350px' : '450px',
          '.recharts-wrapper': {
            fontSize: isMobile ? 10 : 12,
            position: 'absolute',
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            width: '100% !important',
            height: '100% !important'
          }
        }}>
          {renderChart()}
        </Box>
      </Box>

      <SwipeableDrawer
        anchor="bottom"
        open={infoOpen}
        onClose={() => setInfoOpen(false)}
        onOpen={() => setInfoOpen(true)}
        disableSwipeToOpen
        sx={{
          '.MuiDrawer-paper': {
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            px: 2,
            py: 3,
            maxHeight: '80vh'
          }
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: 2 
        }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {selectedOption?.label}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {selectedOption?.description}
          </Typography>
        </Box>
      </SwipeableDrawer>
    </Paper>
  );
};

// Helper functions
const calculateRSI = (data: any[], periods: number = 14) => {
  if (!data || data.length < periods + 1) return [];

  // Calculate price changes
  const changes = data.map((item, index) => {
    if (index === 0) return { gain: 0, loss: 0 };
    const change = item.price - data[index - 1].price;
    return {
      gain: change > 0 ? change : 0,
      loss: change < 0 ? -change : 0
    };
  });

  // Calculate initial averages
  let avgGain = changes.slice(1, periods + 1).reduce((sum, curr) => sum + curr.gain, 0) / periods;
  let avgLoss = changes.slice(1, periods + 1).reduce((sum, curr) => sum + curr.loss, 0) / periods;

  // Calculate RSI for each period
  const rsiData = data.map((item, index) => {
    if (index <= periods) {
      return { ...item, rsi: null };
    }

    // Use Wilder's smoothing method
    avgGain = ((avgGain * (periods - 1)) + changes[index].gain) / periods;
    avgLoss = ((avgLoss * (periods - 1)) + changes[index].loss) / periods;

    const rs = avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));

    return {
      ...item,
      rsi: Number(rsi.toFixed(2))
    };
  });

  return rsiData;
};

const calculateMACD = (data: any[], shortPeriod: number = 12, longPeriod: number = 26, signalPeriod: number = 9) => {
  if (!data || data.length < longPeriod) return [];

  // Calculate EMAs
  const getEMA = (values: number[], period: number) => {
    const k = 2 / (period + 1);
    let ema = values[0];
    return values.map((price, i) => {
      if (i === 0) return ema;
      ema = price * k + ema * (1 - k);
      return ema;
    });
  };

  const prices = data.map(item => item.price);
  const shortEMA = getEMA(prices, shortPeriod);
  const longEMA = getEMA(prices, longPeriod);

  // Calculate MACD line
  const macdLine = shortEMA.map((short, i) => short - longEMA[i]);
  
  // Calculate signal line
  const signalLine = getEMA(macdLine, signalPeriod);

  // Calculate histogram
  const histogram = macdLine.map((macd, i) => macd - signalLine[i]);

  return data.map((item, i) => ({
    ...item,
    macd: Number(macdLine[i].toFixed(2)),
    signal: Number(signalLine[i].toFixed(2)),
    histogram: Number(histogram[i].toFixed(2))
  }));
};

export default ChartSection;
