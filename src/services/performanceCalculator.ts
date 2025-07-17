// Performance Calculator - все расчеты метрик в одном месте
import {
  ProcessedTradeRecord,
  CalculatedMetrics,
  PortfolioPerformancePoint,
  BenchmarkDataPoint,
  ComparisonMetrics,
  CalculationOptions
} from '@/types/realData';

export class PerformanceCalculator {
  private static readonly STARTING_PORTFOLIO_VALUE = 1000000; // $1M
  private static readonly RISK_FREE_RATE = 0.05; // 5% annual

  /**
   * Главный метод - рассчитывает ВСЕ метрики портфеля
   */
  static calculateAllMetrics(
    trades: ProcessedTradeRecord[],
    benchmarkData: BenchmarkDataPoint[] = []
  ): CalculatedMetrics {
    if (trades.length === 0) {
      throw new Error('No trades provided for calculation');
    }

    console.log(`📊 Calculating metrics for ${trades.length} trades...`);

    // Сортируем трейды по дате выхода
    const sortedTrades = [...trades].sort((a, b) => a.exitDate.getTime() - b.exitDate.getTime());

    // Базовая статистика трейдов
    const totalTrades = sortedTrades.length;
    const winningTrades = sortedTrades.filter(t => t.pnlPercent > 0);
    const losingTrades = sortedTrades.filter(t => t.pnlPercent <= 0);
    const winRate = (winningTrades.length / totalTrades) * 100;

    // Считаем доходность портфеля
    const portfolioReturns = this.calculatePortfolioTimeSeries(sortedTrades);
    const totalReturn = portfolioReturns.length > 0 ? portfolioReturns[portfolioReturns.length - 1].cumulativeReturn : 0;

    // PnL статистика
    const winningPnL = winningTrades.map(t => t.pnlPercent);
    const losingPnL = losingTrades.map(t => t.pnlPercent);

    const averageGain = winningPnL.length > 0 ? winningPnL.reduce((a, b) => a + b, 0) / winningPnL.length : 0;
    const averageLoss = losingPnL.length > 0 ? losingPnL.reduce((a, b) => a + b, 0) / losingPnL.length : 0;

    const allPnL = sortedTrades.map(t => t.pnlPercent);
    const bestTrade = Math.max(...allPnL);
    const worstTrade = Math.min(...allPnL);

    // Расширенные метрики
    const averageHoldingDays = sortedTrades.reduce((sum, t) => sum + t.holdingDays, 0) / totalTrades;
    const averageExposure = sortedTrades.reduce((sum, t) => sum + t.portfolioExposure, 0) / totalTrades;

    // Риск-метрики
    const maxDrawdown = this.calculateMaxDrawdown(portfolioReturns);
    const sharpeRatio = this.calculateSharpeRatio(portfolioReturns);
    const volatility = this.calculateVolatility(portfolioReturns);

    // Торговые метрики
    const profitFactor = this.calculateProfitFactor(winningPnL, losingPnL);
    const expectancy = this.calculateExpectancy(winningPnL, losingPnL, winRate);
    const { maxConsecutiveWins, maxConsecutiveLosses } = this.calculateConsecutiveWinsLosses(sortedTrades);

    // Крупнейшие победы и поражения (в % от портфеля)
    const portfolioImpacts = sortedTrades.map(t => t.portfolioImpact);
    const largestWin = Math.max(...portfolioImpacts);
    const largestLoss = Math.min(...portfolioImpacts);

    // Период
    const startDate = sortedTrades[0].exitDate;
    const endDate = sortedTrades[sortedTrades.length - 1].exitDate;
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    const metrics: CalculatedMetrics = {
      totalReturn,
      winRate,
      totalTrades,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      averageGain,
      averageLoss,
      bestTrade,
      worstTrade,
      averageHoldingDays,
      maxDrawdown,
      sharpeRatio,
      profitFactor,
      expectancy,
      maxConsecutiveWins,
      maxConsecutiveLosses,
      largestWin,
      largestLoss,
      averageExposure: averageExposure * 100, // Конвертируем в проценты для отображения
      period: {
        startDate,
        endDate,
        totalDays
      }
    };

    console.log('📈 Portfolio Metrics:', {
      totalReturn: `${totalReturn.toFixed(1)}%`,
      winRate: `${winRate.toFixed(1)}%`,
      sharpeRatio: sharpeRatio.toFixed(2),
      maxDrawdown: `${maxDrawdown.toFixed(1)}%`,
      profitFactor: profitFactor.toFixed(2)
    });

    return metrics;
  }

