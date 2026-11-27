"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    TRACKING_STEPS,
    currentTrackingIndex,
    formatTrackingTime,
    type TrackingFields,
    type TrackingStepId,
} from "../../lib/tracking";

type TrackingActionsProps = {
    orderId: string;
    initialTracking: TrackingFields;
};

/** Botones del admin para cada paso del seguimiento del pedido. */
export default function TrackingActions({ orderId, initialTracking }: TrackingActionsProps) {
    const router = useRouter();
    const [tracking, setTracking] = useState<TrackingFields>(initialTracking);
    const [loadingStep, setLoadingStep] = useState<TrackingStepId | null>(null);
    const [message, setMessage] = useState("");

    const currentIndex = currentTrackingIndex(tracking);

    async function updateStep(step: TrackingStepId) {
        setLoadingStep(step);
        setMessage("");

        try {
            const response = await fetch(
                `/api/admin/orders/${encodeURIComponent(orderId)}/tracking`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ step }),
                }
            );
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error ?? "No se pudo actualizar el seguimiento.");
            }

            setTracking(result.order);
            router.refresh();
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "Ocurrió un error inesperado.");
        } finally {
            setLoadingStep(null);
        }
    }

    return (
        <div className="min-w-52 space-y-1.5">
            {TRACKING_STEPS.map((step, index) => {
                const isDone = index <= currentIndex;
                const isCurrent = index === currentIndex;
                const time = formatTrackingTime(tracking[step.column]);

                return (
                    <button
                        key={step.id}
                        type="button"
                        disabled={loadingStep !== null || isCurrent}
                        onClick={() => updateStep(step.id)}
                        aria-pressed={isCurrent}
                        className={`flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-xs font-semibold transition disabled:cursor-default ${
                            isCurrent
                                ? "bg-amber-400 text-neutral-950"
                                : isDone
                                    ? "bg-emerald-900/60 text-emerald-200 hover:bg-emerald-900"
                                    : "border border-white/15 text-neutral-200 hover:border-amber-400 hover:text-amber-300"
                        } ${loadingStep !== null && loadingStep !== step.id ? "opacity-50" : ""}`}
                    >
                        <span>
                            {isDone ? "✓ " : `${index + 1}. `}
                            {loadingStep === step.id ? "Guardando..." : step.label}
                        </span>
                        {time && <span className="text-[10px] font-normal opacity-80">{time}</span>}
                    </button>
                );
            })}

            {message && (
                <p role="status" className="text-xs text-red-300">
                    {message}
                </p>
            )}
        </div>
    );
}
