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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Logo Column */}
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="w-28 h-28 rounded-xl overflow-hidden">
                <img
                  src={actualTheme === 'dark' ? "/logo-dark.png" : "/logo.png"}
                  alt={`${COMPANY.name} Logo`}
                  className="w-full h-full object-contain transition-opacity duration-300"
                />
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-2 text-center">
              <div className="flex items-center justify-center text-text-secondary text-sm">
                <Mail className="w-4 h-4 mr-2 text-primary-500" />
                <a
                  href={`mailto:${COMPANY.email}`}
                  className="hover:text-text-primary transition-colors"
                >
                  {COMPANY.email}
                </a>
              </div>
              <div className="flex items-center justify-center text-text-secondary text-sm">
                <MapPin className="w-4 h-4 mr-2 text-primary-500" />
                <span>
                  {COMPANY.address.city}, {COMPANY.address.state}
                </span>
              </div>
            </div>
          </div>

          {/* Footer Sections */}
          {footerSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="space-y-4">
              <h4 className="font-semibold text-text-primary">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <button
                      onClick={() => handleNavClick(link.href, 'section' in link ? link.section : undefined)}
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

        {/* Social Links */}
        <div className="flex justify-end mb-8">
          {/* Social Links & Scroll to Top */}
          <div className="flex items-center gap-4">
            <div className="flex space-x-3">
              {Object.entries(SOCIAL_LINKS).map(([platform, url]) => {
                const Icon = socialIcons[platform as keyof typeof socialIcons];
                if (!Icon) return null;

                return (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg glass hover:bg-white/10 dark:hover:bg-white/5 text-text-secondary hover:text-primary-500 transition-all duration-200 hover:-translate-y-1"
                    aria-label={`Follow us on ${platform}`}
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>

            {/* Scroll to Top */}
            <button
              onClick={scrollToTop}
              className="p-2 rounded-lg glass hover:bg-white/10 dark:hover:bg-white/5 text-text-secondary hover:text-primary-500 transition-all duration-200 hover:-translate-y-1 group"
              aria-label="Scroll to top"
            >
              <ArrowUp className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </button>
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