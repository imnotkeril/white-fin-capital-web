import React from 'react';
import { ButtonProps } from '@/types';
import { cn } from '@/utils/helpers';

interface ExtendedButtonProps extends ButtonProps {
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  href?: string;
  target?: string;
  as?: 'button' | 'a';
  ripple?: boolean;
}

const Button: React.FC<ExtendedButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  children,
  onClick,
  type = 'button',
  className = '',
  href,
  target,
  as = 'button',
  ripple = true,
  ...props
}) => {
  const baseClasses = `
    inline-flex items-center justify-center font-medium rounded-lg
    transition-all duration-300 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    active:scale-95 relative overflow-hidden
    ${ripple ? 'ripple-effect' : ''}
  `;

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm gap-1.5 min-h-[32px]',
    md: 'px-4 py-2 text-base gap-2 min-h-[40px]',
    lg: 'px-6 py-3 text-lg gap-2.5 min-h-[48px]',
  };

  const variantClasses = {
    primary: `
      bg-primary-900 text-white border-2 border-primary-900
      hover:bg-navy-800 hover:border-navy-800 hover:shadow-lg hover:scale-105
      focus:ring-primary-500 focus:ring-opacity-50
      active:bg-navy-700
      hover:-translate-y-0.5
    `,
    secondary: `
      bg-transparent text-primary-900 border-2 border-primary-900
      hover:bg-primary-900 hover:text-white hover:shadow-md
      dark:text-primary-500 dark:border-primary-500
      dark:hover:bg-primary-500 dark:hover:text-primary-900
      focus:ring-primary-500 focus:ring-opacity-50
      hover:-translate-y-0.5
    `,
    outline: `
      bg-transparent text-text-primary border-2 border-border
      hover:bg-background-secondary hover:border-border-secondary
      focus:ring-primary-500 focus:ring-opacity-50
      hover:-translate-y-0.5
    `,
    ghost: `
      bg-transparent text-text-primary border-2 border-transparent
      hover:bg-background-secondary
      focus:ring-primary-500 focus:ring-opacity-50
      hover:-translate-y-0.5
    `,
    glass: `
      glass text-primary-900 border-2 border-transparent
      hover:bg-white/90 hover:shadow-md
      dark:text-white dark:hover:bg-primary-900/20
      focus:ring-primary-500 focus:ring-opacity-50
      hover:-translate-y-0.5
    `,
    coral: `
      bg-pastel-coral text-white border-2 border-pastel-coral
      hover:bg-accent-coral hover:shadow-md
      focus:ring-accent-coral focus:ring-opacity-50
      hover:-translate-y-0.5
    `,
    mint: `
      bg-pastel-mint text-primary-900 border-2 border-pastel-mint
      hover:bg-accent-mint hover:shadow-md
      focus:ring-accent-mint focus:ring-opacity-50
      hover:-translate-y-0.5
    `,
  };

  const widthClasses = fullWidth ? 'w-full' : '';

  const loadingSpinner = (
    <svg
      className="animate-spin h-4 w-4"
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

  const iconElement = loading ? loadingSpinner : icon;

  const buttonContent = (
    <>
      {iconElement && iconPosition === 'left' && (
        <span className="flex-shrink-0">
          {iconElement}
        </span>
      )}

      {children && (
        <span className={loading ? 'opacity-0' : ''}>
          {children}
        </span>
      )}

      {iconElement && iconPosition === 'right' && (
        <span className="flex-shrink-0">
          {iconElement}
        </span>
      )}

      {/* Shimmer effect для премиум ощущения */}
      {!disabled && !loading && (
        <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -translate-x-full hover:translate-x-full transition-transform duration-1000" />
        </div>
      )}
    </>
  );

  const buttonClasses = cn(
    baseClasses,
    sizeClasses[size],
    variantClasses[variant],
    widthClasses,
    className
  );

  if (as === 'a' || href) {
    return (
      <a
        href={href}
        target={target}
        className={buttonClasses}
        onClick={onClick}
        {...props}
      >
        {buttonContent}
      </a>
    );
  }

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {buttonContent}
    </button>
  );
};

export default Button;