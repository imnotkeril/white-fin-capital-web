// Benchmark service for S&P 500 data
import { BenchmarkDataPoint } from '@/types/realData';

export class BenchmarkService {

  /**
   * Get S&P 500 data for the specified date range
   * In production, this would fetch from a real API like Alpha Vantage or Yahoo Finance
   */
  static async getSP500Data(startDate: Date, endDate: Date): Promise<BenchmarkDataPoint[]> {
    try {
      // For now, we'll generate realistic S&P 500 data based on 2024 performance
      return this.generateRealisticSP500Data(startDate, endDate);
    } catch (error) {
      console.error('Error fetching S&P 500 data:', error);
      return [];
    }
  }

  /**
   * Generate realistic S&P 500 data based on actual 2024 performance
   * S&P 500 was approximately:
   * - Start 2024: ~4,770
   * - End July 2024: ~5,500 (about 15.3% gain)
   * - End October 2024: ~5,800 (about 21.6% gain)
   */
  private static generateRealisticSP500Data(startDate: Date, endDate: Date): BenchmarkDataPoint[] {
    const data: BenchmarkDataPoint[] = [];

    // S&P 500 approximate values and key events in 2024
    const sp500Timeline = [
      { date: '2024-01-01', value: 4770, note: 'Start of year' },
      { date: '2024-01-31', value: 4900, note: 'January rally' },
      { date: '2024-02-29', value: 5100, note: 'February gains' },
      { date: '2024-03-31', value: 5254, note: 'Q1 end' },
      { date: '2024-04-30', value: 5035, note: 'April pullback' },
      { date: '2024-05-31', value: 5277, note: 'May recovery' },
      { date: '2024-06-30', value: 5460, note: 'Q2 end' },
      { date: '2024-07-31', value: 5522, note: 'July tech rally' },
      { date: '2024-08-31', value: 5648, note: 'August gains' },
      { date: '2024-09-30', value: 5762, note: 'Q3 end' },
      { date: '2024-10-31', value: 5808, note: 'October volatility' },
      { date: '2024-11-30', value: 5970, note: 'Election rally' }
    ];

    // Find relevant timeline points
    const relevantPoints = sp500Timeline.filter(point => {
      const pointDate = new Date(point.date);
      return pointDate >= startDate && pointDate <= endDate;
    });

    if (relevantPoints.length === 0) {
      // Fallback: generate simple data if no timeline points match
      return this.generateSimpleSP500Data(startDate, endDate);
    }

    // Generate daily data between timeline points
    for (let i = 0; i < relevantPoints.length; i++) {
      const currentPoint = relevantPoints[i];
      const nextPoint = relevantPoints[i + 1];

      const currentDate = new Date(currentPoint.date);
      const currentValue = currentPoint.value;

      if (nextPoint) {
        const nextDate = new Date(nextPoint.date);
        const nextValue = nextPoint.value;
        const daysBetween = Math.ceil((nextDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));

        // Generate daily values with realistic volatility
        for (let day = 0; day <= daysBetween; day++) {
          const date = new Date(currentDate.getTime() + day * 24 * 60 * 60 * 1000);

          if (date > endDate) break;
          if (date < startDate) continue;

          // Linear interpolation with added realistic volatility
          const progress = day / daysBetween;
          const baseValue = currentValue + (nextValue - currentValue) * progress;

          // Add daily volatility (S&P 500 typically has 1-2% daily volatility)
          const volatility = 0.015; // 1.5% daily volatility
          const randomFactor = 1 + (Math.random() - 0.5) * 2 * volatility;
          const value = baseValue * randomFactor;

          // Calculate daily change
          const previousValue = data.length > 0 ? data[data.length - 1].value : currentValue;
          const change = ((value - previousValue) / previousValue) * 100;

          // Calculate cumulative return from start
          const startValue = relevantPoints[0].value;
          const cumulativeReturn = ((value - startValue) / startValue) * 100;

          data.push({
            date,
            dateString: date.toISOString().split('T')[0],
            value: Math.round(value * 100) / 100,
            change: Math.round(change * 100) / 100,
            cumulativeReturn: Math.round(cumulativeReturn * 100) / 100
          });
        }
      } else {
        // Last point - just add it
        if (currentDate >= startDate && currentDate <= endDate) {
          const previousValue = data.length > 0 ? data[data.length - 1].value : currentValue;
          const change = data.length > 0 ? ((currentValue - previousValue) / previousValue) * 100 : 0;
          const startValue = relevantPoints[0].value;
          const cumulativeReturn = ((currentValue - startValue) / startValue) * 100;

          data.push({
            date: currentDate,
            dateString: currentDate.toISOString().split('T')[0],
            value: currentValue,
            change: Math.round(change * 100) / 100,
            cumulativeReturn: Math.round(cumulativeReturn * 100) / 100
          });
        }
      }
    }

    // Remove duplicates and sort by date
    const uniqueData = data.filter((point, index, array) =>
      index === 0 || point.dateString !== array[index - 1].dateString
    );

    return uniqueData.sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  /**
   * Simple S&P 500 data generator as fallback
   */
  private static generateSimpleSP500Data(startDate: Date, endDate: Date): BenchmarkDataPoint[] {
    const data: BenchmarkDataPoint[] = [];
    const startValue = 4770; // Approximate S&P 500 start of 2024

    // Calculate total days
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    // Assume approximately 15% annual return for 2024 (realistic for S&P 500)
    const annualReturn = 0.15;
    const dailyReturn = Math.pow(1 + annualReturn, 1 / 365) - 1;

    let currentDate = new Date(startDate);
    let currentValue = startValue;
    let cumulativeReturn = 0;

    for (let day = 0; day <= totalDays; day++) {
      if (currentDate > endDate) break;

      // Add realistic daily volatility
      const volatility = 0.015; // 1.5% daily volatility
      const randomFactor = 1 + (Math.random() - 0.5) * 2 * volatility;
      const adjustedDailyReturn = dailyReturn * randomFactor;

      if (day > 0) {
        const previousValue = currentValue;
        currentValue = currentValue * (1 + adjustedDailyReturn);
        const change = ((currentValue - previousValue) / previousValue) * 100;
        cumulativeReturn = ((currentValue - startValue) / startValue) * 100;

        data.push({
          date: new Date(currentDate),
          dateString: currentDate.toISOString().split('T')[0],
          value: Math.round(currentValue * 100) / 100,
          change: Math.round(change * 100) / 100,
          cumulativeReturn: Math.round(cumulativeReturn * 100) / 100
        });
      } else {
        // First day
        data.push({
          date: new Date(currentDate),
          dateString: currentDate.toISOString().split('T')[0],
          value: startValue,
          change: 0,
          cumulativeReturn: 0
        });
      }

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return data;
  }

  /**
   * Get benchmark data aligned with trading dates
   */
  static async getBenchmarkForTrades(tradeDates: Date[]): Promise<BenchmarkDataPoint[]> {
    if (tradeDates.length === 0) return [];

    const sortedDates = [...tradeDates].sort((a, b) => a.getTime() - b.getTime());
    const startDate = sortedDates[0];
    const endDate = sortedDates[sortedDates.length - 1];

    // Add some buffer days before start and after end
    const bufferedStart = new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days before
    const bufferedEnd = new Date(endDate.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days after

    const allBenchmarkData = await this.getSP500Data(bufferedStart, bufferedEnd);

    // Filter to only include dates that match trading dates (or closest business days)
    const alignedData: BenchmarkDataPoint[] = [];

    tradeDates.forEach(tradeDate => {
      const tradeDateString = tradeDate.toISOString().split('T')[0];

      // Try to find exact date match first
      let matchingPoint = allBenchmarkData.find(point => point.dateString === tradeDateString);

      // If no exact match, find closest date (within 3 days)
      if (!matchingPoint) {
        const tolerance = 3 * 24 * 60 * 60 * 1000; // 3 days in milliseconds
        matchingPoint = allBenchmarkData.find(point =>
          Math.abs(point.date.getTime() - tradeDate.getTime()) <= tolerance
        );
      }

      if (matchingPoint && !alignedData.find(p => p.dateString === matchingPoint!.dateString)) {
        alignedData.push(matchingPoint);
      }
    });

    return alignedData.sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  /**
   * Calculate benchmark statistics
   */
  static calculateBenchmarkStats(benchmarkData: BenchmarkDataPoint[]): {
    totalReturn: number;
    volatility: number;
    sharpeRatio: number;
    maxDrawdown: number;
    averageDailyReturn: number;
  } {
    if (benchmarkData.length === 0) {
      return {
        totalReturn: 0,
        volatility: 0,
        sharpeRatio: 0,
        maxDrawdown: 0,
        averageDailyReturn: 0
      };
    }

    const totalReturn = benchmarkData[benchmarkData.length - 1].cumulativeReturn;
    const dailyReturns = benchmarkData.slice(1).map(point => point.change);

    // Calculate volatility
    const avgDailyReturn = dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length;
    const variance = dailyReturns.reduce((sum, ret) => sum + Math.pow(ret - avgDailyReturn, 2), 0) / (dailyReturns.length - 1);
    const volatility = Math.sqrt(variance) * Math.sqrt(252); // Annualized

    // Calculate Sharpe ratio (assuming 5% risk-free rate)
    const riskFreeRate = 5; // 5% annual
    const annualizedReturn = avgDailyReturn * 252;
    const sharpeRatio = volatility === 0 ? 0 : (annualizedReturn - riskFreeRate) / volatility;

    // Calculate max drawdown
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

    return {
      totalReturn,
      volatility,
      sharpeRatio,
      maxDrawdown: -maxDrawdown,
      averageDailyReturn: avgDailyReturn
    };
  }

  /**
   * Load benchmark data for chart display
   */
  static async getBenchmarkChartData(startDate: Date, endDate: Date): Promise<Array<{
    date: string;
    value: number;
  }>> {
    const benchmarkData = await this.getSP500Data(startDate, endDate);

    return benchmarkData.map(point => ({
      date: point.dateString,
      value: point.cumulativeReturn
    }));
  }
}