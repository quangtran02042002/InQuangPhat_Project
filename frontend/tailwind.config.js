/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // ── TYPOGRAPHY ────────────────────────────────────────
      fontFamily: {
        display: ['Plus Jakarta Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body:    ['Plus Jakarta Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans:    ['Plus Jakarta Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },

      // ── BRAND COLORS ──────────────────────────────────────
      colors: {
        brand: {
          50:  '#e6f4ef',
          100: '#c2e4d5',
          200: '#9dd3bb',
          300: '#76c2a0',
          400: '#50b085',
          500: '#2a9f6b',
          600: '#006B4D', // primary
          700: '#005a41',
          800: '#004a36',
          900: '#003a2a',
        },
        surface: {
          DEFAULT: '#F9FAFB',
          low:     '#F3F4F6',
          card:    '#FFFFFF',
          overlay: 'rgba(17,24,39,0.6)',
        },
        accent: {
          DEFAULT: '#DC2626',
          light:   '#FEF2F2',
          dark:    '#B91C1C',
        },
      },

      // ── SHADOWS ──────────────────────────────────────────
      boxShadow: {
        'ambient':   '0 2px 8px 0 rgba(0,107,77,0.08), 0 1px 2px 0 rgba(0,0,0,0.04)',
        'elevation': '0 4px 24px 0 rgba(0,0,0,0.08), 0 1px 4px 0 rgba(0,0,0,0.04)',
        'floating':  '0 8px 32px 0 rgba(0,107,77,0.18), 0 2px 8px 0 rgba(0,0,0,0.06)',
        'glow-brand':'0 0 20px rgba(0,107,77,0.25)',
      },

      // ── ANIMATION ────────────────────────────────────────
      keyframes: {
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in-left': {
          '0%':   { opacity: '0', transform: 'translateX(-24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'scale-in': {
          '0%':   { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'pulse-ring': {
          '0%':   { transform: 'scale(1)', opacity: '0.8' },
          '70%':  { transform: 'scale(1.4)', opacity: '0' },
          '100%': { transform: 'scale(1.4)', opacity: '0' },
        },
        'bounce-x': {
          '0%, 100%': { transform: 'translateX(0)' },
          '50%':      { transform: 'translateX(4px)' },
        },
        'count-up': {
          '0%':   { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up':        'fade-up 0.6s ease-out both',
        'fade-up-delay-1':'fade-up 0.6s 0.1s ease-out both',
        'fade-up-delay-2':'fade-up 0.6s 0.2s ease-out both',
        'fade-up-delay-3':'fade-up 0.6s 0.3s ease-out both',
        'fade-in':        'fade-in 0.5s ease-out both',
        'slide-in-left':  'slide-in-left 0.6s ease-out both',
        'scale-in':       'scale-in 0.5s ease-out both',
        'pulse-ring':     'pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite',
        'bounce-x':       'bounce-x 1s ease-in-out infinite',
        'bounce-slow':    'bounce 3s ease-in-out infinite',
      },

      // ── TRANSITION TIMING ────────────────────────────────
      transitionDuration: {
        '400': '400ms',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}