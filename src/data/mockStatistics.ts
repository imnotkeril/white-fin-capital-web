// Mock data for White Fin Capital statistics and performance

import { Statistics, Trade, ChartDataPoint, KPIData } from '@/types';

// Performance statistics
export const mockStatistics: Statistics = {
  totalReturn: 24.7,
  winRate: 68.5,
  totalTrades: 97,
  averageGain: 8.3,
  averageLoss: -4.1,
  period: 'YTD 2025',
  lastUpdated: new Date('2025-07-13'),
};

// Detailed KPI data
export const mockKPIData: KPIData[] = [
  {
    label: 'Total Return',
    value: 24.7,
    trend: 'up',
    trendValue: 3.2,
    format: 'percentage',
  },
  {
    label: 'Win Rate',
    value: 68.5,
    trend: 'up',
    trendValue: 2.1,
    format: 'percentage',
  },
  {
    label: 'Total Trades',
    value: 97,
    trend: 'up',
    trendValue: 12,
    format: 'number',
  },
  {
    label: 'Average Gain',
    value: 8.3,
    trend: 'up',
    trendValue: 0.8,
    format: 'percentage',
  },
  {
    label: 'Average Loss',
    value: -4.1,
    trend: 'up',
    trendValue: 0.3,
    format: 'percentage',
  },
  {
    label: 'Sharpe Ratio',
    value: 1.84,
    trend: 'up',
    trendValue: 0.12,
    format: 'number',
  },
];

// Portfolio performance chart data
export const mockPerformanceChartData: ChartDataPoint[] = [
  { date: '2025-01-01', value: 0 },
  { date: '2025-01-15', value: 2.1 },
  { date: '2025-02-01', value: 3.8 },
  { date: '2025-02-15', value: 2.9 },
  { date: '2025-03-01', value: 5.2 },
  { date: '2025-03-15', value: 7.1 },
  { date: '2025-04-01', value: 6.8 },
  { date: '2025-04-15', value: 9.2 },
  { date: '2025-05-01', value: 11.5 },
  { date: '2025-05-15', value: 10.8 },
  { date: '2025-06-01', value: 14.2 },
  { date: '2025-06-15', value: 16.8 },
  { date: '2025-07-01', value: 19.5 },
  { date: '2025-07-13', value: 24.7 },
];

// S&P 500 benchmark data - примерно на 30% ниже нашей производительности
export const mockBenchmarkChartData: ChartDataPoint[] = [
  { date: '2025-01-01', value: 0 },
  { date: '2025-01-15', value: 1.2 },
  { date: '2025-02-01', value: 2.1 },
  { date: '2025-02-15', value: 1.8 },
  { date: '2025-03-01', value: 3.1 },
  { date: '2025-03-15', value: 4.2 },
  { date: '2025-04-01', value: 3.9 },
  { date: '2025-04-15', value: 5.8 },
  { date: '2025-05-01', value: 7.2 },
  { date: '2025-05-15', value: 6.8 },
  { date: '2025-06-01', value: 8.9 },
  { date: '2025-06-15', value: 10.1 },
  { date: '2025-07-01', value: 11.8 },
  { date: '2025-07-13', value: 14.2 },
];

