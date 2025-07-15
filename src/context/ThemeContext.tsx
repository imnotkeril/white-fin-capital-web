'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  actualTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('system');
  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const savedTheme = (localStorage.getItem('theme') as Theme) || 'system';
    setTheme(savedTheme);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    const isDarkMode = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    setActualTheme(isDarkMode ? 'dark' : 'light');

    root.classList.remove('light', 'dark');
    root.classList.add(isDarkMode ? 'dark' : 'light');

    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(actualTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, actualTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Utility functions for theme-aware values
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

// Hook for ocean animations - убрал shimmer, добавил neon glow
export function useOceanAnimations() {
  const { actualTheme } = useTheme();

  return {
    float: 'float-animation',
    pulse: 'pulse-animation',
    ripple: 'ripple-effect',
    neonGlow: 'neon-glow',
    neonGlowStrong: 'neon-glow-strong',
    glowPulse: 'animate-glow-pulse',
    wave: actualTheme === 'dark' ? 'wave-dark' : 'wave-light',
  };
}

// Hook for interactive card effects
export function useInteractiveCardClasses(): string {
  const { actualTheme } = useTheme();

  return actualTheme === 'dark'
    ? 'interactive-card bg-white/5 backdrop-blur-20 border border-white/10'
    : 'interactive-card bg-white/70 backdrop-blur-20 border border-primary-500/20';
}

// Hook for button glow effects
export function useButtonGlowClasses(variant: 'primary' | 'secondary' | 'premium' = 'primary'): string {
  const { actualTheme } = useTheme();

  switch (variant) {
    case 'primary':
      return actualTheme === 'dark'
        ? 'neon-glow hover:shadow-neon-glow'
        : 'neon-glow hover:shadow-neon-glow';

    case 'premium':
      return actualTheme === 'dark'
        ? 'neon-glow-strong hover:shadow-neon-glow-strong'
        : 'neon-glow-strong hover:shadow-neon-glow-strong';

    default:
      return 'neon-glow';
  }
}

// Hook for card hover effects
export function useCardHoverClasses(): string {
  return 'hover:translate-y-[-4px] hover:shadow-ocean-xl transition-all duration-300';
}