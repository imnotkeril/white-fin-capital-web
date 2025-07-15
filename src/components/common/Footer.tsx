// src/components/common/Footer.tsx
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
  const { actualTheme } = useTheme();

  const { values, errors, handleChange, handleSubmit, isValid, reset } = useForm<NewsletterFormData>({
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
        reset();
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
    <footer className="bg-background border-t border-border py-16">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-12">
          {/* Company Info */}
          <div className="lg:col-span-4 space-y-8">
            {/* Logo & Company Info */}
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 rounded-xl overflow-hidden">
                  <img
                    src={actualTheme === 'dark' ? "/logo-dark.png" : "/logo.png"}
                    alt={`${COMPANY.name} Logo`}
                    className="w-full h-full object-contain transition-opacity duration-300"
                  />
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
              <div className="space-y-4">
                <div className="flex items-center text-text-secondary">
                  <Mail className="w-5 h-5 mr-3 text-primary-500" />
                  <a
                    href={`mailto:${COMPANY.email}`}
                    className="hover:text-text-primary transition-colors"
                  >
                    {COMPANY.email}
                  </a>
                </div>

                <div className="flex items-center text-text-secondary">
                  <Phone className="w-5 h-5 mr-3 text-primary-500" />
                  <a
                    href={`tel:${COMPANY.phone}`}
                    className="hover:text-text-primary transition-colors"
                  >
                    {COMPANY.phone}
                  </a>
                </div>

                <div className="flex items-start text-text-secondary">
                  <MapPin className="w-5 h-5 mr-3 mt-0.5 text-primary-500 flex-shrink-0" />
                  <span>
                    {COMPANY.address.street}<br />
                    {COMPANY.address.city}, {COMPANY.address.state} {COMPANY.address.zip}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          <div className="lg:col-span-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {footerSections.map((section, sectionIndex) => (
                <div key={sectionIndex}>
                  <h4 className="font-semibold text-text-primary mb-4">
                    {section.title}
                  </h4>
                  <ul className="space-y-3">
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

            {/* Social Links & Scroll to Top */}
            <div className="flex items-center justify-end gap-4 pt-8">
              <div className="flex space-x-4">
                {Object.entries(SOCIAL_LINKS).map(([platform, url]) => {
                  const Icon = socialIcons[platform as keyof typeof socialIcons];
                  if (!Icon) return null;

                  return (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-lg glass hover:bg-white/10 dark:hover:bg-white/5 text-text-secondary hover:text-primary-500 transition-all duration-200 hover:-translate-y-1"
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
                className="p-3 rounded-lg glass hover:bg-white/10 dark:hover:bg-white/5 text-text-secondary hover:text-primary-500 transition-all duration-200 hover:-translate-y-1 group"
                aria-label="Scroll to top"
              >
                <ArrowUp className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Footer (Копирайт и Legal Links) */}
        <div className="pt-8 border-t border-border">
          <div className="flex flex-col items-center justify-center gap-6">
            {/* Copyright */}
            <div className="text-text-secondary text-sm text-center">
              © {new Date().getFullYear()} {COMPANY.name}. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;