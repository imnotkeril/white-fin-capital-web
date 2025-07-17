// Real statistics service using actual trading data
import { DataParser } from '@/services/dataParser';
import { PerformanceCalculator } from '@/services/performanceCalculator';
import { BenchmarkService } from '@/services/benchmarkService';
import {
  ProcessedTradeRecord,
  CalculatedMetrics,
  PortfolioPerformancePoint,
  BenchmarkDataPoint,
  ComparisonMetrics,
  KPIData
} from '@/types/realData';

export class RealStatistics {
  private static cachedData: {
    trades: ProcessedTradeRecord[];
    metrics: CalculatedMetrics;
    performanceData: PortfolioPerformancePoint[];
    benchmarkData: BenchmarkDataPoint[];
    lastUpdated: Date;
  } | null = null;

  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Load and process all trading data
   */
  static async loadData(forceRefresh: boolean = false): Promise<{
    trades: ProcessedTradeRecord[];
    metrics: CalculatedMetrics;
    performanceData: PortfolioPerformancePoint[];
    benchmarkData: BenchmarkDataPoint[];
  }> {
    // Check cache
    if (!forceRefresh && this.cachedData &&
        Date.now() - this.cachedData.lastUpdated.getTime() < this.CACHE_DURATION) {
      return this.cachedData;
    }

    try {
      console.log('Loading trading data from Excel file...');

      // Parse trading data
      const parseResult = await DataParser.loadData();

      if (!parseResult.success || parseResult.data.length === 0) {
        throw new Error(`Failed to load trading data: ${parseResult.errors.map(e => e.error).join(', ')}`);
      }

      const trades = parseResult.data;
      console.log(`Loaded ${trades.length} trades successfully`);

      // Calculate performance metrics
      const metrics = PerformanceCalculator.calculateMetrics(trades, {
        startingPortfolioValue: 100,
        riskFreeRate: 0.05,
        includeBenchmarkComparison: true
      });

      // Calculate portfolio performance over time
      const performanceData = PerformanceCalculator.calculatePortfolioReturns(trades, 100);

      // Get benchmark data for the same period
      const tradeDates = trades.map(t => t.exitDate);
      const benchmarkData = await BenchmarkService.getBenchmarkForTrades(tradeDates);

      console.log('Data loading completed successfully');

      // Cache the result
      this.cachedData = {
        trades,
        metrics,
        performanceData,
        benchmarkData,
        lastUpdated: new Date()
      };

      return this.cachedData;

    } catch (error) {
      console.error('Error loading real trading data:', error);
      throw error;
    }
  }

  /**
   * Get KPI data for dashboard
   */
  static async getKPIData(): Promise<KPIData[]> {
    const { metrics } = await this.loadData();

    return [
      {
        label: 'Total Return',
        value: metrics.totalReturn,
        format: 'percentage' as const,
        trend: metrics.totalReturn > 0 ? 'up' as const : 'down' as const,
      },
      {
        label: 'Win Rate',
        value: metrics.winRate,
        format: 'percentage' as const,
        trend: metrics.winRate > 50 ? 'up' as const : 'down' as const,
      },
      {
        label: 'Total Trades',
        value: metrics.totalTrades,
        format: 'number' as const,
        trend: 'neutral' as const,
      },
      {
        label: 'Average Gain',
        value: metrics.averageGain,
        format: 'percentage' as const,
        trend: metrics.averageGain > 0 ? 'up' as const : 'down' as const,
      },
      {
        label: 'Max Drawdown',
        value: metrics.maxDrawdown,
        format: 'percentage' as const,
        trend: metrics.maxDrawdown < -10 ? 'down' as const : 'up' as const,
      },
      {
        label: 'Sharpe Ratio',
        value: metrics.sharpeRatio,
        format: 'number' as const,
        trend: metrics.sharpeRatio > 1 ? 'up' as const : metrics.sharpeRatio > 0.5 ? 'neutral' as const : 'down' as const,
      }
    ];
  }

  /**
   * Get performance chart data
   */
  static async getPerformanceChartData(): Promise<Array<{
    date: string;
    value: number;
    label?: string;
  }>> {
    const { performanceData } = await this.loadData();

    return performanceData.map(point => ({
      date: point.dateString,
      value: point.cumulativeReturn,
      label: point.dateString
    }));
  }

  /**
   * Get benchmark chart data
   */
  static async getBenchmarkChartData(): Promise<Array<{
    date: string;
    value: number;
    label?: string;
  }>> {
    const { benchmarkData } = await this.loadData();

    return benchmarkData.map(point => ({
      date: point.dateString,
      value: point.cumulativeReturn,
      label: `S&P 500: ${point.cumulativeReturn.toFixed(1)}%`
    }));
  }

  /**
   * Get closed trades for trade journal
   */
  static async getClosedTrades(): Promise<Array<{
    id: string;
    symbol: string;
    type: 'LONG' | 'SHORT';
    entryPrice: number;
    exitPrice: number;
    pnl: number;
    return: number;
    entryDate: string;
    closedAt: string;
  }>> {
    const { trades } = await this.loadData();

    // Sort by exit date (most recent first) and take latest trades
    const sortedTrades = [...trades]
      .sort((a, b) => b.exitDate.getTime() - a.exitDate.getTime())
      .slice(0, 20); // Show last 20 trades

    return sortedTrades.map(trade => ({
      id: trade.id,
      symbol: trade.ticker,
      type: trade.position,
      entryPrice: trade.avgPrice,
      exitPrice: trade.exitPrice,
      pnl: Math.round(trade.portfolioImpact * 100) / 100, // Portfolio impact as PnL
      return: trade.pnlPercent,
      entryDate: trade.entryDate.toISOString().split('T')[0],
      closedAt: trade.exitDate.toISOString().split('T')[0]
    }));
  }

