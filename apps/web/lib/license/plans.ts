// Formules d'accès complet. La durée est portée par le code (colonne `duration_days`).
export interface Plan {
  months: 1 | 2 | 3
  days: 30 | 60 | 90
  price: number // FCFA
}

export const PLANS: readonly Plan[] = [
  { months: 1, days: 30, price: 2500 },
  { months: 2, days: 60, price: 3500 },
  { months: 3, days: 90, price: 4000 },
]

/** « 2 500 FCFA » avec espace insécable. */
export function formatPrice(fcfa: number): string {
  return `${String(fcfa).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} FCFA`
}

export function planLabel(p: Plan): string {
  return `${p.months} mois`
}
