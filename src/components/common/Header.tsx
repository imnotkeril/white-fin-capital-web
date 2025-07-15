import React, { useState, useEffect } from 'react';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { NAVIGATION_ITEMS, COMPANY } from '@/utils/constants';
import { useTheme } from '@/context/ThemeContext';
import { cn, scrollToElement } from '@/utils/helpers';
import Button from './Button';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme, toggleTheme } = useTheme();

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

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'nav-bg shadow-lg'
          : 'bg-transparent'
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button
              onClick={() => handleNavClick('#home', 'hero')}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity group"
            >
              {/* Logo Image */}
              <div className="w-10 h-10 rounded-lg overflow-hidden">
                <img
                  src="/logo.png"
                  alt={`${COMPANY.name} Logo`}
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="flex flex-col">
                <span className="font-bold text-lg text-text-primary leading-none">
                  {COMPANY.name}
                </span>
                <span className="text-xs text-text-secondary leading-none opacity-75">
                  Financial Research
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {NAVIGATION_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.href, item.section)}
                className="text-text-secondary hover:text-text-primary transition-colors duration-200 font-medium relative group"
              >
                {item.label}

                {/* Подчеркивание при hover */}
                <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-primary-500 transition-all duration-300 group-hover:w-full" />
              </button>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-background-secondary transition-colors duration-200 text-text-secondary hover:text-text-primary"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            {/* Login Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleNavClick('#contact', 'contact')}
              className="text-text-secondary hover:text-text-primary"
            >
              Log In
            </Button>

            {/* Subscribe Button */}
            <Button
              variant="primary"
              size="sm"
              onClick={handleSubscribeClick}
              className="shadow-md hover:shadow-lg"
            >
              Subscribe
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Mobile Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-background-secondary transition-colors duration-200 text-text-secondary hover:text-text-primary"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            {/* Hamburger Menu */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg hover:bg-background-secondary transition-colors duration-200 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
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
          {/* Mobile Nav Background */}
          <div className="glass rounded-xl mt-4 p-6">
            <nav className="flex flex-col space-y-4">
              {NAVIGATION_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.href, item.section)}
                  className="text-left text-text-secondary hover:text-text-primary transition-colors duration-200 py-3 font-medium border-b border-border/50 last:border-0 group"
                >
                  <span className="flex items-center justify-between">
                    {item.label}
                    <span className="text-primary-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      →
                    </span>
                  </span>
                </button>
              ))}
            </nav>

            {/* Mobile Action Buttons */}
            <div className="flex flex-col space-y-3 pt-6 border-t border-border/50">
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
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[-1] md:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </header>
  );
};

export default Header;