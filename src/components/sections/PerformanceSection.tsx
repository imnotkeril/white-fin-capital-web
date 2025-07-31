import React, { useState, useEffect } from 'react';
import { RefreshCw, AlertCircle, FileText } from 'lucide-react';
import { formatDate } from '@/utils/formatting';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import { KPIData } from '@/types';

// Импорты упрощенных сервисов
import { ExcelProcessor } from '@/services/ExcelProcessor';
import { PerformanceCalculator } from '@/services/performanceCalculator';

interface TradeRecord {
  ticker: string;
  position: 'Long' | 'Short';
  entryDate: Date;
  avgPrice: number;
  exitDate: Date;
  exitPrice: number;
  pnlPercent: number;
  portfolioExposure: number;
  holdingDays: number;
  portfolioImpact: number;
}

interface BenchmarkPoint {
  date: Date;
  value: number;
  change: number;
  cumulativeReturn: number;
}

const PerformanceSection: React.FC = () => {
  // Simplified state
  const [showTradeJournal, setShowTradeJournal] = useState(false);
  const [kpiData, setKpiData] = useState<KPIData[]>([]);
  const [allTrades, setAllTrades] = useState<Array<any>>([]);

  // Loading and error state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Load initial data
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Loading real trading data...');

      // 1. Загружаем ВСЕ данные из CSV/Excel (трейды + бенчмарк)
      const { trades, benchmark: benchmarkPoints } = await ExcelProcessor.loadAllData();

      if (trades.length === 0) {
        throw new Error('No valid trades found in files');
      }

      console.log(`✅ Loaded: ${trades.length} trades, ${benchmarkPoints.length} benchmark points`);

      // 2. Рассчитываем метрики портфеля
      const metrics = PerformanceCalculator.calculateAllMetrics(trades, benchmarkPoints);

      // 3. Создаем только 3 основных KPI
      const kpis: KPIData[] = [
        {
          label: 'Ann. Portfolio Return',
          value: Math.round(metrics.totalReturn * 10) / 10,
          format: 'percentage' as const,
          trend: 'neutral' as const,
        },
        {
          label: 'Max. Portfolio Drawdown',
          value: Math.abs(Math.round(metrics.maxDrawdown * 10) / 10),
          format: 'percentage' as const,
          trend: 'neutral' as const,
        },
        {
          label: 'Win Rate',
          value: Math.round(metrics.winRate * 10) / 10,
          format: 'percentage' as const,
          trend: 'neutral' as const,
        },
      ];
      setKpiData(kpis);

      // 4. Создаем данные ВСЕХ трейдов для таблицы (без ограничения)
      const tradesForTable = trades
        .sort((a, b) => b.exitDate.getTime() - a.exitDate.getTime())
        .map(trade => ({
          id: `${trade.ticker}-${trade.exitDate.getTime()}`,
          symbol: trade.ticker,
          type: trade.position,
          entryPrice: trade.avgPrice,
          exitPrice: trade.exitPrice,
          pnl: trade.pnlPercent * trade.portfolioExposure * 10000,
          return: trade.pnlPercent,
          closedAt: trade.exitDate.toLocaleDateString(),
          entryDate: trade.entryDate.toLocaleDateString()
        }));
      setAllTrades(tradesForTable);

      setLastUpdated(new Date());
      console.log('✅ All data loaded successfully');

    } catch (err) {
      console.error('Error loading data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load trading data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshData = async () => {
    try {
      setKpiData([]);
      setAllTrades([]);
      await loadAllData();
    } catch (err) {
      setError('Failed to refresh data');
    }
  };

  const handleToggleTradeJournal = () => {
    setShowTradeJournal(!showTradeJournal);
  };

  // Форматирование чисел без цветов
  const formatValue = (value: number | string, format?: 'percentage' | 'number' | 'currency') => {
    if (typeof value === 'string') return value;

    switch (format) {
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'currency':
        return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      case 'number':
      default:
        return value.toString();
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <section id="performance" className="section bg-background">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-6">
              Performance
            </h2>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
              Loading real trading data and performance metrics...
            </p>
          </div>

          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <RefreshCw className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
              <p className="text-text-secondary">Loading trading data from Excel file...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section id="performance" className="section bg-background">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-6">
              Performance
            </h2>
          </div>

          <Card ocean padding="lg" className="max-w-md mx-auto text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-text-primary mb-2">
              Failed to Load Data
            </h3>
            <p className="text-text-secondary mb-6">
              {error}
            </p>
            <Button variant="primary" onClick={handleRefreshData} icon={<RefreshCw className="w-4 h-4" />}>
              Retry Loading
            </Button>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section id="performance" className="section bg-background">
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-6">
            Performance
          </h2>
          {/* Data Status */}
          <div className="flex items-center justify-center gap-4 mt-4">
            <span className="text-sm text-text-tertiary">
              Last updated: {lastUpdated ? formatDate(lastUpdated, 'medium') : 'Never'}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefreshData}
              icon={<RefreshCw className="w-4 h-4" />}
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Top 3 KPI Cards */}
        <div className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {kpiData.map((kpi, index) => (
              <Card
                key={index}
                ocean
                padding="md"
                className="text-center transition-all duration-200 hover:-translate-y-1"
              >
                <div className="text-text-secondary text-xs mb-1 font-medium">
                  {kpi.label}
                </div>
                <div className="text-xl font-bold mb-1 text-white">
                  {formatValue(kpi.value, kpi.format)}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Open Trade Journal Button - В ДЛИННОЙ РАМКЕ КАК В ОРИГИНАЛЕ */}
        <div className="mb-8">
          <Card ocean padding="lg">
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="lg"
                onClick={handleToggleTradeJournal}
                icon={<FileText className="w-4 h-4" />}
                className="px-6 py-2 text-sm"
              >
                {showTradeJournal ? 'Close Trade Journal' : 'Open Trade Journal'}
              </Button>
            </div>
          </Card>
        </div>

        {/* Trade Journal - ПОЛНОРАЗМЕРНАЯ ТАБЛИЦА КАК В ОРИГИНАЛЕ */}
        {showTradeJournal && (
          <div className="space-y-8">
            {/* ПОЛНОРАЗМЕРНАЯ Trade Journal Card */}
            <Card ocean padding="lg">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-text-primary">
                  Trade Journal ({allTrades.length} trades)
                </h3>
              </div>

              {/* ПОЛНОРАЗМЕРНАЯ Scrollable Table - ТОЧНО КАК В ПЕРВОМ ИЗОБРАЖЕНИИ */}
              <div className="max-h-[600px] overflow-y-auto">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="sticky top-0 bg-background-secondary/90 backdrop-blur-sm">
                      <tr className="border-b-2 border-border">
                        <th className="text-left text-text-secondary font-medium pb-3 pt-3 px-4">Date</th>
                        <th className="text-left text-text-secondary font-medium pb-3 pt-3 px-4">Symbol</th>
                        <th className="text-center text-text-secondary font-medium pb-3 pt-3 px-4">Type</th>
                        <th className="text-right text-text-secondary font-medium pb-3 pt-3 px-4">Entry</th>
                        <th className="text-right text-text-secondary font-medium pb-3 pt-3 px-4">Exit</th>
                        <th className="text-right text-text-secondary font-medium pb-3 pt-3 px-4">P&L ($)</th>
                        <th className="text-right text-text-secondary font-medium pb-3 pt-3 px-4">Return</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allTrades.map((trade, index) => (
                        <tr key={trade.id} className="border-b border-border hover:bg-background-secondary/30 transition-colors duration-200">
                          <td className="py-3 px-4 text-text-secondary text-sm">{trade.closedAt}</td>
                          <td className="py-3 px-4 font-medium text-white">{trade.symbol}</td>
                          <td className="py-3 px-4 text-center">
                            <span className="px-2 py-1 rounded-md text-xs font-medium uppercase bg-background-secondary/50 text-white border border-border">
                              {trade.type}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-white text-right">
                            ${trade.entryPrice.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-white text-right">
                            ${trade.exitPrice.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 font-medium text-right text-white">
                            {trade.pnl >= 0 ? '+' : ''}${Math.abs(trade.pnl).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-4 font-medium text-right text-white">
                            {trade.return >= 0 ? '+' : ''}{trade.return.toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </section>
  );
};

export default PerformanceSection;