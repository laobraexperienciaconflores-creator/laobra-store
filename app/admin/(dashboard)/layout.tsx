
import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabaseServer";

async function AdminGuard({
    children,
}: {
    children: React.ReactNode;
}) {
    await connection();

    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();

    const allowedEmail = process.env.ADMIN_EMAIL?.toLowerCase();

    if (
        error ||
        !data.user ||
        !allowedEmail ||
        data.user.email?.toLowerCase() !== allowedEmail
    ) {
        redirect("/admin/login");
    }

    return <>{children}</>;
}

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <Suspense
            fallback={
                <main className="flex min-h-screen items-center justify-center bg-neutral-950 text-white">
                    Cargando panel de LAOBRA...
                </main>
            }
        >
            <AdminGuard>{children}</AdminGuard>
        </Suspense>
    );
}
