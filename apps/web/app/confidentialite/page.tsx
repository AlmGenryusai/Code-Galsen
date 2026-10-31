import { LegalPage, H2 } from '@/components/LegalPage'

export const metadata = { title: 'Confidentialité — Code Galsen' }

export default function ConfidentialitePage() {
  return (
    <LegalPage title="Confidentialité">
      <p>Pas de compte, pas de publicité, pas de suivi statistique.</p>
      <H2>Sur ton téléphone</H2>
      <p>Ta progression (réponses, scores, carnet) est enregistrée uniquement sur ton appareil. Elle n&apos;est pas envoyée à nos serveurs. Si tu effaces les données du site, elle est perdue.</p>
      <H2>À l&apos;activation</H2>
      <p>Quand tu saisis ton code, l&apos;application envoie au serveur le code et un identifiant aléatoire de ton appareil. Le serveur les associe et renvoie une licence signée avec ta date de fin. Aucun nom, numéro de téléphone ni e-mail n&apos;est demandé par l&apos;application.</p>
      <H2>Paiement et support</H2>
      <p>Le paiement se fait sur Wave, hors de l&apos;application. Le code est envoyé par WhatsApp : ton numéro est alors connu de l&apos;éditeur pour le support uniquement.</p>
      <H2>Tes droits</H2>
      <p>Pour toute question ou demande de suppression, contacte-nous : [À COMPLÉTER : contact].</p>
    </LegalPage>
  )
}
