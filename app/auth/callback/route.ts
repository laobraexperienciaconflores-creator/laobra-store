import { NextResponse } from "next/server";
import { createClient } from "../../lib/supabaseServer";
import { safeNextPath } from "../../lib/authRedirect";

/**
 * GET /auth/callback
 *
 * Destino de "Continuar con Google" y del enlace mágico del correo.
 * Canjea el código por una sesión (cookies) y redirige al cliente.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = safeNextPath(url.searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, url.origin));
    }
    console.error("Auth callback: no se pudo canjear el código:", error.message);
  }

  const failUrl = new URL("/cuenta/ingresar", url.origin);
  failUrl.searchParams.set("error", "enlace");
  return NextResponse.redirect(failUrl);
}
