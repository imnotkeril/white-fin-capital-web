import React, { useEffect } from 'react';
import { ThemeProvider } from '@/context/ThemeContext';
import { AppProvider } from '@/context/AppContext';
import { cn } from '@/utils/helpers';

// Components
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import HeroSection from '@/components/sections/HeroSection';
import PerformanceSection from '@/components/sections/PerformanceSection';
import ServicesSection from '@/components/sections/ServicesSection';
import TeamSection from '@/components/sections/TeamSection';
import SubscriptionSection from '@/components/sections/SubscriptionSection';
import ContactSection from '@/components/sections/ContactSection';

const App: React.FC = () => {
  useEffect(() => {
    // Client-side only initialization to avoid SSR issues
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('white-fin-theme') || 'dark';
      document.documentElement.classList.add(savedTheme, `theme-${savedTheme}`);
    }

    // Add any initial setup here
    console.log('White Fin Capital - Web Application Initialized');
  }, []);

  return (
    <ThemeProvider defaultTheme="dark">
      <AppProvider>
        <div className="min-h-screen bg-background text-text-primary">
          {/* Header */}
          <Header />

          {/* Main Content */}
          <main className="relative">
            {/* Hero Section */}
            <HeroSection />

            {/* Performance Section */}
            <PerformanceSection />

            {/* Services Section */}
            <ServicesSection />

            {/* Team Section */}
            <TeamSection />

            {/* Subscription Section */}
            <SubscriptionSection />

            {/* Contact Section */}
            <ContactSection />
          </main>

          {/* Footer */}
          <Footer />

          {/* Toast Notifications Container (if using a toast library) */}
          <div id="toast-container" className="fixed top-4 right-4 z-50 space-y-2" />
        </div>
      </AppProvider>
    </ThemeProvider>
  );
};

export default App;