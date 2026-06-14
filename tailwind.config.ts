import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#030304', // near-black background
        haze: '#9aa3b2', // muted cool grey for secondary text
      },
      fontFamily: {
        // Helvetica / Neue Haas-like neutral grotesque, Inter as the web fallback.
        sans: ['var(--font-inter)', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
        jp: ['var(--font-jp)', 'var(--font-inter)', 'sans-serif'],
      },
      letterSpacing: {
        ultra: '0.4em',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