// Recent closed trades - ИСПРАВЛЕННАЯ СТРУКТУРА
export const mockClosedTrades = [
  {
    id: '1',
    symbol: 'BTCUSD',
    type: 'LONG',
    entryPrice: 109567,
    exitPrice: 99140,
    pnl: -10427,
    return: -9.51,
    entryDate: '2025-06-10',
    closedAt: '2025-06-22',
  },
  {
    id: '2',
    symbol: 'CTVA',
    type: 'LONG',
    entryPrice: 67.53,
    exitPrice: 73.75,
    pnl: 622,
    return: 9.21,
    entryDate: '2025-05-12',
    closedAt: '2025-06-16',
  },
  {
    id: '3',
    symbol: 'XPEV',
    type: 'LONG',
    entryPrice: 21,
    exitPrice: 18.53,
    pnl: -247,
    return: -11.76,
    entryDate: '2025-05-12',
    closedAt: '2025-06-13',
  },
  {
    id: '4',
    symbol: 'KLAC',
    type: 'LONG',
    entryPrice: 806.94,
    exitPrice: 871.23,
    pnl: 6429,
    return: 7.97,
    entryDate: '2025-05-29',
    closedAt: '2025-06-11',
  },
  {
    id: '5',
    symbol: 'IBM',
    type: 'LONG',
    entryPrice: 257.59,
    exitPrice: 280.66,
    pnl: 2307,
    return: 8.96,
    entryDate: '2025-05-14',
    closedAt: '2025-06-11',
  },
  {
    id: '6',
    symbol: 'SILVER',
    type: 'LONG',
    entryPrice: 33.67,
    exitPrice: 36.38,
    pnl: 271,
    return: 8.05,
    entryDate: '2025-06-02',
    closedAt: '2025-06-09',
  },
  {
    id: '7',
    symbol: 'HDB',
    type: 'LONG',
    entryPrice: 69.2,
    exitPrice: 75.71,
    pnl: 651,
    return: 9.41,
    entryDate: '2025-04-16',
    closedAt: '2025-06-05',
  },
  {
    id: '8',
    symbol: 'BTCUSD',
    type: 'LONG',
    entryPrice: 105525,
    exitPrice: 101780,
    pnl: -3745,
    return: -3.54,
    entryDate: '2025-05-30',
    closedAt: '2025-06-05',
  },
];

// Trade statistics для торгового журнала - ИСПРАВЛЕНО: это массив статистик
export const mockTradeStats = [
  {
    label: 'Total Trades',
    value: 97,
    trend: 'up' as const,
    format: 'number' as const,
  },
  {
    label: 'Winning Trades',
    value: 50,
    trend: 'up' as const,
    format: 'number' as const,
  },
  {
    label: 'Losing Trades',
    value: 47,
    trend: 'down' as const,
    format: 'number' as const,
  },
  {
    label: 'Win Rate',
    value: 68.5,
    trend: 'up' as const,
    format: 'percentage' as const,
  },
];

// Monthly performance data
export const mockMonthlyPerformance = [
  {
    month: 'Jan 2025',
    return: 3.8,
    trades: 8,
  },
  {
    month: 'Feb 2025',
    return: 2.1,
    trades: 7,
  },
  {
    month: 'Mar 2025',
    return: 4.3,
    trades: 12,
  },
  {
    month: 'Apr 2025',
    return: 3.2,
    trades: 9,
  },
  {
    month: 'May 2025',
    return: 5.8,
    trades: 15,
  },
  {
    month: 'Jun 2025',
    return: 4.9,
    trades: 18,
  },
  {
    month: 'Jul 2025',
    return: 6.2,
    trades: 14,
  },
];

// Helper function to generate period-specific data
export function generateMockDataForPeriod(period: 'ytd' | '1y' | '2y' | 'all') {
  const baseStats = {
    ytd: {
      totalReturn: 24.7,
      winRate: 68.5,
      totalTrades: 97,
      averageGain: 8.3,
      averageLoss: -4.1,
    },
    '1y': {
      totalReturn: 24.7,
      winRate: 68.5,
      totalTrades: 97,
      averageGain: 8.3,
      averageLoss: -4.1,
    },
    '2y': {
      totalReturn: 42.1,
      winRate: 69.2,
      totalTrades: 203,
      averageGain: 8.8,
      averageLoss: -3.9,
    },
    all: {
      totalReturn: 67.8,
      winRate: 71.1,
      totalTrades: 312,
      averageGain: 9.2,
      averageLoss: -3.7,
    },
  };

  return baseStats[period] || baseStats.ytd;
}