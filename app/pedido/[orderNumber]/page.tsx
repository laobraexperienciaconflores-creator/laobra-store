/**
 * Server Component shell para /pedido/[orderNumber].
 *
 * `instant = false` indica a Next.js 16 que esta ruta se renderiza
 * bajo demanda (no se prerenderiza estaticamente), ya que depende del
 * numero de pedido dinamico y de datos en tiempo real de la API.
 *
 * El componente de UI real vive en OrderReceiptClient.tsx ("use client").
 */
export const instant = false;

import OrderReceiptClient from "./OrderReceiptClient";

type PageProps = {
  params: Promise<{ orderNumber: string }>;
};

export default function PedidoPage({ params }: PageProps) {
  return <OrderReceiptClient params={params} />;
}
