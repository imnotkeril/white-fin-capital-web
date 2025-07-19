// Subscription plans data for White Fin Capital - ИСПРАВЛЕНО

import { SubscriptionPlan } from '@/types'; // ИСПРАВЛЕНО: используем SubscriptionPlan

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'essential',
    name: 'Essential',
    price: 39,
    originalPrice: 49,
    period: 'monthly',
    description: 'Perfect for individual investors getting started with professional analysis',
    features: [
      'Weekly Market Analysis',
      'Monthly Performance Reports',
      'Basic Trade Alerts (5 per month)',
      'Educational Content Library',
      'Email Support',
      'Mobile App Access',
    ],
    isPopular: false,
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 99,
    originalPrice: 129,
    period: 'monthly',
    description: 'For active traders seeking comprehensive market insights and real-time alerts',
    features: [
      'Everything in Essential',
      'Real-time Trade Alerts (Unlimited)',
      'Daily Market Updates',
      'Advanced Technical Analysis',
      'Portfolio Analytics Dashboard',
      'Live Monthly Webinars',
      'Priority Email Support',
      'Risk Management Tools',
      'Sector Rotation Alerts',
      'Commodity & Crypto Coverage',
    ],
    isPopular: true,
  },

];

// Annual pricing (with discount)
export const annualSubscriptionPlans: SubscriptionPlan[] = subscriptionPlans.map(plan => ({
  ...plan,
  period: 'yearly' as const,
  price: Math.round(plan.price * 12 * 0.75), // 25% discount
  ...(plan.originalPrice && { originalPrice: Math.round(plan.originalPrice * 12) }),
}));

// Plan comparison features
export const planComparisonFeatures = [
  {
    category: 'Research & Analysis',
    features: [
      {
        name: 'Weekly Market Analysis',
        essential: true,
        professional: true,
      },
      {
        name: 'Daily Market Updates',
        essential: false,
        professional: true,
      },
      {
        name: 'Custom Research Reports',
        essential: false,
        professional: false,
      },
      {
        name: 'Institutional Analytics',
        essential: false,
        professional: false,
      },
    ],
  },
  {
    category: 'Trade Alerts',
    features: [
      {
        name: 'Basic Trade Alerts',
        essential: '5 per month',
        professional: 'Unlimited',
      },
      {
        name: 'Real-time Notifications',
        essential: false,
        professional: true,
      },
      {
        name: 'Custom Alert Rules',
        essential: false,
        professional: false,
      },
      {
        name: 'Multi-asset Coverage',
        essential: 'Stocks only',
        professional: 'All assets',
      },
    ],
  },
  {
    category: 'Tools & Features',
    features: [
      {
        name: 'Portfolio Analytics',
        essential: false,
        professional: true,
      },
      {
        name: 'Risk Management Tools',
        essential: false,
        professional: true,
      },
      {
        name: 'API Access',
        essential: false,
        professional: false,
      },
      {
        name: 'Mobile App',
        essential: true,
        professional: true,
      },
    ],
  },
  {
    category: 'Support & Education',
    features: [
      {
        name: 'Email Support',
        essential: 'Standard',
        professional: 'Priority',
      },
      {
        name: 'Educational Content',
        essential: true,
        professional: true,
      },
      {
        name: 'Live Webinars',
        essential: false,
        professional: 'Monthly',
      },
      {
        name: 'Direct Analyst Access',
        essential: false,
        professional: false,
      },
    ],
  },
];

// Pricing FAQs
export const pricingFAQs = [
  {
    question: 'Can I cancel my subscription anytime?',
    answer: 'Yes, you can cancel your subscription at any time. There are no long-term contracts or cancellation fees. Your access will continue until the end of your current billing period.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, MasterCard, American Express) and PayPal.',
  },
  {
    question: 'Do you offer a free trial?',
    answer: 'Yes, all new subscribers get a 14-day free trial of the Professional plan. No credit card required to start your trial.',
  },
  {
    question: 'Can I upgrade or downgrade my plan?',
    answer: 'Absolutely. You can change your plan at any time from your account dashboard. Upgrades take effect immediately, while downgrades take effect at the next billing cycle.',
  },
  {
    question: 'Is there a money-back guarantee?',
    answer: 'Yes, we offer a 30-day money-back guarantee for all plans. If you\'re not satisfied with our service, contact us within 30 days for a full refund.',
  },
  {
    question: 'Do you offer discounts for annual subscriptions?',
    answer: 'Yes, annual subscriptions receive a 25% discount compared to monthly billing. This is automatically applied when you select annual billing.',
  },
];

// Special offers
export const specialOffers = [
  {
    id: 'new-user',
    title: 'New User Special',
    description: 'Get 50% off your first month',
    code: 'WELCOME50',
    discount: 50,
    type: 'percentage',
    validUntil: '2025-12-31',
    applicablePlans: ['essential', 'professional'],
  },
  {
    id: 'annual-discount',
    title: 'Annual Savings',
    description: 'Save 25% with annual billing',
    discount: 25,
    type: 'percentage',
    permanent: true,
    applicablePlans: ['essential', 'professional'],
  },
];


// Usage limits by plan
export const usageLimits = {
  essential: {
    tradeAlerts: 5,
    customWatchlists: 3,
    portfolios: 1,
    reportHistory: '3 months',
    apiCalls: 0,
  },
  professional: {
    tradeAlerts: -1, // unlimited
    customWatchlists: 10,
    portfolios: 5,
    reportHistory: '12 months',
    apiCalls: 1000,
  },

};

// Success stories by plan
export const planSuccessStories = {
  essential: {
    customerName: 'Michael T.',
    result: '+18.3% return in 6 months',
    quote: 'The weekly analysis helped me identify trends I was missing on my own.',
  },
  professional: {
    customerName: 'Sarah L.',
    result: '+31.7% return in 12 months',
    quote: 'Real-time alerts and portfolio analytics completely transformed my trading results.',
  },

};

export default subscriptionPlans;