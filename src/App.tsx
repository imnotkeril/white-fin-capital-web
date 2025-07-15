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
      // Initialize ocean theme
      const savedTheme = localStorage.getItem('white-fin-theme') || 'light';
      document.documentElement.classList.add(savedTheme, `theme-${savedTheme}`);

      // Add ocean-specific classes to body
      document.body.classList.add('ocean-theme');

      // Set up smooth scrolling
      document.documentElement.style.scrollBehavior = 'smooth';
    }

    // Add any initial setup here
    console.log('🌊 White Fin Capital - Ocean Theme Initialized');
  }, []);

  return (
    <ThemeProvider defaultTheme="light" storageKey="white-fin-theme">
      <AppProvider>
        <div className="min-h-screen bg-background text-text-primary ocean-theme">
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

          {/* Toast Notifications Container */}
          <div id="toast-container" className="fixed top-4 right-4 z-50 space-y-2" />

          {/* Ocean Decorative Elements */}
          <div className="fixed bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500/20 via-pastel-mint/30 to-primary-500/20 pointer-events-none" />
        </div>
      </AppProvider>
    </ThemeProvider>
  );
};

export default App;