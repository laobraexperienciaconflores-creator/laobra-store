import { randomUUID } from "node:crypto";
import { getSupabaseAdmin } from "./supabaseAdmin";

/** Galería de vistas previas IA (tabla "ai_previews" + bucket privado "ai-previews"). */
export const AI_PREVIEWS_BUCKET = "ai-previews";
export const AI_PREVIEWS_RETENTION_DAYS = 90;

const MAX_DIM = 1024;
const CLEANUP_BATCH = 100;

export type AiPreviewRecord = {
  userId: string | null;
  category: string;
  size: string;
  colors: string[];
  occasion: string;
  notes: string;
  model: string;
  base64: string;
  mimeType: string;
};

/** Guarda una imagen generada (comprimida a JPEG) y sus datos. Nunca lanza errores. */
export async function saveAiPreview(record: AiPreviewRecord): Promise<void> {
  try {
    const supabase = getSupabaseAdmin();
    const original = Buffer.from(record.base64, "base64");
    const compressed = await compress(original);
    const body = compressed ?? original;
    const ext = compressed ? "jpg" : record.mimeType.includes("jpeg") ? "jpg" : "png";
    const day = new Date().toISOString().slice(0, 10);
    const imagePath = `${day}/${randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(AI_PREVIEWS_BUCKET)
      .upload(imagePath, body, {
        contentType: compressed ? "image/jpeg" : record.mimeType || "image/png",
        upsert: false,
      });
    if (uploadError) throw uploadError;

    const { error: insertError } = await supabase.from("ai_previews").insert({
      user_id: record.userId,
      category: record.category,
      size: record.size,
      colors: record.colors,
      occasion: record.occasion || null,
      notes: record.notes || null,
      model: record.model,
      image_path: imagePath,
    });
    if (insertError) {
      await supabase.storage.from(AI_PREVIEWS_BUCKET).remove([imagePath]);
      throw insertError;
    }

    // Limpieza ocasional de imágenes antiguas (sin cron)
    if (Math.random() < 0.1) await deleteOldAiPreviews();
  } catch (e) {
    console.warn("Galería IA: no se pudo guardar la imagen:", e instanceof Error ? e.message : e);
  }
}

/** Borra las imágenes con más de AI_PREVIEWS_RETENTION_DAYS días. */
export async function deleteOldAiPreviews(): Promise<void> {
  const supabase = getSupabaseAdmin();
  const cutoff = new Date(Date.now() - AI_PREVIEWS_RETENTION_DAYS * 86_400_000).toISOString();

  const { data, error } = await supabase
    .from("ai_previews")
    .select("id, image_path")
    .lt("created_at", cutoff)
    .limit(CLEANUP_BATCH);
  if (error || !data?.length) return;

  await supabase.storage.from(AI_PREVIEWS_BUCKET).remove(data.map((row) => row.image_path));
  await supabase.from("ai_previews").delete().in("id", data.map((row) => row.id));
}

async function compress(file: Buffer): Promise<Buffer | null> {
  try {
    const { default: sharp } = await import("sharp");
    return await sharp(file)
      .resize(MAX_DIM, MAX_DIM, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 82, mozjpeg: true })
      .toBuffer();
  } catch {
    return null;
  }
}
