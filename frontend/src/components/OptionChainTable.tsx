import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Box,
    Typography,
    Grid
} from '@mui/material';
import { styled, Theme, SxProps } from '@mui/material/styles';
import { RootState } from '../store/store';
import { setOptionChainData, setLoading, setError } from '../store/optionChainSlice';
import { api } from '../services/api';
import { formatNumber } from '../utils/formatters';
import { DetailedMetrics } from '../types';
import { getOptionChainTableStyles } from '../styles/components/tableStyles';
import { COLORS, common } from '../styles/theme/common';

interface MetricsCardProps {
    title: string;
    value: string | number;
    color?: string;
}

const MetricsCard: React.FC<MetricsCardProps> = ({ title, value, color = 'inherit' }) => {
    const styles = getOptionChainTableStyles();
    return (
        <Box sx={styles.metricsCard}>
            <Typography sx={{ ...common.typography.subtitle2, color: 'text.secondary' }}>
                {title}
            </Typography>
            <Typography sx={{ ...common.typography.body1, color }}>
                {value}
            </Typography>
        </Box>
    );
};

const getStatusColor = (status: string) => {
    switch (status) {
        case 'strong-bullish':
        case 'bullish':
            return COLORS.text.call;  
        case 'bearish':
        case 'strong-bearish':
            return COLORS.text.put;   
        default:
            return 'inherit';
    }
};

const getRowStyle = (strike: number, atmStrike: number): SxProps<Theme> => {
    const styles = getOptionChainTableStyles();
    if (strike === atmStrike) {
        return {
            backgroundColor: '#F7F7F7',
            '& td': {
                ...styles.row.atm,
                fontWeight: 600
            }
        } as SxProps<Theme>;
    }
    if (strike < atmStrike) {
        return {
            '& td:nth-of-type(-n+6)': {
                ...styles.row.callBelowATM
            }
        } as SxProps<Theme>;
    }
    return {
        '& td:nth-of-type(n+8)': {
            ...styles.row.putAboveATM
        }
    } as SxProps<Theme>;
};

const getStrikeCellStyle = (strike: number, atmStrike: number): SxProps<Theme> => {
    if (strike === atmStrike) {
        return {
            backgroundColor: '#F7F7F7',
            fontWeight: 700,
            color: '#333',
            position: 'relative',
            '&::after': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                border: `0.125rem solid #333`,
                borderRadius: '0.25rem',
                pointerEvents: 'none'
            },
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
                backgroundColor: '#E5E5E5'
            }
        } as SxProps<Theme>;
    }
    return {
        backgroundColor: '#E3F2FD',  
        fontWeight: 500,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
            backgroundColor: '#BBDEFB'  
        }
    } as SxProps<Theme>;
};

interface StyledTableCellProps extends React.ComponentProps<typeof TableCell> {
    theme?: Theme;
}

const StyledTableCell = styled(TableCell, {
    shouldForwardProp: (prop) => prop !== 'theme'
})<StyledTableCellProps>(() => ({
    padding: '0.5rem',
    textAlign: 'center',
    fontSize: '0.875rem',
    '&.header-cell': {
        fontWeight: 'bold',
        backgroundColor: COLORS.background.header
    },
    '&.call-header': {
        fontWeight: 'bold',
        backgroundColor: COLORS.background.header,
        color: COLORS.text.call
    },
    '&.put-header': {
        fontWeight: 'bold',
        backgroundColor: COLORS.background.header,
        color: COLORS.text.put
    },
    '&.strike-header': {
        fontWeight: 'bold',
        backgroundColor: COLORS.background.header,
        color: COLORS.text.strike
    }
}));

