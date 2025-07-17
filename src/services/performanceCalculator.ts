// Performance calculator service for trading data - ИСПРАВЛЕНО
import {
  ProcessedTradeRecord,
  CalculatedMetrics,
  PortfolioPerformancePoint,
  CalculationOptions,
  BenchmarkDataPoint,
  ComparisonMetrics
} from '@/types/realData';

export class PerformanceCalculator {

  /**
   * Calculate all performance metrics from trade data
   */
  static calculateMetrics(
    trades: ProcessedTradeRecord[],
    options: CalculationOptions = {
      startingPortfolioValue: 1000000, // $1M default
      riskFreeRate: 0.05, // 5% annual risk-free rate
      includeBenchmarkComparison: false
    }
  ): CalculatedMetrics {

    if (trades.length === 0) {
      throw new Error('No trades provided for calculation');
    }

    const totalExposure = trades.reduce((sum, trade) => sum + trade.portfolioExposure, 0);
    if (totalExposure > 1.5) { // If greater than 150%
      console.warn(`High total exposure: ${(totalExposure * 100).toFixed(1)}%. Possible leverage or error.`);
    }

    // Sort trades by exit date
    const sortedTrades = [...trades].sort((a, b) => a.exitDate.getTime() - b.exitDate.getTime());

    // Basic trade statistics
    const totalTrades = sortedTrades.length;
    const winningTrades = sortedTrades.filter(t => t.pnlPercent > 0);
    const losingTrades = sortedTrades.filter(t => t.pnlPercent < 0);
    const winRate = (winningTrades.length / totalTrades) * 100;

    // Calculate portfolio returns using portfolio impact
    const portfolioReturns = this.calculatePortfolioReturns(sortedTrades, options.startingPortfolioValue);
    const totalReturn = portfolioReturns[portfolioReturns.length - 1]?.cumulativeReturn || 0;

    // PnL statistics
    const pnlValues = sortedTrades.map(t => t.pnlPercent);
    const winningPnL = winningTrades.map(t => t.pnlPercent);
    const losingPnL = losingTrades.map(t => t.pnlPercent);

    const averageGain = winningPnL.length > 0 ? winningPnL.reduce((a, b) => a + b, 0) / winningPnL.length : 0;
    const averageLoss = losingPnL.length > 0 ? losingPnL.reduce((a, b) => a + b, 0) / losingPnL.length : 0;
    const bestTrade = Math.max(...pnlValues);
    const worstTrade = Math.min(...pnlValues);

    // Advanced metrics
    const averageHoldingDays = sortedTrades.reduce((sum, t) => sum + t.holdingDays, 0) / totalTrades;
    const averageExposure = sortedTrades.reduce((sum, t) => sum + t.portfolioExposure, 0) / totalTrades;

    // Max drawdown calculation
    const maxDrawdown = this.calculateMaxDrawdown(portfolioReturns);

    // Sharpe ratio calculation
    const sharpeRatio = this.calculateSharpeRatio(portfolioReturns, options.riskFreeRate);

    // Additional trading metrics
    const profitFactor = this.calculateProfitFactor(winningPnL, losingPnL);
    const expectancy = this.calculateExpectancy(winningPnL, losingPnL, winRate);

    // Consecutive wins/losses
    const { maxConsecutiveWins, maxConsecutiveLosses } = this.calculateConsecutiveWinsLosses(sortedTrades);

    // Portfolio impact values
    const portfolioImpacts = sortedTrades.map(t => t.portfolioImpact);
    const largestWin = Math.max(...portfolioImpacts);
    const largestLoss = Math.min(...portfolioImpacts);

    // Period information
    const startDate = sortedTrades[0].exitDate;
    const endDate = sortedTrades[sortedTrades.length - 1].exitDate;
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    return {
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
      averageExposure,
      period: {
        startDate,
        endDate,
        totalDays
      }
    };
  }

