import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { getSupabaseAdmin } from "../../../lib/supabaseAdmin";

/**
 * POST /api/mercadopago/create-preference  { orderNumber, publicToken }
 *
 * Crea el checkout de Mercado Pago para un pedido ya registrado. El monto sale del
 * pedido guardado en Supabase (incluye envío y descuento), no de lo que envía el navegador.
 */
export async function POST(request: Request) {
  try {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

    if (
      !accessToken ||
      accessToken.includes("tu_access_token") ||
      accessToken.includes("APP_USR-xxxxxx")
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "El pago con tarjeta no está disponible por ahora. Paga con Yape o Plin.",
        },
        { status: 503 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const orderNumber = typeof body?.orderNumber === "string" ? body.orderNumber : "";
    const publicToken = typeof body?.publicToken === "string" ? body.publicToken : "";

    if (!orderNumber || !publicToken) {
      return NextResponse.json(
        { success: false, error: "No se encontró el pedido para pagar." },
        { status: 400 }
      );
    }

    const { data: order, error: orderError } = await getSupabaseAdmin()
      .from("orders")
      .select("order_number, public_token, total_amount, buyer_name, buyer_phone, delivery_address, payment_status")
      .eq("order_number", orderNumber)
      .eq("public_token", publicToken)
      .maybeSingle();

    if (orderError || !order) {
      return NextResponse.json(
        { success: false, error: "No se encontró el pedido para pagar." },
        { status: 404 }
      );
    }

    if (order.payment_status === "pagado") {
      return NextResponse.json(
        { success: false, error: "Este pedido ya está pagado." },
        { status: 409 }
      );
    }

    const amount = Math.round(Number(order.total_amount) * 100) / 100;
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { success: false, error: "El total del pedido no es válido." },
        { status: 400 }
      );
    }

    // URL pública del sitio (en Vercel sale del dominio con el que entró el cliente)
    const siteUrl = (
      process.env.NEXT_PUBLIC_SITE_URL ||
      request.headers.get("origin") ||
      "http://localhost:3000"
    ).replace(/\/$/, "");

    const isProduction = siteUrl.startsWith("https://");
    const webhookUrl =
      process.env.MERCADOPAGO_WEBHOOK_URL ||
      (isProduction ? `${siteUrl}/api/mercadopago/webhook` : "");

    const phone = String(order.buyer_phone || "").replace(/\D/g, "").slice(-9);
    const returnUrl = (estado: string) =>
      `${siteUrl}/pago?estado=${estado}&pedido=${encodeURIComponent(order.order_number)}`;

    const client = new MercadoPagoConfig({
      accessToken,
      options: { timeout: 10000 },
    });

    const response = await new Preference(client).create({
      body: {
        items: [
          {
            id: order.order_number,
            title: `Pedido ${order.order_number} · LA OBRA`,
            description: "Arreglo floral, envío y descuentos incluidos",
            quantity: 1,
            unit_price: amount,
            currency_id: "PEN",
            category_id: "art",
          },
        ],
        payer: {
          name: order.buyer_name || "Cliente LA OBRA",
          ...(phone && { phone: { area_code: "51", number: phone } }),
          ...(order.delivery_address && {
            address: { street_name: order.delivery_address },
          }),
        },
        external_reference: order.order_number,
        statement_descriptor: "LA OBRA FLORES",
        // Solo aprobado o rechazado (sin pagos "pendientes" en efectivo)
        ...(isProduction && { binary_mode: true }),
        back_urls: {
          success: returnUrl("aprobado"),
          failure: returnUrl("rechazado"),
          pending: returnUrl("pendiente"),
        },
        // auto_return solo funciona con back_urls HTTPS públicas
        ...(isProduction && { auto_return: "approved" as const }),
        ...(webhookUrl && { notification_url: webhookUrl }),
        metadata: {
          order_number: order.order_number,
          store: "laobra",
        },
      },
    });

    return NextResponse.json({
      success: true,
      init_point: response.init_point,
      sandbox_init_point: response.sandbox_init_point,
      preference_id: response.id,
    });
  } catch (error: unknown) {
    console.error("Error creando preferencia de Mercado Pago:", error);
    return NextResponse.json(
      {
        success: false,
        error: "No se pudo conectar con Mercado Pago. Intenta de nuevo o paga con Yape o Plin.",
      },
      { status: 500 }
    );
  }
}
