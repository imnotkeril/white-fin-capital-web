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

// Recent closed trades
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
    profitLoss: 6.22,
    profitLossPercent: 9.21,
    status: 'closed',
  },
  {
    id: '3',
    ticker: 'XPEV',
    type: 'long',
    entryDate: new Date('2025-05-12'),
    entryPrice: 21.00,
    exitDate: new Date('2025-06-13'),
    exitPrice: 18.53,
    profitLoss: -2.47,
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
    profitLoss: 64.29,
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
    profitLoss: 23.07,
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
    profitLoss: 2.71,
    profitLossPercent: 8.05,
    status: 'closed',
  },
  {
    id: '7',
    ticker: 'HDB',
    type: 'long',
    entryDate: new Date('2025-04-16'),
    entryPrice: 69.20,
    exitDate: new Date('2025-06-05'),
    exitPrice: 75.71,
    profitLoss: 6.51,
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

// Performance chart data (cumulative returns)
export const mockPerformanceChartData: ChartDataPoint[] = [
  { date: '2025-01-01', value: 0, label: 'Start of Year' },
  { date: '2025-01-15', value: 2.1, label: 'Mid January' },
  { date: '2025-02-01', value: 3.8, label: 'February' },
  { date: '2025-02-15', value: 5.2, label: 'Mid February' },
  { date: '2025-03-01', value: 7.9, label: 'March' },
  { date: '2025-03-15', value: 9.4, label: 'Mid March' },
  { date: '2025-04-01', value: 12.1, label: 'April' },
  { date: '2025-04-15', value: 14.8, label: 'Mid April' },
  { date: '2025-05-01', value: 18.3, label: 'May' },
  { date: '2025-05-15', value: 21.2, label: 'Mid May' },
  { date: '2025-06-01', value: 23.5, label: 'June' },
  { date: '2025-06-15', value: 22.1, label: 'Mid June' },
  { date: '2025-07-01', value: 24.2, label: 'July' },
  { date: '2025-07-13', value: 24.7, label: 'Current' },
];

// Monthly performance breakdown
export const mockMonthlyPerformance = [
  { month: 'Jan 2025', return: 2.1, trades: 8 },
  { month: 'Feb 2025', return: 1.7, trades: 7 },
  { month: 'Mar 2025', return: 4.1, trades: 9 },
  { month: 'Apr 2025', return: 2.7, trades: 11 },
  { month: 'May 2025', return: 6.2, trades: 14 },
  { month: 'Jun 2025', return: -1.4, trades: 16 },
  { month: 'Jul 2025', return: 2.1, trades: 8 },
];

// Asset allocation data
export const mockAssetAllocation = [
  { name: 'Equities', value: 45, color: '#3b82f6' },
  { name: 'Commodities', value: 25, color: '#f59e0b' },
  { name: 'Crypto', value: 20, color: '#8b5cf6' },
  { name: 'Bonds', value: 10, color: '#10b981' },
];

// Sector performance data
export const mockSectorPerformance = [
  { sector: 'Technology', return: 18.3, allocation: 25 },
  { sector: 'Healthcare', return: 12.7, allocation: 15 },
  { sector: 'Financial', return: 9.4, allocation: 20 },
  { sector: 'Energy', return: 31.2, allocation: 12 },
  { sector: 'Consumer', return: 6.8, allocation: 18 },
  { sector: 'Industrial', return: 14.1, allocation: 10 },
];

// Risk metrics
export const mockRiskMetrics = {
  volatility: 14.2,
  maxDrawdown: -8.3,
  sharpeRatio: 1.84,
  sortino: 2.41,
  beta: 0.87,
  alpha: 5.2,
  informationRatio: 1.23,
  trackingError: 3.8,
};

// Trade statistics summary
export const mockTradeStats = {
  wins: 50,
  losses: 47,
  winRate: 68.5,
  avgWin: 8.3,
  avgLoss: -4.1,
  bestTrade: 31.2,
  worstTrade: -11.76,
  avgHoldingPeriod: 18, // days
  profitFactor: 2.02,
};

// Generate mock data for different time periods
export const generateMockDataForPeriod = (period: 'ytd' | '1y' | '2y' | 'all') => {
  const baseReturn = 24.7;
  const multiplier = {
    ytd: 1,
    '1y': 1.8,
    '2y': 2.4,
    all: 3.2,
  };

  return {
    ...mockStatistics,
    totalReturn: baseReturn * multiplier[period],
    totalTrades: Math.floor(mockStatistics.totalTrades * multiplier[period]),
    period: period.toUpperCase(),
  };
};