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
            the edge in today's complex markets.
          </p>
        </div>

        {/* Services Tabs */}
        <div className="mb-16">
          {/* Tab Navigation */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {services.map((service, index) => {
              const IconComponent = iconMap[service.icon as keyof typeof iconMap] || TrendingUp;
              return (
                <button
                  key={service.id}
                  onClick={() => setActiveService(index)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-300',
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
            {/* Service Image/Mockup */}
            <div className="relative">
              <Card className="p-8 glass" hover>
                <div className="aspect-video bg-gradient-to-br from-primary-500/20 to-ocean-500/20 rounded-lg flex items-center justify-center">
                  {(() => {
                    const IconComponent = iconMap[services[activeService].icon as keyof typeof iconMap] || TrendingUp;
                    return <IconComponent className="w-24 h-24 text-primary-500" />;
                  })()}
                </div>
                
                {/* Mock Interface Elements */}
                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-accent-green rounded-full"></div>
                      <span className="text-sm text-text-secondary">Live</span>
                    </div>
                    <span className="text-xs text-text-tertiary">Updated 2 min ago</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="h-2 bg-primary-200 rounded-full">
                      <div className="h-2 bg-primary-500 rounded-full w-3/4"></div>
                    </div>
                    <div className="h-2 bg-primary-200 rounded-full">
                      <div className="h-2 bg-primary-500 rounded-full w-1/2"></div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Floating elements for visual appeal */}
              <div className="absolute -top-4 -right-4 bg-accent-green text-white p-2 rounded-lg text-xs font-medium">
                Real-time
              </div>
              <div className="absolute -bottom-4 -left-4 bg-primary-500 text-white p-2 rounded-lg text-xs font-medium">
                AI-Powered
              </div>
            </div>

            {/* Service Details */}
            <div>
              <h3 className="text-3xl font-bold text-text-primary mb-4">
                {services[activeService].title}
              </h3>
              
              <p className="text-lg text-text-secondary mb-8 leading-relaxed">
                {services[activeService].description}
              </p>

              {/* Features List */}
              <div className="space-y-4 mb-8">
                {services[activeService].features.map((feature, index) => (
                  <div key={index} className="flex gap-3">
                    <CheckCircle className="w-6 h-6 text-accent-green flex-shrink-0 mt-0.5" />
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
                  iconPosition="right"
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

        {/* Research Process */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-text-primary mb-4">
              Our Research Process
            </h3>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              A systematic approach combining fundamental analysis, technical indicators, 
              and risk management for superior results.
            </p>
          </div>

          {/* Process Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {researchProcess.map((step, index) => {
              const IconComponent = iconMap[step.icon as keyof typeof iconMap] || TrendingUp;
              return (
                <Card
                  key={step.step}
                  className={cn(
                    'relative overflow-hidden cursor-pointer transition-all duration-300',
                    activeProcess === index ? 'ring-2 ring-primary-500' : ''
                  )}
                  hover
                  onClick={() => setActiveProcess(index)}
                >
                  {/* Step Number */}
                  <div className="absolute top-4 right-4">
                    <div className="w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {step.step}
                    </div>
                  </div>

                  <div className="p-6">
                    <IconComponent className="w-12 h-12 text-primary-500 mb-4" />
                    <h4 className="text-xl font-semibold text-text-primary mb-3">
                      {step.title}
                    </h4>
                    <p className="text-text-secondary">
                      {step.description}
                    </p>
                  </div>

                  {/* Progress Line */}
                  {index < researchProcess.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 w-8 border-t-2 border-dashed border-primary-300" />
                  )}
                </Card>
              );
            })}
          </div>
        </div>

        {/* Key Differentiators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {keyDifferentiators.map((differentiator, index) => {
            const IconComponent = iconMap[differentiator.icon as keyof typeof iconMap] || Shield;
            return (
              <Card key={index} className="text-center" hover padding="lg">
                <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <IconComponent className="w-8 h-8 text-primary-500" />
                </div>
                
                <h4 className="text-lg font-semibold text-text-primary mb-3">
                  {differentiator.title}
                </h4>
                
                <p className="text-text-secondary text-sm">
                  {differentiator.description}
                </p>
              </Card>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <Card className="p-12 glass">
            <h3 className="text-3xl font-bold text-text-primary mb-4">
              Ready to Transform Your Investment Strategy?
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
                <CheckCircle className="w-4 h-4 text-accent-green" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-accent-green" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-accent-green" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;