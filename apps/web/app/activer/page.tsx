import { ActivationView } from '@/components/license/ActivationView'
import { getThemes } from '@/lib/quiz/questions'

// Statique : variables NEXT_PUBLIC_* inlinées au build, page précachée par le service worker
export default function ActiverPage() {
  const themes = getThemes()
  return (
    <ActivationView
      themeCount={themes.length}
      questionCount={themes.reduce((s, t) => s + t.count, 0)}
      waveUrls={{
        1: process.env.NEXT_PUBLIC_WAVE_URL_1_MOIS ?? '',
        2: process.env.NEXT_PUBLIC_WAVE_URL_2_MOIS ?? '',
        3: process.env.NEXT_PUBLIC_WAVE_URL_3_MOIS ?? '',
      }}
      supportWhatsapp={process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP ?? ''}
    />
  )
}
