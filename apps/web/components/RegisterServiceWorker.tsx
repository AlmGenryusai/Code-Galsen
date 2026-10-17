'use client'

import { useEffect } from 'react'

/** Enregistre public/sw.js (production uniquement). ?v= change à chaque build → mise à jour du SW. */
export function RegisterServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return
    navigator.serviceWorker
      .register(`/sw.js?v=${process.env.NEXT_PUBLIC_BUILD_ID}`)
      .catch(() => {
        // pas de SW : l'app fonctionne en ligne comme avant
      })
  }, [])

  return null
}
