
import { NextResponse } from "next/server";
import { createClient } from "../../../../../lib/supabaseServer";
import { getSupabaseAdmin } from "../../../../../lib/supabaseAdmin";
import { isAdminEmail } from "../../../../../lib/adminAuth";

export const instant = false;

type RouteContext = {
    params: Promise<{ id: string }>;
};

export async function PATCH(
    request: Request,
    { params }: RouteContext
) {
    const supabase = await createClient();
    const { data, error: authError } = await supabase.auth.getUser();

    if (authError || !data.user || !isAdminEmail(data.user.email)) {
        return NextResponse.json(
            { error: "No autorizado." },
            { status: 401 }
        );
    }

    let body: { paymentStatus?: string };

    try {
        body = await request.json();
    } catch {
        return NextResponse.json(
            { error: "Solicitud inválida." },
            { status: 400 }
        );
    }

    const allowedStatuses = ["verificado", "rechazado"];

    if (!allowedStatuses.includes(body.paymentStatus ?? "")) {
        return NextResponse.json(
            { error: "Estado de pago no válido." },
            { status: 400 }
        );
    }

    const { id } = await params;
    const admin = getSupabaseAdmin();

    const { data: order, error } = await admin
        .from("orders")
        .update({ payment_status: body.paymentStatus })
        .eq("id", id)
        .select("id, order_number, payment_status")
        .maybeSingle();

    if (error) {
        console.error("Error actualizando pago:", error.message);

        return NextResponse.json(
            { error: "No se pudo actualizar el pago." },
            { status: 500 }
        );
    }

    if (!order) {
        return NextResponse.json(
            { error: "Pedido no encontrado." },
            { status: 404 }
        );
    }

    return NextResponse.json({ order });
}
