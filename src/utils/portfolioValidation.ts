// Portfolio validation utilities - ИСПРАВЛЕНО: правильная обработка exposure
import { ProcessedTradeRecord } from '../types/realData';

export class PortfolioValidation {
  /**
   * Portfolio exposure validation - ИСПРАВЛЕНО
   */
  static validateExposures(trades: ProcessedTradeRecord[]): {
    isValid: boolean;
    totalExposure: number;
    warnings: string[];
    recommendations: string[];
  } {
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // Считаем общую экспозицию (exposure уже в формате долей 0-1)
    const totalExposure = trades.reduce((sum, trade) => sum + trade.portfolioExposure, 0);

    // ИСПРАВЛЕНО: Проверяем exposure как доли, а не проценты
    if (totalExposure > 1.5) {
      warnings.push(`Total exposure ${(totalExposure * 100).toFixed(1)}% exceeds 150%`);
      recommendations.push('Check overlapping positions and normalize weights');
    }

    if (totalExposure > 10) {
      warnings.push('Critically high exposure - possible data errors');
      recommendations.push('Review exposure calculation methodology');
    }

    // Check individual positions (exposure > 20% = > 0.2 в долях)
    const largePositions = trades.filter(t => t.portfolioExposure > 0.2);
    if (largePositions.length > 0) {
      warnings.push(`${largePositions.length} positions with exposure > 20%`);
      // Логируем крупные позиции для отладки
      largePositions.slice(0, 5).forEach(trade => {
        console.log(`🔍 Large position: ${trade.ticker} = ${(trade.portfolioExposure * 100).toFixed(1)}%`);
      });
    }

    // ДОПОЛНИТЕЛЬНАЯ ПРОВЕРКА: Если у нас слишком много маленьких позиций
    const tinyPositions = trades.filter(t => t.portfolioExposure < 0.01); // < 1%
    if (tinyPositions.length > trades.length * 0.3) {
      warnings.push(`High number of tiny positions (${tinyPositions.length} < 1%)`);
      recommendations.push('Consider consolidating small positions');
    }

    return {
      isValid: totalExposure <= 1.5, // 150% считается максимумом
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

  /**
   * НОВАЯ ФУНКЦИЯ: Детальная диагностика экспозиции
   */
  static diagnoseExposureIssues(trades: ProcessedTradeRecord[]): {
    summary: string;
    details: Array<{
      ticker: string;
      exposure: number;
      exposurePercent: string;
      impact: number;
      pnl: number;
      suspicious: boolean;
      reason?: string;
    }>;
  } {
    const details = trades.map(trade => {
      const suspicious =
        trade.portfolioExposure > 1 || // > 100%
        trade.portfolioExposure < 0 || // отрицательная
        (Math.abs(trade.portfolioImpact) > 50); // слишком большое влияние

      let reason: string | undefined;
      if (trade.portfolioExposure > 1) reason = 'Exposure > 100%';
      else if (trade.portfolioExposure < 0) reason = 'Negative exposure';
      else if (Math.abs(trade.portfolioImpact) > 50) reason = 'Extreme portfolio impact';

      return {
        ticker: trade.ticker,
        exposure: trade.portfolioExposure,
        exposurePercent: `${(trade.portfolioExposure * 100).toFixed(2)}%`,
        impact: trade.portfolioImpact,
        pnl: trade.pnlPercent,
        suspicious,
        reason
      };
    });

    const suspiciousCount = details.filter(d => d.suspicious).length;
    const totalExposure = trades.reduce((sum, t) => sum + t.portfolioExposure, 0);

    const summary = `
      📊 Exposure Analysis:
      - Total trades: ${trades.length}
      - Total exposure: ${(totalExposure * 100).toFixed(1)}%
      - Suspicious trades: ${suspiciousCount}
      - Average exposure: ${((totalExposure / trades.length) * 100).toFixed(2)}%
    `.trim();

    return {
      summary,
      details: details.sort((a, b) => b.exposure - a.exposure) // сортируем по убыванию exposure
    };
  }

  /**
   * НОВАЯ ФУНКЦИЯ: Быстрая проверка данных
   */
  static quickHealthCheck(trades: ProcessedTradeRecord[]): {
    status: 'healthy' | 'warning' | 'critical';
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];

    const totalExposure = trades.reduce((sum, t) => sum + t.portfolioExposure, 0);

    // Критические проблемы
    if (totalExposure > 10) {
      issues.push(`Critical: Total exposure ${(totalExposure * 100).toFixed(0)}% is extremely high`);
      recommendations.push('Check data format - exposure might be in wrong units');
      return { status: 'critical', issues, recommendations };
    }

    // Предупреждения
    if (totalExposure > 2) {
      issues.push(`Warning: High total exposure ${(totalExposure * 100).toFixed(1)}%`);
      recommendations.push('Review position sizing and overlapping trades');
    }

    const extremePositions = trades.filter(t => t.portfolioExposure > 0.5).length;
    if (extremePositions > 0) {
      issues.push(`Warning: ${extremePositions} positions with >50% exposure`);
      recommendations.push('Consider reducing position sizes');
    }

    const status = issues.length > 0 ? 'warning' : 'healthy';
    return { status, issues, recommendations };
  }
}