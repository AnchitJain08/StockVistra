import React from 'react';
import BaseChart, { ChartDataPoint, TimeRange } from './BaseChart';

interface CompareData {
  timeStamp: string;
  PCR: string;
}

interface CompareChartProps {
  data: {
    [key: string]: CompareData[];
  };
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
}

const validateDataPoint = (item: CompareData): boolean => {
  const pcr = parseFloat(item.PCR);
  return !isNaN(pcr) && pcr >= 0 && pcr <= 5; // Reasonable PCR range
};

const CompareChart: React.FC<CompareChartProps> = ({ data, timeRange, onTimeRangeChange }) => {
  const datasets = Object.entries(data)
    .filter(([symbol, symbolData]) => symbol && symbolData?.length > 0)
    .map(([symbol, symbolData], index) => {
      const validData = symbolData.filter(validateDataPoint);
      
      return {
        label: symbol,
        data: validData.map(item => ({
          timeStamp: item.timeStamp,
          value: parseFloat(item.PCR)
        })) as ChartDataPoint[],
      };
    });

  return (
    <BaseChart
      datasets={datasets}
      timeRange={timeRange}
      onTimeRangeChange={onTimeRangeChange}
      title="PCR Comparison"
      yAxisLabel="PCR Value"
    />
  );
};

export default CompareChart;
