// src/services/performanceCalculator.ts - ИСПРАВЛЕНО ДЛЯ СТРАТЕГИИ
import { TradeRecord, BenchmarkPoint } from './ExcelProcessor';

export interface PortfolioMetrics {
  totalReturn: number;
  winRate: number;
  sharpeRatio: number;
  sortinoRatio: number;
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
  maxDrawdown: number;
}

export interface TimeSeriesPoint {
  date: Date;
  cumulativeReturn: number;
  dailyReturn: number;
  portfolioValue: number;
  tradeNumber?: number;
}

export class PerformanceCalculator {
  private static readonly STARTING_EQUITY = 1_000_000;
  private static readonly RISK_FREE_RATE = 0.05;

  static calculateAllMetrics(trades: TradeRecord[], benchmarkPoints?: BenchmarkPoint[]): PortfolioMetrics {
    if (trades.length === 0) {
      throw new Error('No trades provided for calculation');
    }

    console.log(`📊 Calculating STRATEGY metrics for ${trades.length} trades...`);

    const sortedTrades = [...trades].sort((a, b) => a.exitDate.getTime() - b.exitDate.getTime());
    const totalTrades = sortedTrades.length;
    const winningTrades = sortedTrades.filter(t => t.pnlPercent > 0);
    const losingTrades = sortedTrades.filter(t => t.pnlPercent <= 0);
    const winRate = (winningTrades.length / totalTrades) * 100;

    const allPnL = sortedTrades.map(t => t.pnlPercent);
    const bestTrade = Math.max(...allPnL);
    const worstTrade = Math.min(...allPnL);

    const averageWin = winningTrades.length > 0 ?
      winningTrades.reduce((sum, t) => sum + (t.portfolioImpact * 100), 0) / winningTrades.length : 0;
    const averageLoss = losingTrades.length > 0 ?
      losingTrades.reduce((sum, t) => sum + (t.portfolioImpact * 100), 0) / losingTrades.length : 0;

    const timeSeries = this.calculateTimeSeries(sortedTrades, benchmarkPoints);
    const totalReturn = timeSeries.length > 0 ? timeSeries[timeSeries.length - 1]?.cumulativeReturn || 0 : 0;

    const maxDrawdown = this.calculateMaxDrawdown(timeSeries, sortedTrades);
    const sharpeRatio = this.calculateSharpeRatio(timeSeries);
    const sortinoRatio = this.calculateSortinoRatio(timeSeries);
    const volatility = this.calculateVolatility(timeSeries);

    const profitFactor = this.calculateProfitFactor(winningTrades, losingTrades);
    const expectancy = this.calculateExpectancy(winningTrades, losingTrades, winRate);
    const consecutiveStats = this.calculateConsecutiveWinLoss(sortedTrades);
    const averageHoldingDays = sortedTrades.reduce((sum, t) => sum + t.holdingDays, 0) / totalTrades;

    const metrics: PortfolioMetrics = {
      totalReturn,
      winRate,
      sharpeRatio,
      sortinoRatio,
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
      maxDrawdown
    };

    console.log(`✅ Strategy metrics calculated: Return ${totalReturn.toFixed(1)}%, Win Rate ${winRate.toFixed(1)}%`);
    return metrics;
  }

  static calculateTimeSeries(trades: TradeRecord[], benchmarkPoints?: BenchmarkPoint[]): TimeSeriesPoint[] {
    if (benchmarkPoints && benchmarkPoints.length > 0) {
      console.log('📊 Using daily equity calculation with benchmark data');
      return this.buildDailyPortfolioEquity(trades, benchmarkPoints);
    }

    console.log('⚠️ Using legacy trade-based equity calculation');
    return this.calculateLegacyTimeSeries(trades);
  }

