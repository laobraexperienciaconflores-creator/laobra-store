import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let clientInstance: SupabaseClient | null = null;

/**
 * Retorna el cliente Supabase de forma segura.
 * Si las variables de entorno aún no están configuradas, retorna null
 * para evitar errores durante el build o antes de configurar .env.local.
 */
export function getSupabase(): SupabaseClient | null {
  if (clientInstance) return clientInstance;

  if (
    !supabaseUrl ||
    !supabaseAnonKey ||
    supabaseUrl.includes("tu-proyecto")
  ) {
    return null;
  }

  try {
    clientInstance = createClient(supabaseUrl, supabaseAnonKey);
    return clientInstance;
  } catch (err) {
    console.error("Error al inicializar cliente de Supabase:", err);
    return null;
  }
}
