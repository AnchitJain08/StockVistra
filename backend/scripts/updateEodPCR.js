const fs = require('fs').promises;
const path = require('path');

// Import symbols from the frontend constants
const INDICES = [
    "NIFTY",
    "NIFTYNXT50",
    "BANKNIFTY",
    "FINNIFTY",
    "MIDCPNIFTY"
];

const EQUITIES = [
    "AARTIIND", "ABB", "ABBOTINDIA", "ABCAPITAL", "ABFRL", "ACC", "ADANIENSOL", "ADANIENT",
    "ADANIGREEN", "ADANIPORTS", "ALKEM", "AMBUJACEM", "ANGELONE", "APLAPOLLO", "APOLLOHOSP",
    "APOLLOTYRE", "ASHOKLEY", "ASIANPAINT", "ASTRAL", "ATGL", "ATUL", "AUBANK", "AUROPHARMA",
    "AXISBANK", "BAJAJ-AUTO", "BAJAJFINSV", "BAJFINANCE", "BALKRISIND", "BANDHANBNK",
    "BANKBARODA", "BANKINDIA", "BATAINDIA", "BEL", "BERGEPAINT", "BHARATFORG", "BHARTIARTL",
    "BHEL", "BIOCON", "BOSCHLTD", "BPCL", "BRITANNIA", "BSE", "BSOFT", "CAMS", "CANBK",
    "CANFINHOME", "CDSL", "CESC", "CGPOWER", "CHAMBLFERT", "CHOLAFIN", "CIPLA", "COALINDIA",
    "COFORGE", "COLPAL", "CONCOR", "COROMANDEL", "CROMPTON", "CUB", "CUMMINSIND", "CYIENT",
    "DABUR", "DALBHARAT", "DEEPAKNTR", "DELHIVERY", "DIVISLAB", "DIXON", "DLF", "DMART",
    "DRREDDY", "EICHERMOT", "ESCORTS", "EXIDEIND", "FEDERALBNK", "GAIL", "GLENMARK",
    "GMRAIRPORT", "GNFC", "GODREJCP", "GODREJPROP", "GRANULES", "GRASIM", "GUJGASLTD",
    "HAL", "HAVELLS", "HCLTECH", "HDFCAMC", "HDFCBANK", "HDFCLIFE", "HEROMOTOCO", "HFCL",
    "HINDALCO", "HINDCOPPER", "HINDPETRO", "HINDUNILVR", "HUDCO", "ICICIBANK", "ICICIGI",
    "ICICIPRULI", "IDEA", "IDFCFIRSTB", "IEX", "IGL", "INDHOTEL", "INDIAMART", "INDIANB",
    "INDIGO", "INDUSINDBK", "INDUSTOWER", "INFY", "IOC", "IPCALAB", "IRB", "IRCTC", "IRFC",
    "ITC", "JINDALSTEL", "JIOFIN", "JKCEMENT", "JSL", "JSWENERGY", "JSWSTEEL", "JUBLFOOD",
    "KALYANKJIL", "KEI", "KOTAKBANK", "KPITTECH", "LALPATHLAB", "LAURUSLABS", "LICHSGFIN",
    "LICI", "LODHA", "LT", "LTF", "LTIM", "LTTS", "LUPIN", "M&M", "M&MFIN", "MANAPPURAM",
    "MARICO", "MARUTI", "MAXHEALTH", "MCX", "METROPOLIS", "MFSL", "MGL", "MOTHERSON",
    "MPHASIS", "MRF", "MUTHOOTFIN", "NATIONALUM", "NAUKRI", "NAVINFLUOR", "NCC", "NESTLEIND",
    "NHPC", "NMDC", "NTPC", "NYKAA", "OBEROIRLTY", "OFSS", "OIL", "ONGC", "PAGEIND",
    "PAYTM", "PEL", "PERSISTENT", "PETRONET", "PFC", "PIDILITIND", "PIIND", "PNB",
    "POLICYBZR", "POLYCAB", "POONAWALLA", "POWERGRID", "PRESTIGE", "PVRINOX", "RAMCOCEM",
    "RBLBANK", "RECLTD", "RELIANCE", "SAIL", "SBICARD", "SBILIFE", "SBIN", "SHREECEM",
    "SHRIRAMFIN", "SIEMENS", "SJVN", "SONACOMS", "SRF", "SUNPHARMA", "SUNTV", "SUPREMEIND",
    "SYNGENE", "TATACHEM", "TATACOMM", "TATACONSUM", "TATAELXSI", "TATAMOTORS", "TATAPOWER",
    "TATASTEEL", "TCS", "TECHM", "TIINDIA", "TITAN", "TORNTPHARM", "TRENT", "TVSMOTOR",
    "UBL", "ULTRACEMCO", "UNIONBANK", "UNITDSPR", "UPL", "VBL", "VEDL", "VOLTAS", "WIPRO",
    "YESBANK", "ZOMATO", "ZYDUSLIFE"
];

