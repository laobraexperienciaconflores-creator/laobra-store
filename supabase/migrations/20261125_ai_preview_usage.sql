-- Cupo diario de vistas previas con IA (5 con cuenta, 1 sin cuenta).
-- Ejecutar una vez en Supabase: SQL Editor → New query → pegar y Run.
-- subject = "user:<id de la cuenta>" o "ip:<hash de la IP>" (la IP no se guarda en claro).

create table if not exists public.ai_preview_usage (
  id bigint generated always as identity primary key,
  subject text not null,
  created_at timestamptz not null default now()
);

create index if not exists ai_preview_usage_subject_created_at_idx
  on public.ai_preview_usage (subject, created_at desc);

-- Solo el servidor (clave secreta) lee y escribe; sin políticas, nadie más tiene acceso.
alter table public.ai_preview_usage enable row level security;
