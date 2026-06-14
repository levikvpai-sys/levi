import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Hippo Float Brand Colors
        hippo: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
          950: "#082f49",
        },
        float: {
          50: "#fdf4ff",
          100: "#fae8ff",
          200: "#f5d0fe",
          300: "#f0abfc",
          400: "#e879f9",
          500: "#d946ef",
          600: "#c026d3",
          700: "#a21caf",
          800: "#86198f",
          900: "#701a75",
          950: "#4a044e",
        },
        coral: {
          50: "#fff5f5",
          100: "#ffe3e3",
          200: "#ffcdcd",
          300: "#ffa8a8",
          400: "#ff6b6b",
          500: "#fa5252",
          600: "#f03e3e",
          700: "#c92a2a",
          800: "#a61e1e",
          900: "#7b1414",
        },
        aqua: {
          50: "#e6fcf5",
          100: "#c3fae8",
          200: "#96f2d7",
          300: "#63e6be",
          400: "#38d9a9",
          500: "#20c997",
          600: "#12b886",
          700: "#0ca678",
          800: "#099268",
          900: "#087f5b",
        },
        brand: {
          primary: "#0ea5e9",
          secondary: "#d946ef",
          accent: "#ff6b6b",
          success: "#20c997",
          warning: "#fcc419",
          dark: "#0f172a",
          darker: "#020617",
        },
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Space Grotesk", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "Space Mono", "monospace"],
        display: ["var(--font-sans)", "Space Grotesk", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "var(--radius)",
        sm: "0px",
        DEFAULT: "var(--radius)",
      },
      backgroundImage: {
        "hippo-gradient":
          "linear-gradient(135deg, #0ea5e9 0%, #d946ef 50%, #ff6b6b 100%)",
        "hippo-dark":
          "linear-gradient(135deg, #0c4a6e 0%, #701a75 50%, #7b1414 100%)",
        "card-gradient":
          "linear-gradient(145deg, rgba(14,165,233,0.1) 0%, rgba(217,70,239,0.05) 100%)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.4s ease-out",
        "slide-in": "slideIn 0.3s ease-out",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        shimmer: "shimmer 2s linear infinite",
        "spin-slow": "spin 3s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideIn: {
          "0%": { transform: "translateX(-20px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      boxShadow: {
        hippo: "0 0 30px rgba(14, 165, 233, 0.3)",
        float: "0 0 30px rgba(217, 70, 239, 0.3)",
        card: "0 4px 24px rgba(0,0,0,0.4)",
        glow: "0 0 20px rgba(14, 165, 233, 0.5), 0 0 40px rgba(217, 70, 239, 0.3)",
      },
    },
  },
  plugins: [],
};

export default config;