  static buildDailyPortfolioEquity(trades: TradeRecord[], benchmarkPoints: BenchmarkPoint[]): TimeSeriesPoint[] {
    if (trades.length === 0 || benchmarkPoints.length === 0) {
      console.warn('⚠️ No trades or benchmark data for daily equity calculation');
      return [];
    }

    console.log(`📊 Building STRATEGY equity: ${trades.length} trades, ${benchmarkPoints.length} benchmark days`);

    const sortedTrades = [...trades].sort((a, b) => a.exitDate.getTime() - b.exitDate.getTime());
    const tradesByExitDate = new Map<string, TradeRecord[]>();

    sortedTrades.forEach(trade => {
      const dateKey = trade.exitDate?.toISOString().split('T')[0];
      if (!dateKey) return; // ← УБРАТЬ [], просто return
      if (!tradesByExitDate.has(dateKey)) {
        tradesByExitDate.set(dateKey, []);
      }
      tradesByExitDate.get(dateKey)!.push(trade);
    });

    console.log(`📅 Trade dates map created: ${tradesByExitDate.size} unique exit dates`);

    const dailyEquity: TimeSeriesPoint[] = [];
    let cumulativeStrategyReturn = 0;
    let strategyValue = this.STARTING_EQUITY;

    for (const benchmarkPoint of benchmarkPoints) {
      const dateKey = benchmarkPoint.date?.toISOString().split('T')[0];
      if (!dateKey) continue;
      let dayStrategyReturn = 0;

      if (tradesByExitDate.has(dateKey)) {
        const dayTrades = tradesByExitDate.get(dateKey)!;

        for (const trade of dayTrades) {
          const tradeContribution = trade.portfolioImpact * 100;
          cumulativeStrategyReturn += tradeContribution;
          dayStrategyReturn += tradeContribution;
          console.log(`[DEBUG] ${trade.ticker}: impact=${trade.portfolioImpact}, contribution=${tradeContribution}%, cumulative=${cumulativeStrategyReturn}%`);
        }
      }

      strategyValue = this.STARTING_EQUITY * (1 + cumulativeStrategyReturn / 100);

      dailyEquity.push({
        date: benchmarkPoint.date,
        cumulativeReturn: cumulativeStrategyReturn,
        dailyReturn: dayStrategyReturn,
        portfolioValue: strategyValue
      });
    }

    console.log(`✅ Strategy equity built: ${dailyEquity.length} points`);

    if (dailyEquity.length > 0) {
      const finalReturn = dailyEquity[dailyEquity.length - 1]?.cumulativeReturn || 0;
      console.log(`📈 Final STRATEGY return: ${finalReturn.toFixed(2)}%`);
    }

    return dailyEquity;
  }

  private static calculateLegacyTimeSeries(trades: TradeRecord[]): TimeSeriesPoint[] {
    if (trades.length === 0) return [];

    const timeSeries: TimeSeriesPoint[] = [];
    let cumulativeStrategyReturn = 0;
    let strategyValue = this.STARTING_EQUITY;

    const sortedTrades = [...trades].sort((a, b) => a.exitDate.getTime() - b.exitDate.getTime());

    sortedTrades.forEach((trade, index) => {
      const tradeContribution = trade.portfolioImpact * 100;
      cumulativeStrategyReturn += tradeContribution;
      strategyValue = this.STARTING_EQUITY * (1 + cumulativeStrategyReturn / 100);

      timeSeries.push({
        date: trade.exitDate,
        cumulativeReturn: cumulativeStrategyReturn,
        dailyReturn: tradeContribution,
        portfolioValue: strategyValue,
        tradeNumber: index + 1
      });
    });

    return timeSeries;
  }

  static calculateMaxDrawdown(timeSeries: TimeSeriesPoint[], trades?: TradeRecord[]): number {
      if (timeSeries.length === 0) return 0;

      // ✅ ИСПРАВЛЕНО: Если есть данные о трейдах, используем просадки позиций
      if (trades && trades.length > 0) {
        console.log('🔍 [DEBUG] Calculating max drawdown using position drawdowns');

        let maxSinglePositionImpact = 0;
        let worstPosition: TradeRecord | null = null;

        trades.forEach(trade => {
          // Рассчитываем влияние просадки позиции на портфель
          // Предполагаем, что у TradeRecord есть поле drawdown или рассчитываем из positionLow
          const positionDrawdown = this.getPositionDrawdown(trade);
          if (positionDrawdown < 0) {
            const portfolioImpact = Math.abs((positionDrawdown * trade.portfolioExposure * 100) / 100);

            if (portfolioImpact > maxSinglePositionImpact) {
              maxSinglePositionImpact = portfolioImpact;
              worstPosition = trade;
            }

            console.log(`   ${trade.ticker}: ${positionDrawdown.toFixed(2)}% × ${(trade.portfolioExposure * 100).toFixed(2)}% = ${portfolioImpact.toFixed(2)}% impact`);
          }
        });

        if (worstPosition) {
          console.log(`🎯 [DEBUG] Max Drawdown from worst position: ${maxSinglePositionImpact.toFixed(2)}% (${(worstPosition as any)?.ticker || 'Unknown'})`);
          return -maxSinglePositionImpact;
        }
      }

      // ✅ Fallback: используем старый метод для кумулятивной кривой
      const tradeDays = timeSeries.filter(point => point.dailyReturn !== 0);
      if (tradeDays.length === 0) return 0;

      let maxDrawdown = 0;
      let peak = 0;

      tradeDays.forEach((point, index) => {
        const currentReturn = point.cumulativeReturn;

        if (currentReturn > peak) {
          peak = currentReturn;
        } else {
          const drawdown = peak - currentReturn;
          maxDrawdown = Math.max(maxDrawdown, drawdown);
        }
      });

      console.log(`🎯 [DEBUG] Max Drawdown from equity curve: ${maxDrawdown.toFixed(3)}%`);
      return -maxDrawdown;
    }