const OptionChainTable: React.FC = () => {
    const dispatch = useDispatch();
    const { selectedStock, optionChainData, loading, error } = useSelector(
        (state: RootState) => state.optionChain
    );
    const tableContainerRef = React.useRef<HTMLDivElement>(null);
    const styles = getOptionChainTableStyles();
    const [metrics, setMetrics] = useState<DetailedMetrics>({
        timestamp: new Date().toISOString(),
        symbol: '',
        expiryDate: '',
        spotPrice: 0,
        totalCallOI: 0,
        totalPutOI: 0,
        maxCallOI: 0,
        maxPutOI: 0,
        maxCallOIStrike: 0,
        maxPutOIStrike: 0,
        maxCallChangeOI: 0,
        maxPutChangeOI: 0,
        maxCallChangeOIStrike: 0,
        maxPutChangeOIStrike: 0,
        atmStrike: 0,
        atmCallOI: 0,
        atmPutOI: 0,
        pcr: 0,
        changePCR: 0,
        status: 'bearish'
    });

    // Data fetching effect
    React.useEffect(() => {
        const fetchOptionChainData = async () => {
            if (!selectedStock?.symbol) {
                console.log('No stock selected');
                return;
            }
            
            console.log('Fetching data for:', selectedStock.symbol);
            dispatch(setLoading(true));
            try {
                const response = await api.getOptionChain(selectedStock.symbol);
                console.log('API Response:', response);
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
                let expiryDate = optionChainData[0]?.expiryDate || '';
                
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
                let status: DetailedMetrics['status'] = 'bearish';
                if (pcr > 1.5) {
                    status = 'strong-bullish';
                } else if (pcr > 1) {
                    status = 'bullish';
                } else if (pcr < 0.5) {
                    status = 'strong-bearish';
                } else if (pcr < 1) {
                    status = 'bearish';
                }

                // Store option chain data in Redux
                dispatch(setOptionChainData(optionChainData));

                // Update metrics state
                setMetrics({
                    timestamp: new Date().toISOString(),
                    symbol: selectedStock.symbol,
                    expiryDate,
                    spotPrice,
                    totalCallOI,
                    totalPutOI,
                    maxCallOI,
                    maxPutOI,
                    maxCallOIStrike,
                    maxPutOIStrike,
                    maxCallChangeOI,
                    maxPutChangeOI,
                    maxCallChangeOIStrike,
                    maxPutChangeOIStrike,
                    atmStrike,
                    atmCallOI,
                    atmPutOI,
                    pcr,
                    changePCR,
                    status
                });

                dispatch(setError(null));
            } catch (err) {
                console.error('Error fetching data:', err);
                dispatch(setError('Failed to fetch option chain data'));
            } finally {
                dispatch(setLoading(false));
            }
        };

        fetchOptionChainData();

        // Set up interval for auto-refresh if market is open
        let intervalId: NodeJS.Timeout | null = null;
        if (selectedStock && api.isMarketOpen()) {
            intervalId = setInterval(fetchOptionChainData, 60000); // Refresh every minute
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [selectedStock, dispatch]);

    // Scroll to ATM strike when data is loaded or stock is changed
    React.useEffect(() => {
        if (optionChainData?.length && metrics?.atmStrike) {
            const atmRow = document.querySelector(`[data-strike="${metrics.atmStrike}"]`);
            if (atmRow && tableContainerRef.current) {
                const container = tableContainerRef.current;
                const rowRect = atmRow.getBoundingClientRect();
                const containerRect = container.getBoundingClientRect();
                const scrollTop = rowRect.top - containerRect.top - (containerRect.height / 2) + (rowRect.height / 2);
                container.scrollTo({
                    top: container.scrollTop + scrollTop,
                    behavior: 'smooth'
                });
            }
        }
    }, [optionChainData, metrics?.atmStrike]);

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>Loading...</Box>;
    }

    if (error) {
        return <Box sx={{ color: 'error.main', p: 3 }}>{error}</Box>;
    }

    if (!optionChainData || !Array.isArray(optionChainData) || optionChainData.length === 0) {
        return <Box sx={{ p: 3 }}>No data available</Box>;
    }

    if (!selectedStock) return null;

    return (
        <Box sx={{ width: '100%' }}>
            {/* Summary Metrics Table 1 */}
            <Paper sx={{ p: 2, mb: 2 }}>
                <Typography sx={{ ...common.typography.h6, mb: 1 }}>
                    Market Overview
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={6} md={3}>
                        <MetricsCard title="Total Call OI" value={formatNumber(metrics.totalCallOI)} />
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <MetricsCard title="Total Put OI" value={formatNumber(metrics.totalPutOI)} />
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <MetricsCard 
                            title="PCR" 
                            value={metrics.pcr.toFixed(2)} 
                            color={metrics.pcr > 1 ? COLORS.text.put : COLORS.text.call}
                        />
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <MetricsCard title="ATM Strike" value={formatNumber(metrics.atmStrike)} />
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <MetricsCard title="ATM CE OI" value={formatNumber(metrics.atmCallOI)} />
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <MetricsCard title="ATM PE OI" value={formatNumber(metrics.atmPutOI)} />
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <MetricsCard 
                            title="Change PCR" 
                            value={metrics.changePCR.toFixed(2)} 
                        />
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <MetricsCard 
                            title="Market Status" 
                            value={metrics.status.replace('-', ' ').toUpperCase()} 
                            color={getStatusColor(metrics.status)}
                        />
                    </Grid>
                </Grid>
            </Paper>

            {/* Detailed Metrics Table 2 */}
            <Paper sx={{ p: 2, mb: 2 }}>
                <Typography sx={{ ...common.typography.h6, mb: 1 }}>
                    Detailed Metrics
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={6} md={3}>
                        <MetricsCard title="Max Call OI" value={formatNumber(metrics.maxCallOI)} />
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <MetricsCard title="Max Call OI Strike" value={formatNumber(metrics.maxCallOIStrike)} />
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <MetricsCard title="Max Call Change in OI" value={formatNumber(metrics.maxCallChangeOI)} />
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <MetricsCard title="Max Call Change OI Strike" value={formatNumber(metrics.maxCallChangeOIStrike)} />
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <MetricsCard title="Max Put OI" value={formatNumber(metrics.maxPutOI)} />
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <MetricsCard title="Max Put OI Strike" value={formatNumber(metrics.maxPutOIStrike)} />
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <MetricsCard title="Max Put Change in OI" value={formatNumber(metrics.maxPutChangeOI)} />
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <MetricsCard title="Max Put Change OI Strike" value={formatNumber(metrics.maxPutChangeOIStrike)} />
                    </Grid>
                </Grid>
            </Paper>

            {/* Option Chain Table */}
            <TableContainer 
                ref={tableContainerRef}
                component={Paper} 
                sx={{
                    mb: 4,
                    maxHeight: 'calc(100dvh - 25rem)',
                    overflow: 'auto',
                    position: 'relative',
                    '& .MuiTable-root': {
                        borderCollapse: 'separate',
                        borderSpacing: 0,
                    },
                    '& thead': {
                        position: 'sticky',
                        top: 0,
                        zIndex: 2,
                        backgroundColor: '#fff',
                    },
                    '& th': {
                        backgroundColor: 'inherit',
                    },
                    '&::-webkit-scrollbar': {
                        width: '0.5rem',
                        height: '0.5rem',
                    },
                    '&::-webkit-scrollbar-track': {
                        background: '#f1f1f1',
                        borderRadius: '0.25rem',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        background: '#888',
                        borderRadius: '0.25rem',
                        '&:hover': {
                            background: '#666',
                        },
                    },
                }}
            >
                <Table size="small" stickyHeader>
                    <TableHead>
                        <TableRow>
                            <StyledTableCell 
                                colSpan={13} 
                                align="center"
                                sx={styles.headerGradient}
                            >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2 }}>
                                    <Typography sx={{ ...common.typography.subtitle1, color: COLORS.text.call, fontWeight: 'bold', flex: 1 }}>CALLS</Typography>
                                    <Typography sx={{ ...common.typography.subtitle1, color: COLORS.text.put, fontWeight: 'bold', flex: 1 }}>PUTS</Typography>
                                </Box>
                            </StyledTableCell>
                        </TableRow>
                        <TableRow>
                            <StyledTableCell className="header-cell">OI</StyledTableCell>
                            <StyledTableCell className="header-cell">Chng in OI</StyledTableCell>
                            <StyledTableCell className="header-cell">Volume</StyledTableCell>
                            <StyledTableCell className="header-cell">IV</StyledTableCell>
                            <StyledTableCell className="header-cell">LTP</StyledTableCell>
                            <StyledTableCell className="header-cell">Chng%</StyledTableCell>
                            <StyledTableCell className="header-cell strike-header">Strike</StyledTableCell>
                            <StyledTableCell className="header-cell">OI</StyledTableCell>
                            <StyledTableCell className="header-cell">Chng in OI</StyledTableCell>
                            <StyledTableCell className="header-cell">Volume</StyledTableCell>
                            <StyledTableCell className="header-cell">IV</StyledTableCell>
                            <StyledTableCell className="header-cell">LTP</StyledTableCell>
                            <StyledTableCell className="header-cell">Chng%</StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {optionChainData.map((row) => (
                            <TableRow
                                key={row.strikePrice}
                                data-strike={row.strikePrice}
                                sx={getRowStyle(row.strikePrice, metrics.atmStrike)}
                            >
                                <TableCell>{formatNumber(row.calls.openInterest)}</TableCell>
                                <TableCell>{formatNumber(row.calls.changeinOpenInterest)}</TableCell>
                                <TableCell>{formatNumber(row.calls.totalTradedVolume)}</TableCell>
                                <TableCell>{row.calls.impliedVolatility.toFixed(2)}</TableCell>
                                <TableCell>{formatNumber(row.calls.lastPrice)}</TableCell>
                                <TableCell sx={{
                                    color: row.calls.change > 0 ? 'green' : row.calls.change < 0 ? 'red' : 'inherit'
                                }}>
                                    {row.calls.change.toFixed(2)}%
                                </TableCell>
                                <TableCell 
                                    sx={{
                                        ...getStrikeCellStyle(row.strikePrice, metrics.atmStrike),
                                        textAlign: 'center'
                                    }}
                                >
                                    {formatNumber(row.strikePrice)}
                                </TableCell>
                                <TableCell>{formatNumber(row.puts.openInterest)}</TableCell>
                                <TableCell>{formatNumber(row.puts.changeinOpenInterest)}</TableCell>
                                <TableCell>{formatNumber(row.puts.totalTradedVolume)}</TableCell>
                                <TableCell>{row.puts.impliedVolatility.toFixed(2)}</TableCell>
                                <TableCell>{formatNumber(row.puts.lastPrice)}</TableCell>
                                <TableCell sx={{
                                    color: row.puts.change > 0 ? 'green' : row.puts.change < 0 ? 'red' : 'inherit'
                                }}>
                                    {row.puts.change.toFixed(2)}%
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default OptionChainTable;
