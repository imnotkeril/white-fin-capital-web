// Real statistics service using actual trading data
import { DataParser } from '@/services/dataParser';
import { PerformanceCalculator } from '@/services/performanceCalculator';
import { BenchmarkService } from '@/services/benchmarkService';
import { PortfolioValidation } from '@/utils/portfolioValidation';
import {
  ProcessedTradeRecord,
  CalculatedMetrics,
  PortfolioPerformancePoint,
  BenchmarkDataPoint,
  ComparisonMetrics
} from '@/types/realData';
import { KPIData } from '@/types';

export class RealStatistics {
  private static cachedData: {
    trades: ProcessedTradeRecord[];
    metrics: CalculatedMetrics;
    performanceData: PortfolioPerformancePoint[];
    benchmarkData: BenchmarkDataPoint[];
    comparisonMetrics: ComparisonMetrics | null;
    lastUpdated: Date;
  } | null = null;

  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private static readonly STARTING_PORTFOLIO_VALUE = 1000000; // $1M base

  /**
   * Load and process all trading data
   */
  static async loadData(forceRefresh: boolean = false): Promise<{
    trades: ProcessedTradeRecord[];
    metrics: CalculatedMetrics;
    performanceData: PortfolioPerformancePoint[];
    benchmarkData: BenchmarkDataPoint[];
    comparisonMetrics: ComparisonMetrics | null;
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

      const validation = PortfolioValidation.validateExposures(trades);
      if (!validation.isValid) {
        console.warn('🚨 Portfolio Issues:', validation.warnings);
        console.warn('📝 Recommendations:', validation.recommendations);
      }

      const drawdownValidation = PortfolioValidation.validateDrawdowns(trades);
      if (drawdownValidation.warnings.length > 0) {
        console.warn('⚠️ Drawdown Issues:', drawdownValidation.warnings);
      }

      console.log(`📊 Total Portfolio Exposure: ${(validation.totalExposure * 100).toFixed(1)}%`);
      console.log(`📉 Max Position Drawdown: ${drawdownValidation.maxPositionDrawdown.toFixed(2)}%`);

      // Calculate portfolio performance over time with $1M base
      const performanceData = PerformanceCalculator.calculatePortfolioReturns(trades, this.STARTING_PORTFOLIO_VALUE);

      // Get benchmark data for the same period
      const startDate = new Date(Math.min(...trades.map(t => t.entryDate.getTime())));
      const endDate = new Date(Math.max(...trades.map(t => t.exitDate.getTime())));
      const benchmarkData = await BenchmarkService.getSP500Data(startDate, endDate);

      // Calculate performance metrics
      const metrics = PerformanceCalculator.calculateMetrics(trades, {
        startingPortfolioValue: this.STARTING_PORTFOLIO_VALUE,
        riskFreeRate: 0.05,
        benchmarkData,
        includeBenchmarkComparison: true
      });

      // Calculate comparison metrics with S&P 500
      let comparisonMetrics: ComparisonMetrics | null = null;
      if (benchmarkData.length > 0) {
        comparisonMetrics = PerformanceCalculator.calculateBenchmarkComparison(
          metrics,
          performanceData,
          benchmarkData
        );
      }

      console.log('Data loading completed successfully');
      console.log('Portfolio metrics:', {
        totalReturn: `${metrics.totalReturn.toFixed(1)}%`,
        winRate: `${metrics.winRate.toFixed(1)}%`,
        totalTrades: metrics.totalTrades,
        averageGain: `${metrics.averageGain.toFixed(1)}%`,
        averageLoss: `${metrics.averageLoss.toFixed(1)}%`,
        alpha: comparisonMetrics?.alpha.toFixed(1),
        beta: comparisonMetrics?.beta.toFixed(2)
      });

      // Cache the result
      this.cachedData = {
        trades,
        metrics,
        performanceData,
        benchmarkData,
        comparisonMetrics,
        lastUpdated: new Date()
      };

      return this.cachedData;

    } catch (error) {
      console.error('Error loading real trading data:', error);
      throw error;
    }
  }

  /**
   * Get KPI data for dashboard - ОБНОВЛЕНО: добавлен Profit Factor (5 карточек)
   */
  static async getKPIData(): Promise<KPIData[]> {
    const { metrics, performanceData } = await this.loadData();

    // Calculate Sortino Ratio (using downside deviation)
    const dailyReturns = performanceData.map(p => p.dailyReturn);
    const avgDailyReturn = dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length;

    const targetReturn = 0;
    const downsideReturns = dailyReturns.filter(r => r < targetReturn);
    const downsideVariance = downsideReturns.length > 0
      ? downsideReturns.reduce((sum, ret) => sum + Math.pow(ret - targetReturn, 2), 0) / downsideReturns.length
      : 0;
    const downsideDeviation = Math.sqrt(downsideVariance) * Math.sqrt(252);

    const riskFreeRate = 5; // 5% annual
    const annualizedReturn = avgDailyReturn * 252;
    const sortinoRatio = downsideDeviation === 0 ? 0 : (annualizedReturn - riskFreeRate) / downsideDeviation;

    return [
      {
        label: 'Total Return',
        value: Math.round(metrics.totalReturn * 10) / 10,
        format: 'percentage' as const,
        trend: metrics.totalReturn > 0 ? 'up' as const : 'down' as const,
      },
      {
        label: 'Win Rate',
        value: Math.round(metrics.winRate * 10) / 10,
        format: 'percentage' as const,
        trend: metrics.winRate > 50 ? 'up' as const : 'down' as const,
      },
      {
        label: 'Sharpe Ratio',
        value: Math.round(metrics.sharpeRatio * 100) / 100, // 2 decimal places
        format: 'number' as const,
        trend: metrics.sharpeRatio > 1 ? 'up' as const : metrics.sharpeRatio > 0.5 ? 'neutral' as const : 'down' as const,
      },
      {
        label: 'Sortino Ratio',
        value: Math.round(sortinoRatio * 100) / 100, // 2 decimal places
        format: 'number' as const,
        trend: sortinoRatio > 1.5 ? 'up' as const : sortinoRatio > 1 ? 'neutral' as const : 'down' as const,
      },
      {
        label: 'Profit Factor',
        value: Math.round(metrics.profitFactor * 100) / 100, // 2 decimal places
        format: 'number' as const,
        trend: metrics.profitFactor > 1.5 ? 'up' as const : metrics.profitFactor > 1 ? 'neutral' as const : 'down' as const,
      },
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
      value: Math.round(point.cumulativeReturn * 10) / 10, // Округление
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
      value: Math.round(point.cumulativeReturn * 10) / 10, // Округление
      label: `S&P 500: ${(Math.round(point.cumulativeReturn * 10) / 10).toFixed(1)}%`
    }));
  }

  /**
   * Get closed trades for trade journal - ИСПРАВЛЕНО: P&L от $1M
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

    return sortedTrades.map(trade => {
      // Рассчитываем P&L от $1M портфеля
      const portfolioPnL = (trade.portfolioImpact / 100) * this.STARTING_PORTFOLIO_VALUE;

      return {
        id: trade.id,
        symbol: trade.ticker,
        type: trade.position,
        entryPrice: Math.round(trade.avgPrice * 100) / 100,
        exitPrice: Math.round(trade.exitPrice * 100) / 100,
        pnl: Math.round(portfolioPnL * 100) / 100, // P&L в долларах от $1M
        return: Math.round(trade.pnlPercent * 10) / 10, // Округление до 1 знака
        entryDate: trade.entryDate.toISOString().split('T')[0],
        closedAt: trade.exitDate.toISOString().split('T')[0]
      };
    });
  }

  /**
   * Get trade statistics for trade journal - ОБНОВЛЕНО: добавлены Average Gain/Loss
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
        value: Math.round(metrics.winRate * 10) / 10,
        trend: metrics.winRate > 50 ? 'up' as const : 'down' as const,
        format: 'percentage' as const,
      },
      {
        label: 'Average Gain',
        value: Math.round(metrics.averageGain * 10) / 10,
        format: 'percentage' as const,
        trend: metrics.averageGain > 0 ? 'up' as const : 'down' as const,
      },
      {
        label: 'Average Loss',
        value: Math.round(metrics.averageLoss * 10) / 10,
        format: 'percentage' as const,
        trend: metrics.averageLoss > -5 ? 'up' as const : 'down' as const,
      }
    ];
  }

  /**
   * Get period statistics with proper alpha/beta calculation - ОБНОВЛЕНО: убран '1m' период
   */
  static async getPeriodStatistics(period: '3m' | '6m' | '1y' | '2y' | 'all'): Promise<{
    currentReturn: number;
    bestDay: number;
    worstDay: number;
    volatility: number;
    maxDrawdown: number;
    alpha: number;
    beta: number;
    totalTrades: number;
  }> {
    const { trades, performanceData, comparisonMetrics } = await this.loadData();

    // Filter trades by period
    const now = new Date();
    let periodStart: Date;

    switch (period) {
      case '3m':
        periodStart = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '6m':
        periodStart = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        periodStart = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      case '2y':
        periodStart = new Date(now.getTime() - 730 * 24 * 60 * 60 * 1000);
        break;
      default:
        periodStart = new Date(Math.min(...trades.map(t => t.entryDate.getTime())));
    }

    const periodTrades = trades.filter(t => t.exitDate >= periodStart);
    const periodPerformance = performanceData.filter(p => p.date >= periodStart);

    // Calculate period metrics
    const periodMetrics = PerformanceCalculator.calculateMetrics(periodTrades, {
      startingPortfolioValue: this.STARTING_PORTFOLIO_VALUE,
      riskFreeRate: 0.05,
      includeBenchmarkComparison: false
    });

    // Calculate volatility from daily returns
    const dailyReturns = periodPerformance.map(p => p.dailyReturn);
    const avgDailyReturn = dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length;
    const variance = dailyReturns.reduce((sum, ret) => sum + Math.pow(ret - avgDailyReturn, 2), 0) / (dailyReturns.length - 1);
    const volatility = Math.sqrt(variance) * Math.sqrt(252); // Annualized

    // Best and worst day
    const bestDay = Math.max(...dailyReturns);
    const worstDay = Math.min(...dailyReturns);

    // Use real alpha/beta from comparison metrics
    const alpha = comparisonMetrics?.alpha || 0;
    const beta = comparisonMetrics?.beta || 1.0;

    return {
      currentReturn: Math.round(periodMetrics.totalReturn * 10) / 10,
      bestDay: Math.round(bestDay * 10) / 10,
      worstDay: Math.round(worstDay * 10) / 10,
      volatility: Math.round(volatility * 10) / 10,
      maxDrawdown: Math.round(periodMetrics.maxDrawdown * 10) / 10,
      alpha: Math.round(alpha * 10) / 10,
      beta: Math.round(beta * 100) / 100, // Beta с точностью до 2 знаков
      totalTrades: periodTrades.length
    };
  }

  /**
   * Get comparison with benchmark
   */
  static async getBenchmarkComparison(): Promise<ComparisonMetrics | null> {
    try {
      const { comparisonMetrics } = await this.loadData();
      return comparisonMetrics;
    } catch (error) {
      console.error('Error getting benchmark comparison:', error);
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
      totalReturn: Math.round(metrics.totalReturn * 10) / 10,
      winRate: Math.round(metrics.winRate * 10) / 10,
      totalTrades: metrics.totalTrades,
      averageGain: Math.round(metrics.averageGain * 10) / 10,
      averageLoss: Math.round(metrics.averageLoss * 10) / 10,
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