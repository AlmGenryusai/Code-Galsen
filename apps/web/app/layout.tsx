import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Code Galsen',
  description: 'Prépare ton permis de conduire au Sénégal/UEMOA',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Code Galsen',
  },
}

export const viewport: Viewport = {
  themeColor: '#0d0c0a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>
        <main>{children}</main>
      </body>
    </html>
  )
}
