// Real trading data types for White Fin Capital

export interface RawTradeRecord {
  Ticker: string;
  Position: string;
  'Entry Date': string | Date;
  'Avg. Price': string | number;
  'Exit Date': string | Date;
  'Exit Price': string | number;
  'PnL %': string | number;
  'Portfolio Exposure': string | number;
  Source: string;
  'Position High': string | number;
  'Position Low': string | number;
  Drawdown: string | number;
  'Run Up': string | number;
}

export interface ProcessedTradeRecord {
  id: string;
  ticker: string;
  position: 'LONG' | 'SHORT';
  entryDate: Date;
  avgPrice: number;
  exitDate: Date;
  exitPrice: number;
  pnlPercent: number;
  portfolioExposure: number;
  source: string;
  positionHigh: number;
  positionLow: number;
  drawdown: number;
  runUp: number;
  // Calculated fields
  holdingDays: number;
  absolutePnL: number;
  portfolioImpact: number; // PnL% * Portfolio Exposure / 100
}

export interface PortfolioPerformancePoint {
  date: Date;
  dateString: string;
  cumulativeReturn: number;
  dailyReturn: number;
  portfolioValue: number; // Assuming starting value of 100
  activeTrades: number;
  totalExposure: number;
}

export interface CalculatedMetrics {
  totalReturn: number;
  winRate: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  averageGain: number;
  averageLoss: number;
  bestTrade: number;
  worstTrade: number;
  averageHoldingDays: number;
  maxDrawdown: number;
  sharpeRatio: number;
  profitFactor: number;
  expectancy: number;
  maxConsecutiveWins: number;
  maxConsecutiveLosses: number;
  largestWin: number;
  largestLoss: number;
  averageExposure: number;
  period: {
    startDate: Date;
    endDate: Date;
    totalDays: number;
  };
}

export interface ValidationError {
  row: number;
  field: string;
  value: any;
  error: string;
}

export interface ParsedDataResult {
  success: boolean;
  data: ProcessedTradeRecord[];
  errors: ValidationError[];
  summary: {
    totalRows: number;
    validRows: number;
    invalidRows: number;
    duplicateRows: number;
  };
  rawData: RawTradeRecord[];
}

export interface BenchmarkDataPoint {
  date: Date;
  dateString: string;
  value: number;
  change: number;
  cumulativeReturn: number;
}

export interface ComparisonMetrics {
  portfolio: CalculatedMetrics;
  benchmark: {
    totalReturn: number;
    volatility: number;
    sharpeRatio: number;
    maxDrawdown: number;
    period: {
      startDate: Date;
      endDate: Date;
    };
  };
  alpha: number;
  beta: number;
  correlation: number;
  trackingError: number;
  informationRatio: number;
  outperformance: number;
}

// Data validation schema
export interface ValidationSchema {
  requiredFields: (keyof RawTradeRecord)[];
  fieldValidators: {
    [K in keyof RawTradeRecord]?: (value: any) => ValidationError | null;
  };
}

// Performance calculation options
export interface CalculationOptions {
  startingPortfolioValue: number;
  riskFreeRate: number; // For Sharpe ratio calculation
  benchmarkData?: BenchmarkDataPoint[];
  includeBenchmarkComparison: boolean;
}

// Export types for components
export type {
  RawTradeRecord as RawTrade,
  ProcessedTradeRecord as Trade,
  PortfolioPerformancePoint as PerformancePoint,
  CalculatedMetrics as Metrics,
  BenchmarkDataPoint as BenchmarkPoint
};

export interface PortfolioValidationResult {
  exposureValidation: {
    isValid: boolean;
    totalExposure: number;
    warnings: string[];
  };
  drawdownValidation: {
    maxPositionDrawdown: number;
    warnings: string[];
  };
  recommendations: string[];
}

export { KPIData } from './index';