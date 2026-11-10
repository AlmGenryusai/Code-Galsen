import { LegalPage, H2 } from '@/components/LegalPage'

export const metadata = { title: 'Mentions légales — Code Galsen' }

export default function MentionsLegalesPage() {
  return (
    <LegalPage title="Mentions légales">
      <H2>Éditeur</H2>
      <p>Code Galsen, édité par Alfred Mane, Dakar, Sénégal. Contact : WhatsApp +221 77 744 04 00.</p>
      <H2>Hébergement</H2>
      <p>Application hébergée par Vercel Inc. Service d&apos;activation des codes : Supabase.</p>
      <H2>Nature du service</H2>
      <p>Code Galsen est une application de préparation à l&apos;examen théorique du permis B au Sénégal. Elle ne remplace pas l&apos;auto-école, obligatoire, et ne délivre aucun certificat ni aucune garantie de réussite à l&apos;examen.</p>
      <H2>Sources</H2>
      <p>Le contenu s&apos;appuie sur la loi 2022-04 portant Code de la route et sur le décret 2004-13. Certaines valeurs dépendent de décrets d&apos;application non encore publiés : elles ne figurent pas dans l&apos;application. En cas de doute, seuls les textes officiels font foi.</p>
      <H2>Accès payant</H2>
      <p>Trois formules, payées par Wave : 1 mois (30 jours) 2 500 FCFA, 2 mois (60 jours) 3 500 FCFA, 3 mois (90 jours) 4 000 FCFA. La durée démarre à l&apos;activation du code. Le code d&apos;activation est personnel et lié à un appareil.</p>
      <H2>Propriété</H2>
      <p>Les textes et questions sont la propriété de l&apos;éditeur. Les photos proviennent de sources tierces (notamment Wikimedia Commons, Pexels, Unsplash), sous leurs licences d&apos;origine : la source de chaque photo est indiquée dans la page Crédits. Pour toute demande de retrait, écris-nous sur WhatsApp.</p>
    </LegalPage>
  )
}
