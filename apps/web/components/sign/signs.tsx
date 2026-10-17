// Panneaux routiers en SVG inline — modèles de la Convention de Vienne (utilisés au Sénégal).
// Repère commun : viewBox 0 0 100 100. Aucun chiffre (pas de limitation de vitesse).
// Chaque dessin doit être vérifié visuellement par un moniteur avant publication.

import type { ReactElement } from 'react'

const RED = '#C1121F'
const BLUE = '#0B4EA2'
const YELLOW = '#F6C700'
const WHITE = '#FFFFFF'
const BLACK = '#111111'
const EDGE = '#9CA3AF' // liseré fin pour détacher le blanc du fond

export interface SignDef {
  label: string
  draw: () => ReactElement
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

/** Un tiers du sens giratoire : arc tournant dans le sens inverse des aiguilles d'une montre + pointe. */
function RoundaboutArrow({ rotate }: { rotate: number }) {
  return (
    <g transform={`rotate(${rotate} 50 62)`}>
      <path d="M60.34,58.24 A11,11 0 0 0 50,51" fill="none" stroke={BLACK} strokeWidth={4} />
      <polygon points="44.5,51 50,47.5 50,54.5" fill={BLACK} />
    </g>
  )
}

export const SIGNS: Record<string, SignDef> = {
  stop: {
    label: 'Stop',
    draw: () => (
      <g>
        <polygon
          points="31.63,5.65 68.37,5.65 94.35,31.63 94.35,68.37 68.37,94.35 31.63,94.35 5.65,68.37 5.65,31.63"
          fill={WHITE}
          stroke={EDGE}
          strokeWidth={0.75}
        />
        <polygon
          points="33.16,9.35 66.84,9.35 90.65,33.16 90.65,66.84 66.84,90.65 33.16,90.65 9.35,66.84 9.35,33.16"
          fill={RED}
        />
        <text
          x={50}
          y={59.5}
          textAnchor="middle"
          fill={WHITE}
          fontSize={26}
          fontWeight={700}
          fontFamily="Arial, Helvetica, sans-serif"
        >
          STOP
        </text>
      </g>
    ),
  },

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

  'priorite-droite': {
    label: 'Intersection avec priorité à droite',
    draw: () => (
      <DangerTriangle>
        <path d="M41,48 L59,74 M59,48 L41,74" stroke={BLACK} strokeWidth={7} />
      </DangerTriangle>
    ),
  },

  'route-prioritaire': {
    label: 'Route à caractère prioritaire',
    draw: () => (
      <g>
        <polygon points="50,3 97,50 50,97 3,50" fill={WHITE} stroke={EDGE} strokeWidth={0.75} />
        <polygon points="50,18 82,50 50,82 18,50" fill={YELLOW} />
      </g>
    ),
  },

  'sens-giratoire': {
    label: 'Carrefour à sens giratoire',
    draw: () => (
      <DangerTriangle>
        <RoundaboutArrow rotate={0} />
        <RoundaboutArrow rotate={120} />
        <RoundaboutArrow rotate={240} />
      </DangerTriangle>
    ),
  },
}
