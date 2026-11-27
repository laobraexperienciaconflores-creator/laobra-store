import {
  TRACKING_STEPS,
  currentTrackingIndex,
  formatTrackingTime,
  type TrackingFields,
} from "../../lib/tracking";

/** Línea de tiempo del seguimiento que ve el cliente en su compra. */
export default function OrderTracking({ order }: { order: TrackingFields }) {
  const currentIndex = currentTrackingIndex(order);

  return (
    <section aria-labelledby="order-tracking-title">
      <h3
        id="order-tracking-title"
        className="text-[11px] uppercase tracking-widest text-[#6B6560] font-semibold mb-4 border-b pb-2 border-[#F3E2CE]"
      >
        Seguimiento de tu pedido
      </h3>

      {currentIndex < 0 && (
        <p className="mb-4 text-[11px] text-[#6B6560] leading-relaxed">
          Aquí verás cada avance de tu pedido. Esta página se actualiza sola.
        </p>
      )}

      <ol className="relative space-y-0">
        {TRACKING_STEPS.map((step, index) => {
          const isDone = index <= currentIndex;
          const isCurrent = index === currentIndex;
          const isLast = index === TRACKING_STEPS.length - 1;
          const time = formatTrackingTime(order[step.column]);

          return (
            <li
              key={step.id}
              className="relative flex gap-3.5 pb-5 last:pb-0"
              aria-current={isCurrent ? "step" : undefined}
            >
              {/* Línea entre pasos */}
              {!isLast && (
                <span
                  aria-hidden="true"
                  className={`absolute left-[11px] top-6 h-[calc(100%-1.5rem)] w-px ${
                    index < currentIndex ? "bg-[#4A6B53]" : "bg-[#E8CEAD]"
                  }`}
                />
              )}

              <span
                aria-hidden="true"
                className={`relative z-[1] mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                  isDone
                    ? "bg-[#4A6B53] text-white"
                    : "border border-[#E8CEAD] bg-white text-[#6B6560]"
                } ${isCurrent ? "ring-4 ring-[#4A6B53]/15" : ""}`}
              >
                {isDone ? "✓" : index + 1}
              </span>

              <div className="min-w-0 pt-0.5">
                <p className={`text-sm font-medium ${isDone ? "text-black" : "text-[#6B6560]"}`}>
                  {step.label}
                  {isCurrent && (
                    <span className="ml-2 align-middle rounded-full bg-[#4A6B53]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#4A6B53]">
                      Actual
                    </span>
                  )}
                </p>
                {isDone ? (
                  <p className="text-[11px] text-[#6B6560] mt-0.5">
                    {step.description}
                    {time && <span className="text-black/50"> · {time}</span>}
                  </p>
                ) : (
                  <p className="text-[11px] text-[#6B6560]/70 mt-0.5">Pendiente</p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
