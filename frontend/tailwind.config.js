/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Dark-first developer-tool surface ramp.
        canvas: '#08090a',
        panel: '#0c0e11',
        elevated: '#111418',
        raised: '#161a1f',
        hairline: '#1e232a',
        'hairline-strong': '#2a3038',
        ink: {
          DEFAULT: '#e8ebee',
          muted: '#9aa4b0',
          faint: '#6b7480',
          ghost: '#4b535d',
        },
        accent: {
          DEFAULT: '#6366f1',
          soft: '#818cf8',
          dim: '#3f3fa8',
          wash: 'rgba(99,102,241,0.12)',
        },
        node: {
          start: '#10b981',
          target: '#f43f5e',
          visited: '#6366f1',
          secondary: '#2dd4bf',
          path: '#f59e0b',
          weight: '#a855f7',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem', letterSpacing: '0.02em' }],
      },
      borderRadius: {
        card: '10px',
      },
      boxShadow: {
        panel: '0 1px 0 0 rgba(255,255,255,0.03) inset, 0 8px 24px -12px rgba(0,0,0,0.8)',
        pop: '0 12px 32px -12px rgba(0,0,0,0.9)',
        glow: '0 0 0 1px rgba(99,102,241,0.35), 0 0 24px -6px rgba(99,102,241,0.45)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: 0, transform: 'translateY(6px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 320ms cubic-bezier(0.16,1,0.3,1) both',
        shimmer: 'shimmer 1.6s infinite',
      },
    },
  },
  plugins: [],
}
