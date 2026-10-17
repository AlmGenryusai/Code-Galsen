'use client'

import type { License } from './license'

// Session 9 : vérification hors ligne de la licence signée. Seul endroit à brancher.
const NO_LICENSE: License & { loaded: boolean } = { active: false, expiresAt: null, loaded: true }

export function useLicense(): License & { loaded: boolean } {
  return NO_LICENSE
}
