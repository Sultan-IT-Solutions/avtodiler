/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        luxury: {
          black: '#050505',
          dark: '#0a0a0a',
          cream: '#e8e6e3',
          surface: '#0f0f0f',
          elevated: '#161616',
          hover: '#1c1c1c',
          burgundy: '#9d2235',
          burgundyHover: '#b8294a',
          burgundyDark: '#7a1a2a',
          muted: '#666666',
          subtle: '#999999',
          accent: '#c8102e',
        },
      },
      fontFamily: {
        display: ['Montserrat', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Space Grotesk', 'monospace'],
      },
      letterSpacing: {
        luxury: '0.15em',
        ultra: '0.3em',
      },
      fontSize: {
        'hero': ['clamp(80px, 12vw, 200px)', { lineHeight: '0.9', letterSpacing: '-0.03em', fontWeight: '700' }],
        'display': ['clamp(60px, 8vw, 140px)', { lineHeight: '1', letterSpacing: '-0.02em', fontWeight: '300' }],
        'h1': ['clamp(40px, 5vw, 80px)', { lineHeight: '1.1', letterSpacing: '-0.01em', fontWeight: '300' }],
        'h2': ['clamp(32px, 4vw, 56px)', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '300' }],
        'h3': ['clamp(24px, 3vw, 36px)', { lineHeight: '1.3', fontWeight: '400' }],
        'body-lg': ['20px', { lineHeight: '1.7', fontWeight: '300' }],
        'body': ['16px', { lineHeight: '1.7', fontWeight: '300' }],
        'label': ['13px', { lineHeight: '1.4', letterSpacing: '0.15em', fontWeight: '500' }],
        'micro': ['11px', { lineHeight: '1.4', letterSpacing: '0.2em', fontWeight: '500' }],
      },
      spacing: {
        '128': '32rem',
        '192': '48rem',
      },
      boxShadow: {
        'luxury-sm': '0 2px 8px rgba(0, 0, 0, 0.4)',
        'luxury-md': '0 8px 32px rgba(0, 0, 0, 0.5)',
        'luxury-lg': '0 16px 64px rgba(0, 0, 0, 0.6)',
        'luxury-xl': '0 32px 96px rgba(0, 0, 0, 0.7)',
        'glow-red': '0 0 60px rgba(157, 34, 53, 0.3)',
        'glow-white': '0 0 60px rgba(255, 255, 255, 0.05)',
      },
      backdropBlur: {
        'luxury': '24px',
        'heavy': '40px',
      },
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
        '1000': '1000ms',
        '1200': '1200ms',
        '1500': '1500ms',
        '2000': '2000ms',
      },
      transitionTimingFunction: {
        'luxury': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'smooth': 'cubic-bezier(0.45, 0, 0.55, 1)',
        'decelerate': 'cubic-bezier(0, 0, 0.2, 1)',
        'accelerate': 'cubic-bezier(0.4, 0, 1, 1)',
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      animation: {
        'spin-slow': 'spin 20s linear infinite',
        'pulse-slow': 'pulse 4s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out infinite 3s',
        'grain': 'grain 8s steps(10) infinite',
        'marquee': 'marquee 30s linear infinite',
        'marquee-reverse': 'marquee-reverse 30s linear infinite',
        'reveal-up': 'revealUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'reveal-down': 'revealDown 1s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in': 'scaleIn 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'line-grow': 'lineGrow 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(2deg)' },
        },
        grain: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '10%': { transform: 'translate(-5%, -10%)' },
          '30%': { transform: 'translate(3%, -15%)' },
          '50%': { transform: 'translate(12%, 9%)' },
          '70%': { transform: 'translate(9%, 4%)' },
          '90%': { transform: 'translate(-1%, 7%)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'marquee-reverse': {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0%)' },
        },
        revealUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        revealDown: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        lineGrow: {
          '0%': { transform: 'scaleX(0)' },
          '100%': { transform: 'scaleX(1)' },
        },
      },
    },
  },
  plugins: [],
}
