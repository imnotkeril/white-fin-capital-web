// Services data for White Fin Capital

import { Service } from '@/types';

export const services: Service[] = [
  {
    id: 'deep-research',
    title: 'Deep Market Research',
    description: 'Comprehensive fundamental and technical analysis across global markets with institutional-grade research reports.',
    icon: 'TrendingUp',
    features: [
      {
        title: 'Fundamental Analysis',
        description: 'In-depth company and sector analysis with valuation models and growth projections',
      },
      {
        title: 'Technical Analysis',
        description: 'Advanced charting and pattern recognition with precise entry and exit signals',
      },
      {
        title: 'Macro Research',
        description: 'Global economic analysis and central bank policy impact assessments',
      },
      {
        title: 'Sector Rotation',
        description: 'Strategic asset allocation recommendations based on economic cycles',
      },
    ],
  },
  {
    id: 'trade-alerts',
    title: 'Real-Time Trade Alerts',
    description: 'Instant notifications with detailed trade setups, entry points, targets, and risk management guidelines.',
    icon: 'Bell',
    features: [
      {
        title: 'Instant Notifications',
        description: 'Real-time alerts via email, SMS, and mobile app with detailed reasoning',
      },
      {
        title: 'Entry & Exit Signals',
        description: 'Precise entry points, profit targets, and stop-loss levels for every trade',
      },
      {
        title: 'Risk Management',
        description: 'Position sizing recommendations and risk-reward ratios for optimal portfolio management',
      },
      {
        title: 'Trade Journal',
        description: 'Complete transparency with all trades documented and performance tracked',
      },
    ],
  },
  {
    id: 'portfolio-analytics',
    title: 'Portfolio Analytics',
    description: 'Advanced portfolio performance tracking and risk analysis with interactive dashboards and custom reports.',
    icon: 'BarChart3',
    features: [
      {
        title: 'Performance Tracking',
        description: 'Real-time portfolio performance with detailed attribution analysis',
      },
      {
        title: 'Risk Analytics',
        description: 'Value-at-Risk, stress testing, and correlation analysis across asset classes',
      },
      {
        title: 'Custom Dashboards',
        description: 'Personalized analytics dashboards with the metrics that matter to you',
      },
      {
        title: 'Benchmark Analysis',
        description: 'Compare performance against major indices and peer strategies',
      },
    ],
  },
  {
    id: 'market-insights',
    title: 'Market Insights & Education',
    description: 'Weekly market updates, educational content, and exclusive webinars from our expert analysts.',
    icon: 'BookOpen',
    features: [
      {
        title: 'Weekly Market Updates',
        description: 'Comprehensive market commentary and outlook from our research team',
      },
      {
        title: 'Educational Content',
        description: 'Trading tutorials, strategy guides, and market education resources',
      },
      {
        title: 'Live Webinars',
        description: 'Monthly webinars with Q&A sessions and market strategy discussions',
      },
      {
        title: 'Research Library',
        description: 'Access to our complete archive of research reports and market analysis',
      },
    ],
  },
];

// Service benefits for different user types
export const serviceBenefits = {
  beginners: [
    'Step-by-step learning path with educational content',
    'Risk management guidance to protect capital',
    'Simple trade alerts with clear explanations',
    'Access to educational webinars and tutorials',
  ],
  intermediate: [
    'Advanced technical analysis and chart patterns',
    'Sector rotation and macro strategy insights',
    'Portfolio optimization recommendations',
    'Direct access to research team via Q&A sessions',
  ],
  advanced: [
    'Institutional-grade research and analysis',
    'Custom portfolio analytics and risk metrics',
    'Priority access to new investment opportunities',
    'One-on-one strategy consultations (Enterprise tier)',
  ],
};

// Process workflow
export const researchProcess = [
  {
    step: 1,
    title: 'Market Scanning',
    description: 'Our algorithms scan thousands of securities across global markets for opportunities',
    icon: 'Search',
  },
  {
    step: 2,
    title: 'Fundamental Analysis',
    description: 'Deep dive into company financials, industry dynamics, and competitive positioning',
    icon: 'FileText',
  },
  {
    step: 3,
    title: 'Technical Analysis',
    description: 'Chart pattern recognition, momentum indicators, and optimal entry/exit timing',
    icon: 'TrendingUp',
  },
  {
    step: 4,
    title: 'Risk Assessment',
    description: 'Comprehensive risk analysis with position sizing and stop-loss recommendations',
    icon: 'Shield',
  },
  {
    step: 5,
    title: 'Trade Execution',
    description: 'Real-time alerts with precise instructions and reasoning for every recommendation',
    icon: 'Zap',
  },
  {
    step: 6,
    title: 'Performance Tracking',
    description: 'Continuous monitoring and transparent reporting of all trade outcomes',
    icon: 'BarChart3',
  },
];

// Key differentiators
export const keyDifferentiators = [
  {
    title: 'Transparency',
    description: 'Every trade and result is publicly documented. No cherry-picking, no hidden losses.',
    icon: 'Eye',
  },
  {
    title: 'Experience',
    description: '37+ years of combined experience from former Goldman Sachs, JPMorgan, and Bridgewater professionals.',
    icon: 'Award',
  },
  {
    title: 'Technology',
    description: 'Proprietary algorithms and machine learning models enhance traditional analysis methods.',
    icon: 'Cpu',
  },
  {
    title: 'Education',
    description: 'We teach you the "why" behind every recommendation to improve your investment skills.',
    icon: 'GraduationCap',
  },
];

// Asset coverage
export const assetCoverage = {
  equities: {
    title: 'Equities',
    description: 'Global stock markets including US, European, and Asian exchanges',
    markets: ['S&P 500', 'NASDAQ', 'FTSE 100', 'DAX', 'Nikkei 225', 'Emerging Markets'],
  },
  commodities: {
    title: 'Commodities',
    description: 'Precious metals, energy, and agricultural commodities',
    markets: ['Gold', 'Silver', 'Crude Oil', 'Natural Gas', 'Copper', 'Agricultural Futures'],
  },
  crypto: {
    title: 'Cryptocurrencies',
    description: 'Major cryptocurrencies and DeFi tokens with fundamental analysis',
    markets: ['Bitcoin', 'Ethereum', 'Top 20 Altcoins', 'DeFi Tokens', 'NFT Projects'],
  },
  forex: {
    title: 'Forex',
    description: 'Major and minor currency pairs with central bank policy analysis',
    markets: ['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'Emerging Market FX'],
  },
  bonds: {
    title: 'Fixed Income',
    description: 'Government and corporate bonds across different maturities',
    markets: ['US Treasuries', 'Corporate Bonds', 'International Bonds', 'TIPS'],
  },
};

// Success metrics
export const successMetrics = [
  {
    metric: 'Annual Return',
    value: '24.7%',
    description: 'Average annual return over the past 3 years',
    benchmark: 'vs 11.2% S&P 500',
  },
  {
    metric: 'Win Rate',
    value: '68.5%',
    description: 'Percentage of profitable trades',
    benchmark: 'vs 55% industry average',
  },
  {
    metric: 'Max Drawdown',
    value: '-8.3%',
    description: 'Maximum peak-to-trough decline',
    benchmark: 'vs -23% S&P 500',
  },
  {
    metric: 'Sharpe Ratio',
    value: '1.84',
    description: 'Risk-adjusted return metric',
    benchmark: 'vs 0.89 market average',
  },
];

export default services;