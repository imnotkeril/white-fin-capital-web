// src/services/performanceCalculator.ts - ИСПРАВЛЕН расчет доходности
import { TradeRecord, BenchmarkPoint } from './ExcelProcessor';

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
  volatility: number;
  expectancy: number;
}

export interface TimeSeriesPoint {
  date: Date;
  cumulativeReturn: number;
  dailyReturn: number;
  portfolioValue: number;
}

export class PerformanceCalculator {
  private static readonly STARTING_PORTFOLIO = 1_000_000; // $1M
  private static readonly RISK_FREE_RATE = 0.05; // 5% annually

  /**
   * ✅ ИСПРАВЛЕННЫЙ расчет метрик портфеля
   */
  static calculateAllMetrics(trades: TradeRecord[]): PortfolioMetrics {
    if (trades.length === 0) {
      throw new Error('No trades provided for calculation');
    }

    console.log(`📊 Calculating metrics for ${trades.length} trades...`);

    // Сортируем трейды по дате выхода
    const sortedTrades = [...trades].sort((a, b) => a.exitDate.getTime() - b.exitDate.getTime());

    // Базовая статистика
    const totalTrades = sortedTrades.length;
    const winningTrades = sortedTrades.filter(t => t.pnlPercent > 0);
    const losingTrades = sortedTrades.filter(t => t.pnlPercent <= 0);
    const winRate = (winningTrades.length / totalTrades) * 100;

    // PnL статистика (уже в процентах)
    const allPnL = sortedTrades.map(t => t.pnlPercent);
    const bestTrade = Math.max(...allPnL);
    const worstTrade = Math.min(...allPnL);

    // ✅ ИСПРАВЛЕНИЕ: Правильный расчет временного ряда
    const timeSeries = this.calculateTimeSeries(sortedTrades);
    const totalReturn = timeSeries.length > 0 ? timeSeries[timeSeries.length - 1].cumulativeReturn : 0;

    // Риск-метрики
    const maxDrawdown = this.calculateMaxDrawdown(timeSeries);
    const sharpeRatio = this.calculateSharpeRatio(timeSeries);
    const volatility = this.calculateVolatility(timeSeries);

    // Торговые метрики
    const profitFactor = this.calculateProfitFactor(winningTrades, losingTrades);
    const expectancy = this.calculateExpectancy(winningTrades, losingTrades, winRate);

    // Средние значения
    const averageHoldingDays = sortedTrades.reduce((sum, t) => sum + t.holdingDays, 0) / totalTrades;

    const metrics: PortfolioMetrics = {
      totalReturn,
      winRate,
      sharpeRatio,
      maxDrawdown,
      profitFactor,
      totalTrades,
      averageHoldingDays,
      bestTrade,
      worstTrade,
      volatility,
      expectancy
    };

    console.log(`✅ Metrics calculated: Return ${totalReturn.toFixed(1)}%, Win Rate ${winRate.toFixed(1)}%`);

    return metrics;
  }

