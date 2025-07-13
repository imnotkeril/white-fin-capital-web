import React, { useState, useMemo } from 'react';
import { Download, Calendar, TrendingUp, Award, Shield, Target } from 'lucide-react';
import {
  mockPerformanceChartData,
  mockKPIData,
  mockClosedTrades,
  mockTradeStats,
} from '@/data/mockStatistics';
import { formatPerformanceValue, formatDate } from '@/utils/formatting';
import { cn } from '@/utils/helpers';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import PerformanceChart from '@/components/charts/PerformanceChart';
import { KPIGrid } from '@/components/charts/KPICounter';

const PerformanceSection: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'trades' | 'analytics'>('overview');
  const [selectedPeriod, setSelectedPeriod] = useState<'ytd' | '1y' | '2y' | 'all'>('ytd');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'trades', label: 'Trade Journal', icon: Award },
    { id: 'analytics', label: 'Analytics', icon: Target },
  ] as const;

  // Filter recent trades for display
  const recentTrades = useMemo(() => {
    return mockClosedTrades.slice(0, 8);
  }, []);

  const handleDownloadReport = () => {
    // TODO: Implement report download
    console.log('Downloading performance report...');
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
            Transparent results with complete trade history. Every recommendation is tracked and 
            documented for full accountability and continuous improvement.
          </p>
        </div>

        {/* Performance Highlights */}
        <div className="mb-12">
          <KPIGrid data={mockKPIData} columns={3} size="md" />
        </div>

        {/* Performance Tab Navigation */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Tab Navigation */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-background-secondary rounded-xl p-2">
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
                        : 'text-text-secondary hover:text-text-primary hover:bg-background-tertiary'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>
            
            {/* Download Report */}
            <Card className="mt-6" padding="md">
              <div className="text-center">
                <Download className="w-8 h-8 text-primary-500 mx-auto mb-3" />
                <h3 className="font-semibold text-text-primary mb-2">
                  Performance Report
                </h3>
                <p className="text-sm text-text-secondary mb-4">
                  Download detailed analytics and trade history
                </p>
                <Button
                  variant="outline"
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
                {/* Performance Chart */}
                <Card className="p-8">
                  <PerformanceChart
                    data={mockPerformanceChartData}
                    title="Cumulative Returns"
                    height={400}
                    chartType="area"
                  />
                </Card>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="text-center" padding="lg">
                    <Shield className="w-8 h-8 text-blue-500 mx-auto mb-3" />
                    <h3 className="font-semibold text-text-primary mb-1">Risk Management</h3>
                    <p className="text-2xl font-bold text-blue-500">-8.3%</p>
                    <p className="text-sm text-text-secondary">Max Drawdown</p>
                  </Card>

                  <Card className="text-center" padding="lg">
                    <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-3" />
                    <h3 className="font-semibold text-text-primary mb-1">Sharpe Ratio</h3>
                    <p className="text-2xl font-bold text-green-500">1.84</p>
                    <p className="text-sm text-text-secondary">Risk-Adjusted</p>
                  </Card>

                  <Card className="text-center" padding="lg">
                    <Award className="w-8 h-8 text-purple-500 mx-auto mb-3" />
                    <h3 className="font-semibold text-text-primary mb-1">Consistency</h3>
                    <p className="text-2xl font-bold text-purple-500">14.2%</p>
                    <p className="text-sm text-text-secondary">Volatility</p>
                  </Card>

                  <Card className="text-center" padding="lg">
                    <Target className="w-8 h-8 text-orange-500 mx-auto mb-3" />
                    <h3 className="font-semibent text-text-primary mb-1">Alpha</h3>
                    <p className="text-2xl font-bold text-orange-500">+5.2%</p>
                    <p className="text-sm text-text-secondary">vs Benchmark</p>
                  </Card>
                </div>
              </div>
            )}

            {selectedTab === 'trades' && (
              <div className="space-y-6">
                {/* Trade Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-accent-green">
                      {mockTradeStats.wins}
                    </p>
                    <p className="text-sm text-text-secondary">Wins</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-accent-red">
                      {mockTradeStats.losses}
                    </p>
                    <p className="text-sm text-text-secondary">Losses</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary-500">
                      {mockTradeStats.winRate}%
                    </p>
                    <p className="text-sm text-text-secondary">Win Rate</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-text-primary">
                      {mockTradeStats.profitFactor}
                    </p>
                    <p className="text-sm text-text-secondary">Profit Factor</p>
                  </div>
                </div>

                {/* Trades Table */}
                <Card>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left p-4 font-semibold text-text-primary">Ticker</th>
                          <th className="text-left p-4 font-semibold text-text-primary">Type</th>
                          <th className="text-left p-4 font-semibold text-text-primary">Entry Date</th>
                          <th className="text-left p-4 font-semibold text-text-primary">Entry Price</th>
                          <th className="text-left p-4 font-semibold text-text-primary">Exit Date</th>
                          <th className="text-left p-4 font-semibold text-text-primary">Exit Price</th>
                          <th className="text-right p-4 font-semibold text-text-primary">P&L</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentTrades.map((trade, index) => {
                          const performance = formatPerformanceValue(trade.profitLossPercent || 0);
                          return (
                            <tr key={trade.id} className="border-b border-border hover:bg-background-secondary/50">
                              <td className="p-4 font-medium text-text-primary">{trade.ticker}</td>
                              <td className="p-4">
                                <span className={cn(
                                  'px-2 py-1 rounded text-xs font-medium',
                                  trade.type === 'long' 
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                )}>
                                  {trade.type.toUpperCase()}
                                </span>
                              </td>
                              <td className="p-4 text-text-secondary">
                                {formatDate(trade.entryDate, 'short')}
                              </td>
                              <td className="p-4 text-text-secondary">
                                ${trade.entryPrice.toLocaleString()}
                              </td>
                              <td className="p-4 text-text-secondary">
                                {trade.exitDate ? formatDate(trade.exitDate, 'short') : '-'}
                              </td>
                              <td className="p-4 text-text-secondary">
                                ${trade.exitPrice?.toLocaleString() || '-'}
                              </td>
                              <td className={cn(
                                'p-4 text-right font-semibold',
                                `text-${performance.color === 'success' ? 'accent-green' : 
                                          performance.color === 'error' ? 'accent-red' : 'text-secondary'}`
                              )}>
                                {performance.formatted}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="p-4 border-t border-border text-center">
                    <p className="text-sm text-text-secondary mb-2">
                      * An asterisk next to the price signifies an average entry
                    </p>
                    <Button variant="outline" size="sm">
                      View Complete Trade Journal
                    </Button>
                  </div>
                </Card>
              </div>
            )}

            {selectedTab === 'analytics' && (
              <div className="space-y-8">
                {/* Risk Metrics */}
                <Card>
                  <h3 className="text-xl font-semibold text-text-primary mb-6">Risk Analytics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div>
                      <p className="text-text-secondary text-sm mb-1">Volatility</p>
                      <p className="text-2xl font-bold text-text-primary">14.2%</p>
                    </div>
                    <div>
                      <p className="text-text-secondary text-sm mb-1">Beta</p>
                      <p className="text-2xl font-bold text-text-primary">0.87</p>
                    </div>
                    <div>
                      <p className="text-text-secondary text-sm mb-1">Sortino Ratio</p>
                      <p className="text-2xl font-bold text-text-primary">2.41</p>
                    </div>
                    <div>
                      <p className="text-text-secondary text-sm mb-1">Information Ratio</p>
                      <p className="text-2xl font-bold text-text-primary">1.23</p>
                    </div>
                  </div>
                </Card>

                {/* Performance Attribution */}
                <Card>
                  <h3 className="text-xl font-semibold text-text-primary mb-6">
                    Performance Attribution
                  </h3>
                  <div className="space-y-4">
                    {[
                      { name: 'Security Selection', contribution: 12.3 },
                      { name: 'Market Timing', contribution: 8.7 },
                      { name: 'Asset Allocation', contribution: 3.7 },
                      { name: 'Currency Effects', contribution: -0.2 },
                    ].map((item) => (
                      <div key={item.name} className="flex justify-between items-center">
                        <span className="text-text-secondary">{item.name}</span>
                        <span className={cn(
                          'font-semibold',
                          item.contribution > 0 ? 'text-accent-green' : 'text-accent-red'
                        )}>
                          {item.contribution > 0 ? '+' : ''}{item.contribution}%
                        </span>
                      </div>
                    ))}
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