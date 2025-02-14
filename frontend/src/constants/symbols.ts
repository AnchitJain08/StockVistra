export interface SymbolConfig {
    name: string;
}

interface SymbolsData {
    indices: { [key: string]: SymbolConfig };
    equities: { [key: string]: SymbolConfig };
}

export const AVAILABLE_SYMBOLS: SymbolsData = {
  "indices": {
    "NIFTY": {
      "name": "NIFTY 50"
    },
    "NIFTYNXT50": {
      "name": "NIFTY NEXT 50"
    },
    "BANKNIFTY": {
      "name": "NIFTY BANK"
    },
    "FINNIFTY": {
      "name": "NIFTY FIN SERVICES"
    },
    "MIDCPNIFTY": {
      "name": "NIFTY MIDCAP SELECT"
    }
  },
  "equities": {
    "AARTIIND": {
      "name": "Aarti Industries Limited"
    },
    "ABB": {
      "name": "ABB India Limited"
    },
    "ABBOTINDIA": {
      "name": "Abbott India Limited"
    },
    "ABCAPITAL": {
      "name": "Aditya Birla Capital Limited"
    },
    "ABFRL": {
      "name": "Aditya Birla Fashion and Retail Limited"
    },
    "ACC": {
      "name": "ACC Limited"
    },
    "ADANIENSOL": {
      "name": "Adani Energy Solutions Limited"
    },
    "ADANIENT": {
      "name": "Adani Enterprises Limited"
    },
    "ADANIGREEN": {
      "name": "Adani Green Energy Limited"
    },
    "ADANIPORTS": {
      "name": "Adani Ports and Special Economic Zone Limited"
    },
    "ALKEM": {
      "name": "Alkem Laboratories Limited"
    },
    "AMBUJACEM": {
      "name": "Ambuja Cements Limited"
    },
    "ANGELONE": {
      "name": "Angel One Limited"
    },
    "APLAPOLLO": {
      "name": "APL Apollo Tubes Limited"
    },
    "APOLLOHOSP": {
      "name": "Apollo Hospitals Enterprise Limited"
    },
    "APOLLOTYRE": {
      "name": "Apollo Tyres Limited"
    },
    "ASHOKLEY": {
      "name": "Ashok Leyland Limited"
    },
    "ASIANPAINT": {
      "name": "Asian Paints Limited"
    },
    "ASTRAL": {
      "name": "Astral Limited"
    },
    "ATGL": {
      "name": "Adani Total Gas Limited"
    },
    "ATUL": {
      "name": "Atul Limited"
    },
    "AUBANK": {
      "name": "AU Small Finance Bank Limited"
    },
    "AUROPHARMA": {
      "name": "Aurobindo Pharma Limited"
    },
    "AXISBANK": {
      "name": "Axis Bank Limited"
    },
    "BAJAJ-AUTO": {
      "name": "Bajaj Auto Limited"
    },
    "BAJAJFINSV": {
      "name": "Bajaj Finserv Limited"
    },
    "BAJFINANCE": {
      "name": "Bajaj Finance Limited"
    },
    "BALKRISIND": {
      "name": "Balkrishna Industries Limited"
    },
    "BANDHANBNK": {
      "name": "Bandhan Bank Limited"
    },
    "BANKBARODA": {
      "name": "Bank of Baroda"
    },
    "BANKINDIA": {
      "name": "Bank of India"
    },
    "BATAINDIA": {
      "name": "Bata India Limited"
    },
    "BEL": {
      "name": "Bharat Electronics Limited"
    },
    "BERGEPAINT": {
      "name": "Berger Paints (I) Limited"
    },
    "BHARATFORG": {
      "name": "Bharat Forge Limited"
    },
    "BHARTIARTL": {
      "name": "Bharti Airtel Limited"
    },
    "BHEL": {
      "name": "Bharat Heavy Electricals Limited"
    },
    "BIOCON": {
      "name": "Biocon Limited"
    },
    "BOSCHLTD": {
      "name": "Bosch Limited"
    },
    "BPCL": {
      "name": "Bharat Petroleum Corporation Limited"
    },
    "BRITANNIA": {
      "name": "Britannia Industries Limited"
    },
    "BSE": {
      "name": "BSE Limited"
    },
    "BSOFT": {
      "name": "BIRLASOFT LIMITED"
    },
    "CAMS": {
      "name": "Computer Age Management Services Limited"
    },
    "CANBK": {
      "name": "Canara Bank"
    },
    "CANFINHOME": {
      "name": "Can Fin Homes Limited"
    },
    "CDSL": {
      "name": "Central Depository Services (India) Limited"
    },
    "CESC": {
      "name": "CESC Limited"
    },
    "CGPOWER": {
      "name": "CG Power and Industrial Solutions Limited"
    },
    "CHAMBLFERT": {
      "name": "Chambal Fertilizers & Chemicals Limited"
    },
    "CHOLAFIN": {
      "name": "Cholamandalam Investment and Finance Company Limited"
    },
    "CIPLA": {
      "name": "Cipla Limited"
    },
    "COALINDIA": {
      "name": "Coal India Limited"
    },
    "COFORGE": {
      "name": "Coforge Limited"
    },
    "COLPAL": {
      "name": "Colgate Palmolive (India) Limited"
    },
    "CONCOR": {
      "name": "Container Corporation of India Limited"
    },
    "COROMANDEL": {
      "name": "Coromandel International Limited"
    },
    "CROMPTON": {
      "name": "Crompton Greaves Consumer Electricals Limited"
    },
    "CUB": {
      "name": "City Union Bank Limited"
    },
    "CUMMINSIND": {
      "name": "Cummins India Limited"
    },
    "CYIENT": {
      "name": "Cyient Limited"
    },
    "DABUR": {
      "name": "Dabur India Limited"
    },
    "DALBHARAT": {
      "name": "Dalmia Bharat Limited"
    },
    "DEEPAKNTR": {
      "name": "Deepak Nitrite Limited"
    },
    "DELHIVERY": {
      "name": "Delhivery Limited"
    },
    "DIVISLAB": {
      "name": "Divi's Laboratories Limited"
    },
    "DIXON": {
      "name": "Dixon Technologies (India) Limited"
    },
    "DLF": {
      "name": "DLF Limited"
    },
    "DMART": {
      "name": "Avenue Supermarts Limited"
    },
    "DRREDDY": {
      "name": "Dr. Reddy's Laboratories Limited"
    },
    "EICHERMOT": {
      "name": "Eicher Motors Limited"
    },
    "ESCORTS": {
      "name": "Escorts Kubota Limited"
    },
    "EXIDEIND": {
      "name": "Exide Industries Limited"
    },
    "FEDERALBNK": {
      "name": "The Federal Bank  Limited"
    },
    "GAIL": {
      "name": "GAIL (India) Limited"
    },
    "GLENMARK": {
      "name": "Glenmark Pharmaceuticals Limited"
    },
    "GMRAIRPORT": {
      "name": "GMR AIRPORTS LIMITED"
    },
    "GNFC": {
      "name": "Gujarat Narmada Valley Fertilizers and Chemicals Limited"
    },
    "GODREJCP": {
      "name": "Godrej Consumer Products Limited"
    },
    "GODREJPROP": {
      "name": "Godrej Properties Limited"
    },
    "GRANULES": {
      "name": "Granules India Limited"
    },
    "GRASIM": {
      "name": "Grasim Industries Limited"
    },
    "GUJGASLTD": {
      "name": "Gujarat Gas Limited"
    },
    "HAL": {
      "name": "Hindustan Aeronautics Limited"
    },
    "HAVELLS": {
      "name": "Havells India Limited"
    },
    "HCLTECH": {
      "name": "HCL Technologies Limited"
    },
    "HDFCAMC": {
      "name": "HDFC Asset Management Company Limited"
    },
    "HDFCBANK": {
      "name": "HDFC Bank Limited"
    },
    "HDFCLIFE": {
      "name": "HDFC Life Insurance Company Limited"
    },
    "HEROMOTOCO": {
      "name": "Hero MotoCorp Limited"
    },
    "HFCL": {
      "name": "HFCL Limited"
    },
    "HINDALCO": {
      "name": "Hindalco Industries Limited"
    },
    "HINDCOPPER": {
      "name": "Hindustan Copper Limited"
    },
    "HINDPETRO": {
      "name": "Hindustan Petroleum Corporation Limited"
    },
    "HINDUNILVR": {
      "name": "Hindustan Unilever Limited"
    },
    "HUDCO": {
      "name": "Housing & Urban Development Corporation Limited"
    },
    "ICICIBANK": {
      "name": "ICICI Bank Limited"
    },
    "ICICIGI": {
      "name": "ICICI Lombard General Insurance Company Limited"
    },
    "ICICIPRULI": {
      "name": "ICICI Prudential Life Insurance Company Limited"
    },
    "IDEA": {
      "name": "Vodafone Idea Limited"
    },
    "IDFCFIRSTB": {
      "name": "IDFC First Bank Limited"
    },
    "IEX": {
      "name": "Indian Energy Exchange Limited"
    },
    "IGL": {
      "name": "Indraprastha Gas Limited"
    },
    "INDHOTEL": {
      "name": "The Indian Hotels Company Limited"
    },
    "INDIAMART": {
      "name": "Indiamart Intermesh Limited"
    },
    "INDIANB": {
      "name": "Indian Bank"
    },
    "INDIGO": {
      "name": "InterGlobe Aviation Limited"
    },
    "INDUSINDBK": {
      "name": "IndusInd Bank Limited"
    },
    "INDUSTOWER": {
      "name": "Indus Towers Limited"
    },
    "INFY": {
      "name": "Infosys Limited"
    },
    "IOC": {
      "name": "Indian Oil Corporation Limited"
    },
    "IPCALAB": {
      "name": "IPCA Laboratories Limited"
    },
    "IRB": {
      "name": "IRB Infrastructure Developers Limited"
    },
    "IRCTC": {
      "name": "Indian Railway Catering And Tourism Corporation Limited"
    },
    "IRFC": {
      "name": "Indian Railway Finance Corporation Limited"
    },
    "ITC": {
      "name": "ITC Limited"
    },
    "JINDALSTEL": {
      "name": "Jindal Steel & Power Limited"
    },
    "JIOFIN": {
      "name": "Jio Financial Services Limited"
    },
    "JKCEMENT": {
      "name": "JK Cement Limited"
    },
    "JSL": {
      "name": "Jindal Stainless Limited"
    },
    "JSWENERGY": {
      "name": "JSW Energy Limited"
    },
    "JSWSTEEL": {
      "name": "JSW Steel Limited"
    },
    "JUBLFOOD": {
      "name": "Jubilant Foodworks Limited"
    },
    "KALYANKJIL": {
      "name": "Kalyan Jewellers India Limited"
    },
    "KEI": {
      "name": "KEI Industries Limited"
    },
    "KOTAKBANK": {
      "name": "Kotak Mahindra Bank Limited"
    },
    "KPITTECH": {
      "name": "KPIT Technologies Limited"
    },
    "LALPATHLAB": {
      "name": "Dr. Lal Path Labs Ltd."
    },
    "LAURUSLABS": {
      "name": "Laurus Labs Limited"
    },
    "LICHSGFIN": {
      "name": "LIC Housing Finance Limited"
    },
    "LICI": {
      "name": "Life Insurance Corporation Of India"
    },
    "LODHA": {
      "name": "Macrotech Developers Limited"
    },
    "LT": {
      "name": "Larsen & Toubro Limited"
    },
    "LTF": {
      "name": "L&T Finance Limited"
    },
    "LTIM": {
      "name": "LTIMindtree Limited"
    },
    "LTTS": {
      "name": "L&T Technology Services Limited"
    },
    "LUPIN": {
      "name": "Lupin Limited"
    },
    "M&M": {
      "name": "Mahindra & Mahindra Limited"
    },
    "M&MFIN": {
      "name": "Mahindra & Mahindra Financial Services Limited"
    },
    "MANAPPURAM": {
      "name": "Manappuram Finance Limited"
    },
    "MARICO": {
      "name": "Marico Limited"
    },
    "MARUTI": {
      "name": "Maruti Suzuki India Limited"
    },
    "MAXHEALTH": {
      "name": "Max Healthcare Institute Limited"
    },
    "MCX": {
      "name": "Multi Commodity Exchange of India Limited"
    },
    "METROPOLIS": {
      "name": "Metropolis Healthcare Limited"
    },
    "MFSL": {
      "name": "Max Financial Services Limited"
    },
    "MGL": {
      "name": "Mahanagar Gas Limited"
    },
    "MOTHERSON": {
      "name": "Samvardhana Motherson International Limited"
    },
    "MPHASIS": {
      "name": "MphasiS Limited"
    },
    "MRF": {
      "name": "MRF Limited"
    },
    "MUTHOOTFIN": {
      "name": "Muthoot Finance Limited"
    },
    "NATIONALUM": {
      "name": "National Aluminium Company Limited"
    },
    "NAUKRI": {
      "name": "Info Edge (India) Limited"
    },
    "NAVINFLUOR": {
      "name": "Navin Fluorine International Limited"
    },
    "NCC": {
      "name": "NCC Limited"
    },
    "NESTLEIND": {
      "name": "Nestle India Limited"
    },
    "NHPC": {
      "name": "NHPC Limited"
    },
    "NMDC": {
      "name": "NMDC Limited"
    },
    "NTPC": {
      "name": "NTPC Limited"
    },
    "NYKAA": {
      "name": "FSN E-Commerce Ventures Limited"
    },
    "OBEROIRLTY": {
      "name": "Oberoi Realty Limited"
    },
    "OFSS": {
      "name": "Oracle Financial Services Software Limited"
    },
    "OIL": {
      "name": "Oil India Limited"
    },
    "ONGC": {
      "name": "Oil & Natural Gas Corporation Limited"
    },
    "PAGEIND": {
      "name": "Page Industries Limited"
    },
    "PAYTM": {
      "name": "One 97 Communications Limited"
    },
    "PEL": {
      "name": "Piramal Enterprises Limited"
    },
    "PERSISTENT": {
      "name": "Persistent Systems Limited"
    },
    "PETRONET": {
      "name": "Petronet LNG Limited"
    },
    "PFC": {
      "name": "Power Finance Corporation Limited"
    },
    "PIDILITIND": {
      "name": "Pidilite Industries Limited"
    },
    "PIIND": {
      "name": "PI Industries Limited"
    },
    "PNB": {
      "name": "Punjab National Bank"
    },
    "POLICYBZR": {
      "name": "PB Fintech Limited"
    },
    "POLYCAB": {
      "name": "Polycab India Limited"
    },
    "POONAWALLA": {
      "name": "Poonawalla Fincorp Limited"
    },
    "POWERGRID": {
      "name": "Power Grid Corporation of India Limited"
    },
    "PRESTIGE": {
      "name": "Prestige Estates Projects Limited"
    },
    "PVRINOX": {
      "name": "PVR INOX Limited"
    },
    "RAMCOCEM": {
      "name": "The Ramco Cements Limited"
    },
    "RBLBANK": {
      "name": "RBL Bank Limited"
    },
    "RECLTD": {
      "name": "REC Limited"
    },
    "RELIANCE": {
      "name": "Reliance Industries Limited"
    },
    "SAIL": {
      "name": "Steel Authority of India Limited"
    },
    "SBICARD": {
      "name": "SBI Cards and Payment Services Limited"
    },
    "SBILIFE": {
      "name": "SBI Life Insurance Company Limited"
    },
    "SBIN": {
      "name": "State Bank of India"
    },
    "SHREECEM": {
      "name": "SHREE CEMENT LIMITED"
    },
    "SHRIRAMFIN": {
      "name": "Shriram Finance Limited"
    },
    "SIEMENS": {
      "name": "Siemens Limited"
    },
    "SJVN": {
      "name": "SJVN Limited"
    },
    "SONACOMS": {
      "name": "Sona BLW Precision Forgings Limited"
    },
    "SRF": {
      "name": "SRF Limited"
    },
    "SUNPHARMA": {
      "name": "Sun Pharmaceutical Industries Limited"
    },
    "SUNTV": {
      "name": "Sun TV Network Limited"
    },
    "SUPREMEIND": {
      "name": "Supreme Industries Limited"
    },
    "SYNGENE": {
      "name": "Syngene International Limited"
    },
    "TATACHEM": {
      "name": "Tata Chemicals Limited"
    },
    "TATACOMM": {
      "name": "Tata Communications Limited"
    },
    "TATACONSUM": {
      "name": "TATA CONSUMER PRODUCTS LIMITED"
    },
    "TATAELXSI": {
      "name": "Tata Elxsi Limited"
    },
    "TATAMOTORS": {
      "name": "Tata Motors Limited"
    },
    "TATAPOWER": {
      "name": "Tata Power Company Limited"
    },
    "TATASTEEL": {
      "name": "Tata Steel Limited"
    },
    "TCS": {
      "name": "Tata Consultancy Services Limited"
    },
    "TECHM": {
      "name": "Tech Mahindra Limited"
    },
    "TIINDIA": {
      "name": "Tube Investments of India Limited"
    },
    "TITAN": {
      "name": "Titan Company Limited"
    },
    "TORNTPHARM": {
      "name": "Torrent Pharmaceuticals Limited"
    },
    "TRENT": {
      "name": "Trent Limited"
    },
    "TVSMOTOR": {
      "name": "TVS Motor Company Limited"
    },
    "UBL": {
      "name": "United Breweries Limited"
    },
    "ULTRACEMCO": {
      "name": "UltraTech Cement Limited"
    },
    "UNIONBANK": {
      "name": "Union Bank of India"
    },
    "UNITDSPR": {
      "name": "United Spirits Limited"
    },
    "UPL": {
      "name": "UPL Limited"
    },
    "VBL": {
      "name": "Varun Beverages Limited"
    },
    "VEDL": {
      "name": "Vedanta Limited"
    },
    "VOLTAS": {
      "name": "Voltas Limited"
    },
    "WIPRO": {
      "name": "Wipro Limited"
    },
    "YESBANK": {
      "name": "Yes Bank Limited"
    },
    "ZOMATO": {
      "name": "Zomato Limited"
    },
    "ZYDUSLIFE": {
      "name": "Zydus Lifesciences Limited"
    }
  }
};

// Helper function to get symbol type (index or equity)
export const getSymbolType = (symbol: string): 'indices' | 'equities' => {
    return symbol in AVAILABLE_SYMBOLS.indices ? 'indices' : 'equities';
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
