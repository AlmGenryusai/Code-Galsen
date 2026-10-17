import { DashboardView, type DashboardData } from '@/components/dashboard/DashboardView'
import { getThemes } from '@/lib/quiz/questions'

const THEME_COLORS = ['#c94b30', '#a03820', '#f5b033', '#4a6741', '#3a5a8a']

// Données mock État B — Progression standard (S1.1)
// Remplacé par Dexie + Supabase en S1.5 / S2.1
const MOCK_DATA: DashboardData = {
  userName: 'Amadou',
  // exp = maintenant + 67 jours
  passExpiresAt: Math.floor(Date.now() / 1000) + 67 * 86_400,
  globalProgressPct: 42,
  cumulatedMinutes: 720,   // 12 h
  examBlancReussis: 4,
  srsCountDue: 12,
  examScore: 78,
  streakDays: 1,
  // Thèmes réels du JSON ; progression branchée plus tard (useProgress)
  themes: getThemes().map(({ theme, count }, i) => ({
    id: theme,
    icon: theme[0],
    color: THEME_COLORS[i % THEME_COLORS.length],
    title: theme,
    progress: 0,
    questionsTotal: count,
  })),
}

export default function DashboardPage() {
  return <DashboardView data={MOCK_DATA} />
}
