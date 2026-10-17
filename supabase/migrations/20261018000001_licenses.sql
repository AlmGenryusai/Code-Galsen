-- Licences : code unique lié à un appareil (CLAUDE.md §Licences)
-- Accès uniquement par la fonction `activate` (clé service) : RLS activée, aucune policy.

create table licenses (
  code         text primary key,             -- ex. GALS-7K3P-9QXM
  device_id    text,                         -- null = code libre (ou remis à zéro pour un transfert)
  activated_at timestamptz,
  expires_at   timestamptz,                  -- fixée à la 1re activation (+ 90 jours)
  created_at   timestamptz not null default now()
);

alter table licenses enable row level security;
