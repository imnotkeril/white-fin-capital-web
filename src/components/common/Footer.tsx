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
        section: item.section,
      })),
    },
    {
      title: 'Services',
      links: [
        { label: 'Market Research', href: '#services' },
        { label: 'Trade Alerts', href: '#services' },
        { label: 'Portfolio Analytics', href: '#services' },
        { label: 'Education', href: '#services' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About Us', href: '#team' },
        { label: 'Our Team', href: '#team' },
        { label: 'Careers', href: '/careers' },
        { label: 'Press Kit', href: '/press' },
        { label: 'Contact', href: '#contact' },
      ],
    },
    {
      title: 'Support',
      links: [
        { label: 'Help Center', href: '/help' },
        { label: 'API Documentation', href: '/api-docs' },
        { label: 'System Status', href: '/status' },
        { label: 'Security', href: '/security' },
      ],
    },
  ];

  const socialIcons = {
    linkedin: Linkedin,
    twitter: Twitter,
    youtube: Youtube,
    instagram: Instagram,
  };

  const legalLinks = [
    { label: 'Privacy Policy', href: '/privacy', icon: Shield },
    { label: 'Terms of Service', href: '/terms', icon: FileText },
    { label: 'Cookie Policy', href: '/cookies', icon: HelpCircle },
    { label: 'Disclaimer', href: '/disclaimer', icon: Shield },
  ];

  return (
    <footer className="bg-background-secondary border-t border-border">
      {/* Main Footer Content */}
      <div className="container py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Company Info & Newsletter */}
          <div className="lg:col-span-4">
            {/* Logo and Description */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={theme === 'dark' ? '/images/logo-dark.png' : '/images/logo.png'}
                  alt={COMPANY.name}
                  className="h-8 w-auto"
                />
                <span className="font-bold text-xl text-text-primary">
                  {COMPANY.name}
                </span>
              </div>
              
              <p className="text-text-secondary leading-relaxed mb-6">
                {COMPANY.description}
              </p>

              {/* Contact Info */}
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3 text-text-secondary">
                  <Mail className="w-4 h-4 text-primary-500" />
                  <a 
                    href={`mailto:${COMPANY.email}`}
                    className="hover:text-primary-500 transition-colors"
                  >
                    {COMPANY.email}
                  </a>
                </div>
                
                <div className="flex items-center gap-3 text-text-secondary">
                  <Phone className="w-4 h-4 text-primary-500" />
                  <a 
                    href={`tel:${COMPANY.phone}`}
                    className="hover:text-primary-500 transition-colors"
                  >
                    {COMPANY.phone}
                  </a>
                </div>
                
                <div className="flex items-center gap-3 text-text-secondary">
                  <MapPin className="w-4 h-4 text-primary-500" />
                  <span>
                    {COMPANY.address.city}, {COMPANY.address.state}
                  </span>
                </div>
              </div>
            </div>

            {/* Newsletter Signup */}
            <div className="bg-background border border-border rounded-xl p-6">
              <h3 className="font-semibold text-text-primary mb-3">
                Stay Updated
              </h3>
              <p className="text-text-secondary text-sm mb-4">
                Get the latest market insights and updates delivered to your inbox.
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={values.email}
                    onChange={(e) => handleChange('email')(e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg bg-background-secondary border border-border text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                      errors.email ? 'ring-2 ring-red-400' : ''
                    }`}
                  />
                  {errors.email && (
                    <p className="text-red-400 text-xs mt-1">{errors.email}</p>
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
            </div>
          </div>

          {/* Footer Links */}
          <div className="lg:col-span-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {footerSections.map((section, index) => (
                <div key={index}>
                  <h3 className="font-semibold text-text-primary mb-4">
                    {section.title}
                  </h3>
                  <ul className="space-y-3">
                    {section.links.map((link, linkIndex) => (
                      <li key={linkIndex}>
                        <button
                          onClick={() => handleNavClick(link.href, link.section)}
                          className="text-text-secondary hover:text-primary-500 transition-colors text-sm"
                        >
                          {link.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
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
            <div className="flex flex-wrap justify-center gap-6">
              {legalLinks.map((link, index) => {
                const IconComponent = link.icon;
                return (
                  <a
                    key={index}
                    href={link.href}
                    className="flex items-center gap-2 text-text-secondary hover:text-primary-500 transition-colors text-sm"
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{link.label}</span>
                  </a>
                );
              })}
            </div>

            {/* Social Media Links */}
            <div className="flex items-center gap-4">
              {Object.entries(SOCIAL_LINKS).map(([platform, url]) => {
                const IconComponent = socialIcons[platform as keyof typeof socialIcons];
                if (!IconComponent) return null;
                
                return (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-background-secondary hover:bg-primary-500 border border-border hover:border-primary-500 rounded-lg flex items-center justify-center text-text-secondary hover:text-white transition-all duration-200 hover:scale-110"
                    aria-label={`Follow us on ${platform}`}
                  >
                    <IconComponent className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-8 pt-8 border-t border-border text-center">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-text-tertiary">
              <div>
                <p className="font-medium text-text-secondary mb-1">Risk Disclosure</p>
                <p>
                  Trading involves substantial risk of loss and may not be suitable for all investors.
                </p>
              </div>
              
              <div>
                <p className="font-medium text-text-secondary mb-1">Regulatory</p>
                <p>
                  White Fin Capital is a registered investment advisor. SEC registration does not imply endorsement.
                </p>
              </div>
              
              <div>
                <p className="font-medium text-text-secondary mb-1">Performance</p>
                <p>
                  Past performance is not indicative of future results. Individual results may vary.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 w-12 h-12 bg-primary-500 hover:bg-primary-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 z-50"
        aria-label="Scroll to top"
      >
        <ArrowUp className="w-6 h-6 mx-auto" />
      </button>
    </footer>
  );
};

export default Footer;