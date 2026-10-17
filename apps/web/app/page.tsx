import { DashboardView, type DashboardData } from '@/components/dashboard/DashboardView'
import { getQuestions, getThemes } from '@/lib/quiz/questions'

const THEME_COLORS = ['#c94b30', '#a03820', '#f5b033', '#4a6741', '#3a5a8a']

// Données encore factices (hors périmètre session 4).
// Progression, examens et thèmes : calculés dans DashboardView via useProgress.
const MOCK_DATA: Pick<DashboardData, 'userName' | 'passExpiresAt' | 'cumulatedMinutes' | 'srsCountDue' | 'streakDays'> = {
  userName: 'Amadou',
  // exp = maintenant + 67 jours
  passExpiresAt: Math.floor(Date.now() / 1000) + 67 * 86_400,
  cumulatedMinutes: 720,   // 12 h
  srsCountDue: 12,
  streakDays: 1,
}

export default function DashboardPage() {
  return (
    <DashboardView
      data={{
        ...MOCK_DATA,
        themes: getThemes().map(({ theme, count }, i) => ({
          id: theme,
          icon: theme[0],
          color: THEME_COLORS[i % THEME_COLORS.length],
          title: theme,
          questionsTotal: count,
        })),
      }}
      questions={getQuestions().map(({ id, theme }) => ({ id, theme }))}
    />
  )
}
