import React from 'react';
import BaseChart, { ChartDataPoint, TimeRange } from './BaseChart';

interface AnalysisData {
  timeStamp: string;
  PCR: string;
  'Change PCR': string;
}

interface AnalysisChartProps {
  data: AnalysisData[];
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
}

const validateDataPoint = (item: AnalysisData): boolean => {
  const pcr = parseFloat(item.PCR);
  const changePcr = parseFloat(item['Change PCR']);
  return !isNaN(pcr) && !isNaN(changePcr) &&
         pcr >= 0 && pcr <= 5 && // Reasonable PCR range
         changePcr >= -5 && changePcr <= 5; // Reasonable Change PCR range
};

const AnalysisChart: React.FC<AnalysisChartProps> = ({ data, timeRange, onTimeRangeChange }) => {
  const validData = data.filter(validateDataPoint);

  const datasets = [
    {
      label: 'PCR',
      data: validData.map(item => ({
        timeStamp: item.timeStamp,
        value: parseFloat(item.PCR)
      })) as ChartDataPoint[],
      color: '#4CAF50'
    },
    {
      label: 'PCR Change',
      data: validData.map(item => ({
        timeStamp: item.timeStamp,
        value: parseFloat(item['Change PCR'])
      })) as ChartDataPoint[],
      color: '#2196F3'
    }
  ];

  return (
    <BaseChart
      datasets={datasets}
      timeRange={timeRange}
      onTimeRangeChange={onTimeRangeChange}
      title="PCR Analysis"
      yAxisLabel="Value"
    />
  );
};

export default AnalysisChart;
