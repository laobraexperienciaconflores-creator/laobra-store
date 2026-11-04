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

    // 2. PROTECCIÓN DE PRIVACIDAD:
    // Un usuario anónimo NO puede consultar pedidos por número secuencial (ej. LAOBRA-0011),
    // ya que permitiría enumerar y ver los nombres, direcciones, teléfonos y dedicatorias de otros clientes.
    // Solo los administradores pueden consultar por número de pedido secuencial.
    if (isSequentialOrder && !isAdmin) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Por privacidad y protección de datos personales, los pedidos no pueden consultarse por número público. Utiliza el enlace privado único generado para tu compra o inicia sesión como administrador.",
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
      // El administrador autenticado sí puede buscar por LAOBRA-XXXX
      query = query.eq("order_number", cleanParam);
    } else {
      // Clientes y no-administradores SOLO pueden consultar con el token público aleatorio (UUID)
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanParam);
      if (isUuid) {
        query = query.or(`public_token.eq.${cleanParam},id.eq.${cleanParam}`);
      } else {
        query = query.eq("public_token", cleanParam);
      }
    }

    const { data: order, error } = await query.maybeSingle();

    if (error || !order) {
      return NextResponse.json(
        { success: false, error: "Pedido no encontrado o enlace inválido." },
        { status: 404 }
      );
    }

    // 4. Si el voucher es una ruta interna privada de Storage, firmar URL temporal
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

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    console.error("Error al obtener pedido:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Error interno del servidor." },
      { status: 500 }
    );
  }
}
