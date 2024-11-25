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
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'en-US,en;q=0.9',
};

let cookies = '';

// Initialize cookies
async function initializeCookies() {
    try {
        const response = await axios.get('https://www.nseindia.com', { 
            headers,
            timeout: 10000 // 10 second timeout
        });
        if (response.headers['set-cookie']) {
            cookies = response.headers['set-cookie'].join(';');
            console.log('Cookies initialized successfully');
        } else {
            console.error('No cookies received from NSE');
        }
    } catch (error) {
        console.error('Error initializing cookies:', error.message);
        // Retry after 1 minute if initialization fails
        setTimeout(initializeCookies, 60000);
    }
}

// Initialize cookies on server start
initializeCookies();
// Refresh cookies every 15 minutes (NSE session usually expires in 30 minutes)
setInterval(initializeCookies, 15 * 60 * 1000);

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', cookiesInitialized: !!cookies });
});

app.get('/api/option-chain/:type/:symbol', async (req, res) => {
    try {
        if (!cookies) {
            console.log('Cookies not initialized, reinitializing...');
            await initializeCookies();
        }

        const { type, symbol } = req.params;
        
        // Validate input parameters
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
                Cookie: cookies
            },
            timeout: 10000 // 10 second timeout
        });

        if (!response.data || !response.data.filtered) {
            console.error('Invalid response format from NSE');
            return res.status(502).json({ error: 'Invalid response from NSE' });
        }

        res.json(response.data);
    } catch (error) {
        console.error('Error fetching data:', error.message);
        
        // Handle specific error cases
        if (error.code === 'ECONNABORTED') {
            return res.status(504).json({ error: 'Request timeout' });
        }
        
        if (error.response) {
            if (error.response.status === 403) {
                // Session might have expired, try to reinitialize cookies
                cookies = '';
                initializeCookies();
                return res.status(403).json({ error: 'Session expired, please retry' });
            }
            return res.status(error.response.status).json({ error: error.response.data });
        }
        
        res.status(500).json({ error: 'Failed to fetch data from NSE' });
    }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
