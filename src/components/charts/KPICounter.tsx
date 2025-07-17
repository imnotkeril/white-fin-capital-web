import React, { useState, useEffect } from 'react';
import { cn } from '@/utils/helpers';

interface KPIData {
  label: string;
  value: number;
  trend?: 'up' | 'down';
  trendValue?: number;
  format?: 'percentage' | 'number' | 'currency';
  lastPeriod?: string;
}

interface KPICounterProps {
  data: KPIData;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  animationDuration?: number;
  showTrend?: boolean;
}

const KPICounter: React.FC<KPICounterProps> = ({
  data,
  className = '',
  size = 'md',
  animationDuration = 2000,
  showTrend = false, // По умолчанию не показываем trend
}) => {
  const [currentValue, setCurrentValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const styles = {
    sm: {
      container: 'p-4',
      label: 'text-xs',
      value: 'text-lg',
      trend: 'text-xs',
    },
    md: {
      container: 'p-6',
      label: 'text-sm',
      value: 'text-3xl',
      trend: 'text-sm',
    },
    lg: {
      container: 'p-8',
      label: 'text-base',
      value: 'text-4xl',
      trend: 'text-base',
    },
  };

  // Анимация счетчика
  useEffect(() => {
    setIsAnimating(true);
    const startTime = Date.now();
    const startValue = 0;
    const endValue = Math.abs(data.value);

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / animationDuration, 1);

      // Easing функция для плавной анимации
      const easeOutExpo = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

      const current = startValue + (endValue - startValue) * easeOutExpo;
      setCurrentValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };

    requestAnimationFrame(animate);
  }, [data.value, animationDuration]);

  // Форматирование значения
  const formatValue = (value: number): string => {
    const sign = data.value < 0 ? '-' : data.value > 0 ? '+' : '';

    switch (data.format) {
      case 'percentage':
        return `${sign}${value.toFixed(1)}%`;
      case 'currency':
        return `${sign}$${value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
      case 'number':
      default:
        return `${sign}${value.toFixed(data.format === 'number' && value < 10 ? 1 : 0)}`;
    }
  };

  // Цвета для трендов
  const getTrendColor = (trend?: 'up' | 'down') => {
    switch (trend) {
      case 'up':
        return 'text-[#86efac]'; // pastel-green
      case 'down':
        return 'text-[#fca5a5]'; // pastel-red
      default:
        return 'text-[#bf9ffb]'; // pastel-purple
    }
  };

  const getValueColor = () => {
    if (data.value > 0) return 'text-[#86efac]'; // pastel-green
    if (data.value < 0) return 'text-[#fca5a5]'; // pastel-red
    return 'text-[#bf9ffb]'; // pastel-purple
  };

  return (
    <div
      className={cn(
        'text-center rounded-2xl transition-all duration-300',
        styles[size].container,
        className
      )}
      style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(144, 191, 249, 0.2)',
      }}
    >
      {/* Label */}
      <div className={cn(
        'text-white/70 mb-2 uppercase tracking-wide font-medium',
        styles[size].label
      )}>
        {data.label}
      </div>

      {/* Value с анимацией */}
      <div className={cn(
        'font-bold mb-2 transition-colors duration-300',
        styles[size].value,
        getValueColor()
      )}>
        {formatValue(currentValue)}
      </div>

      {/* Trend информация (опционально) */}
      {showTrend && data.trendValue && (
        <div className={cn(
          'flex items-center justify-center gap-1',
          styles[size].trend
        )}>
          <span className={getTrendColor(data.trend)}>
            {data.trend === 'up' ? '↗' : data.trend === 'down' ? '↘' : '→'}
            {data.trendValue > 0 ? '+' : ''}{data.trendValue}
            {data.format === 'percentage' ? '%' : ''}
          </span>

          <span className="text-white/50">
            vs last period
          </span>
        </div>
      )}

    </div>
  );
};

// Grid component
interface KPIGridProps {
  data: KPIData[];
  columns?: 2 | 3 | 4 | 5;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  animationDelay?: number;
  showTrend?: boolean;
}

export const KPIGrid: React.FC<KPIGridProps> = ({
  data,
  columns = 3,
  className = '',
  size = 'md',
  animationDelay = 100,
  showTrend = false,
}) => {
  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-5',
  };

  return (
    <div className={cn('grid gap-4', gridCols[columns], className)}>
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
            showTrend={showTrend}
          />
        </div>
      ))}
    </div>
  );
};

export default KPICounter;