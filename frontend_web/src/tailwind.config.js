/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // tous tes composants React
    "./public/index.html"         // optionnel si tu as du HTML statique
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
