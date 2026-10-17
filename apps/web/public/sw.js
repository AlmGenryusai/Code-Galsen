// Service worker Code Galsen — écrit à la main, sans dépendance.
// Enregistré en /sw.js?v=<BUILD_ID> (components/RegisterServiceWorker.tsx) :
// URL différente à chaque déploiement → nouvelle installation, ancien cache purgé.

const VERSION = new URL(self.location.href).searchParams.get('v') || 'dev'
const CACHE = 'galsen-' + VERSION

// Les 5 écrans : obligatoires, sinon l'installation échoue
const PAGES = ['/', '/quiz', '/examen', '/carnet', '/profil']
const EXTRA = ['/manifest.json', '/icons/icon-192.png', '/icons/icon-512.png', '/icons/maskable-512.png']

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

async function networkFirstPage(request) {
  const url = new URL(request.url)
  try {
    const res = await fetch(request)
    if (res.ok) {
      const cache = await caches.open(CACHE)
      cache.put(url.pathname, res.clone())
    }
    return res
  } catch (err) {
    // ignoreSearch : /quiz?mode=erreurs → /quiz
    const cached = await caches.match(url.pathname, { ignoreSearch: true })
    if (cached) return cached
    throw err
  }
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
    event.respondWith(networkFirstPage(request))
  } else if (url.pathname.startsWith('/_next/static/') || EXTRA.includes(url.pathname)) {
    event.respondWith(cacheFirst(request))
  }
})
