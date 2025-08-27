module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  safelist: [
    "bg-main",
    "bg-highlight",
    "bg-background",
    "text-main",
    "text-highlight",
  ],
  theme: {
    extend: {
      colors: {
        main: "#FEE715", // Main color
        highlight: "#FFF9C4", // Marked elements
        background: "#FFFFFF", // Background
      },
      fontFamily: {
        roboto: ["Roboto", "sans-serif"],
        sans: ["Roboto", "sans-serif"], // Make Roboto the default sans font
      },
    },
  },
  plugins: [],
};
