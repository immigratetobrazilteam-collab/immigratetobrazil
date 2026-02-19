import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          50: '#f4f7f6',
          100: '#dce6e3',
          200: '#b8ccc6',
          300: '#8faea4',
          400: '#6d9488',
          500: '#4f786c',
          600: '#375a50',
          700: '#234239',
          800: '#132f29',
          900: '#091c18',
        },
        sand: {
          50: '#f9f7f1',
          100: '#f2ece1',
          200: '#e8dcc8',
          300: '#d9c3a0',
          400: '#c8a87b',
          500: '#b58f59',
          600: '#8f6e40',
          700: '#6d5331',
          800: '#4e3c24',
          900: '#362818',
        },
        civic: {
          50: '#f0f7f7',
          100: '#d8eceb',
          200: '#add9d6',
          300: '#7ec1bc',
          400: '#4ca8a1',
          500: '#2f8f88',
          600: '#246f6a',
          700: '#1f5854',
          800: '#1b4643',
          900: '#183937',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Georgia', 'serif'],
      },
      boxShadow: {
        glow: '0 20px 60px rgba(36, 111, 106, 0.2)',
        card: '0 12px 32px rgba(9, 28, 24, 0.08)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '100% 50%' },
        },
      },
      animation: {
        'fade-up': 'fade-up .7s ease-out both',
        float: 'float 6s ease-in-out infinite',
        shimmer: 'shimmer 8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
