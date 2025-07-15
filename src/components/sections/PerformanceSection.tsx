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

  // Статистика по периодам
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

  // Бенчмарк данные (S&P 500) - используем готовые данные
  const benchmarkData = useMemo(() => {
    return mockBenchmarkChartData;
  }, []);

  // Отфильтрованные трейды для отображения
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

  const getStatusColor = (value: number) => {
    if (value > 0) return 'text-[#86efac]'; // pastel-green
    if (value < 0) return 'text-[#fca5a5]'; // pastel-red
    return 'text-[#bf9ffb]'; // pastel-purple
  };

  const getStatusBgColor = (value: number) => {
    if (value > 0) return 'bg-[#86efac]/10'; // pastel-green background
    if (value < 0) return 'bg-[#fca5a5]/10'; // pastel-red background
    return 'bg-[#bf9ffb]/10'; // pastel-purple background
  };

  return (
    <section id="performance" className="section-padding" style={{ background: '#05192c' }}>
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 rounded-full px-6 py-3 mb-6"
               style={{
                 background: 'rgba(255, 255, 255, 0.7)',
                 backdropFilter: 'blur(20px)',
                 border: '1px solid rgba(144, 191, 249, 0.2)'
               }}>
            <BarChart3 className="w-5 h-5" style={{ color: '#90bff9' }} />
            <span className="text-white font-medium">Performance Dashboard</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Track Record & Performance
          </h2>
          <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
            Transparent results with complete trade history. Every recommendation is tracked and
            documented for full accountability and continuous improvement.
          </p>
        </div>

        {/* Top Statistics - All Time (БЕЗ полосок) */}
        <div className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topKPIData.map((kpi) => (
              <div
                key={kpi.label}
                className="text-center p-6 rounded-2xl"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(144, 191, 249, 0.2)',
                }}
              >
                <div className="text-white/70 text-sm mb-2 uppercase tracking-wide">
                  {kpi.label}
                </div>
                <div className={cn(
                  "text-3xl font-bold mb-2",
                  kpi.trend === 'up' ? 'text-[#86efac]' :
                  kpi.trend === 'down' ? 'text-[#fca5a5]' : 'text-[#bf9ffb]'
                )}>
                  {kpi.format === 'percentage' ?
                    `${kpi.value > 0 ? '+' : ''}${kpi.value}%` :
                    kpi.value
                  }
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Tab Navigation */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Tab Navigation */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="rounded-xl p-2 space-y-2"
                 style={{
                   background: 'rgba(255, 255, 255, 0.05)',
                   backdropFilter: 'blur(20px)',
                   border: '1px solid rgba(144, 191, 249, 0.2)',
                 }}>
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedTab(tab.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200',
                      selectedTab === tab.id
                        ? 'bg-[#90bff9] text-[#05192c] shadow-sm'
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1">
            {selectedTab === 'overview' && (
              <div className="space-y-8">
                {/* Performance Chart with Period Selector */}
                <div className="rounded-2xl p-6"
                     style={{
                       background: 'rgba(255, 255, 255, 0.05)',
                       backdropFilter: 'blur(20px)',
                       border: '1px solid rgba(144, 191, 249, 0.2)',
                     }}>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <h3 className="text-2xl font-semibold text-white">
                      Portfolio Performance vs S&P 500
                    </h3>

                    {/* ЕДИНСТВЕННЫЙ селектор периодов */}
                    <div className="flex rounded-lg p-1"
                         style={{ background: '#0f2337' }}>
                      {periods.map((period) => (
                        <button
                          key={period.id}
                          onClick={() => setSelectedPeriod(period.id)}
                          className={cn(
                            'text-xs font-medium px-4 py-2 rounded-md transition-all duration-200',
                            selectedPeriod === period.id
                              ? 'bg-[#90bff9] text-[#05192c] shadow-sm'
                              : 'text-white/70 hover:text-white hover:bg-white/5'
                          )}
                        >
                          {period.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* График БЕЗ встроенного селектора периодов и БЕЗ дублирующих статистик */}
                  <PerformanceChart
                    data={mockPerformanceChartData}
                    height={400}
                    showPeriodSelector={false} // УБИРАЕМ встроенный селектор
                    showBenchmark={true}
                    benchmarkData={benchmarkData} // ДОБАВЛЯЕМ бенчмарк
                    chartType="area"
                  />

                  {/* ЕДИНСТВЕННАЯ статистика под графиком - зависит от selectedPeriod */}
                  <div className="mt-8">
                    <h4 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                      <PieChart className="w-5 h-5" style={{ color: '#90bff9' }} />
                      Statistics for {periods.find(p => p.id === selectedPeriod)?.label}
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="text-center p-4 rounded-xl"
                           style={{
                             background: getStatusBgColor(currentPeriodData.currentReturn),
                             border: `1px solid ${currentPeriodData.currentReturn > 0 ? '#86efac' : currentPeriodData.currentReturn < 0 ? '#fca5a5' : '#bf9ffb'}`,
                           }}>
                        <div className="text-white/70 text-sm mb-1">Current Return</div>
                        <div className={cn("text-xl font-bold", getStatusColor(currentPeriodData.currentReturn))}>
                          {currentPeriodData.currentReturn > 0 ? '+' : ''}{currentPeriodData.currentReturn}%
                        </div>
                      </div>

                      <div className="text-center p-4 rounded-xl"
                           style={{
                             background: 'rgba(134, 239, 172, 0.1)',
                             border: '1px solid #86efac',
                           }}>
                        <div className="text-white/70 text-sm mb-1">Best Day</div>
                        <div className="text-xl font-bold text-[#86efac]">
                          +{currentPeriodData.bestDay}%
                        </div>
                      </div>

                      <div className="text-center p-4 rounded-xl"
                           style={{
                             background: 'rgba(252, 165, 165, 0.1)',
                             border: '1px solid #fca5a5',
                           }}>
                        <div className="text-white/70 text-sm mb-1">Worst Day</div>
                        <div className="text-xl font-bold text-[#fca5a5]">
                          {currentPeriodData.worstDay}%
                        </div>
                      </div>

                      <div className="text-center p-4 rounded-xl"
                           style={{
                             background: 'rgba(191, 159, 251, 0.1)',
                             border: '1px solid #bf9ffb',
                           }}>
                        <div className="text-white/70 text-sm mb-1">Volatility</div>
                        <div className="text-xl font-bold text-[#bf9ffb]">
                          {currentPeriodData.volatility}%
                        </div>
                      </div>

                      <div className="text-center p-4 rounded-xl"
                           style={{
                             background: 'rgba(252, 165, 165, 0.1)',
                             border: '1px solid #fca5a5',
                           }}>
                        <div className="text-white/70 text-sm mb-1">Max Drawdown</div>
                        <div className="text-xl font-bold text-[#fca5a5]">
                          {currentPeriodData.maxDrawdown}%
                        </div>
                      </div>

                      <div className="text-center p-4 rounded-xl"
                           style={{
                             background: 'rgba(134, 239, 172, 0.1)',
                             border: '1px solid #86efac',
                           }}>
                        <div className="text-white/70 text-sm mb-1">Alpha</div>
                        <div className="text-xl font-bold text-[#86efac]">
                          +{currentPeriodData.alpha}%
                        </div>
                      </div>

                      <div className="text-center p-4 rounded-xl"
                           style={{
                             background: 'rgba(191, 159, 251, 0.1)',
                             border: '1px solid #bf9ffb',
                           }}>
                        <div className="text-white/70 text-sm mb-1">Beta</div>
                        <div className="text-xl font-bold text-[#bf9ffb]">
                          {currentPeriodData.beta}
                        </div>
                      </div>

                      <div className="text-center p-4 rounded-xl"
                           style={{
                             background: 'rgba(191, 159, 251, 0.1)',
                             border: '1px solid #bf9ffb',
                           }}>
                        <div className="text-white/70 text-sm mb-1">Total Trades</div>
                        <div className="text-xl font-bold text-[#bf9ffb]">
                          {currentPeriodData.totalTrades}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedTab === 'trades' && (
              <div className="space-y-8">
                {/* Trade Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center p-4 rounded-xl"
                       style={{
                         background: 'rgba(191, 159, 251, 0.1)',
                         border: '1px solid #bf9ffb',
                       }}>
                    <div className="text-white/70 text-sm mb-1">Total Trades</div>
                    <div className="text-xl font-bold text-[#bf9ffb]">
                      {mockTradeStats.wins + mockTradeStats.losses}
                    </div>
                  </div>

                  <div className="text-center p-4 rounded-xl"
                       style={{
                         background: 'rgba(134, 239, 172, 0.1)',
                         border: '1px solid #86efac',
                       }}>
                    <div className="text-white/70 text-sm mb-1">Winning Trades</div>
                    <div className="text-xl font-bold text-[#86efac]">
                      {mockTradeStats.wins}
                    </div>
                  </div>

                  <div className="text-center p-4 rounded-xl"
                       style={{
                         background: 'rgba(252, 165, 165, 0.1)',
                         border: '1px solid #fca5a5',
                       }}>
                    <div className="text-white/70 text-sm mb-1">Losing Trades</div>
                    <div className="text-xl font-bold text-[#fca5a5]">
                      {mockTradeStats.losses}
                    </div>
                  </div>

                  <div className="text-center p-4 rounded-xl"
                       style={{
                         background: 'rgba(134, 239, 172, 0.1)',
                         border: '1px solid #86efac',
                       }}>
                    <div className="text-white/70 text-sm mb-1">Win Rate</div>
                    <div className="text-xl font-bold text-[#86efac]">
                      {mockTradeStats.winRate}%
                    </div>
                  </div>
                </div>

                {/* Recent Trades Table с цветами */}
                <div className="rounded-2xl p-6"
                     style={{
                       background: 'rgba(255, 255, 255, 0.05)',
                       backdropFilter: 'blur(20px)',
                       border: '1px solid rgba(144, 191, 249, 0.2)',
                     }}>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-white">
                      Recent Trades
                    </h3>
                    <Button
                      onClick={handleDownloadReport}
                      className="flex items-center gap-2"
                      style={{ background: '#90bff9', color: '#05192c' }}
                    >
                      <Download className="w-4 h-4" />
                      Download PDF
                    </Button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left py-3 text-white/70 font-medium">Symbol</th>
                          <th className="text-left py-3 text-white/70 font-medium">Type</th>
                          <th className="text-left py-3 text-white/70 font-medium">Entry Date</th>
                          <th className="text-left py-3 text-white/70 font-medium">Entry Price</th>
                          <th className="text-left py-3 text-white/70 font-medium">Exit Date</th>
                          <th className="text-left py-3 text-white/70 font-medium">Exit Price</th>
                          <th className="text-right py-3 text-white/70 font-medium">P&L</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentTrades.map((trade) => (
                          <tr key={trade.id} className="border-b border-white/5">
                            <td className="py-3 text-white font-medium">{trade.ticker}</td>
                            <td className="py-3 text-white/70 uppercase">{trade.type}</td>
                            <td className="py-3 text-white/70">{formatDate(trade.entryDate)}</td>
                            <td className="py-3 text-white/70">${trade.entryPrice.toLocaleString()}</td>
                            <td className="py-3 text-white/70">{formatDate(trade.exitDate!)}</td>
                            <td className="py-3 text-white/70">${trade.exitPrice!.toLocaleString()}</td>
                            <td className={cn(
                              "py-3 text-right font-bold",
                              trade.profitLossPercent! > 0 ? 'text-[#86efac]' : 'text-[#fca5a5]'
                            )}>
                              {trade.profitLossPercent! > 0 ? '+' : ''}{trade.profitLossPercent!.toFixed(2)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-6 text-center">
                    <p className="text-white/50 text-sm mb-4">
                      Showing 8 most recent trades
                    </p>
                    <Button
                      variant="secondary"
                      className="text-white border-white/20 hover:bg-white/10"
                    >
                      View Complete Trade Journal
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PerformanceSection;