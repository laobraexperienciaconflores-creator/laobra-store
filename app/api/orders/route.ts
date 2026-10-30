
import { NextResponse } from "next/server";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";

const BUCKET = "payment-vouchers";
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

type AllowedMime = keyof typeof ALLOWED_TYPES;

export async function POST(request: Request) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let supabase: SupabaseClient<any> | null = null;
  let uploadedPath: string | null = null;

  try {
    const body = await request.json();

    const {
      items,
      orderDetails,
      totalPrice,
      paymentMethod,
      operationNumber,
      voucherUrl,
    } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "El carrito está vacío." },
        { status: 400 }
      );
    }

    if (
      !orderDetails?.buyerName?.trim() ||
      !orderDetails?.deliveryAddress?.trim() ||
      !orderDetails?.recipientName?.trim()
    ) {
      return NextResponse.json(
        { success: false, error: "Faltan datos obligatorios para el pedido." },
        { status: 400 }
      );
    }

    const amount = Number(totalPrice);

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { success: false, error: "El total del pedido no es válido." },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SECRET_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { success: false, error: "Falta configurar Supabase en el servidor." },
        { status: 500 }
      );
    }

    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    let voucherPath: string | null = null;

    if (voucherUrl) {
      if (typeof voucherUrl !== "string") {
        return NextResponse.json(
          { success: false, error: "El comprobante no tiene un formato válido." },
          { status: 400 }
        );
      }

      const match = voucherUrl.match(
        /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/]*={0,2})$/
      );

      if (!match) {
        return NextResponse.json(
          {
            success: false,
            error: "El comprobante debe ser una imagen JPG, PNG o WebP válida.",
          },
          { status: 400 }
        );
      }

      const mimeType = match[1] as AllowedMime;
      const base64Data = match[2];
      const buffer = Buffer.from(base64Data, "base64");

      if (
        buffer.length === 0 ||
        buffer.length > MAX_FILE_SIZE ||
        buffer.toString("base64").replace(/=+$/, "") !==
        base64Data.replace(/=+$/, "")
      ) {
        return NextResponse.json(
          {
            success: false,
            error: "El comprobante está vacío, es inválido o supera los 5 MB.",
          },
          { status: 400 }
        );
      }

      const filePath = `orders/${randomUUID()}.${ALLOWED_TYPES[mimeType]}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(filePath, buffer, {
          contentType: mimeType,
          upsert: false,
        });

      if (uploadError) {
        console.error("Error al subir comprobante:", uploadError.message);

        return NextResponse.json(
          {
            success: false,
            error: "No se pudo guardar el comprobante. Intenta nuevamente.",
          },
          { status: 500 }
        );
      }

      uploadedPath = filePath;
      voucherPath = filePath;
    }

    const initialPaymentStatus =
      paymentMethod === "mercadopago"
        ? "pendiente_pago_online"
        : operationNumber || voucherPath
          ? "comprobante_enviado"
          : "pendiente_verificacion";

    const rawRef = orderDetails.deliveryReference?.trim() || "";
    const locUrl = orderDetails.deliveryLocationUrl?.trim() || "";
    const fullReference =
      rawRef && locUrl
        ? `${rawRef} • Ubicación: ${locUrl}`
        : locUrl
        ? `Ubicación: ${locUrl}`
        : rawRef || null;

    const { data, error } = await supabase
      .from("orders")
      .insert([
        {
          total_amount: amount,
          currency: "PEN",
          buyer_name: orderDetails.buyerName.trim(),
          buyer_phone: orderDetails.buyerPhone?.trim() || null,
          recipient_name: orderDetails.recipientName.trim(),
          recipient_phone: orderDetails.recipientPhone?.trim() || null,
          delivery_address: orderDetails.deliveryAddress.trim(),
          delivery_reference: fullReference,
          delivery_date: orderDetails.deliveryDate || null,
          delivery_time: orderDetails.deliveryTime || "10:00 AM",
          dedication: orderDetails.dedication?.trim() || null,
          dedication_from: orderDetails.dedicationFrom?.trim() || null,
          payment_method: paymentMethod || "yape_plin",
          payment_status: initialPaymentStatus,
          operation_number: operationNumber?.trim() || null,
          voucher_url: voucherPath,
          items: items.map((item: {
            id: string;
            name: string;
            price: number;
            quantity: number;
            imageUrl?: string;
          }) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            imageUrl: item.imageUrl,
          })),
          status: "pendiente",
        },
      ])
      .select("id, order_number, public_token")
      .single();

    if (error) {
      console.error("Error al registrar pedido:", error.message);

      if (uploadedPath) {
        const { error: cleanupError } = await supabase.storage
          .from(BUCKET)
          .remove([uploadedPath]);

        if (cleanupError) {
          console.error(
            "No se pudo limpiar el comprobante:",
            cleanupError.message
          );
        }
      }

      return NextResponse.json(
        { success: false, error: "No se pudo registrar el pedido." },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { success: false, error: "No se recibieron los datos del pedido." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      orderNumber: data.order_number,
      orderId: data.id,
      publicToken: data.public_token,
    });
  } catch (error) {
    console.error("Error inesperado en POST /api/orders:", error);

    if (supabase && uploadedPath) {
      const { error: cleanupError } = await supabase.storage
        .from(BUCKET)
        .remove([uploadedPath]);

      if (cleanupError) {
        console.error(
          "No se pudo limpiar el comprobante:",
          cleanupError.message
        );
      }
    }

    return NextResponse.json(
      { success: false, error: "Ocurrió un error al procesar el pedido." },
      { status: 500 }
    );
  }
}
