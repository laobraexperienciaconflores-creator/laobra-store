import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  BOUQUET_CONFIGS,
  COLOR_PRESETS,
  INDIVIDUAL_COLORS,
  type BouquetCategory,
  type BouquetSize,
} from "../../lib/bouquet";

/**
 * POST /api/preview-bouquet
 *
 * Llama a la API de Gemini para generar una imagen referencial
 * de un ramo personalizado basándose en la configuración del cliente.
 *
 * El cliente solo envía identificadores (categoría, talla, colores, paleta);
 * el prompt se arma aquí con la configuración del servidor para que nadie
 * pueda inyectar texto libre y generar imágenes arbitrarias con nuestra clave.
 */

// Tiempo máximo de la función (las imágenes pueden tardar)
export const maxDuration = 60;

// Modelos candidatos que soportan generación de imágenes en Google AI Studio
// Orden: calidad/precio primero, luego respaldos menos saturados.
const CANDIDATE_MODELS = [
  "gemini-3.1-flash-image",      // principal: rápido y buena calidad
  "gemini-3.1-flash-lite-image", // más barato, suele tener menos demanda
  "gemini-2.5-flash-image",      // generación anterior, muy disponible
  "gemini-3-pro-image",          // mayor calidad, más lento/caro
];

// Estados temporales de Google (alta demanda, error interno): vale la pena reintentar
const RETRYABLE_STATUS = new Set([500, 503]);
const MAX_PASSES = 2;
const RETRY_DELAY_MS = 1_500;

// Errores que no se arreglan probando otro modelo (clave inválida, sin permiso, o límite 0 en Free Tier)
const FATAL_STATUS = new Set([400, 401, 403, 429]);

// Presupuesto total de tiempo para todos los intentos (deja margen bajo maxDuration)
const TOTAL_BUDGET_MS = 50_000;
const MIN_ATTEMPT_MS = 5_000;

const IS_PROD = process.env.NODE_ENV === "production";
const GENERIC_UNAVAILABLE =
  "La vista previa con IA no está disponible en este momento. Inténtalo más tarde.";

// ── Límite de uso (en memoria, por instancia) ──
// Es una protección básica contra abuso; en serverless cada instancia lleva su
// propio contador. Para un límite global estricto usar Redis/Upstash o Supabase.
const PER_IP_LIMIT = 5;
const PER_IP_WINDOW_MS = 10 * 60 * 1000; // 5 imágenes cada 10 min por IP
const GLOBAL_LIMIT = 60;
const GLOBAL_WINDOW_MS = 60 * 60 * 1000; // 60 imágenes por hora por instancia

const ipHits = new Map<string, number[]>();
let globalHits: number[] = [];

function checkRateLimit(ip: string): { ok: true } | { ok: false; retryAfterSec: number } {
  const now = Date.now();

  globalHits = globalHits.filter((t) => now - t < GLOBAL_WINDOW_MS);
  if (globalHits.length >= GLOBAL_LIMIT) {
    return { ok: false, retryAfterSec: Math.ceil((globalHits[0] + GLOBAL_WINDOW_MS - now) / 1000) };
  }

  const hits = (ipHits.get(ip) ?? []).filter((t) => now - t < PER_IP_WINDOW_MS);
  if (hits.length >= PER_IP_LIMIT) {
    ipHits.set(ip, hits);
    return { ok: false, retryAfterSec: Math.ceil((hits[0] + PER_IP_WINDOW_MS - now) / 1000) };
  }

  hits.push(now);
  ipHits.set(ip, hits);
  globalHits.push(now);

  // Limpieza ocasional para que el Map no crezca sin límite
  if (ipHits.size > 5_000) {
    for (const [key, times] of ipHits) {
      if (times.every((t) => now - t >= PER_IP_WINDOW_MS)) ipHits.delete(key);
    }
  }

  return { ok: true };
}

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

// ── Validación de entrada contra la configuración conocida ──
const VALID_COLORS = new Set(INDIVIDUAL_COLORS.map((c) => c.name));

function isCategory(value: unknown): value is BouquetCategory {
  return typeof value === "string" && Object.hasOwn(BOUQUET_CONFIGS, value);
}

function isSize(value: unknown): value is BouquetSize {
  return value === "S" || value === "M" || value === "L" || value === "XL";
}

type Part = { text?: string; inlineData?: { mimeType?: string; data?: string } };

