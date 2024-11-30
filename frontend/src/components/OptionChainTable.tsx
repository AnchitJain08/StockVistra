import React from 'react';
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
import { OptionChainData, DetailedMetrics } from '../types';
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
    if (strike < atmStrike) {
        return {
            '& td:nth-of-type(-n+6)': {
                ...styles.row.callBelowATM
            }
        } as SxProps<Theme>;
    }
    if (strike > atmStrike) {
        return {
            '& td:nth-of-type(n+8)': {
                ...styles.row.putAboveATM
            }
        } as SxProps<Theme>;
    }
    return {
        '& td': {
            ...styles.row.atm
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

    // Calculate metrics first
    const metrics = React.useMemo(() => {
        const defaultMetrics: DetailedMetrics = {
            timestamp: new Date().toISOString(),
            symbol: selectedStock?.symbol || '',
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
        };

        if (!Array.isArray(optionChainData) || optionChainData.length === 0) {
            return defaultMetrics;
        }

        try {
            const underlyingValue = optionChainData.find(item => item.underlyingValue)?.underlyingValue || 0;
            const atmStrike = calculateATMStrike(optionChainData, underlyingValue);
            
            const totalCallOI = optionChainData.reduce((sum, item) => sum + (item?.calls?.openInterest || 0), 0);
            const totalPutOI = optionChainData.reduce((sum, item) => sum + (item?.puts?.openInterest || 0), 0);
            const pcRatio = totalCallOI === 0 ? 0 : totalPutOI / totalCallOI;

            const atmItem = optionChainData.find(item => item.strikePrice === atmStrike);
            const maxCallOIItem = optionChainData.reduce((max, item) => 
                (item?.calls?.openInterest || 0) > (max?.calls?.openInterest || 0) ? item : max, 
                optionChainData[0]
            );
            const maxPutOIItem = optionChainData.reduce((max, item) => 
                (item?.puts?.openInterest || 0) > (max?.puts?.openInterest || 0) ? item : max, 
                optionChainData[0]
            );
            const maxCallChangeOIItem = optionChainData.reduce((max, item) => 
                (item?.calls?.changeinOpenInterest || 0) > (max?.calls?.changeinOpenInterest || 0) ? item : max, 
                optionChainData[0]
            );
            const maxPutChangeOIItem = optionChainData.reduce((max, item) => 
                (item?.puts?.changeinOpenInterest || 0) > (max?.puts?.changeinOpenInterest || 0) ? item : max, 
                optionChainData[0]
            );

            return {
                ...defaultMetrics,
                expiryDate: optionChainData[0]?.expiryDate || '',
                spotPrice: underlyingValue,
                totalCallOI,
                totalPutOI,
                maxCallOI: maxCallOIItem?.calls?.openInterest || 0,
                maxPutOI: maxPutOIItem?.puts?.openInterest || 0,
                maxCallOIStrike: maxCallOIItem?.strikePrice || 0,
                maxPutOIStrike: maxPutOIItem?.strikePrice || 0,
                maxCallChangeOI: maxCallChangeOIItem?.calls?.changeinOpenInterest || 0,
                maxPutChangeOI: maxPutChangeOIItem?.puts?.changeinOpenInterest || 0,
                maxCallChangeOIStrike: maxCallChangeOIItem?.strikePrice || 0,
                maxPutChangeOIStrike: maxPutChangeOIItem?.strikePrice || 0,
                atmStrike,
                atmCallOI: atmItem?.calls?.openInterest || 0,
                atmPutOI: atmItem?.puts?.openInterest || 0,
                pcr: pcRatio,
                changePCR: atmItem ? (atmItem.puts?.openInterest || 0) / (atmItem.calls?.openInterest || 1) : 0,
                status: pcRatio >= 1.5 ? 'strong-bullish' : 
                        pcRatio >= 1.0 ? 'bullish' : 
                        pcRatio >= 0.5 ? 'bearish' : 
                        'strong-bearish'
            };
        } catch (error) {
            console.error('Error calculating metrics:', error);
            return defaultMetrics;
        }
    }, [optionChainData, selectedStock]);

    // Data fetching effect
    React.useEffect(() => {
        const fetchData = async () => {
            if (!selectedStock) return;
            
            dispatch(setLoading(true));
            try {
                const response = await api.getOptionChain(selectedStock.symbol);
                dispatch(setOptionChainData(response.optionChain));
                dispatch(setError(null));
            } catch (err) {
                dispatch(setError('Failed to fetch option chain data'));
            } finally {
                dispatch(setLoading(false));
            }
        };

        fetchData();

        let intervalId: NodeJS.Timeout | null = null;
        if (selectedStock && api.isMarketOpen()) {
            intervalId = setInterval(fetchData, 60000); // Refresh every minute
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

    // Calculate ATM strike based on closest strike price to spot price
    const calculateATMStrike = (optionData: OptionChainData[], spotPrice: number): number => {
        if (!optionData || optionData.length === 0) return 0;
        
        const strikes = optionData.map(item => item.strikePrice).sort((a, b) => a - b);
        let closestStrike = strikes[0];
        let minDiff = Math.abs(strikes[0] - spotPrice);

        // Find the strike price closest to spot price
        for (const strike of strikes) {
            const diff = Math.abs(strike - spotPrice);
            if (diff < minDiff) {
                minDiff = diff;
                closestStrike = strike;
            }
        }
        
        return closestStrike;
    };

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
