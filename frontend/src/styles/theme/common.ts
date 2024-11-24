import { Theme } from '@mui/material';

export const common = {
    transitions: {
        default: 'all 0.2s ease-in-out',
    },
    shadows: {
        card: '0 8px 32px rgba(0,0,0,0.08)',
        cardHover: '0 12px 40px rgba(0,0,0,0.12)',
    },
    blur: {
        default: 'blur(8px)',
        strong: 'blur(20px)',
    },
    borderRadius: {
        default: '8px',
        large: '24px',
    },
    spacing: {
        page: {
            pt: { xs: 2, sm: 3 },
            pb: { xs: 2, sm: 3 },
            px: { xs: 1.5, sm: 2 },
        },
        content: {
            p: { xs: 1.5, sm: 2, md: 3 },
            gap: { xs: 2, sm: 2.5 },
        },
        components: {
            gap: { xs: 3, sm: 4 },  // Gap between major components
            section: { xs: 2, sm: 3 }, // Gap between sections within components
        }
    },
    layout: {
        maxWidth: '1440px',
        container: {
            display: 'flex',
            bgcolor: '#F5F5F7',
            minHeight: '100vh',
            maxWidth: '100vw',
            overflow: 'hidden'
        },
        mainContent: {
            flexGrow: 1,
            width: '100%'
        },
        card: {
            bgcolor: '#fff',
            display: 'flex',
            flexDirection: 'column',
            mx: 'auto',
            width: '100%',
        }
    },
    typography: {
        h1: {
            fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
            fontWeight: 700,
            lineHeight: 1.2,
            letterSpacing: '-0.01562em',
            color: 'rgba(0, 0, 0, 0.87)',
        },
        h2: {
            fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
            fontWeight: 700,
            lineHeight: 1.2,
            letterSpacing: '-0.00833em',
            color: 'rgba(0, 0, 0, 0.87)',
        },
        h3: {
            fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
            fontWeight: 600,
            lineHeight: 1.2,
            letterSpacing: '0em',
            color: 'rgba(0, 0, 0, 0.87)',
        },
        h4: {
            fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
            fontWeight: 600,
            lineHeight: 1.2,
            letterSpacing: '0.00735em',
            color: 'rgba(0, 0, 0, 0.87)',
        },
        h5: {
            fontSize: { xs: '1.125rem', sm: '1.25rem', md: '1.5rem' },
            fontWeight: 500,
            lineHeight: 1.2,
            letterSpacing: '0em',
            color: 'rgba(0, 0, 0, 0.87)',
        },
        h6: {
            fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' },
            fontWeight: 500,
            lineHeight: 1.2,
            letterSpacing: '0.0075em',
            color: 'rgba(0, 0, 0, 0.87)',
        },
        subtitle1: {
            fontSize: { xs: '0.875rem', sm: '1rem' },
            fontWeight: 400,
            lineHeight: 1.5,
            letterSpacing: '0.00938em',
            color: 'rgba(0, 0, 0, 0.6)',
        },
        subtitle2: {
            fontSize: { xs: '0.8125rem', sm: '0.875rem' },
            fontWeight: 500,
            lineHeight: 1.57,
            letterSpacing: '0.00714em',
            color: 'rgba(0, 0, 0, 0.6)',
        },
        body1: {
            fontSize: { xs: '0.875rem', sm: '1rem' },
            fontWeight: 400,
            lineHeight: 1.5,
            letterSpacing: '0.00938em',
            color: 'rgba(0, 0, 0, 0.87)',
        },
        body2: {
            fontSize: { xs: '0.8125rem', sm: '0.875rem' },
            fontWeight: 400,
            lineHeight: 1.43,
            letterSpacing: '0.01071em',
            color: 'rgba(0, 0, 0, 0.87)',
        }
    }
};

export const COLORS = {
    primary: {
        main: '#1976d2',
        light: '#42a5f5',
        dark: '#1565c0'
    },
    secondary: {
        main: '#9c27b0',
        light: '#ba68c8',
        dark: '#7b1fa2'
    },
    success: {
        main: '#2e7d32',
        light: '#4caf50',
        dark: '#1b5e20'
    },
    error: {
        main: '#d32f2f',
        light: '#ef5350',
        dark: '#c62828'
    },
    warning: {
        main: '#ed6c02',
        light: '#ff9800',
        dark: '#e65100'
    },
    info: {
        main: '#0288d1',
        light: '#03a9f4',
        dark: '#01579b'
    },
    background: {
        default: '#ffffff',
        paper: '#f5f5f5',
        callBelowATM: 'rgba(76, 175, 80, 0.04)',
        callBelowATMHover: 'rgba(76, 175, 80, 0.08)',
        putAboveATM: 'rgba(244, 67, 54, 0.04)',
        putAboveATMHover: 'rgba(244, 67, 54, 0.08)',
        atm: 'rgba(3, 169, 244, 0.04)',
        atmHover: 'rgba(3, 169, 244, 0.08)',
        atmStrike: 'rgba(33, 150, 243, 0.15)',
        atmStrikeHover: 'rgba(33, 150, 243, 0.25)',
        header: 'rgba(0, 0, 0, 0.04)'
    },
    text: {
        primary: 'rgba(0, 0, 0, 0.87)',
        secondary: 'rgba(0, 0, 0, 0.6)',
        disabled: 'rgba(0, 0, 0, 0.38)',
        call: '#4caf50',
        put: '#f44336',
        strike: '#2196f3',
        atmStrike: '#1976d2'
    },
    border: {
        main: 'rgba(224, 224, 224, 1)',
        atm: '#03a9f4',
        atmStrike: '#1976d2'
    }
};

export const DATE = {
    format: {
        display: 'DD-MMM-YYYY',
        api: 'YYYY-MM-DD'
    },
    MONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
};