    private static getPositionDrawdown(trade: TradeRecord): number {
        // Если в TradeRecord есть поле drawdown, используем его
        if ('drawdown' in trade && typeof trade.drawdown === 'number') {
          return trade.drawdown;
        }

        // Иначе рассчитываем из positionLow и avgPrice
        if ('positionLow' in trade && 'avgPrice' in trade &&
            typeof trade.positionLow === 'number' && typeof trade.avgPrice === 'number') {
          return ((trade.positionLow - trade.avgPrice) / trade.avgPrice) * 100;
        }

        // Если данных нет, возвращаем 0
        return 0;
      }


  static calculateSharpeRatio(timeSeries: TimeSeriesPoint[]): number {
    if (timeSeries.length < 2) return 0;

    const tradeReturns = timeSeries
      .filter(point => point.dailyReturn !== 0)
      .map(point => point.dailyReturn / 100);

    if (tradeReturns.length < 2) return 0;

    const avgTradeReturn = tradeReturns.reduce((a, b) => a + b, 0) / tradeReturns.length;

    const variance = tradeReturns.reduce((sum, r) =>
      sum + Math.pow(r - avgTradeReturn, 2), 0) / (tradeReturns.length - 1);
    const tradeVolatility = Math.sqrt(variance);

    if (tradeVolatility === 0) return 0;

    const totalDays = timeSeries.length > 1 ?
      (timeSeries[timeSeries.length - 1]?.date.getTime()! - timeSeries[0]?.date.getTime()!) / (1000 * 60 * 60 * 24) : 252;

    const tradesPerYear = (tradeReturns.length / Math.max(totalDays, 1)) * 252;

    const annualizedReturn = avgTradeReturn * tradesPerYear * 100;
    const annualizedVolatility = tradeVolatility * Math.sqrt(tradesPerYear) * 100;
    const riskFreeRate = this.RISK_FREE_RATE * 100;

    return (annualizedReturn - riskFreeRate) / annualizedVolatility;
  }

  static calculateSortinoRatio(timeSeries: TimeSeriesPoint[]): number {
    if (timeSeries.length < 2) return 0;

    const tradeReturns = timeSeries
      .filter(point => point.dailyReturn !== 0)
      .map(point => point.dailyReturn / 100);

    if (tradeReturns.length < 2) return 0;

    const avgTradeReturn = tradeReturns.reduce((a, b) => a + b, 0) / tradeReturns.length;

    const negativeDeviations = tradeReturns
      .map(r => r < avgTradeReturn ? Math.pow(r - avgTradeReturn, 2) : 0);

    const downsideVariance = negativeDeviations.reduce((sum, dev) => sum + dev, 0) / tradeReturns.length;
    const downsideDeviation = Math.sqrt(downsideVariance);

    if (downsideDeviation === 0) return 0;

    const totalDays = timeSeries.length > 1 ?
      (timeSeries[timeSeries.length - 1]?.date?.getTime()! - timeSeries[0]?.date?.getTime()!) / (1000 * 60 * 60 * 24) : 252;

    const tradesPerYear = (tradeReturns.length / Math.max(totalDays, 1)) * 252;

    const annualizedReturn = avgTradeReturn * tradesPerYear * 100;
    const annualizedDownsideDeviation = downsideDeviation * Math.sqrt(tradesPerYear) * 100;
    const riskFreeRate = this.RISK_FREE_RATE * 100;

    return (annualizedReturn - riskFreeRate) / annualizedDownsideDeviation;
  }

  static calculateVolatility(timeSeries: TimeSeriesPoint[]): number {
    if (timeSeries.length < 2) return 0;

    const tradeReturns = timeSeries
      .filter(point => point.dailyReturn !== 0)
      .map(point => point.dailyReturn / 100);

    if (tradeReturns.length < 2) return 0;

    const avgReturn = tradeReturns.reduce((a, b) => a + b, 0) / tradeReturns.length;

    const variance = tradeReturns.reduce((sum, r) =>
      sum + Math.pow(r - avgReturn, 2), 0) / (tradeReturns.length - 1);

    const totalDays = timeSeries.length > 1 ?
      (timeSeries[timeSeries.length - 1].date.getTime() - timeSeries[0].date.getTime()) / (1000 * 60 * 60 * 24) : 252;

    const tradesPerYear = (tradeReturns.length / Math.max(totalDays, 1)) * 252;

    return Math.sqrt(variance) * Math.sqrt(tradesPerYear) * 100;
  }

