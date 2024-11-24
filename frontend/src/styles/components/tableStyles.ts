import { Theme, SxProps } from '@mui/material';
import { COLORS } from '../theme/common';

export interface TableStyles {
    metricsCard: SxProps<Theme>;
    row: {
        callBelowATM: SxProps<Theme>;
        putAboveATM: SxProps<Theme>;
        atm: SxProps<Theme>;
    };
    strikeCell: {
        atm: SxProps<Theme>;
    };
    cell: {
        base: SxProps<Theme>;
        header: SxProps<Theme>;
        callHeader: SxProps<Theme>;
        putHeader: SxProps<Theme>;
        strikeHeader: SxProps<Theme>;
    };
    headerGradient: SxProps<Theme>;
}

export const getOptionChainTableStyles = (): TableStyles => ({
    metricsCard: {
        minWidth: 120,
        textAlign: 'center'
    },
    row: {
        callBelowATM: {
            backgroundColor: COLORS.background.callBelowATM,
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
                backgroundColor: COLORS.background.callBelowATMHover
            }
        },
        putAboveATM: {
            backgroundColor: COLORS.background.putAboveATM,
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
                backgroundColor: COLORS.background.putAboveATMHover
            }
        },
        atm: {
            backgroundColor: COLORS.background.atm,
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
                backgroundColor: COLORS.background.atmHover
            }
        }
    },
    strikeCell: {
        atm: {
            backgroundColor: COLORS.background.atmStrike,
            color: COLORS.text.atmStrike,
            borderColor: COLORS.border.atmStrike,
            fontWeight: 700,
            position: 'relative',
            '&::after': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                border: `2px solid ${COLORS.border.atmStrike}`,
                borderRadius: '4px',
                pointerEvents: 'none'
            },
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
                backgroundColor: COLORS.background.atmStrikeHover
            }
        }
    },
    cell: {
        base: {
            padding: '8px',
            textAlign: 'center',
            fontSize: '0.875rem'
        },
        header: {
            fontWeight: 'bold',
            backgroundColor: COLORS.background.header
        },
        callHeader: {
            color: COLORS.text.call
        },
        putHeader: {
            color: COLORS.text.put
        },
        strikeHeader: {
            color: COLORS.text.strike
        }
    },
    headerGradient: {
        background: `linear-gradient(90deg, ${COLORS.text.call}20 0%, ${COLORS.text.put}20 100%)`,
        borderBottom: `1px solid ${COLORS.border.main}`,
    }
});
