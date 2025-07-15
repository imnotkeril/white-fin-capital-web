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
    essential: Shield,
    professional: Star,
    enterprise: Crown,
  };

  const calculateSavings = (monthlyPrice: number, annualPrice: number) => {
    const monthlyCost = monthlyPrice * 12;
    const savings = monthlyCost - annualPrice;
    const percentage = Math.round((savings / monthlyCost) * 100);
    return { amount: savings, percentage };
  };

  // ИСПРАВЛЕНО: расплющиваем данные для таблицы сравнения
  const flattenedFeatures = planComparisonFeatures.flatMap(category =>
    category.features
  );

  return (
    <section id="pricing" className="section bg-background-secondary">
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-6">
            Choose Your Plan
          </h2>
          <p className="text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed mb-8">
            Transparent pricing with no hidden fees. Start with a 14-day free trial,
            cancel anytime.
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
                Save 25%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards - ИСПРАВЛЕНО: убрана голубая рамка у Professional, улучшена кнопка Enterprise */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => {
            const IconComponent = planIcons[plan.id as keyof typeof planIcons] || Shield;
            const isPopular = plan.isPopular;
            const isEnterprise = plan.isEnterprise;

            return (
              <Card
                key={plan.id}
                ocean
                padding="lg"
                className={cn(
                  'relative overflow-hidden transition-all duration-200 hover:-translate-y-1',
                  // ИСПРАВЛЕНО: убрана ring-2 ring-primary-500 для популярного плана
                  isPopular ? 'shadow-xl' : ''
                )}
              >
                {/* Popular Badge */}
                {isPopular && (
                  <div className="absolute top-0 left-0 right-0 bg-primary-500 text-white text-center py-2 text-sm font-medium">
                    Most Popular
                  </div>
                )}

                <div className={cn('p-8', isPopular ? 'pt-16' : '')}>
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
                              Save {calculateSavings(subscriptionPlans[index].price, plan.price).percentage}%
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

                    {/* CTA Button - ИСПРАВЛЕНО: только Popular использует primary, остальные outline */}
                    <Button
                      variant={isPopular ? 'primary' : 'outline'}
                      size="lg"
                      fullWidth
                      onClick={() => handleSubscribe(plan.id)}
                    >
                      {isEnterprise ? 'Contact Sales' : 'Start Free Trial'}
                    </Button>
                  </div>

                  {/* Features List - ИСПРАВЛЕНО: используем системные цвета */}
                  <div className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
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

        {/* Comparison Table Toggle */}
        <div className="text-center mb-8">
          <Button
            variant="outline"
            onClick={() => setShowComparison(!showComparison)}
            icon={showComparison ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          >
            {showComparison ? 'Hide' : 'Show'} Feature Comparison
          </Button>
        </div>

        {/* Feature Comparison Table - ИСПРАВЛЕНО: используем расплющенные данные */}
        {showComparison && (
          <Card ocean padding="lg" className="mb-16 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-4 font-semibold text-text-primary">Features</th>
                  <th className="text-center py-4 px-4 font-semibold text-text-primary">Essential</th>
                  <th className="text-center py-4 px-4 font-semibold text-text-primary">Professional</th>
                  <th className="text-center py-4 px-4 font-semibold text-text-primary">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {flattenedFeatures.map((feature, index) => (
                  <tr key={index} className="border-b border-border hover:bg-background/50 transition-colors duration-200">
                    <td className="py-4 px-4 font-medium text-text-primary">{feature.name}</td>
                    <td className="py-4 px-4 text-center">
                      {typeof feature.essential === 'boolean' ? (
                        feature.essential ? (
                          <Check className="w-5 h-5 text-status-positive mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-text-tertiary mx-auto" />
                        )
                      ) : (
                        <span className="text-text-secondary text-sm">{feature.essential}</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {typeof feature.professional === 'boolean' ? (
                        feature.professional ? (
                          <Check className="w-5 h-5 text-status-positive mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-text-tertiary mx-auto" />
                        )
                      ) : (
                        <span className="text-text-secondary text-sm">{feature.professional}</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {typeof feature.enterprise === 'boolean' ? (
                        feature.enterprise ? (
                          <Check className="w-5 h-5 text-status-positive mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-text-tertiary mx-auto" />
                        )
                      ) : (
                        <span className="text-text-secondary text-sm">{feature.enterprise}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        {/* FAQ Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-text-primary mb-4">
              Frequently Asked Questions
            </h3>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Everything you need to know about our pricing and subscription plans
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {pricingFAQs.map((faq, index) => (
              <Card
                key={index}
                ocean
                padding="none"
                className="overflow-hidden"
              >
                <button
                  onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-background-secondary/50 transition-colors duration-200"
                >
                  <div className="flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-primary-500 flex-shrink-0" />
                    <span className="font-semibold text-text-primary">{faq.question}</span>
                  </div>
                  {expandedFAQ === index ? (
                    <ChevronUp className="w-5 h-5 text-text-secondary" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-text-secondary" />
                  )}
                </button>
                {expandedFAQ === index && (
                  <div className="px-6 pb-6">
                    <p className="text-text-secondary leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SubscriptionSection;