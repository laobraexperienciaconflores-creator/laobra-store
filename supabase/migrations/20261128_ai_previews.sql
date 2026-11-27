-- Galería de vistas previas IA: cada imagen generada en "Personaliza tu ramo".
-- Solo el servidor accede (RLS sin políticas). Las imágenes van al bucket privado "ai-previews".
-- Se borran solas a los 90 días (lo hace la propia app al generar nuevas imágenes).
-- Ejecutar una vez en Supabase: SQL Editor → New query → pegar y Run.

create table if not exists public.ai_previews (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid,
  category text not null,
  size text not null,
  colors text[] not null default '{}',
  occasion text,
  notes text,
  model text,
  image_path text not null
);

create index if not exists ai_previews_created_at_idx on public.ai_previews (created_at desc);

alter table public.ai_previews enable row level security;

insert into storage.buckets (id, name, public)
values ('ai-previews', 'ai-previews', false)
on conflict (id) do nothing;
