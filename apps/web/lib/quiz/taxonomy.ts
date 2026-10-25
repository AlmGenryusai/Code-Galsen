// Thèmes et chapitres — source : docs/refonte/42_taxonomie.md
// Ids stables, jamais renommés ; les intitulés peuvent changer.

export interface Chapter {
  id: string
  title: string
}

export interface Theme {
  id: string
  title: string
  chapters: Chapter[]
}

export const TAXONOMY: Theme[] = [
  {
    id: 't01',
    title: 'Circuler et respecter la signalisation',
    chapters: [
      { id: 't01-c01', title: 'Panneaux et marquages' },
      { id: 't01-c02', title: 'Intersections et priorités' },
      { id: 't01-c03', title: 'Place sur la chaussée' },
      { id: 't01-c04', title: 'Vitesse' },
      { id: 't01-c05', title: 'Croiser et dépasser' },
      { id: 't01-c06', title: 'Arrêt et stationnement' },
    ],
  },
  {
    id: 't02',
    title: 'Le conducteur',
    chapters: [
      { id: 't02-c01', title: 'Regarder, anticiper, communiquer' },
      { id: 't02-c02', title: 'Être en état de conduire' },
    ],
  },
  {
    id: 't03',
    title: 'La route et ses dangers',
    chapters: [
      { id: 't03-c01', title: 'Conditions difficiles' },
      { id: 't03-c02', title: 'Autoroute à péage' },
      { id: 't03-c03', title: 'Zones à risque' },
    ],
  },
  {
    id: 't04',
    title: 'Les autres usagers',
    chapters: [
      { id: 't04-c01', title: 'Piétons' },
      { id: 't04-c02', title: 'Motos et Jakarta' },
      { id: 't04-c03', title: 'Charrettes et animaux' },
      { id: 't04-c04', title: 'Transports en commun' },
      { id: 't04-c05', title: 'Poids lourds' },
    ],
  },
  {
    id: 't05',
    title: 'Règles et papiers',
    chapters: [
      { id: 't05-c01', title: 'Documents' },
      { id: 't05-c02', title: 'Chargement et passagers' },
      { id: 't05-c03', title: 'Permis à points' },
      { id: 't05-c04', title: 'Infractions et sanctions' },
    ],
  },
  {
    id: 't06',
    title: 'Porter secours',
    chapters: [{ id: 't06-c01', title: 'Protéger, alerter, secourir' }],
  },
  {
    id: 't07',
    title: "Monter, s'installer, descendre",
    chapters: [
      { id: 't07-c01', title: "S'installer au poste de conduite" },
      { id: 't07-c02', title: 'Entrer et sortir du véhicule' },
    ],
  },
  {
    id: 't08',
    title: 'Le véhicule',
    chapters: [
      { id: 't08-c01', title: 'Fonctionnement et voyants' },
      { id: 't08-c02', title: 'Entretien, chaleur et pannes' },
    ],
  },
  {
    id: 't09',
    title: 'Sécurité des passagers',
    chapters: [
      { id: 't09-c01', title: 'Ceinture et aides à la conduite' },
      { id: 't09-c02', title: 'Passagers et enfants' },
    ],
  },
  {
    id: 't10',
    title: 'Conduite économe',
    chapters: [{ id: 't10-c01', title: 'Consommer moins, polluer moins' }],
  },
]

/** Intitulé d'un thème ; id inconnu → l'id lui-même. */
export function themeTitle(id: string): string {
  return TAXONOMY.find((t) => t.id === id)?.title ?? id
}

/** Intitulé d'un chapitre ; id inconnu → l'id lui-même. */
export function chapterTitle(id: string): string {
  for (const t of TAXONOMY) {
    const c = t.chapters.find((c) => c.id === id)
    if (c) return c.title
  }
  return id
}
