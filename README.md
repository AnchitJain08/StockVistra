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
- Redux for state management

### Backend
- Python (FastAPI)
- Real-time data processing
- WebSocket integration for live updates
- Data caching for optimal performance

### Database
- PostgreSQL for data persistence
- Redis for caching (optional)

## Project Structure

```
📦 PCR-Analysis
├── 📂 frontend
│   ├── 📂 src
│   │   ├── 📂 components
│   │   │   ├── AnalysisChart.tsx
│   │   │   ├── DetailedMetrics.tsx
│   │   │   ├── OptionChainTable.tsx
│   │   │   └── StockSelector.tsx
│   │   ├── 📂 pages
│   │   │   └── AnalysisPage.tsx
│   │   ├── 📂 store
│   │   │   ├── store.ts
│   │   │   └── optionChainSlice.ts
│   │   ├── 📂 styles
│   │   │   ├── theme
│   │   │   └── components
│   │   ├── 📂 services
│   │   │   └── api.ts
│   │   └── 📂 utils
│   │       └── formatters.ts
│   ├── package.json
│   └── tsconfig.json
├── 📂 backend
│   ├── 📂 data
│   │   └── symbolData
│   ├── server.js
│   └── package.json
└── README.md
```

Key Directories:
- `frontend/`: React application with TypeScript
  - `components/`: Reusable UI components
  - `pages/`: Main application views
  - `store/`: Redux state management
  - `styles/`: Theme and component styles
  - `services/`: API integration
  - `utils/`: Helper functions

- `backend/`: Node.js server
  - `data/`: Market data storage
  - `server.js`: API endpoints and WebSocket handlers

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Python 3.8+
- PostgreSQL
- Git

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/pcr-analysis.git
cd pcr-analysis
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
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```
The backend API will be available at `http://localhost:4000`

### Environment Configuration

Create a `.env` file in the backend directory:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/pcr_db
REDIS_URL=redis://localhost:6379  # Optional
PORT=4000
```

## Usage

1. Select a stock from the dropdown menu
2. View real-time PCR values and trends
3. Analyze option chain data with color-coded indicators
4. Track historical PCR data through interactive charts
5. Monitor market sentiment and make informed decisions

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

[MIT](https://choosealicense.com/licenses/mit/)
