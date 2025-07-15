import React from 'react';
import { cn } from '@/utils/helpers';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'glass' | 'light';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  className,
  disabled,
  ...props
}) => {
  const baseStyles = cn(
    'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-300',
    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500/50',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
    'relative overflow-hidden',
    fullWidth && 'w-full'
  );

  const sizeStyles = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  // ИСПРАВЛЕНЫ ВСЕ ЦВЕТА ПОД ОКЕАНСКУЮ ТЕМУ ИЗ ТЗ
  const variantStyles = {
    primary: cn(
      // Основной темно-синий из ТЗ: #05192c
      'bg-primary-900 text-white border-2 border-primary-900',
      'hover:bg-navy-800 hover:border-navy-800 hover:shadow-lg hover:-translate-y-1',
      'hover:shadow-[0_0_20px_rgba(144,191,249,0.4)]',
      'dark:bg-primary-900 dark:border-primary-900',
      'dark:hover:bg-navy-800 dark:hover:border-navy-800'
    ),
    secondary: cn(
      // Прозрачный фон с темно-синей границей
      'bg-transparent text-primary-900 border-2 border-primary-900',
      'hover:bg-primary-900 hover:text-white hover:-translate-y-1',
      'dark:text-primary-500 dark:border-primary-500',
      'dark:hover:bg-primary-500 dark:hover:text-primary-900'
    ),
    outline: cn(
      // ИСПРАВЛЕНО: используем темно-синий из ТЗ вместо светло-голубого
      'bg-transparent text-primary-900 border-2 border-primary-900',
      'hover:bg-primary-900 hover:text-white hover:-translate-y-1',
      'dark:text-primary-500 dark:border-primary-500',
      'dark:hover:bg-primary-500 dark:hover:text-primary-900'
    ),
    ghost: cn(
      'bg-transparent text-text-secondary border-2 border-transparent',
      'hover:bg-background-secondary hover:text-text-primary hover:-translate-y-1',
      'dark:text-text-secondary dark:hover:bg-background-secondary dark:hover:text-text-primary'
    ),
    glass: cn(
      'glass-effect text-primary-900',
      'hover:bg-white/90 hover:border-primary-500/40 hover:-translate-y-1',
      'hover:shadow-md',
      'dark:glass-effect-dark dark:text-white',
      'dark:hover:bg-white/20 dark:hover:border-primary-500/50'
    ),
    light: cn(
      // Используем светло-голубой из ТЗ: #90bff9
      'bg-primary-500 text-primary-900 border-2 border-primary-500',
      'hover:bg-primary-900 hover:text-white hover:border-primary-900 hover:-translate-y-1',
      'dark:bg-primary-500 dark:text-primary-900 dark:border-primary-500',
      'dark:hover:bg-primary-400 dark:hover:text-primary-900 dark:hover:border-primary-400'
    ),
  };

  const LoadingSpinner = () => (
    <svg
      className="animate-spin -ml-1 mr-3 h-5 w-5"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  return (
    <button
      className={cn(
        baseStyles,
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <LoadingSpinner />}
      {!loading && icon && iconPosition === 'left' && (
        <span className="mr-2">{icon}</span>
      )}
      {children}
      {!loading && icon && iconPosition === 'right' && (
        <span className="ml-2">{icon}</span>
      )}
    </button>
  );
};

export default Button;