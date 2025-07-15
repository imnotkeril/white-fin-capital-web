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
      color: 'bg-status-positive/10 text-status-positive',
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      description: 'Our office location',
      value: `${COMPANY.address.street}, ${COMPANY.address.city}`,
      action: `https://maps.google.com/?q=${encodeURIComponent(COMPANY.address.street + ', ' + COMPANY.address.city)}`,
      color: 'bg-pastel-purple/10 text-pastel-purple',
    },
    {
      icon: Clock,
      title: 'Business Hours',
      description: 'Monday - Friday',
      value: '9:00 AM - 6:00 PM EST',
      color: 'bg-pastel-coral/10 text-pastel-coral',
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Form */}
          <div>
            <Card ocean padding="lg">
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-text-primary mb-4 flex items-center gap-3">
                  <MessageCircle className="w-6 h-6 text-primary-500" />
                  Send Us a Message
                </h3>
                <p className="text-text-secondary">
                  Fill out the form below and we'll get back to you within 24 hours.
                </p>
              </div>

              <ContactForm />
            </Card>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            {/* Contact Methods */}
            <div>
              <h3 className="text-2xl font-bold text-text-primary mb-6">
                Contact Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {contactMethods.map((method, index) => {
                  const IconComponent = method.icon;
                  return (
                    <Card
                      key={index}
                      ocean
                      interactive={!!method.action}
                      className={cn(
                        'p-6',
                        method.action ? 'cursor-pointer' : ''
                      )}
                      onClick={() => handleContactMethodClick(method.action)}
                    >
                      <div className="flex items-start gap-4">
                        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', method.color)}>
                          <IconComponent className="w-6 h-6" />
                        </div>

                        <div className="flex-1">
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
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Office Locations */}
            <Card ocean padding="lg">
              <h3 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-3">
                <Building className="w-6 h-6 text-primary-500" />
                Office Locations
              </h3>

              <div className="space-y-6">
                {/* Headquarters */}
                <div>
                  <h4 className="font-semibold text-text-primary mb-2">
                    Headquarters - New York
                  </h4>
                  <p className="text-text-secondary text-sm leading-relaxed">
                    {COMPANY.address.street}<br />
                    {COMPANY.address.city}, {COMPANY.address.state} {COMPANY.address.zip}<br />
                    {COMPANY.address.country}
                  </p>
                </div>

                {/* European Office */}
                <div>
                  <h4 className="font-semibold text-text-primary mb-2">
                    European Office - London
                  </h4>
                  <p className="text-text-secondary text-sm leading-relaxed">
                    45 Canary Wharf<br />
                    London E14 5AB<br />
                    United Kingdom
                  </p>
                </div>
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

            {/* Quick Contact CTA - ИСПРАВЛЕН ГРАДИЕНТ */}
            <Card className="p-8 glass border-primary-500/20">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-900 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Send className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-xl font-bold text-text-primary mb-4">
                  Need Immediate Assistance?
                </h3>
                <p className="text-text-secondary mb-6 leading-relaxed">
                  Our team is available for urgent inquiries and consultation requests.
                  Don't hesitate to reach out.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => window.open(`mailto:${COMPANY.email}`, '_blank')}
                    icon={<Mail className="w-4 h-4" />}
                  >
                    Email Now
                  </Button>

                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => window.open(`tel:${COMPANY.phone}`, '_blank')}
                    icon={<Phone className="w-4 h-4" />}
                  >
                    Call Now
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Bottom CTA Section */}
        <div className="mt-16 text-center">
          <Card ocean padding="lg">
            <h3 className="text-3xl font-bold text-text-primary mb-4">
              Ready to Get Started?
            </h3>
            <p className="text-lg text-text-secondary mb-8 max-w-2xl mx-auto">
              Join thousands of investors who trust White Fin Capital for professional
              market analysis and investment guidance.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="primary"
                size="lg"
                onClick={() => window.location.href = '#pricing'}
              >
                View Pricing Plans
              </Button>

              <Button
                variant="secondary"
                size="lg"
                onClick={() => window.location.href = '#performance'}
              >
                See Our Track Record
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;