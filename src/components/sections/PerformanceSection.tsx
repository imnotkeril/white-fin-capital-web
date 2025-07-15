import React, { useState, useMemo } from 'react';
import { Download, TrendingUp, Award, BarChart3, PieChart } from 'lucide-react';
import {
  mockPerformanceChartData,
  mockKPIData,
  mockClosedTrades,
  mockTradeStats,
} from '@/data/mockStatistics';
import { formatPerformanceValue, formatDate } from '@/utils/formatting';
import { cn } from '@/utils/helpers';
import Button from '@/components/common/Button';
import Card, { MetricCard } from '@/components/common/Card';
import PerformanceChart from '@/components/charts/PerformanceChart';
import { KPICounter, KPIGrid } from '@/components/charts/KPICounter';

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

  // Статистика сверху - общая за все время (без last period)
  const topKPIData = [
    {
      label: 'Total Return',
      value: 24.7,
      format: 'percentage' as const,
      trend: 'up' as const,
    },
    {
      label: 'Win Rate',
      value: 68.5,
      format: 'percentage' as const,
      trend: 'up' as const,
    },
    {
      label: 'Average Gain',
      value: 8.3,
      format: 'percentage' as const,
      trend: 'up' as const,
    },
    {
      label: 'Average Loss',
      value: -4.1,
      format: 'percentage' as const,
      trend: 'down' as const,
    },
    {
      label: 'Sharpe Ratio',
      value: 1.84,
      format: 'number' as const,
      trend: 'up' as const,
    },
    {
      label: 'Sortino Ratio',
      value: 2.41,
      format: 'number' as const,
      trend: 'up' as const,
    },
  ];

  // Статистика под графиком - зависит от выбранного периода
  const periodDataMap: Record<string, PeriodData> = {
    '1m': {
      currentReturn: 3.2,
      bestDay: 2.1,
      worstDay: -1.8,
      volatility: 15.2,
      maxDrawdown: -3.1,
      alpha: 1.2,
      beta: 0.92,
      totalTrades: 8,
    },
    '3m': {
      currentReturn: 8.7,
      bestDay: 3.4,
      worstDay: -2.8,
      volatility: 14.8,
      maxDrawdown: -5.2,
      alpha: 2.1,
      beta: 0.88,
      totalTrades: 23,
    },
    '6m': {
      currentReturn: 15.3,
      bestDay: 4.2,
      worstDay: -3.1,
      volatility: 13.9,
      maxDrawdown: -6.8,
      alpha: 3.8,
      beta: 0.85,
      totalTrades: 47,
    },
    '1y': {
      currentReturn: 24.7,
      bestDay: 4.8,
      worstDay: -4.2,
      volatility: 14.2,
      maxDrawdown: -8.3,
      alpha: 5.2,
      beta: 0.87,
      totalTrades: 97,
    },
    '2y': {
      currentReturn: 42.1,
      bestDay: 5.1,
      worstDay: -4.5,
      volatility: 15.1,
      maxDrawdown: -12.4,
      alpha: 7.8,
      beta: 0.89,
      totalTrades: 203,
    },
    'all': {
      currentReturn: 67.8,
      bestDay: 5.3,
      worstDay: -5.2,
      volatility: 14.7,
      maxDrawdown: -15.2,
      alpha: 12.4,
      beta: 0.86,
      totalTrades: 312,
    },
  };

  const currentPeriodData = periodDataMap[selectedPeriod];

  // Filter recent trades for display
  const recentTrades = useMemo(() => {
    return mockClosedTrades.slice(0, 12);
  }, []);

  const handleDownloadReport = () => {
    console.log('Downloading performance report...');
  };

  const getPerformanceTrend = (value: number): 'positive' | 'negative' | 'neutral' => {
    if (value > 0) return 'positive';
    if (value < 0) return 'negative';
    return 'neutral';
  };

  return (
    <section id="performance" className="section-padding bg-background">
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 glass rounded-full px-6 py-3 mb-6">
            <BarChart3 className="w-5 h-5 text-primary-500" />
            <span className="text-text-primary font-medium">Performance Dashboard</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-6">
            Track Record & Performance
          </h2>
          <p className="text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
            Transparent results with complete trade history. Every recommendation is tracked and
            documented for full accountability and continuous improvement.
          </p>
        </div>

        {/* Top Statistics - All Time (with animations) */}
        <div className="mb-16">
          <KPIGrid data={topKPIData} columns={3} size="md" />
        </div>

        {/* Performance Tab Navigation */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Tab Navigation */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="glass rounded-xl p-2 space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedTab(tab.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200',
                      selectedTab === tab.id
                        ? 'bg-primary-500 text-white shadow-md'
                        : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Download Report */}
            <Card ocean padding="md" className="mt-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-900 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Download className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-text-primary mb-2">
                  Performance Report
                </h3>
                <p className="text-sm text-text-secondary mb-4">
                  Download detailed analytics and trade history
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  fullWidth
                  onClick={handleDownloadReport}
                  icon={<Download className="w-4 h-4" />}
                >
                  Download PDF
                </Button>
              </div>
            </Card>
          </div>

          {/* Tab Content */}
          <div className="flex-1">
            {selectedTab === 'overview' && (
              <div className="space-y-8">
                {/* Performance Chart with Period Selector */}
                <Card ocean padding="lg">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <h3 className="text-xl font-semibold text-text-primary">
                      Portfolio Performance vs S&P 500
                    </h3>

                    {/* Period Selector */}
                    <div className="flex bg-background-secondary rounded-lg p-1 gap-1">
                      {periods.map((period) => (
                        <button
                          key={period.id}
                          onClick={() => setSelectedPeriod(period.id)}
                          className={cn(
                            'px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200',
                            selectedPeriod === period.id
                              ? 'bg-primary-500 text-white shadow-sm'
                              : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                          )}
                        >
                          {period.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <PerformanceChart
                    data={mockPerformanceChartData}
                    height={400}
                    period={selectedPeriod}
                    showBenchmark={true}
                    benchmarkData={[]} // TODO: Add S&P 500 data
                  />
                </Card>

                {/* Period-Specific Statistics */}
                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-6 flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-primary-500" />
                    Statistics for {periods.find(p => p.id === selectedPeriod)?.label}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <MetricCard
                      label="Current Return"
                      value={`${currentPeriodData.currentReturn > 0 ? '+' : ''}${currentPeriodData.currentReturn}%`}
                      trend={getPerformanceTrend(currentPeriodData.currentReturn)}
                      ocean
                      interactive
                    />
                    <MetricCard
                      label="Best Day"
                      value={`+${currentPeriodData.bestDay}%`}
                      trend="positive"
                      ocean
                      interactive
                    />
                    <MetricCard
                      label="Worst Day"
                      value={`${currentPeriodData.worstDay}%`}
                      trend="negative"
                      ocean
                      interactive
                    />
                    <MetricCard
                      label="Volatility"
                      value={`${currentPeriodData.volatility}%`}
                      trend="neutral"
                      ocean
                      interactive
                    />
                    <MetricCard
                      label="Max Drawdown"
                      value={`${currentPeriodData.maxDrawdown}%`}
                      trend="negative"
                      ocean
                      interactive
                    />
                    <MetricCard
                      label="Alpha"
                      value={`+${currentPeriodData.alpha}%`}
                      trend="positive"
                      ocean
                      interactive
                    />
                    <MetricCard
                      label="Beta"
                      value={currentPeriodData.beta.toString()}
                      trend="neutral"
                      ocean
                      interactive
                    />
                    <MetricCard
                      label="Total Trades"
                      value={currentPeriodData.totalTrades.toString()}
                      trend="neutral"
                      ocean
                      interactive
                    />
                  </div>
                </div>
              </div>
            )}

            {selectedTab === 'trades' && (
              <div className="space-y-8">
                {/* Trade Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <MetricCard
                    label="Total Trades"
                    value={mockTradeStats.wins + mockTradeStats.losses}
                    trend="neutral"
                    ocean
                  />
                  <MetricCard
                    label="Winning Trades"
                    value={mockTradeStats.wins}
                    trend="positive"
                    ocean
                  />
                  <MetricCard
                    label="Losing Trades"
                    value={mockTradeStats.losses}
                    trend="negative"
                    ocean
                  />
                  <MetricCard
                    label="Win Rate"
                    value={`${mockTradeStats.winRate}%`}
                    trend="positive"
                    ocean
                  />
                </div>

                {/* Recent Trades Table */}
                <Card ocean padding="lg">
                  <h3 className="text-xl font-semibold text-text-primary mb-6">
                    Recent Trades
                  </h3>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 text-text-secondary font-medium">Symbol</th>
                          <th className="text-left py-3 px-4 text-text-secondary font-medium">Type</th>
                          <th className="text-left py-3 px-4 text-text-secondary font-medium">Entry Date</th>
                          <th className="text-left py-3 px-4 text-text-secondary font-medium">Entry Price</th>
                          <th className="text-left py-3 px-4 text-text-secondary font-medium">Exit Date</th>
                          <th className="text-left py-3 px-4 text-text-secondary font-medium">Exit Price</th>
                          <th className="text-right py-3 px-4 text-text-secondary font-medium">P&L</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentTrades.map((trade, index) => {
                          const profitLoss = trade.profitLossPercent || 0;
                          return (
                            <tr key={trade.id} className="border-b border-border/50 hover:bg-white/5 transition-colors">
                              <td className="py-3 px-4 text-text-primary font-medium">
                                {trade.ticker}
                              </td>
                              <td className="py-3 px-4">
                                <span className={cn(
                                  'px-2 py-1 rounded-md text-xs font-medium',
                                  trade.type === 'long'
                                    ? 'bg-status-positive/20 text-status-positive'
                                    : 'bg-status-negative/20 text-status-negative'
                                )}>
                                  {trade.type.toUpperCase()}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-text-secondary text-sm">
                                {formatDate(trade.entryDate)}
                              </td>
                              <td className="py-3 px-4 text-text-secondary text-sm">
                                ${trade.entryPrice.toLocaleString()}
                              </td>
                              <td className="py-3 px-4 text-text-secondary text-sm">
                                {trade.exitDate ? formatDate(trade.exitDate) : '-'}
                              </td>
                              <td className="py-3 px-4 text-text-secondary text-sm">
                                {trade.exitPrice ? `$${trade.exitPrice.toLocaleString()}` : '-'}
                              </td>
                              <td className={cn(
                                'py-3 px-4 text-right font-semibold',
                                profitLoss > 0
                                  ? 'text-status-positive'
                                  : profitLoss < 0
                                  ? 'text-status-negative'
                                  : 'text-text-secondary'
                              )}>
                                {profitLoss > 0 ? '+' : ''}{profitLoss.toFixed(2)}%
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-6 pt-6 border-t border-border text-center">
                    <p className="text-sm text-text-secondary mb-4">
                      Showing {recentTrades.length} most recent trades
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => console.log('View complete trade journal')}
                    >
                      View Complete Trade Journal
                    </Button>
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