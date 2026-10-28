
"use client";

import { useState } from "react";

type VoucherLinkProps = {
    orderId: string;
};

export default function VoucherLink({ orderId }: VoucherLinkProps) {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    async function openVoucher() {
        if (loading) return;

        setLoading(true);
        setMessage("");

        // Abrir la pestaña durante el clic del usuario para evitar
        // que el navegador bloquee la ventana emergente.
        const newTab = window.open("about:blank", "_blank");

        if (!newTab) {
            setMessage(
                "El navegador bloqueó la pestaña. Permite las ventanas emergentes e inténtalo nuevamente."
            );
            setLoading(false);
            return;
        }

        newTab.opener = null;

        try {
            const response = await fetch(
                `/api/admin/orders/${encodeURIComponent(orderId)}/voucher`
            );

            const result = await response.json();

            if (!response.ok || !result.url) {
                throw new Error(
                    result.error ?? "No se pudo abrir el comprobante."
                );
            }

            // Navegar a la URL temporal y firmada de Supabase.
            newTab.location.href = result.url;
        } catch (error) {
            newTab.close();

            setMessage(
                error instanceof Error
                    ? error.message
                    : "Ocurrió un error inesperado."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="space-y-2">
            <button
                type="button"
                onClick={openVoucher}
                disabled={loading}
                className="rounded-md border border-amber-400/40 px-3 py-2 text-xs font-semibold text-amber-400 hover:bg-amber-400/10 disabled:opacity-50"
            >
                {loading ? "Generando enlace..." : "Ver comprobante"}
            </button>

            {message && (
                <p
                    role="status"
                    className="max-w-48 text-xs text-red-400"
                >
                    {message}
                </p>
            )}
        </div>
    );
}
