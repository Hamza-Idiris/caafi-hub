/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary:   '#0EA5E9',
        secondary: '#0F172A',
        dark:      '#09090B',
        accent:    '#F97316',
        surface:   '#111827',
      },
      fontFamily: {
        sans:    ['DM Sans', 'sans-serif'],
        heading: ['Syne', 'sans-serif'],
        mono:    ['Space Mono', 'monospace'],
      },
      animation: {
        'fade-up':   'fadeUp 0.35s ease both',
        'fade-in':   'fadeIn 0.2s ease both',
        'pulse-slow':'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'shimmer':   'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeUp:  { from:{ opacity:0, transform:'translateY(12px)' }, to:{ opacity:1, transform:'translateY(0)' } },
        fadeIn:  { from:{ opacity:0 }, to:{ opacity:1 } },
        shimmer: { '0%':{ backgroundPosition:'-200% 0' }, '100%':{ backgroundPosition:'200% 0' } },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
