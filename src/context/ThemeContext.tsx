import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type Theme = 'light' | 'dark' | 'auto';

interface ThemeContextType {
  theme: Theme;
  actualTheme: 'light' | 'dark'; // Реальная тема (без auto)
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  isLoaded: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = 'light',
  storageKey = 'white-fin-theme'
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light');
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem(storageKey) as Theme;
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

    if (savedTheme && ['light', 'dark', 'auto'].includes(savedTheme)) {
      setTheme(savedTheme);

      if (savedTheme === 'auto') {
        setActualTheme(systemTheme);
      } else {
        setActualTheme(savedTheme);
      }
    } else {
      setTheme(defaultTheme);
      setActualTheme(defaultTheme === 'auto' ? systemTheme : defaultTheme);
    }

    setIsLoaded(true);
  }, [defaultTheme, storageKey]);

  // Apply theme to document
  useEffect(() => {
    if (!isLoaded) return;

    const root = document.documentElement;

    // Remove all theme classes
    root.classList.remove('light', 'dark', 'theme-light', 'theme-dark');

    // Apply new theme
    root.classList.add(actualTheme, `theme-${actualTheme}`);

    // Set data attribute for CSS selectors
    root.setAttribute('data-theme', actualTheme);

    // Apply ocean-specific body classes
    document.body.classList.remove('bg-background', 'text-text-primary');
    document.body.classList.add('bg-background', 'text-text-primary');

    // Save to localStorage
    localStorage.setItem(storageKey, theme);
  }, [theme, actualTheme, isLoaded, storageKey]);

  // Listen for system theme changes when in auto mode
  useEffect(() => {
    if (theme !== 'auto') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      setActualTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
      setActualTheme('dark');
    } else if (theme === 'dark') {
      setTheme('light');
      setActualTheme('light');
    } else {
      // If auto, toggle to opposite of current actual theme
      const newTheme = actualTheme === 'light' ? 'dark' : 'light';
      setTheme(newTheme);
      setActualTheme(newTheme);
    }
  };

  const setThemeValue = (newTheme: Theme) => {
    setTheme(newTheme);

    if (newTheme === 'auto') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      setActualTheme(systemTheme);
    } else {
      setActualTheme(newTheme);
    }
  };

  const value: ThemeContextType = {
    theme,
    actualTheme,
    toggleTheme,
    setTheme: setThemeValue,
    isLoaded,
  };

  // Prevent flash of unstyled content
  if (!isLoaded) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-primary-900 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-pastel-mint rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">🌊</span>
          </div>
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
}

// Custom hook for theme-specific values
export function useThemeValue<T>(lightValue: T, darkValue: T): T {
  const { actualTheme } = useTheme();
  return actualTheme === 'dark' ? darkValue : lightValue;
}

// Custom hook for theme-aware CSS classes
export function useThemeClasses(baseClasses: string, darkClasses?: string): string {
  const { actualTheme } = useTheme();

  if (!darkClasses) return baseClasses;

  return actualTheme === 'dark'
    ? `${baseClasses} ${darkClasses}`
    : baseClasses;
}

// Hook for ocean-themed gradients
export function useOceanGradient(): string {
  const { actualTheme } = useTheme();

  return actualTheme === 'dark'
    ? 'bg-gradient-to-br from-primary-900 via-navy-800 to-primary-900'
    : 'bg-gradient-to-br from-white via-pastel-pearl to-slate-100';
}

// Hook for glass effects
export function useGlassEffect(): string {
  const { actualTheme } = useTheme();

  return actualTheme === 'dark'
    ? 'bg-white/5 backdrop-blur-20 border border-white/10'
    : 'bg-white/70 backdrop-blur-20 border border-primary-500/20';
}

// Hook for ocean ripple colors
export function useRippleColor(): string {
  const { actualTheme } = useTheme();

  return actualTheme === 'dark'
    ? 'rgba(144, 191, 249, 0.3)'
    : 'rgba(144, 191, 249, 0.2)';
}

// Hook for status colors
export function useStatusColors() {
  return {
    positive: 'var(--color-status-positive)',
    negative: 'var(--color-status-negative)',
    neutral: 'var(--color-status-neutral)',
    coral: 'var(--color-pastel-coral)',
    mint: 'var(--color-pastel-mint)',
    pearl: 'var(--color-pastel-pearl)',
  };
}

// Hook for ocean animations
export function useOceanAnimations() {
  const { actualTheme } = useTheme();

  return {
    float: 'float-animation',
    pulse: 'pulse-animation',
    shimmer: 'shimmer',
    ripple: 'ripple-effect',
    wave: actualTheme === 'dark' ? 'wave-dark' : 'wave-light',
  };
}