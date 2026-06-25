/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f5f7',
          100: '#fafafc',
          200: '#e0e0e0',
          300: '#7a7a7a',
          450: '#333333',
          500: '#0066cc',
          600: '#0066cc',
          700: '#0055aa',
          800: '#1d1d1f',
          900: '#000000',
        },
        apple: {
          blue: '#0066cc',
          sky: '#2997ff',
          ink: '#1d1d1f',
          parchment: '#f5f5f7',
          pearl: '#fafafc',
          gray: '#7a7a7a',
          border: '#e0e0e0',
        }
      },
      borderRadius: {
        'apple-xs': '5px',
        'apple-sm': '8px',
        'apple-md': '11px',
        'apple-lg': '18px',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Text', 'Inter', 'Noto Sans KR', 'sans-serif'],
        display: ['SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['SFMono-Regular', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
}
