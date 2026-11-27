"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type ColorChip = { name: string; color: string; border?: boolean };

type AiPreviewStudioProps = {
  previewImage: string | null;
  isGenerating: boolean;
  error: string | null;
  remaining: number | null;
  isStale: boolean;
  showAccountCta: boolean;
  occasionLabel: string;
  categoryName: string;
  sizeLabel: string;
  colors: ColorChip[];
  onGenerate: () => void;
  onClear: () => void;
};

const LOADING_STEPS = [
  "Eligiendo las flores de tu ramo…",
  "Combinando tus colores…",
  "Armando el ramo a mano…",
  "Ajustando la luz del taller…",
  "Dando los últimos detalles…",
];

const GOLD = "#B8924A";

/** Vista previa con IA del ramo personalizado, presentada como un pequeño estudio. */
export default function AiPreviewStudio({
  previewImage,
  isGenerating,
  error,
  remaining,
  isStale,
  showAccountCta,
  occasionLabel,
  categoryName,
  sizeLabel,
  colors,
  onGenerate,
  onClear,
}: AiPreviewStudioProps) {
  const outOfQuota = remaining === 0;
  const hasImage = Boolean(previewImage);

  return (
    <section
      aria-label="Vista previa de tu ramo con IA"
      className="relative overflow-hidden rounded-2xl bg-[#0E0D0C] text-white shadow-[0_20px_50px_-20px_rgba(0,0,0,0.55)]"
    >
      {/* Brillo dorado de fondo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 h-56 w-[140%] -translate-x-1/2 rounded-full opacity-40 blur-3xl"
        style={{ background: `radial-gradient(closest-side, ${GOLD}, transparent)` }}
      />

      {/* Encabezado */}
      <div className="relative flex items-center justify-between gap-3 px-4 pt-4 sm:px-5 sm:pt-5">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.32em]" style={{ color: GOLD }}>
            Atelier IA · LA OBRA
          </p>
          <h4
            className="mt-1 text-lg leading-tight sm:text-xl"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            {hasImage ? (
              <>
                Así se vería <span className="italic">tu ramo</span>
              </>
            ) : (
              <>
                Mira tu ramo <span className="italic">antes de pedirlo</span>
              </>
            )}
          </h4>
        </div>
        {remaining !== null && (
          <span
            className="shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-medium"
            style={{ borderColor: `${GOLD}66`, color: "#E8CEAD" }}
          >
            {remaining > 0 ? `${remaining} ${remaining === 1 ? "disponible" : "disponibles"} hoy` : "Sin vistas hoy"}
          </span>
        )}
      </div>

      {/* Lienzo */}
      <div className="relative px-4 pt-4 sm:px-5">
        <div
          className="relative overflow-hidden rounded-xl p-2"
          style={{ background: "linear-gradient(145deg, #2A2520, #15130F)" }}
        >
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-[#F5EBDD]">
            {isGenerating ? (
              <LoadingCanvas key="loading" />
            ) : hasImage ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element -- imagen generada (data URL) */}
                <img
                  key={previewImage}
                  src={previewImage ?? undefined}
                  alt="Vista previa generada con IA de tu ramo personalizado"
                  className={`ai-reveal h-full w-full object-cover ${isStale ? "opacity-60 saturate-50" : ""}`}
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/60 to-transparent" />
                <span className="absolute left-2.5 top-2.5 rounded-full bg-black/55 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur-md">
                  ✨ Vista previa IA
                </span>
                <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-[10px] uppercase tracking-[0.2em] text-white/75">
                      {categoryName} · {sizeLabel}
                    </p>
                    <p
                      className="truncate text-base italic text-white"
                      style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                    >
                      {occasionLabel}
                    </p>
                  </div>
                  <ColorDots colors={colors} />
                </div>
              </>
            ) : (
              <EmptyCanvas colors={colors} occasionLabel={occasionLabel} />
            )}
          </div>
        </div>
      </div>

      {/* Mensajes */}
      <div className="relative space-y-2 px-4 pt-3 sm:px-5">
        {isStale && hasImage && !isGenerating && (
          <p className="rounded-lg border border-[#F0D58A]/40 bg-[#F0D58A]/10 px-3 py-2 text-center text-[11px] text-[#F0D58A]">
            Cambiaste tu selección. Actualiza la imagen para verla con tus nuevos cambios.
          </p>
        )}
        {hasImage && !isStale && !isGenerating && (
          <p className="text-center text-[11px] font-medium text-[#9BC2A5]">
            ✓ Esta imagen se agregará a tu carrito y a tu compra
          </p>
        )}
        {error && (
          <div role="alert" className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-[11px] leading-relaxed text-red-200">
            <p>{error}</p>
            {showAccountCta && (
              <Link
                href="/cuenta/ingresar?next=/%23personalizar"
                className="mt-1 inline-block font-semibold text-white underline underline-offset-2 hover:opacity-80"
              >
                Crear cuenta o ingresar →
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Acciones */}
      <div className="relative flex gap-2 px-4 pb-4 pt-3 sm:px-5 sm:pb-5">
        <button
          type="button"
          onClick={onGenerate}
          disabled={isGenerating || outOfQuota}
          className="group relative flex min-h-12 flex-1 items-center justify-center gap-2 overflow-hidden rounded-xl px-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0E0D0C] shadow-lg transition-all hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          style={{ background: `linear-gradient(120deg, #E8CEAD, ${GOLD} 55%, #8C6D2E)` }}
        >
          {isGenerating ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/25 border-t-black" />
              Creando…
            </>
          ) : (
            <>
              <SparkIcon />
              {outOfQuota
                ? "Vuelve mañana"
                : hasImage
                  ? isStale
                    ? "Actualizar imagen"
                    : "Otra versión"
                  : "Ver mi ramo con IA"}
            </>
          )}
          {!isGenerating && !outOfQuota && (
            <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
          )}
        </button>
        {hasImage && !isGenerating && (
          <button
            type="button"
            onClick={onClear}
            className="flex min-h-12 items-center justify-center rounded-xl border border-white/15 px-4 text-[11px] font-medium uppercase tracking-[0.14em] text-white/80 transition-colors hover:border-white/40 hover:text-white"
          >
            Quitar
          </button>
        )}
      </div>

      <p className="relative px-4 pb-4 text-center text-[10px] leading-relaxed text-white/45 sm:px-5">
        Imagen referencial creada con IA según tus elecciones. Tu ramo real lo arman a mano nuestras floristas.
      </p>
    </section>
  );
}

