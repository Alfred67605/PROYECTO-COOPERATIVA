/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mining: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617', // Obsidian Black - Core Background
        },
        obsidian: {
          900: '#0B0F19',
          800: '#151B2B',
          700: '#1E2638',
        },
        copper: {
          50: '#fffbeb', // Warm glow amber-50
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#ea7740', // Core Brand Copper
          600: '#d97706', // Rich Gold Accent
          700: '#b45309', // Deep Bronze
          800: '#92400e', // Dark Bronze / Earth
          900: '#78350f', // Burnt Iron Ore
          950: '#451a03',
        },
        teal: {
          400: '#2DD4BF', // Data/Precision accent
          500: '#14B8A6',
          600: '#0D9488',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['Outfit', 'Inter', 'sans-serif'], // For big numbers and headers
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'spin-slow': 'spin 12s linear infinite',
        'gradient-shift': 'gradientShift 8s ease infinite',
        'grid-scroll': 'gridScroll 20s linear infinite',
        'border-beam': 'borderBeam 4s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        gridScroll: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(24px)' },
        },
        borderBeam: {
          '100%': { offsetDistance: '100%' },
        }
      },
      boxShadow: {
        'glow-copper': '0 0 20px rgba(234, 119, 64, 0.25)',
        'glow-teal': '0 0 20px rgba(45, 212, 191, 0.25)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.4)',
        'glass-hover': '0 12px 40px rgba(0, 0, 0, 0.5)',
        'glass-inset': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'glass-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
      },
    },
  },
  plugins: [],
}