  /**
   * Calculate portfolio returns over time using portfolio exposure - ИСПРАВЛЕНО
   */
  static calculatePortfolioReturns(
    trades: ProcessedTradeRecord[],
    startingValue: number = 1000000 // $1M default
  ): PortfolioPerformancePoint[] {

    const returns: PortfolioPerformancePoint[] = [];
    let cumulativeReturn = 0;
    let portfolioValue = startingValue;

    // Group trades by exit date to handle multiple trades on same day
    const tradesByDate = new Map<string, ProcessedTradeRecord[]>();

    trades.forEach(trade => {
      const dateKey = trade.exitDate.toISOString().split('T')[0];
      if (!tradesByDate.has(dateKey)) {
        tradesByDate.set(dateKey, []);
      }
      tradesByDate.get(dateKey)!.push(trade);
    });

    // Sort dates
    const sortedDates = Array.from(tradesByDate.keys()).sort();

    sortedDates.forEach(dateKey => {
      const dayTrades = tradesByDate.get(dateKey)!;


      const totalDayExposure = dayTrades.reduce((sum, trade) => sum + trade.portfolioExposure, 0);


      const normalizationFactor = totalDayExposure > 1 ? totalDayExposure : 1;


      const dayPortfolioImpact = dayTrades.reduce((sum, trade) => {
        const normalizedWeight = trade.portfolioExposure / normalizationFactor;
        return sum + (trade.portfolioImpact * normalizedWeight);
      }, 0);

      const dailyReturn = dayPortfolioImpact;

      // Update cumulative return
      cumulativeReturn = ((1 + cumulativeReturn / 100) * (1 + dailyReturn / 100) - 1) * 100;

      // Update portfolio value
      portfolioValue = startingValue * (1 + cumulativeReturn / 100);

      const date = new Date(dateKey);
      returns.push({
        date,
        dateString: dateKey,
        cumulativeReturn,
        dailyReturn,
        portfolioValue,
        activeTrades: dayTrades.length,
        totalExposure: dayTrades.reduce((sum, trade) => sum + trade.portfolioExposure, 0)
      });
    });

    return returns;
  }

  /**
   * Calculate maximum drawdown from portfolio returns
   */
  private static calculateMaxDrawdown(returns: PortfolioPerformancePoint[]): number {
    if (returns.length === 0) return 0;

    let maxDrawdown = 0;
    let peak = returns[0].portfolioValue;
    let runningMax = returns[0].portfolioValue;

    returns.forEach(point => {
      // Обновляем running maximum
      runningMax = Math.max(runningMax, point.portfolioValue);

      // Рассчитываем текущую просадку от максимума
      const currentDrawdown = ((runningMax - point.portfolioValue) / runningMax) * 100;

      // Обновляем максимальную просадку
      maxDrawdown = Math.max(maxDrawdown, currentDrawdown);
    });

    return -maxDrawdown; // Возвращаем как отрицательное значение
  }

  /**
   * Calculate Sharpe ratio from portfolio returns
   */
  private static calculateSharpeRatio(returns: PortfolioPerformancePoint[], riskFreeRate: number): number {
    if (returns.length < 2) return 0;

    const dailyReturns = returns.map(r => r.dailyReturn);
    const avgDailyReturn = dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length;
    const volatility = this.calculateVolatility(dailyReturns);

    if (volatility === 0) return 0;

    // Annualize returns and calculate Sharpe
    const annualizedReturn = avgDailyReturn * 252; // 252 trading days
    const annualizedRiskFreeRate = riskFreeRate * 100; // Convert to percentage

    return (annualizedReturn - annualizedRiskFreeRate) / volatility;
  }

  /**
   * Calculate profit factor (gross profit / gross loss)
   */
  private static calculateProfitFactor(winningTrades: number[], losingTrades: number[]): number {
    const grossProfit = winningTrades.reduce((sum, trade) => sum + trade, 0);
    const grossLoss = Math.abs(losingTrades.reduce((sum, trade) => sum + trade, 0));

    return grossLoss === 0 ? (grossProfit > 0 ? Infinity : 0) : grossProfit / grossLoss;
  }

