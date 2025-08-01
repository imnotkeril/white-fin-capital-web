import { SubscriptionPlan } from '@/types';

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'professional',
    name: 'Professional',
    price: 49.90,
    period: 'monthly',
    description: 'Access to our research, insights and positions',
    features: [
      'Position Alerts',
      'Supporting Research and Analysis',
      'Weekly Market Review',
      'Monthly Performance Report',
      'Educational news related Insights',
      'Email Support',
    ],
    isPopular: false,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 89.90,
    period: 'monthly',
    description: 'Access to White Fin Capital Platform',
    features: [
      'Everything in Professional',
      'Our proprietary portfolio & risk management platform',
      'Portfolio analytics',
      'Integrated AI analysis tools',
      'Priority Email Support',
    ],
    isPopular: true,
  },
];

// Annual pricing
export const annualSubscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'professional',
    name: 'Professional',
    price: 499.90,
    originalPrice: 598.80, // 49.90 * 12
    period: 'yearly',
    description: 'Access to our research, insights and positions',
    features: [
      'Position Alerts',
      'Supporting Research and Analysis',
      'Weekly Market Review',
      'Monthly Performance Report',
      'Educational news related Insights',
      'Email Support',
    ],
    isPopular: false,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 949.90,
    originalPrice: 1078.80, // 89.90 * 12
    period: 'yearly',
    description: 'Access to White Fin Capital Platform',
    features: [
      'Everything in Professional',
      'Our proprietary portfolio & risk management platform',
      'Portfolio analytics',
      'Integrated AI analysis tools',
      'Priority Email Support',
    ],
    isPopular: true,
  },
];

export default subscriptionPlans;