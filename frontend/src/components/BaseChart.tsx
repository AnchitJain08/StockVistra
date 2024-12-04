import React from 'react';
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
  ChartOptions,
  ChartData
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

export const TIME_RANGES = {
  '15M': '15 Minutes',
  '30M': '30 Minutes',
  '1H': '1 Hour',
  '3H': '3 Hours',
  'ALL': 'All Data'
} as const;

export type TimeRange = keyof typeof TIME_RANGES;

export interface ChartDataPoint {
  timeStamp: string;
  value: number;
}

export interface BaseChartProps {
  datasets: Array<{
    label: string;
    data: ChartDataPoint[];
    color?: string;
  }>;
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
  title?: string;
  yAxisLabel?: string;
}

const parseTimestamp = (timestamp: string): Date | null => {
  try {
    if (!timestamp || typeof timestamp !== 'string') return null;
    
    const parts = timestamp.split('-');
    if (parts.length !== 2) return null;
    
    const [datePart, timePart] = parts;
    if (!datePart || !timePart) return null;
    
    const [day, month] = datePart.split('/');
    const [hours, minutes] = timePart.split(':');
    
    if (!day || !month || !hours || !minutes) return null;
    
    const now = new Date();
    const date = new Date(now.getFullYear(), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes));
    return isNaN(date.getTime()) ? null : date;
  } catch (error) {
    console.error('Error parsing timestamp:', error);
    return null;
  }
};

export const formatTimestamp = (timestamp: string, range: TimeRange): string => {
  if (!timestamp || typeof timestamp !== 'string') return '';
  
  const parts = timestamp.split('-');
  if (parts.length !== 2) return timestamp;
  
  const [datePart, timePart] = parts;
  if (!datePart || !timePart) return timestamp;
  
  if (range === 'ALL') return `${datePart} ${timePart}`;
  return timePart;
};

export const filterDataByTimeRange = (data: ChartDataPoint[], range: TimeRange): ChartDataPoint[] => {
  if (!data?.length) return [];
  
  // Always work with a copy of the data and sort it by timestamp in ascending order
  let filteredData = [...data].sort((a, b) => {
    const dateA = parseTimestamp(a.timeStamp);
    const dateB = parseTimestamp(b.timeStamp);
    if (!dateA || !dateB) return 0;
    return dateA.getTime() - dateB.getTime();
  });
  
  // First filter by time range if needed
  if (range !== 'ALL') {
    const getLatestTimestamp = () => {
      const latestEntry = filteredData[filteredData.length - 1];
      if (!latestEntry?.timeStamp) return new Date();
      
      const parsedDate = parseTimestamp(latestEntry.timeStamp);
      return parsedDate || new Date();
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
    
    const filterTime = timeFilters[range];
    if (filterTime) {
      filteredData = filteredData.filter(item => {
        if (!item?.timeStamp) return false;
        const parsedDate = parseTimestamp(item.timeStamp);
        return parsedDate ? parsedDate >= filterTime : false;
      });
    }
  }
  
  return filteredData;
};

const getChartOptions = (
  isMobile: boolean,
  title: string,
  yAxisLabel: string,
  timeRange: TimeRange
): ChartOptions<'line'> => {
  const tickCount = timeRange === 'ALL' ? 6 : (isMobile ? 6 : 10);
  const xAxisTitle = timeRange === 'ALL' ? 'Date' : 'Time';

  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: isMobile ? 'bottom' : 'top',
        labels: {
          boxWidth: 12,
          padding: 15,
          font: {
            size: isMobile ? 10 : 12
          }
        }
      },
      title: {
        display: !!title,
        text: title,
        font: {
          size: isMobile ? 14 : 16
        }
      },
      tooltip: {
        enabled: true,
        mode: 'index',
        intersect: false,
        padding: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#000',
        titleFont: {
          size: 13,
          weight: 'bold'
        },
        bodyColor: '#666',
        bodyFont: {
          size: 12
        },
        borderColor: 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: xAxisTitle,
          font: {
            size: isMobile ? 10 : 12
          }
        },
        grid: {
          display: false
        },
        ticks: {
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: tickCount,
          font: {
            size: isMobile ? 9 : 11
          }
        }
      },
      y: {
        display: true,
        title: {
          display: !!yAxisLabel,
          text: yAxisLabel,
          font: {
            size: isMobile ? 10 : 12
          }
        },
        ticks: {
          font: {
            size: isMobile ? 9 : 11
          }
        }
      }
    }
  };
};

const BaseChart: React.FC<BaseChartProps> = ({
  datasets,
  timeRange,
  onTimeRangeChange,
  title = '',
  yAxisLabel = ''
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const filteredDatasets = datasets.map(dataset => ({
    ...dataset,
    data: filterDataByTimeRange(dataset.data, timeRange)
  }));

  const chartData: ChartData<'line'> = {
    labels: filteredDatasets[0]?.data.map(item => formatTimestamp(item.timeStamp, timeRange)) || [],
    datasets: filteredDatasets.map((dataset, index) => ({
      label: dataset.label,
      data: dataset.data.map(item => item.value),
      borderColor: dataset.color || `hsl(${index * 137.5}, 70%, 50%)`,
      backgroundColor: dataset.color || `hsla(${index * 137.5}, 70%, 50%, 0.5)`,
      tension: 0.4,
      pointRadius: 0,
      borderWidth: 2,
      pointHoverRadius: 4,
      pointHoverBackgroundColor: dataset.color || `hsl(${index * 137.5}, 70%, 50%)`,
      pointHoverBorderColor: '#fff',
      pointHoverBorderWidth: 2,
    }))
  };

  const baseOptions = getChartOptions(isMobile, title, yAxisLabel, timeRange);
  const options: ChartOptions<'line'> = {
    ...baseOptions,
    scales: {
      ...(baseOptions.scales || {}),
      x: {
        ...(baseOptions.scales?.x || {}),
        reverse: false
      }
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        p: 2,
        pb: 1
      }}>
        {title && (
          <Typography 
            variant="h6" 
            component="h2"
            sx={{
              fontSize: isMobile ? '1.1rem' : '1.25rem',
              fontWeight: 600
            }}
          >
            {title}
          </Typography>
        )}
        <ToggleButtonGroup
          value={timeRange}
          exclusive
          onChange={(_, value) => value && onTimeRangeChange(value as TimeRange)}
          size={isMobile ? 'small' : 'medium'}
          sx={{
            bgcolor: 'background.paper',
            padding: 0.5,
            borderRadius: 3,
            gap: 0.5,
            '& .MuiToggleButton-root': {
              px: isMobile ? 1 : 2,
              py: 0.5,
              fontSize: isMobile ? '0.75rem' : '0.875rem',
              borderRadius: 2,
              border: 'none',
              color: 'text.secondary',
              '&.Mui-selected': {
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
              },
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }
          }}
        >
          {Object.entries(TIME_RANGES).map(([value, label]) => (
            <ToggleButton key={value} value={value}>
              {value}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>
      <Box sx={{ 
        height: isMobile ? 350 : 400,
        px: 2,
        pb: 2
      }}>
        <Line options={options} data={chartData} />
      </Box>
    </Box>
  );
};

export default BaseChart;
