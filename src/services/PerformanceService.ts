// src/services/PerformanceService.ts
// Главный API для работы с performance метриками

import { ExcelProcessor, TradeRecord, BenchmarkPoint } from './ExcelProcessor';
import { PerformanceCalculator } from './PerformanceCalculator';

// Публичные типы для компонентов
export interface KPIMetric {
  label: string;
  value: number;
  format: 'percentage' | 'number' | 'currency';
  trend: 'up' | 'down' | 'neutral';
}

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface PortfolioMetrics {
  totalReturn: number;
  winRate: number;
  sharpeRatio: number;
  maxDrawdown: number;
  profitFactor: number;
  totalTrades: number;
  averageHoldingDays: number;
  bestTrade: number;
  worstTrade: number;
}

export interface ComparisonData {
  portfolio: PortfolioMetrics;
  benchmark: {
    totalReturn: number;
    sharpeRatio: number;
  };
  alpha: number;
  beta: number;
  outperformance: number;
}

// Кэш данных
interface CachedData {
  trades: TradeRecord[];
  benchmark: BenchmarkPoint[];
  metrics: PortfolioMetrics;
  timestamp: number;
}

export class PerformanceService {
  private static cache: CachedData | null = null;
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 минут

  /**
   * Получить KPI метрики для карточек
   */
  static async getKPIMetrics(): Promise<KPIMetric[]> {
    const { metrics } = await this.loadData();

    return [
      {
        label: 'Total Return',
        value: Math.round(metrics.totalReturn * 10) / 10,
        format: 'percentage',
        trend: metrics.totalReturn > 0 ? 'up' : 'down'
      },
      {
        label: 'Win Rate',
        value: Math.round(metrics.winRate * 10) / 10,
        format: 'percentage',
        trend: metrics.winRate > 50 ? 'up' : metrics.winRate > 40 ? 'neutral' : 'down'
      },
      {
        label: 'Sharpe Ratio',
        value: Math.round(metrics.sharpeRatio * 100) / 100,
        format: 'number',
        trend: metrics.sharpeRatio > 1 ? 'up' : metrics.sharpeRatio > 0.5 ? 'neutral' : 'down'
      },
      {
        label: 'Max Drawdown',
        value: Math.round(Math.abs(metrics.maxDrawdown) * 10) / 10,
        format: 'percentage',
        trend: Math.abs(metrics.maxDrawdown) < 10 ? 'up' : Math.abs(metrics.maxDrawdown) < 20 ? 'neutral' : 'down'
      },
      {
        label: 'Profit Factor',
        value: Math.round(metrics.profitFactor * 100) / 100,
        format: 'number',
        trend: metrics.profitFactor > 1.5 ? 'up' : metrics.profitFactor > 1 ? 'neutral' : 'down'
      }
    ];
  }

  /**
   * Получить данные для графика доходности
   */
  static async getPerformanceChart(): Promise<ChartDataPoint[]> {
    const { trades } = await this.loadData();

    const timeSeriesData = PerformanceCalculator.calculateTimeSeries(trades);

    return timeSeriesData.map(point => ({
      date: point.date.toISOString().split('T')[0],
      value: Math.round(point.cumulativeReturn * 100) / 100,
      label: `${point.cumulativeReturn.toFixed(1)}%`
    }));
  }

  /**
   * Получить данные сравнения с бенчмарком
   */
  static async getBenchmarkComparison(): Promise<{
    portfolioData: ChartDataPoint[];
    benchmarkData: ChartDataPoint[];
    comparison: ComparisonData;
  }> {
    const { trades, benchmark, metrics } = await this.loadData();

    // График портфеля
    const portfolioTimeSeries = PerformanceCalculator.calculateTimeSeries(trades);
    const portfolioData = portfolioTimeSeries.map(point => ({
      date: point.date.toISOString().split('T')[0],
      value: Math.round(point.cumulativeReturn * 100) / 100
    }));

    // График бенчмарка
    const benchmarkData = benchmark.map(point => ({
      date: point.date.toISOString().split('T')[0],
      value: Math.round(point.cumulativeReturn * 100) / 100
    }));

    // Сравнительные метрики
    const benchmarkMetrics = PerformanceCalculator.calculateBenchmarkMetrics(
      portfolioTimeSeries,
      benchmark
    );

    const comparison: ComparisonData = {
      portfolio: metrics,
      benchmark: {
        totalReturn: benchmarkData.length > 0 ? benchmarkData[benchmarkData.length - 1].value : 0,
        sharpeRatio: benchmarkMetrics.sharpeRatio
      },
      alpha: benchmarkMetrics.alpha,
      beta: benchmarkMetrics.beta,
      outperformance: metrics.totalReturn - (benchmarkData.length > 0 ? benchmarkData[benchmarkData.length - 1].value : 0)
    };

    return {
      portfolioData,
      benchmarkData,
      comparison
    };
  }

