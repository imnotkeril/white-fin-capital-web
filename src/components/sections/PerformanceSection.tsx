import React, { useState, useEffect, useMemo } from 'react';
import { Download, TrendingUp, Award, BarChart3, PieChart, RefreshCw, AlertCircle } from 'lucide-react';
import { formatPerformanceValue, formatDate } from '@/utils/formatting';
import { cn } from '@/utils/helpers';
import Button from '@/components/common/Button';
import Card, { MetricCard } from '@/components/common/Card';
import PerformanceChart from '@/components/charts/PerformanceChart';
import { KPIData } from '@/types';

// Импорты упрощенных сервисов
import { ExcelProcessor } from '@/services/ExcelProcessor';
import { PerformanceCalculator } from '@/services/performanceCalculator';

interface PeriodData {
  currentReturn: number;
  bestDay: number;
  worstDay: number;
  volatility: number;
  maxDrawdown: number;
  alpha: number;
  beta: number;
  totalTrades: number;
}

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
  const [selectedTab, setSelectedTab] = useState<'overview' | 'trades'>('overview');
  const [selectedPeriod, setSelectedPeriod] = useState<'1m' | '3m' | '6m' | '1y' | '2y' | 'all'>('1y');

  // Data state
  const [kpiData, setKpiData] = useState<KPIData[]>([]);
  const [performanceData, setPerformanceData] = useState<Array<{ date: string; value: number; label?: string }>>([]);
  const [benchmarkData, setBenchmarkData] = useState<Array<{ date: string; value: number; label?: string }>>([]);
  const [closedTrades, setClosedTrades] = useState<Array<any>>([]);
  const [tradeStats, setTradeStats] = useState<KPIData[]>([]);
  const [periodData, setPeriodData] = useState<PeriodData | null>(null);

  // Loading and error state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'trades', label: 'Trade Journal', icon: Award },
  ] as const;

  const periods = [
    { id: '3m', label: '3 Months' },
    { id: '6m', label: '6 Months' },
    { id: '1y', label: '1 Year' },
    { id: '2y', label: '2 Years' },
    { id: 'all', label: 'All Time' },
  ] as const;

  // Load initial data
  useEffect(() => {
    loadAllData();
  }, []);

  // Load period-specific data when period changes
  useEffect(() => {
    loadPeriodData();
  }, [selectedPeriod]);

  const loadAllData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Loading real trading data...');

      // 1. Загружаем ВСЕ данные из Excel (трейды + бенчмарк)
      const { trades, benchmark: benchmarkPoints } = await ExcelProcessor.loadAllData();

      if (trades.length === 0) {
        throw new Error('No valid trades found in Excel file');
      }

      // 2. Рассчитываем метрики портфеля
      const metrics = PerformanceCalculator.calculateAllMetrics(trades);

      // 3. Создаем KPI данные
      const kpis: KPIData[] = [
        {
          label: 'Total Return',
          value: Math.round(metrics.totalReturn * 10) / 10,
          format: 'percentage' as const,
          trend: metrics.totalReturn > 0 ? 'up' as const : 'down' as const,
        },
        {
          label: 'Win Rate',
          value: Math.round(metrics.winRate * 10) / 10,
          format: 'percentage' as const,
          trend: metrics.winRate > 50 ? 'up' as const : 'down' as const,
        },
        {
          label: 'Sharpe Ratio',
          value: Math.round(metrics.sharpeRatio * 100) / 100,
          format: 'number' as const,
          trend: metrics.sharpeRatio > 1 ? 'up' as const : metrics.sharpeRatio > 0.5 ? 'neutral' as const : 'down' as const,
        },
        {
          label: 'Max Drawdown',
          value: Math.round(Math.abs(metrics.maxDrawdown) * 10) / 10,
          format: 'percentage' as const,
          trend: Math.abs(metrics.maxDrawdown) < 10 ? 'up' as const : 'down' as const,
        },
        {
          label: 'Profit Factor',
          value: Math.round(metrics.profitFactor * 100) / 100,
          format: 'number' as const,
          trend: metrics.profitFactor > 1.5 ? 'up' as const : metrics.profitFactor > 1 ? 'neutral' as const : 'down' as const,
        },
      ];
      setKpiData(kpis);

      // 4. Создаем данные для графика портфеля
      const portfolioTimeSeries = PerformanceCalculator.calculateTimeSeries(trades);
      const perfData = portfolioTimeSeries.map(point => ({
        date: point.date.toISOString().split('T')[0],
        value: Math.round(point.cumulativeReturn * 100) / 100,
        label: `Portfolio: ${Math.round(point.cumulativeReturn * 100) / 100}%`
      }));
      setPerformanceData(perfData);

      // 5. Создаем данные для графика бенчмарка - С ОТЛАДКОЙ
      console.log(`📊 Creating benchmark chart data from ${benchmarkPoints.length} points`);

      if (benchmarkPoints.length === 0) {
        console.warn('⚠️ No benchmark points available!');
        setBenchmarkData([]);
      } else {
        console.log('📊 Sample benchmark points:');
        benchmarkPoints.slice(0, 3).forEach(point => {
          console.log(`   ${point.date.toISOString().split('T')[0]}: ${point.value} (${point.cumulativeReturn.toFixed(2)}%)`);
        });

        const benchData = benchmarkPoints.map(point => ({
          date: point.date.toISOString().split('T')[0],
          value: Math.round(point.cumulativeReturn * 100) / 100,
          label: `S&P 500: ${Math.round(point.cumulativeReturn * 100) / 100}%`
        }));

        console.log(`✅ Created ${benchData.length} benchmark chart points`);
        console.log('📊 Sample chart data:', benchData.slice(0, 3));

        setBenchmarkData(benchData);
      }

      // 6. Создаем данные закрытых трейдов для таблицы
      const tradesForTable = trades
        .sort((a, b) => b.exitDate.getTime() - a.exitDate.getTime())
        .slice(0, 20)
        .map(trade => ({
          id: `${trade.ticker}-${trade.exitDate.getTime()}`,
          symbol: trade.ticker,
          type: trade.position,
          entryPrice: trade.avgPrice,
          exitPrice: trade.exitPrice,
          pnl: trade.pnlPercent * trade.portfolioExposure * 10000, // Примерный расчет в долларах
          return: trade.pnlPercent,
          closedAt: trade.exitDate.toLocaleDateString(),
          entryDate: trade.entryDate.toLocaleDateString()
        }));
      setClosedTrades(tradesForTable);

      // 7. Создаем РАСШИРЕННУЮ статистику трейдов
      const winningTrades = trades.filter(t => t.pnlPercent > 0);
      const losingTrades = trades.filter(t => t.pnlPercent <= 0);

      // Рассчитываем детальные метрики
      const averageGain = winningTrades.length > 0
        ? winningTrades.reduce((sum, t) => sum + t.pnlPercent, 0) / winningTrades.length
        : 0;

      const averageLoss = losingTrades.length > 0
        ? Math.abs(losingTrades.reduce((sum, t) => sum + t.pnlPercent, 0) / losingTrades.length)
        : 0;

      const consecutiveStats = PerformanceCalculator.calculateConsecutiveWinLoss(trades);

      const stats: KPIData[] = [
        {
          label: 'Total Trades',
          value: trades.length,
          format: 'number' as const,
          trend: 'neutral' as const,
        },
        {
          label: 'Winning Trades',
          value: winningTrades.length,
          format: 'number' as const,
          trend: 'up' as const,
        },
        {
          label: 'Losing Trades',
          value: losingTrades.length,
          format: 'number' as const,
          trend: 'down' as const,
        },
        {
          label: 'Win Rate',
          value: Math.round(metrics.winRate * 10) / 10,
          format: 'percentage' as const,
          trend: metrics.winRate > 50 ? 'up' as const : 'down' as const,
        },
        {
          label: 'Average Gain',
          value: Math.round(averageGain * 10) / 10,
          format: 'percentage' as const,
          trend: 'up' as const,
        },
        {
          label: 'Average Loss',
          value: Math.round(averageLoss * 10) / 10,
          format: 'percentage' as const,
          trend: 'down' as const,
        },
        {
          label: 'Profit Factor',
          value: Math.round(metrics.profitFactor * 100) / 100,
          format: 'number' as const,
          trend: metrics.profitFactor > 1.5 ? 'up' as const : 'neutral' as const,
        },
        {
          label: 'Best Trade',
          value: Math.round(metrics.bestTrade * 10) / 10,
          format: 'percentage' as const,
          trend: 'up' as const,
        },
        {
          label: 'Worst Trade',
          value: Math.round(Math.abs(metrics.worstTrade) * 10) / 10,
          format: 'percentage' as const,
          trend: 'down' as const,
        },
        {
          label: 'Avg Holding Days',
          value: Math.round(metrics.averageHoldingDays),
          format: 'number' as const,
          trend: 'neutral' as const,
        },
        {
          label: 'Max Consecutive Wins',
          value: consecutiveStats.maxWins,
          format: 'number' as const,
          trend: 'up' as const,
        },
        {
          label: 'Max Consecutive Losses',
          value: consecutiveStats.maxLosses,
          format: 'number' as const,
          trend: 'down' as const,
        },
      ];
      setTradeStats(stats);

      setLastUpdated(new Date());
      console.log('✅ All data loaded successfully');

    } catch (err) {
      console.error('Error loading data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load trading data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPeriodData = async () => {
    try {
      console.log(`📊 Loading period data for: ${selectedPeriod}`);

      // Получаем все данные
      const { trades, benchmark } = await ExcelProcessor.loadAllData();

      if (trades.length === 0) {
        console.warn('No trades available for period calculation');
        return;
      }

      // 🎯 ФИЛЬТРАЦИЯ ПО ПЕРИОДУ
      const filteredTrades = filterTradesByPeriod(trades, selectedPeriod);
      const filteredBenchmark = filterBenchmarkByPeriod(benchmark, selectedPeriod);

      // ✅ ПОВТОРНАЯ СИНХРОНИЗАЦИЯ после фильтрации
      const resyncedBenchmark = ExcelProcessor.resyncBenchmarkAfterFiltering(
        filteredBenchmark,
        filteredTrades
      );

      if (filteredTrades.length === 0) {
        console.warn(`No trades found for period: ${selectedPeriod}`);
        setPeriodData(null);
        return;
      }

      // Рассчитываем метрики для отфильтрованных данных
      const periodMetrics = PerformanceCalculator.calculateAllMetrics(filteredTrades);
      const periodTimeSeries = PerformanceCalculator.calculateTimeSeries(filteredTrades);

      // Рассчитываем дневные возвраты для best/worst day
      const dailyReturns = periodTimeSeries.map(p => p.dailyReturn);
      const bestDay = dailyReturns.length > 0 ? Math.max(...dailyReturns) : 0;
      const worstDay = dailyReturns.length > 0 ? Math.min(...dailyReturns) : 0;

      // Рассчитываем Alpha/Beta если есть benchmark данные
      let alpha = 0;
      let beta = 1;

      if (resyncedBenchmark.length > 0) {
        const benchmarkMetrics = PerformanceCalculator.calculateBenchmarkMetrics(
          periodTimeSeries,
          resyncedBenchmark  // ← используем resyncedBenchmark
        );
        alpha = benchmarkMetrics.alpha;
        beta = benchmarkMetrics.beta;
      }

      const periodData: PeriodData = {
        currentReturn: periodMetrics.totalReturn,
        bestDay: Math.round(bestDay * 100) / 100,
        worstDay: Math.round(worstDay * 100) / 100,
        volatility: Math.round(periodMetrics.volatility * 100) / 100,
        maxDrawdown: periodMetrics.maxDrawdown,
        alpha: Math.round(alpha * 100) / 100,
        beta: Math.round(beta * 100) / 100,
        totalTrades: filteredTrades.length
      };

      setPeriodData(periodData);
      console.log(`✅ Period data loaded for ${selectedPeriod}:`, periodData);

    } catch (err) {
      console.error('Error loading period data:', err);
      setPeriodData(null);
    }
  };

  // 🗓️ НОВЫЕ ФУНКЦИИ ФИЛЬТРАЦИИ ПО ПЕРИОДУ
  const filterTradesByPeriod = (trades: TradeRecord[], period: typeof selectedPeriod): TradeRecord[] => {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case '1m':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case '3m':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        break;
      case '6m':
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
        break;
      case '1y':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      case '2y':
        startDate = new Date(now.getFullYear() - 2, now.getMonth(), now.getDate());
        break;
      case 'all':
      default:
        return trades; // Возвращаем все трейды
    }

    console.log(`🔍 Filtering trades from ${startDate.toLocaleDateString()} to ${now.toLocaleDateString()}`);

    return trades.filter(trade => {
      return trade.exitDate >= startDate && trade.exitDate <= now;
    });
  };

  const filterBenchmarkByPeriod = (benchmark: BenchmarkPoint[], period: typeof selectedPeriod): BenchmarkPoint[] => {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case '1m':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case '3m':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        break;
      case '6m':
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
        break;
      case '1y':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      case '2y':
        startDate = new Date(now.getFullYear() - 2, now.getMonth(), now.getDate());
        break;
      case 'all':
      default:
        return benchmark; // Возвращаем все данные
    }

    return benchmark.filter(point => {
      return point.date >= startDate && point.date <= now;
    });
  };

  const handleRefreshData = async () => {
    try {
      // Очищаем данные и перезагружаем
      setKpiData([]);
      setPerformanceData([]);
      setBenchmarkData([]);
      setClosedTrades([]);
      setTradeStats([]);
      setPeriodData(null);

      await loadAllData();
    } catch (err) {
      setError('Failed to refresh data');
    }
  };

  const handleExportTrades = async () => {
    try {
      const csvContent = [
        'Date,Symbol,Type,Entry Price,Exit Price,P&L,Return %',
        ...closedTrades.map(trade =>
          `${trade.closedAt},${trade.symbol},${trade.type},${trade.entryPrice},${trade.exitPrice},${trade.pnl},${trade.return}`
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `white-fin-trades-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting trades:', err);
    }
  };

  // Функции для статусных цветов
  const getStatusColor = (value: number) => {
    if (value > 0) return 'text-status-positive';
    if (value < 0) return 'text-status-negative';
    return 'text-text-primary';
  };

  const getStatusClasses = (value: number) => {
    if (value > 0) return 'bg-status-positive/10 border-status-positive/30';
    if (value < 0) return 'bg-status-negative/10 border-status-negative/30';
    return 'bg-background-secondary border-border';
  };

  // Форматирование чисел
  const formatValue = (value: number | string, format?: 'percentage' | 'number' | 'currency') => {
    if (typeof value === 'string') return value;

    switch (format) {
      case 'percentage':
        return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
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
              Track Record & Performance
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
              Track Record & Performance
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
            Track Record & Performance
          </h2>
          <p className="text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
            Real trading performance with {tradeStats.find(k => k.label === 'Total Trades')?.value || 0} completed trades
          </p>

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

        {/* Top KPI Cards */}
        <div className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
                <div className={cn(
                  "text-xl font-bold mb-1",
                  getStatusColor(typeof kpi.value === 'number' ? kpi.value : 0)
                )}>
                  {formatValue(kpi.value, kpi.format)}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Performance Tab Navigation */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Tab Navigation */}
          <div className="lg:w-64 flex-shrink-0">
            <Card ocean padding="sm" className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedTab(tab.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200',
                      selectedTab === tab.id
                        ? 'bg-primary-500 text-white shadow-lg'
                        : 'text-text-secondary hover:text-text-primary hover:bg-background-secondary/50 dark:hover:bg-background-tertiary bg-background-secondary/20 dark:bg-background-tertiary/20'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </Card>
          </div>

          {/* Tab Content Area */}
          <div className="flex-1">
            {selectedTab === 'overview' && (
              <div className="space-y-8">
                {/* Period Selector */}
                <Card ocean padding="lg">
                  <div className="flex flex-wrap gap-2 justify-center">
                    {periods.map((period) => (
                      <button
                        key={period.id}
                        onClick={() => setSelectedPeriod(period.id)}
                        className={cn(
                          'px-4 py-2 rounded-lg font-medium transition-all duration-200',
                          selectedPeriod === period.id
                            ? 'bg-primary-500 text-white shadow-sm'
                            : 'text-text-secondary hover:text-text-primary hover:bg-background-secondary/50 dark:hover:bg-background-tertiary bg-background-secondary/30 dark:bg-background-secondary/30 border border-border/50'
                        )}
                      >
                        {period.label}
                      </button>
                    ))}
                  </div>
                </Card>

                {/* Chart */}
                <PerformanceChart
                  data={performanceData}
                  height={400}
                  showPeriodSelector={false}
                  showBenchmark={true}
                  benchmarkData={benchmarkData}
                  chartType="area"
                  title="Portfolio Performance vs S&P 500"
                  selectedPeriod={selectedPeriod}
                  onPeriodChange={setSelectedPeriod}
                />

                {/* Period Statistics */}
                {periodData && (
                  <Card ocean padding="lg">
                    <h4 className="text-lg font-semibold text-text-primary mb-6 flex items-center gap-2">
                      <PieChart className="w-5 h-5 text-primary-500" />
                      Statistics for {periods.find(p => p.id === selectedPeriod)?.label}
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className={cn(
                        "text-center p-4 rounded-xl border transition-all duration-200 hover:-translate-y-1",
                        getStatusClasses(periodData.currentReturn)
                      )}>
                        <div className="text-text-secondary text-sm mb-1">Current Return</div>
                        <div className={cn("text-xl font-bold", getStatusColor(periodData.currentReturn))}>
                          {periodData.currentReturn > 0 ? '+' : ''}{periodData.currentReturn.toFixed(1)}%
                        </div>
                      </div>

                      <div className={cn(
                        "text-center p-4 rounded-xl border transition-all duration-200 hover:-translate-y-1",
                        getStatusClasses(periodData.bestDay)
                      )}>
                        <div className="text-text-secondary text-sm mb-1">Best Day</div>
                        <div className={cn("text-xl font-bold", getStatusColor(periodData.bestDay))}>
                          +{periodData.bestDay.toFixed(1)}%
                        </div>
                      </div>

                      <div className={cn(
                        "text-center p-4 rounded-xl border transition-all duration-200 hover:-translate-y-1",
                        getStatusClasses(periodData.worstDay)
                      )}>
                        <div className="text-text-secondary text-sm mb-1">Worst Day</div>
                        <div className={cn("text-xl font-bold", getStatusColor(periodData.worstDay))}>
                          {periodData.worstDay.toFixed(1)}%
                        </div>
                      </div>

                      <div className={cn(
                        "text-center p-4 rounded-xl border transition-all duration-200 hover:-translate-y-1",
                        getStatusClasses(0)
                      )}>
                        <div className="text-text-secondary text-sm mb-1">Volatility</div>
                        <div className={cn("text-xl font-bold", getStatusColor(0))}>
                          {periodData.volatility.toFixed(1)}%
                        </div>
                      </div>

                      <div className={cn(
                        "text-center p-4 rounded-xl border transition-all duration-200 hover:-translate-y-1",
                        getStatusClasses(periodData.maxDrawdown)
                      )}>
                        <div className="text-text-secondary text-sm mb-1">Max Drawdown</div>
                        <div className={cn("text-xl font-bold", getStatusColor(periodData.maxDrawdown))}>
                          {periodData.maxDrawdown.toFixed(1)}%
                        </div>
                      </div>

                      <div className={cn(
                        "text-center p-4 rounded-xl border transition-all duration-200 hover:-translate-y-1",
                        getStatusClasses(periodData.alpha)
                      )}>
                        <div className="text-text-secondary text-sm mb-1">Alpha</div>
                        <div className={cn("text-xl font-bold", getStatusColor(periodData.alpha))}>
                          {periodData.alpha.toFixed(1)}
                        </div>
                      </div>

                      <div className={cn(
                        "text-center p-4 rounded-xl border transition-all duration-200 hover:-translate-y-1",
                        getStatusClasses(periodData.beta - 1)
                      )}>
                        <div className="text-text-secondary text-sm mb-1">Beta</div>
                        <div className={cn("text-xl font-bold", getStatusColor(periodData.beta - 1))}>
                          {periodData.beta.toFixed(2)}
                        </div>
                      </div>

                      <div className={cn(
                        "text-center p-4 rounded-xl border transition-all duration-200 hover:-translate-y-1",
                        getStatusClasses(0)
                      )}>
                        <div className="text-text-secondary text-sm mb-1">Total Trades</div>
                        <div className={cn("text-xl font-bold", getStatusColor(0))}>
                          {periodData.totalTrades}
                        </div>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            )}

            {selectedTab === 'trades' && (
              <div className="space-y-8">
                {/* Trade Journal */}
                <Card ocean padding="lg">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-semibold text-text-primary">
                      Recent Closed Trades
                    </h3>
                    <Button
                      variant="secondary"
                      icon={<Download className="w-4 h-4" />}
                      onClick={handleExportTrades}
                    >
                      Export CSV
                    </Button>
                  </div>

                  {/* Trade Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    {tradeStats.map((stat, index) => (
                      <Card
                        key={index}
                        ocean
                        padding="md"
                        className="text-center transition-all duration-200 hover:-translate-y-1"
                      >
                        <div className="text-text-secondary text-sm mb-1">{stat.label}</div>
                        <div className={cn(
                          "text-lg font-bold",
                          stat.trend === 'up' ? 'text-status-positive' :
                          stat.trend === 'down' ? 'text-status-negative' : 'text-text-primary'
                        )}>
                          {formatValue(stat.value, stat.format)}
                        </div>
                      </Card>
                    ))}
                  </div>

                  {/* Trades Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-border bg-background-secondary/50 dark:bg-background-secondary/30">
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
                        {closedTrades.slice(0, 15).map((trade, index) => (
                          <tr key={trade.id} className="border-b border-border hover:bg-background-secondary/30 dark:hover:bg-background-secondary/30 transition-colors duration-200">
                            <td className="py-3 px-4 text-text-secondary text-sm">{trade.closedAt}</td>
                            <td className="py-3 px-4 font-medium text-text-primary">{trade.symbol}</td>
                            <td className="py-3 px-4 text-center">
                              <span className={cn(
                                "px-2 py-1 rounded-md text-xs font-medium uppercase",
                                trade.type === 'Long'
                                  ? 'bg-status-positive/10 text-status-positive border border-status-positive/20'
                                  : 'bg-status-negative/10 text-status-negative border border-status-negative/20'
                              )}>
                                {trade.type}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-text-secondary text-right">
                              ${trade.entryPrice.toFixed(2)}
                            </td>
                            <td className="py-3 px-4 text-text-secondary text-right">
                              ${trade.exitPrice.toFixed(2)}
                            </td>
                            <td className={cn(
                              "py-3 px-4 font-medium text-right",
                              trade.pnl >= 0 ? 'text-status-positive' : 'text-status-negative'
                            )}>
                              {trade.pnl >= 0 ? '+' : ''}${Math.abs(trade.pnl).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className={cn(
                              "py-3 px-4 font-medium text-right",
                              trade.return >= 0 ? 'text-status-positive' : 'text-status-negative'
                            )}>
                              {trade.return >= 0 ? '+' : ''}{trade.return.toFixed(1)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PerformanceSection;