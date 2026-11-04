# Publier sur Google Play (TWA)

Emballage de la PWA en Trusted Web Activity. Aucun code de l'app à changer.

## Prérequis (côté Alfred)
- Compte Play Console (25 USD, une fois).
- Domaine de prod Vercel connu (ex. `code-galsen.vercel.app`).
- Node installé sur le Mac.
- Compte perso récent : test fermé avec 12 testeurs pendant 14 jours avant la publication en production.

## Étapes
1. `npx @bubblewrap/cli init --manifest=https://<domaine>/manifest.json`
   - Package id : `sn.codegalsen.app` (à garder définitivement).
   - Garder la clé de signature générée (`android.keystore`) hors du repo, sauvegardée.
2. `npx @bubblewrap/cli build` → `app-release-bundle.aab`.
3. `npx @bubblewrap/cli fingerprint` → empreinte SHA-256.
4. Créer `apps/web/public/.well-known/assetlinks.json` avec cette empreinte, redéployer :
   ```json
   [{"relation":["delegate_permission/common.handle_all_urls"],
     "target":{"namespace":"android_app","package_name":"sn.codegalsen.app",
     "sha256_cert_fingerprints":["<SHA-256>"]}}]
   ```
   Si Play App Signing est activé, ajouter aussi l'empreinte affichée dans Play Console (Intégrité de l'application).
5. Play Console : créer l'app, uploader le `.aab` en test fermé, remplir fiche, captures, politique de confidentialité (`/confidentialite`), formulaire Data safety (progression locale, aucune donnée personnelle collectée hors activation).

## Risque paiement
Play impose Google Play Billing pour les contenus numériques. Vente de codes via Wave/WhatsApp hors app : risque de refus. Ne pas afficher de prix ni d'appel au paiement dans la fiche Play sans décision.

## iOS
Non prévu : 99 USD/an et refus fréquent des simples emballages (guideline 4.2).
