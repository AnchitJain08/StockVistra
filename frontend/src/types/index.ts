import { Theme, SxProps } from '@mui/material';

export interface Stock {
    symbol: string;
    name?: string;
}

export interface OptionData {
    openInterest: number;
    changeinOpenInterest: number;
    totalTradedVolume: number;
    impliedVolatility: number;
    lastPrice: number;
    change: number;
    bidQty: number;
    bidPrice: number;
    askPrice: number;
    askQty: number;
}

export interface OptionChainData {
    strikePrice: number;
    expiryDate: string;
    underlyingValue: number;
    calls: OptionData;
    puts: OptionData;
}

export interface DetailedMetrics {
    timestamp: string;
    symbol: string;
    expiryDate: string;
    spotPrice: number;
    totalCallOI: number;
    totalPutOI: number;
    maxCallOI: number;
    maxPutOI: number;
    maxCallOIStrike: number;
    maxPutOIStrike: number;
    maxCallChangeOI: number;
    maxPutChangeOI: number;
    maxCallChangeOIStrike: number;
    maxPutChangeOIStrike: number;
    atmStrike: number;
    atmCallOI: number;
    atmPutOI: number;
    pcr: number;
    changePCR: number;
    status: 'strong-bullish' | 'bearish' | 'strong-bearish' | 'bullish';
}

export interface OptionChainState {
    selectedStock: Stock | null;
    optionChainData: OptionChainData[];
    loading: boolean;
    error: string | null;
    lastUpdated: string | null;
}

export interface VoiceRecognitionProps {
  onResult: (transcript: string) => void;
  isListening: boolean;
  setIsListening: (isListening: boolean) => void;
}

export interface TableStyles {
    metricsCard: SxProps<Theme>;
    row: {
        callBelowATM: SxProps<Theme>;
        putAboveATM: SxProps<Theme>;
        atm: SxProps<Theme>;
    };
    strikeCell: {
        atm: SxProps<Theme>;
    };
    cell: {
        base: SxProps<Theme>;
        header: SxProps<Theme>;
        callHeader: SxProps<Theme>;
        putHeader: SxProps<Theme>;
        strikeHeader: SxProps<Theme>;
    };
    tableContainer: SxProps<Theme>;
}
