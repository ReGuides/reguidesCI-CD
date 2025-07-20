/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    'bg-purple-600',
    'border-purple-500',
    'bg-yellow-600',
    'border-yellow-500',
    'shadow-lg',
    'bg-neutral-800',
    'border-neutral-700',
    'text-white',
    'hover:bg-neutral-700',
    'bg-red-500',
    'border-red-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-green-600',
    'bg-cyan-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-neutral-700',
    'border-neutral-600',
    'text-yellow-400',
    'text-purple-500',
    'text-purple-600',
    'text-neutral-400',
    'text-neutral-300',
    'text-neutral-600',
    'text-neutral-700',
    'text-neutral-800',
    'text-neutral-900',
  ],
  theme: {
    extend: {
      colors: {
        // Основные цвета как в старом проекте
        'header': '#1f1f23',
        'text': '#f8f4ff',
        'text-secondary': '#a1a1aa',
        'accent': '#a21caf',
        'accent-dark': '#ec4899',
        'highlight': '#f8f4ff',
        'neutral': {
          700: '#374151',
          800: '#1f2937',
        },
        'card': '#1f1f23',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
      },
      keyframes: {
        'fade-in': {
          '0%': {
            opacity: '0',
            transform: 'translateY(-10px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
      },
    },
  },
  plugins: [],
} 