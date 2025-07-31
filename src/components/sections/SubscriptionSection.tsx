import React, { useState } from 'react';
import {
  Check,
  X,
  Star,
  Crown,
  Shield,
  Zap,
  ChevronDown,
  ChevronUp,
  HelpCircle,
} from 'lucide-react';
import {
  subscriptionPlans,
  annualSubscriptionPlans,
  planComparisonFeatures,
  pricingFAQs,
} from '@/data/subscriptionPlans';
import { formatCurrency } from '@/utils/formatting';
import { cn } from '@/utils/helpers';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';

const SubscriptionSection: React.FC = () => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('annual');
  const [showComparison, setShowComparison] = useState(false);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const plans = billingPeriod === 'annual' ? annualSubscriptionPlans : subscriptionPlans;

  const handleSubscribe = (planId: string) => {
    // TODO: Implement subscription flow
    console.log('Subscribing to plan:', planId, 'billing:', billingPeriod);
  };

  const planIcons = {
    professional: Shield,
    premium: Star,
  };

  const calculateSavings = (monthlyPrice: number, annualPrice: number) => {
    const monthlyCost = monthlyPrice * 12;
    const savings = monthlyCost - annualPrice;
    const percentage = Math.round((savings / monthlyCost) * 100);
    return { amount: savings, percentage };
  };


  return (
    <section id="pricing" className="section bg-background-secondary">
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-6">
            Become an insider
          </h2>
          <p className="text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed mb-8">
            Gain exclusive access to our position alerts, research insights and our institution-grade portfolio management software.
          </p>

          {/* Billing Toggle - ИСПРАВЛЕНО: правильные анимации */}
          <div className="inline-flex items-center bg-background rounded-lg p-1 border border-border">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={cn(
                'px-6 py-2 rounded-md font-medium transition-all duration-200',
                billingPeriod === 'monthly'
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('annual')}
              className={cn(
                'px-6 py-2 rounded-md font-medium transition-all duration-200 relative',
                billingPeriod === 'annual'
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              )}
            >
              Annual
              <span className="absolute -top-2 -right-1 bg-status-positive text-white text-xs px-2 py-1 rounded-full">
                Discount
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {plans.map((plan, index) => {
              const IconComponent = planIcons[plan.id as keyof typeof planIcons] || Shield;
              const isPopular = plan.isPopular;
              const isEnterprise = plan.isEnterprise;

              return (
                <Card
                  key={plan.id}
                  ocean
                  padding="lg"
                  className="relative overflow-hidden transition-all duration-200 hover:-translate-y-1"
                >
                  <div className="p-8">
                    {/* Plan Header */}
                    <div className="text-center mb-8">
                      <div className="w-16 h-16 bg-background-secondary border border-border rounded-full flex items-center justify-center mx-auto mb-4">
                        <IconComponent className="w-8 h-8 text-primary-500" />
                      </div>

                      <h3 className="text-2xl font-bold text-text-primary mb-2">
                        {plan.name}
                      </h3>

                      <p className="text-text-secondary text-sm mb-6">
                        {plan.description}
                      </p>

                      {/* Pricing */}
                      <div className="mb-6">
                        <div className="flex items-baseline justify-center gap-2">
                          <span className="text-4xl font-bold text-text-primary">
                            {formatCurrency(plan.price)}
                          </span>
                          <span className="text-text-secondary">
                            /{plan.period === 'monthly' ? 'mo' : 'year'}
                          </span>
                        </div>

                        {plan.originalPrice && (
                          <div className="flex items-center justify-center gap-2 mt-2">
                            <span className="text-text-tertiary line-through">
                              {formatCurrency(plan.originalPrice)}
                            </span>
                            {billingPeriod === 'annual' && (
                              <span className="text-status-positive text-sm font-medium">
                                Save {calculateSavings(subscriptionPlans[index]?.price || 0, plan.price).percentage}%
                              </span>
                            )}
                          </div>
                        )}

                        {billingPeriod === 'annual' && (
                          <p className="text-text-tertiary text-sm mt-2">
                            ${Math.round(plan.price / 12)}/month billed annually
                          </p>
                        )}
                      </div>

                      {/* CTA Button - исправленные кнопки */}
                      <Button
                        variant="outline"
                        size="lg"
                        fullWidth
                        onClick={() => handleSubscribe(plan.id)}
                      >
                        {isEnterprise ? 'Contact Sales' : 'Subscribe'}
                      </Button>
                    </div>

                    {/* Features List */}
                    <div className="space-y-3">
                      {plan.features.map((feature: string, featureIndex: number) => (
                        <div key={featureIndex} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-status-positive flex-shrink-0 mt-0.5" />
                          <span className="text-text-secondary text-sm">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Enterprise Contact */}
                    {isEnterprise && (
                      <div className="mt-6 pt-6 border-t border-border text-center">
                        <p className="text-text-secondary text-sm mb-2">
                          Custom pricing available
                        </p>
                        <p className="text-text-tertiary text-xs">
                          Volume discounts for teams
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SubscriptionSection;