import type { NextApiRequest, NextApiResponse } from 'next';
import { StatisticsResponse, ApiResponse } from '@/types/api';
import { 
  mockStatistics,
  mockPerformanceChartData,
  mockClosedTrades,
  mockMonthlyPerformance,
  generateMockDataForPeriod,
} from '@/data/mockStatistics';
import { ERROR_MESSAGES } from '@/utils/constants';

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const cache = new Map<string, { data: any; timestamp: number }>();

function getCachedData(key: string): any | null {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
}

function setCachedData(key: string, data: any): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
}

function validatePeriod(period: any): period is 'ytd' | '1y' | '2y' | 'all' {
  return ['ytd', '1y', '2y', 'all'].includes(period);
}

async function getStatisticsFromDatabase(
  period: 'ytd' | '1y' | '2y' | 'all' = 'ytd',
  includeClosedTrades: boolean = true
): Promise<StatisticsResponse> {
  // TODO: Replace with actual database queries
  // This is mock data for demonstration

  const cacheKey = `stats_${period}_${includeClosedTrades}`;
  
  // Check cache first
  const cachedData = getCachedData(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  // Generate period-specific data
  const periodStats = generateMockDataForPeriod(period);
  
  // Filter chart data based on period
  let chartData = [...mockPerformanceChartData];
  const now = new Date();
  
  switch (period) {
    case 'ytd':
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      chartData = chartData.filter(point => new Date(point.date) >= startOfYear);
      break;
    case '1y':
      const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      chartData = chartData.filter(point => new Date(point.date) >= oneYearAgo);
      break;
    case '2y':
      const twoYearsAgo = new Date(now.getTime() - 2 * 365 * 24 * 60 * 60 * 1000);
      chartData = chartData.filter(point => new Date(point.date) >= twoYearsAgo);
      break;
    case 'all':
      // Use all data
      break;
  }

  // Filter recent trades
  const recentTrades = includeClosedTrades 
    ? mockClosedTrades.slice(0, 10).map(trade => ({
        ticker: trade.ticker,
        type: trade.type,
        entryDate: trade.entryDate.toISOString().split('T')[0],
        exitDate: trade.exitDate?.toISOString().split('T')[0] || '',
        return: trade.profitLoss || 0,
        returnPercent: trade.profitLossPercent || 0,
      }))
    : [];

  const statisticsData: StatisticsResponse = {
    overview: {
      totalReturn: periodStats.totalReturn,
      winRate: periodStats.winRate,
      totalTrades: periodStats.totalTrades,
      averageGain: periodStats.averageGain,
      averageLoss: periodStats.averageLoss,
      sharpeRatio: 1.84,
      maxDrawdown: -8.3,
    },
    chartData: {
      cumulative: chartData.map(point => ({
        date: point.date,
        value: point.value,
      })),
      monthly: mockMonthlyPerformance.map(month => ({
        month: month.month,
        return: month.return,
        trades: month.trades,
      })),
    },
    recentTrades,
  };

  // Cache the result
  setCachedData(cacheKey, statisticsData);

  return statisticsData;
}

async function getMarketBenchmark(period: string): Promise<Array<{ date: string; value: number }>> {
  // TODO: Fetch real market benchmark data (S&P 500, etc.)
  // This is mock benchmark data
  
  const benchmark = mockPerformanceChartData.map(point => ({
    date: point.date,
    value: point.value * 0.6, // Mock benchmark performing 60% of our returns
  }));

  return benchmark;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<StatisticsResponse>>
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    // Parse query parameters
    const { period = 'ytd', includeClosedTrades = 'true', includeBenchmark = 'false' } = req.query;

    // Validate period parameter
    if (!validatePeriod(period)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid period. Must be one of: ytd, 1y, 2y, all',
      });
    }

    const includeTradesFlag = includeClosedTrades === 'true';
    const includeBenchmarkFlag = includeBenchmark === 'true';

    // Get statistics data
    const statisticsData = await getStatisticsFromDatabase(period, includeTradesFlag);

    // Add benchmark data if requested
    if (includeBenchmarkFlag) {
      const benchmarkData = await getMarketBenchmark(period);
      (statisticsData as any).benchmark = benchmarkData;
    }

    // Set cache headers
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    res.setHeader('X-Data-Source', 'mock'); // Remove in production

    // Return success response
    res.status(200).json({
      success: true,
      data: statisticsData,
      message: `Statistics retrieved for period: ${period}`,
    });

  } catch (error) {
    console.error('Statistics API error:', error);
    
    res.status(500).json({
      success: false,
      error: ERROR_MESSAGES.server,
    });
  }
}

// Additional endpoint info for documentation
export const config = {
  api: {
    externalResolver: true,
  },
};