function EmptyCanvas({ colors, occasionLabel }: { colors: ColorChip[]; occasionLabel: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-5 bg-[radial-gradient(circle_at_50%_35%,#FFF9F1,#EAD8C2)] px-6 text-center">
      <div className="ai-float relative">
        <div className="absolute inset-0 -z-0 rounded-full opacity-60 blur-2xl" style={{ background: colorGlow(colors) }} />
        <BouquetIllustration colors={colors} />
      </div>
      <div className="space-y-2">
        <p className="text-[10px] uppercase tracking-[0.28em] text-[#8A7560]">Tu selección</p>
        <p
          className="text-lg italic text-black"
          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          {occasionLabel}
        </p>
        <div className="flex flex-wrap justify-center gap-1.5">
          {colors.length > 0 ? (
            colors.map((c) => (
              <span
                key={c.name}
                className="flex items-center gap-1.5 rounded-full bg-white/80 px-2.5 py-1 text-[10px] text-[#4A4440] shadow-sm"
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: c.color, boxShadow: c.border ? "inset 0 0 0 1px #D9CFC4" : undefined }}
                />
                {c.name}
              </span>
            ))
          ) : (
            <span className="text-[11px] text-[#6B6560]">Colores a elección de la florista</span>
          )}
        </div>
      </div>
    </div>
  );
}

