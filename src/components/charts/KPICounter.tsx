import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { KPIData } from '@/types';
import { formatPercentage, formatNumber, formatCurrency } from '@/utils/formatting';
import { cn } from '@/utils/helpers';

interface KPICounterProps {
  data: KPIData;
  animationDuration?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTrend?: boolean;
  showIcon?: boolean;
}

const KPICounter: React.FC<KPICounterProps> = ({
  data,
  animationDuration = 2000,
  className = '',
  size = 'md',
  showTrend = true,
  showIcon = true,
}) => {
  const [currentValue, setCurrentValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Animate the counter when it becomes visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
          animateCounter();
        }
      },
      { threshold: 0.3 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  const animateCounter = () => {
    const targetValue = typeof data.value === 'number' ? data.value : 0;
    const startTime = Date.now();
    const startValue = 0;

    const updateValue = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / animationDuration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const newValue = startValue + (targetValue - startValue) * easeOutQuart;
      
      setCurrentValue(newValue);

      if (progress < 1) {
        requestAnimationFrame(updateValue);
      } else {
        setCurrentValue(targetValue);
      }
    };

    requestAnimationFrame(updateValue);
  };

  // Format the display value
  const formatValue = (value: number): string => {
    if (typeof data.value === 'string') {
      return data.value;
    }

    switch (data.format) {
      case 'currency':
        return formatCurrency(value);
      case 'percentage':
        return formatPercentage(value);
      case 'number':
      default:
        return formatNumber(value, value % 1 === 0 ? 0 : 2);
    }
  };

  // Get trend icon and color
  const getTrendIcon = () => {
    if (!data.trend || !showTrend) return null;

    const iconProps = {
      className: cn(
        'transition-colors duration-200',
        size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-5 h-5' : 'w-6 h-6'
      ),
    };

    switch (data.trend) {
      case 'up':
        return <TrendingUp {...iconProps} className={cn(iconProps.className, 'text-accent-green')} />;
      case 'down':
        return <TrendingDown {...iconProps} className={cn(iconProps.className, 'text-accent-red')} />;
      case 'neutral':
      default:
        return <Minus {...iconProps} className={cn(iconProps.className, 'text-text-secondary')} />;
    }
  };

  // Get trend color class
  const getTrendColor = () => {
    if (!data.trend) return 'text-text-primary';
    
    switch (data.trend) {
      case 'up':
        return 'text-accent-green';
      case 'down':
        return 'text-accent-red';
      case 'neutral':
      default:
        return 'text-text-secondary';
    }
  };

  // Size-based styles
  const sizeClasses = {
    sm: {
      container: 'p-4',
      label: 'text-sm',
      value: 'text-2xl',
      trend: 'text-xs',
    },
    md: {
      container: 'p-6',
      label: 'text-base',
      value: 'text-3xl',
      trend: 'text-sm',
    },
    lg: {
      container: 'p-8',
      label: 'text-lg',
      value: 'text-4xl',
      trend: 'text-base',
    },
  };

  const styles = sizeClasses[size];

  return (
    <div
      ref={containerRef}
      className={cn(
        'bg-background border border-border rounded-xl hover-lift transition-all duration-300',
        styles.container,
        className
      )}
    >
      {/* Label */}
      <div className="flex items-center justify-between mb-2">
        <h3 className={cn('font-medium text-text-secondary', styles.label)}>
          {data.label}
        </h3>
        {showIcon && getTrendIcon()}
      </div>

      {/* Value */}
      <div className="mb-2">
        <span
          className={cn(
            'font-bold transition-colors duration-300',
            styles.value,
            getTrendColor()
          )}
        >
          {formatValue(currentValue)}
        </span>
      </div>

      {/* Trend Information */}
      {showTrend && data.trendValue && (
        <div className="flex items-center gap-1">
          {data.trend === 'up' && <span className="text-accent-green">+</span>}
          {data.trend === 'down' && <span className="text-accent-red">-</span>}
          
          <span
            className={cn(
              'font-medium',
              styles.trend,
              getTrendColor()
            )}
          >
            {Math.abs(data.trendValue)}
            {data.format === 'percentage' ? '%' : ''}
          </span>
          
          <span className={cn('text-text-tertiary', styles.trend)}>
            vs last period
          </span>
        </div>
      )}

      {/* Progress Bar (for percentage values) */}
      {data.format === 'percentage' && typeof data.value === 'number' && (
        <div className="mt-4">
          <div className="w-full bg-background-secondary rounded-full h-2">
            <div
              className={cn(
                'h-2 rounded-full transition-all duration-1000 ease-out',
                data.trend === 'up' ? 'bg-accent-green' :
                data.trend === 'down' ? 'bg-accent-red' :
                'bg-primary-500'
              )}
              style={{
                width: `${Math.min(Math.abs(currentValue), 100)}%`,
                transitionDelay: '0.5s',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Grid component for multiple KPI counters
interface KPIGridProps {
  data: KPIData[];
  columns?: 2 | 3 | 4;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  animationDelay?: number;
}

export const KPIGrid: React.FC<KPIGridProps> = ({
  data,
  columns = 3,
  className = '',
  size = 'md',
  animationDelay = 100,
}) => {
  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn('grid gap-6', gridCols[columns], className)}>
      {data.map((kpi, index) => (
        <div
          key={kpi.label}
          style={{
            animationDelay: `${index * animationDelay}ms`,
          }}
          className="animate-in"
        >
          <KPICounter
            data={kpi}
            size={size}
            animationDuration={2000 + index * 200}
          />
        </div>
      ))}
    </div>
  );
};

export default KPICounter;