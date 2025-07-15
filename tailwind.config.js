/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // === ОСНОВНЫЕ ЦВЕТА ИЗ ТЗ ===
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#90bff9', // основной светло-голубой из ТЗ
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#05192c', // основной темно-синий из ТЗ
          950: '#0c4a6e',
        },

        // === ПРОФЕССИОНАЛЬНЫЕ ПАСТЕЛЬНЫЕ ДОПОЛНИТЕЛЬНЫЕ ===
        'status-positive': '#86efac', // прибыль
        'status-negative': '#fca5a5', // убыток
        'status-neutral': '#bf9ffb',  // нейтральный
        'pastel-coral': '#fdba74',    // морской коралл
        'pastel-mint': '#a7f3d0',     // морская мята
        'pastel-pearl': '#f1f5f9',    // жемчуг

        // === СЛУЖЕБНЫЕ ЦВЕТА ===
        navy: {
          700: '#334155',
          800: '#1e293b',
        },
        slate: {
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
        },

        // === СИСТЕМНЫЕ ЦВЕТА ===
        background: {
          DEFAULT: 'var(--color-background)',
          secondary: 'var(--color-background-secondary)',
          tertiary: 'var(--color-background-tertiary)',
        },
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          tertiary: 'var(--color-text-tertiary)',
        },
        border: {
          DEFAULT: 'var(--color-border)',
          secondary: 'var(--color-border-secondary)',
        },
      },

      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Monaco', 'Consolas', 'monospace'],
      },

      fontSize: {
        'display-1': ['4.5rem', { lineHeight: '1.1', fontWeight: '700' }],
        'display-2': ['3.75rem', { lineHeight: '1.1', fontWeight: '700' }],
        'display-3': ['3rem', { lineHeight: '1.2', fontWeight: '600' }],
      },

      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '100': '25rem',
        '112': '28rem',
        '128': '32rem',
      },

      animation: {
        'gentle-float': 'gentle-float 4s ease-in-out infinite',
        'subtle-pulse': 'subtle-pulse 3s ease-in-out infinite',
        'professional-shimmer': 'professional-shimmer 2s infinite',
        'ocean-ripple': 'ocean-ripple 0.6s ease-out',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
      },

      keyframes: {
        'gentle-float': {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-3px) rotate(0.2deg)' },
        },
        'subtle-pulse': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.95', transform: 'scale(1.01)' },
        },
        'professional-shimmer': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'ocean-ripple': {
          '0%': { transform: 'scale(1)', opacity: '0.3' },
          '100%': { transform: 'scale(1.05)', opacity: '0' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 10px rgba(144, 191, 249, 0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(144, 191, 249, 0.6)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },

      backgroundImage: {
        'gradient-ocean': 'linear-gradient(135deg, #05192c 0%, #0f2337 50%, #1a2b42 100%)',
        'gradient-ocean-light': 'linear-gradient(135deg, #ffffff 0%, rgba(144, 191, 249, 0.05) 50%, #f1f5f9 100%)',
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },

      backdropBlur: {
        xs: '2px',
      },

      screens: {
        'xs': '475px',
        '3xl': '1680px',
      },

      boxShadow: {
        'ocean-sm': '0 1px 2px 0 rgba(5, 25, 44, 0.05)',
        'ocean-md': '0 4px 6px -1px rgba(5, 25, 44, 0.1), 0 2px 4px -2px rgba(5, 25, 44, 0.05)',
        'ocean-lg': '0 10px 15px -3px rgba(5, 25, 44, 0.1), 0 4px 6px -4px rgba(5, 25, 44, 0.05)',
        'ocean-xl': '0 20px 25px -5px rgba(5, 25, 44, 0.15), 0 8px 10px -6px rgba(5, 25, 44, 0.1)',
        'wave-glow': '0 0 20px rgba(144, 191, 249, 0.4)',
      },
    },
  },
  plugins: [
    // Basic form styles without external dependencies
    function ({ addBase, addUtilities }) {
      addBase({
        'input, textarea, select': {
          borderRadius: '0.5rem',
          borderWidth: '1px',
          padding: '0.75rem',
          fontSize: '1rem',
          lineHeight: '1.5',
          transition: 'all 0.2s ease-in-out',
        },
        'input:focus, textarea:focus, select:focus': {
          outline: 'none',
          borderColor: '#90bff9',
          boxShadow: '0 0 0 3px rgba(144, 191, 249, 0.2)',
        },
      });

      addUtilities({
        '.glass': {
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(144, 191, 249, 0.2)',
        },
        '.glass-dark': {
          background: 'rgba(5, 25, 44, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(144, 191, 249, 0.3)',
        },
        '.floating-animation': {
          animation: 'gentle-float 4s ease-in-out infinite',
        },
        '.pulse-glow': {
          animation: 'pulse-glow 3s ease-in-out infinite',
        },
        '.interactive-card': {
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          cursor: 'pointer',
        },
        '.interactive-card::before': {
          content: '""',
          position: 'absolute',
          top: '0',
          left: '-100%',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(144, 191, 249, 0.1), transparent)',
          transition: 'left 0.6s',
        },
        '.interactive-card:hover::before': {
          left: '100%',
        },
        '.interactive-card:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 20px 60px rgba(5, 25, 44, 0.1)',
        },
        '.ripple-effect': {
          position: 'relative',
          overflow: 'hidden',
        },
        '.ripple-effect::after': {
          content: '""',
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '0',
          height: '0',
          background: 'rgba(144, 191, 249, 0.2)',
          borderRadius: '50%',
          transform: 'translate(-50%, -50%)',
          transition: 'all 0.3s ease',
        },
        '.ripple-effect:hover::after': {
          width: '200px',
          height: '200px',
          animation: 'ocean-ripple 0.6s ease-out',
        },
        '.laser-border': {
          position: 'relative',
          background: '#1e293b',
          borderRadius: '16px',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
        },
        '.laser-border::before': {
          content: '""',
          position: 'absolute',
          top: '0',
          left: '-100%',
          width: '100%',
          height: '2px',
          background: 'linear-gradient(90deg, transparent, #90bff9, transparent)',
          transition: 'left 0.6s ease',
        },
        '.laser-border::after': {
          content: '""',
          position: 'absolute',
          top: '-100%',
          right: '0',
          width: '2px',
          height: '100%',
          background: 'linear-gradient(180deg, transparent, #90bff9, transparent)',
          transition: 'top 0.6s ease 0.2s',
        },
        '.laser-border:hover::before': {
          left: '0',
        },
        '.laser-border:hover::after': {
          top: '0',
        },
        '.laser-border:hover': {
          boxShadow: '0 0 30px rgba(144, 191, 249, 0.3)',
          transform: 'translateY(-2px)',
        },
      });
    },
  ],
};