function LoadingCanvas() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = window.setInterval(
      () => setStep((s) => Math.min(s + 1, LOADING_STEPS.length - 1)),
      2600
    );
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center gap-5 overflow-hidden bg-[radial-gradient(circle_at_50%_35%,#FFF9F1,#E5D1B8)] px-6 text-center">
      <div className="ai-shimmer pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent" />
      <div className="relative flex h-20 w-20 items-center justify-center">
        <span className="absolute inset-0 animate-spin rounded-full border-2 border-[#B8924A]/20 border-t-[#B8924A]" />
        <span className="absolute inset-3 animate-ping rounded-full bg-[#B8924A]/15" />
        <SparkIcon className="h-6 w-6 text-[#B8924A]" />
      </div>
      <div className="relative space-y-1" aria-live="polite">
        <p
          className="text-lg italic text-black"
          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          {LOADING_STEPS[step]}
        </p>
        <p className="text-[11px] text-[#6B6560]">Suele tardar unos 15 segundos</p>
      </div>
      <div className="relative h-1 w-40 overflow-hidden rounded-full bg-black/10">
        <div className="ai-progress h-full w-full rounded-full bg-[#B8924A]" />
      </div>
    </div>
  );
}

function ColorDots({ colors }: { colors: ColorChip[] }) {
  if (colors.length === 0) return null;
  return (
    <div className="flex shrink-0 -space-x-1.5">
      {colors.map((c) => (
        <span
          key={c.name}
          title={c.name}
          className="h-5 w-5 rounded-full border-2 border-white/90 shadow"
          style={{ background: c.color }}
        />
      ))}
    </div>
  );
}

function colorGlow(colors: ColorChip[]) {
  const list = colors.length > 0 ? colors.map((c) => c.color) : [GOLD, "#E8CEAD"];
  return `conic-gradient(${[...list, list[0]].join(", ")})`;
}

/** Ramo ilustrado con los colores elegidos. */
function BouquetIllustration({ colors }: { colors: ColorChip[] }) {
  const palette = colors.length > 0 ? colors.map((c) => c.color) : ["#E8CEAD", GOLD, "#F4D9D0"];
  const blooms = [
    { cx: 60, cy: 38, r: 15 },
    { cx: 38, cy: 50, r: 13 },
    { cx: 82, cy: 50, r: 13 },
    { cx: 50, cy: 66, r: 12 },
    { cx: 72, cy: 68, r: 12 },
    { cx: 60, cy: 56, r: 10 },
  ];
  return (
    <svg viewBox="0 0 120 150" className="relative h-36 w-auto drop-shadow-md" aria-hidden="true">
      <path d="M40 74 L60 140 L80 74 Z" fill="#C9B59B" />
      <path d="M40 74 L60 140 L60 74 Z" fill="#B7A185" />
      <path d="M52 112 Q60 118 68 112" stroke="#8C6D2E" strokeWidth="3" fill="none" strokeLinecap="round" />
      <ellipse cx="30" cy="66" rx="9" ry="4" fill="#6E8B6A" transform="rotate(-35 30 66)" />
      <ellipse cx="90" cy="66" rx="9" ry="4" fill="#6E8B6A" transform="rotate(35 90 66)" />
      <ellipse cx="60" cy="22" rx="4" ry="9" fill="#7F9B78" />
      {blooms.map((b, i) => {
        const fill = palette[i % palette.length];
        return (
          <g key={i}>
            <circle cx={b.cx} cy={b.cy} r={b.r} fill={fill} stroke="rgba(0,0,0,0.12)" strokeWidth="1" />
            <circle cx={b.cx} cy={b.cy} r={b.r * 0.55} fill="rgba(255,255,255,0.22)" />
            <circle cx={b.cx} cy={b.cy} r={b.r * 0.2} fill="rgba(0,0,0,0.15)" />
          </g>
        );
      })}
    </svg>
  );
}

function SparkIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2l1.9 5.6L19.5 9.5l-5.6 1.9L12 17l-1.9-5.6L4.5 9.5l5.6-1.9L12 2z" />
      <path d="M19 14l.9 2.6 2.6.9-2.6.9L19 21l-.9-2.6-2.6-.9 2.6-.9L19 14z" opacity="0.7" />
    </svg>
  );
}
