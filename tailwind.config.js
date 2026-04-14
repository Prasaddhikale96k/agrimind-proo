/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        green: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        gold: '#f59e0b',
        primary: {
          50: '#e0f9f0',
          100: '#b3f0db',
          200: '#80e7c5',
          300: '#4dddb0',
          400: '#1ad49a',
          500: '#00B894',
          600: '#009e7f',
          700: '#007a63',
          800: '#005647',
          900: '#00332a',
        },
        secondary: '#2ecc71',
        accent: '#f39c12',
        dark: '#1A1A1B',
        warning: '#e74c3c',
        info: '#3498db',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'xl': '16px',
        '2xl': '24px',
        '3xl': '32px',
      },
      boxShadow: {
        'glass': '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
        'card': '0 2px 12px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 10px 30px rgba(0, 0, 0, 0.1)',
        'soft': '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -4px rgba(0, 0, 0, 0.05)',
        'glow': '0 0 40px rgba(34, 197, 94, 0.3)',
        'glow-lg': '0 0 60px rgba(34, 197, 94, 0.4)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'gradient': 'gradient 8s ease infinite',
        'scroll-left': 'scrollLeft 30s linear infinite',
        'scroll-right': 'scrollRight 30s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        scrollLeft: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        scrollRight: {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}
