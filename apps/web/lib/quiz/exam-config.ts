export const EXAM_CONFIG = {
  questionCount: 40, // confirmé par Alfred le 2026-11-04 (examen du Sénégal)
  timerSeconds: 30, // confirmé par Alfred le 2026-11-06 (20 s trop court avec photo ou double question)
  maxFaults: 5,
  passThresholdPct: 80,
} as const
