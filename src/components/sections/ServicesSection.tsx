import React, { useState } from 'react';
import {
  TrendingUp,
  Bell,
  BarChart3,
  BookOpen,
  ArrowRight,
  CheckCircle,
  PlayCircle,
  Users,
  Shield,
  Zap,
} from 'lucide-react';
import { services, researchProcess, keyDifferentiators } from '@/data/services';
import { cn, scrollToElement } from '@/utils/helpers';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import { ServiceFeature } from '@/types';

const ServicesSection: React.FC = () => {
  const [activeService, setActiveService] = useState(0);
  const [activeProcess, setActiveProcess] = useState(0);

  const iconMap = {
    TrendingUp,
    Bell,
    BarChart3,
    BookOpen,
    Search: TrendingUp, // fallback
    FileText: BookOpen, // fallback
    Shield,
    Zap,
    Eye: Shield, // fallback для Transparency
  };

  const handleSubscribeClick = () => {
    scrollToElement('#pricing');
  };

  const handleLearnMoreClick = () => {
    scrollToElement('#contact');
  };

  return (
    <section id="services" className="section bg-background-secondary">
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-6">
            Our Services
          </h2>
          <p className="text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
            Comprehensive financial research and analysis tools designed to give you
            the edge in today&apos;s complex markets.
          </p>
        </div>

        {/* Services Tabs */}
        <div className="mb-16">
          {/* Tab Navigation - ИСПРАВЛЕНО: правильные анимации и цвета */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {services.map((service, index) => {
              const IconComponent = iconMap[service.icon as keyof typeof iconMap] || TrendingUp;
              return (
                <button
                  key={service.id}
                  onClick={() => setActiveService(index)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200',
                    activeService === index
                      ? 'bg-primary-500 text-white shadow-lg'
                      : 'bg-background text-text-secondary hover:text-text-primary hover:bg-background-tertiary'
                  )}
                >
                  <IconComponent className="w-5 h-5" />
                  <span className="hidden sm:inline">{service.title}</span>
                </button>
              );
            })}
          </div>

          {/* Active Service Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Service Image/Mockup - ИСПРАВЛЕНО: используем Card ocean */}
            <div className="relative">
              <Card ocean padding="lg" className="transition-all duration-200 hover:-translate-y-1">
                <div className="aspect-video bg-gradient-to-br from-primary-500/20 to-pastel-pearl/20 rounded-lg flex items-center justify-center">
                  {(() => {
                    const IconComponent = iconMap[services[activeService]?.icon as keyof typeof iconMap] || TrendingUp;
                    return <IconComponent className="w-24 h-24 text-primary-500" />;
                  })()}
                </div>

                {/* Mock Interface Elements */}
                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-status-positive rounded-full"></div>
                      <span className="text-sm text-text-secondary">Live</span>
                    </div>
                    <span className="text-xs text-text-tertiary">Updated 2 min ago</span>
                  </div>

                  <div className="space-y-2">
                    <div className="h-2 bg-background-tertiary rounded-full">
                      <div className="h-2 bg-primary-500 rounded-full w-3/4"></div>
                    </div>
                    <div className="h-2 bg-background-tertiary rounded-full">
                      <div className="h-2 bg-primary-500 rounded-full w-1/2"></div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Floating elements for visual appeal - ИСПРАВЛЕНО: используем системные цвета */}
              <div className="absolute -top-4 -right-4 bg-status-positive text-white p-2 rounded-lg text-xs font-medium">
                Real-time
              </div>
              <div className="absolute -bottom-4 -left-4 bg-primary-500 text-white p-2 rounded-lg text-xs font-medium">
                AI-Powered
              </div>
            </div>

            {/* Service Details */}
            <div>
              <h3 className="text-3xl font-bold text-text-primary mb-4">
                {services[activeService]?.title}
              </h3>

              <p className="text-lg text-text-secondary mb-8 leading-relaxed">
                {services[activeService]?.description}
              </p>

              {/* Features List - ИСПРАВЛЕНО: используем правильную структуру данных */}
              <div className="space-y-4 mb-8">
                {services[activeService]?.features.map((feature: ServiceFeature, index: number) => (
                  <div key={index} className="flex gap-3">
                    <CheckCircle className="w-6 h-6 text-status-positive flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-text-primary mb-1">
                        {feature.title}
                      </h4>
                      <p className="text-text-secondary text-sm">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleSubscribeClick}
                  icon={<ArrowRight className="w-5 h-5" />}
                >
                  Get Started
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleLearnMoreClick}
                  icon={<PlayCircle className="w-5 h-5" />}
                >
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Research Process - ИСПРАВЛЕНО: используем Card ocean */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-text-primary mb-4">
              Our Research Process
            </h3>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Systematic approach to market analysis with proven methodologies
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {researchProcess.map((step, index) => {
              const IconComponent = iconMap[step.icon as keyof typeof iconMap] || TrendingUp;
              const isActive = activeProcess === index;

              return (
                <Card
                  key={index}
                  ocean
                  padding="lg"
                  className={cn(
                    "text-center cursor-pointer transition-all duration-200 group",
                  )}
                >
                  <div className="w-16 h-16 bg-background-secondary border border-border rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all duration-200 group-hover:border-primary-500">
                    <IconComponent className="w-8 h-8 text-primary-500" />
                  </div>

                  <div className="w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-3">
                    {step.step}
                  </div>

                  <h4 className="text-lg font-semibold text-text-primary mb-2">
                    {step.title}
                  </h4>

                  <p className="text-text-secondary text-sm">
                    {step.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Key Differentiators - ИСПРАВЛЕНО: используем Card ocean */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-text-primary mb-4">
              Why Choose White Fin Capital
            </h3>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              What sets us apart in the competitive landscape of financial research
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {keyDifferentiators.map((differentiator, index) => {
              const IconComponent = iconMap[differentiator.icon as keyof typeof iconMap] || Shield;

              return (
                <Card
                  key={index}
                  ocean
                  padding="lg"
                  className="text-center transition-all duration-200 hover:-translate-y-1 group"
                >
                  <div className="w-16 h-16 bg-background-secondary border border-border rounded-2xl flex items-center justify-center mx-auto mb-6 transition-all duration-200 group-hover:border-primary-500">
                    <IconComponent className="w-8 h-8 text-primary-500" />
                  </div>

                  <h4 className="text-xl font-semibold text-text-primary mb-4">
                    {differentiator.title}
                  </h4>

                  <p className="text-text-secondary leading-relaxed">
                    {differentiator.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>

        {/* CTA Section - ИСПРАВЛЕНО: используем Card ocean */}
        <Card ocean padding="xl" className="text-center px-8 py-12 md:px-12 md:py-8">
          <h3 className="text-3xl font-bold text-text-primary mb-4">
            Ready to Elevate Your Investment Strategy?
          </h3>
          <p className="text-lg text-text-secondary mb-8 max-w-2xl mx-auto">
            Join thousands of investors who rely on our research for superior returns
            and risk management.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="primary"
              size="lg"
              onClick={handleSubscribeClick}
              icon={<Users className="w-5 h-5" />}
            >
              Start Free Trial
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={handleLearnMoreClick}
            >
              Schedule Consultation
            </Button>
          </div>

          <div className="flex justify-center items-center gap-6 mt-8 text-sm text-text-tertiary">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-status-positive" />
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-status-positive" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-status-positive" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default ServicesSection;