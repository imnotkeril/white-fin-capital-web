// src/services/performanceCalculator.ts - ИСПРАВЛЕНО ДЛЯ СТРАТЕГИИ
import { TradeRecord, BenchmarkPoint } from './ExcelProcessor';

export interface PortfolioMetrics {
  totalReturn: number;
  winRate: number;
  sharpeRatio: number;
  sortinoRatio: number; // Заменили maxDrawdown на sortinoRatio
  profitFactor: number;
  totalTrades: number;
  averageHoldingDays: number;
  bestTrade: number;
  worstTrade: number;
  volatility: number;
  expectancy: number;
  maxConsecutiveWins: number;
  maxConsecutiveLosses: number;
  averageWin: number;
  averageLoss: number;
  maxDrawdown: number; // Оставляем для внутренних расчетов
}

export interface TimeSeriesPoint {
  date: Date;
  cumulativeReturn: number;
  dailyReturn: number; // Изменено обратно для совместимости
  portfolioValue: number; // Изменено обратно для совместимости
  tradeNumber?: number; // Добавлено как опциональное для отслеживания номера сделки
}

export class PerformanceCalculator {
  private static readonly STARTING_EQUITY = 1_000_000; // $1M
  private static readonly RISK_FREE_RATE = 0.05; // 5% annually

  /**
   * ✅ ИСПРАВЛЕННЫЙ расчет метрик СТРАТЕГИИ
   */
  static calculateAllMetrics(trades: TradeRecord[]): PortfolioMetrics {
    if (trades.length === 0) {
      throw new Error('No trades provided for calculation');
    }

    console.log(`📊 Calculating STRATEGY metrics for ${trades.length} trades...`);

    // Сортируем трейды по дате выхода для последовательного анализа
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

    // Средние значения по выигрышным и проигрышным сделкам
    // ✅ ИСПРАВЛЕНО: Считаем относительно портфеля (portfolioImpact), а не pnlPercent
    const averageWin = winningTrades.length > 0 ?
      winningTrades.reduce((sum, t) => sum + (t.portfolioImpact * 100), 0) / winningTrades.length : 0;
    const averageLoss = losingTrades.length > 0 ?
      losingTrades.reduce((sum, t) => sum + (t.portfolioImpact * 100), 0) / losingTrades.length : 0;

    // ✅ ИСПРАВЛЕНИЕ: Правильный расчет временного ряда ДЛЯ СТРАТЕГИИ
    const timeSeries = this.calculateTimeSeries(sortedTrades);
    const totalReturn = timeSeries.length > 0 ? timeSeries[timeSeries.length - 1].cumulativeReturn : 0;

    // Риск-метрики
    const maxDrawdown = this.calculateMaxDrawdown(timeSeries);
    const sharpeRatio = this.calculateSharpeRatio(timeSeries);
    const sortinoRatio = this.calculateSortinoRatio(timeSeries); // ✅ ДОБАВЛЕНО
    const volatility = this.calculateVolatility(timeSeries);

    // Торговые метрики
    const profitFactor = this.calculateProfitFactor(winningTrades, losingTrades);
    const expectancy = this.calculateExpectancy(winningTrades, losingTrades, winRate);

    // Анализ серий
    const consecutiveStats = this.calculateConsecutiveWinLoss(sortedTrades);

    // Средние значения
    const averageHoldingDays = sortedTrades.reduce((sum, t) => sum + t.holdingDays, 0) / totalTrades;

    const metrics: PortfolioMetrics = {
      totalReturn,
      winRate,
      sharpeRatio,
      sortinoRatio, // ✅ НОВОЕ: Sortino Ratio вместо Max Drawdown в основных метриках
      profitFactor,
      totalTrades,
      averageHoldingDays,
      bestTrade,
      worstTrade,
      volatility,
      expectancy,
      maxConsecutiveWins: consecutiveStats.maxWins,
      maxConsecutiveLosses: consecutiveStats.maxLosses,
      averageWin,
      averageLoss,
      maxDrawdown // ✅ Оставляем для внутренних расчетов
    };

    console.log(`✅ Strategy metrics calculated: Return ${totalReturn.toFixed(1)}%, Win Rate ${winRate.toFixed(1)}%`);

    return metrics;
  }

