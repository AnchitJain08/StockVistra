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

interface StockSelectorProps {
    onSelect: (symbol: string) => void;
    selectedSymbol: string | null;
}

const StockSelector: React.FC<StockSelectorProps> = ({ onSelect, selectedSymbol }) => {
    const theme = useTheme();
    const [indices, setIndices] = useState<string[]>([]);
    const [equities, setEquities] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
        const fetchStocks = async () => {
            setLoading(true);
            try {
                const { indices: indicesData, equities: equitiesData } = await api.getStocks();
                setIndices(indicesData || []);
                setEquities(equitiesData || []);
            } catch (error) {
                console.error('Error fetching stocks:', error);
                // Fallback to constants if API fails
                setIndices(Object.keys(AVAILABLE_SYMBOLS.indices));
                setEquities(Object.keys(AVAILABLE_SYMBOLS.equities));
            } finally {
                setLoading(false);
            }
        };

        fetchStocks();
    }, []);

    const handleVoiceResult = (transcript: string) => {
        const cleanTranscript = transcript.toUpperCase().trim();
        console.log('Processing voice input:', cleanTranscript);
        
        // Try exact match first
        let matchedSymbol = [...indices, ...equities].find(symbol => {
            const symbolConfig = AVAILABLE_SYMBOLS.indices[symbol] || AVAILABLE_SYMBOLS.equities[symbol];
            return symbolConfig.name.toUpperCase() === cleanTranscript ||
                   symbol.toUpperCase() === cleanTranscript;
        });

        // If no exact match, try fuzzy matching
        if (!matchedSymbol) {
            matchedSymbol = [...indices, ...equities].find(symbol => {
                const symbolConfig = AVAILABLE_SYMBOLS.indices[symbol] || AVAILABLE_SYMBOLS.equities[symbol];
                const normalizedName = symbolConfig.name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
                const normalizedSymbol = symbol.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
                const normalizedTranscript = cleanTranscript.replace(/[^a-zA-Z0-9]/g, '');
                
                // Try different variations of the transcript
                const variations = [
                    normalizedTranscript,
                    normalizedTranscript.replace(/LIMITED$/, 'LTD'),
                    normalizedTranscript.replace(/LTD$/, 'LIMITED'),
                    normalizedTranscript.replace(/NIFTY/, ''),
                ];

                return variations.some(variation => 
                    normalizedName.includes(variation) || 
                    normalizedSymbol.includes(variation) ||
                    variation.includes(normalizedSymbol)
                );
            });
        }

        if (matchedSymbol) {
            setInputValue(matchedSymbol);
            onSelect(matchedSymbol);
        } else {
            setInputValue('');
            // Create a custom error event to trigger the error message in VoiceRecognition
            const customEvent = new CustomEvent('voiceRecognitionError', {
                detail: { error: `"${transcript}" is not listed in Option Chain` }
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
        return (
            <li {...props}>
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography component="span" sx={{ fontWeight: 'bold' }}>
                        {option}
                    </Typography>
                    <Typography component="span" variant="body2" color="text.secondary">
                        {symbolConfig?.name}
                    </Typography>
                </Box>
            </li>
        );
    };

    return (
        <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            width: { xs: '100%', sm: '400px', md: '500px' },
            backgroundColor: theme.palette.background.paper,
            borderRadius: 1,
            p: 1
        }}>
            <Autocomplete
                size="small"
                sx={{ flex: 1 }}
                options={[...indices, ...equities]}
                value={selectedSymbol}
                onChange={(_, newValue) => newValue && onSelect(newValue)}
                inputValue={inputValue}
                onInputChange={(_, newInputValue) => setInputValue(newInputValue)}
                loading={loading}
                getOptionLabel={getOptionLabel}
                renderOption={renderOption}
                groupBy={(option) => option in AVAILABLE_SYMBOLS.indices ? 'Indices' : 'Equities'}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        placeholder="Select Stock or Index"
                        InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                                <React.Fragment>
                                    {loading ? <CircularProgress color="inherit" size={16} /> : null}
                                    {params.InputProps.endAdornment}
                                </React.Fragment>
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

export default StockSelector;