  /**
   * Get trade statistics for trade journal
   */
  static async getTradeStats(): Promise<KPIData[]> {
    const { metrics } = await this.loadData();

    return [
      {
        label: 'Total Trades',
        value: metrics.totalTrades,
        trend: 'neutral' as const,
        format: 'number' as const,
      },
      {
        label: 'Winning Trades',
        value: metrics.winningTrades,
        trend: 'up' as const,
        format: 'number' as const,
      },
      {
        label: 'Losing Trades',
        value: metrics.losingTrades,
        trend: 'down' as const,
        format: 'number' as const,
      },
      {
        label: 'Win Rate',
        value: metrics.winRate,
        trend: metrics.winRate > 50 ? 'up' as const : 'down' as const,
        format: 'percentage' as const,
      }
    ];
  }

  /**
   * Get statistics for specific period
   */
  static async getPeriodStatistics(period: '1m' | '3m' | '6m' | '1y' | '2y' | 'all'): Promise<{
    currentReturn: number;
    bestDay: number;
    worstDay: number;
    volatility: number;
    maxDrawdown: number;
    alpha: number;
    beta: number;
    totalTrades: number;
  }> {
    const { trades, performanceData, benchmarkData } = await this.loadData();

    // Calculate period start date
    const endDate = new Date();
    let startDate: Date;

    switch (period) {
      case '1m':
        startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '3m':
        startDate = new Date(endDate.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '6m':
        startDate = new Date(endDate.getTime() - 180 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(endDate.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      case '2y':
        startDate = new Date(endDate.getTime() - 730 * 24 * 60 * 60 * 1000);
        break;
      case 'all':
      default:
        startDate = trades.length > 0 ? trades[0].exitDate : new Date();
        break;
    }

    // Filter data for period
    const periodTrades = trades.filter(t => t.exitDate >= startDate && t.exitDate <= endDate);
    const periodPerformance = performanceData.filter(p => p.date >= startDate && p.date <= endDate);

    if (periodTrades.length === 0 || periodPerformance.length === 0) {
      return {
        currentReturn: 0,
        bestDay: 0,
        worstDay: 0,
        volatility: 0,
        maxDrawdown: 0,
        alpha: 0,
        beta: 1,
        totalTrades: 0
      };
    }

    // Calculate period metrics
    const periodMetrics = PerformanceCalculator.calculateMetrics(periodTrades);

    // Calculate daily stats
    const dailyReturns = periodPerformance.map(p => p.dailyReturn);
    const bestDay = Math.max(...dailyReturns);
    const worstDay = Math.min(...dailyReturns);

    // Calculate volatility
    const avgReturn = dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length;
    const variance = dailyReturns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / (dailyReturns.length - 1);
    const volatility = Math.sqrt(variance) * Math.sqrt(252); // Annualized

    // Simple alpha/beta calculation (would need benchmark comparison for accuracy)
    const alpha = periodMetrics.totalReturn - 10; // Assuming 10% benchmark return
    const beta = 1.0; // Simplified

    return {
      currentReturn: periodMetrics.totalReturn,
      bestDay,
      worstDay,
      volatility,
      maxDrawdown: periodMetrics.maxDrawdown,
      alpha,
      beta,
      totalTrades: periodTrades.length
    };
  }

  /**
   * Get comparison with benchmark
   */
  static async getBenchmarkComparison(): Promise<ComparisonMetrics | null> {
    try {
      const { metrics, performanceData, benchmarkData } = await this.loadData();

      if (benchmarkData.length === 0) {
        return null;
      }

      return PerformanceCalculator.calculateBenchmarkComparison(
        metrics,
        performanceData,
        benchmarkData
      );
    } catch (error) {
      console.error('Error calculating benchmark comparison:', error);
      return null;
    }
  }

  /**
   * Refresh data cache
   */
  static async refreshData(): Promise<void> {
    console.log('Refreshing trading data cache...');
    await this.loadData(true);
    console.log('Data cache refreshed successfully');
  }

  /**
   * Get data loading status
   */
  static getDataStatus(): {
    isLoaded: boolean;
    lastUpdated: Date | null;
    tradesCount: number;
  } {
    return {
      isLoaded: this.cachedData !== null,
      lastUpdated: this.cachedData?.lastUpdated || null,
      tradesCount: this.cachedData?.trades.length || 0
    };
  }

  /**
   * Export methods for backward compatibility with existing components
   */
  static async getMockStatistics() {
    const { metrics } = await this.loadData();
    return {
      totalReturn: metrics.totalReturn,
      winRate: metrics.winRate,
      totalTrades: metrics.totalTrades,
      averageGain: metrics.averageGain,
      averageLoss: metrics.averageLoss,
      period: 'YTD 2024',
      lastUpdated: new Date(),
    };
  }

  static async getMockKPIData() {
    return this.getKPIData();
  }

  static async getMockPerformanceChartData() {
    return this.getPerformanceChartData();
  }

  static async getMockBenchmarkChartData() {
    return this.getBenchmarkChartData();
  }

  static async getMockClosedTrades() {
    return this.getClosedTrades();
  }

  static async getMockTradeStats() {
    return this.getTradeStats();
  }
}