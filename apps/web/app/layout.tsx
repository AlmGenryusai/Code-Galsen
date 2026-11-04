import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import { RegisterServiceWorker } from '@/components/RegisterServiceWorker'
import './globals.css'

// P12: polices auto-hébergées (variables, subset latin), display swap — pas d'appel Google Fonts au build
const sans = localFont({
  src: './fonts/plus-jakarta-sans-latin.woff2',
  weight: '400 800',
  variable: '--font-sans',
  display: 'swap',
})

const mono = localFont({
  src: './fonts/jetbrains-mono-latin.woff2',
  weight: '500 600',
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Code Galsen',
  description: 'Prépare ton permis de conduire au Sénégal/UEMOA',
  manifest: '/manifest.json',
  icons: { apple: '/icons/apple-touch-icon.png' },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Code Galsen',
  },
}

export const viewport: Viewport = {
  themeColor: '#F7F3EE',
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
    <html lang="fr" className={`${sans.variable} ${mono.variable}`}>
      <body>
        <main>{children}</main>
        <RegisterServiceWorker />
      </body>
    </html>
  )
}