  /**
   * ✅ РЕАЛЬНЫЙ расчет коэффициента Сортино ДЛЯ СТРАТЕГИИ
   * Сортино учитывает только отрицательную волатильность (downside deviation)
   */
  static calculateSortinoRatio(timeSeries: TimeSeriesPoint[]): number {
    if (timeSeries.length < 2) return 0;

    // Используем возвраты от сделок
    const tradeReturns = timeSeries.map(point => point.dailyReturn / 100); // В долях
    const avgTradeReturn = tradeReturns.reduce((a, b) => a + b, 0) / tradeReturns.length;

    // Downside deviation - учитываем только отрицательные возвраты
    const negativeReturns = tradeReturns.filter(r => r < 0);

    if (negativeReturns.length === 0) return 999; // Нет убыточных сделок

    const downsideVariance = negativeReturns.reduce((sum, r) =>
      sum + Math.pow(r, 2), 0) / negativeReturns.length;
    const downsideDeviation = Math.sqrt(downsideVariance);

    if (downsideDeviation === 0) return 999;

    // Аннуализируем
    const avgHoldingDays = timeSeries.reduce((sum, point, index) => {
      if (index === 0) return 0;
      const daysDiff = (point.date.getTime() - timeSeries[index - 1].date.getTime()) / (1000 * 60 * 60 * 24);
      return sum + daysDiff;
    }, 0) / Math.max(1, timeSeries.length - 1);

    const tradesPerYear = 252 / Math.max(1, avgHoldingDays);

    const annualizedReturn = avgTradeReturn * tradesPerYear * 100; // В процентах
    const annualizedDownsideDeviation = downsideDeviation * Math.sqrt(tradesPerYear) * 100;
    const riskFreeRate = this.RISK_FREE_RATE * 100;

    return (annualizedReturn - riskFreeRate) / annualizedDownsideDeviation;
  }

  /**
   * ✅ ИСПРАВЛЕННЫЙ метод: расчет временного ряда ДЛЯ СТРАТЕГИИ
   * Каждая сделка обрабатывается последовательно, независимо от даты
   */
  static calculateTimeSeries(trades: TradeRecord[]): TimeSeriesPoint[] {
    if (trades.length === 0) return [];

    const timeSeries: TimeSeriesPoint[] = [];
    let strategyEquity = this.STARTING_EQUITY;

    // Обрабатываем каждую сделку последовательно
    trades.forEach((trade, index) => {
      // Расчет возврата от этой сделки
      const tradeReturn = trade.pnlPercent; // Уже в процентах

      // Обновляем эквити стратегии
      // Используем portfolioExposure как размер позиции относительно эквити
      const positionSize = trade.portfolioExposure; // В долях от эквити
      const tradeImpact = (tradeReturn / 100) * positionSize; // В долях

      strategyEquity *= (1 + tradeImpact);

      const cumulativeReturn = ((strategyEquity - this.STARTING_EQUITY) / this.STARTING_EQUITY) * 100;

      timeSeries.push({
        date: trade.exitDate,
        cumulativeReturn,
        dailyReturn: tradeReturn, // Результат этой сделки в %
        portfolioValue: strategyEquity,
        tradeNumber: index + 1
      });

      console.log(`Trade ${index + 1} (${trade.ticker}): ${tradeReturn.toFixed(2)}% → Equity: $${Math.round(strategyEquity).toLocaleString()}, Cumulative: ${cumulativeReturn.toFixed(2)}%`);
    });

    return timeSeries;
  }

  /**
   * ✅ ИСПРАВЛЕННЫЙ расчет максимальной просадки ДЛЯ СТРАТЕГИИ
   * Просадка считается между сделками, а не по дням
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
   * ✅ ИСПРАВЛЕННЫЙ расчет коэффициента Шарпа ДЛЯ СТРАТЕГИИ
   */
  static calculateSharpeRatio(timeSeries: TimeSeriesPoint[]): number {
    if (timeSeries.length < 2) return 0;

    // Используем возвраты от сделок вместо дневных возвратов
    const tradeReturns = timeSeries.map(point => point.dailyReturn / 100); // В долях
    const avgTradeReturn = tradeReturns.reduce((a, b) => a + b, 0) / tradeReturns.length;

    // Волатильность сделок
    const variance = tradeReturns.reduce((sum, r) =>
      sum + Math.pow(r - avgTradeReturn, 2), 0) / (tradeReturns.length - 1);
    const tradeVolatility = Math.sqrt(variance);

    if (tradeVolatility === 0) return 0;

    // Аннуализируем (предполагаем среднюю частоту сделок)
    const avgHoldingDays = timeSeries.reduce((sum, point, index) => {
      if (index === 0) return 0;
      const daysDiff = (point.date.getTime() - timeSeries[index - 1].date.getTime()) / (1000 * 60 * 60 * 24);
      return sum + daysDiff;
    }, 0) / Math.max(1, timeSeries.length - 1);

    const tradesPerYear = 252 / Math.max(1, avgHoldingDays);

    const annualizedReturn = avgTradeReturn * tradesPerYear * 100; // В процентах
    const annualizedVolatility = tradeVolatility * Math.sqrt(tradesPerYear) * 100; // В процентах
    const riskFreeRate = this.RISK_FREE_RATE * 100;

    return (annualizedReturn - riskFreeRate) / annualizedVolatility;
  }

