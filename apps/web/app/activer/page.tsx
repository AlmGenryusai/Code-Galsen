import { ActivationView } from '@/components/license/ActivationView'
import { getThemes } from '@/lib/quiz/questions'

// Statique : variables NEXT_PUBLIC_* inlinées au build, page précachée par le service worker
export default function ActiverPage() {
  const themes = getThemes()
  return (
    <ActivationView
      themeCount={themes.length}
      questionCount={themes.reduce((s, t) => s + t.count, 0)}
      wavePaymentUrl={process.env.NEXT_PUBLIC_WAVE_PAYMENT_URL ?? ''}
      supportWhatsapp={process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP ?? ''}
    />
  )
}
