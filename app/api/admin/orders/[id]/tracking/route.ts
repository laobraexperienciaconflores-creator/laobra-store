import { NextResponse } from "next/server";
import { createClient } from "../../../../../lib/supabaseServer";
import { getSupabaseAdmin } from "../../../../../lib/supabaseAdmin";
import { isAdminEmail } from "../../../../../lib/adminAuth";
import { TRACKING_STEPS, isTrackingStep } from "../../../../../lib/tracking";

export const instant = false;

type RouteContext = {
    params: Promise<{ id: string }>;
};

const TRACKING_SELECT =
    "id, tracking_status, tracking_received_at, tracking_preparing_at, tracking_on_the_way_at";

/**
 * PATCH /api/admin/orders/[id]/tracking  { step: "recibido" | "preparacion" | "en_camino" }
 *
 * Marca el paso indicado como actual. Los pasos anteriores sin fecha se completan con la
 * hora actual y los posteriores se limpian (así el admin puede corregir un paso marcado de más).
 */
export async function PATCH(request: Request, { params }: RouteContext) {
    const supabase = await createClient();
    const { data, error: authError } = await supabase.auth.getUser();

    if (authError || !data.user || !isAdminEmail(data.user.email)) {
        return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    let body: { step?: unknown };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
    }

    if (!isTrackingStep(body.step)) {
        return NextResponse.json({ error: "Paso de seguimiento no válido." }, { status: 400 });
    }

    const { id } = await params;
    const admin = getSupabaseAdmin();

    const { data: current, error: readError } = await admin
        .from("orders")
        .select(TRACKING_SELECT)
        .eq("id", id)
        .maybeSingle();

    if (readError) {
        console.error("Error leyendo el seguimiento:", readError.message);
        return NextResponse.json(
            { error: "No se pudo leer el pedido. ¿Se ejecutó la migración de seguimiento?" },
            { status: 500 }
        );
    }
    if (!current) {
        return NextResponse.json({ error: "Pedido no encontrado." }, { status: 404 });
    }

    const targetIndex = TRACKING_STEPS.findIndex((step) => step.id === body.step);
    const now = new Date().toISOString();
    const update: Record<string, string | null> = { tracking_status: body.step };

    TRACKING_STEPS.forEach((step, index) => {
        const existing = (current as Record<string, string | null>)[step.column];
        if (index < targetIndex) {
            update[step.column] = existing ?? now;
        } else if (index === targetIndex) {
            update[step.column] = now;
        } else {
            update[step.column] = null;
        }
    });

    const { data: order, error } = await admin
        .from("orders")
        .update(update)
        .eq("id", id)
        .select(TRACKING_SELECT)
        .maybeSingle();

    if (error) {
        console.error("Error actualizando el seguimiento:", error.message);
        return NextResponse.json(
            { error: "No se pudo actualizar el seguimiento." },
            { status: 500 }
        );
    }

    return NextResponse.json({ order });
}
