'use client'

import { useEffect, useState } from 'react'
import { loadLicense, requestPersist } from './storage'
import type { License } from './license'

type LicenseState = License & { loaded: boolean }

const LOADING: LicenseState = { active: false, expiresAt: null, loaded: false }

/** Licence stockée, vérifiée hors ligne après montage. Aucune garde ne tranche avant `loaded`. */
export function useLicense(): LicenseState {
  const [state, setState] = useState<LicenseState>(LOADING)

  useEffect(() => {
    let alive = true
    loadLicense().then((l) => {
      if (l.active) requestPersist() // licences activées avant cette version
      if (alive) setState({ ...l, loaded: true })
    })
    return () => {
      alive = false
    }
  }, [])

  return state
}
