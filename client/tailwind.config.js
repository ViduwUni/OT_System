/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        amaranth: ['Amaranth', 'sans-serif'],
        dosis: ['Dosis', 'sans-serif']
      },
      colors: {
        primary: "#1B3A57",
        secondary: "#4A628A",
        accent: "#7AB2D3",
        text: "#F4F7FA",
        dark: "#1A1A1A",
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-5deg)' },
          '50%': { transform: 'rotate(5deg)' },
        },
      },
      animation: {
        wiggle: 'wiggle 0.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

