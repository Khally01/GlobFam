/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    '../../packages/ui/**/*.{ts,tsx}',
  ],
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
        // GlobFam Brand Colors
        globfam: {
          purple: '#635bff',
          'deep-blue': '#0a2540',
          slate: '#425466',
          steel: '#6b7c93',
          success: '#00d924',
          alert: '#ff5722',
          cloud: '#f6f9fc',
          border: '#e6ebf1',
        },
        // Existing theme colors
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#635bff",
          foreground: "#ffffff",
          50: '#f3f1ff',
          100: '#ebe5ff',
          200: '#d9ceff',
          300: '#bea6ff',
          400: '#9f75ff',
          500: '#635bff',
          600: '#5851db',
          700: '#4c46b6',
          800: '#403b92',
          900: '#342e75',
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
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['SF Mono', 'Monaco', 'Courier New', 'monospace'],
      },
      fontSize: {
        'brand-h1': '3.5rem',
        'brand-h2': '2.5rem',
        'brand-h3': '1.75rem',
        'brand-h4': '1.25rem',
        'brand-body': '1.1rem',
        'brand-caption': '0.9rem',
      },
      letterSpacing: {
        'brand-tight': '-0.02em',
        'brand-normal': '-0.01em',
      },
      spacing: {
        'brand-xs': '8px',
        'brand-sm': '16px',
        'brand-md': '24px',
        'brand-lg': '32px',
        'brand-xl': '48px',
        'brand-2xl': '64px',
        'brand-3xl': '96px',
      },
      borderRadius: {
        'brand-sm': '4px',
        'brand-md': '8px',
        'brand-lg': '12px',
        'brand-xl': '16px',
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        'brand-sm': '0 1px 2px rgba(0, 0, 0, 0.05)',
        'brand-md': '0 4px 6px rgba(0, 0, 0, 0.05)',
        'brand-lg': '0 10px 15px rgba(0, 0, 0, 0.1)',
        'brand-xl': '0 20px 25px rgba(0, 0, 0, 0.1)',
        'brand-purple': '0 12px 24px rgba(99, 91, 255, 0.1)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #635bff, #7c3aed)',
        'primary-gradient': 'linear-gradient(135deg, #635bff 0%, #7c3aed 30%, #0ea5e9 100%)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}