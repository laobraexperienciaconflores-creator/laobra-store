
import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { createClient } from "@supabase/supabase-js";

/**
 * Webhook de Mercado Pago — POST /api/mercadopago/webhook
 *
 * Mercado Pago envía un POST cada vez que cambia el estado de un pago.
 * Verificamos la autenticidad, consultamos el pago en la API de MP
 * y actualizamos el estado del pedido en Supabase.
 *
 * IMPORTANTE: Esta URL debe ser pública (HTTPS). En desarrollo usa ngrok:
 *   npx ngrok http 3000
 * Luego pon la URL en .env.local como MERCADOPAGO_WEBHOOK_URL
 */
export async function POST(request: Request) {
  try {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!accessToken || accessToken.includes("tu_access_token")) {
      return NextResponse.json({ received: false }, { status: 400 });
    }

    // MP puede enviar como form-urlencoded o JSON
    const contentType = request.headers.get("content-type") || "";
    let topic: string | null = null;
    let id: string | null = null;

    const url = new URL(request.url);
    topic = url.searchParams.get("topic") || url.searchParams.get("type");
    id = url.searchParams.get("id") || url.searchParams.get("data.id");

    if (!topic && contentType.includes("application/json")) {
      const body = await request.json();
      topic = body?.type || body?.topic;
      id = body?.data?.id || body?.id;
    }


    // Solo procesamos notificaciones de pagos
    if (topic !== "payment" || !id) {
      return NextResponse.json({ received: true, skipped: true });
    }

    // Consultar el pago en la API de Mercado Pago
    const client = new MercadoPagoConfig({ accessToken });
    const paymentClient = new Payment(client);
    const payment = await paymentClient.get({ id: String(id) });

    const mpStatus = payment.status; // approved | rejected | pending | in_process
    const externalRef = payment.external_reference; // nuestro order_number


    if (!externalRef) {
      return NextResponse.json({ received: true, skipped: "no_external_ref" });
    }

    // Mapear estado de MP → estado interno
    const paymentStatusMap: Record<string, string> = {
      approved: "pagado",
      rejected: "rechazado",
      pending: "pendiente_pago_online",
      in_process: "pendiente_pago_online",
      cancelled: "cancelado",
      refunded: "reembolsado",
      charged_back: "contracargo",
    };
    const newPaymentStatus = paymentStatusMap[mpStatus ?? ""] || "pendiente_pago_online";
    const newOrderStatus =
      mpStatus === "approved"
        ? "confirmado"
        : mpStatus === "rejected" || mpStatus === "cancelled"
          ? "cancelado"
          : "pendiente";

    // Actualizar en Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.SUPABASE_SECRET_KEY ||
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (
      supabaseUrl &&
      supabaseKey &&
      !supabaseUrl.includes("tu-proyecto")
    ) {
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Un pago aprobado solo confirma el pedido si cubre el total guardado
      if (mpStatus === "approved") {
        const { data: order } = await supabase
          .from("orders")
          .select("total_amount")
          .eq("order_number", externalRef)
          .maybeSingle();
        const expected = Number(order?.total_amount);
        const paid = Number(payment.transaction_amount);
        if (!order || !Number.isFinite(paid) || paid + 0.01 < expected) {
          console.error(
            `[MP Webhook] Monto no coincide para ${externalRef}: pagado ${paid}, esperado ${expected}`
          );
          return NextResponse.json({ received: true, skipped: "amount_mismatch" });
        }
      }

      const { error } = await supabase
        .from("orders")
        .update({
          payment_status: newPaymentStatus,
          status: newOrderStatus,
          operation_number: String(id), // ID del pago en MP
        })
        .eq("order_number", externalRef);

      if (error) {
        console.error("[MP Webhook] Error actualizando Supabase:", error.message);
        // Devolvemos 200 igual para que MP no reintente infinitamente
      }
    }

    // Siempre responder 200 a MP (si respondemos 4xx/5xx, MP reintenta)
    return NextResponse.json({ received: true, status: newPaymentStatus });
  } catch (error: unknown) {
    console.error(
      "[MP Webhook] Error inesperado:",
      error instanceof Error ? error.message : error
    );
    // Respondemos 200 para evitar reintentos de MP
    return NextResponse.json({ received: true, error: "handled" });
  }
}

// Mercado Pago también hace GET para verificar que el endpoint existe
export async function GET() {
  return NextResponse.json({ status: "MP webhook endpoint active" });
}
