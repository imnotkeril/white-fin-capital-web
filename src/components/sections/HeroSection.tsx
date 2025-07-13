import React, { useState } from 'react';
import { ArrowDown, TrendingUp, BarChart3, Shield } from 'lucide-react';
import { COMPANY } from '@/utils/constants';
import { scrollToElement } from '@/utils/helpers';
import Button from '@/components/common/Button';
import { useForm } from '@/hooks/useForm';
import { validateEmail } from '@/utils/validation';

interface NewsletterFormData {
  email: string;
}

const HeroSection: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
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

  const handleScrollDown = () => {
    scrollToElement('#performance');
  };

  return (
    <section 
      id="hero" 
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Ocean Background with Gradient */}
      <div className="absolute inset-0 ocean-gradient">
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Floating Ocean Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Animated waves */}
        <div className="absolute bottom-0 left-0 w-full h-32 opacity-30">
          <svg
            className="w-full h-full"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M0,60 C150,100 350,0 600,60 C850,120 1050,20 1200,60 V120 H0 Z"
              fill="rgba(255,255,255,0.1)"
              className="animate-pulse"
            />
          </svg>
        </div>

        {/* Floating icons */}
        <div className="absolute top-1/4 left-1/4 text-white/20 float-animation">
          <TrendingUp size={40} />
        </div>
        <div className="absolute top-1/3 right-1/4 text-white/20 float-animation" style={{ animationDelay: '1s' }}>
          <BarChart3 size={48} />
        </div>
        <div className="absolute bottom-1/3 left-1/6 text-white/20 float-animation" style={{ animationDelay: '2s' }}>
          <Shield size={36} />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Where Deep Research
            <br />
            <span className="text-gradient-gold">Meets Financial Markets</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
            Navigate global markets with professional-grade analysis and data-driven insights from our expert research team
          </p>

          {/* Newsletter Signup */}
          <div className="max-w-md mx-auto mb-12">
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <input
                  type="email"
                  placeholder="Your email address..."
                  value={values.email}
                  onChange={(e) => handleChange('email')(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg bg-white/90 backdrop-blur-sm border-0 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all ${
                    errors.email ? 'ring-2 ring-red-400' : ''
                  }`}
                />
                {errors.email && (
                  <p className="text-red-200 text-sm mt-1 text-left">{errors.email}</p>
                )}
              </div>
              
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isSubmitting}
                disabled={!isValid || isSubmitting}
                className="px-8 whitespace-nowrap"
              >
                Subscribe
              </Button>
            </form>
            
            <p className="text-white/70 text-sm mt-3">
              Join <span className="text-yellow-300 font-semibold">50,000+</span> investors for a FREE market analysis
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button
              variant="secondary"
              size="lg"
              onClick={handleExploreClick}
              className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 min-w-[180px]"
            >
              Explore Analysis
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              onClick={() => scrollToElement('#contact')}
              className="bg-transparent border-white/50 text-white hover:bg-white/10 min-w-[180px]"
            >
              Learn More
            </Button>
          </div>

          {/* Key Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="glass p-6 rounded-xl text-center hover-lift">
              <TrendingUp className="w-12 h-12 text-yellow-300 mx-auto mb-4" />
              <h3 className="text-white font-semibold text-lg mb-2">Expert Analysis</h3>
              <p className="text-white/80 text-sm">
                Deep market research and technical analysis from seasoned professionals
              </p>
            </div>
            
            <div className="glass p-6 rounded-xl text-center hover-lift">
              <BarChart3 className="w-12 h-12 text-blue-300 mx-auto mb-4" />
              <h3 className="text-white font-semibold text-lg mb-2">Real-Time Data</h3>
              <p className="text-white/80 text-sm">
                Live market insights and performance tracking with detailed metrics
              </p>
            </div>
            
            <div className="glass p-6 rounded-xl text-center hover-lift">
              <Shield className="w-12 h-12 text-green-300 mx-auto mb-4" />
              <h3 className="text-white font-semibold text-lg mb-2">Risk Management</h3>
              <p className="text-white/80 text-sm">
                Comprehensive risk assessment and portfolio protection strategies
              </p>
            </div>
          </div>
        </div>

        {/* Scroll Down Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <button
            onClick={handleScrollDown}
            className="flex flex-col items-center text-white/70 hover:text-white transition-colors group"
            aria-label="Scroll down"
          >
            <span className="text-sm mb-2 group-hover:translate-y-1 transition-transform">
              Scroll down
            </span>
            <ArrowDown className="w-5 h-5 animate-bounce" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;