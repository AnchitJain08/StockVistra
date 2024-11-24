import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { OptionChainState, Stock, OptionChainData } from '../types';

const initialState: OptionChainState = {
    selectedStock: null,
    optionChainData: [],
    loading: false,
    error: null,
    lastUpdated: null
};

const optionChainSlice = createSlice({
    name: 'optionChain',
    initialState,
    reducers: {
        setSelectedStock: (state, action: PayloadAction<Stock>) => {
            state.selectedStock = action.payload;
        },
        setOptionChainData: (state, action: PayloadAction<OptionChainData[]>) => {
            state.optionChainData = action.payload;
            state.lastUpdated = new Date().toISOString();
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
    },
});

export const {
    setSelectedStock,
    setOptionChainData,
    setLoading,
    setError,
} = optionChainSlice.actions;

export default optionChainSlice.reducer;