  static calculateProfitFactor(winningTrades: TradeRecord[], losingTrades: TradeRecord[]): number {
    const grossProfit = winningTrades.reduce((sum, t) => sum + (t.portfolioImpact * 100), 0);
    const grossLoss = Math.abs(losingTrades.reduce((sum, t) => sum + (t.portfolioImpact * 100), 0));

    if (grossLoss === 0) return grossProfit > 0 ? 999 : 1;
    return grossProfit / grossLoss;
  }

  static calculateExpectancy(winningTrades: TradeRecord[], losingTrades: TradeRecord[], winRate: number): number {
    const avgWin = winningTrades.length > 0 ?
      winningTrades.reduce((sum, t) => sum + (t.portfolioImpact * 100), 0) / winningTrades.length : 0;

    const avgLoss = losingTrades.length > 0 ?
      Math.abs(losingTrades.reduce((sum, t) => sum + (t.portfolioImpact * 100), 0) / losingTrades.length) : 0;

    const lossRate = 100 - winRate;
    return (winRate / 100) * avgWin - (lossRate / 100) * avgLoss;
  }

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

    const lastTrade = trades[trades.length - 1];
    const currentStreak = (lastTrade?.pnlPercent || 0) > 0 ? currentWins : -currentLosses;

    return { maxWins, maxLosses, currentStreak };
  }

  static calculateBenchmarkMetrics(
    strategyTimeSeries: TimeSeriesPoint[],
    benchmarkData: BenchmarkPoint[]
  ): { alpha: number; beta: number; correlation: number; sharpeRatio: number } {
    if (strategyTimeSeries.length === 0 || benchmarkData.length === 0) {
      return { alpha: 0, beta: 1, correlation: 0, sharpeRatio: 0 };
    }

    const alignedData = this.alignDataByDates(strategyTimeSeries, benchmarkData);

    if (alignedData.length < 2) {
      return { alpha: 0, beta: 1, correlation: 0, sharpeRatio: 0 };
    }

    const strategyReturns = alignedData.map(d => d.strategyReturn);
    const benchmarkReturns = alignedData.map(d => d.benchmarkReturn);

    const correlation = this.calculateCorrelation(strategyReturns, benchmarkReturns);
    const beta = this.calculateBeta(strategyReturns, benchmarkReturns);

    const strategyAnnualReturn = strategyTimeSeries[strategyTimeSeries.length - 1]?.cumulativeReturn || 0;
    const benchmarkAnnualReturn = benchmarkData[benchmarkData.length - 1]?.cumulativeReturn || 0;
    const riskFreeRate = this.RISK_FREE_RATE * 100;

    const alpha = strategyAnnualReturn - (riskFreeRate + beta * (benchmarkAnnualReturn - riskFreeRate));
    const benchmarkSharpe = this.calculateBenchmarkSharpe(benchmarkReturns);

    return { alpha, beta, correlation, sharpeRatio: benchmarkSharpe };
  }

  private static alignDataByDates(
    strategyData: TimeSeriesPoint[],
    benchmarkData: BenchmarkPoint[]
  ): Array<{ strategyReturn: number; benchmarkReturn: number }> {
    const aligned: Array<{ strategyReturn: number; benchmarkReturn: number }> = [];

    const benchmarkMap = new Map(
      benchmarkData.map(b => [b.date.toISOString().split('T')[0], b.change])
    );

    strategyData.forEach(strategyPoint => {
      if (strategyPoint.dailyReturn === 0) return;

      const dateKey = strategyPoint.date.toISOString().split('T')[0];
      const benchmarkReturn = benchmarkMap.get(dateKey);

      if (benchmarkReturn !== undefined) {
        aligned.push({
          strategyReturn: strategyPoint.dailyReturn / 100,
          benchmarkReturn: benchmarkReturn / 100
        });
      }
    });

    return aligned;
  }

  private static calculateCorrelation(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length < 2) return 0;

    const avgX = x.reduce((a, b) => a + b, 0) / x.length;
    const avgY = y.reduce((a, b) => a + b, 0) / y.length;

    const numerator = x.reduce((sum, xi, i) => sum + (xi - avgX) * ((y[i] || 0) - avgY), 0);
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

    return x.reduce((sum, xi, i) => sum + (xi - avgX) * ((y[i] || 0) - avgY), 0) / x.length;
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