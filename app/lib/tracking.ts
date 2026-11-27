/**
 * Seguimiento del pedido. El admin marca cada paso y el cliente lo ve en su compra.
 * Columnas en "orders": tracking_status y una fecha por paso (ver supabase/migrations).
 */
export const TRACKING_STEPS = [
  {
    id: "recibido",
    label: "Recepción de pedido",
    description: "Recibimos tu pedido y lo estamos revisando.",
    column: "tracking_received_at",
  },
  {
    id: "preparacion",
    label: "En preparación",
    description: "Nuestras floristas están armando tu ramo a mano.",
    column: "tracking_preparing_at",
  },
  {
    id: "en_camino",
    label: "En camino a la dirección",
    description: "Tu pedido salió del taller y va rumbo a la dirección de entrega.",
    column: "tracking_on_the_way_at",
  },
] as const;

export type TrackingStepId = (typeof TRACKING_STEPS)[number]["id"];
export type TrackingColumn = (typeof TRACKING_STEPS)[number]["column"];

export type TrackingFields = {
  tracking_status?: string | null;
  tracking_received_at?: string | null;
  tracking_preparing_at?: string | null;
  tracking_on_the_way_at?: string | null;
};

export function isTrackingStep(value: unknown): value is TrackingStepId {
  return TRACKING_STEPS.some((step) => step.id === value);
}

/** Índice del paso actual (-1 si aún no empieza). */
export function currentTrackingIndex(order: TrackingFields): number {
  return TRACKING_STEPS.findIndex((step) => step.id === order.tracking_status);
}

/** Fecha y hora en Lima, ej. "27 nov, 3:45 p. m." */
export function formatTrackingTime(value: string | null | undefined): string {
  if (!value) return "";
  try {
    return new Intl.DateTimeFormat("es-PE", {
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
      timeZone: "America/Lima",
    }).format(new Date(value));
  } catch {
    return "";
  }
}
