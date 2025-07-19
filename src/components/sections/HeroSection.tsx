import React, { useState } from 'react';
import { ArrowDown, TrendingUp, BarChart3, Shield, Waves } from 'lucide-react';
import { COMPANY } from '@/utils/constants';
import { scrollToElement, cn } from '@/utils/helpers';
import Button from '@/components/common/Button';
import { useForm } from '@/hooks/useForm';
import { useTheme } from '@/context/ThemeContext';

interface NewsletterFormData {
  email: string;
}

const HeroSection: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { actualTheme } = useTheme();

  const { values, errors, handleChange, handleSubmit, isValid } = useForm<NewsletterFormData>({
    initialValues: { email: '' },
    validationRules: {
      email: {
        required: true,
        email: true,
      },
    },
    onSubmit: async (data) => {
      setIsSubmitting(true);
      try {
        // TODO: Implement newsletter subscription
        console.log('Newsletter subscription:', data);
        await new Promise(resolve => setTimeout(resolve, 1000));
        alert('Thank you for subscribing!');
      } catch (error) {
        console.error('Subscription error:', error);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const handleExploreClick = () => {
    scrollToElement('#performance');
  };


  return (
    <section
      id="hero"
      className="relative min-h-screen pt-20 flex items-center justify-center overflow-hidden hero-background"
    >
      {/* Ocean Background Effects */}
      <div className="absolute inset-0">
        {/* Floating Ocean Elements */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Animated waves */}
          <div className="absolute bottom-0 left-0 w-full h-32 opacity-20">
            <svg
              className="w-full h-full"
              viewBox="0 0 1200 120"
              preserveAspectRatio="none"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0,60 C150,100 300,0 450,40 C600,80 750,20 900,60 C1050,100 1200,20 1200,40 L1200,120 L0,120 Z"
                fill="url(#wave-gradient)"
                className="animate-wave"
              />
              <defs>
                <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="var(--color-light-blue)" stopOpacity="0.3" />
                  <stop offset="50%" stopColor="var(--color-pastel-mint)" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="var(--color-light-blue)" stopOpacity="0.3" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Floating particles */}
          <div className="absolute inset-0">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className={`absolute w-2 h-2 bg-primary-500/30 rounded-full animate-pulse`}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.5}s`,
                  animationDuration: `${3 + Math.random() * 2}s`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
        {/* Hero Text */}
        <div className="space-y-8 mb-12">
          <div className="space-y-6">
            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl font-bold leading-tight text-text-primary">
              Where Deep Research
              <br />
              <span className="text-primary-500 dark:text-primary-300">
                Meets Financial Markets
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-text-secondary max-w-4xl mx-auto leading-relaxed">
              Navigate global markets with professional-grade analysis and data-driven insights
              from our expert research team. Make informed decisions with confidence.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              variant="primary"
              size="lg"
              onClick={handleExploreClick}
              icon={<TrendingUp className="w-5 h-5" />}
            >
              Explore Analysis
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className={cn(
            "glass p-6 rounded-xl text-center transition-all duration-300 group cursor-pointer",
            "hover:-translate-y-2 hover:shadow-2xl",

            "hover:shadow-primary-500/25 hover:ring-1 hover:ring-primary-500/50",
            "dark:hover:shadow-primary-400/30 dark:hover:ring-primary-400/50"
          )}>
            <TrendingUp className={cn(
              "w-12 h-12 text-primary-500 mx-auto mb-4 transition-all duration-300",
              "group-hover:text-primary-400 group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(144,191,249,0.6)]"
            )} />
            <h3 className="text-text-primary font-semibold text-lg mb-2 group-hover:text-primary-400 transition-colors duration-300">
              Expert Analysis
            </h3>
            <p className="text-text-secondary text-sm">
              Deep market research and technical analysis from seasoned professionals
            </p>
          </div>

          <div className={cn(
            "glass p-6 rounded-xl text-center transition-all duration-300 group cursor-pointer",
            "hover:-translate-y-2 hover:shadow-2xl",

            "hover:shadow-pastel-mint/25 hover:ring-1 hover:ring-pastel-mint/50",
            "dark:hover:shadow-pastel-mint/30 dark:hover:ring-pastel-mint/50"
          )}>
            <BarChart3 className={cn(
              "w-12 h-12 text-pastel-mint mx-auto mb-4 transition-all duration-300",
              "group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(125,211,252,0.6)]"
            )} />
            <h3 className="text-text-primary font-semibold text-lg mb-2 group-hover:text-pastel-mint transition-colors duration-300">
              Real-Time Data
            </h3>
            <p className="text-text-secondary text-sm">
              Live market insights and performance tracking with detailed metrics
            </p>
          </div>

          <div className={cn(
            "glass p-6 rounded-xl text-center transition-all duration-300 group cursor-pointer",
            "hover:-translate-y-2 hover:shadow-2xl",

            "hover:shadow-pastel-coral/25 hover:ring-1 hover:ring-pastel-coral/50",
            "dark:hover:shadow-pastel-coral/30 dark:hover:ring-pastel-coral/50"
          )}>
            <Shield className={cn(
              "w-12 h-12 text-pastel-coral mx-auto mb-4 transition-all duration-300",
              "group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(251,146,60,0.6)]"
            )} />
            <h3 className="text-text-primary font-semibold text-lg mb-2 group-hover:text-pastel-coral transition-colors duration-300">
              Risk Management
            </h3>
            <p className="text-text-secondary text-sm">
              Comprehensive risk assessment and portfolio protection strategies
            </p>
          </div>
        </div>
      </div>

      {/* Background decorative elements */}
      <div className="absolute top-1/4 left-10 w-4 h-4 bg-primary-500/30 rounded-full animate-pulse" />
      <div className="absolute top-1/3 right-20 w-6 h-6 bg-pastel-mint/40 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-1/4 left-1/4 w-3 h-3 bg-pastel-coral/50 rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      <div className="absolute bottom-1/3 right-1/3 w-5 h-5 bg-primary-500/20 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
    </section>
  );
};

export default HeroSection;