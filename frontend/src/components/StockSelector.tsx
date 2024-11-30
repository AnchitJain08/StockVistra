import React, { useState, useEffect } from 'react';
import {
    Autocomplete,
    TextField,
    Box,
    CircularProgress,
    useTheme,
    Typography
} from '@mui/material';
import { api } from '../services/api';
import VoiceRecognition from './VoiceRecognition';
import { AVAILABLE_SYMBOLS } from '../constants/symbols';

interface StockSelectorProps {
    onSelect: (symbol: string) => void;
    selectedSymbol: string | null;
    filterSymbols?: string[];
    hideMic?: boolean;
}

const StockSelector: React.FC<StockSelectorProps> = ({ onSelect, selectedSymbol, filterSymbols, hideMic = false }) => {
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
                // Filter the stocks if filterSymbols is provided
                const filteredIndices = filterSymbols 
                    ? indicesData?.filter(symbol => filterSymbols.includes(symbol)) 
                    : indicesData;
                const filteredEquities = filterSymbols 
                    ? equitiesData?.filter(symbol => filterSymbols.includes(symbol)) 
                    : equitiesData;
                    
                setIndices(filteredIndices || []);
                setEquities(filteredEquities || []);
            } catch (error) {
                console.error('Error fetching stocks:', error);
                // Fallback to constants if API fails
                const allIndices = Object.keys(AVAILABLE_SYMBOLS.indices);
                const allEquities = Object.keys(AVAILABLE_SYMBOLS.equities);
                
                // Filter the stocks if filterSymbols is provided
                const filteredIndices = filterSymbols 
                    ? allIndices.filter(symbol => filterSymbols.includes(symbol)) 
                    : allIndices;
                const filteredEquities = filterSymbols 
                    ? allEquities.filter(symbol => filterSymbols.includes(symbol)) 
                    : allEquities;
                
                setIndices(filteredIndices);
                setEquities(filteredEquities);
            } finally {
                setLoading(false);
            }
        };

        fetchStocks();
    }, [filterSymbols]);

    const handleVoiceResult = (transcript: string) => {
        const cleanTranscript = transcript.toUpperCase().trim();
        
        // Try exact match first
        let matchedSymbol = [...indices, ...equities].find(symbol => {
            const symbolConfig = AVAILABLE_SYMBOLS.indices[symbol] || AVAILABLE_SYMBOLS.equities[symbol];
            return symbolConfig.name.toUpperCase() === cleanTranscript ||
                   symbol.toUpperCase() === cleanTranscript;
        });

        if (matchedSymbol) {
            // Exact match found - directly select it
            setInputValue(matchedSymbol);
            onSelect(matchedSymbol);
            return;
        }

        // If no exact match, try fuzzy matching
        const possibleMatches = [...indices, ...equities].map(symbol => {
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

            const matchScore = variations.some(variation => 
                normalizedName.includes(variation) || 
                normalizedSymbol.includes(variation) ||
                variation.includes(normalizedSymbol)
            ) ? 1 : 0;

            return {
                symbol,
                score: matchScore,
                name: symbolConfig.name
            };
        }).filter(match => match.score > 0);

        if (possibleMatches.length > 0) {
            // Get the best match and ask for confirmation
            const bestMatch = possibleMatches[0];
            const customEvent = new CustomEvent('voiceRecognitionSuggestion', {
                detail: { 
                    original: transcript,
                    suggestion: bestMatch.symbol,
                    fullName: `${bestMatch.symbol} - ${bestMatch.name}`
                }
            });
            window.dispatchEvent(customEvent);
        } else {
            setInputValue('');
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
            width: { xs: '100%', sm: '25rem', md: '31.25rem' },
            backgroundColor: theme.palette.background.paper,
            borderRadius: 1,
            p: 1
        }}>
            <Autocomplete
                size="small"
                sx={{
                    flex: 1,
                    '& .MuiInputBase-root': {
                        backgroundColor: '#f5f5f5',
                        borderRadius: '12px',
                    },
                    '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                            borderRadius: '12px',
                        },
                        '&:hover fieldset': {
                            borderRadius: '12px',
                        },
                        '&.Mui-focused fieldset': {
                            borderRadius: '12px',
                        },
                    },
                }}
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
            {!hideMic && <VoiceRecognition
                onResult={handleVoiceResult}
                isListening={isListening}
                setIsListening={setIsListening}
            />}
        </Box>
    );
};

export default StockSelector;