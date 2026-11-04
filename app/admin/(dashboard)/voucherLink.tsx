"use client";

import { useState } from "react";

type VoucherLinkProps = {
    orderId: string;
    label?: string;
    className?: string;
};

export default function VoucherLink({
    orderId,
    label = "Foto voucher",
    className,
}: VoucherLinkProps) {
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

    const defaultButtonClass =
        "rounded-md border border-white/20 bg-neutral-900 px-2.5 py-1 text-[11px] font-medium text-neutral-300 hover:border-amber-400/50 hover:text-amber-400 disabled:opacity-50 inline-flex items-center gap-1 transition-colors";

    return (
        <div className="space-y-1">
            <button
                type="button"
                onClick={openVoucher}
                disabled={loading}
                className={className || defaultButtonClass}
            >
                <span>📸</span>
                <span>{loading ? "Cargando..." : label}</span>
            </button>

            {message && (
                <p
                    role="status"
                    className="max-w-48 text-[11px] text-red-400"
                >
                    {message}
                </p>
            )}
        </div>
    );
}
