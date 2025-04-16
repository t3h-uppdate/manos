/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Playfair Display', 'serif'],
      },
      colors: {
        gold: {
          50: '#FFFBEB',  // Added very light gold for mobile active bg
          600: '#D4AF37', // Existing gold color
          700: '#B4941F', // Added darker gold for hover
        },
      },
    },
  },
  plugins: [],
};
