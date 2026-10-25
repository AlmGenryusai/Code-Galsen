import { DashboardView } from '@/components/dashboard/DashboardView'
import { getQuestions, getThemes } from '@/lib/quiz/questions'
import { themeTitle } from '@/lib/quiz/taxonomy'

const THEME_COLORS = ['#c94b30', '#a03820', '#f5b033', '#4a6741', '#3a5a8a']

// Progression et examens : calculés dans DashboardView via useProgress.
export default function DashboardPage() {
  return (
    <DashboardView
      data={{
        themes: getThemes().map(({ theme, count }, i) => ({
          id: theme,
          icon: themeTitle(theme)[0],
          color: THEME_COLORS[i % THEME_COLORS.length],
          title: themeTitle(theme),
          questionsTotal: count,
        })),
      }}
      questions={getQuestions().map(({ id, theme }) => ({ id, theme }))}
    />
  )
}
