/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "#070B14",
          secondary: "#0D1320",
          tertiary: "#111827",
        },
        surface: {
          card: "#111827",
          cardHover: "#172033",
          border: "rgba(148, 163, 184, 0.12)",
        },
        accent: {
          primary: "#6366F1",
          secondary: "#8B5CF6",
        },
        status: {
          success: "#22C55E",
          warning: "#F59E0B",
          critical: "#EF4444",
          info: "#38BDF8",
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
