import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0A1525",
        steel: "#14253A",
        sky: "#00A3FF",
        aqua: "#00D0B4",
        ember: "#FF6A3D",
        panel: "#F3F7FC"
      },
      fontFamily: {
        sans: ["'Public Sans'", "'Segoe UI'", "sans-serif"],
        display: ["'Sora'", "'Public Sans'", "sans-serif"]
      },
      boxShadow: {
        panel: "0 14px 36px -22px rgba(12, 29, 50, 0.38)",
        focus: "0 0 0 3px rgba(0, 163, 255, 0.3)"
      },
      backgroundImage: {
        "telecom-grid": "linear-gradient(rgba(10, 21, 37, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(10, 21, 37, 0.08) 1px, transparent 1px)"
      },
      keyframes: {
        rise: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "demo-glow": {
          "0%, 100%": { opacity: "0.55", filter: "blur(0px)" },
          "50%": { opacity: "1", filter: "blur(0.2px)" }
        },
        "demo-scan": {
          "0%": { transform: "translateX(-110%)" },
          "100%": { transform: "translateX(110%)" }
        }
      },
      animation: {
        rise: "rise 450ms ease-out both",
        "demo-glow": "demo-glow 2.2s ease-in-out infinite",
        "demo-scan": "demo-scan 2.8s ease-in-out infinite"
      }
    }
  },
  plugins: []
};

export default config;
