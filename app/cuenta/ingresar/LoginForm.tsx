"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "../../lib/supabaseBrowser";
import { safeNextPath } from "../../lib/authRedirect";

type Step = "email" | "code";

// Activar cuando Google esté configurado en Supabase (Authentication → Providers → Google)
const GOOGLE_ENABLED = process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === "true";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNextPath(searchParams.get("next"));
  const linkError = searchParams.get("error") === "enlace";

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(
    linkError ? "El enlace expiró o ya fue usado. Pide un código nuevo." : "",
  );
  const [info, setInfo] = useState("");

  const callbackUrl = () =>
    `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

  async function sendCode(e?: React.FormEvent) {
    e?.preventDefault();
    setError("");
    setInfo("");
    const cleanEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError("Escribe un correo válido.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: cleanEmail,
      options: { shouldCreateUser: true, emailRedirectTo: callbackUrl() },
    });
    setLoading(false);

    if (otpError) {
      console.error("signInWithOtp:", otpError.message);
      setError(
        otpError.status === 429
          ? "Pediste muchos códigos seguidos. Espera un minuto e inténtalo de nuevo."
          : "No pudimos enviar el código. Revisa el correo e inténtalo de nuevo.",
      );
      return;
    }

    setEmail(cleanEmail);
    setStep("code");
    setInfo(
      `Te enviamos un código a ${cleanEmail}. Revisa también la carpeta de spam.`,
    );
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const token = code.replace(/\s/g, "");
    if (!/^\d{6,10}$/.test(token)) {
      setError("El código son los números que llegaron a tu correo.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });
    setLoading(false);

    if (verifyError) {
      setError("El código no es correcto o ya expiró.");
      return;
    }

    router.replace(next);
    router.refresh();
  }

  async function signInWithGoogle() {
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callbackUrl() },
    });
    if (oauthError) {
      setLoading(false);
      console.error("signInWithOAuth:", oauthError.message);
      setError("El ingreso con Google aún no está disponible. Usa tu correo.");
    }
  }

  return (
    <div className="w-full max-w-md bg-white border border-[#E8CEAD] rounded-2xl shadow-sm p-7 sm:p-9 space-y-6">
      <div className="text-center space-y-2">
        <Link
          href="/"
          className="inline-block text-xl tracking-[0.3em] font-light text-black"
          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          LA OBRA
        </Link>
        <h1
          className="text-2xl text-black"
          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          {step === "email" ? "Ingresa o crea tu cuenta" : "Revisa tu correo"}
        </h1>
        <p className="text-xs text-[#6B6560] leading-relaxed">
          {step === "email"
            ? "Guarda tus datos de entrega y revisa tus pedidos. Sin contraseñas."
            : "Escribe el código que te enviamos, o abre el enlace del correo en este mismo dispositivo."}
        </p>
      </div>

      {step === "email" ? (
        <>
          {GOOGLE_ENABLED && (
            <>
              <button
                type="button"
                onClick={signInWithGoogle}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3 border border-[#E8CEAD] rounded-xl bg-white hover:border-black text-sm text-black transition-colors disabled:opacity-60"
              >
                <GoogleIcon />
                Continuar con Google
              </button>

              <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-[#6B6560]">
                <span className="h-px flex-1 bg-[#E8CEAD]" />o con tu correo
                <span className="h-px flex-1 bg-[#E8CEAD]" />
              </div>
            </>
          )}

          <form onSubmit={sendCode} className="space-y-3">
            <label className="block text-[11px] uppercase tracking-wider text-[#6B6560]">
              Correo electrónico
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tucorreo@gmail.com"
                className="mt-1.5 w-full px-3.5 py-3 border border-[#E8CEAD] rounded-xl text-sm text-black normal-case tracking-normal focus:outline-none focus:border-black"
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-black hover:bg-neutral-800 text-white text-xs uppercase tracking-[0.15em] rounded-xl transition-colors disabled:opacity-60"
            >
              {loading ? "Enviando…" : "Enviarme un código"}
            </button>
          </form>
        </>
      ) : (
        <form onSubmit={verifyCode} className="space-y-3">
          <label className="block text-[11px] uppercase tracking-wider text-[#6B6560]">
            Código de verificación
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus
              maxLength={10}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/[^\d\s]/g, ""))}
              placeholder="123456"
              className="mt-1.5 w-full px-3.5 py-3 border border-[#E8CEAD] rounded-xl text-center text-xl tracking-[0.4em] font-mono text-black focus:outline-none focus:border-black"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-black hover:bg-neutral-800 text-white text-xs uppercase tracking-[0.15em] rounded-xl transition-colors disabled:opacity-60"
          >
            {loading ? "Verificando…" : "Ingresar"}
          </button>
          <div className="flex justify-between text-[11px]">
            <button
              type="button"
              onClick={() => {
                setStep("email");
                setCode("");
                setInfo("");
                setError("");
              }}
              className="text-[#6B6560] hover:text-black underline-offset-2 hover:underline"
            >
              Cambiar correo
            </button>
            <button
              type="button"
              onClick={() => sendCode()}
              disabled={loading}
              className="text-[#B8924A] hover:text-black underline-offset-2 hover:underline disabled:opacity-60"
            >
              Reenviar código
            </button>
          </div>
        </form>
      )}

      {info && !error && (
        <p className="text-xs text-[#4A6B53] bg-[#4A6B53]/10 border border-[#4A6B53]/25 rounded-lg px-3 py-2">
          {info}
        </p>
      )}
      {error && (
        <p
          role="alert"
          className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2"
        >
          {error}
        </p>
      )}

      <p className="text-center text-[11px] text-[#6B6560]">
        <Link
          href="/"
          className="hover:text-black hover:underline underline-offset-2"
        >
          ← Volver a la tienda
        </Link>
      </p>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.2-.1-2.3-.4-3.5z"
      />
    </svg>
  );
}
