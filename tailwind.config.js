/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'Inter': 'Inter'
      },
      colors: {
        'custom-primary': '#cb2107',
        'custom-secondary': '#fffc37',
      }
    },
  },
  plugins: [],
}

