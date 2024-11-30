import React, { useRef } from 'react';
import { Box, Typography, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { Line } from 'react-chartjs-2';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface CompareData {
  timeStamp: string;
  PCR: string;
}

interface CompareChartProps {
  data1: CompareData[];
  data2: CompareData[];
  data3: CompareData[];
  symbol1: string;
  symbol2: string;
  symbol3: string;
  timeRange: string;
  onTimeRangeChange: (range: string) => void;
}

const TIME_RANGES = {
  '15M': '15 Minutes',
  '30M': '30 Minutes',
  '1H': '1 Hour',
  '3H': '3 Hours',
  'ALL': 'All Data'
};

const CompareChart: React.FC<CompareChartProps> = ({ 
  data1, 
  data2,
  data3,
  symbol1, 
  symbol2,
  symbol3,
  timeRange,
  onTimeRangeChange 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const chartRef = useRef(null);

  const filterDataByTimeRange = (data: CompareData[], range: string): CompareData[] => {
    if (!data?.length) return [];
    
    const now = new Date();
    
    const parseTimestamp = (timestamp: string): Date | null => {
      try {
        if (!timestamp) return null;
        const parts = timestamp.split('-');
        if (parts.length !== 2) return null;
        
        const [datePart, timePart] = parts;
        if (!datePart || !timePart) return null;
        
        const [day, month] = datePart.split('/');
        const [hours, minutes] = timePart.split(':');
        
        if (!day || !month || !hours || !minutes) return null;
        
        return new Date(now.getFullYear(), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes));
      } catch (error) {
        console.error('Error parsing timestamp:', error);
        return null;
      }
    };
    
    const getLatestTimestamp = () => {
      for (const entry of data) {
        const date = parseTimestamp(entry.timeStamp);
        if (date) return date;
      }
      return now;
    };

    const latestTimestamp = getLatestTimestamp();
    
    const getMinutesAgo = (minutes: number) => {
      const date = new Date(latestTimestamp);
      date.setMinutes(date.getMinutes() - minutes);
      return date;
    };
    
    const timeFilters = {
      '15M': 15,
      '30M': 30,
      '1H': 60,
      '3H': 180,
      'ALL': 24 * 60
    };
    
    const minutes = timeFilters[range as keyof typeof timeFilters];
    if (!minutes) return data;
    
    const filterTime = getMinutesAgo(minutes);
    
    return data.filter(item => {
      const date = parseTimestamp(item.timeStamp);
      return date ? date >= filterTime : false;
    }).sort((a, b) => {
      const dateA = parseTimestamp(a.timeStamp);
      const dateB = parseTimestamp(b.timeStamp);
      if (!dateA || !dateB) return 0;
      return dateA.getTime() - dateB.getTime();
    });
  };

  const formatTimestamp = (timestamp: string): string => {
    try {
      if (!timestamp || typeof timestamp !== 'string') return '';
      
      const parts = timestamp.split('-');
      if (parts.length !== 2) return timestamp;
      
      const [datePart, timePart] = parts;
      if (!datePart || !timePart) return timestamp;
      
      const [hours, minutes] = timePart.split(':');
      if (!hours || !minutes) return timestamp;
      
      return `${hours}:${minutes}`;
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return timestamp;
    }
  };

  const filteredData1 = filterDataByTimeRange(data1 || [], timeRange);
  const filteredData2 = filterDataByTimeRange(data2 || [], timeRange);
  const filteredData3 = filterDataByTimeRange(data3 || [], timeRange);

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false
    },
    plugins: {
      tooltip: {
        enabled: true,
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y?.toFixed(2) || '';
            return `${label}: ${value}`;
          }
        }
      },
      legend: {
        position: isMobile ? 'bottom' : 'top',
        labels: {
          boxWidth: 20,
          padding: 15
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Time'
        },
        ticks: {
          maxTicksLimit: isMobile ? 6 : 12,
          autoSkip: true
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'PCR Value'
        },
        ticks: {
          callback: (value: any) => typeof value === 'number' ? value.toFixed(2) : value
        }
      }
    },
    animation: {
      duration: 1200,
      easing: 'easeInOutSine',
      delay: (context) => {
        const delay = context.dataIndex * 50;
        return delay + Math.sin(context.dataIndex * 0.5) * 100;
      }
    },
    transitions: {
      active: {
        animation: {
          duration: 400,
          easing: 'easeOutQuad'
        }
      },
      resize: {
        animation: {
          duration: 500,
          easing: 'easeInOutQuad'
        }
      },
      show: {
        animations: {
          x: {
            from: 0,
            easing: 'easeOutElastic',
            duration: 1000,
          },
          y: {
            from: 0,
            easing: 'easeOutBounce',
            duration: 1200,
          }
        }
      },
      hide: {
        animations: {
          x: {
            to: 0,
            easing: 'easeInQuad',
            duration: 200
          },
          y: {
            to: 0,
            easing: 'easeInQuad',
            duration: 200
          }
        }
      }
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        position: 'relative',
        bgcolor: '#FFFFFF'
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 2.5,
          py: 2
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 600,
            color: theme.palette.text.primary,
            fontSize: '0.9375rem'
          }}
        >
          PCR Comparison
        </Typography>
        
        <ToggleButtonGroup
          value={timeRange}
          exclusive
          onChange={(_, value) => value && onTimeRangeChange(value)}
          size="small"
          sx={{
            '& .MuiToggleButton-root': {
              border: 'none',
              borderRadius: '6px',
              px: 1.5,
              py: 0.5,
              fontSize: '0.75rem',
              fontWeight: 500,
              color: theme.palette.text.secondary,
              '&.Mui-selected': {
                backgroundColor: theme.palette.primary.main,
                color: '#fff',
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark
                }
              },
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)'
              }
            }
          }}
        >
          {Object.entries(TIME_RANGES).map(([value, label]) => (
            <ToggleButton
              key={value}
              value={value}
            >
              {value}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      <Box
        sx={{
          borderRadius: 2,
          bgcolor: '#FFFFFF',
          width: '100%',
          flex: 1,
          minHeight: 0
        }}
      >
        <Line
          ref={chartRef}
          options={options}
          data={{
            labels: filteredData1.map(d => formatTimestamp(d.timeStamp)),
            datasets: [
              {
                label: symbol1,
                data: filteredData1.map(d => parseFloat(d.PCR)),
                borderColor: 'rgb(99, 102, 241)',
                backgroundColor: 'rgba(99, 102, 241, 0.5)',
                borderWidth: 1.5,
                fill: false,
                tension: 0.15,
                pointRadius: 0,
                pointHoverRadius: 0,
                pointHitRadius: 10
              },
              {
                label: symbol2,
                data: filteredData2.map(d => parseFloat(d.PCR)),
                borderColor: 'rgb(34, 197, 94)',
                backgroundColor: 'rgba(34, 197, 94, 0.5)',
                borderWidth: 1.5,
                fill: false,
                tension: 0.15,
                pointRadius: 0,
                pointHoverRadius: 0,
                pointHitRadius: 10
              },
              {
                label: symbol3,
                data: filteredData3.map(d => parseFloat(d.PCR)),
                borderColor: 'rgb(249, 115, 22)',
                backgroundColor: 'rgba(249, 115, 22, 0.5)',
                borderWidth: 1.5,
                fill: false,
                tension: 0.15,
                pointRadius: 0,
                pointHoverRadius: 0,
                pointHitRadius: 10
              }
            ]
          }}
        />
      </Box>
    </Box>
  );
};

export default CompareChart;
