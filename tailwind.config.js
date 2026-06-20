/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'theater': {
          900: '#0f0f1a',
          800: '#16213e',
          700: '#1a1a2e',
          600: '#1f2a4a',
          500: '#2a3a5c',
          400: '#3a4a6c',
        },
        'gold': {
          50: '#fff9ed',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          'amber': '#f5b971',
        },
        'accent': {
          500: '#e94560',
          600: '#d13a54',
          700: '#b02d45',
        },
        'ivory': {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#eaeaea',
          300: '#d4d4d4',
          400: '#a3a3a3',
        },
      },
      fontFamily: {
        'serif': ['"Noto Serif SC"', '"Source Han Serif SC"', 'serif'],
        'sans': ['"Noto Sans SC"', '"Source Han Sans SC"', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 20px rgba(0, 0, 0, 0.3)',
        'card-hover': '0 8px 30px rgba(0, 0, 0, 0.4)',
        'gold-glow': '0 0 20px rgba(245, 185, 113, 0.3)',
        'inner-deep': 'inset 0 2px 4px rgba(0, 0, 0, 0.3)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'theater-gradient': 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f1a 100%)',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
