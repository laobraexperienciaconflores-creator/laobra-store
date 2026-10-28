
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabaseBrowser";
import { getAdminEmails, isAdminEmail } from "../../lib/adminAuth";

export default function AdminLoginPage() {
    const router = useRouter();
    const supabase = createClient();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const { error: loginError } =
                await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

            if (loginError) {
                setError("Correo o contraseña incorrectos.");
                return;
            }

            const { data } = await supabase.auth.getUser();

console.log("Correo recibido de Supabase:", data.user?.email);
console.log("Correos autorizados:", getAdminEmails());

if (!data.user || !isAdminEmail(data.user.email)) {
                await supabase.auth.signOut();
                setError("Este usuario no tiene acceso al panel.");
                return;
            }

            router.replace("/admin");
            router.refresh();
        } catch {
            setError("No se pudo iniciar sesión. Intenta nuevamente.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-4 text-white">
            <form
                onSubmit={handleLogin}
                className="w-full max-w-md space-y-5 rounded-2xl border border-white/10 bg-neutral-900 p-8"
            >
                <div>
                    <p className="text-sm tracking-[0.3em] text-amber-400">
                        LAOBRA
                    </p>
                    <h1 className="mt-3 text-2xl font-semibold">
                        Panel de administración
                    </h1>
                    <p className="mt-2 text-sm text-neutral-400">
                        Ingresa con tu cuenta autorizada.
                    </p>
                </div>

                <label className="block text-sm">
                    Correo electrónico
                    <input
                        type="email"
                        autoComplete="username"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-2 w-full rounded-lg border border-neutral-700 bg-neutral-950 p-3"
                    />
                </label>

                <label className="block text-sm">
                    Contraseña
                    <input
                        type="password"
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-2 w-full rounded-lg border border-neutral-700 bg-neutral-950 p-3"
                    />
                </label>

                {error && (
                    <p role="alert" className="text-sm text-red-400">
                        {error}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-lg bg-amber-400 p-3 font-semibold text-neutral-950 disabled:opacity-50"
                >
                    {loading ? "Ingresando..." : "Iniciar sesión"}
                </button>
            </form>
        </main>
    );
}
