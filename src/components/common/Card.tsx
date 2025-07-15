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
  ocean?: boolean;
  interactive?: boolean;
  ripple?: boolean;
  glow?: boolean;
  float?: boolean;
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
  ocean = false,
  interactive = false,
  ripple = false,
  glow = false,
  float = false,
  ...props
}) => {
  const baseClasses = `
    rounded-2xl overflow-hidden transition-all duration-300 ease-in-out
    ${hover || interactive ? 'hover-lift cursor-pointer' : ''}
    ${interactive ? 'interactive-card' : ''}
    ${ripple ? 'ripple-effect' : ''}
    ${glow ? 'hover-glow' : ''}
    ${float ? 'float-animation' : ''}
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

  // Определяем background на основе опций
  const getBackgroundClasses = () => {
    if (ocean) return 'card-ocean';
    if (glass) return 'glass';
    if (gradient) return 'ocean-gradient';
    return 'bg-background';
  };

  const backgroundClasses = getBackgroundClasses();

  const borderClasses = border && !glass && !ocean
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
          {/* Океанский градиент поверх изображения */}
          <div className="absolute inset-0 bg-gradient-to-t from-primary-900/20 via-transparent to-transparent" />

          {/* Волновой эффект на изображении */}
          <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-500/10 to-transparent transform -translate-x-full hover:translate-x-full transition-transform duration-1000" />
          </div>
        </div>
      )}

      {header && (
        <div className={cn(
          "px-6 py-4 border-b border-border",
          glass || ocean
            ? "bg-white/5 backdrop-blur-sm"
            : "bg-background-secondary/50"
        )}>
          {header}
        </div>
      )}

      <div className={contentClasses}>
        {children}
      </div>

      {footer && (
        <div className={cn(
          "px-6 py-4 border-t border-border",
          glass || ocean
            ? "bg-white/5 backdrop-blur-sm"
            : "bg-background-secondary/50"
        )}>
          {footer}
        </div>
      )}

      {/* Дополнительные декоративные элементы для океанской темы */}
      {ocean && (
        <>
          {/* Тонкие волновые линии */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-500/20 to-transparent" />
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-500/20 to-transparent" />
        </>
      )}

      {/* Shimmer эффект для интерактивных карточек */}
      {interactive && (
        <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="shimmer absolute inset-0" />
        </div>
      )}
    </div>
  );
};

// Предустановленные варианты карточек для удобства
export const GlassCard: React.FC<ExtendedCardProps> = (props) => (
  <Card glass interactive ripple {...props} />
);

export const OceanCard: React.FC<ExtendedCardProps> = (props) => (
  <Card ocean interactive glow {...props} />
);

export const FloatingCard: React.FC<ExtendedCardProps> = (props) => (
  <Card ocean interactive float ripple {...props} />
);

export const MetricCard: React.FC<ExtendedCardProps & {
  label?: string;
  value?: string | number;
  trend?: 'positive' | 'negative' | 'neutral';
  icon?: React.ReactNode;
}> = ({
  label,
  value,
  trend,
  icon,
  children,
  className,
  ...props
}) => (
  <Card
    glass
    interactive
    hover
    padding="lg"
    className={cn("text-center", className)}
    {...props}
  >
    {icon && (
      <div className="icon-wrapper mx-auto mb-4">
        {icon}
      </div>
    )}

    {label && (
      <div className="metric-label">
        {label}
      </div>
    )}

    {value && (
      <div className={cn(
        "metric-value",
        trend === 'positive' && "performance-positive",
        trend === 'negative' && "performance-negative",
        trend === 'neutral' && "performance-neutral"
      )}>
        {value}
      </div>
    )}

    {children}
  </Card>
);

export const TeamCard: React.FC<ExtendedCardProps & {
  name?: string;
  role?: string;
  bio?: string;
  avatar?: string;
  social?: {
    linkedin?: string;
    twitter?: string;
    email?: string;
  };
}> = ({
  name,
  role,
  bio,
  avatar,
  social,
  className,
  ...props
}) => (
  <Card
    ocean
    interactive
    hover
    className={cn("text-center", className)}
    image={avatar}
    imageAlt={name}
    {...props}
  >
    <div className="space-y-4">
      {name && (
        <h3 className="text-xl font-semibold text-text-primary">
          {name}
        </h3>
      )}

      {role && (
        <p className="text-primary-500 font-medium">
          {role}
        </p>
      )}

      {bio && (
        <p className="text-text-secondary text-sm leading-relaxed">
          {bio}
        </p>
      )}

      {social && (
        <div className="flex justify-center space-x-4 pt-2">
          {social.linkedin && (
            <a
              href={social.linkedin}
              className="text-text-secondary hover:text-primary-500 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
              </svg>
            </a>
          )}

          {social.twitter && (
            <a
              href={social.twitter}
              className="text-text-secondary hover:text-primary-500 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </a>
          )}

          {social.email && (
            <a
              href={`mailto:${social.email}`}
              className="text-text-secondary hover:text-primary-500 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </a>
          )}
        </div>
      )}
    </div>
  </Card>
);

export default Card;