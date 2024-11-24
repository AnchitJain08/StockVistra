import { alpha } from '@mui/material/styles';

export const colors = {
    metrics: {
        background: 'linear-gradient(90deg, hsla(18, 76%, 88%, 0.9) 0%, hsla(203, 69%, 88%, 0.9) 100%)',
        border: 'rgba(255, 255, 255, 0.4)',
        text: 'rgba(0, 0, 0, 0.87)',
    },
    table: {
        call: {
            background: 'rgba(52, 199, 89, 0.04)',
            hover: 'rgba(52, 199, 89, 0.08)',
        },
        put: {
            background: 'rgba(255, 69, 58, 0.04)',
            hover: 'rgba(255, 69, 58, 0.08)',
        },
        status: {
            'strong-bullish': '#2E7D32',
            'bullish': '#4CAF50',
            'bearish': '#F44336',
            'strong-bearish': '#B71C1C',
        }
    }
};
