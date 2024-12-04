# PCR Analysis Platform

A comprehensive platform for analyzing Put-Call Ratio (PCR) and option chain data in real-time, helping traders make informed decisions through advanced market analytics.

## Features

### Market Analysis
- Real-time PCR (Put-Call Ratio) tracking and visualization
- Option chain analysis with detailed metrics
- Historical data analysis with interactive charts
- Market sentiment indicators

### Data Visualization
- Interactive time-series charts for PCR trends
- Color-coded option chain tables for better data interpretation
- Responsive and intuitive user interface
- Real-time data updates

### Technical Features
- Strike price analysis with color indicators
- ATM (At-The-Money) strike highlighting
- Customizable data views
- Historical data tracking

## Tech Stack

### Frontend
- React.js with TypeScript
- Material-UI for component styling
- Recharts for data visualization
- Custom state management with React hooks

### Backend
- Node.js with Express
- Real-time data processing
- RESTful API endpoints
- JSON-based data storage

### Data Storage
- Local JSON files for data persistence
- Real-time data updates

## Project Structure

```
📦 PCR-Analysis
├── 📂 frontend
│   ├── 📂 src
│   │   ├── 📂 components
│   │   │   ├── AnalysisChart.tsx
│   │   │   ├── BaseChart.tsx
│   │   │   ├── CompareChart.tsx
│   │   │   ├── OptionChainTable.tsx
│   │   │   └── StockSelector.tsx
│   │   ├── 📂 pages
│   │   │   ├── AnalysisPage.tsx
│   │   │   └── ComparePage.tsx
│   │   ├── 📂 styles
│   │   │   └── theme
│   │   ├── 📂 services
│   │   │   └── api.ts
│   │   └── 📂 utils
│   ├── package.json
│   └── tsconfig.json
├── 📂 backend
│   ├── 📂 data
│   │   ├── symbolData
│   │   │   ├── ADANIPORTS-data.json
│   │   │   ├── BANKNIFTY-data.json
│   │   │   ├── NIFTY-data.json
│   │   │   ├── TATASTEEL-data.json
│   │   │   └── VEDL-data.json
│   │   └── favSymbols.json
│   ├── server.js
│   └── package.json
└── README.md
```

Key Directories:
- `frontend/`: React application with TypeScript
  - `components/`: Reusable UI components including charts and tables
  - `pages/`: Analysis and Compare pages for different views
  - `styles/`: Theme configuration
  - `services/`: API integration

- `backend/`: Node.js server
  - `data/`: JSON-based market data storage
  - `server.js`: Express API endpoints

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Git

### Installation

1. Clone the repository
```bash
git clone https://github.com/AnchitJain08/StockVistra.git
cd StockVistra
```

2. Frontend Setup
```bash
cd frontend
npm install
npm start
```
The frontend will be available at `http://localhost:3000`

3. Backend Setup
```bash
cd backend
npm install
node server.js
```
The backend API will be available at `http://localhost:4000`

## Usage

1. Select a stock from the dropdown menu
2. View real-time PCR values and trends
3. Analyze option chain data with color-coded indicators
4. Compare multiple stocks' PCR trends
5. Track favorite symbols for quick access

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

[MIT](https://choosealicense.com/licenses/mit/)
