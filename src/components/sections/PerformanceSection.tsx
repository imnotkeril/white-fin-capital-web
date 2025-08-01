import React, { useState, useEffect } from 'react';
import { RefreshCw, AlertCircle, FileText, DollarSign, Shield, Target } from 'lucide-react';
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

// Иконки для KPI карточек
  const kpiIcons = [
    <DollarSign className="w-10 h-10 text-primary-500" />, // Ann. Portfolio Return
    <Shield className="w-10 h-10 text-primary-500" />,     // Max. Portfolio Drawdown
    <Target className="w-10 h-10 text-primary-500" />      // Win Rate
  ];
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

  // Format date as dd/mm/yyyy
  const formatDateDDMMYYYY = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

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

      // 4. Создаем данные ВСЕХ трейдов для таблицы (с новым форматом дат)
      const tradesForTable = trades
        .sort((a, b) => b.exitDate.getTime() - a.exitDate.getTime())
        .map(trade => ({
          id: `${trade.ticker}-${trade.exitDate.getTime()}`,
          symbol: trade.ticker,
          type: trade.position,
          entryPrice: trade.avgPrice,
          exitPrice: trade.exitPrice,
          pnl: 0, // Убираем PnL в долларах
          return: trade.pnlPercent,
          closedAt: formatDateDDMMYYYY(trade.exitDate),
          entryDate: formatDateDDMMYYYY(trade.entryDate)
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
                padding="lg"
                className="text-center transition-all duration-200 hover:-translate-y-1"
              >
                <div className="flex justify-center mb-4">
                  {kpiIcons[index]}
                </div>
                <div className="text-text-secondary text-sm mb-2 font-medium">
                  {kpi.label}
                </div>
                <div className="text-3xl font-bold mb-1 text-text-primary">
                  {formatValue(kpi.value, kpi.format)}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Open Trade Journal Button */}
        <div className="mb-8">
          <div
            onClick={handleToggleTradeJournal}
            className="w-full cursor-pointer bg-background-secondary border-2 border-border rounded-lg px-6 py-4 hover:bg-background-tertiary hover:border-primary-500/50 transition-all duration-200 text-center"
          >
            <div className="flex items-center justify-center gap-2 text-text-primary font-medium">
              <FileText className="w-4 h-4" />
              {showTradeJournal ? 'Close Trade Journal' : 'Open Trade Journal'}
            </div>
          </div>
        </div>

        {/* Trade Journal - ПОЛНОРАЗМЕРНАЯ ТАБЛИЦА КАК В ОРИГИНАЛЕ */}
        {showTradeJournal && (
          <div className="space-y-8">
            {/* ПОЛНОРАЗМЕРНАЯ Trade Journal Card */}
            <Card ocean padding="lg">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-text-primary">
                  2024-2025 ({allTrades.length} trades)
                </h3>
              </div>

              {/* ПОЛНОРАЗМЕРНАЯ Scrollable Table - ТОЧНО КАК В ПЕРВОМ ИЗОБРАЖЕНИИ */}
              <div className="max-h-[600px] overflow-y-auto">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="sticky top-0 bg-background-secondary/90 backdrop-blur-sm">
                      <tr className="border-b-2 border-border">
                        <th className="text-center text-text-secondary font-medium pb-3 pt-3 px-4 w-20">Ticker</th>
                        <th className="text-center text-text-secondary font-medium pb-3 pt-3 px-4 w-24">Direction</th>
                        <th className="text-center text-text-secondary font-medium pb-3 pt-3 px-4 w-28">Entry Date</th>
                        <th className="text-center text-text-secondary font-medium pb-3 pt-3 px-4 w-36">Avg. Entry Price</th>
                        <th className="text-center text-text-secondary font-medium pb-3 pt-3 px-4 w-28">Exit Date</th>
                        <th className="text-center text-text-secondary font-medium pb-3 pt-3 px-4 w-28">Exit Price</th>
                        <th className="text-center text-text-secondary font-medium pb-3 pt-3 px-4 w-24">PnL %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allTrades.map((trade, index) => (
                        <tr key={trade.id} className="border-b border-border hover:bg-background-secondary/30 transition-colors duration-200">
                          <td className="py-3 px-4 font-medium text-text-primary text-center w-20">{trade.symbol}</td>
                          <td className="py-3 px-4 text-center w-24">
                            <span className="px-2 py-1 rounded-md text-xs font-medium uppercase bg-background-secondary/50 text-text-primary border border-border">
                              {trade.type}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-text-secondary text-sm text-center w-28">{trade.entryDate}</td>
                          <td className="py-3 px-4 text-text-primary text-center w-36">
                            {trade.entryPrice.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-text-secondary text-sm text-center w-28">{trade.closedAt}</td>
                          <td className="py-3 px-4 text-text-primary text-center w-28">
                            {trade.exitPrice.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 font-medium text-center text-text-primary w-24">
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