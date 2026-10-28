import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";

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
          error:
            "Mercado Pago aún no tiene credenciales configuradas en .env.local.",
        },
        { status: 400 }
      );
    }

    const client = new MercadoPagoConfig({
      accessToken,
      options: { timeout: 10000 },
    });
    const preference = new Preference(client);

    const body = await request.json();
    const { items, orderNumber, buyerName, buyerEmail, orderDetails } = body;

    const mpItems = items.map((item: any) => ({
      id: String(item.id),
      title: item.name,
      quantity: Number(item.quantity),
      unit_price: Number(item.price),
      currency_id: "PEN",
      category_id: "art",
    }));

    // Determinar la URL base del sitio (producción vs local)
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      request.headers.get("origin") ||
      "http://localhost:3000";

    const isProduction = siteUrl.startsWith("https://");
    const webhookUrl = process.env.MERCADOPAGO_WEBHOOK_URL;

    const response = await preference.create({
      body: {
        items: mpItems,
        payer: {
          name: buyerName || "Cliente LA OBRA",
          email: buyerEmail || "cliente@laobra.pe",
          phone:
            orderDetails?.buyerPhone
              ? {
                  area_code: "51",
                  number: orderDetails.buyerPhone
                    .replace(/\D/g, "")
                    .slice(-9),
                }
              : undefined,
          address: orderDetails?.deliveryAddress
            ? { street_name: orderDetails.deliveryAddress }
            : undefined,
        },
        external_reference: orderNumber,
        statement_descriptor: "LA OBRA FLORES",
        // binary_mode: true  →  solo en producción (HTTPS)
        ...(isProduction && { binary_mode: true }),
        back_urls: {
          success: `${siteUrl}/pago?estado=aprobado&pedido=${orderNumber}`,
          failure: `${siteUrl}/pago?estado=rechazado&pedido=${orderNumber}`,
          pending: `${siteUrl}/pago?estado=pendiente&pedido=${orderNumber}`,
        },
        // auto_return solo funciona con back_urls HTTPS públicas
        ...(isProduction && { auto_return: "approved" as const }),
        // Webhook para notificaciones en tiempo real
        ...(webhookUrl && { notification_url: webhookUrl }),
        metadata: {
          order_number: orderNumber,
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
  } catch (error: any) {
    console.error("Error creando preferencia de Mercado Pago:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Error al conectar con Mercado Pago",
      },
      { status: 500 }
    );
  }
}
