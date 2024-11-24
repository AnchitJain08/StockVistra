import React from 'react';
import { Provider } from 'react-redux';
import { HashRouter } from 'react-router-dom';
import { Box, CssBaseline } from '@mui/material';
import OptionChainPage from './pages/OptionChainPage';
import { store } from './store/store';
import { common } from './styles/theme/common';
import './App.css';

function App() {
  return (
    <Provider store={store}>
      <HashRouter>
        <CssBaseline />
        <Box sx={common.layout.container}>
          <OptionChainPage />
        </Box>
      </HashRouter>
    </Provider>
  );
}

export default App;
