import { LegalPage, H2 } from '@/components/LegalPage'

export const metadata = { title: 'Mentions légales — Code Galsen' }

// TODO(Alfred) : remplacer les [À COMPLÉTER] avant le lancement commercial
export default function MentionsLegalesPage() {
  return (
    <LegalPage title="Mentions légales">
      <H2>Éditeur</H2>
      <p>Code Galsen, édité par [À COMPLÉTER : nom ou raison sociale], [À COMPLÉTER : ville, Sénégal]. Contact : [À COMPLÉTER : WhatsApp ou e-mail].</p>
      <H2>Hébergement</H2>
      <p>Application hébergée par Vercel Inc. Service d&apos;activation des codes : Supabase.</p>
      <H2>Nature du service</H2>
      <p>Code Galsen est une application de préparation à l&apos;examen théorique du permis B au Sénégal. Elle ne remplace pas l&apos;auto-école, obligatoire, et ne délivre aucun certificat ni aucune garantie de réussite à l&apos;examen.</p>
      <H2>Sources</H2>
      <p>Le contenu s&apos;appuie sur la loi 2022-04 portant Code de la route et sur le décret 2004-13. Certaines valeurs dépendent de décrets d&apos;application non encore publiés : elles ne figurent pas dans l&apos;application. En cas de doute, seuls les textes officiels font foi.</p>
      <H2>Accès payant</H2>
      <p>4 900 FCFA pour 90 jours, payés par Wave. Le code d&apos;activation est personnel et lié à un appareil.</p>
      <H2>Propriété</H2>
      <p>Les textes et questions sont la propriété de l&apos;éditeur. Les panneaux proviennent de Wikimedia Commons, sous leurs licences d&apos;origine.</p>
    </LegalPage>
  )
}
