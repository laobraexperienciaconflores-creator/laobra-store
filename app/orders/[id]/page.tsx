import { notFound } from "next/navigation";
import { getSupabaseAdmin } from "@/app/lib/supabaseAdmin";
import { createClient as createServerClient } from "@/app/lib/supabaseServer";
import { isAdminEmail } from "@/app/lib/adminAuth";
import OrderReceiptClient, { OrderData } from "@/app/pedido/[orderNumber]/OrderReceiptClient";

export const instant = false;

type OrderPageProps = {
    params: Promise<{ id: string }>;
};

export default async function OrderPage({ params }: OrderPageProps) {
    const { id } = await params;

    // Esta página recibe tokens públicos de pedidos, nunca rutas de archivos directas.
    if (
        !id ||
        id.toLowerCase().endsWith(".jpg") ||
        id.toLowerCase().endsWith(".jpeg") ||
        id.toLowerCase().endsWith(".png") ||
        id.toLowerCase().endsWith(".webp")
    ) {
        notFound();
    }

    const cleanId = id.trim();
    const isSequential = cleanId.toUpperCase().startsWith("LAOBRA-");

    // Seguridad: Si se intenta consultar por número secuencial LAOBRA-XXXX,
    // solo un administrador autenticado tiene acceso.
    if (isSequential) {
        try {
            const serverSupabase = await createServerClient();
            const { data: authData } = await serverSupabase.auth.getUser();
            const isAdmin = Boolean(authData?.user?.email && isAdminEmail(authData.user.email));
            if (!isAdmin) {
                notFound();
            }
        } catch {
            notFound();
        }
    }

    const supabase = getSupabaseAdmin();

    let query = supabase.from("orders").select("*");

    if (isSequential) {
        query = query.eq("order_number", cleanId);
    } else {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanId);
        if (isUuid) {
            query = query.or(`public_token.eq.${cleanId},id.eq.${cleanId}`);
        } else {
            query = query.eq("public_token", cleanId);
        }
    }

    const { data: order, error } = await query.maybeSingle();

    if (error || !order) {
        notFound();
    }

    // Generar URL firmada para visualizar el comprobante privado si existe en Storage
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
            // Silencioso si falla la firma
        }
    }

    // Firmar imágenes de referencia en los items si tienen ruta de Storage
    if (Array.isArray(order.items)) {
        for (const item of order.items) {
            const ref = item.referenceImage || (item.imageUrl?.startsWith("references/") ? item.imageUrl : null);
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

    return <OrderReceiptClient initialOrder={order as OrderData} />;
}
