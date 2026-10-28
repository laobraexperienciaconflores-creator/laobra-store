
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type PaymentActionsProps = {
    orderId: string;
    initialStatus: string | null;
};

export default function PaymentActions({
    orderId,
    initialStatus,
}: PaymentActionsProps) {
    const router = useRouter();
    const [status, setStatus] = useState(initialStatus ?? "pendiente");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    async function updatePayment(
        paymentStatus: "verificado" | "rechazado"
    ) {
        const confirmation =
            paymentStatus === "verificado"
                ? "¿Confirmaste que el dinero llegó a tu cuenta?"
                : "¿Deseas rechazar este comprobante?";

        if (!window.confirm(confirmation)) return;

        setLoading(true);
        setMessage("");

        try {
            const response = await fetch(
                `/api/admin/orders/${encodeURIComponent(orderId)}/payment`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ paymentStatus }),
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.error ?? "No se pudo actualizar el pago."
                );
            }

            setStatus(result.order.payment_status);
            setMessage("Estado actualizado correctamente.");
            router.refresh();
        } catch (error) {
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
        <div className="min-w-44 space-y-2">
            <p className="font-medium">
                {status === "verificado"
                    ? "Verificado"
                    : status === "rechazado"
                        ? "Rechazado"
                        : "Pendiente"}
            </p>

            {status !== "verificado" && (
                <button
                    type="button"
                    disabled={loading}
                    onClick={() => updatePayment("verificado")}
                    className="w-full rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
                >
                    {loading ? "Procesando..." : "Verificar pago"}
                </button>
            )}

            {status !== "rechazado" && (
                <button
                    type="button"
                    disabled={loading}
                    onClick={() => updatePayment("rechazado")}
                    className="w-full rounded-md bg-red-700 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
                >
                    {loading ? "Procesando..." : "Rechazar pago"}
                </button>
            )}

            {message && (
                <p role="status" className="text-xs text-neutral-300">
                    {message}
                </p>
            )}
        </div>
    );
}
