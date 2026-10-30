-- Rattrapage : la table prod `licenses` avait RLS désactivée et tous les droits pour `anon`.
-- Idempotent. Accès uniquement via la fonction `activate` (clé service).
alter table public.licenses enable row level security;
revoke all on public.licenses from anon, authenticated;
