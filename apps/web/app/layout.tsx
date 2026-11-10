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
    // Écran de lancement iOS (sinon flash blanc au démarrage depuis l'écran d'accueil)
    startupImage: [
      { url: '/splash/640x1136.png', media: '(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)' },
      { url: '/splash/750x1334.png', media: '(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)' },
      { url: '/splash/1242x2208.png', media: '(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)' },
      { url: '/splash/1125x2436.png', media: '(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)' },
      { url: '/splash/828x1792.png', media: '(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)' },
      { url: '/splash/1242x2688.png', media: '(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)' },
      { url: '/splash/1170x2532.png', media: '(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)' },
      { url: '/splash/1284x2778.png', media: '(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)' },
      { url: '/splash/1179x2556.png', media: '(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)' },
      { url: '/splash/1290x2796.png', media: '(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)' },
    ],
  },
}

export const viewport: Viewport = {
  themeColor: '#F7F3EE',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
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
