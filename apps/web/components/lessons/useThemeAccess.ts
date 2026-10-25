'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { redirectFor, type Target } from '@/lib/license/license'
import { useLicense } from '@/lib/license/use-license'

/** Même verrou que les séries du thème. true = accès autorisé ; sinon redirige (ex. /activer). */
export function useThemeAccess(theme: string): boolean {
  const router = useRouter()
  const license = useLicense()
  const target: Target = { kind: 'theme', theme }
  const redirect = license.loaded ? redirectFor(target, license) : null
  useEffect(() => {
    if (redirect) router.replace(redirect)
  }, [redirect, router])
  return license.loaded && !redirect
}
