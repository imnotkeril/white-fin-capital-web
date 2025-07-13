import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { ChartDataPoint } from '@/types';
import { formatPercentage, formatDate } from '@/utils/formatting';
import { cn } from '@/utils/helpers';
import Button from '@/components/common/Button';

interface PerformanceChartProps {
  data: ChartDataPoint[];
  className?: string;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  showPeriodSelector?: boolean;
  chartType?: 'line' | 'area';
  benchmarkData?: ChartDataPoint[];
  title?: string;
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({
  data,
  className = '',
  height = 400,
  showGrid = true,
  showLegend = true,
  showPeriodSelector = true,
  chartType = 'area',
  benchmarkData,
  title = 'Portfolio Performance',
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'ytd' | '1y' | '2y' | 'all'>('ytd');

  const periods = [
    { key: 'ytd', label: 'YTD' },
    { key: '1y', label: '1Y' },
    { key: '2y', label: '2Y' },
    { key: 'all', label: 'All' },
  ] as const;

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass p-4 rounded-lg border border-border shadow-lg">
          <p className="text-text-primary font-medium mb-2">
            {formatDate(new Date(label))}
          </p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-text-secondary text-sm">
                {entry.name}:
              </span>
              <span className="text-text-primary font-medium">
                {formatPercentage(entry.value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Format tick values for Y-axis
  const formatYAxisTick = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  // Format tick values for X-axis
  const formatXAxisTick = (value: string) => {
    const date = new Date(value);
    return date.toLocaleDateString('en-US', { 
      month: 'short',
      day: 'numeric',
    });
  };

  // Combine data for chart (if benchmark is provided)
  const chartData = data.map((point, index) => ({
    ...point,
    date: point.date,
    portfolio: point.value,
    benchmark: benchmarkData?.[index]?.value || 0,
  }));

  const Chart = chartType === 'area' ? AreaChart : LineChart;

  return (
    <div className={cn('w-full', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h3 className="text-2xl font-semibold text-text-primary">{title}</h3>
        
        {showPeriodSelector && (
          <div className="flex rounded-lg bg-background-secondary p-1">
            {periods.map((period) => (
              <Button
                key={period.key}
                variant={selectedPeriod === period.key ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setSelectedPeriod(period.key)}
                className={cn(
                  'text-xs font-medium px-4 py-1',
                  selectedPeriod === period.key
                    ? 'bg-primary-500 text-white'
                    : 'text-text-secondary hover:text-text-primary'
                )}
              >
                {period.label}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Chart Container */}
      <div className="w-full" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <Chart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 20,
            }}
          >
            {showGrid && (
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="var(--color-border)"
                opacity={0.3}
              />
            )}
            
            <XAxis
              dataKey="date"
              tickFormatter={formatXAxisTick}
              stroke="var(--color-text-secondary)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            
            <YAxis
              tickFormatter={formatYAxisTick}
              stroke="var(--color-text-secondary)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              domain={['dataMin - 2', 'dataMax + 2']}
            />
            
            <Tooltip content={<CustomTooltip />} />
            
            {showLegend && (
              <Legend
                iconType="line"
                wrapperStyle={{
                  color: 'var(--color-text-secondary)',
                  fontSize: '14px',
                }}
              />
            )}

            {chartType === 'area' ? (
              <>
                <defs>
                  <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#90bff9" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#90bff9" stopOpacity={0} />
                  </linearGradient>
                  {benchmarkData && (
                    <linearGradient id="benchmarkGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6b7280" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#6b7280" stopOpacity={0} />
                    </linearGradient>
                  )}
                </defs>
                
                <Area
                  type="monotone"
                  dataKey="portfolio"
                  stroke="#90bff9"
                  strokeWidth={3}
                  fill="url(#portfolioGradient)"
                  name="White Fin Capital"
                  dot={false}
                  activeDot={{ 
                    r: 6, 
                    fill: '#90bff9',
                    stroke: '#ffffff',
                    strokeWidth: 2,
                  }}
                />
                
                {benchmarkData && (
                  <Area
                    type="monotone"
                    dataKey="benchmark"
                    stroke="#6b7280"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    fill="url(#benchmarkGradient)"
                    name="S&P 500"
                    dot={false}
                  />
                )}
              </>
            ) : (
              <>
                <Line
                  type="monotone"
                  dataKey="portfolio"
                  stroke="#90bff9"
                  strokeWidth={3}
                  name="White Fin Capital"
                  dot={false}
                  activeDot={{ 
                    r: 6, 
                    fill: '#90bff9',
                    stroke: '#ffffff',
                    strokeWidth: 2,
                  }}
                />
                
                {benchmarkData && (
                  <Line
                    type="monotone"
                    dataKey="benchmark"
                    stroke="#6b7280"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="S&P 500"
                    dot={false}
                  />
                )}
              </>
            )}
          </Chart>
        </ResponsiveContainer>
      </div>

      {/* Performance Summary */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <p className="text-text-secondary text-sm">Current Return</p>
          <p className="text-2xl font-bold text-accent-green">
            +{formatPercentage(data[data.length - 1]?.value || 0)}
          </p>
        </div>
        
        <div className="text-center">
          <p className="text-text-secondary text-sm">Best Day</p>
          <p className="text-lg font-semibold text-accent-green">
            +2.8%
          </p>
        </div>
        
        <div className="text-center">
          <p className="text-text-secondary text-sm">Worst Day</p>
          <p className="text-lg font-semibold text-accent-red">
            -1.9%
          </p>
        </div>
        
        <div className="text-center">
          <p className="text-text-secondary text-sm">Volatility</p>
          <p className="text-lg font-semibold text-text-primary">
            14.2%
          </p>
        </div>
      </div>
    </div>
  );
};

export default PerformanceChart;