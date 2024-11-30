import React from 'react';
import { Provider } from 'react-redux';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Box, CssBaseline } from '@mui/material';
import OptionChainPage from './pages/OptionChainPage';
import AnalysisPage from './pages/AnalysisPage';
import ComparePage from './pages/ComparePage';
import Sidebar from './components/Sidebar';
import { store } from './store/store';
import './App.css';

function App() {
  return (
    <Provider store={store}>
      <HashRouter>
        <Box sx={{ display: 'flex' }}>
          <CssBaseline />
          <Sidebar />
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              height: '100dvh',
              overflow: 'auto',
            }}
          >
            <Routes>
              <Route path="/" element={<OptionChainPage />} />
              <Route path="/analysis" element={<AnalysisPage />} />
              <Route path="/compare" element={<ComparePage />} />
            </Routes>
          </Box>
        </Box>
      </HashRouter>
    </Provider>
  );
}

export default App;
