import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const { orderNumber } = await params;

    if (!orderNumber) {
      return NextResponse.json(
        { success: false, error: "Número de pedido no especificado" },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.SUPABASE_SECRET_KEY ||
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (
      supabaseUrl &&
      supabaseKey &&
      !supabaseUrl.includes("tu-proyecto") &&
      !supabaseKey.includes("tu-anon-key")
    ) {
      const supabase = createClient(supabaseUrl, supabaseKey);

      let { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("order_number", orderNumber)
        .maybeSingle();

      if (!data) {
        // Fallback: buscar por public_token o por UUID id
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderNumber);
        const query = isUuid
          ? supabase.from("orders").select("*").or(`public_token.eq.${orderNumber},id.eq.${orderNumber}`)
          : supabase.from("orders").select("*").eq("public_token", orderNumber);

        const fallback = await query.maybeSingle();
        data = fallback.data;
        error = fallback.error;
      }

      if (error || !data) {
        return NextResponse.json(
          { success: false, error: "Pedido no encontrado" },
          { status: 404 }
        );
      }

      // Generar URL firmada si el voucher es una ruta interna de Supabase Storage
      if (
        data.voucher_url &&
        !data.voucher_url.startsWith("http") &&
        !data.voucher_url.startsWith("data:")
      ) {
        try {
          const { data: signedData } = await supabase.storage
            .from("payment-vouchers")
            .createSignedUrl(data.voucher_url, 3600);
          if (signedData?.signedUrl) {
            data.voucher_url = signedData.signedUrl;
          }
        } catch {
          // Si falla la firma, mantener valor original
        }
      }

      return NextResponse.json({ success: true, order: data });
    }

    // Modo simulación si Supabase no está conectado
    return NextResponse.json({
      success: true,
      simulated: true,
      order: {
        order_number: orderNumber,
        status: "pendiente",
        payment_status: "pendiente",
        payment_method: "yape_plin",
        total_amount: 135,
        currency: "PEN",
        buyer_name: "Cliente de prueba",
        buyer_phone: "+51 988 559 304",
        recipient_name: "Destinatario de prueba",
        recipient_phone: "+51 912 345 678",
        delivery_address: "Av. Larco 1234, Dpto 402 - Miraflores",
        delivery_reference: "Frente al parque",
        delivery_date: "2026-10-28",
        delivery_time: "10:00 AM",
        dedication: "Con todo mi amor en este día tan especial.",
        dedication_from: "Mateo",
        items: [
          {
            id: "melocoton-silvestre",
            name: "Melocotón Silvestre",
            price: 135,
            quantity: 1,
            imageUrl: "/products/ramo-durazno-silvestre.jpg",
            discountAmount: 20.25,
            couponCode: "LAOBRA01",
            discountPercentage: 15,
            deliveryCost: 20.25,
            itemsSubtotal: 135,
          },
        ],
        created_at: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error("Error al obtener pedido:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}
