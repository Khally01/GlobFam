/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'globfam-blue': '#2563EB',
        'prosperity-green': '#059669',
        'warm-gold': '#D97706',
        'mongolian-red': '#DC2626',
        'australian-teal': '#0891B2',
        'neutral-gray': '#6B7280',
        'success-light': '#10B981',
        'warning-amber': '#F59E0B',
        'error-red': '#EF4444',
        'info-blue': '#3B82F6',
      },
      backgroundImage: {
        'primary-gradient': 'linear-gradient(135deg, #2563EB, #059669)',
        'warm-gradient': 'linear-gradient(135deg, #D97706, #059669)',
        'cultural-gradient': 'linear-gradient(135deg, #DC2626, #0891B2)',
      },
      fontFamily: {
        'sans': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      animation: {
        'gentle-sway': 'gentle-sway 3s ease-in-out infinite',
        'twinkle': 'twinkle 2s ease-in-out infinite',
      },
      keyframes: {
        'gentle-sway': {
          '0%, 100%': { transform: 'translateX(0) rotate(0deg)' },
          '25%': { transform: 'translateX(2px) rotate(1deg)' },
          '75%': { transform: 'translateX(-2px) rotate(-1deg)' },
        },
        'twinkle': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.7', transform: 'scale(1.1)' },
        },
      },
    },
  },
  plugins: [],
}