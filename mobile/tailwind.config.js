/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#0097A7",
        secondary: "#E0DFD8",
        background: "#fafaf8",
        surface: "#ffffff",
        text: "#1C1C1A",
        muted: "#9CA3AF",
      },
    },
  },
  plugins: [],
}
