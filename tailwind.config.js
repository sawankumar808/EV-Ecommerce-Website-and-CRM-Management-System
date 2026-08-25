/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0B1512",
          soft: "#13221D",
          border: "#1E332B",
        },
        surface: "#F5F7F3",
        volt: {
          DEFAULT: "#B6FF3C",
          dim: "#8FD62E",
        },
        emerald: {
          DEFAULT: "#1FAA59",
          dark: "#158244",
        },
        muted: "#5C6B63",
        amber: "#E3A008",
        coral: "#DC5B4A",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(11,21,18,0.06), 0 8px 24px -12px rgba(11,21,18,0.12)",
      },
      borderRadius: {
        xl2: "1.1rem",
      },
    },
  },
  plugins: [],
}
