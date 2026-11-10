'use client'

import { useEffect } from 'react'
import { Analytics } from '@vercel/analytics/next'
import { track, trackVisit } from '@/lib/analytics/track'

/** Vercel Web Analytics (sans cookie) + visite avec source UTM + installation PWA. */
export function AnalyticsTracker() {
  useEffect(() => {
    trackVisit(window.location.search)
    const onInstalled = () => track('installation')
    window.addEventListener('appinstalled', onInstalled)
    return () => window.removeEventListener('appinstalled', onInstalled)
  }, [])

  return <Analytics />
}
