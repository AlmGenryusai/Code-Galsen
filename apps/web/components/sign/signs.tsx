// Panneaux routiers. `file` : SVG Wikimedia nettoyé dans public/signs/ (précaché par sw.js).
// Sans `file` : dessin inline provisoire, repère viewBox 0 0 100 100, à vérifier par un moniteur.

import type { ReactElement } from 'react'

const RED = '#C1121F'
const BLUE = '#0B4EA2'
const WHITE = '#FFFFFF'
const BLACK = '#111111'

export interface SignDef {
  label: string // sens du panneau, repris en alt
  file?: string // SVG dans public/signs/ ; sinon dessin inline `draw`
  draw?: () => ReactElement
}

/** Triangle de danger (pointe en haut) : bord rouge, fond blanc. Pictogramme dans la zone y 35–78. */
function DangerTriangle({ children }: { children?: ReactElement | ReactElement[] }) {
  return (
    <g>
      <polygon points="50,8.3 96,88 4,88" fill={RED} stroke={RED} strokeWidth={6} strokeLinejoin="round" />
      <polygon points="50,24.2 82.2,80 17.8,80" fill={WHITE} />
      {children}
    </g>
  )
}

/** Voiture vue de l'arrière, centrée en x (panneau « interdiction de dépasser »). */
function CarRear({ x, color }: { x: number; color: string }) {
  return (
    <g fill={color}>
      <polygon points={`${x - 7},47 ${x + 7},47 ${x + 9.5},56 ${x - 9.5},56`} />
      <rect x={x - 11} y={55} width={22} height={13} rx={3} />
      <rect x={x - 10} y={67} width={6} height={6} rx={1} />
      <rect x={x + 4} y={67} width={6} height={6} rx={1} />
    </g>
  )
}

export const SIGNS: Record<string, SignDef> = {

  'cedez-le-passage': {
    label: 'Cédez le passage',
    draw: () => (
      <g>
        <polygon points="4,12 96,12 50,91.7" fill={RED} stroke={RED} strokeWidth={6} strokeLinejoin="round" />
        <polygon points="21.5,22.1 78.5,22.1 50,71.5" fill={WHITE} />
      </g>
    ),
  },

  'sens-interdit': {
    label: 'Sens interdit',
    draw: () => (
      <g>
        <circle cx={50} cy={50} r={47} fill={RED} />
        <rect x={18} y={41} width={64} height={18} fill={WHITE} />
      </g>
    ),
  },

  'interdiction-depasser': {
    label: 'Interdiction de dépasser',
    draw: () => (
      <g>
        <circle cx={50} cy={50} r={41.5} fill={WHITE} stroke={RED} strokeWidth={9} />
        <CarRear x={37} color={RED} />
        <CarRear x={63} color={BLACK} />
      </g>
    ),
  },

  'stationnement-interdit': {
    label: 'Stationnement interdit',
    draw: () => (
      <g>
        <circle cx={50} cy={50} r={43} fill={BLUE} stroke={RED} strokeWidth={8} />
        <line x1={22.4} y1={22.4} x2={77.6} y2={77.6} stroke={RED} strokeWidth={8} />
      </g>
    ),
  },

  danger: {
    label: 'Autre danger',
    draw: () => (
      <DangerTriangle>
        <polygon points="45.5,38 54.5,38 52.5,64 47.5,64" fill={BLACK} />
        <circle cx={50} cy={71.5} r={4.5} fill={BLACK} />
      </DangerTriangle>
    ),
  },

  'passage-pietons': {
    label: 'Passage pour piétons',
    draw: () => (
      <DangerTriangle>
        <circle cx={52} cy={40} r={4} fill={BLACK} />
        <g stroke={BLACK} strokeWidth={4.5} strokeLinecap="round" fill="none">
          <path d="M51,46 L48,60" />
          <path d="M48,60 L42,71 M48,60 L56,70" />
          <path d="M50,50 L43,56 M50,50 L57,55" />
        </g>
        <g fill={BLACK}>
          <rect x={34} y={74} width={4} height={4} />
          <rect x={41} y={74} width={4} height={4} />
          <rect x={48} y={74} width={4} height={4} />
          <rect x={55} y={74} width={4} height={4} />
          <rect x={62} y={74} width={4} height={4} />
        </g>
      </DangerTriangle>
    ),
  },

  // Panneaux en fichier SVG
  stop: { label: 'Stop', file: 'ab4' },
  'route-prioritaire': { label: 'Route à caractère prioritaire', file: 'ab6' },
  'priorite-droite': { label: 'Intersection avec priorité à droite', file: 'ab1' },
  'sens-giratoire': { label: 'Carrefour à sens giratoire', file: 'ab25' },
  ab2: { label: 'Intersection avec une route prioritaire', file: 'ab2' },
  ab7: { label: 'Fin de route à caractère prioritaire', file: 'ab7' },
  b15: { label: 'Priorité au sens inverse : cédez le passage aux véhicules venant en face', file: 'b15' },
  c18: { label: 'Priorité par rapport au sens inverse', file: 'c18' },
  'b21-1': { label: 'Direction obligatoire : à droite', file: 'b21-1' },
  'b21-2': { label: 'Direction obligatoire : à gauche', file: 'b21-2' },
  b21a1: { label: 'Contournement obligatoire par la droite', file: 'b21a1' },
  b21a2: { label: 'Contournement obligatoire par la gauche', file: 'b21a2' },
  b21b: { label: 'Direction obligatoire : tout droit', file: 'b21b' },
  b21c1: { label: 'Direction obligatoire : tourner à droite', file: 'b21c1' },
  b21c2: { label: 'Direction obligatoire : tourner à gauche', file: 'b21c2' },
  b22a: { label: 'Piste ou bande cyclable obligatoire', file: 'b22a' },
  b22b: { label: 'Chemin obligatoire pour piétons', file: 'b22b' },
  'b25-30': { label: 'Vitesse minimale obligatoire : 30', file: 'b25-30' },
  b27a: { label: 'Voie réservée aux autobus', file: 'b27a' },
  b40: { label: 'Fin de piste ou bande cyclable obligatoire', file: 'b40' },
  b41: { label: 'Fin de chemin obligatoire pour piétons', file: 'b41' },
  b42: { label: 'Fin de chemin obligatoire pour cavaliers', file: 'b42' },
}
