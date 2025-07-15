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
  showBenchmark?: boolean;
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({
  data,
  className = '',
  height = 400,
  showGrid = true,
  showLegend = true,
  showPeriodSelector = false, // По умолчанию отключен
  chartType = 'area',
  benchmarkData = [],
  title = 'Portfolio Performance',
  showBenchmark = false,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'ytd' | '1y' | '2y' | 'all'>('ytd');

  const periods = [
    { key: 'ytd', label: 'YTD' },
    { key: '1y', label: '1Y' },
    { key: '2y', label: '2Y' },
    { key: 'all', label: 'All' },
  ] as const;

  // Custom tooltip component с цветами из палитры
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div
          className="p-4 rounded-lg border shadow-lg"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(144, 191, 249, 0.2)',
          }}
        >
          <p className="font-medium mb-2" style={{ color: '#05192c' }}>
            {formatDate(new Date(label))}
          </p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm" style={{ color: '#334155' }}>
                {entry.name}:
              </span>
              <span className="font-medium" style={{ color: '#05192c' }}>
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

  // Combine data for chart (если предоставлен бенчмарк)
  const chartData = data.map((point, index) => {
    const combinedPoint = {
      ...point,
      date: point.date,
      portfolio: point.value,
    };

    // Добавляем бенчмарк если есть данные
    if (showBenchmark && benchmarkData && benchmarkData[index]) {
      combinedPoint['S&P 500'] = benchmarkData[index].value;
    }

    return combinedPoint;
  });

  const Chart = chartType === 'area' ? AreaChart : LineChart;

  return (
    <div className={cn('w-full', className)}>
      {/* Header с опциональным селектором периодов */}
      {(title || showPeriodSelector) && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          {title && (
            <h3 className="text-2xl font-semibold text-white">{title}</h3>
          )}

          {showPeriodSelector && (
            <div className="flex rounded-lg p-1" style={{ background: '#0f2337' }}>
              {periods.map((period) => (
                <Button
                  key={period.key}
                  variant={selectedPeriod === period.key ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedPeriod(period.key)}
                  className={cn(
                    'text-xs font-medium px-4 py-1',
                    selectedPeriod === period.key
                      ? 'bg-[#90bff9] text-[#05192c]'
                      : 'text-white/70 hover:text-white'
                  )}
                >
                  {period.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      )}

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
                stroke="rgba(255, 255, 255, 0.1)"
                opacity={0.3}
              />
            )}

            <XAxis
              dataKey="date"
              tickFormatter={formatXAxisTick}
              stroke="rgba(255, 255, 255, 0.7)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />

            <YAxis
              tickFormatter={formatYAxisTick}
              stroke="rgba(255, 255, 255, 0.7)"
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
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '14px',
                }}
              />
            )}

            {chartType === 'area' ? (
              <>
                {/* Portfolio Area */}
                <Area
                  type="monotone"
                  dataKey="portfolio"
                  stroke="#90bff9"
                  strokeWidth={3}
                  fill="url(#portfolioGradient)"
                  name="White Fin Capital"
                />

                {/* Benchmark Area если включен */}
                {showBenchmark && benchmarkData.length > 0 && (
                  <Area
                    type="monotone"
                    dataKey="S&P 500"
                    stroke="#a7f3d0"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    fill="url(#benchmarkGradient)"
                    name="S&P 500"
                  />
                )}

                {/* Градиенты */}
                <defs>
                  <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#90bff9" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#90bff9" stopOpacity={0.05}/>
                  </linearGradient>
                  <linearGradient id="benchmarkGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a7f3d0" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#a7f3d0" stopOpacity={0.02}/>
                  </linearGradient>
                </defs>
              </>
            ) : (
              <>
                {/* Portfolio Line */}
                <Line
                  type="monotone"
                  dataKey="portfolio"
                  stroke="#90bff9"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 6, stroke: '#90bff9', strokeWidth: 2, fill: '#fff' }}
                  name="White Fin Capital"
                />

                {/* Benchmark Line если включен */}
                {showBenchmark && benchmarkData.length > 0 && (
                  <Line
                    type="monotone"
                    dataKey="S&P 500"
                    stroke="#a7f3d0"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    activeDot={{ r: 4, stroke: '#a7f3d0', strokeWidth: 2, fill: '#fff' }}
                    name="S&P 500"
                  />
                )}
              </>
            )}
          </Chart>
        </ResponsiveContainer>
      </div>

      {/* Performance Summary ПОЛНОСТЬЮ УДАЛЕН - статистика теперь только в PerformanceSection */}
    </div>
  );
};

export default PerformanceChart;