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

// Recent closed trades с цветами для P&L
export const mockClosedTrades: Trade[] = [
  {
    id: '1',
    ticker: 'BTCUSD',
    type: 'long',
    entryDate: new Date('2025-06-10'),
    entryPrice: 109567,
    exitDate: new Date('2025-06-22'),
    exitPrice: 99140,
    profitLoss: -10427,
    profitLossPercent: -9.51,
    status: 'closed',
  },
  {
    id: '2',
    ticker: 'CTVA',
    type: 'long',
    entryDate: new Date('2025-05-12'),
    entryPrice: 67.53,
    exitDate: new Date('2025-06-16'),
    exitPrice: 73.75,
    profitLoss: 622,
    profitLossPercent: 9.21,
    status: 'closed',
  },
  {
    id: '3',
    ticker: 'XPEV',
    type: 'long',
    entryDate: new Date('2025-05-12'),
    entryPrice: 21,
    exitDate: new Date('2025-06-13'),
    exitPrice: 18.53,
    profitLoss: -247,
    profitLossPercent: -11.76,
    status: 'closed',
  },
  {
    id: '4',
    ticker: 'KLAC',
    type: 'long',
    entryDate: new Date('2025-05-29'),
    entryPrice: 806.94,
    exitDate: new Date('2025-06-11'),
    exitPrice: 871.23,
    profitLoss: 6429,
    profitLossPercent: 7.97,
    status: 'closed',
  },
  {
    id: '5',
    ticker: 'IBM',
    type: 'long',
    entryDate: new Date('2025-05-14'),
    entryPrice: 257.59,
    exitDate: new Date('2025-06-11'),
    exitPrice: 280.66,
    profitLoss: 2307,
    profitLossPercent: 8.96,
    status: 'closed',
  },
  {
    id: '6',
    ticker: 'SILVER',
    type: 'long',
    entryDate: new Date('2025-06-02'),
    entryPrice: 33.67,
    exitDate: new Date('2025-06-09'),
    exitPrice: 36.38,
    profitLoss: 271,
    profitLossPercent: 8.05,
    status: 'closed',
  },
  {
    id: '7',
    ticker: 'HDB',
    type: 'long',
    entryDate: new Date('2025-04-16'),
    entryPrice: 69.2,
    exitDate: new Date('2025-06-05'),
    exitPrice: 75.71,
    profitLoss: 651,
    profitLossPercent: 9.41,
    status: 'closed',
  },
  {
    id: '8',
    ticker: 'BTCUSD',
    type: 'long',
    entryDate: new Date('2025-05-30'),
    entryPrice: 105525,
    exitDate: new Date('2025-06-05'),
    exitPrice: 101780,
    profitLoss: -3745,
    profitLossPercent: -3.54,
    status: 'closed',
  },
];

// Trade statistics для торгового журнала
export const mockTradeStats = {
  wins: 50,
  losses: 47,
  winRate: 68.5,
  averageWin: 8.3,
  averageLoss: -4.1,
  totalProfitLoss: 24.7,
  maxDrawdown: -8.3,
  sharpeRatio: 1.84,
  sortinоRatio: 2.41,
};