import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Typography, Paper, Stack, IconButton } from '@mui/material';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';
import RefreshIcon from '@mui/icons-material/Refresh';
import { RootState } from '../store/store';
import { getSymbolConfig } from '../constants/symbols';
import { setOptionChainData, setLoading, setError } from '../store/optionChainSlice';
import { api } from '../services/api';
import { getMetricsStyles } from '../styles/components/metricsStyles';
import { DATE, common } from '../styles/theme/common';

const formatDateTime = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = DATE.MONTHS[date.getMonth()];
    const year = date.getFullYear().toString().slice(-2);
    const hours = date.getHours() % 12 || 12;
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    return `${day} ${month} ${year} ${hours}:${minutes}:${seconds}`;
};

const formatIndianNumber = (num: number): string => {
    const numStr = num.toString();
    const parts = numStr.split('.');
    const integerPart = parts[0];
    const decimalPart = parts[1] || '00';
    
    // Handle numbers less than 1000
    if (integerPart.length <= 3) {
        return `${integerPart}.${decimalPart.padEnd(2, '0')}`;
    }
    
    // Add comma after first 3 digits from right
    let formattedInteger = integerPart.slice(-3);
    
    // Add commas for remaining digits in groups of 2
    let remaining = integerPart.slice(0, -3);
    while (remaining.length > 0) {
        formattedInteger = remaining.slice(-2) + ',' + formattedInteger;
        remaining = remaining.slice(0, -2);
    }
    
    return `${formattedInteger}.${decimalPart.padEnd(2, '0')}`;
};

const DetailedMetrics: React.FC = () => {
    const dispatch = useDispatch();
    const { selectedStock, lastUpdated, optionChainData } = useSelector((state: RootState) => state.optionChain);
    const [isFavorite, setIsFavorite] = useState(false);
    const styles = getMetricsStyles(isFavorite);

    useEffect(() => {
        // Check if current symbol is in favorites when component mounts or symbol changes
        const checkFavoriteStatus = async () => {
            if (!selectedStock) return;
            try {
                const favSymbols = await api.getFavorites();
                const isSymbolFavorite = favSymbols.includes(selectedStock.symbol);
                setIsFavorite(isSymbolFavorite);
            } catch (error) {
                console.error('Error checking favorite status:', error);
            }
        };
        checkFavoriteStatus();
    }, [selectedStock]);

    if (!selectedStock) return null;

    const symbolConfig = getSymbolConfig(selectedStock.symbol);
    const stockName = symbolConfig ? symbolConfig.name : selectedStock.symbol;

    const handleRefresh = async () => {
        if (!selectedStock) return;
        
        dispatch(setLoading(true));
        try {
            const response = await api.getOptionChain(selectedStock.symbol);
            dispatch(setOptionChainData(response.optionChain));
            dispatch(setError(null));
            
            // Dispatch a custom event to trigger symbol data refresh
            const refreshEvent = new CustomEvent('refreshSymbolData', {
                detail: { symbol: selectedStock.symbol }
            });
            window.dispatchEvent(refreshEvent);
        } catch (err) {
            dispatch(setError('Failed to fetch option chain data'));
        } finally {
            dispatch(setLoading(false));
        }
    };

    const handleFavoriteToggle = async () => {
        if (!selectedStock) return;
        
        try {
            if (isFavorite) {
                await api.removeFavorite(selectedStock.symbol);
                setIsFavorite(false);
            } else {
                await api.addFavorite(selectedStock.symbol);
                setIsFavorite(true);
            }
        } catch (error) {
            console.error('Error toggling favorite status:', error);
            dispatch(setError('Failed to update favorite status'));
        }
    };

    return (
        <Paper elevation={0} sx={styles.paper}>
            <Stack spacing={0.75}>
                <Stack 
                    direction="row" 
                    alignItems="center" 
                    justifyContent="space-between"
                >
                    <Typography sx={{ ...common.typography.h5, ...styles.title }}>
                        {selectedStock.symbol} - {stockName}
                    </Typography>
                    <Stack direction="row" spacing={1}>
                        <IconButton
                            size="small"
                            onClick={handleFavoriteToggle}
                            sx={styles.favoriteButton}
                        >
                            {isFavorite ? <StarIcon /> : <StarBorderIcon />}
                        </IconButton>
                        <IconButton
                            size="small"
                            onClick={handleRefresh}
                            sx={styles.refreshButton}
                        >
                            <RefreshIcon />
                        </IconButton>
                    </Stack>
                </Stack>
                {lastUpdated && (
                    <Stack 
                        direction={{ xs: 'column', sm: 'row' }} 
                        justifyContent="space-between" 
                        alignItems={{ xs: 'flex-start', sm: 'center' }}
                        spacing={0.75}
                    >
                        <Typography sx={{ ...common.typography.body2, ...styles.lastUpdatedText }}>
                            Underlying Index: <span className="spot-price">{formatIndianNumber(optionChainData?.[0]?.underlyingValue || 0)}</span> As on {formatDateTime(new Date(lastUpdated))}
                        </Typography>
                        <Typography sx={{ ...common.typography.body2, ...styles.expiryText }}>
                            Expiry: <span className="expiry-date">{optionChainData?.[0]?.expiryDate || 'N/A'}</span>
                        </Typography>
                    </Stack>
                )}
            </Stack>
        </Paper>
    );
};

export default DetailedMetrics;