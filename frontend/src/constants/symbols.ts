export interface SymbolConfig {
    name: string;
    stride: number;
}

interface SymbolsData {
    indices: { [key: string]: SymbolConfig };
    equities: { [key: string]: SymbolConfig };
}

export const AVAILABLE_SYMBOLS: SymbolsData = {
    indices: {
        'NIFTY': { 
            name: 'NIFTY 50',
            stride: 50.0
        },
        'NIFTYNXT50': {
            name: 'NIFTY NEXT 50',
            stride: 100.0
        },
        'BANKNIFTY': {
            name: 'NIFTY BANK',
            stride: 500.0
        },
        'FINNIFTY': {
            name: 'NIFTY FIN SERVICES',
            stride: 100.0
        },
        'MIDCPNIFTY': {
            name: 'NIFTY MIDCAP SELECT',
            stride: 100.0
        }
    },
    equities: {
        'AARTIIND': { 
            name: 'Aarti Industries Ltd.', 
            stride: 10 
        },
        'ABB': { 
            name: 'ABB India Ltd.', 
            stride: 100 
        },
        'ABBOTINDIA': { 
            name: 'Abbott India Ltd.', 
            stride: 250 
        },
        'ABCAPITAL': { 
            name: 'Aditya Birla Capital Ltd.', 
            stride: 2.5 
        },
        'ABFRL': { 
            name: 'Aditya Birla Fashion and Retail Ltd.', 
            stride: 5 
        },
        'ACC': { 
            name: 'ACC Ltd.', 
            stride: 20 
        },
        'ADANIENT': { 
            name: 'Adani Enterprises Ltd.', 
            stride: 20 
        },
        'ADANIPORTS': { 
            name: 'Adani Ports and Special Economic Zone Ltd.', 
            stride: 20 
        },
        'ALKEM': { 
            name: 'Alkem Laboratories Ltd.', 
            stride: 100 
        },
        'AMBUJACEM': { 
            name: 'Ambuja Cements Ltd.', 
            stride: 10 
        },
        'APOLLOHOSP': { 
            name: 'Apollo Hospitals Enterprise Ltd.', 
            stride: 50 },
        'APOLLOTYRE': { 
            name: 'Apollo Tyres Ltd.', 
            stride: 10
         },
        'ASHOKLEY': { 
            name: 'Ashok Leyland Ltd.', 
            stride: 2.5 },
        'ASTRAL': { 
            name: 'Astral Ltd.', 
            stride: 20 
        },
        'ASIANPAINT': { 
            name: 'Asian Paints Ltd.', 
            stride: 20 
        },
        'ATUL': { 
            name: 'Atul Ltd.', 
            stride: 50 
        },
        'AUBANK': { 
            name: 'AU Small Finance Bank Ltd.', 
            stride: 10 
        },
        'AUROPHARMA': { 
            name: 'Aurobindo Pharma Ltd.', 
            stride: 20 
        },
        'AXISBANK': { 
            name: 'Axis Bank Ltd.', 
            stride: 10 
        },
        'BAJAJ-AUTO': { 
            name: 'Bajaj Auto Ltd.', 
            stride: 100 
        },
        'BAJAJFINSV': { 
            name: 'Bajaj Finserv Ltd.', 
            stride: 20 
        },
        'BAJFINANCE': { 
            name: 'Bajaj Finance Ltd.', 
            stride: 100 
        },
        'BALKRISIND': { 
            name: 'Balkrishna Industries Ltd.', 
            stride: 50 
        },
        'BANDHANBNK': { 
            name: 'Bandhan Bank Ltd.', 
            stride: 2.5 
        },
        'BANKBARODA': { 
            name: 'Bank of Baroda', 
            stride: 2.5 
        },
        'BATAINDIA': { 
            name: 'Bata India Ltd.', 
            stride: 20 
        },
        'BEL': { 
            name: 'Bharat Electronics Ltd.', 
            stride: 5 
        },
        'BERGEPAINT': { 
            name: 'Berger Paints India Ltd.', 
            stride: 5 
        },
        'BHARATFORG': { 
            name: 'Bharat Forge Ltd.', 
            stride: 20 
        },
        'BHARTIARTL': { 
            name: 'Bharti Airtel Ltd.', 
            stride: 20 
        },
        'BHEL': { 
            name: 'Bharat Heavy Electricals Ltd.', 
            stride: 5 
        },
        'BIOCON': { 
            name: 'Biocon Ltd.', 
            stride: 5 
        },
        'BOSCHLTD': { 
            name: 'Bosch Ltd.', 
            stride: 500 
        },
        'BPCL': { 
            name: 'Bharat Petroleum Corporation Ltd.', 
            stride: 5 
        },
        'BRITANNIA': { 
            name: 'Britannia Industries Ltd.', 
            stride: 50 
        },
        'BSOFT': { 
            name: 'Birlasoft Ltd.', 
            stride: 10 
        },
        'CANBK': { 
            name: 'Canara Bank', 
            stride: 1 
        },
        'CANFINHOME': { 
            name: 'Can Fin Homes Ltd.', 
            stride: 10 
        },
        'CHAMBLFERT': { 
            name: 'Chambal Fertilisers and Chemicals Ltd.', 
            stride: 10 
        },
        'CHOLAFIN': { name: 'Cholamandalam Investment and Finance Company Ltd.', 
            stride: 20 
        },
        'CIPLA': { 
            name: 'Cipla Ltd.', 
            stride: 20 
        },
        'COALINDIA': { 
            name: 'Coal India Ltd.', 
            stride: 10 
        },
        'COFORGE': { 
            name: 'Coforge Ltd.', 
            stride: 100 
        },
        'COLPAL': { 
            name: 'Colgate-Palmolive (India) Ltd.', 
            stride: 50 
        },
        'CONCOR': { 
            name: 'Container Corporation of India Ltd.', 
            stride: 20 
        },
        'COROMANDEL': { 
            name: 'Coromandel International Ltd.', 
            stride: 20 
        },
        'CROMPTON': { 
            name: 'Crompton Greaves Consumer Electricals Ltd.', 
            stride: 5 
        },
        'CUB': { 
            name: 'City Union Bank Ltd.', 
            stride: 2.5 
        },
        'CUMMINSIND': { 
            name: 'Cummins India Ltd.', 
            stride: 50 
        },
        'DABUR': { 
            name: 'Dabur India Ltd.', 
            stride: 5 
        },
        'DALBHARAT': { 
            name: 'Dalmia Bharat Ltd.', 
            stride: 20 
        },
        'DEEPAKNTR': { 
            name: 'Deepak Nitrite Ltd.', 
            stride: 50 
        },
        'DIVISLAB': { 
            name: 'Divi\'s Laboratories Ltd.', 
            stride: 50 
        },
        'DIXON': { 
            name: 'Dixon Technologies (India) Ltd.', 
            stride: 100 
        },
        'DLF': { 
            name: 'DLF Ltd.', 
            stride: 10 
        },
        'DRREDDY': { 
            name: 'Dr. Reddy\'s Laboratories Ltd.',
             stride: 50
        },
        'EICHERMOT': { 
            name: 'Eicher Motors Ltd.', 
            stride: 50 
        },
        'ESCORTS': { 
            name: 'Escorts Kubota Ltd.', 
            stride: 50 
        },
        'EXIDEIND': { 
            name: 'Exide Industries Ltd.', 
            stride: 10 
        },
        'FEDERALBNK': { 
            name: 'The Federal Bank Ltd.', 
            stride: 2.5 
        },
        'GAIL': { 
            name: 'GAIL (India) Ltd.', 
            stride: 5 
        },
        'GLENMARK': { 
            name: 'Glenmark Pharmaceuticals Ltd.', 
            stride: 20 
        },
        'GMRINFRA': { 
            name: 'GMR Airports Infrastructure Ltd.', 
            stride: 2.5 
        },
        'GNFC': { 
            name: 'Gujarat Narmada Valley Fertilizers & Chemicals Ltd.', 
            stride: 10 
        },
        'GODREJCP': { 
            name: 'Godrej Consumer Products Ltd.', 
            stride: 20 
        },
        'GODREJPROP': { 
            name: 'Godrej Properties Ltd.', 
            stride: 50 
        },
        'GRANULES': { 
            name: 'Granules India Ltd.', 
            stride: 5 
        },
        'GRASIM': { 
            name: 'Grasim Industries Ltd.', 
            stride: 20 
        },
        'GUJGASLTD': { 
            name: 'Gujarat Gas Ltd.', 
            stride: 10 
        },
        'HAL': { 
            name: 'Hindustan Aeronautics Ltd.', 
            stride: 100 
        },
        'HAVELLS': { 
            name: 'Havells India Ltd.', 
            stride: 20 
        },
        'HCLTECH': { 
            name: 'HCL Technologies Ltd.', 
            stride: 20 
        },
        'HDFCAMC': { 
            name: 'HDFC Asset Management Company Ltd.', 
            stride: 50 
        },
        'HDFCBANK': { 
            name: 'HDFC Bank Ltd.', 
            stride: 10 
        },
        'HDFCLIFE': { 
            name: 'HDFC Life Insurance Company Ltd.', 
            stride: 5 
        },
        'HEROMOTOCO': { 
            name: 'Hero MotoCorp Ltd.', 
            stride: 100 
        },
        'HINDALCO': { 
            name: 'Hindalco Industries Ltd.', 
            stride: 10 
        },
        'HINDCOPPER': { 
            name: 'Hindustan Copper Ltd.', 
            stride: 10 
        },
        'HINDPETRO': { 
            name: 'Hindustan Petroleum Corporation Ltd.', 
            stride: 9 
        },
        'HINDUNILVR': { 
            name: 'Hindustan Unilever Ltd.', 
            stride: 20 
        },
        'ICICIBANK': { 
            name: 'ICICI Bank Ltd.', 
            stride: 10 
        },
        'ICICIGI': { 
            name: 'ICICI Lombard General Insurance Company Ltd.', 
            stride: 20 
        },
        'ICICIPRULI': { 
            name: 'ICICI Prudential Life Insurance Company Ltd.', 
            stride: 10 
        },
        'IDEA': { 
            name: 'Vodafone Idea Ltd.', 
            stride: 1 
        },
        'IDFC': { 
            name: 'IDFC Ltd.', 
            stride: 1 
        },
        'IDFCFIRSTB': { 
            name: 'IDFC First Bank Ltd.', 
            stride: 1 
        },
        'IEX': { 
            name: 'Indian Energy Exchange Ltd.', 
            stride: 2.5 
        },
        'IGL': { 
            name: 'Indraprastha Gas Ltd.', 
            stride: 5 
        },
        'INDHOTEL': { 
            name: 'The Indian Hotels Company Ltd.', 
            stride: 10 
        },
        'INDIACEM': { 
            name: 'The India Cements Ltd.', 
            stride: 5 
        },
        'INDIAMART': { 
            name: 'IndiaMART InterMESH Ltd.', 
            stride: 20 
        },
        'INDIGO': { 
            name: 'InterGlobe Aviation Ltd.', 
            stride: 50 
        },
        'INDUSINDBK': { 
            name: 'IndusInd Bank Ltd.', 
            stride: 20 
        },
        'INDUSTOWER': { 
            name: 'Indus Towers Ltd.', 
            stride: 5 
        },
        'INFY': { 
            name: 'Infosys Ltd.', 
            stride: 20 
        },
        'IOC': { 
            name: 'Indian Oil Corporation Ltd.', 
            stride: 2.5 
        },
        'IPCALAB': { 
            name: 'IPCA Laboratories Ltd.', 
            stride: 20 
        },
        'IRCTC': { 
            name: 'Indian Railway Catering and Tourism Corporation Ltd.', 
            stride: 20 
        },
        'ITC': { 
            name: 'ITC Ltd.', 
            stride: 5 
        },
        'JINDALSTEL': { 
            name: 'Jindal Steel & Power Ltd.', 
            stride: 20 
        },
        'JKCEMENT': { 
            name: 'JK Cement Ltd.', 
            stride: 50 
        },
        'JSWSTEEL': { 
            name: 'JSW Steel Ltd.', 
            stride: 10 
        },
        'JUBLFOOD': { 
            name: 'Jubilant FoodWorks Ltd.', 
            stride: 5 
        },
        'KOTAKBANK': { 
            name: 'Kotak Mahindra Bank Ltd.', 
            stride: 20 
        },
        'LALPATHLAB': { 
            name: 'Dr. Lal PathLabs Ltd.', 
            stride: 50 
        },
        'LAURUSLABS': { 
            name: 'Laurus Labs Ltd.', 
            stride: 5 
        },
        'LICHSGFIN': { 
            name: 'LIC Housing Finance Ltd.', 
            stride: 10 
        },
        'LT': { 
            name: 'Larsen & Toubro Ltd.', 
            stride: 50 
        },
        'LTF': { 
            name: 'L&T Finance Holdings Ltd.', 
            stride: 2.5 
        },
        'LTIM': { 
            name: 'LTIMindtree Ltd.', 
            stride: 50 
        },
        'LTTS': { 
            name: 'L&T Technology Services Ltd.', 
            stride: 50 
        },
        'LUPIN': { 
            name: 'Lupin Ltd.', 
            stride: 20 
        },
        'M&M': { 
            name: 'Mahindra & Mahindra Ltd.', 
            stride: 50 
        },
        'M&MFIN': { 
            name: 'Mahindra & Mahindra Financial Services Ltd.', 
            stride: 3.7 
        },
        'MANAPPURAM': { 
            name: 'Manappuram Finance Ltd.', 
            stride: 2.5 
        },
        'MARICO': { 
            name: 'Marico Ltd.', 
            stride: 5 
        },
        'MARUTI': { 
            name: 'Maruti Suzuki India Ltd.', 
            stride: 100 
        },
        'MCX': { 
            name: 'Multi Commodity Exchange of India Ltd.', 
            stride: 50 
        },
        'METROPOLIS': { 
            name: 'Metropolis Healthcare Ltd.', 
            stride: 20 
        },
        'MFSL': { 
            name: 'Max Financial Services Ltd.', 
            stride: 20 
        },
        'MGL': { 
            name: 'Mahanagar Gas Ltd.', 
            stride: 20 
        },
        'MOTHERSON': { 
            name: 'Motherson Sumi Wiring India Ltd.', 
            stride: 2.5 
        },
        'MPHASIS': { 
            name: 'Mphasis Ltd.', 
            stride: 50 
        },
        'MRF': { 
            name: 'MRF Ltd.', 
            stride: 500 
        },
        'MUTHOOTFIN': { 
            name: 'Muthoot Finance Ltd.', 
            stride: 20 
        },
        'NATIONALUM': { 
            name: 'National Aluminium Company Ltd.', 
            stride: 5 
        },
        'NAUKRI': { 
            name: 'Info Edge (India) Ltd.', 
            stride: 100 
        },
        'NAVINFLUOR': { 
            name: 'Navin Fluorine International Ltd.', 
            stride: 50 
        },
        'NESTLEIND': { 
            name: 'Nestle India Ltd.', 
            stride: 20 
        },
        'NMDC': { 
            name: 'NMDC Ltd.', 
            stride: 5 
        },
        'NTPC': { 
            name: 'NTPC Ltd.', 
            stride: 5 
        },
        'OBEROIRLTY': { 
            name: 'Oberoi Realty Ltd.', 
            stride: 20 
        },
        'OFSS': { 
            name: 'Oracle Financial Services Software Ltd.', 
            stride: 100 
        },
        'ONGC': { 
            name: 'Oil and Natural Gas Corporation Ltd.', 
            stride: 5 
        },
        'PAGEIND': { 
            name: 'Page Industries Ltd.', 
            stride: 500 
        },
        'PEL': { 
            name: 'Piramal Enterprises Ltd.', 
            stride: 10 
        },
        'PERSISTENT': { 
            name: 'Persistent Systems Ltd.', 
            stride: 50 
        },
        'PETRONET': { 
            name: 'Petronet LNG Ltd.', 
            stride: 5 
        },
        'PFC': { 
            name: 'Power Finance Corporation Ltd.', 
            stride: 10 
        },
        'PIDILITIND': { 
            name: 'Pidilite Industries Ltd.', 
            stride: 20 
        },
        'PIIND': { 
            name: 'PI Industries Ltd.', 
            stride: 50 
        },
        'PNB': { 
            name: 'Punjab National Bank', 
            stride: 2.5 
        },
        'POLYCAB': { 
            name: 'Polycab India Ltd.', 
            stride: 100 
        },
        'POWERGRID': { 
            name: 'Power Grid Corporation of India Ltd.', 
            stride: 5 
        },
        'PVRINOX': { 
            name: 'PVR INOX Ltd.', 
            stride: 20 
        },
        'RAMCOCEM': { 
            name: 'The Ramco Cements Ltd.', 
            stride: 10 
        },
        'RBLBANK': { 
            name: 'RBL Bank Ltd.', 
            stride: 5 
        },
        'RECLTD': { 
            name: 'REC Ltd.', 
            stride: 10 
        },
        'RELIANCE': { 
            name: 'Reliance Industries Ltd.', 
            stride: 20 
        },
        'SAIL': { 
            name: 'Steel Authority of India Ltd.', 
            stride: 2.5 
        },
        'SBICARD': { 
            name: 'SBI Cards and Payment Services Ltd.', 
            stride: 5 
        },
        'SBILIFE': { 
            name: 'SBI Life Insurance Company Ltd.', 
            stride: 20 
        },
        'SBIN': { 
            name: 'State Bank of India', 
            stride: 10 
        },
        'SHREECEM': { 
            name: 'Shree Cement Ltd.', 
            stride: 50 
        },
        'SHRIRAMFIN': { 
            name: 'Shriram Finance Ltd.', 
            stride: 50 
        },
        'SIEMENS': { 
            name: 'Siemens Ltd.', 
            stride: 100 
        },
        'SRF': { 
            name: 'SRF Ltd.', 
            stride: 20 
        },
        'SUNPHARMA': { 
            name: 'Sun Pharmaceutical Industries Ltd.', 
            stride: 20 
        },
        'SUNTV': { 
            name: 'Sun TV Network Ltd.', 
            stride: 10 
        },
        'SYNGENE': { 
            name: 'Syngene International Ltd.', 
            stride: 10 
        },
        'TATACHEM': { 
            name: 'Tata Chemicals Ltd.', 
            stride: 10 
        },
        'TATACOMM': { 
            name: 'Tata Communications Ltd.', 
            stride: 20 
        },
        'TATACONSUM': { 
            name: 'Tata Consumer Products Ltd.', 
            stride: 5 
        },
        'TATAMOTORS': { 
            name: 'Tata Motors Ltd.', 
            stride: 10 
        },
        'TATAPOWER': { 
            name: 'Tata Power Company Ltd.', 
            stride: 5 
        },
        'TATASTEEL': { 
            name: 'Tata Steel Ltd.', 
            stride: 2.5 
        },
        'TCS': { 
            name: 'Tata Consultancy Services Ltd.', 
            stride: 50 
        },
        'TECHM': { 
            name: 'Tech Mahindra Ltd.', 
            stride: 20 
        },
        'TITAN': { 
            name: 'Titan Company Ltd.', 
            stride: 20 
        },
        'TORNTPHARM': { 
            name: 'Torrent Pharmaceuticals Ltd.', 
            stride: 20 
        },
        'TRENT': { 
            name: 'Trent Ltd.', 
            stride: 100 
        },
        'TVSMOTOR': { 
            name: 'TVS Motor Company Ltd.', 
            stride: 20 
        },
        'UBL': { 
            name: 'United Breweries Ltd.', 
            stride: 20 
        },
        'ULTRACEMCO': { 
            name: 'UltraTech Cement Ltd.', 
            stride: 100 
        },
        'UNITDSPR': { 
            name: 'United Spirits Ltd.', 
            stride: 20 
        },
        'UPL': { 
            name: 'UPL Ltd.', 
            stride: 5 
        },
        'VEDL': { 
            name: 'Vedanta Ltd.', 
            stride: 10 
        },
        'VOLTAS': { 
            name: 'Voltas Ltd.', 
            stride: 20 
        },
        'WIPRO': { 
            name: 'Wipro Ltd.', 
            stride: 5 
        },
        'ZYDUSLIFE': { 
            name: 'Zydus Lifesciences Ltd.', 
            stride: 20 
        },
    }
};

// Helper function to get symbol type (index or equity)
export const getSymbolType = (symbol: string): 'indices' | 'equities' => {
    return symbol in AVAILABLE_SYMBOLS.indices ? 'indices' : 'equities';
};

// Helper function to get symbol stride
export const getSymbolStride = (symbol: string): number => {
    const type = getSymbolType(symbol);
    return AVAILABLE_SYMBOLS[type][symbol]?.stride || 0;
};

// Helper function to get symbol config
export const getSymbolConfig = (symbol: string): SymbolConfig | null => {
    const type = getSymbolType(symbol);
    return AVAILABLE_SYMBOLS[type][symbol] || null;
};

// Helper function to get all available symbols
export const getAllSymbols = (): string[] => {
    return [
        ...Object.keys(AVAILABLE_SYMBOLS.indices),
        ...Object.keys(AVAILABLE_SYMBOLS.equities)
    ];
};

// Helper function to calculate ATM strike
export const calculateATMStrike = (spotPrice: number, stride: number): number => {
    return Math.ceil(spotPrice / stride) * stride;
};
