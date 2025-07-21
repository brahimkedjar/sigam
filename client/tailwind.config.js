/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
  "./pages/**/*.{js,ts,jsx,tsx}",
  "./components/**/*.{js,ts,jsx,tsx}",
   "./src/**/*.{js,jsx,ts,tsx}",
],
 theme: {
    extend: {
      colors: {
        indigo: {
          600: '#4f46e5',
        },
        emerald: {
          600: '#059669',
        }
      },
    },
  },
  plugins: [],
}
