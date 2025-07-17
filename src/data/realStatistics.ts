// Замените содержимое файла src/data/realStatistics.ts на этот код:

// Real Statistics - упрощенный главный интерфейс для Performance секции
import { ExcelDataProcessor } from '@/services/ExcelDataProcessor';
import { PerformanceCalculator } from '@/services/PerformanceCalculator';
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

  /**
   * Главная загрузка всех данных
   */
  static async loadData(forceRefresh: boolean = false): Promise<{
    trades: ProcessedTradeRecord[];
    metrics: CalculatedMetrics;
    performanceData: PortfolioPerformancePoint[];
    benchmarkData: BenchmarkDataPoint[];
    comparisonMetrics: ComparisonMetrics | null;
  }> {
    // Проверяем кэш
    if (!forceRefresh && this.cachedData &&
        Date.now() - this.cachedData.lastUpdated.getTime() < this.CACHE_DURATION) {
      console.log('📦 Using cached data');
      return this.cachedData;
    }

    try {
      console.log('🔄 Loading fresh data from Excel files...');

      // 1. Загружаем данные из Excel
      const { trades, benchmarkData } = await ExcelDataProcessor.loadAllData();

      if (trades.length === 0) {
        throw new Error('No valid trades loaded from Excel');
      }

      // 2. Рассчитываем метрики портфеля
      const metrics = PerformanceCalculator.calculateAllMetrics(trades, benchmarkData);

      // 3. Строим временной ряд доходности
      const performanceData = PerformanceCalculator.calculatePortfolioTimeSeries(trades);

      // 4. Сравниваем с бенчмарком
      const comparisonMetrics = benchmarkData.length > 0
        ? PerformanceCalculator.calculateBenchmarkComparison(metrics, performanceData, benchmarkData)
        : null;

      // 5. Кэшируем результат
      this.cachedData = {
        trades,
        metrics,
        performanceData,
        benchmarkData,
        comparisonMetrics,
        lastUpdated: new Date()
      };

      console.log('✅ Data loaded successfully:', {
        trades: trades.length,
        performancePoints: performanceData.length,
        benchmarkPoints: benchmarkData.length,
        totalReturn: `${metrics.totalReturn.toFixed(1)}%`,
        winRate: `${metrics.winRate.toFixed(1)}%`
      });

      return this.cachedData;

    } catch (error) {
      console.error('❌ Error loading data:', error);
      throw error;
    }
  }

  /**
   * KPI данные для карточек метрик
   */
  static async getKPIData(): Promise<KPIData[]> {
    const { metrics, performanceData } = await this.loadData();

    // Рассчитываем Sortino Ratio
    const sortinoRatio = PerformanceCalculator.calculateSortinoRatio(performanceData);

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
        value: Math.round(metrics.sharpeRatio * 100) / 100,
        format: 'number' as const,
        trend: metrics.sharpeRatio > 1 ? 'up' as const : metrics.sharpeRatio > 0.5 ? 'neutral' as const : 'down' as const,
      },
      {
        label: 'Sortino Ratio',
        value: Math.round(sortinoRatio * 100) / 100,
        format: 'number' as const,
        trend: sortinoRatio > 1.5 ? 'up' as const : sortinoRatio > 1 ? 'neutral' as const : 'down' as const,
      },
      {
        label: 'Profit Factor',
        value: Math.round(metrics.profitFactor * 100) / 100,
        format: 'number' as const,
        trend: metrics.profitFactor > 1.5 ? 'up' as const : metrics.profitFactor > 1 ? 'neutral' as const : 'down' as const,
      },
    ];
  }

  /**
   * Данные для графика доходности портфеля
   */
  static async getPerformanceChartData(): Promise<Array<{
    date: string;
    value: number;
    label?: string;
  }>> {
    const { performanceData } = await this.loadData();

    return performanceData.map(point => ({
      date: point.dateString,
      value: Math.round(point.cumulativeReturn * 10) / 10,
      label: `Portfolio: ${Math.round(point.cumulativeReturn * 10) / 10}%`
    }));
  }

  /**
   * Данные для графика бенчмарка (S&P 500)
   */
  static async getBenchmarkChartData(): Promise<Array<{
    date: string;
    value: number;
    label?: string;
  }>> {
    const { benchmarkData } = await this.loadData();

    if (benchmarkData.length === 0) {
      return [];
    }

    return benchmarkData.map(point => ({
      date: point.dateString,
      value: Math.round(point.cumulativeReturn * 10) / 10,
      label: `S&P 500: ${Math.round(point.cumulativeReturn * 10) / 10}%`
    }));
  }

  /**
   * Закрытые трейды для журнала
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

    // Берем последние 20 трейдов
    const recentTrades = trades
      .sort((a, b) => b.exitDate.getTime() - a.exitDate.getTime())
      .slice(0, 20);

    return recentTrades.map(trade => {
      // P&L в долларах от $1M портфеля
      const portfolioPnL = (trade.portfolioImpact / 100) * 1000000; // $1M base

      return {
        id: trade.id,
        symbol: trade.ticker,
        type: trade.position,
        entryPrice: Math.round(trade.avgPrice * 100) / 100,
        exitPrice: Math.round(trade.exitPrice * 100) / 100,
        pnl: Math.round(portfolioPnL * 100) / 100, // В долларах
        return: Math.round(trade.pnlPercent * 10) / 10, // В процентах
        entryDate: trade.entryDate.toISOString().split('T')[0],
        closedAt: trade.exitDate.toISOString().split('T')[0]
      };
    });
  }

  /**
   * Статистика по трейдам для журнала
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
        label: 'Average Gain',
        value: Math.round(metrics.averageGain * 10) / 10,
        trend: metrics.averageGain > 0 ? 'up' as const : 'down' as const,
        format: 'percentage' as const,
      },
      {
        label: 'Average Loss',
        value: Math.round(Math.abs(metrics.averageLoss) * 10) / 10,
        trend: 'down' as const,
        format: 'percentage' as const,
      },
    ];
  }

  /**
   * Статистика по периодам
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
    const { metrics, performanceData, comparisonMetrics } = await this.loadData();

    // Фильтруем данные по периоду (упрощенно - пока возвращаем полные данные)
    // TODO: Добавить реальную фильтрацию по периодам
    const filteredData = performanceData; // Пока без фильтрации

    const dailyReturns = filteredData.slice(1).map(p => p.dailyReturn);
    const bestDay = dailyReturns.length > 0 ? Math.max(...dailyReturns) : 0;
    const worstDay = dailyReturns.length > 0 ? Math.min(...dailyReturns) : 0;
    const volatility = PerformanceCalculator.calculateVolatility(filteredData) * Math.sqrt(252); // Annualized

    return {
      currentReturn: metrics.totalReturn,
      bestDay: Math.round(bestDay * 100) / 100,
      worstDay: Math.round(worstDay * 100) / 100,
      volatility: Math.round(volatility * 100) / 100,
      maxDrawdown: metrics.maxDrawdown,
      alpha: comparisonMetrics?.alpha || 0,
      beta: comparisonMetrics?.beta || 1.0,
      totalTrades: metrics.totalTrades
    };
  }

  /**
   * Обновление кэша данных
   */
  static async refreshData(): Promise<void> {
    console.log('🔄 Refreshing data cache...');
    await this.loadData(true);
    console.log('✅ Data cache refreshed successfully');
  }

  /**
   * Статус загрузки данных
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

  // ========================================
  // МЕТОДЫ ОБРАТНОЙ СОВМЕСТИМОСТИ (Mock)
  // ========================================

  /**
   * Для обратной совместимости со старыми компонентами
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