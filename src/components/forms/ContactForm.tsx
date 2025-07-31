import React, { useState } from 'react';
import { Send, User, Mail, MessageCircle, CheckCircle } from 'lucide-react';
import { ContactFormData } from '@/types';
import { CONTACT_PURPOSES } from '@/utils/constants';
import { useForm } from '@/hooks/useForm';
import { useNotifications } from '@/context/AppContext';
import { cn } from '@/utils/helpers';
import Button from '@/components/common/Button';

// Временная заглушка для contactAPI
const contactAPI = {
  sendMessage: async (data: any) => {
    console.log('Message sent:', data);
    // Симулируем отправку
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
};

const ContactForm: React.FC = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { notifySuccess, notifyError } = useNotifications();

  const { 
    values, 
    errors, 
    touched,
    isSubmitting,
    handleChange, 
    handleBlur,
    handleSubmit,
    isValid,
    reset 
  } = useForm<ContactFormData>({
    initialValues: {
      firstName: '',
      email: '',
      purpose: '',
      message: '',
    },
    validationRules: {
      firstName: {
        required: true,
        minLength: 2,
        maxLength: 50,
      },
      email: {
        required: true,
        email: true,
      },
      purpose: {
        required: true,
      },
      message: {
        required: true,
        minLength: 10,
        maxLength: 1000,
      },
    },
    onSubmit: async (data) => {
      try {
        await contactAPI.sendMessage(data);
        setIsSubmitted(true);
        notifySuccess(
          'Message Sent!',
          'Thank you for contacting us. We&apos;ll get back to you within 24 hours.'
        );
      } catch (error: any) {
        notifyError(
          'Failed to Send Message',
          error.message || 'Please try again later or contact us directly via email.'
        );
      }
    },
  });

  const handleStartNew = () => {
    setIsSubmitted(false);
    reset();
  };

  if (isSubmitted) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        
        <h3 className="text-2xl font-bold text-text-primary mb-4">
          Message Sent Successfully!
        </h3>
        
        <p className="text-text-secondary mb-8 leading-relaxed">
          Thank you for reaching out to White Fin Capital. Our team will review your message 
          and get back to you within 24 hours during business days.
        </p>
        
        <div className="space-y-4">
          <p className="text-sm text-text-tertiary">
            <strong>What happens next?</strong>
          </p>
          
          <ul className="text-sm text-text-secondary space-y-2 max-w-md mx-auto">
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
              We&apos;ll review your inquiry within 2-4 hours
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
              A team member will respond with relevant information
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
              For urgent matters, call us directly
            </li>
          </ul>
        </div>
        
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="primary"
            onClick={handleStartNew}
            icon={<MessageCircle className="w-4 h-4" />}
          >
            Send Another Message
          </Button>
          
          <Button
            variant="outline"
            onClick={() => window.open('mailto:info@whitefincapital.com', '_blank')}
            icon={<Mail className="w-4 h-4" />}
          >
            Email Directly
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* First Name */}
      <div>
        <label 
          htmlFor="firstName" 
          className="block text-sm font-medium text-text-primary mb-2"
        >
          First Name *
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <User className="h-5 w-5 text-text-tertiary" />
          </div>
          <input
            type="text"
            id="firstName"
            value={values.firstName}
            onChange={(e) => handleChange('firstName')(e.target.value)}
            onBlur={handleBlur('firstName')}
            className={cn(
              'w-full pl-10 pr-4 py-3 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all',
              errors.firstName && touched.firstName
                ? 'border-red-400 ring-2 ring-red-400'
                : 'border-border'
            )}
            placeholder="Enter your first name"
          />
        </div>
        {errors.firstName && touched.firstName && (
          <p className="mt-1 text-sm text-red-400">{errors.firstName}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label 
          htmlFor="email" 
          className="block text-sm font-medium text-text-primary mb-2"
        >
          Email Address *
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-text-tertiary" />
          </div>
          <input
            type="email"
            id="email"
            value={values.email}
            onChange={(e) => handleChange('email')(e.target.value)}
            onBlur={handleBlur('email')}
            className={cn(
              'w-full pl-10 pr-4 py-3 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all',
              errors.email && touched.email
                ? 'border-red-400 ring-2 ring-red-400'
                : 'border-border'
            )}
            placeholder="Enter your email address"
          />
        </div>
        {errors.email && touched.email && (
          <p className="mt-1 text-sm text-red-400">{errors.email}</p>
        )}
      </div>

      {/* Purpose */}
      <div>
        <label 
          htmlFor="purpose" 
          className="block text-sm font-medium text-text-primary mb-2"
        >
          Purpose of Contact *
        </label>
        <select
          id="purpose"
          value={values.purpose}
          onChange={(e) => handleChange('purpose')(e.target.value)}
          onBlur={handleBlur('purpose')}
          className={cn(
            'w-full px-4 py-3 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all appearance-none',
            errors.purpose && touched.purpose
              ? 'border-red-400 ring-2 ring-red-400'
              : 'border-border'
          )}
        >
          <option value="">Select a purpose</option>
          {CONTACT_PURPOSES.map((purpose) => (
            <option key={purpose} value={purpose}>
              {purpose}
            </option>
          ))}
        </select>
        {errors.purpose && touched.purpose && (
          <p className="mt-1 text-sm text-red-400">{errors.purpose}</p>
        )}
      </div>

      {/* Message */}
      <div>
        <label 
          htmlFor="message" 
          className="block text-sm font-medium text-text-primary mb-2"
        >
          Message *
        </label>
        <div className="relative">
          <div className="absolute top-3 left-3 pointer-events-none">
            <MessageCircle className="h-5 w-5 text-text-tertiary" />
          </div>
          <textarea
            id="message"
            rows={6}
            value={values.message}
            onChange={(e) => handleChange('message')(e.target.value)}
            onBlur={handleBlur('message')}
            className={cn(
              'w-full pl-10 pr-4 py-3 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-vertical',
              errors.message && touched.message
                ? 'border-red-400 ring-2 ring-red-400'
                : 'border-border'
            )}
            placeholder="Please provide details about your inquiry, questions, or how we can help you..."
          />
        </div>
        <div className="flex justify-between items-center mt-1">
          {errors.message && touched.message && (
            <p className="text-sm text-red-400">{errors.message}</p>
          )}
          <p className="text-xs text-text-tertiary ml-auto">
            {values.message.length}/1000 characters
          </p>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="bg-background-secondary border border-border rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <CheckCircle className="w-3 h-3 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm text-text-secondary">
              <strong className="text-text-primary">Privacy Protected:</strong> We respect your privacy 
              and will never share your information with third parties. Your data is used solely to respond 
              to your inquiry and provide relevant information about our services.
            </p>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={isSubmitting}
          disabled={!isValid || isSubmitting}
          icon={<Send className="w-5 h-5" />}
        >
          {isSubmitting ? 'Sending Message...' : 'Send Message'}
        </Button>
        
        <p className="text-center text-sm text-text-tertiary mt-3">
          Typical response time: <strong>within 24 hours</strong>
        </p>
      </div>

    </form>
  );
};

export default ContactForm;