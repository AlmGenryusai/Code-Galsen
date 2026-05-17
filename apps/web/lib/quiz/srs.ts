/**
 * srs.ts — Algorithme de répétition espacée (SuperMemo-2 simplifié)
 *
 * Destination repo : apps/web/lib/quiz/srs.ts
 *
 * Principe :
 *  - Chaque question fautive entre dans la file `srs_queue` (IndexedDB Dexie).
 *  - À chaque révision, l'utilisateur évalue implicitement sa réponse (bonne / fausse).
 *  - L'intervalle avant prochaine révision croît si bonne réponse (x ease_factor),
 *    se réinitialise à 1 jour si mauvaise.
 *
 * Différences vs SM-2 original :
 *  - Pas de note 0-5 ; binaire bon/mauvais (UX plus simple).
 *  - ease_factor borné [1.3, 2.8] pour éviter dérive extrêmes.
 *  - Seuil de "graduation" : 3 réussites consécutives → retirer de la file.
 */

export interface SrsState {
  questionId: number;
  nextReviewAt: string;       // ISO 8601
  intervalDays: number;
  easeFactor: number;
  failCount: number;
  successStreak: number;      // ajouté pour graduation
  lastReviewedAt: string | null;
}

export interface SrsConfig {
  minEase: number;
  maxEase: number;
  initialInterval: number;    // jours après 1ère erreur
  initialEase: number;
  easeIncrement: number;      // ajout à ease_factor sur succès
  easeDecrement: number;      // retrait sur échec
  graduationStreak: number;   // succès consécutifs pour sortie de file
}

export const DEFAULT_SRS_CONFIG: SrsConfig = {
  minEase: 1.3,
  maxEase: 2.8,
  initialInterval: 1,
  initialEase: 2.5,
  easeIncrement: 0.10,
  easeDecrement: 0.20,
  graduationStreak: 3,
};

/**
 * Crée une nouvelle entrée SRS pour une question fautive.
 * Appelé après la première erreur sur une question.
 */
export function initSrs(
  questionId: number,
  config: SrsConfig = DEFAULT_SRS_CONFIG,
  now: Date = new Date(),
): SrsState {
  return {
    questionId,
    nextReviewAt: addDays(now, config.initialInterval).toISOString(),
    intervalDays: config.initialInterval,
    easeFactor: config.initialEase,
    failCount: 1,
    successStreak: 0,
    lastReviewedAt: null,
  };
}

/**
 * Met à jour l'état SRS après une révision.
 * Retourne null si la question est "graduée" (à supprimer de la file).
 */
export function review(
  state: SrsState,
  passed: boolean,
  config: SrsConfig = DEFAULT_SRS_CONFIG,
  now: Date = new Date(),
): SrsState | null {
  const nowIso = now.toISOString();

  if (passed) {
    const newStreak = state.successStreak + 1;

    // Graduation : retirer de la file SRS
    if (newStreak >= config.graduationStreak) {
      return null;
    }

    const newEase = clamp(
      state.easeFactor + config.easeIncrement,
      config.minEase,
      config.maxEase,
    );
    const newInterval = Math.round(state.intervalDays * newEase);

    return {
      ...state,
      intervalDays: newInterval,
      easeFactor: newEase,
      successStreak: newStreak,
      lastReviewedAt: nowIso,
      nextReviewAt: addDays(now, newInterval).toISOString(),
    };
  }

  // Échec : reset interval, baisse ease, reset streak
  const newEase = clamp(
    state.easeFactor - config.easeDecrement,
    config.minEase,
    config.maxEase,
  );

  return {
    ...state,
    intervalDays: config.initialInterval,
    easeFactor: newEase,
    failCount: state.failCount + 1,
    successStreak: 0,
    lastReviewedAt: nowIso,
    nextReviewAt: addDays(now, config.initialInterval).toISOString(),
  };
}

/**
 * Sélectionne les N prochaines questions à réviser.
 * Tri : par nextReviewAt asc, puis failCount desc (priorité aux questions ratées le plus).
 */
export function pickDue(
  states: SrsState[],
  limit: number,
  now: Date = new Date(),
): SrsState[] {
  const nowMs = now.getTime();
  return states
    .filter(s => new Date(s.nextReviewAt).getTime() <= nowMs)
    .sort((a, b) => {
      const ta = new Date(a.nextReviewAt).getTime();
      const tb = new Date(b.nextReviewAt).getTime();
      if (ta !== tb) return ta - tb;
      return b.failCount - a.failCount;
    })
    .slice(0, limit);
}

/** Renvoie le nombre de questions dues à l'instant T (badge UI). */
export function countDue(states: SrsState[], now: Date = new Date()): number {
  const nowMs = now.getTime();
  return states.filter(s => new Date(s.nextReviewAt).getTime() <= nowMs).length;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function addDays(d: Date, days: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + days);
  return r;
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}
