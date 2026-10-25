import { DashboardView } from '@/components/dashboard/DashboardView'
import { getQuestions, getThemes } from '@/lib/quiz/questions'
import { themeTitle } from '@/lib/quiz/taxonomy'

// Progression et examens : calculés dans DashboardView via useProgress.
export default function DashboardPage() {
  return (
    <DashboardView
      data={{
        themes: getThemes().map(({ theme, count }) => ({
          id: theme,
          title: themeTitle(theme),
          questionsTotal: count,
        })),
      }}
      questions={getQuestions().map(({ id, theme }) => ({ id, theme }))}
    />
  )
}
