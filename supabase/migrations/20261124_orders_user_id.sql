-- Vincula los pedidos con la cuenta del cliente (Mi cuenta → historial de pedidos).
-- Ejecutar una vez en Supabase: SQL Editor → New query → pegar y Run.

alter table public.orders
  add column if not exists user_id uuid references auth.users (id) on delete set null;

create index if not exists orders_user_id_created_at_idx
  on public.orders (user_id, created_at desc);
