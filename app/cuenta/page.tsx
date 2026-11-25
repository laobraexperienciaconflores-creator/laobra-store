import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { createClient } from "../lib/supabaseServer";
import { getSupabaseAdmin } from "../lib/supabaseAdmin";
import ProfileForm from "./ProfileForm";
import SignOutButton from "./SignOutButton";

export const metadata: Metadata = {
  title: "Mi cuenta | LA OBRA",
  robots: { index: false },
};

type OrderRow = {
  order_number: string | null;
  public_token: string | null;
  created_at: string;
  total_amount: number;
  status: string | null;
  payment_status: string | null;
  delivery_date: string | null;
  recipient_name: string | null;
};

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  pendiente: { label: "En revisión", className: "bg-[#FFF4D6] text-[#8A5A00]" },
  confirmado: { label: "Confirmado", className: "bg-[#4A6B53]/15 text-[#4A6B53]" },
  cancelado: { label: "Cancelado", className: "bg-red-50 text-red-700" },
};

async function AccountContent() {
  await connection();

  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (!user) {
    redirect("/cuenta/ingresar?next=/cuenta");
  }

  let orders: OrderRow[] = [];
  let ordersUnavailable = false;
  try {
    const { data: rows, error } = await getSupabaseAdmin()
      .from("orders")
      .select(
        "order_number, public_token, created_at, total_amount, status, payment_status, delivery_date, recipient_name"
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) {
      // p. ej. la columna user_id aún no existe (falta correr la migración)
      console.error("Mi cuenta: no se pudieron cargar los pedidos:", error.message);
      ordersUnavailable = true;
    } else {
      orders = (rows ?? []) as OrderRow[];
    }
  } catch (e) {
    console.error("Mi cuenta: error al cargar pedidos:", e);
    ordersUnavailable = true;
  }

  const meta = user.user_metadata ?? {};

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Link
            href="/"
            className="text-xs uppercase tracking-[0.25em] text-[#6B6560] hover:text-black"
          >
            ← LA OBRA
          </Link>
          <h1
            className="mt-2 text-3xl text-black"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            Mi cuenta
          </h1>
          <p className="text-xs text-[#6B6560] mt-1">{user.email ?? user.phone}</p>
        </div>
        <SignOutButton />
      </div>

      <section className="bg-white border border-[#E8CEAD] rounded-2xl p-6 space-y-4">
        <div>
          <h2 className="text-sm uppercase tracking-wider font-semibold text-black">
            Mis datos
          </h2>
          <p className="text-xs text-[#6B6560] mt-1">
            Los usaremos para completar automáticamente tus pedidos.
          </p>
        </div>
        <ProfileForm
          initialName={
            (typeof meta.full_name === "string" && meta.full_name) ||
            (typeof meta.name === "string" && meta.name) ||
            ""
          }
          initialPhone={typeof meta.phone === "string" ? meta.phone : ""}
        />
      </section>

      <section className="bg-white border border-[#E8CEAD] rounded-2xl p-6 space-y-4">
        <h2 className="text-sm uppercase tracking-wider font-semibold text-black">
          Mis pedidos
        </h2>

        {ordersUnavailable ? (
          <p className="text-xs text-[#6B6560]">
            No pudimos cargar tus pedidos en este momento. Inténtalo más tarde.
          </p>
        ) : orders.length === 0 ? (
          <div className="text-center py-6 space-y-3">
            <p className="text-sm text-[#6B6560]">
              Aún no tienes pedidos con esta cuenta.
            </p>
            <Link
              href="/#catalogo"
              className="inline-block px-5 py-2.5 bg-black text-white text-xs uppercase tracking-[0.15em] rounded-xl hover:bg-neutral-800"
            >
              Ver catálogo
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-[#F3E2CE]">
            {orders.map((order) => {
              const status = STATUS_LABELS[order.status ?? ""] ?? {
                label: order.status ?? "—",
                className: "bg-neutral-100 text-neutral-700",
              };
              const content = (
                <div className="flex items-center justify-between gap-4 py-3.5">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-black">
                      {order.order_number ?? "Pedido"}
                    </p>
                    <p className="text-[11px] text-[#6B6560] truncate">
                      {new Date(order.created_at).toLocaleDateString("es-PE", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                      {order.recipient_name ? ` · Para ${order.recipient_name}` : ""}
                      {order.delivery_date ? ` · Entrega ${order.delivery_date}` : ""}
                    </p>
                  </div>
                  <div className="text-right shrink-0 space-y-1">
                    <p className="text-sm text-black">
                      S/ {Number(order.total_amount).toFixed(2)}
                    </p>
                    <span
                      className={`inline-block text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${status.className}`}
                    >
                      {status.label}
                    </span>
                  </div>
                </div>
              );
              return (
                <li key={order.public_token ?? order.order_number ?? order.created_at}>
                  {order.public_token ? (
                    <Link
                      href={`/orders/${order.public_token}`}
                      className="block hover:bg-[#FDF8F3] -mx-2 px-2 rounded-lg"
                    >
                      {content}
                    </Link>
                  ) : (
                    content
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

export default function CuentaPage() {
  return (
    <main className="min-h-screen bg-[#FAF3EC]">
      <Suspense
        fallback={
          <p className="text-center text-sm text-[#6B6560] py-20">Cargando tu cuenta…</p>
        }
      >
        <AccountContent />
      </Suspense>
    </main>
  );
}
