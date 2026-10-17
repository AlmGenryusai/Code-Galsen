// Code d'activation : GALS-XXXX-XXXX (ex. GALS-7K3P-9QXM)

const CODE_RE = /^GALS-[A-Z0-9]{4}-[A-Z0-9]{4}$/

/** Majuscules, caractères hors [A-Z0-9] retirés, tirets remis après 4 et 8 caractères. */
export function formatCode(input: string): string {
  const raw = input.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12)
  return [raw.slice(0, 4), raw.slice(4, 8), raw.slice(8)].filter(Boolean).join('-')
}

export function isValidCode(code: string): boolean {
  return CODE_RE.test(code)
}
