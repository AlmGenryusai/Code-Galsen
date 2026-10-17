import { defineConfig } from 'vitest/config'

// tsconfig a `jsx: preserve` (Next) : Vite l'ignore et repasse en JSX classique.
export default defineConfig({
  esbuild: { jsx: 'automatic' },
})
