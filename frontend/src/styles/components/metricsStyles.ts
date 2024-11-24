import { Theme, SxProps } from '@mui/material';
import { COLORS } from '../theme/common';

export const getMetricsStyles = (isFavorite: boolean): Record<string, SxProps<Theme>> => ({
    paper: {
        p: { xs: 1.5, sm: 2 },
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.4)',
        background: `linear-gradient(75deg, ${COLORS.text.call}20 0%, ${COLORS.text.put}20 100%)`,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
        transition: 'all 0.2s ease-in-out',
        backdropFilter: 'blur(8px)',
        '&:hover': {
            boxShadow: '0 6px 24px rgba(0, 0, 0, 0.07)',
            transform: 'translateY(-1px)',
        },
        '& .MuiTypography-root': {
            textShadow: '0 1px 1px rgba(255, 255, 255, 0.7)',
        }
    },
    title: {
        fontSize: { xs: '1.125rem', sm: '1.25rem' },
        color: 'rgba(0, 0, 0, 0.87)',
        fontWeight: 600,
        lineHeight: 1.2,
    },
    favoriteButton: {
        color: isFavorite ? '#FFD700' : 'rgba(0, 0, 0, 0.54)',
        '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
        },
        transition: 'all 0.2s ease-in-out',
    },
    refreshButton: {
        color: 'rgba(0, 0, 0, 0.54)',
        '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
            color: 'rgba(0, 0, 0, 0.87)',
        },
        transition: 'all 0.2s ease-in-out',
    },
    lastUpdatedText: {
        fontSize: '0.875rem',
        color: 'rgba(0, 0, 0, 0.6)',
        fontWeight: 400,
        '& .spot-price': {
            fontWeight: 700,
            color: 'rgba(0, 0, 0, 0.87)',
        }
    },
    expiryText: {
        fontSize: '0.875rem',
        color: 'rgba(0, 0, 0, 0.6)',
        fontWeight: 400,
        '& .expiry-date': {
            fontWeight: 700,
            color: 'rgba(0, 0, 0, 0.6)',
        }
    }
});
