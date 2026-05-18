import type { Config } from 'tailwindcss'

// Règles couleur sémantique Sahel Sun (P23 — NE PAS VIOLER) :
//   bg-primary   → text-text   (jamais text-white : ratio 2.9:1 fail)
//   bg-warn      → text-text   (7.24:1 AAA ✓)
//   bg-success   → text-text   (4.84:1 AA ✓, jamais text-white)
//   bg-error     → text-white  (5.21:1 AA ✓, seul cas blanc autorisé)
//   text-primary → interdit en body, réservé badges/titres >24px bold

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg:           'hsl(var(--bg))',
        surface:      'hsl(var(--surface))',
        'surface-2':  'hsl(var(--surface-2))',
        border:       'hsl(var(--border))',
        'border-2':   'hsl(var(--border-2))',
        text:         'hsl(var(--text))',
        muted:        'hsl(var(--muted))',
        'muted-2':    'hsl(var(--muted-2))',
        primary:      'hsl(var(--primary))',
        'primary-h':  'hsl(var(--primary-h))',
        'primary-soft':'hsl(var(--primary-soft))',
        warn:         'hsl(var(--warn))',
        'warn-soft':  'hsl(var(--warn-soft))',
        success:      'hsl(var(--success))',
        'success-soft':'hsl(var(--success-soft))',
        error:        'hsl(var(--error))',
        'error-soft': 'hsl(var(--error-soft))',
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
      },
      boxShadow: {
        1: 'var(--shadow-1)',
        2: 'var(--shadow-2)',
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
        md: 'var(--radius)',
      },
      fontSize: {
        '2xs': ['11px', { lineHeight: '1.4' }],
      },
    },
  },
  plugins: [],
}

export default config
