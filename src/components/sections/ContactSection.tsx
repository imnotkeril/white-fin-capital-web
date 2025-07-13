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
      color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    },
    {
      icon: Phone,
      title: 'Call Us',
      description: 'Speak with our team',
      value: COMPANY.phone,
      action: `tel:${COMPANY.phone}`,
      color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      description: 'Our office location',
      value: `${COMPANY.address.street}, ${COMPANY.address.city}`,
      action: `https://maps.google.com/?q=${encodeURIComponent(COMPANY.address.street + ', ' + COMPANY.address.city)}`,
      color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    },
    {
      icon: Clock,
      title: 'Business Hours',
      description: 'Monday - Friday',
      value: '9:00 AM - 6:00 PM EST',
      color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
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
    <section id="contact" className="section bg-background">
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-16">
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
            <Card className="p-8">
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
                      className={cn(
                        'p-6 transition-all duration-300',
                        method.action ? 'cursor-pointer hover-lift' : ''
                      )}
                      onClick={() => handleContactMethodClick(method.action)}
                    >
                      <div className="flex items-start gap-4">
                        <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center', method.color)}>
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
            <Card className="p-8">
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
            <Card className="p-8">
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
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary-500 hover:bg-background-secondary/50 transition-all duration-200 group"
                  >
                    <div>
                      <h4 className="font-semibold text-text-primary group-hover:text-primary-500 transition-colors">
                        {platform.name}
                      </h4>
                      <p className="text-text-secondary text-sm">
                        {platform.description}
                      </p>
                    </div>
                    <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center group-hover:bg-primary-500 group-hover:text-white transition-all duration-200">
                      <span className="text-sm font-bold">→</span>
                    </div>
                  </a>
                ))}
              </div>
            </Card>

            {/* Quick Contact CTA */}
            <Card className="p-8 bg-gradient-to-br from-primary-500 to-ocean-500 text-white">
              <h3 className="text-xl font-bold mb-4">
                Need Immediate Assistance?
              </h3>
              <p className="text-white/90 mb-6 leading-relaxed">
                Our team is available for urgent inquiries and consultation requests. 
                Don't hesitate to reach out.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => window.open(`mailto:${COMPANY.email}`, '_blank')}
                  className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
                  icon={<Mail className="w-4 h-4" />}
                >
                  Email Now
                </Button>
                
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => window.open(`tel:${COMPANY.phone}`, '_blank')}
                  className="bg-transparent border-white/50 text-white hover:bg-white/10"
                  icon={<Phone className="w-4 h-4" />}
                >
                  Call Now
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Bottom CTA Section */}
        <div className="mt-16 text-center">
          <Card className="p-12 glass">
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
                icon={<Send className="w-5 h-5" />}
              >
                Start Free Trial
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                onClick={() => window.open('https://calendly.com/whitefincapital', '_blank')}
              >
                Schedule Consultation
              </Button>
            </div>
            
            <div className="flex justify-center items-center gap-8 mt-8 text-sm text-text-tertiary">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-accent-green rounded-full"></div>
                <span>Free 14-day trial</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-accent-green rounded-full"></div>
                <span>No setup fees</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-accent-green rounded-full"></div>
                <span>Cancel anytime</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;