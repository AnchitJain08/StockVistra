const express = require('express');
const axios = require('axios');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const app = express();

// Enable CORS for all origins in development
app.use(cors({
    origin: true,
    credentials: true
}));

// Add JSON body parsing middleware
app.use(express.json());

// Headers required by NSE
const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'en-US,en;q=0.9',
};

let cookies = '';

// File paths
const FAV_SYMBOLS_FILE = path.join(__dirname, 'data', 'favSymbols.json');
const SYMBOL_DATA_DIR = path.join(__dirname, 'data', 'symbolData');

// Format timestamp as DD/MM-HH:MM
const formatTimestamp = () => {
    const now = new Date();
    const day = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}-${hours}:${minutes}`;
};

// Initialize cookies
async function initializeCookies() {
    try {
        const response = await axios.get('https://www.nseindia.com', { headers });
        cookies = response.headers['set-cookie'].join(';');
    } catch (error) {
        console.error('Error initializing cookies:', error);
    }
}

// Initialize favorites file if it doesn't exist
const initFavoritesFile = async () => {
    try {
        await fs.access(FAV_SYMBOLS_FILE);
    } catch (error) {
        await fs.writeFile(FAV_SYMBOLS_FILE, JSON.stringify({ favSymbols: [] }, null, 2));
    }
};

// Get option chain data for a symbol
async function getOptionChainData(symbol) {
    try {
        const type = symbol.includes('NIFTY') ? 'indices' : 'equities';
        const url = `https://www.nseindia.com/api/option-chain-${type}?symbol=${symbol}`;
        const response = await axios.get(url, {
            headers: {
                ...headers,
                Cookie: cookies
            }
        });

        if (!response.data?.filtered?.data) {
            throw new Error('Invalid data format received from NSE');
        }

        const rawData = response.data.filtered.data;
        const spotPrice = response.data.records.underlyingValue || 0;

        // Get previous data from file
        const symbolDataFile = path.join(SYMBOL_DATA_DIR, `${symbol}-data.json`);
        let previousData = [];
        try {
            const fileContent = await fs.readFile(symbolDataFile, 'utf8');
            previousData = JSON.parse(fileContent);
        } catch (error) {
            // File doesn't exist or is invalid, continue with empty previous data
        }

        // Get last record's underline value
        const lastRecord = previousData[previousData.length - 1];
        const previousUnderlineValue = lastRecord?.['Spot Price'] || 0;

        // If the underline value hasn't changed, don't add new data
        if (parseFloat(previousUnderlineValue).toFixed(1) === parseFloat(spotPrice).toFixed(1) && previousData.length > 0) {
            return null;
        }

        let totalCallOI = 0;
        let totalPutOI = 0;
        let atmCallOI = 0;
        let atmPutOI = 0;
        let atmStrike = 0;

        // Calculate ATM strike price
        const strikes = rawData.map(item => item.strikePrice).sort((a, b) => a - b);
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

        atmStrike = closestStrike;

        // Calculate metrics
        rawData.forEach(item => {
            if (item.CE) totalCallOI += item.CE.openInterest || 0;
            if (item.PE) totalPutOI += item.PE.openInterest || 0;
            
            if (item.strikePrice === atmStrike) {
                atmCallOI = item.CE?.openInterest || 0;
                atmPutOI = item.PE?.openInterest || 0;
            }
        });

        const pcr = totalPutOI / totalCallOI;
        const changePCR = atmPutOI / atmCallOI;

        let marketStatus = 'neutral';
        if (pcr >= 1.5) marketStatus = 'strong-bullish';
        else if (pcr >= 1.0) marketStatus = 'bullish';
        else if (pcr <= 0.5) marketStatus = 'strong-bearish';
        else if (pcr < 1.0) marketStatus = 'bearish';

        return {
            timeStamp: formatTimestamp(),
            'Total Call OI': totalCallOI,
            'Total Put OI': totalPutOI,
            'PCR': pcr.toFixed(2),
            'ATM Strike': atmStrike,
            'ATM CE OI': atmCallOI,
            'ATM PE OI': atmPutOI,
            'Change PCR': isFinite(changePCR) ? changePCR.toFixed(2) : '0.00',
            'Market Status': marketStatus,
            'Spot Price': spotPrice
        };
    } catch (error) {
        console.error('Error fetching data for symbol:', error);
        return null;
    }
}

