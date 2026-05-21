import type { Config } from 'tailwindcss'
import animate from 'tailwindcss-animate'

const config: Config = {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0C1426',
        'primary-light': '#1A2540',
        accent: '#E63946',
        'accent-hover': '#C1121F',
        'accent-soft': '#FEE2E2',
        gold: '#F4A261',
        'gold-soft': '#FEF3C7',
        bg: '#F5F7FA',
        card: '#FFFFFF',
        'card-hover': '#FAFBFF',
        'text-main': '#0C1426',
        'text-secondary': '#4A5568',
        muted: '#718096',
        border: '#E8ECF0',
        'border-strong': '#CBD5E0',
        success: '#0D9488',
        warning: '#D97706',
        danger: '#E63946',
        info: '#3B82F6',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      borderRadius: {
        lg: '0.5rem',
        md: '0.375rem',
        sm: '0.25rem',
      },
    },
  },
  plugins: [animate],
}

export default config
