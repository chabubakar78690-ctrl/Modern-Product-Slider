/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          darkest: '#050D1A',
          dark: '#081326',
          navy: '#0B1B3D',
          primary: '#0F2756',
          hover: '#163B80',
          accent: '#00A3FF',
          surface: '#F4F7FC',
        },
      },
    },
  },
  plugins: [],
};
