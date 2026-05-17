import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0d0c0a',
        surface: '#1a1815',
        surface2: '#242018',
        terra: '#c94b30',
        'terra-deep': '#a03820',
        amber: '#f5b033',
        cream: '#f4ede3',
      },
      fontFamily: {
        serif: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderColor: {
        stroke: 'rgba(244,237,227,0.12)',
      },
    },
  },
  plugins: [],
}

export default config
