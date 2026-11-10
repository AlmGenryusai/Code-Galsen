// Génère N codes d'activation + un SQL à coller dans le SQL Editor Supabase + un CSV de suivi.
// Usage : node scripts/generate-codes.mjs [N] [MOIS]   (N : défaut 50, max 500 ; MOIS : 1, 2 ou 3, défaut 3)
// Ne se connecte à rien.

import { randomInt } from 'node:crypto'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// Sans 0, O, 1, I, L (ambigus à la lecture / à la dictée)
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
const DEFAULT_COUNT = 50
const MAX_COUNT = 500
/** Formule → durée en jours (colonne `duration_days`). */
const DAYS_BY_MONTHS = { 1: 30, 2: 60, 3: 90 }

function randomChunk(rand) {
  let out = ''
  for (let i = 0; i < 4; i++) out += ALPHABET[rand(ALPHABET.length)]
  return out
}

/** N codes `GALS-XXXX-XXXX` distincts. `rand(max)` doit renvoyer un entier dans [0, max[. */
export function generateCodes(count, rand = (max) => randomInt(max)) {
  const codes = new Set()
  while (codes.size < count) {
    codes.add(`GALS-${randomChunk(rand)}-${randomChunk(rand)}`)
  }
  return [...codes]
}

/** SQL d'insertion pour le SQL Editor Supabase. */
export function buildSql(codes, days) {
  return (
    'insert into licenses (code, duration_days) values\n' +
    codes.map((c) => `  ('${c}', ${days})`).join(',\n') +
    '\non conflict (code) do nothing;\n'
  )
}

function pad(n) {
  return String(n).padStart(2, '0')
}

function stamp(d) {
  const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  return `${date}_${pad(d.getHours())}${pad(d.getMinutes())}`
}

function main() {
  const arg = process.argv[2]
  const count = arg === undefined ? DEFAULT_COUNT : Number(arg)
  if (!Number.isInteger(count) || count < 1 || count > MAX_COUNT) {
    console.error(`Nombre invalide : entier entre 1 et ${MAX_COUNT} (reçu : ${arg}).`)
    process.exit(1)
  }
  const months = process.argv[3] === undefined ? 3 : Number(process.argv[3])
  const days = DAYS_BY_MONTHS[months]
  if (!days) {
    console.error(`Formule invalide : 1, 2 ou 3 mois (reçu : ${process.argv[3]}).`)
    process.exit(1)
  }

  const codes = generateCodes(count)
  const dir = resolve(fileURLToPath(new URL('../codes', import.meta.url)))
  const base = join(dir, `${stamp(new Date())}_lot-${count}_${months}mois`)
  const sqlPath = `${base}.sql`
  const csvPath = `${base}.csv`

  const sql = buildSql(codes, days)
  const csv = ['code', ...codes].join('\n') + '\n'

  mkdirSync(dir, { recursive: true })
  try {
    // 'wx' : refuse d'écraser un lot existant
    writeFileSync(sqlPath, sql, { flag: 'wx' })
    writeFileSync(csvPath, csv, { flag: 'wx' })
  } catch (err) {
    if (err.code === 'EEXIST') {
      console.error(`Fichier déjà existant (${err.path}). Réessaie dans une minute.`)
      process.exit(1)
    }
    throw err
  }

  console.log(`${codes.length} codes générés (${months} mois = ${days} jours).`)
  console.log(`SQL : ${sqlPath}`)
  console.log(`CSV : ${csvPath}`)
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main()
}
