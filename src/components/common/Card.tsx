import React from 'react';
import { CardProps } from '@/types';
import { cn } from '@/utils/helpers';

interface ExtendedCardProps extends CardProps {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  image?: string;
  imageAlt?: string;
  glass?: boolean;
  gradient?: boolean;
  border?: boolean;
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

const Card: React.FC<ExtendedCardProps> = ({
  children,
  header,
  footer,
  image,
  imageAlt,
  className = '',
  hover = false,
  padding = 'md',
  glass = false,
  gradient = false,
  border = true,
  shadow = 'md',
  ...props
}) => {
  const baseClasses = `
    rounded-xl overflow-hidden transition-all duration-300 ease-in-out
    ${hover ? 'hover-lift cursor-pointer' : ''}
  `;

  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  };

  const backgroundClasses = glass
    ? 'glass'
    : gradient
    ? 'bg-gradient-to-br from-background to-background-secondary'
    : 'bg-background';

  const borderClasses = border
    ? 'border border-border'
    : '';

  const classes = cn(
    baseClasses,
    backgroundClasses,
    borderClasses,
    shadowClasses[shadow],
    className
  );

  const contentClasses = cn(paddingClasses[padding]);

  return (
    <div className={classes} {...props}>
      {image && (
        <div className="relative">
          <img
            src={image}
            alt={imageAlt || ''}
            className="w-full h-48 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
      )}
      
      {header && (
        <div className="px-6 py-4 border-b border-border bg-background-secondary/50">
          {header}
        </div>
      )}
      
      <div className={contentClasses}>
        {children}
      </div>
      
      {footer && (
        <div className="px-6 py-4 border-t border-border bg-background-secondary/50">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;