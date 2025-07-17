import { ProcessedTradeRecord } from '../types/realData';

export class PortfolioValidation {
  /**
   * Portfolio exposure validation
   */
  static validateExposures(trades: ProcessedTradeRecord[]): {
    isValid: boolean;
    totalExposure: number;
    warnings: string[];
    recommendations: string[];
  } {
    const warnings: string[] = [];
    const recommendations: string[] = [];

    const totalExposure = trades.reduce((sum, trade) => sum + trade.portfolioExposure, 0);

    if (totalExposure > 1.5) {
      warnings.push(`Total exposure ${(totalExposure * 100).toFixed(1)}% exceeds 150%`);
      recommendations.push('Check overlapping positions and normalize weights');
    }

    if (totalExposure > 10) {
      warnings.push('Critically high exposure - possible data errors');
      recommendations.push('Review exposure calculation methodology');
    }

    // Check individual positions
    const largePositions = trades.filter(t => t.portfolioExposure > 0.2);
    if (largePositions.length > 0) {
      warnings.push(`${largePositions.length} positions with exposure > 20%`);
    }

    return {
      isValid: totalExposure <= 1.5,
      totalExposure,
      warnings,
      recommendations
    };
  }

  /**
   * Drawdown validation
   */
  static validateDrawdowns(trades: ProcessedTradeRecord[]): {
    maxPositionDrawdown: number;
    largeDrawdownCount: number;
    warnings: string[];
  } {
    const warnings: string[] = [];
    const drawdowns = trades.map(t => t.positionLow && t.entryPrice
      ? ((t.positionLow - t.entryPrice) / t.entryPrice) * 100
      : 0
    );

    const maxPositionDrawdown = Math.min(...drawdowns);
    const largeDrawdownCount = drawdowns.filter(dd => dd < -20).length;

    if (maxPositionDrawdown < -30) {
      warnings.push(`Extreme drawdown: ${maxPositionDrawdown.toFixed(1)}%`);
    }

    if (largeDrawdownCount > trades.length * 0.1) {
      warnings.push(`High percentage of large drawdowns: ${largeDrawdownCount} positions`);
    }

    return {
      maxPositionDrawdown,
      largeDrawdownCount,
      warnings
    };
  }
}