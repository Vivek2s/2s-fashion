import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: { ink: '#000000', muted: '#8a8a8a', line: '#eaeaea', accent: '#b8945f' },
      fontFamily: {
        serif: ['BluuNext', 'Georgia', 'serif'],
        sans: ['Sporting Grotesque', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      maxWidth: { site: '1400px' },
    },
  },
  plugins: [],
} satisfies Config;
