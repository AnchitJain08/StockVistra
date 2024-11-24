# StockVistra Backend

A powerful backend service for stock market analysis and visualization.

## Features

- Real-time stock market data processing
- Market status checking
- Stock data analysis endpoints
- RESTful API for stock market operations

## Tech Stack

- Node.js
- Express.js
- WebSocket for real-time updates
- RESTful API architecture

## Installation

1. Clone the repository:
```bash
git clone https://github.com/AnchitJain08/StockVistra.git
cd StockVistra
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

The server will start on port 4000 by default.

## API Endpoints

- `GET /api/market/status` - Check if market is open
- `GET /api/stock/:symbol` - Get stock data for a specific symbol
- Additional endpoints documentation coming soon...

## Environment Variables

Create a `.env` file in the root directory with the following variables:
```
PORT=4000
NODE_ENV=development
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
