import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0066FF',
          50: '#E6F0FF',
          100: '#CCE0FF',
          500: '#0066FF',
          600: '#0052CC',
          700: '#003D99',
        },
        secondary: {
          DEFAULT: '#00D4AA',
          500: '#00D4AA',
          600: '#00A888',
        },
        dark: '#0A0F1E',
        surface: '#111827',
        muted: '#6B7280',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        lime: { DEFAULT: '#BAFF39', bright: '#C6FF00' },
        navy: { DEFAULT: '#050D1A', mid: '#0A1628', deep: '#0F2040' },
        cyan: { DEFAULT: '#00E5FF' },
        violet: { DEFAULT: '#6B48FF' },
        offwhite: '#F0F4FF',
      },
      fontFamily: {
        sans:  ['var(--font-inter)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-playfair)', 'Georgia', 'serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-gradient': 'linear-gradient(135deg, #0A0F1E 0%, #0D1B3E 50%, #0A0F1E 100%)',
      },
    },
  },
  plugins: [],
};

export default config;
