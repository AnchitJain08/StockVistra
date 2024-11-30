import React, { useRef } from 'react';
import { Box, Paper, Typography, ToggleButton, ToggleButtonGroup } from '@mui/material';
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

interface AnalysisData {
  timeStamp: string;
  PCR: string;
  'Change PCR': string;
}

interface AnalysisChartProps {
  data: AnalysisData[];
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

const AnalysisChart: React.FC<AnalysisChartProps> = ({ data, timeRange, onTimeRangeChange }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const chartRef = useRef<ChartJS<"line">>();
  
  const filterDataByTimeRange = (data: AnalysisData[], range: string): AnalysisData[] => {
    if (range === 'ALL') return data;
    
    const now = new Date();
    
    const getLatestTimestamp = () => {
      const latestEntry = data[0]; // Data is already in reverse chronological order
      if (!latestEntry) return now;
      
      const [datePart, timePart] = latestEntry.timeStamp.split('-');
      const [day, month] = datePart.split('/');
      const [hours, minutes] = timePart.split(':');
      return new Date(now.getFullYear(), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes));
    };

    const latestTimestamp = getLatestTimestamp();
    
    const getMinutesAgo = (minutes: number) => {
      const date = new Date(latestTimestamp);
      date.setMinutes(date.getMinutes() - minutes);
      return date;
    };
    
    const timeFilters = {
      '15M': getMinutesAgo(15),
      '30M': getMinutesAgo(30),
      '1H': getMinutesAgo(60),
      '3H': getMinutesAgo(180)
    };
    
    const filterTime = timeFilters[range as keyof typeof timeFilters];
    if (!filterTime) return data;
    
    return data.filter(item => {
      const [datePart, timePart] = item.timeStamp.split('-');
      const [day, month] = datePart.split('/');
      const [hours, minutes] = timePart.split(':');
      const itemDate = new Date(now.getFullYear(), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes));
      return itemDate >= filterTime;
    });
  };

  const formatTimestamp = (timestamp: string, range: string): string => {
    try {
      if (!timestamp || typeof timestamp !== 'string') return '';
      
      const parts = timestamp.split('-');
      if (parts.length !== 2) return timestamp;
      
      const [date, time] = parts;
      if (!date || !time) return timestamp;
      
      const [day, month] = date.split('/');
      
      switch(range) {
        case '15M':
        case '30M':
        case '1H':
        case '3H':
          return time;
        case 'ALL':
          return day && month ? `${day}/${month}` : timestamp;
        default:
          return timestamp;
      }
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return timestamp;
    }
  };

  const filteredData = filterDataByTimeRange(data, timeRange);
  
  const validateDataPoint = (item: AnalysisData) => {
    const pcr = parseFloat(item.PCR);
    const changePcr = parseFloat(item['Change PCR']);
    return !isNaN(pcr) && !isNaN(changePcr) && 
           item.timeStamp && 
           pcr > 0 && pcr < 10 && // Reasonable PCR range
           changePcr > -5 && changePcr < 5; // Reasonable Change PCR range
  };

  const chartData = filteredData.filter(validateDataPoint).slice().reverse();
  
  const timestamps = chartData.map(item => formatTimestamp(item.timeStamp, timeRange));
  const pcrValues = chartData.map(item => parseFloat(item.PCR));
  const changePcrValues = chartData.map(item => parseFloat(item['Change PCR']));

  const allValues = [...pcrValues, ...changePcrValues].filter(val => !isNaN(val));
  const minValue = allValues.length ? Math.min(...allValues) : 0;
  const maxValue = allValues.length ? Math.max(...allValues) : 1;
  const padding = Math.max((maxValue - minValue) * 0.1, 0.1); // Minimum padding of 0.1
  const yMin = Math.max(minValue - padding, 0); // PCR can't be negative
  const yMax = maxValue + padding;

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1200, // Increased duration for smoother wave effect
      easing: 'easeInOutSine', // Smooth sine wave easing
      delay: (context) => {
        // Create wave pattern by delaying points based on their position
        const delay = context.dataIndex * 50; // Base delay per point
        return delay + Math.sin(context.dataIndex * 0.5) * 100; // Add sine wave variation
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
    },
    interaction: {
      mode: 'index',
      intersect: false,
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
          text: 'Value'
        },
        min: yMin,
        max: yMax,
        ticks: {
          stepSize: Math.max((yMax - yMin) / 10, 0.1) // Reasonable step size
        }
      }
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
    }
  };

  const chartDataConfig = {
    labels: timestamps,
    datasets: [
      {
        label: 'PCR',
        data: pcrValues,
        borderColor: 'rgb(0, 122, 255)',
        backgroundColor: 'rgba(0, 122, 255, 0.1)',
        tension: 0.2,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 0
      },
      {
        label: 'Change PCR',
        data: changePcrValues,
        borderColor: 'rgb(255, 45, 85)',
        backgroundColor: 'rgba(255, 45, 85, 0.1)',
        tension: 0.2,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 0
      }
    ]
  };

  const handleTimeRangeChange = (_: React.MouseEvent<HTMLElement>, newRange: string) => {
    if (newRange !== null) {
      onTimeRangeChange(newRange);
    }
  };

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 0,
        mt: 2,
        borderRadius: 2,
        bgcolor: '#FFFFFF'
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        p: 2,
        pb: 1
      }}>
        <Typography 
          variant="h6" 
          sx={{ 
            fontSize: isMobile ? '1.125rem' : '1.25rem',
            fontWeight: 600,
            letterSpacing: '-0.01em',
            color: 'rgba(0, 0, 0, 0.85)',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Icons", "Helvetica Neue", Helvetica, Arial, sans-serif'
          }}
        >
          PCR Analysis Chart
        </Typography>
        <ToggleButtonGroup
          value={timeRange}
          exclusive
          onChange={handleTimeRangeChange}
          size="small"
          sx={{
            '& .MuiToggleButton-root': {
              border: 'none',
              borderRadius: '0.375rem',
              mx: 0.5,
              px: 1.5,
              py: 0.5,
              fontSize: '0.875rem',
              fontWeight: 500,
              color: 'rgba(0, 0, 0, 0.6)',
              '&.Mui-selected': {
                backgroundColor: 'rgba(0, 122, 255, 0.1)',
                color: 'rgb(0, 122, 255)',
                '&:hover': {
                  backgroundColor: 'rgba(0, 122, 255, 0.15)',
                }
              },
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              }
            }
          }}
        >
          {Object.entries(TIME_RANGES).map(([key, label]) => (
            <ToggleButton 
              key={key} 
              value={key}
              aria-label={label}
            >
              {key}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>
      <Box sx={{ height: 400, width: '100%', p: 0, pt: 1 }}>
        <Line 
          ref={chartRef}
          options={options} 
          data={chartDataConfig} 
        />
      </Box>
    </Paper>
  );
};

export default AnalysisChart;
