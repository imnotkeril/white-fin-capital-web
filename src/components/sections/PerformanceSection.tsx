import React, { useState, useMemo } from 'react';
import { Download, TrendingUp, Award, BarChart3, PieChart } from 'lucide-react';
import {
  mockPerformanceChartData,
  mockBenchmarkChartData,
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

  // Статистика сверху - общая за все время (БЕЗ полосок и анимаций)
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
      label: 'Max Drawdown',
      value: -5.2,
      format: 'percentage' as const,
      trend: 'down' as const,
    },
  ];

  // Данные для каждого периода (для статистики под графиком)
  const periodData: Record<typeof selectedPeriod, PeriodData> = {
    '1m': {
      currentReturn: 3.2,
      bestDay: 4.1,
      worstDay: -2.3,
      volatility: 12.5,
      maxDrawdown: -3.1,
      alpha: 0.8,
      beta: 0.92,
      totalTrades: 28,
    },
    '3m': {
      currentReturn: 8.7,
      bestDay: 4.1,
      worstDay: -3.2,
      volatility: 15.2,
      maxDrawdown: -4.5,
      alpha: 1.2,
      beta: 0.95,
      totalTrades: 84,
    },
    '6m': {
      currentReturn: 15.4,
      bestDay: 4.1,
      worstDay: -3.8,
      volatility: 16.8,
      maxDrawdown: -5.2,
      alpha: 1.4,
      beta: 0.98,
      totalTrades: 168,
    },
    '1y': {
      currentReturn: 24.7,
      bestDay: 4.1,
      worstDay: -4.2,
      volatility: 18.3,
      maxDrawdown: -5.2,
      alpha: 1.6,
      beta: 1.02,
      totalTrades: 336,
    },
    '2y': {
      currentReturn: 48.9,
      bestDay: 4.1,
      worstDay: -4.2,
      volatility: 19.1,
      maxDrawdown: -8.7,
      alpha: 1.8,
      beta: 1.05,
      totalTrades: 672,
    },
    'all': {
      currentReturn: 156.3,
      bestDay: 4.1,
      worstDay: -4.2,
      volatility: 20.4,
      maxDrawdown: -8.7,
      alpha: 2.1,
      beta: 1.08,
      totalTrades: 1247,
    },
  };

  const currentPeriodData = periodData[selectedPeriod];
  const benchmarkData = mockBenchmarkChartData;

  // Функции для статусных цветов (ИСПРАВЛЕНО: нейтральные элементы используют обычный цвет)
  const getStatusColor = (value: number) => {
    if (value > 0) return 'text-status-positive';
    if (value < 0) return 'text-status-negative';
    return 'text-text-primary'; // ИСПРАВЛЕНО: обычный цвет вместо status-neutral
  };

  const getStatusClasses = (value: number) => {
    if (value > 0) return 'bg-status-positive/10 border-status-positive/30';
    if (value < 0) return 'bg-status-negative/10 border-status-negative/30';
    return 'bg-background-secondary border-border'; // ИСПРАВЛЕНО: обычная рамка
  };

  return (
    <section id="performance" className="section bg-background">
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-6">
            Track Record & Performance
          </h2>
          <p className="text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
            Transparent performance metrics with detailed analytics and comprehensive trade history
          </p>
        </div>

        {/* КПИ сверху (БЕЗ полосок и анимаций) - используем системные классы */}
        <div className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {topKPIData.map((kpi, index) => (
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
                  getStatusColor(kpi.value)
                )}>
                  {kpi.format === 'percentage' ?
                    `${kpi.value > 0 ? '+' : ''}${kpi.value}%` :
                    kpi.value
                  }
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Performance Tab Navigation */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Tab Navigation - используем Card ocean */}
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

          {/* Tab Content Area - используем системные цвета */}
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

                {/* График БЕЗ встроенного селектора периодов и БЕЗ дублирующих статистик */}
                <PerformanceChart
                  data={mockPerformanceChartData}
                  height={400}
                  showPeriodSelector={false}
                  showBenchmark={true}
                  benchmarkData={benchmarkData}
                  chartType="area"
                />

                {/* ЕДИНСТВЕННАЯ статистика под графиком - зависит от selectedPeriod - используем Card ocean */}
                <Card ocean padding="lg">
                  <h4 className="text-lg font-semibold text-text-primary mb-6 flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-primary-500" />
                    Statistics for {periods.find(p => p.id === selectedPeriod)?.label}
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className={cn(
                      "text-center p-4 rounded-xl border transition-all duration-200 hover:-translate-y-1",
                      getStatusClasses(currentPeriodData.currentReturn)
                    )}>
                      <div className="text-text-secondary text-sm mb-1">Current Return</div>
                      <div className={cn("text-xl font-bold", getStatusColor(currentPeriodData.currentReturn))}>
                        {currentPeriodData.currentReturn > 0 ? '+' : ''}{currentPeriodData.currentReturn}%
                      </div>
                    </div>

                    <div className={cn(
                      "text-center p-4 rounded-xl border transition-all duration-200 hover:-translate-y-1",
                      getStatusClasses(currentPeriodData.bestDay)
                    )}>
                      <div className="text-text-secondary text-sm mb-1">Best Day</div>
                      <div className={cn("text-xl font-bold", getStatusColor(currentPeriodData.bestDay))}>
                        +{currentPeriodData.bestDay}%
                      </div>
                    </div>

                    <div className={cn(
                      "text-center p-4 rounded-xl border transition-all duration-200 hover:-translate-y-1",
                      getStatusClasses(currentPeriodData.worstDay)
                    )}>
                      <div className="text-text-secondary text-sm mb-1">Worst Day</div>
                      <div className={cn("text-xl font-bold", getStatusColor(currentPeriodData.worstDay))}>
                        {currentPeriodData.worstDay}%
                      </div>
                    </div>

                    <div className={cn(
                      "text-center p-4 rounded-xl border transition-all duration-200 hover:-translate-y-1",
                      getStatusClasses(0) // нейтральный
                    )}>
                      <div className="text-text-secondary text-sm mb-1">Volatility</div>
                      <div className={cn("text-xl font-bold", getStatusColor(0))}>
                        {currentPeriodData.volatility}%
                      </div>
                    </div>

                    <div className={cn(
                      "text-center p-4 rounded-xl border transition-all duration-200 hover:-translate-y-1",
                      getStatusClasses(currentPeriodData.maxDrawdown)
                    )}>
                      <div className="text-text-secondary text-sm mb-1">Max Drawdown</div>
                      <div className={cn("text-xl font-bold", getStatusColor(currentPeriodData.maxDrawdown))}>
                        {currentPeriodData.maxDrawdown}%
                      </div>
                    </div>

                    <div className={cn(
                      "text-center p-4 rounded-xl border transition-all duration-200 hover:-translate-y-1",
                      getStatusClasses(currentPeriodData.alpha)
                    )}>
                      <div className="text-text-secondary text-sm mb-1">Alpha</div>
                      <div className={cn("text-xl font-bold", getStatusColor(currentPeriodData.alpha))}>
                        {currentPeriodData.alpha}
                      </div>
                    </div>

                    <div className={cn(
                      "text-center p-4 rounded-xl border transition-all duration-200 hover:-translate-y-1",
                      getStatusClasses(currentPeriodData.beta - 1) // beta близко к 1 = нейтрально
                    )}>
                      <div className="text-text-secondary text-sm mb-1">Beta</div>
                      <div className={cn("text-xl font-bold", getStatusColor(currentPeriodData.beta - 1))}>
                        {currentPeriodData.beta}
                      </div>
                    </div>

                    <div className={cn(
                      "text-center p-4 rounded-xl border transition-all duration-200 hover:-translate-y-1",
                      getStatusClasses(0) // нейтральный
                    )}>
                      <div className="text-text-secondary text-sm mb-1">Total Trades</div>
                      <div className={cn("text-xl font-bold", getStatusColor(0))}>
                        {currentPeriodData.totalTrades}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {selectedTab === 'trades' && (
              <div className="space-y-8">
                {/* Trade Journal - ИСПРАВЛЕНО: улучшена видимость для светлого режима */}
                <Card ocean padding="lg">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-semibold text-text-primary">
                      Recent Closed Trades
                    </h3>
                    <Button variant="secondary" icon={<Download className="w-4 h-4" />}>
                      Export CSV
                    </Button>
                  </div>

                  {/* Trade Stats - ИСПРАВЛЕНО: нейтральные используют обычный цвет */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    {mockTradeStats.map((stat, index) => (
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
                          {stat.format === 'percentage' ?
                            `${stat.value > 0 ? '+' : ''}${stat.value}%` :
                            stat.value
                          }
                        </div>
                      </Card>
                    ))}
                  </div>

                  {/* Trades Table - ИСПРАВЛЕНО: правильная структура как на скриншоте */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-border bg-background-secondary/50 dark:bg-background-secondary/30">
                          <th className="text-left text-text-secondary font-medium pb-3 pt-3 px-4">Date</th>
                          <th className="text-left text-text-secondary font-medium pb-3 pt-3 px-4">Symbol</th>
                          <th className="text-center text-text-secondary font-medium pb-3 pt-3 px-4">Type</th>
                          <th className="text-right text-text-secondary font-medium pb-3 pt-3 px-4">Entry</th>
                          <th className="text-right text-text-secondary font-medium pb-3 pt-3 px-4">Exit</th>
                          <th className="text-right text-text-secondary font-medium pb-3 pt-3 px-4">P&L</th>
                          <th className="text-right text-text-secondary font-medium pb-3 pt-3 px-4">Return</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mockClosedTrades.slice(0, 8).map((trade, index) => (
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
                              ${typeof trade.entryPrice === 'number' ? trade.entryPrice.toLocaleString() : trade.entryPrice}
                            </td>
                            <td className="py-3 px-4 text-text-secondary text-right">
                              ${typeof trade.exitPrice === 'number' ? trade.exitPrice.toLocaleString() : trade.exitPrice}
                            </td>
                            <td className={cn(
                              "py-3 px-4 font-medium text-right",
                              trade.pnl >= 0 ? 'text-status-positive' : 'text-status-negative'
                            )}>
                              {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toLocaleString()}
                            </td>
                            <td className={cn(
                              "py-3 px-4 font-medium text-right",
                              trade.return >= 0 ? 'text-status-positive' : 'text-status-negative'
                            )}>
                              {trade.return >= 0 ? '+' : ''}{trade.return}%
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