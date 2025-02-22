import axios, { AxiosInstance } from 'axios';
import { OptionChainData} from '../types';
import { 
    AVAILABLE_SYMBOLS, 
    getSymbolType
} from '../constants/symbols';

// Proxy server URL
const PROXY_URL = `http://${window.location.hostname}:4000/api`;
const API_BASE_URL = PROXY_URL;

// PCR Thresholds
const PCR_THRESHOLDS = {
    STRONG_BULLISH: 1.5,
    BULLISH: 1.0,
    BEARISH: 0.5
};

interface DetailedMetrics {
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
    status: 'strong-bullish' | 'bullish' | 'bearish' | 'strong-bearish';
}

// Create secure axios instance with default headers
const secureAxios: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    },
    withCredentials: true, // Enable if using cookies
    timeout: 10000, // 10 second timeout
});

// Add request interceptor for dynamic headers
secureAxios.interceptors.request.use((config) => {
    // Add timestamp to prevent caching
    config.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    config.headers['Pragma'] = 'no-cache';
    config.headers['Expires'] = '0';
    
    return config;
});

// Add response interceptor for error handling
secureAxios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            console.error('API Error:', error.response.status, error.response.data);
        }
        return Promise.reject(error);
    }
);

const getStocks = async (): Promise<{ indices: string[], equities: string[] }> => {
    // Return separate lists for indices and equities
    return {
        indices: Object.keys(AVAILABLE_SYMBOLS.indices),
        equities: Object.keys(AVAILABLE_SYMBOLS.equities)
    };
};

const getOptionChain = async (symbol: string): Promise<{ optionChain: OptionChainData[], metrics: DetailedMetrics }> => {
    try {
        const type = getSymbolType(symbol);
        const response = await secureAxios.get(`/option-chain/${type}/${symbol}`);
        
        if (!response.data?.filtered?.data) {
            throw new Error('Invalid data format received from NSE');
        }

        const rawData = response.data.filtered.data;
        const timestamp = new Date().toISOString();
        const expiryDate = rawData[0]?.expiryDate || '';
        const spotPrice = rawData[0]?.underlyingValue || 0;

        // Find ATM strike (closest to spot price)
        const atmStrike = rawData.reduce((closest: number, current: any) => {
            return Math.abs(current.strikePrice - spotPrice) < Math.abs(closest - spotPrice) 
                ? current.strikePrice 
                : closest;
        }, rawData[0]?.strikePrice || 0);

        // Calculate metrics
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
        let atmCallOI = 0;
        let atmPutOI = 0;

        // Transform and calculate metrics
        const optionChain = rawData
            .filter((item: any) => item.CE || item.PE)
            .map((item: any) => {
                const strikePrice = item.strikePrice;
                const ceOI = item.CE?.openInterest || 0;
                const peOI = item.PE?.openInterest || 0;
                const ceChangeOI = item.CE?.changeinOpenInterest || 0;
                const peChangeOI = item.PE?.changeinOpenInterest || 0;

                // Update metrics
                totalCallOI += ceOI;
                totalPutOI += peOI;

                if (ceOI > maxCallOI) {
                    maxCallOI = ceOI;
                    maxCallOIStrike = strikePrice;
                }
                if (peOI > maxPutOI) {
                    maxPutOI = peOI;
                    maxPutOIStrike = strikePrice;
                }
                if (ceChangeOI > maxCallChangeOI) {
                    maxCallChangeOI = ceChangeOI;
                    maxCallChangeOIStrike = strikePrice;
                }
                if (peChangeOI > maxPutChangeOI) {
                    maxPutChangeOI = peChangeOI;
                    maxPutChangeOIStrike = strikePrice;
                }
                if (strikePrice === atmStrike) {
                    atmCallOI = ceOI;
                    atmPutOI = peOI;
                }

                return {
                    strikePrice,
                    expiryDate: item.expiryDate,
                    underlyingValue: item.CE?.underlyingValue || item.PE?.underlyingValue || 0,
                    calls: item.CE ? {
                        openInterest: ceOI,
                        changeinOpenInterest: ceChangeOI,
                        totalTradedVolume: item.CE.totalTradedVolume,
                        impliedVolatility: item.CE.impliedVolatility,
                        lastPrice: item.CE.lastPrice,
                        change: item.CE.pChange,
                        bidQty: item.CE.bidQty,
                        bidPrice: item.CE.bidprice,
                        askPrice: item.CE.askPrice,
                        askQty: item.CE.askQty
                    } : {
                        openInterest: 0,
                        changeinOpenInterest: 0,
                        totalTradedVolume: 0,
                        impliedVolatility: 0,
                        lastPrice: 0,
                        change: 0,
                        bidQty: 0,
                        bidPrice: 0,
                        askPrice: 0,
                        askQty: 0
                    },
                    puts: item.PE ? {
                        openInterest: peOI,
                        changeinOpenInterest: peChangeOI,
                        totalTradedVolume: item.PE.totalTradedVolume,
                        impliedVolatility: item.PE.impliedVolatility,
                        lastPrice: item.PE.lastPrice,
                        change: item.PE.pChange,
                        bidQty: item.PE.bidQty,
                        bidPrice: item.PE.bidprice,
                        askPrice: item.PE.askPrice,
                        askQty: item.PE.askQty
                    } : {
                        openInterest: 0,
                        changeinOpenInterest: 0,
                        totalTradedVolume: 0,
                        impliedVolatility: 0,
                        lastPrice: 0,
                        change: 0,
                        bidQty: 0,
                        bidPrice: 0,
                        askPrice: 0,
                        askQty: 0
                    }
                };
            });

            // Calculate PCR and determine market status
            const pcr = totalCallOI === 0 ? 0 : totalPutOI / totalCallOI;
            const changePCR = atmCallOI === 0 ? 0 : atmPutOI / atmCallOI;
            const status = pcr >= PCR_THRESHOLDS.STRONG_BULLISH ? 'strong-bullish' :
                          pcr >= PCR_THRESHOLDS.BULLISH ? 'bullish' :
                          pcr >= PCR_THRESHOLDS.BEARISH ? 'bearish' : 'strong-bearish';

            const metrics: DetailedMetrics = {
                timestamp,
                symbol,
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
            };

            return { optionChain, metrics };
        } catch (error) {
            console.error('Error fetching option chain:', error);
            throw error;
        }
    };

const isMarketOpen = (): boolean => {
    const now = new Date();
    const day = now.getDay();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentTime = hours * 100 + minutes;

    // Check if it's a weekday (Monday-Friday)
    if (day === 0 || day === 6) return false;

    // Market hours: 9:15 AM - 3:30 PM IST
    return currentTime >= 915 && currentTime <= 1530;
};

const getFavorites = async (): Promise<string[]> => {
    const response = await secureAxios.get('/favorites');
    return response.data;
};

const addFavorite = async (symbol: string): Promise<string[]> => {
    const response = await secureAxios.post('/favorites', { symbol });
    return response.data.favSymbols;
};

const removeFavorite = async (symbol: string): Promise<string[]> => {
    const response = await secureAxios.delete(`/favorites/${symbol}`);
    return response.data.favSymbols;
};

export const api = {
    getStocks,
    getOptionChain,
    isMarketOpen,
    getFavorites,
    addFavorite,
    removeFavorite
};
