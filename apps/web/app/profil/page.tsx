import { ProfilView } from '@/components/dashboard/ProfilView'
import { allSheetIds } from '@/lib/lessons/lessons'

// Statique : NEXT_PUBLIC_* inlinée au build
export default function ProfilPage() {
  return (
    <ProfilView
      supportWhatsapp={process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP ?? ''}
      sheetTotal={allSheetIds().length}
    />
  )
}
