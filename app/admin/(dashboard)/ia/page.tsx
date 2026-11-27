import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { getSupabaseAdmin } from "../../../lib/supabaseAdmin";
import { AI_PREVIEWS_BUCKET, AI_PREVIEWS_RETENTION_DAYS } from "../../../lib/aiPreviews";
import { BOUQUET_CONFIGS, INDIVIDUAL_COLORS, type BouquetCategory } from "../../../lib/bouquet";

const PAGE_SIZE = 60;
const SIGNED_URL_SECONDS = 60 * 60;

type AiPreviewRow = {
    id: string;
    created_at: string;
    user_id: string | null;
    category: string;
    size: string;
    colors: string[] | null;
    occasion: string | null;
    notes: string | null;
    image_path: string;
};

export default function AiGalleryPage() {
    return (
        <Suspense
            fallback={
                <main className="min-h-screen bg-neutral-950 p-6 text-white">
                    Cargando galería IA...
                </main>
            }
        >
            <GalleryContent />
        </Suspense>
    );
}

async function GalleryContent() {
    await connection();
    const supabase = getSupabaseAdmin();

    const since = hoursAgoIso(24);
    const [{ data, error }, { count: total }, { count: today }] = await Promise.all([
        supabase
            .from("ai_previews")
            .select("id, created_at, user_id, category, size, colors, occasion, notes, image_path")
            .order("created_at", { ascending: false })
            .limit(PAGE_SIZE),
        supabase.from("ai_previews").select("id", { count: "exact", head: true }),
        supabase
            .from("ai_previews")
            .select("id", { count: "exact", head: true })
            .gte("created_at", since),
    ]);

    const rows = (data ?? []) as AiPreviewRow[];
    const urls = new Map<string, string>();
    if (rows.length > 0) {
        const { data: signed } = await supabase.storage
            .from(AI_PREVIEWS_BUCKET)
            .createSignedUrls(rows.map((r) => r.image_path), SIGNED_URL_SECONDS);
        signed?.forEach((s) => {
            if (s.path && s.signedUrl) urls.set(s.path, s.signedUrl);
        });
    }

    const topOccasions = countTop(rows.map((r) => r.occasion).filter(Boolean) as string[]);
    const topColors = countTop(rows.flatMap((r) => r.colors ?? []));

    return (
        <main className="min-h-screen bg-neutral-950 p-6 text-white md:p-10">
            <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="text-sm tracking-[0.3em] text-amber-400">LAOBRA</p>
                    <h1 className="mt-2 text-3xl font-semibold">Galería IA</h1>
                    <p className="mt-2 text-neutral-400">
                        Cada vista previa que generan los clientes en “Personaliza tu ramo”. Se
                        borran solas a los {AI_PREVIEWS_RETENTION_DAYS} días.
                    </p>
                </div>
                <Link
                    href="/admin"
                    className="rounded-md border border-white/15 px-4 py-2 text-sm text-neutral-200 hover:border-amber-400 hover:text-amber-300"
                >
                    ← Pedidos
                </Link>
            </header>

            {error ? (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-200">
                    No se pudo cargar la galería. ¿Se ejecutó la migración
                    <code className="mx-1 rounded bg-black/40 px-1">20261128_ai_previews.sql</code>
                    en Supabase?
                </div>
            ) : (
                <>
                    <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <Stat label="Imágenes guardadas" value={String(total ?? 0)} />
                        <Stat label="Últimas 24 horas" value={String(today ?? 0)} />
                        <Stat label="Ocasiones más pedidas" value={topOccasions || "—"} small />
                        <Stat label="Colores más elegidos" value={topColors || "—"} small />
                    </section>

                    {rows.length === 0 ? (
                        <p className="rounded-xl border border-white/10 bg-neutral-900 p-8 text-center text-neutral-400">
                            Aún no hay imágenes. Aparecerán aquí cuando los clientes generen su
                            vista previa.
                        </p>
                    ) : (
                        <section className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
                            {rows.map((row) => (
                                <PreviewCard key={row.id} row={row} url={urls.get(row.image_path)} />
                            ))}
                        </section>
                    )}

                    {(total ?? 0) > PAGE_SIZE && (
                        <p className="mt-6 text-center text-xs text-neutral-500">
                            Mostrando las {PAGE_SIZE} más recientes de {total}.
                        </p>
                    )}
                </>
            )}
        </main>
    );
}

function PreviewCard({ row, url }: { row: AiPreviewRow; url?: string }) {
    const category =
        BOUQUET_CONFIGS[row.category as BouquetCategory]?.name ?? row.category;

    return (
        <article className="overflow-hidden rounded-xl border border-white/10 bg-neutral-900">
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="block aspect-[3/4] bg-neutral-800"
                aria-label="Abrir imagen en tamaño completo"
            >
                {url && (
                    // eslint-disable-next-line @next/next/no-img-element -- URL firmada temporal de Supabase
                    <img
                        src={url}
                        alt={`Vista previa IA: ${category} talla ${row.size}`}
                        loading="lazy"
                        className="h-full w-full object-cover"
                    />
                )}
            </a>
            <div className="space-y-1.5 p-3 text-xs">
                <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-neutral-100">
                        {category} · {row.size}
                    </span>
                    <span
                        className={`rounded px-1.5 py-0.5 text-[10px] ${
                            row.user_id
                                ? "bg-emerald-900/60 text-emerald-200"
                                : "bg-white/10 text-neutral-300"
                        }`}
                    >
                        {row.user_id ? "Con cuenta" : "Invitado"}
                    </span>
                </div>
                {row.occasion && <p className="text-amber-300">{row.occasion}</p>}
                {(row.colors?.length ?? 0) > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                        {row.colors!.map((name) => (
                            <span key={name} className="flex items-center gap-1 text-neutral-300">
                                <span
                                    className="h-2.5 w-2.5 rounded-full border border-white/30"
                                    style={{
                                        background:
                                            INDIVIDUAL_COLORS.find((c) => c.name === name)?.color ??
                                            "#888",
                                    }}
                                />
                                {name}
                            </span>
                        ))}
                    </div>
                )}
                {row.notes && (
                    <p className="line-clamp-2 text-neutral-400" title={row.notes}>
                        “{row.notes}”
                    </p>
                )}
                <p className="text-[10px] text-neutral-500">{formatDate(row.created_at)}</p>
            </div>
        </article>
    );
}

function Stat({ label, value, small }: { label: string; value: string; small?: boolean }) {
    return (
        <div className="rounded-xl border border-white/10 bg-neutral-900 p-5">
            <p className="text-sm text-neutral-400">{label}</p>
            <p className={`mt-2 font-semibold ${small ? "text-base" : "text-3xl"}`}>{value}</p>
        </div>
    );
}

function countTop(values: string[], n = 3): string {
    const counts = new Map<string, number>();
    for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
    return [...counts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, n)
        .map(([v, c]) => `${v} (${c})`)
        .join(", ");
}

function hoursAgoIso(hours: number): string {
    return new Date(Date.now() - hours * 3_600_000).toISOString();
}

function formatDate(value: string): string {
    return new Intl.DateTimeFormat("es-PE", {
        day: "numeric",
        month: "short",
        hour: "numeric",
        minute: "2-digit",
        timeZone: "America/Lima",
    }).format(new Date(value));
}
