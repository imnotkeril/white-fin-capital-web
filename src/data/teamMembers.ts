// Team members data for White Fin Capital

import { TeamMember } from '@/types';

export const teamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Alexander Morrison',
    position: 'Chief Market Strategist & Founder',
    bio: 'Alexander leads White Fin Capital with over 15 years of experience in global markets. Former Goldman Sachs derivatives trader and JPMorgan portfolio manager, he specializes in macro-economic analysis and systematic trading strategies.',
    education: 'MBA Finance - Wharton School, MS Mathematics - MIT',
    experience: '15+ years in institutional trading and research',
    image: '/images/team/team-member-1.jpg',
    linkedinUrl: 'https://linkedin.com/in/alexander-morrison',
    specializations: [
      'Macro Economics',
      'Derivatives Trading',
      'Risk Management',
      'Systematic Strategies',
    ],
  },
  {
    id: '2',
    name: 'Dr. Sarah Chen',
    position: 'Head of Quantitative Research',
    bio: 'Dr. Chen brings cutting-edge quantitative methods to market analysis. With a PhD in Financial Engineering and experience at Renaissance Technologies, she develops our proprietary models and statistical arbitrage strategies.',
    education: 'PhD Financial Engineering - Stanford, MS Statistics - UC Berkeley',
    experience: '12+ years in quantitative finance and algorithmic trading',
    image: '/images/team/team-member-2.jpg',
    linkedinUrl: 'https://linkedin.com/in/sarah-chen-phd',
    specializations: [
      'Machine Learning',
      'Statistical Arbitrage',
      'Options Pricing',
      'Algorithmic Trading',
    ],
  },
  {
    id: '3',
    name: 'Marcus Rodriguez',
    position: 'Senior Technical Analyst',
    bio: 'Marcus combines traditional technical analysis with modern data science approaches. Former head of technical analysis at Bridgewater Associates, he provides precise entry and exit signals across multiple asset classes.',
    education: 'CFA, CMT, BS Economics - University of Chicago',
    experience: '10+ years in technical analysis and market research',
    image: '/images/team/team-member-3.jpg',
    linkedinUrl: 'https://linkedin.com/in/marcus-rodriguez-cfa',
    specializations: [
      'Technical Analysis',
      'Chart Patterns',
      'Market Structure',
      'Multi-Asset Trading',
    ],
  },
];

// Additional team stats
export const teamStats = {
  totalExperience: '37+ years',
  combinedAUM: '$2.8B+',
  publicationsCount: 145,
  speakingEngagements: 67,
  clientsSince: 2019,
  teamSize: 8,
};

// Team achievements
export const teamAchievements = [
  {
    year: '2024',
    achievement: 'Top 1% Performance',
    description: 'Ranked in top 1% of investment advisors by risk-adjusted returns',
  },
  {
    year: '2023',
    achievement: 'Research Excellence Award',
    description: 'CFA Institute recognition for innovative market research methodology',
  },
  {
    year: '2022',
    achievement: 'Best Risk Management',
    description: 'Alternative Investment Management Association award for risk controls',
  },
  {
    year: '2021',
    achievement: 'Innovation in Finance',
    description: 'FinTech Breakthrough Award for quantitative analysis platform',
  },
];

// Team credentials and certifications
export const teamCredentials = [
  'CFA (Chartered Financial Analyst)',
  'CMT (Chartered Market Technician)',
  'FRM (Financial Risk Manager)',
  'CAIA (Chartered Alternative Investment Analyst)',
  'CQF (Certificate in Quantitative Finance)',
  'PhD Financial Engineering',
  'MBA Finance (Top-tier Universities)',
];

// Advisory board (if needed)
export const advisoryBoard = [
  {
    name: 'Robert Hamilton',
    position: 'Former CIO, Deutsche Bank',
    bio: 'Strategic advisor on institutional trading and risk management',
  },
  {
    name: 'Patricia Williamson',
    position: 'Former Partner, KKR',
    bio: 'Advisor on alternative investments and portfolio construction',
  },
];

// Company culture and values
export const companyValues = [
  {
    title: 'Transparency',
    description: 'All trade ideas and results are publicly documented with full transparency',
    icon: 'Eye',
  },
  {
    title: 'Rigorous Research',
    description: 'Every investment thesis is backed by comprehensive fundamental and technical analysis',
    icon: 'Search',
  },
  {
    title: 'Risk First',
    description: 'Risk management is paramount in every investment decision and portfolio construction',
    icon: 'Shield',
  },
  {
    title: 'Continuous Learning',
    description: 'Markets evolve, and so do our methods through constant research and adaptation',
    icon: 'BookOpen',
  },
];

// Office locations (if applicable)
export const officeLocations = [
  {
    city: 'New York',
    address: '123 Financial District, NY 10004',
    type: 'Headquarters',
  },
  {
    city: 'London',
    address: '45 Canary Wharf, London E14 5AB',
    type: 'European Office',
  },
];

export default teamMembers;