const fs = require('fs').promises;
const path = require('path');

const createEodTemplate = () => [];

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

async function fileExists(filePath) {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}

async function createEodFiles() {
    const results = {
        created: [],
        skipped: [],
        failed: []
    };

    const eodDataDir = path.join(__dirname, '..', 'data', 'eodData');

    try {
        await fs.mkdir(eodDataDir, { recursive: true });
    } catch (error) {
        if (error.code !== 'EEXIST') {
            throw error;
        }
    }

    for (const symbol of INDICES) {
        try {
            const filePath = path.join(eodDataDir, `${symbol}-eod.json`);
            if (await fileExists(filePath)) {
                results.skipped.push(symbol);
                continue;
            }
            const template = createEodTemplate();
            await fs.writeFile(filePath, JSON.stringify(template, null, 2));
            results.created.push(symbol);
        } catch (error) {
            results.failed.push(symbol);
        }
    }

    for (const symbol of EQUITIES) {
        try {
            const filePath = path.join(eodDataDir, `${symbol}-eod.json`);
            if (await fileExists(filePath)) {
                results.skipped.push(symbol);
                continue;
            }
            const template = createEodTemplate();
            await fs.writeFile(filePath, JSON.stringify(template, null, 2));
            results.created.push(symbol);
        } catch (error) {
            results.failed.push(symbol);
        }
    }

    return results;
}

module.exports = {
    createEodFiles,
    INDICES,
    EQUITIES
};
