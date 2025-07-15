import React from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageCircle,
  Users,
  Building,
} from 'lucide-react';
import { COMPANY, CONTACT_PURPOSES, SOCIAL_LINKS } from '@/utils/constants';
import { cn } from '@/utils/helpers';
import Card from '@/components/common/Card';
import ContactForm from '@/components/forms/ContactForm';
import Button from '@/components/common/Button';

const ContactSection: React.FC = () => {
  const contactMethods = [
    {
      icon: Mail,
      title: 'Email Us',
      description: 'Get in touch via email',
      value: COMPANY.email,
      action: `mailto:${COMPANY.email}`,
      color: 'bg-primary-500/10 text-primary-500',
    },
    {
      icon: Phone,
      title: 'Call Us',
      description: 'Speak with our team',
      value: COMPANY.phone,
      action: `tel:${COMPANY.phone}`,
      color: 'bg-primary-500/20 text-primary-500',
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      description: 'Our office location',
      value: `${COMPANY.address.street}, ${COMPANY.address.city}`,
      action: `https://maps.google.com/?q=${encodeURIComponent(COMPANY.address.street + ', ' + COMPANY.address.city)}`,
      color: 'bg-dark-blue/10 text-dark-blue dark:bg-light-blue/20 dark:text-light-blue',
    },
    {
      icon: Clock,
      title: 'Business Hours',
      description: 'Monday - Friday',
      value: '9:00 AM - 6:00 PM EST',
      color: 'bg-light-blue/20 text-dark-blue dark:bg-primary-500/20 dark:text-white',
    },
  ];

  const socialPlatforms = [
    {
      name: 'LinkedIn',
      url: SOCIAL_LINKS.linkedin,
      description: 'Professional updates and insights',
    },
    {
      name: 'Twitter',
      url: SOCIAL_LINKS.twitter,
      description: 'Daily market commentary',
    },
    {
      name: 'Telegram',
      url: SOCIAL_LINKS.telegram,
      description: 'Real-time alerts and discussions',
    },
  ];

  const handleContactMethodClick = (action?: string) => {
    if (action) {
      window.open(action, '_blank');
    }
  };

  return (
    <section id="contact" className="section-padding bg-background">
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 glass rounded-full px-6 py-3 mb-6">
            <MessageCircle className="w-5 h-5 text-primary-500" />
            <span className="text-text-primary font-medium">Contact Us</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-6">
            Get In Touch
          </h2>
          <p className="text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
            Ready to elevate your investment strategy? We're here to help.
            Reach out for consultations, questions, or partnership opportunities.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Contact Form */}
          <Card ocean padding="lg" className="h-fit">
            <h3 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-3">
              <Send className="w-6 h-6 text-primary-500" />
              Send us a Message
            </h3>
            <ContactForm />
          </Card>

          {/* Contact Information */}
          <div className="space-y-8">
            {/* Contact Methods */}
            <Card ocean padding="lg">
              <h3 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-3">
                <MessageCircle className="w-6 h-6 text-primary-500" />
                Contact Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {contactMethods.map((method, index) => {
                  const IconComponent = method.icon;
                  return (
                    <div
                      key={index}
                      onClick={() => handleContactMethodClick(method.action)}
                      className={cn(
                        'p-4 rounded-lg transition-all duration-200 group',
                        method.action ? 'cursor-pointer hover:scale-105' : '',
                        'glass hover:bg-white/5'
                      )}
                    >
                      <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center mb-3', method.color)}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <h4 className="font-semibold text-text-primary mb-1">
                        {method.title}
                      </h4>
                      <p className="text-text-secondary text-sm mb-2">
                        {method.description}
                      </p>
                      <p className="text-text-primary font-medium text-sm">
                        {method.value}
                      </p>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Social Media */}
            <Card ocean padding="lg">
              <h3 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-3">
                <Users className="w-6 h-6 text-primary-500" />
                Follow Us
              </h3>

              <div className="space-y-4">
                {socialPlatforms.map((platform, index) => (
                  <a
                    key={index}
                    href={platform.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 rounded-lg glass hover:bg-white/5 transition-all duration-200 group"
                  >
                    <div>
                      <h4 className="font-semibold text-text-primary group-hover:text-primary-500 transition-colors">
                        {platform.name}
                      </h4>
                      <p className="text-text-secondary text-sm">
                        {platform.description}
                      </p>
                    </div>
                    <div className="w-8 h-8 bg-primary-500/10 rounded-full flex items-center justify-center group-hover:bg-primary-500 group-hover:text-white transition-all duration-200">
                      <span className="text-sm font-bold">→</span>
                    </div>
                  </a>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* FAQ or Additional Info Section */}
        <Card ocean padding="lg" className="text-center">
          <h3 className="text-2xl font-bold text-text-primary mb-6">
            Ready to Start Your Investment Journey?
          </h3>
          <p className="text-text-secondary mb-8 max-w-2xl mx-auto">
            Join thousands of investors who trust White Fin Capital for professional market
            analysis and investment guidance. Let's discuss how we can help achieve your financial goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="primary"
              size="lg"
              onClick={() => document.querySelector('#pricing')?.scrollIntoView({ behavior: 'smooth' })}
            >
              View Pricing Plans
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => document.querySelector('.contact-form')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Schedule Consultation
            </Button>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default ContactSection;