  /**
   * ✅ НОВЫЙ метод: Расчет коэффициента Сортино ДЛЯ СТРАТЕГИИ
   * Сортино учитывает только отрицательную волатильность (downside deviation)
   */
  static calculateSortinoRatio(timeSeries: TimeSeriesPoint[]): number {
    if (timeSeries.length < 2) return 0;

    // Используем возвраты от сделок
    const tradeReturns = timeSeries.map(point => point.dailyReturn / 100); // В долях
    const avgTradeReturn = tradeReturns.reduce((a, b) => a + b, 0) / tradeReturns.length;

    // Downside deviation - учитываем только отрицательные отклонения от среднего
    const negativeDeviations = tradeReturns
      .map(r => r < avgTradeReturn ? Math.pow(r - avgTradeReturn, 2) : 0);

    const downsideVariance = negativeDeviations.reduce((sum, dev) => sum + dev, 0) / tradeReturns.length;
    const downsideDeviation = Math.sqrt(downsideVariance);

    if (downsideDeviation === 0) return 0;

    // Аннуализируем (предполагаем среднюю частоту сделок)
    const avgHoldingDays = timeSeries.reduce((sum, point, index) => {
      if (index === 0) return 0;
      const daysDiff = (point.date.getTime() - timeSeries[index - 1].date.getTime()) / (1000 * 60 * 60 * 24);
      return sum + daysDiff;
    }, 0) / Math.max(1, timeSeries.length - 1);

    const tradesPerYear = 252 / Math.max(1, avgHoldingDays);

    const annualizedReturn = avgTradeReturn * tradesPerYear * 100; // В процентах
    const annualizedDownsideDeviation = downsideDeviation * Math.sqrt(tradesPerYear) * 100; // В процентах
    const riskFreeRate = this.RISK_FREE_RATE * 100;

    return (annualizedReturn - riskFreeRate) / annualizedDownsideDeviation;
  }