  /**
   * Расчет временного ряда доходности портфеля
   */
  static calculatePortfolioTimeSeries(trades: ProcessedTradeRecord[]): PortfolioPerformancePoint[] {
    const returns: PortfolioPerformancePoint[] = [];
    let cumulativeReturn = 0;
    let portfolioValue = this.STARTING_PORTFOLIO_VALUE;

    // Группируем трейды по дням
    const tradesByDate = new Map<string, ProcessedTradeRecord[]>();
    trades.forEach(trade => {
      const dateKey = trade.exitDate.toISOString().split('T')[0];
      if (!tradesByDate.has(dateKey)) {
        tradesByDate.set(dateKey, []);
      }
      tradesByDate.get(dateKey)!.push(trade);
    });

    // Обрабатываем каждый день
    const sortedDates = Array.from(tradesByDate.keys()).sort();

    sortedDates.forEach(dateKey => {
      const dayTrades = tradesByDate.get(dateKey)!;

      // Суммируем impact всех трейдов за день
      const dailyImpact = dayTrades.reduce((sum, trade) => sum + trade.portfolioImpact, 0);
      const dailyReturn = dailyImpact; // portfolioImpact уже в процентах

      // Обновляем кумулятивную доходность
      cumulativeReturn += dailyReturn;
      portfolioValue = this.STARTING_PORTFOLIO_VALUE * (1 + cumulativeReturn / 100);

      // Считаем активные позиции (примерно)
      const activeTrades = dayTrades.length;
      const totalExposure = dayTrades.reduce((sum, trade) => sum + trade.portfolioExposure, 0);

      returns.push({
        date: new Date(dateKey),
        dateString: dateKey,
        cumulativeReturn: Math.round(cumulativeReturn * 100) / 100,
        dailyReturn: Math.round(dailyReturn * 100) / 100,
        portfolioValue: Math.round(portfolioValue * 100) / 100,
        activeTrades,
        totalExposure: Math.round(totalExposure * 100) / 100
      });
    });

    console.log(`📊 Generated ${returns.length} portfolio performance points`);
    return returns;
  }

  /**
   * Максимальная просадка (Max Drawdown)
   */
  static calculateMaxDrawdown(returns: PortfolioPerformancePoint[]): number {
    if (returns.length === 0) return 0;

    let maxDrawdown = 0;
    let peak = returns[0].portfolioValue;

    returns.forEach(point => {
      if (point.portfolioValue > peak) {
        peak = point.portfolioValue;
      } else {
        const drawdown = ((peak - point.portfolioValue) / peak) * 100;
        maxDrawdown = Math.max(maxDrawdown, drawdown);
      }
    });

    return Math.round(maxDrawdown * 100) / 100;
  }

  /**
   * Коэффициент Шарпа
   */
  static calculateSharpeRatio(returns: PortfolioPerformancePoint[]): number {
    if (returns.length < 2) return 0;

    const dailyReturns = returns.slice(1).map(point => point.dailyReturn);
    const avgDailyReturn = dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length;
    const volatility = this.calculateVolatility(returns);

    if (volatility === 0) return 0;

    // Annualized Sharpe ratio
    const annualizedReturn = avgDailyReturn * 252; // 252 trading days
    const annualizedVolatility = volatility * Math.sqrt(252);
    const sharpeRatio = (annualizedReturn - this.RISK_FREE_RATE * 100) / annualizedVolatility;

    return Math.round(sharpeRatio * 100) / 100;
  }

  /**
   * Коэффициент Сортино (только негативная волатильность)
   */
  static calculateSortinoRatio(returns: PortfolioPerformancePoint[]): number {
    if (returns.length < 2) return 0;

    const dailyReturns = returns.slice(1).map(point => point.dailyReturn);
    const avgDailyReturn = dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length;

    // Только негативные доходности для расчета downside deviation
    const negativeReturns = dailyReturns.filter(r => r < 0);

    if (negativeReturns.length === 0) return 999; // Очень высокое значение, если нет убытков

    const downsideDeviation = Math.sqrt(
      negativeReturns.reduce((sum, r) => sum + Math.pow(r, 2), 0) / negativeReturns.length
    );

    if (downsideDeviation === 0) return 999;

    // Annualized Sortino ratio
    const annualizedReturn = avgDailyReturn * 252;
    const annualizedDownsideDeviation = downsideDeviation * Math.sqrt(252);
    const sortinoRatio = (annualizedReturn - this.RISK_FREE_RATE * 100) / annualizedDownsideDeviation;

    return Math.round(sortinoRatio * 100) / 100;
  }

