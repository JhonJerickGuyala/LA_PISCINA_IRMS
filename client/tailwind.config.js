/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'lp-orange': '#F57C00',
        'lp-orange-hover': '#EF6C00',
        'lp-blue': '#1E3A8A',
        'lp-blue-hover': '#172554',
        'lp-gray': '#E5E7EB',
        'lp-dark': '#2D2D2D',
        'lp-light-bg': '#F9FAFB',
      },
      fontFamily: {
        'header': ['FontHeader', 'sans-serif'],
        'body': ['FontBody', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
