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
        background: 'hsl(var(--background))',
        surface:    'hsl(var(--surface))',
        primary:    'hsl(var(--primary))',
        'primary-deep': 'hsl(var(--primary-deep))',
        amber:      'hsl(var(--amber))',
        text:       'hsl(var(--text))',
        'text-secondary': 'hsl(var(--text-secondary))',
        success:    'hsl(var(--success))',
        error:      'hsl(var(--error))',
        /* hex aliases pour composants inline-style existants */
        bg:         '#0B0A09',
        surface2:   '#252320',
        terra:      '#F97316',
        'terra-deep': '#C2410C',
        cream:      '#FAFAF9',
      },
      fontFamily: {
        serif: ['Fraunces', 'Georgia', 'serif'],
        sans:  ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono:  ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
      },
    },
  },
  plugins: [],
}

export default config