export async function POST(request: Request) {
  // Leer la clave dinámicamente en cada petición para reflejar cambios en .env.local sin demoras
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    console.error("Preview bouquet: falta GEMINI_API_KEY en el entorno");
    return NextResponse.json(
      {
        error: IS_PROD
          ? GENERIC_UNAVAILABLE
          : "Falta configurar GEMINI_API_KEY en el archivo .env.local. Obtén tu clave en https://aistudio.google.com/apikey",
      },
      { status: 503 }
    );
  }

  // ── Parsear y validar el cuerpo ──
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }

  const { category, size, colors, preset } = (body ?? {}) as Record<string, unknown>;

  if (!isCategory(category) || !isSize(size)) {
    return NextResponse.json({ error: "Categoría o talla inválida" }, { status: 400 });
  }

  const safeColors = Array.isArray(colors)
    ? [...new Set(colors.filter((c): c is string => typeof c === "string" && VALID_COLORS.has(c)))]
    : [];
  const presetLabel =
    typeof preset === "string" ? COLOR_PRESETS.find((p) => p.id === preset)?.label : undefined;

  // ── Límite de uso (después de validar, para no gastar cupo en peticiones basura) ──
  const limit = checkRateLimit(getClientIp(request));
  if (!limit.ok) {
    return NextResponse.json(
      {
        error: "Has generado varias vistas previas seguidas. Espera unos minutos e inténtalo de nuevo.",
      },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } }
    );
  }

  try {
    const sizeConfig = BOUQUET_CONFIGS[category].sizes[size];

    // ── Construir el prompt descriptivo (solo con datos del servidor) ──
    const colorDesc =
      safeColors.length > 0
        ? safeColors.join(", ")
        : presetLabel || "colores variados y armónicos de temporada";

    const categoryDesc =
      category === "lujo"
        ? "ramo de alta costura floral con especies selectas (orquídeas, anturios, calas o tulipanes)"
        : category === "exclusivo"
          ? "ramo de autor artístico con rosas selectas, flores de exportación y follaje elegante"
          : "ramo clásico fresco de temporada con flores frescas y envoltura artesanal";

    const sizeDesc =
      size === "XL"
        ? "muy grande, opulento y de gran volumen"
        : size === "L"
          ? "grande, frondoso y abundante"
          : size === "M"
            ? "mediano, equilibrado y estilizado"
            : "pequeño, delicado y compacto";

    const filteredFlowers = sizeConfig.flowers.filter((f) => !f.startsWith("(")).slice(0, 4);
    const flowerDesc =
      filteredFlowers.length > 0
        ? filteredFlowers.join(", ")
        : "flores frescas selectas de temporada";

    // ── Fotos reales de LA OBRA como guía de estilo ──
    const references = await loadReferenceImages([
      sizeConfig.imageUrl,
      BOUQUET_CONFIGS[category].imageUrl,
      ...STYLE_FALLBACK_IMAGES,
    ]);

    const prompt = `Eres fotógrafo de producto de LA OBRA, una florería artesanal de autor en Lima, Perú.
${references.length > 0 ? `Te adjunto ${references.length} fotos reales de ramos de LA OBRA. Úsalas como guía obligatoria de ESTILO y PRESENTACIÓN, no de flores ni colores:
- Misma presentación: el ramo apoyado sobre el mismo soporte metálico negro de patas delgadas, visto de frente y ligeramente desde arriba.
- Mismo fondo: estudio con fondo continuo gris muy claro / blanco y piso claro, luz de día suave y difusa, sombras suaves.
- Misma envoltura: papel coreano en varias capas con bordes amplios, lazo de cinta en la base y un pequeño sticker redondo discreto en el papel.
- Mismo encuadre vertical y misma calidad de foto de catálogo.
` : ""}
Crea UN ramo NUEVO con estas características elegidas por el cliente:
- Categoría: ${categoryDesc}.
- Tamaño: ${sizeDesc} (medidas aproximadas: ${sizeConfig.dimensions}).
- Paleta de color: SOLO flores en tonos ${colorDesc} (más el verde del follaje). No agregues flores de otros colores, aunque aparezcan en las fotos de referencia. El papel de la envoltura debe armonizar con esa paleta.
- Flores principales: ${flowerDesc}, con follaje fresco (eucalipto, ruscus o similar).

Reglas: no copies un ramo de las fotos de referencia; sin personas, sin manos, sin texto legible, sin marcas de agua ni logotipos inventados. Fotografía realista, nada de ilustración.`;

    const errors: string[] = [];
    const deadline = Date.now() + TOTAL_BUDGET_MS;

    // Probar los modelos candidatos en orden; si todos estaban saturados, una segunda vuelta
    const attempts = Array.from({ length: MAX_PASSES }, (_, pass) =>
      CANDIDATE_MODELS.map((model) => ({ model, pass }))
    ).flat();
    let fatal = false;
    let onlyTransient = true;

    for (const { model, pass } of attempts) {
      if (fatal) break;
      if (pass > 0) {
        if (!onlyTransient) break; // fallos no temporales: no tiene sentido repetir
        if (model === CANDIDATE_MODELS[0]) {
          await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
        }
      }

      const remaining = deadline - Date.now();
      if (remaining < MIN_ATTEMPT_MS) {
        errors.push(`${model}: omitido (sin tiempo restante)`);
        break;
      }

      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [
                  ...references.map((r) => ({ inlineData: { mimeType: r.mimeType, data: r.data } })),
                  { text: prompt },
                ],
              },
            ],
            generationConfig: {
              responseModalities: ["IMAGE", "TEXT"],
              // Vertical, igual que el recuadro de la vista previa en la tienda
              imageConfig: { aspectRatio: "3:4" },
            },
          }),
          signal: AbortSignal.timeout(remaining),
        });

        if (!response.ok) {
          const errText = await response.text();
          console.warn(`Model ${model} returned ${response.status}:`, errText);
          errors.push(`${model} (${response.status}): ${extractMessage(errText)}`);

          // Manejo específico si Google rechaza por Free Tier (límite 0 para imágenes)
          if (response.status === 429) {
            const isLimitZero = errText.includes("limit: 0") || errText.includes("Free Tier");
            if (isLimitZero) {
              console.error("Preview bouquet: la cuenta de Gemini no tiene facturación habilitada para imágenes");
            }
            return NextResponse.json(
              {
                error:
                  isLimitZero && !IS_PROD
                    ? "Google AI Studio requiere facturación vinculada (Pay-as-you-go) para generar imágenes. En el plan gratuito el límite para modelos de imagen es 0."
                    : isLimitZero
                      ? GENERIC_UNAVAILABLE
                      : "Hay mucha demanda en este momento. Espera unos segundos e intenta nuevamente.",
                ...(!IS_PROD && { details: errors }),
              },
              { status: isLimitZero ? 503 : 429 }
            );
          }

          if (response.status === 400 && errText.includes("API_KEY_INVALID")) {
            console.error("Preview bouquet: GEMINI_API_KEY inválida");
            return NextResponse.json(
              {
                error: IS_PROD
                  ? GENERIC_UNAVAILABLE
                  : "La clave GEMINI_API_KEY no es válida. Por favor genera una clave en https://aistudio.google.com/apikey y colócala en .env.local",
                ...(!IS_PROD && { details: errors }),
              },
              { status: 503 }
            );
          }

          if (FATAL_STATUS.has(response.status)) {
            fatal = true;
            break;
          }
          if (!RETRYABLE_STATUS.has(response.status)) onlyTransient = false;
          continue;
        }

        const data = await response.json();
        const candidate = data?.candidates?.[0];
        const parts: Part[] = candidate?.content?.parts ?? [];
        const imagePart = parts.find((p) => p.inlineData?.data);

        if (imagePart?.inlineData?.data) {
          const { mimeType, data: imageBase64 } = imagePart.inlineData;
          return NextResponse.json({
            image: `data:${mimeType || "image/png"};base64,${imageBase64}`,
            modelUsed: model,
          });
        }

        // Respondió OK pero sin imagen (filtro de seguridad, solo texto, etc.)
        const reason =
          data?.promptFeedback?.blockReason ||
          candidate?.finishReason ||
          parts.find((p) => p.text)?.text?.slice(0, 200) ||
          "respuesta sin imagen";
        errors.push(`${model}: sin imagen (${reason})`);
        onlyTransient = false;
      } catch (subErr) {
        console.warn(`Error trying model ${model}:`, subErr);
        errors.push(`${model}: ${subErr instanceof Error ? subErr.message : String(subErr)}`);
      }
    }

    console.error("Preview bouquet: todos los modelos fallaron:\n" + errors.join("\n"));
    return NextResponse.json(
      {
        error: "No se pudo generar la vista previa en este momento. Inténtalo de nuevo.",
        // Detalle técnico solo en desarrollo, para no exponerlo a clientes
        ...(!IS_PROD && { details: errors }),
      },
      { status: 502 }
    );
  } catch (error) {
    console.error("Preview bouquet error:", error);
    return NextResponse.json(
      { error: "Error interno al procesar la solicitud de vista previa" },
      { status: 500 }
    );
  }
}

