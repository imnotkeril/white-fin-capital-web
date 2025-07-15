/**
 * Ocean Theme Utilities for White Fin Capital
 * Центральное место для всех утилит, связанных с океанской темой
 */

import { cn } from './helpers';

// Типы для океанских эффектов
export type OceanEffect = 'glass' | 'ripple' | 'float' | 'neon' | 'wave' | 'glow';
export type StatusColor = 'positive' | 'negative' | 'neutral';
export type OceanColor = 'coral' | 'mint' | 'pearl' | 'navy' | 'light-blue';

// Основные цвета темы
export const OCEAN_COLORS = {
  // Основные из ТЗ
  white: '#ffffff',
  darkBlue: '#05192c',
  lightBlue: '#90bff9',

  // Пастельные дополнительные
  pastelGreen: '#86efac',   // прибыль
  pastelRed: '#fca5a5',     // убыток
  pastelPurple: '#bf9ffb',  // нейтральный
  pastelCoral: '#fdba74',   // морской коралл
  pastelMint: '#a7f3d0',    // морская мята
  pastelPearl: '#f1f5f9',   // жемчуг

  // Служебные
  navy800: '#1e293b',
  navy700: '#334155',
  slate100: '#f1f5f9',
  slate200: '#e2e8f0',
  slate300: '#cbd5e1',
} as const;

// CSS классы для океанских эффектов
export const OCEAN_EFFECTS = {
  glass: 'glass backdrop-blur-20 border border-wave-foam',
  glassStrong: 'glass-strong backdrop-blur-30',
  ripple: 'ripple-effect',
  rippleBtn: 'ripple-btn',
  float: 'float-animation',
  neonGlow: 'neon-glow',
  neonGlowStrong: 'neon-glow-strong',
  interactiveCard: 'interactive-card',
  hoverLift: 'hover-lift',
  hoverGlow: 'hover-glow',
  oceanGradient: 'ocean-gradient',
  navGlass: 'nav-glass',
  cardOcean: 'card-ocean',
  glowPulse: 'animate-glow-pulse',
} as const;

// Статусные цвета и классы
export const STATUS_STYLES = {
  positive: {
    color: 'text-status-positive',
    bg: 'bg-status-positive/10',
    border: 'border-status-positive',
    badge: 'status-positive',
  },
  negative: {
    color: 'text-status-negative',
    bg: 'bg-status-negative/10',
    border: 'border-status-negative',
    badge: 'status-negative',
  },
  neutral: {
    color: 'text-status-neutral',
    bg: 'bg-status-neutral/10',
    border: 'border-status-neutral',
    badge: 'status-neutral',
  },
} as const;

// Функции для генерации классов

/**
 * Генерирует классы для океанской карточки
 */
export const createOceanCard = (options: {
  interactive?: boolean;
  glass?: boolean;
  float?: boolean;
  ripple?: boolean;
  neonGlow?: boolean;
  glowStrong?: boolean;
  className?: string;
} = {}) => {
  const { interactive, glass, float, ripple, neonGlow, glowStrong, className = '' } = options;

  return cn(
    'rounded-2xl transition-all duration-300',
    glass ? OCEAN_EFFECTS.glass : 'bg-background border border-border',
    interactive && OCEAN_EFFECTS.interactiveCard,
    float && OCEAN_EFFECTS.float,
    ripple && OCEAN_EFFECTS.ripple,
    neonGlow && OCEAN_EFFECTS.neonGlow,
    glowStrong && OCEAN_EFFECTS.neonGlowStrong,
    className
  );
};

/**
 * Генерирует классы для кнопок в океанском стиле
 */
export const createOceanButton = (variant: 'primary' | 'secondary' | 'glass' | 'outline' | 'ghost' = 'primary', options: {
  size?: 'sm' | 'md' | 'lg';
  ripple?: boolean;
  neonGlow?: boolean;
  glowStrong?: boolean;
  className?: string;
} = {}) => {
  const { size = 'md', ripple, neonGlow, glowStrong, className = '' } = options;

  const baseClasses = cn(
    'ocean-btn',
    `btn-${variant}`,
    `btn-${size}`,
    ripple && OCEAN_EFFECTS.rippleBtn,
    neonGlow && OCEAN_EFFECTS.neonGlow,
    glowStrong && OCEAN_EFFECTS.neonGlowStrong,
    className
  );

  return baseClasses;
};

/**
 * Генерирует классы для статусных индикаторов
 */
export const createStatusIndicator = (status: StatusColor, options: {
  variant?: 'badge' | 'text' | 'background';
  className?: string;
} = {}) => {
  const { variant = 'badge', className = '' } = options;

  const statusConfig = STATUS_STYLES[status];

  switch (variant) {
    case 'badge':
      return cn(statusConfig.badge, className);
    case 'text':
      return cn(statusConfig.color, className);
    case 'background':
      return cn(statusConfig.bg, className);
    default:
      return cn(statusConfig.badge, className);
  }
};

/**
 * Генерирует градиенты для иконок в океанском стиле
 */
