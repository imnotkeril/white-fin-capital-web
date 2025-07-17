// Performance calculator service for trading data - ИСПРАВЛЕНО: правильная обработка exposure
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
   * Calculate all performance metrics from trade data - ИСПРАВЛЕНО
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

    // ИСПРАВЛЕНО: Правильная валидация exposure (теперь в долях)
    const totalExposure = trades.reduce((sum, trade) => sum + trade.portfolioExposure, 0);

    if (totalExposure > 1.5) { // Более 150%
      console.warn(`⚠️ High total exposure: ${(totalExposure * 100).toFixed(1)}%. Check for leverage or data errors.`);
    }

    // Log sample trades for debugging - ИСПРАВЛЕНО формат вывода
    console.log('Sample trades for debugging:');
    trades.slice(0, 3).forEach(trade => {
      console.log(`${trade.ticker}: PnL=${trade.pnlPercent.toFixed(2)}%, Exposure=${(trade.portfolioExposure * 100).toFixed(2)}%, Impact=${trade.portfolioImpact.toFixed(4)}%`);
    });

    // УБРАНО дублирование проверки

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
      averageExposure: averageExposure * 100, // Конвертируем обратно в проценты для отображения
      period: {
        startDate,
        endDate,
        totalDays
      }
    };
  }

  /**
   * Calculate portfolio returns over time - ИСПРАВЛЕНО
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

      // ИСПРАВЛЕНО: portfolioImpact уже правильно рассчитан в processRecord
      const dayPortfolioImpact = dayTrades.reduce((sum, trade) => {
        return sum + trade.portfolioImpact;
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
   * Calculate maximum drawdown from portfolio returns - ИСПРАВЛЕНО
   */
  private static calculateMaxDrawdown(returns: PortfolioPerformancePoint[]): number {
    if (returns.length === 0) return 0;

    let maxDrawdown = 0;
    let peak = 0; // Начинаем с 0 (базовая доходность)

    returns.forEach(point => {
      // Update peak cumulative return
      peak = Math.max(peak, point.cumulativeReturn);

      // Calculate current drawdown from peak
      const currentDrawdown = peak - point.cumulativeReturn;

      // Update maximum drawdown
      maxDrawdown = Math.max(maxDrawdown, currentDrawdown);
    });

    return -maxDrawdown; // Return as negative value
  }

  /**
   * Calculate Sharpe ratio from portfolio returns - ИСПРАВЛЕНО
   */
  private static calculateSharpeRatio(returns: PortfolioPerformancePoint[], riskFreeRate: number): number {
    if (returns.length < 2) return 0;

    const dailyReturns = returns.map(r => r.dailyReturn);
    const avgDailyReturn = dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length;
    const volatility = this.calculateVolatility(dailyReturns);

    if (volatility === 0) return 0;

    // Annualize returns and calculate Sharpe
    const annualizedReturn = avgDailyReturn * 252; // 252 trading days
    const annualizedVolatility = volatility * Math.sqrt(252);
    const annualizedRiskFreeRate = riskFreeRate * 100; // Convert to percentage

    return (annualizedReturn - annualizedRiskFreeRate) / annualizedVolatility;
  }

  /**
   * Calculate Sortino ratio - focuses on downside deviation
   */
  static calculateSortinoRatio(returns: PortfolioPerformancePoint[], targetReturn: number = 0): number {
    if (returns.length < 2) return 0;

    const dailyReturns = returns.map(r => r.dailyReturn);
    const avgDailyReturn = dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length;

    // Calculate downside deviation
    const downsideReturns = dailyReturns.filter(r => r < targetReturn);
    if (downsideReturns.length === 0) return 0;

    const downsideVariance = downsideReturns.reduce((sum, ret) =>
      sum + Math.pow(ret - targetReturn, 2), 0
    ) / downsideReturns.length;

    const downsideDeviation = Math.sqrt(downsideVariance);

    if (downsideDeviation === 0) return 0;

    // Annualize
    const annualizedReturn = avgDailyReturn * 252;
    const annualizedDownsideDeviation = downsideDeviation * Math.sqrt(252);
    const annualizedTargetReturn = targetReturn * 252;

    return (annualizedReturn - annualizedTargetReturn) / annualizedDownsideDeviation;
  }

  /**
   * Calculate volatility (standard deviation) - ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ
   */
  private static calculateVolatility(returns: number[]): number {
    if (returns.length < 2) return 0;

    const avg = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - avg, 2), 0) / returns.length;

    return Math.sqrt(variance);
  }

  /**
   * Calculate profit factor
   */
  private static calculateProfitFactor(winningPnL: number[], losingPnL: number[]): number {
    const totalWins = winningPnL.reduce((a, b) => a + b, 0);
    const totalLosses = Math.abs(losingPnL.reduce((a, b) => a + b, 0));

    return totalLosses === 0 ? (totalWins > 0 ? 999 : 0) : totalWins / totalLosses;
  }

  /**
   * Calculate expectancy
   */
  private static calculateExpectancy(winningPnL: number[], losingPnL: number[], winRate: number): number {
    const avgWin = winningPnL.length > 0 ? winningPnL.reduce((a, b) => a + b, 0) / winningPnL.length : 0;
    const avgLoss = losingPnL.length > 0 ? losingPnL.reduce((a, b) => a + b, 0) / losingPnL.length : 0;

    return (winRate / 100) * avgWin + ((100 - winRate) / 100) * avgLoss;
  }

  /**
   * Calculate consecutive wins/losses
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
      } else if (trade.pnlPercent < 0) {
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
   * Calculate correlation between two series
   */
  private static calculateCorrelation(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length < 2) return 0;

    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  }

  /**
   * Calculate beta (portfolio sensitivity to benchmark)
   */
  private static calculateBeta(portfolioReturns: number[], benchmarkReturns: number[]): number {
    if (portfolioReturns.length !== benchmarkReturns.length || portfolioReturns.length < 2) return 1;

    const benchmarkVariance = this.calculateVolatility(benchmarkReturns) ** 2;
    if (benchmarkVariance === 0) return 1;

    const covariance = this.calculateCovariance(portfolioReturns, benchmarkReturns);
    return covariance / benchmarkVariance;
  }

  /**
   * Calculate covariance between two series
   */
  private static calculateCovariance(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length < 2) return 0;

    const avgX = x.reduce((a, b) => a + b, 0) / x.length;
    const avgY = y.reduce((a, b) => a + b, 0) / y.length;

    return x.reduce((sum, xi, i) => sum + (xi - avgX) * (y[i] - avgY), 0) / x.length;
  }

  /**
   * Align portfolio and benchmark data by dates for comparison
   */
  private static alignPortfolioAndBenchmark(
    portfolioReturns: PortfolioPerformancePoint[],
    benchmarkData: BenchmarkDataPoint[]
  ): Array<{
    date: Date;
    portfolioReturn: number;
    benchmarkReturn: number;
    portfolioCumulative: number;
    benchmarkCumulative: number;
  }> {
    const aligned: Array<{
      date: Date;
      portfolioReturn: number;
      benchmarkReturn: number;
      portfolioCumulative: number;
      benchmarkCumulative: number;
    }> = [];

    // Create date maps for efficient lookup
    const portfolioMap = new Map(
      portfolioReturns.map(p => [p.dateString, p])
    );
    const benchmarkMap = new Map(
      benchmarkData.map(b => [b.date.toISOString().split('T')[0], b])
    );

    // Find common dates
    portfolioReturns.forEach(portfolioPoint => {
      const benchmarkPoint = benchmarkMap.get(portfolioPoint.dateString);
      if (benchmarkPoint) {
        aligned.push({
          date: portfolioPoint.date,
          portfolioReturn: portfolioPoint.dailyReturn,
          benchmarkReturn: benchmarkPoint.dailyReturn,
          portfolioCumulative: portfolioPoint.cumulativeReturn,
          benchmarkCumulative: benchmarkPoint.cumulativeReturn
        });
      }
    });

    return aligned.sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  /**
   * Calculate benchmark comparison metrics
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
    const benchmarkVolatility = this.calculateVolatility(benchmarkReturns) * Math.sqrt(252);
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
    ) * Math.sqrt(252);

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
   * Helper: Calculate Sharpe ratio from returns array
   */
  private static calculateSharpeFromReturns(returns: number[], riskFreeRate: number): number {
    if (returns.length < 2) return 0;

    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const volatility = this.calculateVolatility(returns);

    if (volatility === 0) return 0;

    const annualizedReturn = avgReturn * 252;
    const annualizedVolatility = volatility * Math.sqrt(252);
    const annualizedRiskFreeRate = riskFreeRate * 100;

    return (annualizedReturn - annualizedRiskFreeRate) / annualizedVolatility;
  }

  /**
   * Helper: Calculate drawdown from portfolio values
   */
  private static calculateDrawdownFromReturns(portfolioValues: Array<{ portfolioValue: number }>): number {
    if (portfolioValues.length === 0) return 0;

    let maxDrawdown = 0;
    let peak = portfolioValues[0].portfolioValue;

    portfolioValues.forEach(point => {
      peak = Math.max(peak, point.portfolioValue);
      const drawdown = (peak - point.portfolioValue) / peak * 100;
      maxDrawdown = Math.max(maxDrawdown, drawdown);
    });

    return -maxDrawdown;
  }
}