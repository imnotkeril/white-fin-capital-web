import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/utils/helpers';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'button' | 'switch';
  showLabel?: boolean;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
  size = 'md',
  variant = 'button',
  showLabel = false,
}) => {
  const { theme, toggleTheme } = useTheme();

  const sizeClasses = {
    sm: {
      button: 'p-1.5',
      icon: 'w-4 h-4',
      switch: 'w-10 h-5',
      thumb: 'w-4 h-4',
    },
    md: {
      button: 'p-2',
      icon: 'w-5 h-5',
      switch: 'w-12 h-6',
      thumb: 'w-5 h-5',
    },
    lg: {
      button: 'p-3',
      icon: 'w-6 h-6',
      switch: 'w-14 h-7',
      thumb: 'w-6 h-6',
    },
  };

  const sizes = sizeClasses[size];

  if (variant === 'switch') {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        {showLabel && (
          <span className="text-sm font-medium text-text-secondary">
            {theme === 'dark' ? 'Dark' : 'Light'} Mode
          </span>
        )}
        
        <button
          onClick={toggleTheme}
          className={cn(
            `relative inline-flex ${sizes.switch} rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`,
            theme === 'dark'
              ? 'bg-primary-600'
              : 'bg-gray-200'
          )}
          role="switch"
          aria-checked={theme === 'dark'}
          aria-label="Toggle theme"
        >
          <span
            className={cn(
              `inline-block ${sizes.thumb} rounded-full bg-white shadow-lg transform transition-transform duration-200 ease-in-out flex items-center justify-center`,
              theme === 'dark'
                ? `translate-x-${size === 'sm' ? '5' : size === 'md' ? '6' : '7'}`
                : 'translate-x-0.5'
            )}
          >
            {theme === 'dark' ? (
              <Moon className={cn(sizes.icon, 'text-primary-600')} />
            ) : (
              <Sun className={cn(sizes.icon, 'text-yellow-500')} />
            )}
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {showLabel && (
        <span className="text-sm font-medium text-text-secondary">
          {theme === 'dark' ? 'Dark' : 'Light'} Mode
        </span>
      )}
      
      <button
        onClick={toggleTheme}
        className={cn(
          `${sizes.button} rounded-lg bg-background-secondary hover:bg-background-tertiary border border-border transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 hover:scale-105 active:scale-95`,
          className
        )}
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        <div className="relative">
          {/* Sun icon */}
          <Sun
            className={cn(
              sizes.icon,
              'absolute inset-0 transition-all duration-300 text-yellow-500',
              theme === 'dark'
                ? 'rotate-90 scale-0 opacity-0'
                : 'rotate-0 scale-100 opacity-100'
            )}
          />
          
          {/* Moon icon */}
          <Moon
            className={cn(
              sizes.icon,
              'transition-all duration-300 text-blue-400',
              theme === 'dark'
                ? 'rotate-0 scale-100 opacity-100'
                : '-rotate-90 scale-0 opacity-0'
            )}
          />
        </div>
      </button>
    </div>
  );
};

export default ThemeToggle;