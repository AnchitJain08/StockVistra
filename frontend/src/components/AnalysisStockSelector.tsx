import React, { useState, useEffect } from 'react';
import {
    Autocomplete,
    TextField,
    Box,
    CircularProgress,
    useTheme,
    Typography,
    Chip
} from '@mui/material';
import { api } from '../services/api';
import VoiceRecognition from './VoiceRecognition';
import { AVAILABLE_SYMBOLS } from '../constants/symbols';

interface AnalysisStockSelectorProps {
    onSelect: (symbol: string) => void;
    selectedSymbol: string | null;
}

const AnalysisStockSelector: React.FC<AnalysisStockSelectorProps> = ({ onSelect, selectedSymbol }) => {
    const theme = useTheme();
    const [availableSymbols, setAvailableSymbols] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
        const fetchFavoriteStocks = async () => {
            setLoading(true);
            try {
                const favorites = await api.getFavorites();
                setAvailableSymbols(favorites);
            } catch (error) {
                console.error('Error fetching favorite stocks:', error);
                setAvailableSymbols([]);
            } finally {
                setLoading(false);
            }
        };

        fetchFavoriteStocks();
    }, []);

    const handleVoiceResult = (transcript: string) => {
        const cleanTranscript = transcript.toUpperCase().trim();
        
        // Try exact match first
        let matchedSymbol = availableSymbols.find(symbol => {
            const symbolConfig = AVAILABLE_SYMBOLS.indices[symbol] || AVAILABLE_SYMBOLS.equities[symbol];
            return symbolConfig.name.toUpperCase() === cleanTranscript ||
                   symbol.toUpperCase() === cleanTranscript;
        });

        // If no exact match, try fuzzy matching
        if (!matchedSymbol) {
            matchedSymbol = availableSymbols.find(symbol => {
                const symbolConfig = AVAILABLE_SYMBOLS.indices[symbol] || AVAILABLE_SYMBOLS.equities[symbol];
                const normalizedName = symbolConfig.name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
                const normalizedSymbol = symbol.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
                const normalizedTranscript = cleanTranscript.replace(/[^a-zA-Z0-9]/g, '');
                
                return normalizedName.includes(normalizedTranscript) || 
                       normalizedSymbol.includes(normalizedTranscript);
            });
        }

        if (matchedSymbol) {
            setInputValue(matchedSymbol);
            onSelect(matchedSymbol);
        } else {
            setInputValue('');
            const customEvent = new CustomEvent('voiceRecognitionError', {
                detail: { error: `"${transcript}" is not in your favorites list` }
            });
            window.dispatchEvent(customEvent);
        }
    };

    const getOptionLabel = (option: string) => {
        const symbolConfig = AVAILABLE_SYMBOLS.indices[option] || AVAILABLE_SYMBOLS.equities[option];
        return symbolConfig ? `${option} - ${symbolConfig.name}` : option;
    };

    const renderOption = (props: React.HTMLAttributes<HTMLLIElement>, option: string) => {
        const symbolConfig = AVAILABLE_SYMBOLS.indices[option] || AVAILABLE_SYMBOLS.equities[option];
        const isIndex = option in AVAILABLE_SYMBOLS.indices;
        
        return (
            <li {...props}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body1" component="span">
                            {option}
                        </Typography>
                        <Typography 
                            variant="body2" 
                            component="span" 
                            sx={{ ml: 1, color: 'text.secondary' }}
                        >
                            {symbolConfig?.name}
                        </Typography>
                    </Box>
                    {isIndex && (
                        <Chip 
                            label="Index" 
                            size="small"
                            sx={{ 
                                ml: 1,
                                bgcolor: theme.palette.mode === 'dark' 
                                    ? 'rgba(255, 255, 255, 0.1)' 
                                    : 'rgba(0, 0, 0, 0.1)'
                            }}
                        />
                    )}
                </Box>
            </li>
        );
    };

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Autocomplete
                value={selectedSymbol}
                onChange={(_, newValue) => newValue && onSelect(newValue)}
                inputValue={inputValue}
                onInputChange={(_, newValue) => setInputValue(newValue)}
                options={availableSymbols}
                getOptionLabel={getOptionLabel}
                renderOption={renderOption}
                loading={loading}
                sx={{ 
                    flexGrow: 1,
                    '& .MuiOutlinedInput-root': {
                        bgcolor: theme.palette.mode === 'dark' 
                            ? 'rgba(255, 255, 255, 0.05)' 
                            : 'rgba(0, 0, 0, 0.02)'
                    }
                }}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        placeholder="Search favorite stocks..."
                        InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                                <>
                                    {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                    {params.InputProps.endAdornment}
                                </>
                            ),
                        }}
                    />
                )}
            />
            <VoiceRecognition
                onResult={handleVoiceResult}
                isListening={isListening}
                setIsListening={setIsListening}
            />
        </Box>
    );
};

export default AnalysisStockSelector;
