import React, { useState } from 'react';
import { ArrowDown, TrendingUp, BarChart3, Shield } from 'lucide-react';
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

  const handleSubscribeClick = () => {
    scrollToElement('#pricing');
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen pt-20 flex items-center justify-center overflow-hidden"
    >
      {/* Background with blur */}
      {/* Два фоновых изображения с crossfade */}
      <div className="absolute inset-0 z-0">
        <div
          className={cn(
            "absolute inset-0 transition-opacity duration-500",
            actualTheme === 'light' ? 'opacity-100' : 'opacity-0'
          )}
          style={{
            backgroundImage: 'url("/images/ocean-light.jpg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
            filter: 'blur(1.5px)',
          }}
        />
        <div
          className={cn(
            "absolute inset-0 transition-opacity duration-500",
            actualTheme === 'dark' ? 'opacity-100' : 'opacity-0'
          )}
          style={{
            backgroundImage: 'url("/images/ocean.jpg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
            filter: 'blur(1.5px)',
          }}
        />
      </div>
      {/* Main Content */}
      <div className="relative z-20 max-w-6xl mx-auto px-6 text-center">
        {/* Hero Text */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-text-primary mb-6 leading-tight">
            Where Deep Research
            <span className="block text-primary-400">
              Meets Financial Markets
            </span>
          </h1>
          <div className="max-w-3xl mx-auto">
            <p className="text-lg md:text-xl text-text-secondary leading-relaxed mb-8">
              Navigate global markets with professional-grade analysis and data-driven insights
              from our expert research team. Make informed decisions with confidence.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              variant="primary"
              size="lg"
              onClick={handleSubscribeClick}
              icon={<TrendingUp className="w-5 h-5" />}
            >
              Subscribe Now
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className={cn(
            "glass p-6 rounded-xl text-center transition-all duration-300 group cursor-pointer bg-white/10 backdrop-blur-20",
            "hover:-translate-y-2 hover:shadow-2xl",
            "hover:shadow-primary-500/25 hover:ring-1 hover:ring-primary-500/50",
            "dark:hover:shadow-primary-400/30 dark:hover:ring-primary-400/50"
          )}>
            <TrendingUp className={cn(
              "w-12 h-12 text-primary-500 dark:text-primary-400 mx-auto mb-4 transition-all duration-300",
              "group-hover:scale-110 group-hover:text-primary-600 dark:group-hover:text-primary-300"
            )} />
            <h3 className="text-text-primary font-semibold text-lg mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-300 transition-colors duration-300">
              Expert Analysis
            </h3>
            <p className="text-text-secondary text-sm">
              Deep market research and technical analysis from seasoned professionals
            </p>
          </div>

          <div className={cn(
            "glass p-6 rounded-xl text-center transition-all duration-300 group cursor-pointer bg-white/10 backdrop-blur-20",
            "hover:-translate-y-2 hover:shadow-2xl",
            "hover:shadow-primary-500/25 hover:ring-1 hover:ring-primary-500/50",
            "dark:hover:shadow-primary-400/30 dark:hover:ring-primary-400/50"
          )}>
            <BarChart3 className={cn(
              "w-12 h-12 text-primary-500 dark:text-primary-400 mx-auto mb-4 transition-all duration-300",
              "group-hover:scale-110 group-hover:text-primary-600 dark:group-hover:text-primary-300"
            )} />
            <h3 className="text-text-primary font-semibold text-lg mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-300 transition-colors duration-300">
              Real-Time Data
            </h3>
            <p className="text-text-secondary text-sm">
              Live market insights and performance tracking with detailed metrics
            </p>
          </div>

          <div className={cn(
            "glass p-6 rounded-xl text-center transition-all duration-300 group cursor-pointer bg-white/10 backdrop-blur-20",
            "hover:-translate-y-2 hover:shadow-2xl",
            "hover:shadow-primary-500/25 hover:ring-1 hover:ring-primary-500/50",
            "dark:hover:shadow-primary-400/30 dark:hover:ring-primary-400/50"
          )}>
            <Shield className={cn(
              "w-12 h-12 text-primary-500 dark:text-primary-400 mx-auto mb-4 transition-all duration-300",
              "group-hover:scale-110 group-hover:text-primary-600 dark:group-hover:text-primary-300"
            )} />
            <h3 className="text-text-primary font-semibold text-lg mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-300 transition-colors duration-300">
              Risk Management
            </h3>
            <p className="text-text-secondary text-sm">
              Comprehensive risk assessment and portfolio protection strategies
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;