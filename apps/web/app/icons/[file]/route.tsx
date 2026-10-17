import { ImageResponse } from 'next/og'

// Icônes PWA générées au build (fichiers statiques), référencées par public/manifest.json
export const dynamic = 'force-static'

const ICONS = {
  'icon-192.png': { size: 192, maskable: false },
  'icon-512.png': { size: 512, maskable: false },
  'maskable-512.png': { size: 512, maskable: true },
} as const

type IconFile = keyof typeof ICONS

export function generateStaticParams() {
  return Object.keys(ICONS).map((file) => ({ file }))
}

export function GET(_req: Request, { params }: { params: { file: string } }) {
  const icon = ICONS[params.file as IconFile]
  if (!icon) return new Response('Not found', { status: 404 })
  const { size, maskable } = icon

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#EA6A12', // --primary
          // maskable : fond plein (le système découpe) ; any : coins arrondis
          borderRadius: maskable ? 0 : size * 0.22,
          color: '#FFFDF9', // --surface
          fontSize: size * (maskable ? 0.32 : 0.42), // maskable : lettres dans la zone sûre
          fontWeight: 700,
          letterSpacing: -size * 0.01,
        }}
      >
        CG
      </div>
    ),
    { width: size, height: size },
  )
}
