import React, { useState, useEffect, useMemo } from 'react';
import { Download, TrendingUp, Award, BarChart3, PieChart, RefreshCw, AlertCircle } from 'lucide-react';
import { RealStatistics } from '@/data/realStatistics';
import { formatPerformanceValue, formatDate } from '@/utils/formatting';
import { cn } from '@/utils/helpers';
import Button from '@/components/common/Button';
import Card, { MetricCard } from '@/components/common/Card';
import PerformanceChart from '@/components/charts/PerformanceChart';
import { KPIData } from '@/types';

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
    { id: '1m', label: '1 Month' },
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

      // Load main KPI data - ИСПРАВЛЕНО: теперь возвращает правильные метрики
      const kpis = await RealStatistics.getKPIData();
      setKpiData(kpis);

      // Load chart data
      const [perfData, benchData] = await Promise.all([
        RealStatistics.getPerformanceChartData(),
        RealStatistics.getBenchmarkChartData()
      ]);

      setPerformanceData(perfData);
      setBenchmarkData(benchData);

      // Load trade journal data
      const [trades, stats] = await Promise.all([
        RealStatistics.getClosedTrades(),
        RealStatistics.getTradeStats()
      ]);

      setClosedTrades(trades);
      setTradeStats(stats);

      // Get data status
      const status = RealStatistics.getDataStatus();
      setLastUpdated(status.lastUpdated);

      console.log(`Loaded data successfully: ${status.tradesCount} trades`);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load trading data';
      setError(errorMessage);
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPeriodData = async () => {
    try {
      // Load period statistics
      const periodStats = await RealStatistics.getPeriodStatistics(selectedPeriod);
      setPeriodData(periodStats);

      // Load period-specific chart data
      const [perfData, benchData] = await Promise.all([
        RealStatistics.getPerformanceChartData(),
        RealStatistics.getBenchmarkChartData()
      ]);

      // Filter data by selected period - НЕ ФИЛЬТРУЕМ ТУТ, фильтрация в PerformanceChart
      setPerformanceData(perfData);
      setBenchmarkData(benchData);

    } catch (err) {
      console.error('Error loading period data:', err);
    }
  };

  const handleRefreshData = async () => {
    try {
      await RealStatistics.refreshData();
      await loadAllData();
    } catch (err) {
      setError('Failed to refresh data');
    }
  };

  const handleExportTrades = async () => {
    try {
      const trades = await RealStatistics.getClosedTrades();
      const csvContent = [
        'Date,Symbol,Type,Entry Price,Exit Price,P&L,Return %',
        ...trades.map(trade =>
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

  // Функции для статусных цветов - ИСПРАВЛЕНО
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

  // ИСПРАВЛЕНИЕ: Форматирование чисел с округлением
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

        {/* Top KPI Cards - ИСПРАВЛЕНО: правильные метрики + округление */}
        <div className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {kpiData.map((kpi, index) => (
              <Card
                key={index}
                ocean
                padding="lg"
                className="text-center transition-all duration-200 hover:-translate-y-1"
              >
                <div className="text-text-secondary text-sm mb-2 font-medium">
                  {kpi.label}
                </div>
                <div className={cn(
                  "text-2xl font-bold mb-1",
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

                {/* Period Statistics - ИСПРАВЛЕНО: правильное форматирование */}
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

                  {/* Trades Table - ИСПРАВЛЕНО: P&L отображение */}
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
                                trade.type === 'LONG'
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