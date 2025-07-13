import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { NAVIGATION_ITEMS, COMPANY } from '@/utils/constants';
import { useTheme } from '@/context/ThemeContext';
import { cn, scrollToElement } from '@/utils/helpers';
import Button from './Button';
import ThemeToggle from './ThemeToggle';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme } = useTheme();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle navigation click
  const handleNavClick = (href: string, section?: string) => {
    setIsMenuOpen(false);
    
    if (section) {
      scrollToElement(`#${section}`);
    } else {
      scrollToElement(href);
    }
  };

  // Handle subscribe click
  const handleSubscribeClick = () => {
    scrollToElement('#pricing');
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-nav-bg backdrop-blur-md border-b border-nav-border shadow-lg'
          : 'bg-transparent'
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button
              onClick={() => handleNavClick('#home', 'hero')}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <img
                src={theme === 'dark' ? '/images/logo-dark.png' : '/images/logo.png'}
                alt={COMPANY.name}
                className="h-8 w-auto"
              />
              <span className="font-bold text-xl text-text-primary">
                {COMPANY.name}
              </span>
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {NAVIGATION_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.href, item.section)}
                className={cn(
                  'text-text-secondary hover:text-text-primary transition-colors duration-200 font-medium',
                  'relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary-500',
                  'after:transition-all after:duration-300 hover:after:w-full'
                )}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle size="sm" />
            
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleNavClick('#contact', 'contact')}
            >
              Log In
            </Button>
            
            <Button
              variant="primary"
              size="sm"
              onClick={handleSubscribeClick}
            >
              Subscribe
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle size="sm" />
            
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg hover:bg-background-secondary transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 text-text-primary" />
              ) : (
                <Menu className="w-6 h-6 text-text-primary" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          className={cn(
            'md:hidden overflow-hidden transition-all duration-300 ease-in-out',
            isMenuOpen
              ? 'max-h-screen opacity-100 pb-6'
              : 'max-h-0 opacity-0 pb-0'
          )}
        >
          <nav className="flex flex-col space-y-4 pt-4 border-t border-border">
            {NAVIGATION_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.href, item.section)}
                className="text-left text-text-secondary hover:text-text-primary transition-colors duration-200 py-2 font-medium"
              >
                {item.label}
              </button>
            ))}
            
            <div className="flex flex-col space-y-3 pt-4 border-t border-border">
              <Button
                variant="secondary"
                size="md"
                fullWidth
                onClick={() => handleNavClick('#contact', 'contact')}
              >
                Log In
              </Button>
              
              <Button
                variant="primary"
                size="md"
                fullWidth
                onClick={handleSubscribeClick}
              >
                Subscribe
              </Button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;