  /**
   * Волатильность (стандартное отклонение)
   */
  static calculateVolatility(returns: PortfolioPerformancePoint[]): number {
    if (returns.length < 2) return 0;

    const dailyReturns = returns.slice(1).map(point => point.dailyReturn);
    const avgReturn = dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length;

    const variance = dailyReturns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / (dailyReturns.length - 1);

    return Math.sqrt(variance);
  }

  /**
   * Profit Factor (валовая прибыль / валовый убыток)
   */
  static calculateProfitFactor(winningPnL: number[], losingPnL: number[]): number {
    const grossProfit = winningPnL.reduce((sum, p) => sum + p, 0);
    const grossLoss = Math.abs(losingPnL.reduce((sum, p) => sum + p, 0));

    if (grossLoss === 0) return grossProfit > 0 ? 999 : 1;

    return Math.round((grossProfit / grossLoss) * 100) / 100;
  }

  /**
   * Математическое ожидание (Expectancy)
   */
  static calculateExpectancy(winningPnL: number[], losingPnL: number[], winRate: number): number {
    const avgWin = winningPnL.length > 0 ? winningPnL.reduce((a, b) => a + b, 0) / winningPnL.length : 0;
    const avgLoss = losingPnL.length > 0 ? Math.abs(losingPnL.reduce((a, b) => a + b, 0) / losingPnL.length) : 0;
    const lossRate = 100 - winRate;

    const expectancy = (winRate / 100) * avgWin - (lossRate / 100) * avgLoss;

    return Math.round(expectancy * 100) / 100;
  }

  /**
   * Последовательные победы и поражения
   */
  static calculateConsecutiveWinsLosses(trades: ProcessedTradeRecord[]): {
    maxConsecutiveWins: number;
    maxConsecutiveLosses: number;
  } {
    let maxWins = 0;
    let maxLosses = 0;
    let currentWins = 0;
    let currentLosses = 0;

    trades.forEach(trade => {
      if (trade.pnlPercent > 0) {
        currentWins++;
        currentLosses = 0;
        maxWins = Math.max(maxWins, currentWins);
      } else {
        currentLosses++;
        currentWins = 0;
        maxLosses = Math.max(maxLosses, currentLosses);
      }
    });

    return { maxConsecutiveWins: maxWins, maxConsecutiveLosses: maxLosses };
  }

  /**
   * Сравнение с бенчмарком
   */
  static calculateBenchmarkComparison(
    portfolioMetrics: CalculatedMetrics,
    portfolioReturns: PortfolioPerformancePoint[],
    benchmarkData: BenchmarkDataPoint[]
  ): ComparisonMetrics {
    if (benchmarkData.length === 0) {
      // Fallback к историческим данным S&P 500
      return {
        portfolio: portfolioMetrics,
        benchmark: {
          totalReturn: 18.2, // Примерная годовая доходность S&P 500
          volatility: 16.5,
          sharpeRatio: 0.95,
          maxDrawdown: -8.2,
          period: portfolioMetrics.period
        },
        alpha: portfolioMetrics.totalReturn - 18.2,
        beta: 1.0,
        correlation: 0.7,
        trackingError: 8.0,
        informationRatio: (portfolioMetrics.totalReturn - 18.2) / 8.0,
        outperformance: portfolioMetrics.totalReturn - 18.2
      };
    }

    // Выравниваем данные по датам
    const alignedData = this.alignPortfolioAndBenchmark(portfolioReturns, benchmarkData);

    if (alignedData.length < 2) {
      console.warn('Insufficient aligned data for benchmark comparison');
      return this.calculateBenchmarkComparison(portfolioMetrics, portfolioReturns, []);
    }

    // Рассчитываем метрики бенчмарка
    const benchmarkTotalReturn = benchmarkData[benchmarkData.length - 1]?.cumulativeReturn || 0;
    const benchmarkReturns = alignedData.map(d => d.benchmarkReturn);
    const benchmarkVolatility = this.calculateVolatilityFromReturns(benchmarkReturns) * Math.sqrt(252);
    const benchmarkSharpe = this.calculateSharpeFromReturns(benchmarkReturns);

    // Метрики сравнения
    const portfolioReturnsAligned = alignedData.map(d => d.portfolioReturn);
    const correlation = this.calculateCorrelation(portfolioReturnsAligned, benchmarkReturns);
    const beta = this.calculateBeta(portfolioReturnsAligned, benchmarkReturns);
    const alpha = portfolioMetrics.totalReturn - (this.RISK_FREE_RATE * 100 + beta * (benchmarkTotalReturn - this.RISK_FREE_RATE * 100));

    const trackingError = this.calculateVolatilityFromReturns(
      alignedData.map(d => d.portfolioReturn - d.benchmarkReturn)
    ) * Math.sqrt(252);

    const informationRatio = trackingError === 0 ? 0 : (portfolioMetrics.totalReturn - benchmarkTotalReturn) / trackingError;

    return {
      portfolio: portfolioMetrics,
      benchmark: {
        totalReturn: Math.round(benchmarkTotalReturn * 10) / 10,
        volatility: Math.round(benchmarkVolatility * 10) / 10,
        sharpeRatio: Math.round(benchmarkSharpe * 100) / 100,
        maxDrawdown: this.calculateDrawdownFromBenchmark(benchmarkData),
        period: portfolioMetrics.period
      },
      alpha: Math.round(alpha * 10) / 10,
      beta: Math.round(beta * 100) / 100,
      correlation: Math.round(correlation * 100) / 100,
      trackingError: Math.round(trackingError * 10) / 10,
      informationRatio: Math.round(informationRatio * 100) / 100,
      outperformance: Math.round((portfolioMetrics.totalReturn - benchmarkTotalReturn) * 10) / 10
    };
  }

