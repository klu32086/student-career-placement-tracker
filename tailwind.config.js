/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#ECF8F6', 100: '#D0EFEA', 200: '#A2DFD6', 300: '#6CC8BC', 400: '#3BAEA0',
          500: '#1F9385', 600: '#167569', 700: '#145E56', 800: '#144B46', 900: '#0F3A38',
        },
        saffron: { 400: '#FBBF3C', 500: '#F5A524', 600: '#D9860B' },
        coral: { 500: '#E5604D' },
        paper: '#F3F5F4',
        night: '#0B1315',
        panel: '#111C1F',
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['"DM Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        fade: { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        pop: { '0%': { opacity: 0, transform: 'translateY(8px) scale(.98)' }, '100%': { opacity: 1, transform: 'none' } },
        toast: { '0%': { opacity: 0, transform: 'translateX(16px)' }, '100%': { opacity: 1, transform: 'none' } },
      },
      animation: { fade: 'fade .25s ease-out', pop: 'pop .22s ease-out', toast: 'toast .25s ease-out' },
    },
  },
  plugins: [],
}
