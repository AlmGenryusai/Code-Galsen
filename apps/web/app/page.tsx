import { DashboardView, type DashboardData } from '@/components/dashboard/DashboardView'

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
  themes: [
    { id: 'signalisation', icon: 'S', color: '#c94b30', title: 'Signalisation routière', progress: 68, questionsTotal: 120 },
    { id: 'priorites',     icon: 'P', color: '#a03820', title: 'Priorités et intersections', progress: 42, questionsTotal: 80  },
    { id: 'vitesse',       icon: 'V', color: '#f5b033', title: 'Vitesse et distances',       progress: 55, questionsTotal: 60  },
    { id: 'alcool',        icon: 'A', color: '#4a6741', title: 'Alcool, drogues, médicaments', progress: 20, questionsTotal: 45 },
    { id: 'mecanique',     icon: 'M', color: '#3a5a8a', title: 'Mécanique et sécurité',      progress: 10, questionsTotal: 90  },
  ],
}

export default function DashboardPage() {
  return <DashboardView data={MOCK_DATA} />
}
