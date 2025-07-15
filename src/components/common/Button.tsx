import React from 'react';
import { cn } from '@/utils/helpers';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'glass';
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
    'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500/50',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
    fullWidth && 'w-full'
  );

  const sizeStyles = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg',
  };

  const variantStyles = {
    primary: cn(
      'bg-primary-500 text-white border border-primary-500',
      'hover:bg-primary-600 hover:border-primary-600 hover:shadow-lg hover:-translate-y-0.5',
      'dark:bg-primary-500 dark:text-white dark:border-primary-500',
      'dark:hover:bg-primary-400 dark:hover:border-primary-400'
    ),
    secondary: cn(
      'bg-background-secondary text-text-primary border border-border',
      'hover:bg-background-tertiary hover:border-primary-500/50 hover:-translate-y-0.5',
      'dark:bg-background-secondary dark:text-text-primary dark:border-border',
      'dark:hover:bg-background-tertiary dark:hover:border-primary-500/50'
    ),
    outline: cn(
      'bg-transparent text-primary-500 border border-primary-500',
      'hover:bg-primary-500 hover:text-white hover:-translate-y-0.5',
      'dark:text-primary-400 dark:border-primary-400',
      'dark:hover:bg-primary-400 dark:hover:text-white'
    ),
    ghost: cn(
      'bg-transparent text-text-secondary border border-transparent',
      'hover:bg-background-secondary hover:text-text-primary',
      'dark:text-text-secondary dark:hover:bg-background-secondary dark:hover:text-text-primary'
    ),
    glass: cn(
      'bg-white/70 backdrop-blur-sm text-text-primary border border-white/20',
      'hover:bg-white/90 hover:border-primary-500/30 hover:-translate-y-0.5',
      'dark:bg-white/10 dark:text-white dark:border-white/20',
      'dark:hover:bg-white/20 dark:hover:border-primary-500/50'
    ),
  };

  const LoadingSpinner = () => (
    <svg
      className="animate-spin -ml-1 mr-2 h-4 w-4"
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
        d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  return (
    <button
      className={cn(
        baseStyles,
        sizeStyles[size],
        variantStyles[variant],
        loading && 'pointer-events-none',
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