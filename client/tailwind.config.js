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
        'boop-brown': '#6B4996', // Purple
        'boop-cream': '#EEA100', // Orange
      },
      fontFamily: {
        sans: ['Quicksand', 'sans-serif'],
        display: ['Nunito', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