// Initialize data files for all favorite symbols
async function initializeSymbolDataFiles() {
    try {
        const { favSymbols } = JSON.parse(await fs.readFile(FAV_SYMBOLS_FILE, 'utf8'));
        if (!Array.isArray(favSymbols)) {
            // Invalid favorites format: favSymbols is not an array
            return;
        }

        for (const symbol of favSymbols) {
            const filePath = path.join(SYMBOL_DATA_DIR, `${symbol}-data.json`);
            try {
                await fs.access(filePath);
            } catch (error) {
                // File doesn't exist, create it with initial data
                const initialData = await getOptionChainData(symbol);
                if (initialData) {
                    await fs.writeFile(filePath, JSON.stringify([initialData], null, 2));
                }
            }
        }
    } catch (error) {
        console.error('Error initializing symbol data files:', error);
    }
}

// Rate limiter for NSE requests
const requestTimestamps = {};
const MIN_REQUEST_INTERVAL = 5000; // Minimum 5 seconds between requests for the same symbol

// Check if we can make a request for this symbol
function canMakeRequest(symbol) {
    const now = Date.now();
    if (!requestTimestamps[symbol] || (now - requestTimestamps[symbol]) >= MIN_REQUEST_INTERVAL) {
        requestTimestamps[symbol] = now;
        return true;
    }
    return false;
}