  /**
   * Получить детальную статистику трейдов
   */
  static async getTradeStatistics(): Promise<{
    totalTrades: number;
    winningTrades: number;
    losingTrades: number;
    averageGain: number;
    averageLoss: number;
    bestTrade: number;
    worstTrade: number;
    averageHoldingDays: number;
    maxConsecutiveWins: number;
    maxConsecutiveLosses: number;
    lastTradeDate: string;
  }> {
    const { trades, metrics } = await this.loadData();

    const winningTrades = trades.filter(t => t.pnlPercent > 0);
    const losingTrades = trades.filter(t => t.pnlPercent <= 0);

    const consecutiveStats = PerformanceCalculator.calculateConsecutiveWinLoss(trades);

    return {
      totalTrades: trades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      averageGain: winningTrades.length > 0 ?
        winningTrades.reduce((sum, t) => sum + t.pnlPercent, 0) / winningTrades.length : 0,
      averageLoss: losingTrades.length > 0 ?
        Math.abs(losingTrades.reduce((sum, t) => sum + t.pnlPercent, 0) / losingTrades.length) : 0,
      bestTrade: metrics.bestTrade,
      worstTrade: metrics.worstTrade,
      averageHoldingDays: metrics.averageHoldingDays,
      maxConsecutiveWins: consecutiveStats.maxWins,
      maxConsecutiveLosses: consecutiveStats.maxLosses,
      lastTradeDate: trades.length > 0 ?
        trades.sort((a, b) => b.exitDate.getTime() - a.exitDate.getTime())[0].exitDate.toISOString().split('T')[0] : ''
    };
  }

  /**
   * Принудительно обновить данные из Excel
   */
  static async refreshData(): Promise<void> {
    console.log('🔄 Force refreshing performance data...');
    this.cache = null;
    await this.loadData();
  }

  /**
   * Проверить статус загрузки данных
   */
  static getDataStatus(): {
    isLoaded: boolean;
    lastUpdate: Date | null;
    cacheAge: number;
  } {
    return {
      isLoaded: this.cache !== null,
      lastUpdate: this.cache ? new Date(this.cache.timestamp) : null,
      cacheAge: this.cache ? Date.now() - this.cache.timestamp : 0
    };
  }

  /**
   * Внутренний метод загрузки и кэширования данных
   */
  private static async loadData(): Promise<CachedData> {
    // Проверяем кэш
    if (this.cache && (Date.now() - this.cache.timestamp) < this.CACHE_DURATION) {
      console.log('📦 Using cached performance data');
      return this.cache;
    }

    try {
      console.log('📊 Loading fresh performance data...');

      // Загружаем данные из Excel
      const { trades, benchmark } = await ExcelProcessor.loadAllData();

      if (trades.length === 0) {
        throw new Error('No trading data loaded from Excel');
      }

      // Рассчитываем метрики
      const metrics = PerformanceCalculator.calculateAllMetrics(trades);

      // Сохраняем в кэш
      this.cache = {
        trades,
        benchmark,
        metrics,
        timestamp: Date.now()
      };

      console.log(`✅ Performance data loaded: ${trades.length} trades, ${benchmark.length} benchmark points`);
      console.log(`📈 Total Return: ${metrics.totalReturn.toFixed(1)}%, Win Rate: ${metrics.winRate.toFixed(1)}%`);

      return this.cache;

    } catch (error) {
      console.error('❌ Failed to load performance data:', error);

      // Если есть старый кэш, используем его
      if (this.cache) {
        console.warn('⚠️ Using stale cached data due to loading error');
        return this.cache;
      }

      throw new Error(`Failed to load performance data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Утилитный метод для форматирования значений
   */
  static formatValue(value: number, format: 'percentage' | 'number' | 'currency'): string {
    switch (format) {
      case 'percentage':
        return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
      case 'currency':
        return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      case 'number':
      default:
        return value.toFixed(2);
    }
  }
}