class MarketTimingValidator {
    static MARKET_CLOSE_HOUR = 15;
    static MARKET_CLOSE_MINUTE = 30;
    static NEXT_DAY_MARKET_START_HOUR = 9;
    static NEXT_DAY_MARKET_START_MINUTE = 15;

    static isWeekend(date) {
        const day = date.getDay();
        return day === 0 || day === 6; // 0 is Sunday, 6 is Saturday
    }

    static isAfterMarketClose(date) {
        const hours = date.getHours();
        const minutes = date.getMinutes();
        return (hours > this.MARKET_CLOSE_HOUR) || 
               (hours === this.MARKET_CLOSE_HOUR && minutes >= this.MARKET_CLOSE_MINUTE);
    }

    static isBeforeNextMarketOpen(date) {
        const hours = date.getHours();
        const minutes = date.getMinutes();
        return (hours < this.NEXT_DAY_MARKET_START_HOUR) || 
               (hours === this.NEXT_DAY_MARKET_START_HOUR && minutes < this.NEXT_DAY_MARKET_START_MINUTE);
    }

    static canUpdateEODData(date) {
        if (this.isWeekend(date)) {
            return false;
        }
        return this.isAfterMarketClose(date);
    }

    static getLastTradingDate(currentDate) {
        const date = new Date(currentDate);
        date.setHours(0, 0, 0, 0);

        if (!this.isWeekend(date) && this.isAfterMarketClose(currentDate)) {
            return date.toISOString().split('T')[0];
        }

        while (this.isWeekend(date)) {
            date.setDate(date.getDate() - 1);
        }
        return date.toISOString().split('T')[0];
    }
}

async function updateEODPCR(symbol, pcrValue) {
    try {
        const currentDate = new Date();
        
        if (!MarketTimingValidator.canUpdateEODData(currentDate)) {
            return false;
        }

        const tradingDate = MarketTimingValidator.getLastTradingDate(currentDate);
        const filePath = path.join(__dirname, '..', 'data', 'eodData', `${symbol}-eod.json`);
        const data = JSON.parse(await fs.readFile(filePath, 'utf8'));

        const existingEntry = data.find(entry => entry.datestamp === tradingDate);
        if (existingEntry) {
            return false;
        }

        data.push({
            datestamp: tradingDate,
            pcr: pcrValue
        });

        data.sort((a, b) => new Date(b.datestamp) - new Date(a.datestamp));
        await fs.writeFile(filePath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error(`Error updating EOD PCR for ${symbol}:`, error);
        return false;
    }
}

async function updateAllSymbolsEODPCR(pcrData) {
    const currentDate = new Date();
    
    if (!MarketTimingValidator.canUpdateEODData(currentDate)) {
        return false;
    }

    const results = {
        success: [],
        failed: [],
        skipped: []
    };

    // Update indices
    for (const symbol of INDICES) {
        const pcr = pcrData[symbol];
        if (pcr === undefined) {
            results.skipped.push(symbol);
            continue;
        }

        try {
            const updated = await updateEODPCR(symbol, pcr);
            if (updated) {
                results.success.push(symbol);
            } else {
                results.skipped.push(symbol);
            }
        } catch (error) {
            console.error(`Failed to update ${symbol}:`, error);
            results.failed.push(symbol);
        }
    }

    // Update equities
    for (const symbol of EQUITIES) {
        const pcr = pcrData[symbol];
        if (pcr === undefined) {
            results.skipped.push(symbol);
            continue;
        }

        try {
            const updated = await updateEODPCR(symbol, pcr);
            if (updated) {
                results.success.push(symbol);
            } else {
                results.skipped.push(symbol);
            }
        } catch (error) {
            console.error(`Failed to update ${symbol}:`, error);
            results.failed.push(symbol);
        }
    }

    return results;
}

module.exports = {
    updateEODPCR,
    updateAllSymbolsEODPCR,
    MarketTimingValidator
};
