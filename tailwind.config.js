/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "sans-serif",
        ],
      },
      colors: {
        primary: "#1E3A8A", // Trust blue
        secondary: "#0D9488", // AI/Smart teal
        bgGray: "#F8FAFC", // Background
        cardBg: "#FFFFFF", // Card background
        textPrimary: "#0F172A", // Primary text
        textSecondary: "#475569", // Secondary text
        sidebarBg: "#0B1220", // Structural dark
      },
    },
  },
  plugins: [],
};
