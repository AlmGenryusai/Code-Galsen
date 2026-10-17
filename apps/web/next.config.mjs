import { execSync } from 'node:child_process'

// Identifiant de build : versionne le cache du service worker (public/sw.js?v=…).
// Déterministe (commit) : la config est évaluée dans plusieurs processus pendant le build.
function commitId() {
  if (process.env.VERCEL_GIT_COMMIT_SHA) return process.env.VERCEL_GIT_COMMIT_SHA
  try {
    return execSync('git rev-parse HEAD').toString().trim()
  } catch {
    return 'dev'
  }
}

const BUILD_ID = commitId()

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  generateBuildId: () => BUILD_ID,
  env: { NEXT_PUBLIC_BUILD_ID: BUILD_ID },
}

export default config
