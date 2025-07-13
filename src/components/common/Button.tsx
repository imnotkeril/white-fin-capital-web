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
  ...props
}) => {
  const baseClasses = `
    inline-flex items-center justify-center font-medium rounded-lg
    transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    active:scale-95
  `;

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-base gap-2',
    lg: 'px-6 py-3 text-lg gap-2.5',
  };

  const variantClasses = {
    primary: `
      bg-accent-red text-white border border-accent-red
      hover:bg-red-700 hover:border-red-700 hover:shadow-lg hover:scale-105
      focus:ring-red-500 focus:ring-opacity-50
      active:bg-red-800
    `,
    secondary: `
      bg-transparent text-primary-500 border border-primary-500
      hover:bg-primary-50 hover:border-primary-600
      dark:hover:bg-primary-900/20 dark:hover:border-primary-400
      focus:ring-primary-500 focus:ring-opacity-50
    `,
    outline: `
      bg-transparent text-text-primary border border-border
      hover:bg-background-secondary hover:border-border-secondary
      focus:ring-primary-500 focus:ring-opacity-50
    `,
    ghost: `
      bg-transparent text-text-primary border border-transparent
      hover:bg-background-secondary
      focus:ring-primary-500 focus:ring-opacity-50
    `,
  };

  const widthClasses = fullWidth ? 'w-full' : '';

  const isDisabled = disabled || loading;

  const classes = cn(
    baseClasses,
    sizeClasses[size],
    variantClasses[variant],
    widthClasses,
    className
  );

  const content = (
    <>
      {loading && (
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
            d="M4 12a8 8 0 018-8v8H4z"
          />
        </svg>
      )}
      
      {icon && iconPosition === 'left' && !loading && icon}
      
      {children}
      
      {icon && iconPosition === 'right' && !loading && icon}
    </>
  );

  if (as === 'a' || href) {
    return (
      <a
        href={href}
        target={target}
        className={classes}
        {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={classes}
      {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {content}
    </button>
  );
};

export default Button;