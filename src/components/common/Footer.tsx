import React, { useState } from 'react';
import {
  Linkedin,
  Twitter,
  Youtube,
  Instagram,
  Send,
  ArrowUp,
  Mail,
  Phone,
  MapPin,
  Shield,
  FileText,
  HelpCircle,
} from 'lucide-react';
import { COMPANY, NAVIGATION_ITEMS, SOCIAL_LINKS } from '@/utils/constants';
import { useTheme } from '@/context/ThemeContext';
import { scrollToElement } from '@/utils/helpers';
import { useForm } from '@/hooks/useForm';
import Button from './Button';

interface NewsletterFormData {
  email: string;
}

const Footer: React.FC = () => {
  const { theme } = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const { values, errors, handleChange, handleSubmit, isValid, resetForm } = useForm<NewsletterFormData>({
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
        setSubscriptionStatus('success');
        resetForm();
        setTimeout(() => setSubscriptionStatus('idle'), 3000);
      } catch (error) {
        console.error('Subscription error:', error);
        setSubscriptionStatus('error');
        setTimeout(() => setSubscriptionStatus('idle'), 3000);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const handleNavClick = (href: string, section?: string) => {
    if (section) {
      scrollToElement(`#${section}`);
    } else {
      scrollToElement(href);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const footerSections = [
    {
      title: 'Navigation',
      links: NAVIGATION_ITEMS.map(item => ({
        label: item.label,
        href: item.href,
        section: item.section
      }))
    },
    {
      title: 'Services',
      links: [
        { label: 'Market Analysis', href: '#services', section: 'services' },
        { label: 'Portfolio Management', href: '#services', section: 'services' },
        { label: 'Risk Assessment', href: '#services', section: 'services' },
        { label: 'Financial Planning', href: '#contact', section: 'contact' },
      ]
    },
    {
      title: 'Resources',
      links: [
        { label: 'Research Reports', href: '#performance', section: 'performance' },
        { label: 'Market Insights', href: '#performance', section: 'performance' },
        { label: 'Educational Content', href: '#team', section: 'team' },
        { label: 'API Documentation', href: '#contact', section: 'contact' },
      ]
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Terms of Service', href: '/terms' },
        { label: 'Cookie Policy', href: '/cookies' },
        { label: 'Compliance', href: '/compliance' },
      ]
    }
  ];

  const socialIcons = {
    linkedin: Linkedin,
    twitter: Twitter,
    youtube: Youtube,
    instagram: Instagram,
  };

  return (
    <footer className="relative bg-background border-t border-border">
      {/* Ocean wave pattern */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-500/30 to-transparent" />

      <div className="container py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-12">
          {/* Company Info & Newsletter */}
          <div className="lg:col-span-4 space-y-8">
            {/* Logo & Company Info */}
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-pastel-mint rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">🌊</span>
                </div>
                <div>
                  <h3 className="font-bold text-xl text-text-primary">
                    {COMPANY.name}
                  </h3>
                  <p className="text-text-secondary text-sm">
                    Financial Research
                  </p>
                </div>
              </div>

              <p className="text-text-secondary mb-6 leading-relaxed">
                Professional financial research and market analysis. Navigate global markets with
                data-driven insights from our expert team.
              </p>

              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center text-text-secondary">
                  <Mail className="w-5 h-5 mr-3 text-primary-500" />
                  <span className="text-sm">contact@whitefincapital.com</span>
                </div>
                <div className="flex items-center text-text-secondary">
                  <Phone className="w-5 h-5 mr-3 text-primary-500" />
                  <span className="text-sm">+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center text-text-secondary">
                  <MapPin className="w-5 h-5 mr-3 text-primary-500" />
                  <span className="text-sm">New York, NY</span>
                </div>
              </div>
            </div>

            {/* Newsletter Subscription */}
            <div className="glass rounded-xl p-6">
              <h4 className="font-semibold text-text-primary mb-3 flex items-center">
                <Send className="w-5 h-5 mr-2 text-primary-500" />
                Stay Updated
              </h4>
              <p className="text-text-secondary text-sm mb-4">
                Get the latest market insights and research reports.
              </p>

              {subscriptionStatus === 'success' ? (
                <div className="status-positive text-center py-3">
                  ✓ Successfully subscribed!
                </div>
              ) : subscriptionStatus === 'error' ? (
                <div className="status-negative text-center py-3">
                  ✗ Something went wrong. Please try again.
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <input
                      type="email"
                      name="email"
                      value={values.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      className={`form-input ${
                        errors.email ? 'border-status-negative focus:border-status-negative focus:ring-status-negative/20' : ''
                      }`}
                    />
                    {errors.email && (
                      <p className="form-error">{errors.email}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    fullWidth
                    loading={isSubmitting}
                    disabled={!isValid || isSubmitting}
                    icon={<Send className="w-4 h-4" />}
                  >
                    Subscribe
                  </Button>
                </form>
              )}
            </div>
          </div>

          {/* Footer Links */}
          <div className="lg:col-span-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {footerSections.map((section, index) => (
                <div key={index}>
                  <h3 className="font-semibold text-text-primary mb-6">
                    {section.title}
                  </h3>
                  <ul className="space-y-4">
                    {section.links.map((link, linkIndex) => (
                      <li key={linkIndex}>
                        <button
                          onClick={() => handleNavClick(link.href, link.section)}
                          className="text-text-secondary hover:text-text-primary transition-colors text-sm block w-full text-left group"
                        >
                          <span className="border-b border-transparent group-hover:border-primary-500/50 transition-colors">
                            {link.label}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-8 border-t border-border">
          <div className="flex space-x-6">
            {Object.entries(SOCIAL_LINKS).map(([platform, url]) => {
              const Icon = socialIcons[platform as keyof typeof socialIcons];
              if (!Icon) return null;

              return (
                <a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-lg glass hover:bg-white/10 text-text-secondary hover:text-primary-500 transition-all duration-200 hover:-translate-y-1"
                  aria-label={`Follow us on ${platform}`}
                >
                  <Icon className="w-5 h-5" />
                </a>
              );
            })}
          </div>

          {/* Scroll to Top */}
          <button
            onClick={scrollToTop}
            className="p-3 rounded-lg glass hover:bg-white/10 text-text-secondary hover:text-primary-500 transition-all duration-200 hover:-translate-y-1 group"
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-border">
        <div className="container py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Copyright */}
            <div className="text-text-secondary text-sm">
              © {new Date().getFullYear()} {COMPANY.name}. All rights reserved.
            </div>

            {/* Legal Links */}
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center text-text-secondary text-sm">
                <Shield className="w-4 h-4 mr-2" />
                <span>GDPR Compliant</span>
              </div>

              <div className="flex items-center text-text-secondary text-sm">
                <FileText className="w-4 h-4 mr-2" />
                <span>SEC Registered</span>
              </div>

              <button
                onClick={() => handleNavClick('#contact', 'contact')}
                className="flex items-center text-text-secondary hover:text-text-primary text-sm transition-colors"
              >
                <HelpCircle className="w-4 h-4 mr-2" />
                <span>Support</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative ocean bottom */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500/20 via-pastel-mint/30 to-primary-500/20" />
    </footer>
  );
};

export default Footer;