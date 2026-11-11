import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/app/lib/supabaseServer";
import { getSupabaseAdmin } from "@/app/lib/supabaseAdmin";
import { isAdminEmail } from "@/app/lib/adminAuth";

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

    // 2. PROTECCIÓN TOTAL: si el parámetro es un número secuencial (LAOBRA-XXXX)
    // solo los administradores autenticados pueden consultarlo.
    // Los clientes SOLO pueden ver su boleta a través del token privado único (UUID).
    if (isSequentialOrder && !isAdmin) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Acceso restringido. Utiliza el enlace privado que recibiste al realizar tu compra.",
        },
        { status: 403 }
      );
    }

    // 3. Conexión segura con privilegios administrativos en el servidor
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

    if (isAdmin && isSequentialOrder) {
      // Solo el admin puede buscar por LAOBRA-XXXX
      query = query.eq("order_number", cleanParam);
    } else if (isUuid) {
      // Token privado: UUID que puede ser public_token o id
      query = query.or(`public_token.eq.${cleanParam},id.eq.${cleanParam}`);
    } else {
      // Cualquier otro formato: buscar por public_token
      query = query.eq("public_token", cleanParam);
    }

    const { data: order, error } = await query.maybeSingle();

    if (error || !order) {
      return NextResponse.json(
        { success: false, error: "Pedido no encontrado o enlace inválido." },
        { status: 404 }
      );
    }

    // 4. Firmar URL del voucher si es ruta interna de Storage
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

    // 5. Firmar imágenes de referencia en los items si tienen ruta de Storage
    if (Array.isArray(order.items)) {
      for (const item of order.items) {
        const ref =
          item.referenceImage ||
          (item.imageUrl?.startsWith("references/") ? item.imageUrl : null);
        if (ref && !ref.startsWith("http") && !ref.startsWith("data:")) {
          try {
            const { data: signedRef } = await supabase.storage
              .from("payment-vouchers")
              .createSignedUrl(ref, 3600);
            if (signedRef?.signedUrl) {
              item.referenceImage = signedRef.signedUrl;
              if (item.imageUrl === ref) item.imageUrl = signedRef.signedUrl;
            }
          } catch {}
        }
      }
    }

    return NextResponse.json(
      { success: true, order },
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