  /**
   * ✅ ИСПРАВЛЕННЫЙ расчет волатильности ДЛЯ СТРАТЕГИИ
   */
  static calculateVolatility(timeSeries: TimeSeriesPoint[]): number {
    if (timeSeries.length < 2) return 0;

    const tradeReturns = timeSeries.map(point => point.dailyReturn / 100); // В долях
    const avgReturn = tradeReturns.reduce((a, b) => a + b, 0) / tradeReturns.length;

    const variance = tradeReturns.reduce((sum, r) =>
      sum + Math.pow(r - avgReturn, 2), 0) / (tradeReturns.length - 1);

    // Аннуализируем волатильность
    const avgHoldingDays = timeSeries.reduce((sum, point, index) => {
      if (index === 0) return 0;
      const daysDiff = (point.date.getTime() - timeSeries[index - 1].date.getTime()) / (1000 * 60 * 60 * 24);
      return sum + daysDiff;
    }, 0) / Math.max(1, timeSeries.length - 1);

    const tradesPerYear = 252 / Math.max(1, avgHoldingDays);

    return Math.sqrt(variance) * Math.sqrt(tradesPerYear) * 100; // Аннуализируем и в процентах
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
   * ✅ УЛУЧШЕННЫЙ расчет последовательных побед/поражений
   */
  static calculateConsecutiveWinLoss(trades: TradeRecord[]): { maxWins: number; maxLosses: number; currentStreak: number } {
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

    // Текущая серия
    const lastTrade = trades[trades.length - 1];
    const currentStreak = lastTrade?.pnlPercent > 0 ? currentWins : -currentLosses;

    return { maxWins, maxLosses, currentStreak };
  }

  /**
   * ✅ НОВЫЙ метод: анализ R-multiples для каждой позиции
   */
  static calculateRMultiples(trades: TradeRecord[]): {
    rMultiples: number[];
    averageR: number;
    positiveRCount: number;
    negativeRCount: number;
  } {
    // R-multiple = (Exit Price - Entry Price) / Risk
    // Для упрощения используем pnlPercent как R-multiple
    const rMultiples = trades.map(trade => trade.pnlPercent / 100); // В долях

    const averageR = rMultiples.reduce((sum, r) => sum + r, 0) / rMultiples.length;
    const positiveRCount = rMultiples.filter(r => r > 0).length;
    const negativeRCount = rMultiples.filter(r => r <= 0).length;

    return {
      rMultiples,
      averageR,
      positiveRCount,
      negativeRCount
    };
  }

  /**
   * ✅ НОВЫЙ метод: анализ просадок между сделками
   */
  static calculateTradeDrawdowns(timeSeries: TimeSeriesPoint[]): {
    maxTradeDrawdown: number;
    drawdownPeriods: Array<{ start: number; end: number; depth: number }>;
  } {
    if (timeSeries.length === 0) {
      return { maxTradeDrawdown: 0, drawdownPeriods: [] };
    }

    let maxDrawdown = 0;
    let peak = timeSeries[0].portfolioValue;
    let peakIndex = 0;
    const drawdownPeriods: Array<{ start: number; end: number; depth: number }> = [];
    let currentDrawdownStart = -1;

    timeSeries.forEach((point, index) => {
      if (point.portfolioValue > peak) {
        // Новый пик - завершаем текущую просадку, если была
        if (currentDrawdownStart >= 0) {
          const depth = ((peak - timeSeries[index - 1].portfolioValue) / peak) * 100;
          drawdownPeriods.push({
            start: currentDrawdownStart,
            end: index - 1,
            depth: -depth
          });
          currentDrawdownStart = -1;
        }

        peak = point.portfolioValue;
        peakIndex = index;
      } else {
        // Просадка
        if (currentDrawdownStart === -1) {
          currentDrawdownStart = peakIndex;
        }

        const drawdown = ((peak - point.portfolioValue) / peak) * 100;
        maxDrawdown = Math.max(maxDrawdown, drawdown);
      }
    });

    // Если просадка продолжается до конца
    if (currentDrawdownStart >= 0) {
      const lastIndex = timeSeries.length - 1;
      const depth = ((peak - timeSeries[lastIndex].portfolioValue) / peak) * 100;
      drawdownPeriods.push({
        start: currentDrawdownStart,
        end: lastIndex,
        depth: -depth
      });
    }

    return {
      maxTradeDrawdown: -maxDrawdown,
      drawdownPeriods
    };
  }

  /**
   * Сравнение с бенчмарком - расчет Alpha/Beta
   */
  static calculateBenchmarkMetrics(
    strategyTimeSeries: TimeSeriesPoint[],
    benchmarkData: BenchmarkPoint[]
  ): { alpha: number; beta: number; correlation: number; sharpeRatio: number } {
    if (strategyTimeSeries.length === 0 || benchmarkData.length === 0) {
      return { alpha: 0, beta: 1, correlation: 0, sharpeRatio: 0 };
    }

    // Выравниваем данные по датам
    const alignedData = this.alignDataByDates(strategyTimeSeries, benchmarkData);

    if (alignedData.length < 2) {
      return { alpha: 0, beta: 1, correlation: 0, sharpeRatio: 0 };
    }

    const strategyReturns = alignedData.map(d => d.strategyReturn);
    const benchmarkReturns = alignedData.map(d => d.benchmarkReturn);

    // Статистические расчеты
    const correlation = this.calculateCorrelation(strategyReturns, benchmarkReturns);
    const beta = this.calculateBeta(strategyReturns, benchmarkReturns);

    // Alpha = Strategy Return - (Risk Free Rate + Beta * (Benchmark Return - Risk Free Rate))
    const strategyAnnualReturn = strategyTimeSeries[strategyTimeSeries.length - 1].cumulativeReturn;
    const benchmarkAnnualReturn = benchmarkData[benchmarkData.length - 1].cumulativeReturn;
    const riskFreeRate = this.RISK_FREE_RATE * 100;

    const alpha = strategyAnnualReturn - (riskFreeRate + beta * (benchmarkAnnualReturn - riskFreeRate));

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
    strategyData: TimeSeriesPoint[],
    benchmarkData: BenchmarkPoint[]
  ): Array<{ strategyReturn: number; benchmarkReturn: number }> {
    const aligned: Array<{ strategyReturn: number; benchmarkReturn: number }> = [];

    const benchmarkMap = new Map(
      benchmarkData.map(b => [b.date.toISOString().split('T')[0], b.change])
    );

    strategyData.forEach(strategyPoint => {
      const dateKey = strategyPoint.date.toISOString().split('T')[0];
      const benchmarkReturn = benchmarkMap.get(dateKey);

      if (benchmarkReturn !== undefined) {
        aligned.push({
          strategyReturn: strategyPoint.dailyReturn / 100, // В долях
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

  private static calculateBeta(strategyReturns: number[], benchmarkReturns: number[]): number {
    if (strategyReturns.length !== benchmarkReturns.length || strategyReturns.length < 2) return 1;

    const benchmarkVar = this.calculateVariance(benchmarkReturns);
    if (benchmarkVar === 0) return 1;

    const covariance = this.calculateCovariance(strategyReturns, benchmarkReturns);
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