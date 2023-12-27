/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      keyframes: {
        ["highlighted-fade"]: {
          "0%": {
            backgroundColor: "rgba(251, 242, 212, 1)",
          },
          "100%": {
            backgroundColor: "rgba(0, 0, 0, 0)",
          },
        },
      },
      animation: {
        ["highlighted-fade"]: "highlighted-fade 1s ease-out",
      },
    },
  },
  plugins: [],
}
