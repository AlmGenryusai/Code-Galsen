// Service worker Code Galsen — écrit à la main, sans dépendance.
// Enregistré en /sw.js?v=<BUILD_ID> (components/RegisterServiceWorker.tsx) :
// URL différente à chaque déploiement → nouvelle installation, ancien cache purgé.

const VERSION = new URL(self.location.href).searchParams.get('v') || 'dev'
const CACHE = 'galsen-' + VERSION

// Les écrans : obligatoires, sinon l'installation échoue
const PAGES = ['/', '/quiz', '/examen', '/carnet', '/profil', '/activer', '/fiches', '/panneaux']
const EXTRA = [
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/maskable-512.png',
  // panneaux (components/sign/signs.tsx)
  ...['a13a', 'a13b', 'a14', 'a15a1', 'a15a2', 'a15b', 'a15c', 'a16', 'a17', 'a18', 'a19', 'a1a', 'a1b', 'a1c', 'a1d', 'a20', 'a21', 'a23', 'a24', 'a2a', 'a2b', 'a3', 'a3a', 'a3b', 'a4', 'a7', 'a8', 'ab1', 'ab2', 'ab25', 'ab3a', 'ab4', 'ab6', 'ab7', 'b1', 'b10a', 'b11', 'b12', 'b13', 'b13a', 'b14-30', 'b15', 'b16', 'b18a', 'b18b', 'b18c', 'b21-1', 'b21-2', 'b21a1', 'b21a2', 'b21b', 'b21c1', 'b21c2', 'b21d1', 'b21d2', 'b21e', 'b22a', 'b22b', 'b22c', 'b25-30', 'b27a', 'b29vl', 'b2a', 'b2b', 'b2c', 'b3', 'b31', 'b33-30', 'b34', 'b34a', 'b3a', 'b40', 'b41', 'b42', 'b43-30', 'b49', 'b49vl', 'b5a', 'b5b', 'b5c', 'b6a1', 'b6b1', 'b6d', 'b7a', 'b7b', 'b8', 'b9a', 'b9b', 'b9c', 'b9f', 'b9g', 'b9h', 'c18', 'autoroute', 'fin-autoroute', 'c13a', 'c13b', 'c1a', 'ce15a', 'ce17', 'ce18'].map((id) => '/signs/' + id + '.svg'),
]

// Fichiers versionnés référencés par le HTML : balises <script>/<link> ("/_next/static/…")
// et données RSC inline (self.__next_f : "static/chunks/…", parfois échappés)
const ASSET_RE = /static\/(?:chunks|css|media)\/[A-Za-z0-9_.~\-/[\]%@]+?\.(?:js|css|woff2?|ttf|otf|png|svg|jpg|webp)/g

function assetsIn(html) {
  const found = new Set()
  for (const m of html.replace(/\\\//g, '/').matchAll(ASSET_RE)) found.add('/_next/' + m[0])
  return found
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE)
      const assets = new Set(EXTRA)
      // Pages : toutes obligatoires
      await Promise.all(
        PAGES.map(async (url) => {
          const res = await fetch(url, { cache: 'reload' })
          if (!res.ok) throw new Error('precache ' + url + ' ' + res.status)
          for (const a of assetsIn(await res.clone().text())) assets.add(a)
          await cache.put(url, res)
        }),
      )
      // Assets : un échec isolé ne bloque pas l'installation
      await Promise.allSettled([...assets].map((url) => cache.add(url)))
      await self.skipWaiting()
    })(),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(keys.filter((k) => k.startsWith('galsen-') && k !== CACHE).map((k) => caches.delete(k)))
      await self.clients.claim()
    })(),
  )
})

async function cacheFirst(request) {
  const cached = await caches.match(request)
  if (cached) return cached
  const res = await fetch(request)
  if (res.ok) {
    const cache = await caches.open(CACHE)
    cache.put(request, res.clone())
  }
  return res
}

// Réseau faible : au-delà de ce délai, la page en cache est servie si elle existe
const NETWORK_TIMEOUT_MS = 3000

async function networkFirstPage(event) {
  const url = new URL(event.request.url)
  // ignoreSearch : /quiz?mode=erreurs → /quiz
  const fromCache = () => caches.match(url.pathname, { ignoreSearch: true })

  const network = fetch(event.request).then(async (res) => {
    if (res.ok) {
      const copy = res.clone()
      const cache = await caches.open(CACHE)
      await cache.put(url.pathname, copy)
    }
    return res
  })
  // La mise à jour du cache continue même si la page en cache a déjà été servie
  event.waitUntil(network.catch(() => {}))

  const TIMEOUT = Symbol('timeout')
  const timeout = new Promise((resolve) => setTimeout(resolve, NETWORK_TIMEOUT_MS, TIMEOUT))

  try {
    const winner = await Promise.race([network, timeout])
    if (winner !== TIMEOUT) return winner
  } catch (err) {
    // hors ligne
    const cached = await fromCache()
    if (cached) return cached
    throw err
  }

  // délai dépassé : cache si présent, sinon on continue d'attendre le réseau
  return (await fromCache()) ?? network
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  // Navigation client Next (payload RSC) : réseau seulement.
  // Hors ligne, l'échec déclenche une navigation complète, servie depuis le cache.
  if (request.headers.get('RSC') === '1' || url.searchParams.has('_rsc')) return

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstPage(event))
  } else if (url.pathname.startsWith('/_next/static/') || EXTRA.includes(url.pathname)) {
    event.respondWith(cacheFirst(request))
  }
})