  /**
   * ✅ ИСПРАВЛЕННЫЙ расчет временного ряда доходности
   */
  static calculateTimeSeries(trades: TradeRecord[]): TimeSeriesPoint[] {
    if (trades.length === 0) return [];

    const timeSeries: TimeSeriesPoint[] = [];
    let portfolioValue = this.STARTING_PORTFOLIO;

    // Группируем трейды по дням
    const tradesByDate = new Map<string, TradeRecord[]>();
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

      // ✅ ИСПРАВЛЕНИЕ: Правильный расчет дневной доходности
      // portfolioImpact уже в долях (влияние на портфель)
      const dailyReturn = dayTrades.reduce((sum, trade) => {
        return sum + trade.portfolioImpact; // Уже в долях
      }, 0);

      // Обновляем значения портфеля
      portfolioValue *= (1 + dailyReturn); // dailyReturn уже в долях
      const cumulativeReturn = ((portfolioValue - this.STARTING_PORTFOLIO) / this.STARTING_PORTFOLIO) * 100;

      timeSeries.push({
        date: new Date(dateKey),
        cumulativeReturn,
        dailyReturn: dailyReturn * 100, // Конвертируем в проценты для отображения
        portfolioValue
      });

      console.log(`${dateKey}: Daily return ${(dailyReturn * 100).toFixed(2)}%, Cumulative ${cumulativeReturn.toFixed(2)}%`);
    });

    return timeSeries;
  }

  /**
   * Расчет максимальной просадки
   */
  static calculateMaxDrawdown(timeSeries: TimeSeriesPoint[]): number {
    if (timeSeries.length === 0) return 0;

    let maxDrawdown = 0;
    let peak = timeSeries[0].portfolioValue;

    timeSeries.forEach(point => {
      if (point.portfolioValue > peak) {
        peak = point.portfolioValue;
      } else {
        const drawdown = ((peak - point.portfolioValue) / peak) * 100;
        maxDrawdown = Math.max(maxDrawdown, drawdown);
      }
    });

    return -maxDrawdown; // Возвращаем как отрицательное значение
  }

  /**
   * Расчет коэффициента Шарпа
   */
  static calculateSharpeRatio(timeSeries: TimeSeriesPoint[]): number {
    if (timeSeries.length < 2) return 0;

    const dailyReturns = timeSeries.slice(1).map(point => point.dailyReturn / 100); // В долях
    const avgDailyReturn = dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length;

    // Волатильность
    const variance = dailyReturns.reduce((sum, r) =>
      sum + Math.pow(r - avgDailyReturn, 2), 0) / (dailyReturns.length - 1);
    const dailyVolatility = Math.sqrt(variance);

    if (dailyVolatility === 0) return 0;

    // Аннуализированные значения
    const annualizedReturn = avgDailyReturn * 252 * 100; // В процентах
    const annualizedVolatility = dailyVolatility * Math.sqrt(252) * 100; // В процентах
    const riskFreeRate = this.RISK_FREE_RATE * 100;

    return (annualizedReturn - riskFreeRate) / annualizedVolatility;
  }

  /**
   * Расчет волатильности (годовая)
   */
  static calculateVolatility(timeSeries: TimeSeriesPoint[]): number {
    if (timeSeries.length < 2) return 0;

    const dailyReturns = timeSeries.slice(1).map(point => point.dailyReturn / 100); // В долях
    const avgReturn = dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length;

    const variance = dailyReturns.reduce((sum, r) =>
      sum + Math.pow(r - avgReturn, 2), 0) / (dailyReturns.length - 1);

    return Math.sqrt(variance) * Math.sqrt(252) * 100; // Аннуализируем и в процентах
  }

  /**
   * Расчет Profit Factor
   */
  static calculateProfitFactor(winningTrades: TradeRecord[], losingTrades: TradeRecord[]): number {
    const grossProfit = winningTrades.reduce((sum, t) => sum + t.pnlPercent, 0);
    const grossLoss = Math.abs(losingTrades.reduce((sum, t) => sum + t.pnlPercent, 0));

    if (grossLoss === 0) return grossProfit > 0 ? 999 : 1;

    return grossProfit / grossLoss;
  }

  /**
   * Расчет математического ожидания
   */
  static calculateExpectancy(winningTrades: TradeRecord[], losingTrades: TradeRecord[], winRate: number): number {
    const avgWin = winningTrades.length > 0 ?
      winningTrades.reduce((sum, t) => sum + t.pnlPercent, 0) / winningTrades.length : 0;

    const avgLoss = losingTrades.length > 0 ?
      Math.abs(losingTrades.reduce((sum, t) => sum + t.pnlPercent, 0) / losingTrades.length) : 0;

    const lossRate = 100 - winRate;

    return (winRate / 100) * avgWin - (lossRate / 100) * avgLoss;
  }

  /**
   * Расчет последовательных побед/поражений
   */
  static calculateConsecutiveWinLoss(trades: TradeRecord[]): { maxWins: number; maxLosses: number } {
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

    return { maxWins, maxLosses };
  }

  /**
   * Сравнение с бенчмарком - расчет Alpha/Beta
   */
  static calculateBenchmarkMetrics(
    portfolioTimeSeries: TimeSeriesPoint[],
    benchmarkData: BenchmarkPoint[]
  ): { alpha: number; beta: number; correlation: number; sharpeRatio: number } {
    if (portfolioTimeSeries.length === 0 || benchmarkData.length === 0) {
      return { alpha: 0, beta: 1, correlation: 0, sharpeRatio: 0 };
    }

    // Выравниваем данные по датам
    const alignedData = this.alignDataByDates(portfolioTimeSeries, benchmarkData);

    if (alignedData.length < 2) {
      return { alpha: 0, beta: 1, correlation: 0, sharpeRatio: 0 };
    }

    const portfolioReturns = alignedData.map(d => d.portfolioReturn);
    const benchmarkReturns = alignedData.map(d => d.benchmarkReturn);

    // Статистические расчеты
    const correlation = this.calculateCorrelation(portfolioReturns, benchmarkReturns);
    const beta = this.calculateBeta(portfolioReturns, benchmarkReturns);

    // Alpha = Portfolio Return - (Risk Free Rate + Beta * (Benchmark Return - Risk Free Rate))
    const portfolioAnnualReturn = portfolioTimeSeries[portfolioTimeSeries.length - 1].cumulativeReturn;
    const benchmarkAnnualReturn = benchmarkData[benchmarkData.length - 1].cumulativeReturn;
    const riskFreeRate = this.RISK_FREE_RATE * 100;

    const alpha = portfolioAnnualReturn - (riskFreeRate + beta * (benchmarkAnnualReturn - riskFreeRate));

    // Sharpe ratio бенчмарка
    const benchmarkSharpe = this.calculateBenchmarkSharpe(benchmarkReturns);

    return {
      alpha,
      beta,
      correlation,
      sharpeRatio: benchmarkSharpe
    };
  }

  /**
   * Утилитные методы для статистических расчетов
   */
  private static alignDataByDates(
    portfolioData: TimeSeriesPoint[],
    benchmarkData: BenchmarkPoint[]
  ): Array<{ portfolioReturn: number; benchmarkReturn: number }> {
    const aligned: Array<{ portfolioReturn: number; benchmarkReturn: number }> = [];

    const benchmarkMap = new Map(
      benchmarkData.map(b => [b.date.toISOString().split('T')[0], b.change])
    );

    portfolioData.forEach(portfolioPoint => {
      const dateKey = portfolioPoint.date.toISOString().split('T')[0];
      const benchmarkReturn = benchmarkMap.get(dateKey);

      if (benchmarkReturn !== undefined) {
        aligned.push({
          portfolioReturn: portfolioPoint.dailyReturn / 100, // В долях
          benchmarkReturn: benchmarkReturn / 100 // В долях
        });
      }
    });

    return aligned;
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

    const benchmarkVar = this.calculateVariance(benchmarkReturns);
    if (benchmarkVar === 0) return 1;

    const covariance = this.calculateCovariance(portfolioReturns, benchmarkReturns);
    return covariance / benchmarkVar;
  }

  private static calculateVariance(values: number[]): number {
    if (values.length < 2) return 0;

    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    return values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / values.length;
  }

  private static calculateCovariance(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length < 2) return 0;

    const avgX = x.reduce((a, b) => a + b, 0) / x.length;
    const avgY = y.reduce((a, b) => a + b, 0) / y.length;

    return x.reduce((sum, xi, i) => sum + (xi - avgX) * (y[i] - avgY), 0) / x.length;
  }

  private static calculateBenchmarkSharpe(returns: number[]): number {
    if (returns.length < 2) return 0;

    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / (returns.length - 1);
    const volatility = Math.sqrt(variance);

    if (volatility === 0) return 0;

    const annualizedReturn = avgReturn * 252 * 100;
    const annualizedVolatility = volatility * Math.sqrt(252) * 100;
    const riskFreeRate = this.RISK_FREE_RATE * 100;

    return (annualizedReturn - riskFreeRate) / annualizedVolatility;
  }
}