import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}', '../../packages/ui/src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#135bec',
        'primary-dark': '#0e45b5',
        'background-light': '#f6f6f8',
        'background-dark': '#101622',
        'surface-light': '#ffffff',
        'surface-dark': '#1a2332',
        'text-main': '#0d121b',
        'text-muted': '#4c669a',
        'text-secondary-light': '#4c669a',
        'text-secondary-dark': '#9aaebb',
        'border-light': '#e7ebf3',
        'border-dark': '#2a3441',
      },
      fontFamily: {
        display: ['Lexend', 'sans-serif'],
        body: ['Noto Sans', 'sans-serif'],
      },
      boxShadow: {
        hero: '0 24px 64px rgba(13, 18, 27, 0.08)',
      },
      keyframes: {
        'fade-in-up': {
          '0%': {
            opacity: '0',
            transform: 'translateY(28px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.8s ease-out both',
      },
    },
  },
  plugins: [],
} satisfies Config;
