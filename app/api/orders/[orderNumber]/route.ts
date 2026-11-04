import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/app/lib/supabaseServer";
import { getSupabaseAdmin } from "@/app/lib/supabaseAdmin";
import { isAdminEmail } from "@/app/lib/adminAuth";

function maskPhone(phone: string): string {
  const clean = phone.trim();
  if (clean.length <= 4) return "****";
  return clean.slice(0, 3) + " *** " + clean.slice(-3);
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const { orderNumber } = await params;

    if (!orderNumber) {
      return NextResponse.json(
        { success: false, error: "Identificador de pedido no especificado." },
        { status: 400 }
      );
    }

    const cleanParam = orderNumber.trim();
    const isSequentialOrder = cleanParam.toUpperCase().startsWith("LAOBRA-");
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanParam);

    // Obtener token secreto si viene por parámetro de URL o cabecera
    const url = new URL(request.url);
    const queryToken =
      url.searchParams.get("token")?.trim() ||
      request.headers.get("x-order-token")?.trim() ||
      "";

    // 1. Verificar si quien consulta es el Administrador de LA OBRA
    let isAdmin = false;
    try {
      const serverSupabase = await createServerClient();
      const { data: authData } = await serverSupabase.auth.getUser();
      if (authData?.user?.email && isAdminEmail(authData.user.email)) {
        isAdmin = true;
      }
    } catch {
      isAdmin = false;
    }

    // 2. Conexión segura con privilegios administrativos en el servidor
    let supabase;
    try {
      supabase = getSupabaseAdmin();
    } catch {
      return NextResponse.json(
        { success: false, error: "Faltan credenciales de Supabase en el servidor." },
        { status: 500 }
      );
    }

    let query = supabase.from("orders").select("*");

    if (isSequentialOrder) {
      query = query.eq("order_number", cleanParam);
    } else if (isUuid) {
      query = query.or(`public_token.eq.${cleanParam},id.eq.${cleanParam}`);
    } else {
      query = query.eq("public_token", cleanParam);
    }

    const { data: order, error } = await query.maybeSingle();

    if (error || !order) {
      return NextResponse.json(
        { success: false, error: "Pedido no encontrado o enlace inválido." },
        { status: 404 }
      );
    }

    // 3. Determinar nivel de autorización:
    // - Administrador autenticado
    // - Token secreto coincidente (public_token / id)
    // - O la URL misma fue el UUID no adivinable (enlace privado)
    const isAuthorized =
      isAdmin ||
      (queryToken &&
        (queryToken.toLowerCase() === (order.public_token || "").toLowerCase() ||
          queryToken.toLowerCase() === (order.id || "").toLowerCase())) ||
      !isSequentialOrder;

    // 4. Si la consulta se hizo por número secuencial LAOBRA-XXXX sin token secreto ni sesión admin,
    // se devuelven los datos del pedido y el ESTADO EN TIEMPO REAL, pero se protegen datos sensibles
    // (números de teléfono privados, dirección exacta y carta dedicatoria) para evitar que terceros
    // que adivinen números secuenciales espíen la privacidad de otros clientes.
    if (!isAuthorized) {
      if (order.buyer_phone) {
        order.buyer_phone = maskPhone(order.buyer_phone);
      }
      if (order.recipient_phone) {
        order.recipient_phone = maskPhone(order.recipient_phone);
      }
      if (order.delivery_address) {
        const parts = order.delivery_address.split("—");
        order.delivery_address =
          parts.length > 1
            ? `${parts[0].trim()} — [Dirección protegida por privacidad]`
            : "Lima — [Dirección protegida por privacidad]";
      }
      order.delivery_reference = null;
      if (order.dedication) {
        order.dedication = "💌 [Mensaje personal privado para el destinatario]";
        order.dedication_from = null;
      }
      order.voucher_url = null;
    } else {
      // 5. Usuario autorizado: si el voucher es una ruta interna de Storage, firmar URL
      if (
        order.voucher_url &&
        !order.voucher_url.startsWith("http") &&
        !order.voucher_url.startsWith("data:")
      ) {
        try {
          const { data: signedData } = await supabase.storage
            .from("payment-vouchers")
            .createSignedUrl(order.voucher_url, 3600);
          if (signedData?.signedUrl) {
            order.voucher_url = signedData.signedUrl;
          }
        } catch {
          // Ignorar si falla
        }
      }
    }

    return NextResponse.json(
      {
        success: true,
        order,
        isAuthorized: Boolean(isAuthorized),
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch (error: any) {
    console.error("Error al obtener pedido:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Error interno del servidor." },
      { status: 500 }
    );
  }
}
