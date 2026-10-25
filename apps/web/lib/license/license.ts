// Gratuit / payant — règles produit : CLAUDE.md §Produit
// Gratuit : 1 thème + 1 examen blanc. Payant : tout le reste.

export const FREE_THEME = 't04' // id de thème : lib/quiz/taxonomy.ts
export const ACTIVATE_HREF = '/activer'

export interface License {
  active: boolean
  expiresAt: number | null // secondes epoch ; null = aucune licence
}

export type Target =
  | { kind: 'theme'; theme: string }
  | { kind: 'all' } // /quiz sans thème
  | { kind: 'errors' } // /quiz?mode=erreurs
  | { kind: 'exam'; examsTaken: number }

export function canAccess(target: Target, license: License): boolean {
  if (license.active) return true
  switch (target.kind) {
    case 'theme':
      return target.theme === FREE_THEME
    case 'exam':
      return target.examsTaken === 0
    default:
      return false
  }
}

export function targetHref(target: Target): string {
  switch (target.kind) {
    case 'theme':
      return `/quiz?theme=${encodeURIComponent(target.theme)}`
    case 'all':
      return '/quiz'
    case 'errors':
      return '/quiz?mode=erreurs'
    case 'exam':
      return '/examen'
  }
}

/** Où renvoyer si la cible est verrouillée ; null = accès libre. */
export function redirectFor(target: Target, license: License): string | null {
  if (canAccess(target, license)) return null
  if (target.kind === 'all') return targetHref({ kind: 'theme', theme: FREE_THEME })
  return ACTIVATE_HREF
}

/** Lien à afficher : la cible, ou sa redirection si verrouillée. */
export function hrefFor(target: Target, license: License): string {
  return redirectFor(target, license) ?? targetHref(target)
}
