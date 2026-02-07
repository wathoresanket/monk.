import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // Monk-specific colors
        monk: {
          parchment: "hsl(var(--monk-parchment))",
          ink: "hsl(var(--monk-ink))",
          charcoal: "hsl(var(--monk-charcoal))",
          ash: "hsl(var(--monk-ash))",
          stone: "hsl(var(--monk-stone))",
          linen: "hsl(var(--monk-linen))",
          clay: "hsl(var(--monk-clay))",
          umber: "hsl(var(--monk-umber))",
          amber: "hsl(var(--monk-amber))",
          clear: "hsl(var(--monk-clear))",
          neutral: "hsl(var(--monk-neutral))",
          scattered: "hsl(var(--monk-scattered))",
          "timer-bg": "hsl(var(--monk-timer-bg))",
          "timer-progress": "hsl(var(--monk-timer-progress))",
          "timer-glow": "hsl(var(--monk-timer-glow))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["Crimson Text", "-apple-system", "BlinkMacSystemFont", "SF Pro Text", "SF Pro Display", "system-ui", "sans-serif"],
        serif: ["Crimson Text", "serif"],
        monk: ["Crimson Text", "serif"],
      },
      transitionDuration: {
        "400": "400ms",
        "600": "600ms",
        "800": "800ms",
        "1000": "1000ms",
      },
      transitionTimingFunction: {
        "monk-ease": "cubic-bezier(0.4, 0, 0.2, 1)",
        "monk-gentle": "cubic-bezier(0.25, 0.1, 0.25, 1)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "monk-fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "monk-fade-out": {
          from: { opacity: "1", transform: "translateY(0)" },
          to: { opacity: "0", transform: "translateY(-8px)" },
        },
        "monk-scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "monk-breathe": {
          "0%, 100%": { transform: "scale(1)", opacity: "0.9" },
          "50%": { transform: "scale(1.02)", opacity: "1" },
        },
        "monk-timer-pulse": {
          "0%, 100%": { boxShadow: "0 0 0 0 hsl(var(--monk-timer-glow))" },
          "50%": { boxShadow: "0 0 20px 4px hsl(var(--monk-timer-glow))" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "monk-fade-in": "monk-fade-in 0.8s cubic-bezier(0.25, 0.1, 0.25, 1) forwards",
        "monk-fade-out": "monk-fade-out 0.6s cubic-bezier(0.25, 0.1, 0.25, 1) forwards",
        "monk-scale-in": "monk-scale-in 0.6s cubic-bezier(0.25, 0.1, 0.25, 1) forwards",
        "monk-breathe": "monk-breathe 4s ease-in-out infinite",
        "monk-timer-pulse": "monk-timer-pulse 3s ease-in-out infinite",
      },
    },
  },
  plugins: [animate],
} satisfies Config;