  /**
   * Calculate expectancy (average win * win rate - average loss * loss rate)
   */
  private static calculateExpectancy(winningTrades: number[], losingTrades: number[], winRate: number): number {
    const avgWin = winningTrades.length > 0 ? winningTrades.reduce((a, b) => a + b, 0) / winningTrades.length : 0;
    const avgLoss = losingTrades.length > 0 ? Math.abs(losingTrades.reduce((a, b) => a + b, 0) / losingTrades.length) : 0;
    const lossRate = 100 - winRate;

    return (avgWin * winRate / 100) - (avgLoss * lossRate / 100);
  }

  /**
   * Calculate consecutive wins and losses
   */
  private static calculateConsecutiveWinsLosses(trades: ProcessedTradeRecord[]): {
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

    return {
      maxConsecutiveWins: maxWins,
      maxConsecutiveLosses: maxLosses
    };
  }

  /**
   * Calculate benchmark comparison metrics - ИСПРАВЛЕНО
   */
  static calculateBenchmarkComparison(
    portfolioMetrics: CalculatedMetrics,
    portfolioReturns: PortfolioPerformancePoint[],
    benchmarkData: BenchmarkDataPoint[]
  ): ComparisonMetrics {
    // Align portfolio and benchmark data by dates
    const alignedData = this.alignPortfolioAndBenchmark(portfolioReturns, benchmarkData);

    if (alignedData.length < 2) {
      // Fallback if not enough data
      return {
        portfolio: portfolioMetrics,
        benchmark: {
          totalReturn: 15, // Assume 15% S&P 500 return
          volatility: 18,
          sharpeRatio: 0.8,
          maxDrawdown: -12,
          period: portfolioMetrics.period
        },
        alpha: portfolioMetrics.totalReturn - 15,
        beta: 1.0,
        correlation: 0.7,
        trackingError: 8,
        informationRatio: (portfolioMetrics.totalReturn - 15) / 8,
        outperformance: portfolioMetrics.totalReturn - 15
      };
    }

    // Calculate benchmark metrics
    const benchmarkReturns = alignedData.map(d => d.benchmarkReturn);
    const benchmarkTotalReturn = alignedData[alignedData.length - 1]?.benchmarkCumulative || 0;
    const benchmarkVolatility = this.calculateVolatility(benchmarkReturns);
    const benchmarkSharpe = this.calculateSharpeFromReturns(benchmarkReturns, 0.05);
    const benchmarkDrawdown = this.calculateDrawdownFromReturns(
      alignedData.map(d => ({ portfolioValue: 100 * (1 + d.benchmarkCumulative / 100) }))
    );

    // Calculate comparison metrics
    const portfolioReturnsAligned = alignedData.map(d => d.portfolioReturn);
    const correlation = this.calculateCorrelation(portfolioReturnsAligned, benchmarkReturns);
    const beta = this.calculateBeta(portfolioReturnsAligned, benchmarkReturns);

    // Calculate alpha: Portfolio return - (Risk-free rate + Beta * (Benchmark return - Risk-free rate))
    const riskFreeRate = 5; // 5% annual
    const alpha = portfolioMetrics.totalReturn - (riskFreeRate + beta * (benchmarkTotalReturn - riskFreeRate));

    const trackingError = this.calculateVolatility(
      alignedData.map(d => d.portfolioReturn - d.benchmarkReturn)
    );
    const informationRatio = trackingError === 0 ? 0 : alpha / trackingError;

    return {
      portfolio: portfolioMetrics,
      benchmark: {
        totalReturn: benchmarkTotalReturn,
        volatility: benchmarkVolatility,
        sharpeRatio: benchmarkSharpe,
        maxDrawdown: benchmarkDrawdown,
        period: portfolioMetrics.period
      },
      alpha,
      beta,
      correlation,
      trackingError,
      informationRatio,
      outperformance: portfolioMetrics.totalReturn - benchmarkTotalReturn
    };
  }

