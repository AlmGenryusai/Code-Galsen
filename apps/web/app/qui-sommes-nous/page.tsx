import { LegalPage, H2 } from '@/components/LegalPage'

export const metadata = { title: 'Qui sommes-nous — Code Galsen' }

const WHATSAPP = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP ?? ''

export default function QuiSommesNousPage() {
  return (
    <LegalPage title="Qui sommes-nous">
      <p>Code Galsen est fait à Dakar par Alfred Mane, pour préparer l&apos;examen du code de la route (permis B) avec les règles du Sénégal.</p>
      <H2>Pourquoi Code Galsen</H2>
      <p>La plupart des applis de code sont faites pour la France, avec des règles et des situations qui ne sont pas les nôtres. Ici, chaque question s&apos;appuie sur la loi 2022-04 portant Code de la route ou le décret 2004-13, avec l&apos;article cité dans la correction. Les situations sont celles de nos routes : motos Jakarta, charrettes, cars rapides.</p>
      <p>Code Galsen t&apos;aide à te préparer. Il ne remplace pas l&apos;auto-école, obligatoire, et ne garantit pas la réussite à l&apos;examen.</p>
      <H2>Comment ça marche</H2>
      <p>Tu achètes un code sur WhatsApp, tu paies avec Wave, tu reçois ton code et tu l&apos;actives dans l&apos;appli. Pas de compte, pas de mot de passe. Le code marche sur un seul téléphone.</p>
      <H2>Remboursement</H2>
      <div id="remboursement">
        <ul style={{ paddingLeft: 20, margin: 0 }}>
          <li>Code pas encore activé : remboursement complet sur Wave, sur simple demande, dans les 7 jours après l&apos;achat.</li>
          <li>Code activé mais l&apos;appli ne marche pas sur ton téléphone, et nous ne trouvons pas de solution en 48 heures : remboursement complet.</li>
          <li>Téléphone perdu, changé ou données effacées : nous transférons ton code sur ton nouveau téléphone, une fois.</li>
        </ul>
      </div>
      <H2>Contact</H2>
      <p>
        {WHATSAPP ? (
          <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer" style={{ color: 'hsl(var(--primary-h))', fontWeight: 600 }}>
            Écris-nous sur WhatsApp
          </a>
        ) : (
          'Écris-nous sur WhatsApp'
        )}
        {' '}: nous répondons en général dans la journée.
      </p>
    </LegalPage>
  )
}
