const express = require('express');
const axios = require('axios');
const cors = require('cors');
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
    'Connection': 'keep-alive'
};

let cookies = '';
let cookieInitializationAttempts = 0;
const MAX_INITIALIZATION_ATTEMPTS = 5;

// Initialize cookies with retry mechanism
async function initializeCookies() {
    try {
        cookieInitializationAttempts++;
        console.log(`Attempting to initialize cookies (Attempt ${cookieInitializationAttempts}/${MAX_INITIALIZATION_ATTEMPTS})`);

        const response = await axios.get('https://www.nseindia.com', {
            headers,
            timeout: 10000,
            maxRedirects: 5,
            validateStatus: function (status) {
                return status >= 200 && status < 400; // Accept redirects
            }
        });

        if (response.headers['set-cookie']) {
            cookies = response.headers['set-cookie'].join(';');
            cookieInitializationAttempts = 0; // Reset attempts on success
            console.log('Cookies initialized successfully');
            return true;
        } else {
            console.error('No cookies received from NSE');
            throw new Error('No cookies in response');
        }
    } catch (error) {
        console.error('Error initializing cookies:', error.message);
        
        if (cookieInitializationAttempts < MAX_INITIALIZATION_ATTEMPTS) {
            const delay = Math.min(1000 * Math.pow(2, cookieInitializationAttempts), 30000); // Exponential backoff
            console.log(`Retrying in ${delay/1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return initializeCookies();
        } else {
            console.error('Max initialization attempts reached');
            cookieInitializationAttempts = 0; // Reset for next time
            return false;
        }
    }
}

// Initialize cookies on server start
(async () => {
    await initializeCookies();
})();

// Refresh cookies every 15 minutes
setInterval(async () => {
    console.log('Refreshing cookies...');
    await initializeCookies();
}, 15 * 60 * 1000);

app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        cookiesInitialized: !!cookies,
        lastInitializationAttempt: new Date().toISOString(),
        initializationAttempts: cookieInitializationAttempts
    });
});

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

        const response = await axios.get(url, {
            headers: {
                ...headers,
                Cookie: cookies,
                'Referer': 'https://www.nseindia.com'
            },
            timeout: 10000
        });

        if (!response.data || !response.data.filtered) {
            console.error('Invalid response format from NSE');
            return res.status(502).json({ error: 'Invalid response from NSE' });
        }

        res.json(response.data);
    } catch (error) {
        console.error('Error fetching data:', error.message);
        
        if (error.code === 'ECONNABORTED') {
            return res.status(504).json({ error: 'Request timeout' });
        }
        
        if (error.response) {
            if (error.response.status === 403) {
                cookies = ''; // Clear cookies on 403
                await initializeCookies(); // Try to get new cookies
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