export const createOceanIconGradient = (colors: [OceanColor, OceanColor]) => {
  const colorMap: Record<OceanColor, string> = {
    coral: 'var(--color-pastel-coral)',
    mint: 'var(--color-pastel-mint)',
    pearl: 'var(--color-pastel-pearl)',
    navy: 'var(--color-dark-blue)',
    'light-blue': 'var(--color-light-blue)',
  };

  return {
    background: `linear-gradient(135deg, ${colorMap[colors[0]]}, ${colorMap[colors[1]]})`,
  };
};

/**
 * Утилиты для анимаций - убрал shimmer, добавил neon glow
 */
export const OCEAN_ANIMATIONS = {
  // Мягкие океанские переходы
  gentle: 'transition-all duration-300 ease-in-out',
  smooth: 'transition-all duration-500 ease-out',
  wave: 'transition-all duration-700 cubic-bezier(0.25, 0.46, 0.45, 0.94)',

  // Hover эффекты в соответствии с гайдлайном
  buttonHover: 'hover:translate-y-[-2px]',
  cardHover: 'hover:translate-y-[-4px]',
  scaleHover: 'hover:scale-102',

  // Неоновое свечение вместо shimmer
  neonGlow: 'neon-glow',
  neonGlowStrong: 'neon-glow-strong',
  glowPulse: 'animate-glow-pulse',

  // Анимации загрузки
  pulse: 'animate-pulse',
  bounce: 'animate-bounce',
  spin: 'animate-spin',
  float: 'float-animation',
} as const;

/**
 * Создает CSS переменные для кастомного градиента
 */
export const createCustomGradient = (colors: string[], direction = '135deg') => {
  return {
    background: `linear-gradient(${direction}, ${colors.join(', ')})`,
  };
};

/**
 * Утилита для создания матового стекла с кастомными параметрами
 */
export const createGlassEffect = (options: {
  blur?: number;
  opacity?: number;
  borderOpacity?: number;
  strong?: boolean;
} = {}) => {
  const { blur = 20, opacity = 0.7, borderOpacity = 0.2, strong = false } = options;

  return {
    background: `rgba(255, 255, 255, ${opacity})`,
    backdropFilter: `blur(${blur}px)`,
    border: `1px solid rgba(144, 191, 249, ${borderOpacity})`,
    ...(strong && {
      backdropFilter: `blur(${blur + 10}px)`,
      background: `rgba(255, 255, 255, ${opacity + 0.2})`,
    })
  };
};

/**
 * Создает неоновое свечение для premium карточек
 */
export const createNeonGlow = (options: {
  color?: string;
  intensity?: number;
  strong?: boolean;
} = {}) => {
  const { color = 'rgba(144, 191, 249, 0.5)', intensity = 15, strong = false } = options;

  return {
    transition: 'all 0.3s ease',
    '&:hover': {
      boxShadow: `0 0 ${strong ? intensity + 10 : intensity}px ${color}`,
      borderColor: strong ? 'rgba(144, 191, 249, 0.9)' : 'rgba(144, 191, 249, 0.8)',
      transform: strong ? 'translateY(-4px)' : 'translateY(-2px)',
    }
  };
};

/**
 * Создает ripple эффект для интерактивных элементов
 */
export const createRippleEffect = (options: {
  color?: string;
  size?: number;
  duration?: number;
} = {}) => {
  const { color = 'var(--wave-foam)', size = 200, duration = 0.6 } = options;

  return {
    position: 'relative' as const,
    overflow: 'hidden' as const,
    '&::after': {
      content: '""',
      position: 'absolute' as const,
      top: '50%',
      left: '50%',
      width: 0,
      height: 0,
      background: color,
      borderRadius: '50%',
      transform: 'translate(-50%, -50%)',
      transition: `all ${duration}s ease`,
      pointerEvents: 'none' as const,
    },
    '&:hover::after': {
      width: `${size}px`,
      height: `${size}px`,
      animation: `ocean-ripple ${duration}s ease-out`,
    }
  };
};

/**
 * Создает плавающую анимацию для элементов
 */
export const createFloatAnimation = (options: {
  distance?: number;
  duration?: number;
  delay?: number;
} = {}) => {
  const { distance = 3, duration = 4, delay = 0 } = options;

  return {
    animation: `gentle-float ${duration}s ease-in-out infinite`,
    animationDelay: `${delay}s`,
    '--float-distance': `${distance}px`,
  };
};

/**
 * Создает hover эффект для кнопок
 */
export const createButtonHover = (options: {
  lift?: number;
  glow?: boolean;
  strong?: boolean;
} = {}) => {
  const { lift = 2, glow = true, strong = false } = options;

  return {
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: `translateY(-${lift}px)`,
      ...(glow && {
        boxShadow: strong
          ? '0 0 25px rgba(144, 191, 249, 0.7)'
          : '0 0 15px rgba(144, 191, 249, 0.5)',
      }),
    }
  };
};

/**
 * Создает hover эффект для карточек
 */
export const createCardHover = (options: {
  lift?: number;
  glow?: boolean;
  scale?: boolean;
} = {}) => {
  const { lift = 4, glow = false, scale = false } = options;

  return {
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: `translateY(-${lift}px)${scale ? ' scale(1.02)' : ''}`,
      boxShadow: glow
        ? '0 20px 40px rgba(5, 25, 44, 0.15), 0 0 20px rgba(144, 191, 249, 0.4)'
        : '0 20px 40px rgba(5, 25, 44, 0.15)',
    }
  };
};