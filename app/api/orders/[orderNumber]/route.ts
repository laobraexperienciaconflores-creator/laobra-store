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
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (
      supabaseUrl &&
      supabaseKey &&
      !supabaseUrl.includes("tu-proyecto") &&
      !supabaseKey.includes("tu-anon-key")
    ) {
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("order_number", orderNumber)
        .single();

      if (error || !data) {
        return NextResponse.json(
          { success: false, error: "Pedido no encontrado" },
          { status: 404 }
        );
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