  /**
   * Helper methods for benchmark comparison
   */
  private static alignPortfolioAndBenchmark(
    portfolioData: PortfolioPerformancePoint[],
    benchmarkData: BenchmarkDataPoint[]
  ) {
    const aligned: Array<{
      date: Date;
      portfolioReturn: number;
      benchmarkReturn: number;
      portfolioCumulative: number;
      benchmarkCumulative: number;
    }> = [];

    portfolioData.forEach(portfolioPoint => {
      const benchmarkPoint = benchmarkData.find(b =>
        b.dateString === portfolioPoint.dateString
      );

      if (benchmarkPoint) {
        aligned.push({
          date: portfolioPoint.date,
          portfolioReturn: portfolioPoint.dailyReturn,
          benchmarkReturn: benchmarkPoint.change,
          portfolioCumulative: portfolioPoint.cumulativeReturn,
          benchmarkCumulative: benchmarkPoint.cumulativeReturn
        });
      }
    });

    return aligned;
  }

  private static calculateVolatility(returns: number[]): number {
    if (returns.length < 2) return 0;

    const avg = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - avg, 2), 0) / (returns.length - 1);

    return Math.sqrt(variance) * Math.sqrt(252); // Annualized
  }

  private static calculateCorrelation(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length < 2) return 0;

    const n = x.length;
    const avgX = x.reduce((a, b) => a + b, 0) / n;
    const avgY = y.reduce((a, b) => a + b, 0) / n;

    let numerator = 0;
    let sumXSquared = 0;
    let sumYSquared = 0;

    for (let i = 0; i < n; i++) {
      const deltaX = x[i] - avgX;
      const deltaY = y[i] - avgY;
      numerator += deltaX * deltaY;
      sumXSquared += deltaX * deltaX;
      sumYSquared += deltaY * deltaY;
    }

    const denominator = Math.sqrt(sumXSquared * sumYSquared);
    return denominator === 0 ? 0 : numerator / denominator;
  }

  private static calculateBeta(portfolioReturns: number[], benchmarkReturns: number[]): number {
    if (portfolioReturns.length !== benchmarkReturns.length || portfolioReturns.length < 2) return 1;

    const correlation = this.calculateCorrelation(portfolioReturns, benchmarkReturns);
    const portfolioVol = this.calculateVolatility(portfolioReturns);
    const benchmarkVol = this.calculateVolatility(benchmarkReturns);

    return benchmarkVol === 0 ? 1 : (correlation * portfolioVol) / benchmarkVol;
  }

  private static calculateSharpeFromReturns(returns: number[], riskFreeRate: number): number {
    if (returns.length < 2) return 0;

    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const volatility = this.calculateVolatility(returns);

    return volatility === 0 ? 0 : (avgReturn * 252 - riskFreeRate * 100) / volatility;
  }

  private static calculateDrawdownFromReturns(data: Array<{ portfolioValue: number }>): number {
    let maxDrawdown = 0;
    let peak = data[0]?.portfolioValue || 100;

    data.forEach(point => {
      if (point.portfolioValue > peak) {
        peak = point.portfolioValue;
      } else {
        const drawdown = ((peak - point.portfolioValue) / peak) * 100;
        maxDrawdown = Math.max(maxDrawdown, drawdown);
      }
    });

    return -maxDrawdown;
  }

  /**
   * Calculate metrics for specific time period
   */
  static calculatePeriodMetrics(
    trades: ProcessedTradeRecord[],
    startDate: Date,
    endDate: Date,
    options: CalculationOptions = {
      startingPortfolioValue: 1000000,
      riskFreeRate: 0.05,
      includeBenchmarkComparison: false
    }
  ): CalculatedMetrics {
    const filteredTrades = trades.filter(trade =>
      trade.exitDate >= startDate && trade.exitDate <= endDate
    );

    return this.calculateMetrics(filteredTrades, options);
  }
}