// Get last update timestamp from NSE data
async function getLastNSEUpdate(symbol) {
    try {
        // First get the cookies from main NSE page
        const cookieResponse = await axios.get('https://www.nseindia.com', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br'
            }
        });

        const cookies = cookieResponse.headers['set-cookie'];
        const cookieString = cookies ? cookies.join('; ') : '';

        // Wait a bit before making the next request
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Now make the actual API request with cookies
        const response = await axios.get(`https://www.nseindia.com/api/option-chain-${symbol.toLowerCase() === 'nifty' ? 'indices' : 'equities'}?symbol=${symbol}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'Referer': 'https://www.nseindia.com',
                'Cookie': cookieString
            }
        });

        return response.data;
    } catch (error) {
        console.error('Error fetching NSE timestamp for symbol:', error);
        return null;
    }
}

// Track last update time for each symbol
const lastUpdateTimes = {};
let lastCheckTime = 0;
const CHECK_INTERVAL = 15000; // 15 seconds between checks
const MIN_UPDATE_INTERVAL = 60000; // Minimum 1 minute between updates

// Track last spot prices for each symbol
const lastSpotPrices = {};

// Check if market is open (9:15 AM - 3:30 PM IST on weekdays)
function isMarketOpen() {
    const now = new Date();
    const day = now.getDay();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentTime = hours * 100 + minutes;

    // Check if it's a weekday (Monday-Friday)
    if (day === 0 || day === 6) return false;

    // Market hours: 9:15 AM - 3:30 PM IST
    return currentTime >= 915 && currentTime <= 1530;
}

// Check and update data if NSE has new information
async function checkAndUpdateSymbolData(symbol) {
    try {
        const filePath = path.join(SYMBOL_DATA_DIR, `${symbol}-data.json`);
        let currentData = [];

        try {
            currentData = JSON.parse(await fs.readFile(filePath, 'utf8'));
        } catch (error) {
            return;
        }

        if (!isMarketOpen()) {
            return;
        }

        const lastNSEUpdate = await getLastNSEUpdate(symbol);
        const lastDataUpdate = currentData[0]?.timeStamp;

        if (lastNSEUpdate && (!lastDataUpdate || lastNSEUpdate !== lastDataUpdate)) {
            const newData = await getOptionChainData(symbol);
            if (newData) {
                const updated = await checkAndUpdateSymbolDataHelper(symbol, currentData, newData);
                if (updated) {
                    await fs.writeFile(filePath, JSON.stringify(currentData.slice(0, 700), null, 2));
                }
            }
        }
    } catch (error) {
        console.error('Error in checkAndUpdateSymbolData:', error);
    }
}

async function checkAndUpdateSymbolDataHelper(symbol, existingData, newData) {
    try {
        if (!existingData || !newData || existingData.length === 0) {
            return false;
        }

        const now = Date.now();
        const lastUpdateTime = lastUpdateTimes[symbol] || 0;
        const timeSinceLastUpdate = now - lastUpdateTime;
        
        const latestExistingData = existingData[0];
        
        // Rule 1 (Highest Priority): Check if the new data is identical to the last data
        const isDataIdentical = Object.keys(newData).every(key => {
            // For spot price, compare up to 1 decimal place
            if (key === 'Spot Price') {
                return parseFloat(newData[key]).toFixed(1) === parseFloat(latestExistingData[key]).toFixed(1);
            }
            // For other numeric values, compare directly
            if (typeof newData[key] === 'number') {
                return newData[key] === latestExistingData[key];
            }
            // For string values, compare directly
            return newData[key] === latestExistingData[key];
        });
        
        if (isDataIdentical) {
            // Data is identical, no update needed
            return false;
        }

        // Rule 2 (Next Highest Priority): Must wait at least 1 minute between updates
        if (timeSinceLastUpdate < MIN_UPDATE_INTERVAL) {
            // Less than 1 minute since last update
            return false;
        }

        // Rule 3 (Secondary Priority): Check if spot price has changed
        const newSpotPrice = parseFloat(newData['Spot Price']).toFixed(1);
        const existingSpotPrice = parseFloat(latestExistingData['Spot Price']).toFixed(1);
        const spotPriceChanged = newSpotPrice !== existingSpotPrice;

        // Update data if either:
        // 1. One minute has passed (Rule 2 satisfied) AND data is different (Rule 1 satisfied)
        // 2. Spot price has changed (Rule 3) AND one minute has passed (Rule 2 satisfied) AND data is different (Rule 1 satisfied)
        if ((timeSinceLastUpdate >= MIN_UPDATE_INTERVAL && !isDataIdentical) || 
            (spotPriceChanged && timeSinceLastUpdate >= MIN_UPDATE_INTERVAL && !isDataIdentical)) {
            const timestamp = formatTimestamp();
            const updatedData = {
                timeStamp: timestamp,
                'Total Call OI': newData['Total Call OI'],
                'Total Put OI': newData['Total Put OI'],
                'PCR': newData['PCR'],
                'ATM Strike': newData['ATM Strike'],
                'ATM CE OI': newData['ATM CE OI'],
                'ATM PE OI': newData['ATM PE OI'],
                'Change PCR': newData['Change PCR'],
                'Market Status': newData['Market Status'],
                'Spot Price': newData['Spot Price']
            };

            // Update data due to spot price change or regular interval
            existingData.unshift(updatedData);
            lastUpdateTimes[symbol] = now;
            return true;
        }

        return false;
    } catch (error) {
        console.error('Error in checkAndUpdateSymbolData:', error);
        return false;
    }
}

// Clean up data files for symbols no longer in favorites
async function cleanupRemovedSymbols() {
    try {
        // Get current favorite symbols
        const favoritesData = JSON.parse(await fs.readFile(FAV_SYMBOLS_FILE, 'utf8'));
        const currentFavorites = new Set(favoritesData.favSymbols);

        // Get all data files
        const files = await fs.readdir(SYMBOL_DATA_DIR);
        
        // Check each data file
        for (const file of files) {
            if (file.endsWith('-data.json')) {
                const symbol = file.replace('-data.json', '');
                if (!currentFavorites.has(symbol)) {
                    // If symbol is not in favorites, delete its data file
                    const filePath = path.join(SYMBOL_DATA_DIR, file);
                    await fs.unlink(filePath);
                }
            }
        }
    } catch (error) {
        console.error('Error cleaning up removed symbols:', error);
    }
}

// Update data for all favorite symbols
async function updateFavoriteSymbolsData() {
    const now = Date.now();
    // Only proceed if enough time has passed since last check
    if (now - lastCheckTime < CHECK_INTERVAL) {
        return;
    }
    lastCheckTime = now;

    try {
        // Clean up any data files for removed symbols first
        await cleanupRemovedSymbols();

        const favoritesData = JSON.parse(await fs.readFile(FAV_SYMBOLS_FILE, 'utf8'));
        const symbols = favoritesData.favSymbols;
        
        await initializeSymbolDataFiles();

        for (const symbol of symbols) {
            await checkAndUpdateSymbolData(symbol);
            // Add a small delay between symbols
            await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL));
        }
    } catch (error) {
        console.error('Error updating favorite symbols data:', error);
    }
}

// Delete symbol data file
async function deleteSymbolDataFile(symbol) {
    try {
        const filePath = path.join(SYMBOL_DATA_DIR, `${symbol}-data.json`);
        await fs.unlink(filePath);
    } catch (error) {
        console.error('Error deleting data file for symbol:', error);
    }
}

// Remove a favorite symbol
app.delete('/api/favorites/:symbol', async (req, res) => {
    try {
        const { symbol } = req.params;
        const data = JSON.parse(await fs.readFile(FAV_SYMBOLS_FILE, 'utf8'));
        
        if (data.favSymbols.includes(symbol)) {
            data.favSymbols = data.favSymbols.filter(s => s !== symbol);
            await fs.writeFile(FAV_SYMBOLS_FILE, JSON.stringify(data, null, 2));
            
            // Delete the symbol's data file immediately
            const filePath = path.join(SYMBOL_DATA_DIR, `${symbol}-data.json`);
            try {
                await fs.unlink(filePath);
            } catch (error) {
                // Ignore error if file doesn't exist
            }
            
            res.json({ message: 'Symbol removed from favorites' });
        } else {
            res.status(404).json({ error: 'Symbol not found in favorites' });
        }
    } catch (error) {
        console.error('Error removing symbol from favorites:', error);
        res.status(500).json({ error: 'Failed to remove symbol from favorites' });
    }
});

app.get('/api/option-chain/:type/:symbol', async (req, res) => {
    try {
        const { type, symbol } = req.params;
        const url = type === 'indices' 
            ? `https://www.nseindia.com/api/option-chain-indices?symbol=${symbol}`
            : `https://www.nseindia.com/api/option-chain-equities?symbol=${symbol}`;

        const response = await axios.get(url, {
            headers: {
                ...headers,
                Cookie: cookies
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Failed to fetch data from NSE' });
    }
});

// Get historical data for a specific symbol
app.get('/api/symbol-data/:symbol', async (req, res) => {
    try {
        const symbol = req.params.symbol;
        const filePath = path.join(SYMBOL_DATA_DIR, `${symbol}-data.json`);
        
        try {
            const data = await fs.readFile(filePath, 'utf8');
            res.json(JSON.parse(data));
        } catch (error) {
            if (error.code === 'ENOENT') {
                res.status(404).json({ error: `No data found for symbol: ${symbol}` });
            } else {
                console.error('Error reading data for symbol:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        }
    } catch (error) {
        console.error('Error fetching symbol data:', error);
        res.status(500).json({ error: 'Failed to fetch symbol data' });
    }
});

// Get latest data for all favorite symbols
app.get('/api/symbol-data', async (req, res) => {
    try {
        const favoritesData = JSON.parse(await fs.readFile(FAV_SYMBOLS_FILE, 'utf8'));
        const symbols = favoritesData.favSymbols;
        const latestData = {};

        for (const symbol of symbols) {
            try {
                const filePath = path.join(SYMBOL_DATA_DIR, `${symbol}-data.json`);
                const data = JSON.parse(await fs.readFile(filePath, 'utf8'));
                latestData[symbol] = data[data.length - 1] || null;
            } catch (error) {
                latestData[symbol] = null;
            }
        }

        res.json(latestData);
    } catch (error) {
        console.error('Error fetching latest symbol data:', error);
        res.status(500).json({ error: 'Failed to fetch latest symbol data' });
    }
});

// Clean up old data to keep only the latest 700 data points
async function cleanupOldData() {
    try {
        const files = await fs.readdir(SYMBOL_DATA_DIR);
        
        for (const file of files) {
            if (file.endsWith('-data.json')) {
                const filePath = path.join(SYMBOL_DATA_DIR, file);
                const data = JSON.parse(await fs.readFile(filePath, 'utf8'));
                
                // Keep only the latest 700 data points
                const filteredData = data.slice(0, 700);

                // Write filtered data back to file
                await fs.writeFile(filePath, JSON.stringify(filteredData, null, 2));
            }
        }
    } catch (error) {
        console.error('Error cleaning up old data:', error);
    }
}

// Initialize directories
async function initializeDirectories() {
    try {
        await fs.mkdir(path.join(__dirname, 'data'), { recursive: true });
        await fs.mkdir(SYMBOL_DATA_DIR, { recursive: true });
    } catch (error) {
        console.error('Error initializing directories:', error);
    }
}

const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => {});

// Initialize directories and files on server start
initializeDirectories();
initializeCookies();
initFavoritesFile();

// Start background tasks with optimized intervals
updateFavoriteSymbolsData();
setInterval(updateFavoriteSymbolsData, 10 * 1000);
setInterval(initializeCookies, 30 * 60 * 1000);
setInterval(cleanupOldData, 24 * 60 * 60 * 1000);

// Get favorite symbols
app.get('/api/favorites', async (req, res) => {
    try {
        await initFavoritesFile(); // Ensure file exists
        const data = await fs.readFile(FAV_SYMBOLS_FILE, 'utf8');
        const favorites = JSON.parse(data);
        res.json(favorites.favSymbols);
    } catch (error) {
        console.error('Error reading favorites:', error);
        res.status(500).json({ error: 'Failed to read favorites' });
    }
});

// Add a favorite symbol
app.post('/api/favorites', async (req, res) => {
    try {
        await initFavoritesFile(); // Ensure file exists
        const { symbol } = req.body;
        if (!symbol) {
            return res.status(400).json({ error: 'Symbol is required' });
        }

        const data = await fs.readFile(FAV_SYMBOLS_FILE, 'utf8');
        const favorites = JSON.parse(data);
        
        // Check if symbol is already in favorites
        if (favorites.favSymbols.includes(symbol)) {
            return res.status(400).json({ error: 'Symbol already in favorites' });
        }
        
        // Check if favorites limit is reached
        if (favorites.favSymbols.length >= 10) {
            return res.status(400).json({ error: 'Maximum favorites limit reached' });
        }
        
        // Add symbol to favorites
        favorites.favSymbols.push(symbol);
        await fs.writeFile(FAV_SYMBOLS_FILE, JSON.stringify(favorites, null, 2));
        
        // Initialize data file for the new symbol
        await initializeSymbolDataFiles();
        
        res.json({ message: 'Symbol added to favorites' });
    } catch (error) {
        console.error('Error adding favorite:', error);
        res.status(500).json({ error: 'Failed to add symbol to favorites' });
    }
});

async function updateSymbolData(symbol) {
    try {
        const data = await getOptionChainData(symbol);
        if (!data) {
            return; // Skip if no data or no change in underline value
        }

        const symbolDataFile = path.join(SYMBOL_DATA_DIR, `${symbol}-data.json`);
        let existingData = [];

        try {
            const fileContent = await fs.readFile(symbolDataFile, 'utf8');
            existingData = JSON.parse(fileContent);
        } catch (error) {
            // File doesn't exist or is invalid JSON, continue with empty array
            if (error.code !== 'ENOENT') {
                console.error('Error reading symbol data file:', error);
            }
        }

        const updated = await checkAndUpdateSymbolDataHelper(symbol, existingData, data);
        if (updated) {
            existingData.unshift(data);
            await fs.writeFile(symbolDataFile, JSON.stringify(existingData.slice(0, 700), null, 2));
        }
    } catch (error) {
        console.error('Error updating data for symbol:', error);
    }
}