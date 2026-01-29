import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
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
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        // 🌸 NOVAS CORES PARA FLORICULTURA
        floral: {
          pink: "hsl(var(--floral-pink))",
          coral: "hsl(var(--floral-coral))",
          terracota: "hsl(var(--floral-terracota))",
          peach: "hsl(var(--floral-peach))",
          cream: "hsl(var(--floral-cream))",
          sage: "hsl(var(--floral-sage))",
          lavender: "hsl(var(--floral-lavender))",
          rose: "hsl(var(--floral-rose))",
        },
        success: "hsl(var(--success))",
        warning: "hsl(var(--warning))",
        info: "hsl(var(--info))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      backgroundImage: {
        'gradient-floral': 'linear-gradient(135deg, hsl(var(--floral-pink)), hsl(var(--floral-coral)))',
        'gradient-sunset': 'linear-gradient(135deg, hsl(var(--floral-coral)), hsl(var(--floral-peach)))',
        'gradient-soft': 'linear-gradient(135deg, hsl(var(--floral-cream)), hsl(var(--floral-peach) / 0.3))',
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