  /**
   * Утилитные методы для расчетов
   */
  private static alignPortfolioAndBenchmark(
    portfolioReturns: PortfolioPerformancePoint[],
    benchmarkData: BenchmarkDataPoint[]
  ): Array<{
    date: Date;
    portfolioReturn: number;
    benchmarkReturn: number;
  }> {
    const aligned: Array<{
      date: Date;
      portfolioReturn: number;
      benchmarkReturn: number;
    }> = [];

    const benchmarkMap = new Map(
      benchmarkData.map(b => [b.dateString, b])
    );

    portfolioReturns.forEach(portfolioPoint => {
      const benchmarkPoint = benchmarkMap.get(portfolioPoint.dateString);
      if (benchmarkPoint) {
        aligned.push({
          date: portfolioPoint.date,
          portfolioReturn: portfolioPoint.dailyReturn,
          benchmarkReturn: benchmarkPoint.change
        });
      }
    });

    return aligned.sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  private static calculateVolatilityFromReturns(returns: number[]): number {
    if (returns.length < 2) return 0;

    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / (returns.length - 1);

    return Math.sqrt(variance);
  }

  private static calculateSharpeFromReturns(returns: number[]): number {
    if (returns.length < 2) return 0;

    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const volatility = this.calculateVolatilityFromReturns(returns);

    if (volatility === 0) return 0;

    const annualizedReturn = avgReturn * 252;
    const annualizedVolatility = volatility * Math.sqrt(252);

    return (annualizedReturn - this.RISK_FREE_RATE * 100) / annualizedVolatility;
  }

  private static calculateCorrelation(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length < 2) return 0;

    const avgX = x.reduce((a, b) => a + b, 0) / x.length;
    const avgY = y.reduce((a, b) => a + b, 0) / y.length;

    const numerator = x.reduce((sum, xi, i) => sum + (xi - avgX) * (y[i] - avgY), 0);
    const denomX = Math.sqrt(x.reduce((sum, xi) => sum + Math.pow(xi - avgX, 2), 0));
    const denomY = Math.sqrt(y.reduce((sum, yi) => sum + Math.pow(yi - avgY, 2), 0));

    return denomX === 0 || denomY === 0 ? 0 : numerator / (denomX * denomY);
  }

  private static calculateBeta(portfolioReturns: number[], benchmarkReturns: number[]): number {
    if (portfolioReturns.length !== benchmarkReturns.length || portfolioReturns.length < 2) return 1;

    const benchmarkVariance = this.calculateVolatilityFromReturns(benchmarkReturns) ** 2;
    if (benchmarkVariance === 0) return 1;

    const covariance = this.calculateCovariance(portfolioReturns, benchmarkReturns);
    return covariance / benchmarkVariance;
  }

  private static calculateCovariance(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length < 2) return 0;

    const avgX = x.reduce((a, b) => a + b, 0) / x.length;
    const avgY = y.reduce((a, b) => a + b, 0) / y.length;

    return x.reduce((sum, xi, i) => sum + (xi - avgX) * (y[i] - avgY), 0) / x.length;
  }

  private static calculateDrawdownFromBenchmark(benchmarkData: BenchmarkDataPoint[]): number {
    if (benchmarkData.length === 0) return -8.2; // Historical S&P 500 typical max drawdown

    let maxDrawdown = 0;
    let peak = benchmarkData[0].value;

    benchmarkData.forEach(point => {
      if (point.value > peak) {
        peak = point.value;
      } else {
        const drawdown = ((peak - point.value) / peak) * 100;
        maxDrawdown = Math.max(maxDrawdown, drawdown);
      }
    });

    return -Math.round(maxDrawdown * 10) / 10;
  }
}