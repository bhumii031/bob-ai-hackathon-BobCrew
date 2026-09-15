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
        navy: {
          950: '#0F1B2D',
          900: '#0F1B2D',
          800: '#1E293B',
          700: '#243447',
          600: '#2D4A6B',
        },
        teal: {
          500: '#0EA5E9',
          600: '#0891B2',
          700: '#0F766E',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1)',
        'card-hover': '0 4px 12px 0 rgba(0,0,0,0.15)',
      },
    },
  },
  plugins: [],
}
