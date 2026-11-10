-- Formules 1, 2 ou 3 mois : durée portée par le code, appliquée à la 1re activation.
-- Codes existants (et défaut) = 90 jours : rien ne change pour eux.
-- À exécuter AVANT de redéployer la fonction `activate` (elle lit cette colonne).

alter table licenses
  add column if not exists duration_days integer not null default 90
  check (duration_days in (30, 60, 90));