// Saca el campo "message" del JSON de error de Google, si existe
function extractMessage(errText: string): string {
  try {
    return JSON.parse(errText)?.error?.message ?? errText.slice(0, 300);
  } catch {
    return errText.slice(0, 300);
  }
}

// Fotos de catálogo usadas como respaldo de estilo si faltara alguna de la talla/categoría
const STYLE_FALLBACK_IMAGES = ["/products/bruma.jpg", "/products/silencio.jpg"];
const MAX_REFERENCE_IMAGES = 2;

type ReferenceImage = { mimeType: string; data: string };
const referenceCache = new Map<string, ReferenceImage | null>();

// Lee fotos de /public (incluidas en el bundle vía outputFileTracingIncludes en next.config)
async function loadReferenceImages(urls: string[]): Promise<ReferenceImage[]> {
  const unique = [...new Set(urls)].filter((u) => /^\/products\/[^/]+\.(jpe?g|png|webp)$/i.test(u));
  const result: ReferenceImage[] = [];

  for (const url of unique) {
    if (result.length >= MAX_REFERENCE_IMAGES) break;

    if (!referenceCache.has(url)) {
      try {
        const file = await readFile(path.join(process.cwd(), "public", url));
        const ext = path.extname(url).toLowerCase();
        const mimeType = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg";
        referenceCache.set(url, { mimeType, data: file.toString("base64") });
      } catch (e) {
        console.warn(`Preview bouquet: no se pudo leer la referencia ${url}:`, e);
        referenceCache.set(url, null);
      }
    }

    const ref = referenceCache.get(url);
    if (ref) result.push(ref);
  }

  return result;
}
