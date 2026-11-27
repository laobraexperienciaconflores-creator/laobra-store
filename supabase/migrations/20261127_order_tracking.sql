-- Seguimiento del pedido (lo actualiza el admin y lo ve el cliente en su compra).
-- Pasos: recibido → preparacion → en_camino
-- Ejecutar una vez en Supabase: SQL Editor → New query → pegar y Run.

alter table public.orders
  add column if not exists tracking_status text,
  add column if not exists tracking_received_at timestamptz,
  add column if not exists tracking_preparing_at timestamptz,
  add column if not exists tracking_on_the_way_at timestamptz;

alter table public.orders
  drop constraint if exists orders_tracking_status_check;

alter table public.orders
  add constraint orders_tracking_status_check
  check (tracking_status is null or tracking_status in ('recibido', 'preparacion', 'en_camino'));
