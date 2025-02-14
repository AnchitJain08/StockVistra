# PCR Analysis Platform

A comprehensive platform for analyzing Put-Call Ratio (PCR) and option chain data in real-time, helping traders make informed decisions through advanced market analytics.

## Features

### Market Analysis
- Real-time PCR (Put-Call Ratio) tracking and visualization
- Option chain analysis with detailed metrics
- Historical data analysis with interactive charts
- Market sentiment indicators based on PCR trends
- Support for multiple stock indices and individual stocks

### Data Visualization
- Interactive time-series charts for PCR trends
- Color-coded option chain tables for better data interpretation
- Responsive and intuitive user interface
- Real-time data updates with automatic refresh
- Custom date range selection for historical analysis

### Technical Features
- Strike price analysis with color indicators
- ATM (At-The-Money) strike highlighting
- Customizable data views and filters
- Historical data tracking and comparison
- Bulk data export functionality
- Favorite symbols watchlist

## Tech Stack

### Frontend
- React.js 18 with TypeScript
- Material-UI v5 for modern component styling
- Recharts for interactive data visualization
- Custom state management with React hooks
- React Router v6 for navigation

### Backend
- Node.js 16+ with Express
- Real-time data processing and caching
- RESTful API endpoints with proper error handling
- Rate limiting and request validation
- JSON-based data storage with efficient querying

### Data Storage
- Local JSON files for data persistence
- Real-time data updates with change detection
- Automated data backup and recovery
- Data validation and sanitization

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
  - `styles/`: Theme configuration and global styles
  - `services/`: API integration and data fetching
  - `utils/`: Helper functions and utilities
  - `types/`: TypeScript type definitions
  - `store/`: State management

- `backend/`: Node.js server
  - `data/`: JSON-based market data storage
  - `scripts/`: Data processing and update scripts
  - `server.js`: Express API endpoints

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Git
- npm (v7 or higher)

### Environment Setup

1. Frontend Environment Variables (.env)
```
REACT_APP_API_URL=http://localhost:4000
REACT_APP_REFRESH_INTERVAL=30000
```

2. Backend Environment Variables (.env)
```
PORT=4000
NODE_ENV=development
DATA_UPDATE_INTERVAL=300000
```

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

# Development mode
npm start

# Production build
npm run build
```
The frontend will be available at `http://localhost:3000`

3. Backend Setup
```bash
cd backend
npm install

# Start development server
node server.js

# Update EOD data
node scripts/updateEodPCR.js
```
The backend API will be available at `http://localhost:4000`

### Available Scripts

Frontend:
- `npm start`: Start development server
- `npm run build`: Create production build
- `npm test`: Run test suite
- `npm run lint`: Run ESLint
- `npm run format`: Format code with Prettier

Backend:
- `node server.js`: Start the API server
- `node scripts/createEodFiles.js`: Initialize EOD data files
- `node scripts/updateEodPCR.js`: Update EOD PCR data

## Usage

1. Select a stock from the dropdown menu
2. View real-time PCR values and trends
3. Analyze option chain data with color-coded indicators
4. Compare multiple stocks' PCR trends
5. Track favorite symbols for quick access
6. Export data in various formats
7. Customize date ranges for historical analysis

## Error Handling

- The application includes comprehensive error handling for:
  - Network connectivity issues
  - Invalid data formats
  - API rate limiting
  - Server timeouts
  - Data validation errors

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Write meaningful commit messages
- Add appropriate documentation
- Include unit tests for new features
- Update the README for significant changes

## License

[MIT](https://choosealicense.com/licenses/mit/)

## Support

For support, please open an issue in the GitHub repository or contact the maintainers.
