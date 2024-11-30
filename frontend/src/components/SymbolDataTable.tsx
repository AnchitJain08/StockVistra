import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { common } from '../styles/theme/common';

interface SymbolData {
  timeStamp: string;
  'Total Call OI': number;
  'Total Put OI': number;
  'PCR': string;
  'ATM Strike': number;
  'ATM CE OI': number;
  'ATM PE OI': number;
  'Change PCR': string;
  'Market Status': string;
  'Spot Price': number;
}

interface SymbolDataTableProps {
  data: SymbolData[];
  timeRange: string;
}

type ColumnDef = {
  key: keyof SymbolData;
  label: string;
};

const SymbolDataTable: React.FC<SymbolDataTableProps> = ({ data, timeRange }) => {
  const theme = useTheme();

  const filterDataByTimeRange = (data: SymbolData[], range: string): SymbolData[] => {
    if (range === 'ALL') return data;
    if (!data?.length) return [];
    
    // Get the latest timestamp from data
    const getDateFromTimestamp = (timestamp: string): Date | null => {
      try {
        if (!timestamp) return null;
        const parts = timestamp.split('-');
        if (parts.length !== 2) return null;
        
        const [datePart, timePart] = parts;
        if (!datePart || !timePart) return null;
        
        const [day, month] = datePart.split('/');
        const [hours, minutes] = timePart.split(':');
        
        if (!day || !month || !hours || !minutes) return null;
        
        const now = new Date();
        const year = now.getFullYear();
        
        return new Date(year, parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes));
      } catch (error) {
        console.error('Error parsing timestamp:', error);
        return null;
      }
    };

    // Get latest valid timestamp
    const latestValidData = data.find(item => getDateFromTimestamp(item.timeStamp));
    if (!latestValidData) return data;
    
    const latestDate = getDateFromTimestamp(latestValidData.timeStamp);
    if (!latestDate) return data;
    
    // Calculate cutoff time based on range
    const getCutoffTime = () => {
      const cutoff = new Date(latestDate);
      switch(range) {
        case '15M': cutoff.setMinutes(cutoff.getMinutes() - 15); break;
        case '30M': cutoff.setMinutes(cutoff.getMinutes() - 30); break;
        case '1H': cutoff.setHours(cutoff.getHours() - 1); break;
        case '3H': cutoff.setHours(cutoff.getHours() - 3); break;
        default: return null;
      }
      return cutoff;
    };
    
    const cutoffTime = getCutoffTime();
    if (!cutoffTime) return data;
    
    // Filter data
    return data.filter(item => {
      const itemDate = getDateFromTimestamp(item.timeStamp);
      return itemDate ? itemDate >= cutoffTime : false;
    });
  };

  const filteredData = filterDataByTimeRange(data, timeRange);

  const columns: ColumnDef[] = [
    { key: 'timeStamp', label: 'Time' },
    { key: 'Total Call OI', label: 'Total Call OI' },
    { key: 'Total Put OI', label: 'Total Put OI' },
    { key: 'PCR', label: 'PCR' },
    { key: 'ATM Strike', label: 'ATM Strike' },
    { key: 'ATM CE OI', label: 'ATM CE OI' },
    { key: 'ATM PE OI', label: 'ATM PE OI' },
    { key: 'Change PCR', label: 'Change PCR' },
    { key: 'Market Status', label: 'Market Status' },
    { key: 'Spot Price', label: 'Spot Price' }
  ];

  const getMarketStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'strong-bullish':
        return theme.palette.success.dark;
      case 'bullish':
        return theme.palette.success.main;
      case 'strong-bearish':
        return theme.palette.error.dark;
      case 'bearish':
        return theme.palette.error.main;
      default:
        return theme.palette.text.primary;
    }
  };

  const formatIndianNumber = (num: number): string => {
    const numStr = num.toString();
    const parts = numStr.split('.');
    const integerPart = parts[0];
    const decimalPart = parts[1] || '00';
    
    // Handle numbers less than 1000
    if (integerPart.length <= 3) {
      return `${integerPart}.${decimalPart.padEnd(2, '0')}`;
    }
    
    // Add comma after first 3 digits from right
    let formattedInteger = integerPart.slice(-3);
    
    // Add commas for remaining digits in groups of 2
    let remaining = integerPart.slice(0, -3);
    while (remaining.length > 0) {
      formattedInteger = remaining.slice(-2) + ',' + formattedInteger;
      remaining = remaining.slice(0, -2);
    }
    
    return `${formattedInteger}.${decimalPart.padEnd(2, '0')}`;
  };

  const renderCellContent = (row: SymbolData, column: ColumnDef) => {
    const value = row[column.key];
    
    // Format numeric columns with Indian number system
    if (['Total Call OI', 'Total Put OI', 'ATM Strike', 'ATM CE OI', 'ATM PE OI', 'Spot Price'].includes(column.key)) {
      return formatIndianNumber(value as number);
    }
    
    if (column.key === 'Market Status') {
      return (
        <span style={{ 
          color: getMarketStatusColor(value as string),
          fontWeight: 'bold',
          textTransform: 'uppercase'
        }}>
          {value}
        </span>
      );
    }
    if (column.key === 'timeStamp') {
      return (
        <span style={{ fontWeight: 'bold' }}>
          {value}
        </span>
      );
    }
    return value;
  };

  return (
    <TableContainer 
      component={Paper}
      sx={{
        ...common.layout.card,
        borderRadius: '1rem',
        boxShadow: common.shadows.card,
        '&:hover': {
          boxShadow: common.shadows.cardHover,
        },
        maxHeight: 'clamp(30dvh, calc(100dvh - 18.75rem), 80dvh)', 
        overflow: 'auto', 
        '& .MuiTable-root': {
          borderCollapse: 'separate',
          borderSpacing: 0,
          '& .MuiTableHead-root': {
            '& .MuiTableRow-root': {
              '& .MuiTableCell-root': {
                borderBottom: `0.0625rem solid ${theme.palette.divider}`,
              },
            },
          },
          '& .MuiTableBody-root': {
            '& .MuiTableRow-root': {
              '& .MuiTableCell-root': {
                borderBottom: `0.0625rem solid ${theme.palette.divider}`,
              },
              '&:first-of-type': {
                '& .MuiTableCell-root': {
                  '&:first-of-type': {
                    borderTopLeftRadius: '1rem',
                  },
                  '&:last-child': {
                    borderTopRightRadius: '1rem',
                  },
                },
              },
            },
          },
        },
      }}
    >
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell
                key={column.key}
                sx={{
                  backgroundColor: theme.palette.grey[200],
                  fontWeight: 'bold',
                  whiteSpace: 'nowrap',
                  position: 'sticky',
                  top: 0,
                  zIndex: 1,
                  borderBottom: `0.0625rem solid ${theme.palette.divider}`,
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    bottom: 0,
                    width: '100%',
                    borderBottom: `0.0625rem solid ${theme.palette.divider}`,
                  },
                  '&:first-of-type': {
                    borderTopLeftRadius: '1rem',
                  },
                  '&:last-of-type': {
                    borderTopRightRadius: '1rem',
                  },
                }}
              >
                {column.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredData.map((row, index) => (
            <TableRow
              key={index}
              sx={{
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                },
              }}
            >
              {columns.map((column, cellIndex) => (
                <TableCell
                  key={column.key}
                  sx={{
                    whiteSpace: 'nowrap',
                    ...(cellIndex === 0 && {
                      backgroundColor: theme.palette.grey[50],
                    }),
                    ...((column.key === 'ATM Strike' || column.key === 'Spot Price') && {
                      backgroundColor: 'rgba(200, 220, 255, 0.3)',
                    }),
                  }}
                >
                  {renderCellContent(row, column)}
                </TableCell>
              ))}
            </TableRow>
          ))}
          {filteredData.length === 0 && (
            <TableRow>
              <TableCell 
                colSpan={columns.length}
                sx={{ 
                  textAlign: 'center',
                  py: 4,
                  color: theme.palette.text.secondary
                }}
              >
                <Typography variant="body2">
                  No data available
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default SymbolDataTable;
