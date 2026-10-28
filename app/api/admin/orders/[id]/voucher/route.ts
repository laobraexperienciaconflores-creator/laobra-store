
import { NextResponse } from "next/server";
import { createClient } from "../../../../../lib/supabaseServer";
import { getSupabaseAdmin } from "../../../../../lib/supabaseAdmin";
import { isAdminEmail } from "../../../../../lib/adminAuth";

type RouteContext = {
    params: Promise<{ id: string }>;
};

export async function GET(
    _request: Request,
    { params }: RouteContext
) {
    // Verificar que haya una sesión válida de administrador.
    const supabase = await createClient();
    const { data, error: authError } = await supabase.auth.getUser();

    if (authError || !data.user || !isAdminEmail(data.user.email)) {
        return NextResponse.json(
            { error: "No autorizado." },
            { status: 401 }
        );
    }

    const { id } = await params;
    const admin = getSupabaseAdmin();

    // Obtener únicamente la ruta del comprobante del pedido.
    const { data: order, error } = await admin
        .from("orders")
        .select("id, voucher_url")
        .eq("id", id)
        .maybeSingle();

    if (error) {
        console.error("Error consultando comprobante:", error.message);
        return NextResponse.json(
            { error: "No se pudo consultar el pedido." },
            { status: 500 }
        );
    }

    if (!order) {
        return NextResponse.json(
            { error: "Pedido no encontrado." },
            { status: 404 }
        );
    }

    const filePath = order.voucher_url?.replace(/^\/+/, "");

    if (
        !filePath ||
        filePath.includes("..") ||
        filePath.startsWith("http://") ||
        filePath.startsWith("https://")
    ) {
        return NextResponse.json(
            { error: "La ruta del comprobante no es válida." },
            { status: 400 }
        );
    }

    const { data: signedUrl, error: storageError } = await admin.storage
        .from("payment-vouchers")
        .createSignedUrl(filePath, 60 * 5);

    if (storageError || !signedUrl?.signedUrl) {
        console.error(
            "Error generando enlace del comprobante:",
            storageError?.message
        );

        return NextResponse.json(
            { error: "No se pudo generar el enlace del comprobante." },
            { status: 500 }
        );
    }

    return NextResponse.json({
        url: signedUrl.signedUrl,
    });
}
