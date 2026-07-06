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
        // Smart Medical Ventures (SMV) Brand Colors — navy / blue scale
        smv: {
          50: "#eef2f8",
          100: "#d5e0ee",
          200: "#adc2db",
          300: "#7e9cc2",
          400: "#4f74a3",
          500: "#244a77",
          600: "#1a3a63",
          700: "#112b4b",
          800: "#0b1b32",
          900: "#07111f",
          950: "#040a13",
        },
        // SMV violet -> purple accent
        smvviolet: {
          50: "#f1ecfa",
          100: "#e0d3f2",
          200: "#c3a9e4",
          300: "#9f78ce",
          400: "#7046a2",
          500: "#4f2790",
          600: "#34147a",
          700: "#2a105f",
          800: "#1f0c47",
          900: "#150830",
          950: "#0d051d",
        },
        // SMV crimson / magenta (used for errors and deep accents)
        smvcrimson: {
          50: "#fce8ee",
          100: "#f7c4d3",
          200: "#ee8ca7",
          300: "#e15577",
          400: "#c8265f",
          500: "#a00f3d",
          600: "#850a33",
          700: "#680827",
          800: "#4c061d",
          900: "#320413",
        },
        // SMV green (used for success / approved / completed)
        smvgreen: {
          50: "#e7f6f1",
          100: "#c2e9dd",
          200: "#8fd7c3",
          300: "#57bfa5",
          400: "#2ba187",
          500: "#16856b",
          600: "#116b57",
          700: "#0d5344",
          800: "#093c31",
          900: "#062a22",
        },
        // SMV gold accent / eyebrow
        smvgold: {
          50: "#fbf5e8",
          100: "#f4e6c3",
          200: "#ecd396",
          300: "#e1b967",
          400: "#d0a64f",
          500: "#c7983d",
          600: "#a67e30",
          700: "#836324",
          800: "#5f481a",
          900: "#3f3011",
        },
        brand: {
          primary: "#244a77",
          secondary: "#34147a",
          accent: "#b11872",
          success: "#16856b",
          warning: "#c7983d",
          dark: "#0b1b32",
          darker: "#07111f",
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
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
        display: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "var(--radius)",
        sm: "0px",
        DEFAULT: "var(--radius)",
      },
      backgroundImage: {
        "smv-gradient":
          "linear-gradient(135deg, #34147A 0%, #7046A2 45%, #B11872 78%, #A00F3D 100%)",
        "smv-dark":
          "linear-gradient(135deg, #07111F 0%, #0B1B32 50%, #112B4B 100%)",
        "card-gradient":
          "linear-gradient(145deg, rgba(52,20,122,0.10) 0%, rgba(177,24,114,0.05) 100%)",
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
        smv: "0 0 30px rgba(36, 74, 119, 0.3)",
        "smv-violet": "0 0 30px rgba(112, 70, 162, 0.3)",
        card: "0 4px 24px rgba(0,0,0,0.4)",
        glow: "0 0 20px rgba(36, 74, 119, 0.5), 0 0 40px rgba(177, 24, 114, 0.3)",
      },
    },
  },
  plugins: [],
};

export default config;
