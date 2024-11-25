const express = require('express');
const axios = require('axios');
const cors = require('cors');
const https = require('https');
const app = express();

// Enable CORS for specific origin in production
app.use(cors({
    origin: process.env.FRONTEND_URL || true,
    credentials: true
}));

// Headers required by NSE
const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Accept': '*/*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Referer': 'https://www.nseindia.com',
    'sec-ch-ua': '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin'
};

let cookies = '';
let cookieInitializationAttempts = 0;
const MAX_INITIALIZATION_ATTEMPTS = 5;

// Create axios instance with custom configuration
const axiosInstance = axios.create({
    timeout: 30000,
    httpsAgent: new https.Agent({
        rejectUnauthorized: false,
        keepAlive: true
    }),
    maxRedirects: 5,
    validateStatus: function (status) {
        return status >= 200 && status < 400;
    }
});

// Initialize cookies with retry mechanism
async function initializeCookies() {
    try {
        cookieInitializationAttempts++;
        console.log(`Attempting to initialize cookies (Attempt ${cookieInitializationAttempts}/${MAX_INITIALIZATION_ATTEMPTS})`);

        // Try multiple URLs to get cookies
        const urls = [
            'https://www.nseindia.com',
            'https://www.nseindia.com/market-data',
            'https://www.nseindia.com/get-quotes/derivatives'
        ];

        for (const url of urls) {
            try {
                const response = await axiosInstance.get(url, { headers });
                if (response.headers['set-cookie']) {
                    cookies = response.headers['set-cookie'].join(';');
                    cookieInitializationAttempts = 0;
                    console.log(`Cookies initialized successfully from ${url}`);
                    return true;
                }
            } catch (err) {
                console.log(`Failed to get cookies from ${url}: ${err.message}`);
                continue;
            }
        }

        throw new Error('No cookies received from any NSE endpoint');
    } catch (error) {
        console.error('Error initializing cookies:', error.message);
        
        if (cookieInitializationAttempts < MAX_INITIALIZATION_ATTEMPTS) {
            const delay = Math.min(1000 * Math.pow(2, cookieInitializationAttempts), 30000);
            console.log(`Retrying in ${delay/1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return initializeCookies();
        } else {
            console.error('Max initialization attempts reached');
            cookieInitializationAttempts = 0;
            return false;
        }
    }
}

// Initialize cookies on server start
(async () => {
    await initializeCookies();
})();

// Refresh cookies every 10 minutes
setInterval(async () => {
    console.log('Refreshing cookies...');
    await initializeCookies();
}, 10 * 60 * 1000);

app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        cookiesInitialized: !!cookies,
        lastInitializationAttempt: new Date().toISOString(),
        initializationAttempts: cookieInitializationAttempts,
        environment: process.env.NODE_ENV || 'development'
    });
});

async function fetchOptionChainWithRetry(url, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await axiosInstance.get(url, {
                headers: {
                    ...headers,
                    Cookie: cookies
                }
            });

            if (response.data && response.data.filtered) {
                return response.data;
            }
            throw new Error('Invalid response format');
        } catch (error) {
            console.error(`Attempt ${i + 1} failed:`, error.message);
            if (i === retries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 2000));
            await initializeCookies(); // Try to refresh cookies between attempts
        }
    }
}

app.get('/api/option-chain/:type/:symbol', async (req, res) => {
    try {
        if (!cookies) {
            console.log('Cookies not initialized, attempting to initialize...');
            const initialized = await initializeCookies();
            if (!initialized) {
                return res.status(503).json({ 
                    error: 'Service temporarily unavailable', 
                    message: 'Unable to initialize NSE session' 
                });
            }
        }

        const { type, symbol } = req.params;
        
        if (!type || !symbol) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }
        
        if (!['indices', 'equities'].includes(type)) {
            return res.status(400).json({ error: 'Invalid type parameter' });
        }

        const url = type === 'indices' 
            ? `https://www.nseindia.com/api/option-chain-indices?symbol=${symbol}`
            : `https://www.nseindia.com/api/option-chain-equities?symbol=${symbol}`;

        const data = await fetchOptionChainWithRetry(url);
        res.json(data);

    } catch (error) {
        console.error('Error fetching data:', error.message);
        
        if (error.code === 'ECONNABORTED') {
            return res.status(504).json({ error: 'Request timeout' });
        }
        
        if (error.response) {
            if (error.response.status === 403) {
                cookies = '';
                await initializeCookies();
                return res.status(403).json({ 
                    error: 'Session expired', 
                    message: 'Please retry your request' 
                });
            }
            return res.status(error.response.status).json({ 
                error: error.response.data,
                message: 'Error from NSE API'
            });
        }
        
        res.status(500).json({ 
            error: 'Failed to fetch data from NSE',
            message: error.message
        });
    }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
