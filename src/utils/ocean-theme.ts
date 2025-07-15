/**
 * Ocean Theme Utilities for White Fin Capital
 * Центральное место для всех утилит, связанных с океанской темой
 */

import { cn } from './helpers';

// Типы для океанских эффектов
export type OceanEffect = 'glass' | 'ripple' | 'float' | 'shimmer' | 'wave';
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
  float: 'float-animation',
  shimmer: 'shimmer',
  interactiveCard: 'interactive-card',
  hoverLift: 'hover-lift',
  oceanGradient: 'ocean-gradient',
  navGlass: 'nav-glass',
  cardOcean: 'card-ocean',
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
  className?: string;
} = {}) => {
  const { interactive, glass, float, ripple, className = '' } = options;

  return cn(
    'rounded-2xl transition-all duration-300',
    glass ? OCEAN_EFFECTS.glass : 'bg-background border border-border',
    interactive && OCEAN_EFFECTS.interactiveCard,
    float && OCEAN_EFFECTS.float,
    ripple && OCEAN_EFFECTS.ripple,
    className
  );
};

/**
 * Генерирует классы для кнопок в океанском стиле
 */
export const createOceanButton = (variant: 'primary' | 'secondary' | 'glass' = 'primary', options: {
  size?: 'sm' | 'md' | 'lg';
  ripple?: boolean;
  className?: string;
} = {}) => {
  const { size = 'md', ripple, className = '' } = options;

  const baseClasses = cn(
    'ocean-btn',
    `btn-${variant}`,
    `btn-${size}`,
    ripple && OCEAN_EFFECTS.ripple,
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
 * Утилиты для анимаций
 */
export const OCEAN_ANIMATIONS = {
  // Мягкие океанские переходы
  gentle: 'transition-all duration-300 ease-in-out',
  smooth: 'transition-all duration-500 ease-out',
  wave: 'transition-all duration-700 cubic-bezier(0.25, 0.46, 0.45, 0.94)',

  // Hover эффекты
  liftHover: 'hover:-translate-y-1 hover:shadow-lg',
  scaleHover: 'hover:scale-102',
  glowHover: 'hover:shadow-[0_0_20px_var(--wave-foam)]',

  // Анимации загрузки
  pulse: 'animate-pulse',
  bounce: 'animate-bounce',
  spin: 'animate-spin',
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
} = {}) => {
  const { blur = 20, opacity = 0.7, borderOpacity = 0.2 } = options;

  return {
    background: `rgba(255, 255, 255, ${opacity})`,
    backdropFilter: `blur(${blur}px)`,
    border: `1px solid rgba(144, 191, 249, ${borderOpacity})`,
  };
};

/**
 * Проверяет, поддерживает ли браузер backdrop-filter
 */
export const supportsBackdropFilter = (): boolean => {
  if (typeof window === 'undefined') return false;

  const testElement = document.createElement('div');
  testElement.style.backdropFilter = 'blur(1px)';

  return testElement.style.backdropFilter !== '';
};

/**
 * Генерирует случайную волновую анимацию для декоративных элементов
 */
export const generateWaveAnimation = (elements: number = 5) => {
  return Array.from({ length: elements }, (_, i) => ({
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    animationDelay: `${i * 0.5}s`,
    animationDuration: `${3 + Math.random() * 2}s`,
  }));
};

/**
 * Константы для responsive дизайна с океанской темой
 */
export const OCEAN_BREAKPOINTS = {
  mobile: '320px',
  tablet: '768px',
  desktop: '1024px',
  large: '1280px',
} as const;

/**
 * Утилиты для доступности в океанской теме
 */
export const ACCESSIBILITY_HELPERS = {
  focusRing: 'focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-2',
  highContrast: 'contrast-more:border-2 contrast-more:border-text-primary',
  reduceMotion: 'motion-reduce:animate-none motion-reduce:transition-none',
  screenReader: 'sr-only',
} as const;

/**
 * Экспорт всех утилит как единый объект
 */
export const OceanTheme = {
  colors: OCEAN_COLORS,
  effects: OCEAN_EFFECTS,
  status: STATUS_STYLES,
  animations: OCEAN_ANIMATIONS,
  breakpoints: OCEAN_BREAKPOINTS,
  accessibility: ACCESSIBILITY_HELPERS,

  // Функции
  createCard: createOceanCard,
  createButton: createOceanButton,
  createStatus: createStatusIndicator,
  createIconGradient: createOceanIconGradient,
  createGradient: createCustomGradient,
  createGlass: createGlassEffect,
  generateWaves: generateWaveAnimation,
  supportsBlur: supportsBackdropFilter,
} as const;