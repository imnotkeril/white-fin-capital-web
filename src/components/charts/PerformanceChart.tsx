import React from 'react';
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
import { useTheme } from '@/context/ThemeContext';
import Button from '@/components/common/Button';

// DESIGN SYSTEM COLORS - одинаковые для обеих тем
const CHART_COLORS = {
  portfolio: '#90bff9', // primary-500 из tailwind.config.js
  benchmark: '#a7f3d0', // pastel-mint из дизайн-системы
} as const;

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
  selectedPeriod?: '1m' | '3m' | '6m' | '1y' | '2y' | 'all';
  onPeriodChange?: (period: '1m' | '3m' | '6m' | '1y' | '2y' | 'all') => void;
}

type CombinedChartDataPoint = ChartDataPoint & { portfolio: number; 'S&P 500'?: number };

const PerformanceChart: React.FC<PerformanceChartProps> = ({
  data,
  className = '',
  height = 400,
  showGrid = true,
  showLegend = true,
  showPeriodSelector = false,
  chartType = 'area',
  benchmarkData = [],
  title = 'Portfolio Performance',
  showBenchmark = false,
  selectedPeriod = '1y',
  onPeriodChange,
}) => {
  const { actualTheme } = useTheme();

  const periods = [
    { key: '1m', label: '1M' },
    { key: '3m', label: '3M' },
    { key: '6m', label: '6M' },
    { key: '1y', label: '1Y' },
    { key: '2y', label: '2Y' },
    { key: 'all', label: 'All' },
  ] as const;

  // Filter data based on selected period and recalculate returns relative to period start
  const filterDataByPeriod = (data: ChartDataPoint[], period: '1m' | '3m' | '6m' | '1y' | '2y' | 'all') => {
    if (period === 'all') return data;

    const now = new Date();
    let startDate: Date;

    switch (period) {
      case '1m':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '3m':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '6m':
        startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      case '2y':
        startDate = new Date(now.getTime() - 730 * 24 * 60 * 60 * 1000);
        break;
      default:
        return data;
    }

    // Filter data by date
    const filteredData = data.filter(point => new Date(point.date) >= startDate);

    if (filteredData.length === 0) return [];

    // Recalculate returns relative to the start of the period
    const baseValue = filteredData[0].value;

    return filteredData.map(point => ({
      ...point,
      value: point.value - baseValue // Calculate return relative to period start
    }));
  };

  // Apply period filtering
  const filteredData = filterDataByPeriod(data, selectedPeriod);
  const filteredBenchmarkData = benchmarkData ? filterDataByPeriod(benchmarkData, selectedPeriod) : [];

  // ИСПРАВЛЕНО: адаптивные цвета для UI элементов, цвета данных - из дизайн-системы
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div
          className="p-4 rounded-lg border shadow-lg"
          style={{
            background: actualTheme === 'dark'
              ? 'rgba(30, 41, 59, 0.95)'
              : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: actualTheme === 'dark'
              ? '1px solid rgba(144, 191, 249, 0.2)'
              : '1px solid rgba(59, 130, 246, 0.3)',
          }}
        >
          <p
            className="font-medium mb-2"
            style={{
              color: actualTheme === 'dark' ? '#f8fafc' : '#1e293b'
            }}
          >
            {formatDate(new Date(label))}
          </p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span
                className="text-sm"
                style={{
                  color: actualTheme === 'dark' ? '#94a3b8' : '#64748b'
                }}
              >
                {entry.name}:
              </span>
              <span
                className="font-medium"
                style={{
                  color: actualTheme === 'dark' ? '#f8fafc' : '#1e293b'
                }}
              >
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

  type CombinedChartDataPoint = {
    date: string;
    portfolio: number;
    value: number;
    label?: string;
    'S&P 500'?: number;
  };

  const chartData: CombinedChartDataPoint[] = filteredData.map((point, index) => {
    const combinedPoint: CombinedChartDataPoint = {
      ...point,
      date: point.date,
      portfolio: point.value,
    };

    if (showBenchmark && filteredBenchmarkData && filteredBenchmarkData[index]) {
      combinedPoint['S&P 500'] = filteredBenchmarkData[index].value;
    }

    return combinedPoint;
  });

  const Chart = chartType === 'area' ? AreaChart : LineChart;

  // ИСПРАВЛЕНО: адаптивные цвета для темы
  const gridColor = actualTheme === 'dark'
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(0, 0, 0, 0.1)';

  const axisColor = actualTheme === 'dark'
    ? 'rgba(255, 255, 255, 0.7)'
    : 'rgba(0, 0, 0, 0.7)';

  const titleColor = actualTheme === 'dark' ? '#ffffff' : '#1e293b';

  const legendColor = actualTheme === 'dark'
    ? 'rgba(255, 255, 255, 0.8)'
    : 'rgba(0, 0, 0, 0.8)';

  // Цвета из дизайн-системы (одинаковые для обеих тем)
  const portfolioColor = CHART_COLORS.portfolio;
  const benchmarkColor = CHART_COLORS.benchmark;
  const activeDotFill = actualTheme === 'dark' ? '#fff' : '#1e293b';

  return (
    <div className={cn('w-full', className)}>
      {/* Header с опциональным селектором периодов */}
      {(title || showPeriodSelector) && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          {title && (
            <h3
              className="text-2xl font-semibold"
              style={{ color: titleColor }}
            >
              {title}
            </h3>
          )}

          {showPeriodSelector && (
            <div
              className="flex rounded-lg p-1"
              style={{
                background: actualTheme === 'dark' ? '#0f2337' : '#f1f5f9'
              }}
            >
              {periods.map((period) => (
                <Button
                  key={period.key}
                  variant={selectedPeriod === period.key ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => onPeriodChange?.(period.key)}
                  className={cn(
                    'text-xs font-medium px-4 py-1',
                    selectedPeriod === period.key
                      ? actualTheme === 'dark'
                        ? 'bg-[#90bff9] text-[#05192c]'
                        : 'bg-[#3b82f6] text-white'
                      : actualTheme === 'dark'
                        ? 'text-white/70 hover:text-white'
                        : 'text-slate-600 hover:text-slate-900'
                  )}
                >
                  {period.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Chart Container - БЕЗ рамки как в оригинале */}
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
                stroke={gridColor}
                opacity={0.3}
              />
            )}

            <XAxis
              dataKey="date"
              tickFormatter={formatXAxisTick}
              stroke={axisColor}
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />

            <YAxis
              tickFormatter={formatYAxisTick}
              stroke={axisColor}
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
                  color: legendColor,
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
                  stroke={portfolioColor}
                  strokeWidth={3}
                  fill="url(#portfolioGradient)"
                  name="White Fin Capital"
                />

                {/* Benchmark Area если включен */}
                {showBenchmark && benchmarkData.length > 0 && (
                  <Area
                    type="monotone"
                    dataKey="S&P 500"
                    stroke={benchmarkColor}
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    fill="url(#benchmarkGradient)"
                    name="S&P 500"
                  />
                )}

                {/* ИСПРАВЛЕНО: адаптивные градиенты */}
                <defs>
                  <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={portfolioColor}
                      stopOpacity={actualTheme === 'dark' ? 0.3 : 0.2}
                    />
                    <stop
                      offset="95%"
                      stopColor={portfolioColor}
                      stopOpacity={actualTheme === 'dark' ? 0.05 : 0.02}
                    />
                  </linearGradient>
                  <linearGradient id="benchmarkGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={benchmarkColor}
                      stopOpacity={actualTheme === 'dark' ? 0.2 : 0.15}
                    />
                    <stop
                      offset="95%"
                      stopColor={benchmarkColor}
                      stopOpacity={actualTheme === 'dark' ? 0.02 : 0.01}
                    />
                  </linearGradient>
                </defs>
              </>
            ) : (
              <>
                {/* Portfolio Line */}
                <Line
                  type="monotone"
                  dataKey="portfolio"
                  stroke={portfolioColor}
                  strokeWidth={3}
                  dot={false}
                  activeDot={{
                    r: 6,
                    stroke: portfolioColor,
                    strokeWidth: 2,
                    fill: activeDotFill
                  }}
                  name="White Fin Capital"
                />

                {/* Benchmark Line если включен */}
                {showBenchmark && benchmarkData.length > 0 && (
                  <Line
                    type="monotone"
                    dataKey="S&P 500"
                    stroke={benchmarkColor}
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    activeDot={{
                      r: 4,
                      stroke: benchmarkColor,
                      strokeWidth: 2,
                      fill: activeDotFill
                    }}
                    name="S&P 500"
                  />
                )}
              </>
            )}
          </Chart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PerformanceChart;