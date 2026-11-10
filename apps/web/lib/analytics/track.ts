import { track as vercelTrack } from '@vercel/analytics'

// Funnel GTM §9 : 8 événements, 2 propriétés max chacun (limite Vercel Pro).
export type FunnelEvent =
  | 'visite'
  | 'quiz_debut'
  | 'serie_finie'
  | 'examen_fini'
  | 'clic_acheter'
  | 'partage_score'
  | 'activation_ok'
  | 'installation'

type Props = Record<string, string | number | boolean>

const UTM_KEY = 'cg-utm.v1'
const VISIT_KEY = 'cg-visite'

export interface Utm {
  source: string
  campagne: string
}

const DIRECT: Utm = { source: 'direct', campagne: '' }

/** Première source connue (first-touch), conservée sur l'appareil pour attribuer achat et activation. */
export function readUtm(): Utm {
  try {
    const raw = localStorage.getItem(UTM_KEY)
    if (raw) return { ...DIRECT, ...(JSON.parse(raw) as Partial<Utm>) }
  } catch {
    // stockage indisponible ou valeur corrompue
  }
  return DIRECT
}

/** Lit utm_source / utm_campaign de l'URL et les garde si aucune source n'est encore enregistrée. */
export function captureUtm(search: string): Utm {
  const params = new URLSearchParams(search)
  const source = params.get('utm_source')?.slice(0, 40)
  const stored = readUtm()
  if (!source || stored !== DIRECT) return stored
  const utm: Utm = { source, campagne: params.get('utm_campaign')?.slice(0, 40) ?? '' }
  try {
    localStorage.setItem(UTM_KEY, JSON.stringify(utm))
  } catch {
    // ignoré
  }
  return utm
}

export function track(name: FunnelEvent, props?: Props) {
  try {
    vercelTrack(name, props)
  } catch {
    // la mesure ne doit jamais casser l'app
  }
}

/** Une « visite » par session d'onglet, avec sa source. */
export function trackVisit(search: string) {
  const utm = captureUtm(search)
  try {
    if (sessionStorage.getItem(VISIT_KEY)) return
    sessionStorage.setItem(VISIT_KEY, '1')
  } catch {
    // sans sessionStorage : on compte quand même
  }
  track('visite', { source: utm.source, campagne: utm.campagne })
}

/** Lien de partage avec UTM, pour retrouver les visites venues d'un partage. */
export function shareUrl(origin: string, campaign: string): string {
  return `${origin}/?utm_source=whatsapp&utm_medium=partage&utm_campaign=${campaign}`
}

/** Message WhatsApp « Partager mon score » (wording : préparation, jamais garantie). */
export function scoreShareText(correct: number, total: number, origin: string): string {
  return `J'ai eu ${correct}/${total} à mon examen blanc du code de la route sur Code Galsen. Et toi, tu fais combien ? ${shareUrl(origin, 'score')}`
}
