// DONNÉES MOCK — remplacées par Supabase + Dexie en S1.x
// Structure prête pour user_id, quiz_attempts, quiz_answers

export interface ExamAttempt {
  id: string
  date: string        // ISO 8601
  score: number       // pourcentage 0-100
  faults: number
  total: number
  passed: boolean
}

export interface WeakTheme {
  themeId: string
  label: string
  errorRate: number         // 0.0–1.0
  questionsAttempted: number
}

export interface CarnetData {
  examAttempts: ExamAttempt[]
  weakThemes: WeakTheme[]
}

export const MOCK_CARNET: CarnetData = {
  examAttempts: [
    { id: 'e1', date: '2026-05-18', score: 73, faults: 4, total: 15, passed: false },
    { id: 'e2', date: '2026-05-17', score: 60, faults: 6, total: 15, passed: false },
    { id: 'e3', date: '2026-05-15', score: 80, faults: 3, total: 15, passed: true },
  ],
  weakThemes: [
    { themeId: 'feux',      label: 'Feux et signaux',       errorRate: 0.67, questionsAttempted: 3 },
    { themeId: 'distances', label: 'Distances de sécurité', errorRate: 0.50, questionsAttempted: 4 },
    { themeId: 'vitesse',   label: 'Vitesses',              errorRate: 0.33, questionsAttempted: 6 },
  ],
}
