import { Suspense } from "react";
import { connection } from "next/server";
import { createClient } from "../../lib/supabaseServer";
import { getSupabaseAdmin } from "../../lib/supabaseAdmin";
import PaymentActions from "./paymentActions";

export default function AdminPage() {
    return (
        <Suspense
            fallback={
                <main className="min-h-screen bg-neutral-950 p-6 text-white">
                    Cargando pedidos de LAOBRA...
                </main>
            }
        >
            <OrdersContent />
        </Suspense>
    );
}

async function OrdersContent() {
    await connection();

    // Intentar consultar con getSupabaseAdmin para bypass de RLS; si no, fallback a createClient
    let supabase;
    try {
        supabase = getSupabaseAdmin();
    } catch {
        supabase = await createClient();
    }

    const { data: orders, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

    if (error) {
        console.error("ERROR REAL DE SUPABASE:", {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
        });

        return (
            <main className="min-h-screen bg-neutral-950 p-8 text-white">
                <h1 className="text-xl font-semibold text-red-400">
                    Error al consultar los pedidos
                </h1>

                <p className="mt-2 text-neutral-400">
                    No se pudieron cargar los pedidos. Revisa los detalles
                    técnicos a continuación.
                </p>

                <pre className="mt-4 overflow-x-auto whitespace-pre-wrap rounded-xl border border-white/10 bg-neutral-900 p-4 text-sm">
                    {JSON.stringify(
                        {
                            message: error.message,
                            code: error.code,
                            details: error.details,
                            hint: error.hint,
                        },
                        null,
                        2
                    )}
                </pre>
            </main>
        );
    }

    const pendingPayments =
        orders?.filter(
            (order) =>
                !order.payment_status ||
                order.payment_status === "pendiente"
        ).length ?? 0;

    return (
        <main className="min-h-screen bg-neutral-950 p-6 text-white md:p-10">
            <header className="mb-8">
                <p className="text-sm tracking-[0.3em] text-amber-400">
                    LAOBRA
                </p>

                <h1 className="mt-2 text-3xl font-semibold">
                    Administración
                </h1>

                <p className="mt-2 text-neutral-400">
                    Gestiona pedidos y comprueba los pagos de tus clientes.
                </p>
            </header>

            <section className="mb-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-neutral-900 p-5">
                    <p className="text-sm text-neutral-400">
                        Pedidos cargados
                    </p>

                    <p className="mt-2 text-3xl font-semibold">
                        {orders?.length ?? 0}
                    </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-neutral-900 p-5">
                    <p className="text-sm text-neutral-400">
                        Pagos pendientes de revisión
                    </p>

                    <p className="mt-2 text-3xl font-semibold">
                        {pendingPayments}
                    </p>
                </div>
            </section>

            <section className="overflow-x-auto rounded-xl border border-white/10">
                <table className="w-full min-w-[1100px] text-left text-sm">
                    <thead className="bg-neutral-900 text-neutral-300">
                        <tr>
                            <th className="p-4">Pedido</th>
                            <th className="p-4">Cliente</th>
                            <th className="p-4">Total</th>
                            <th className="p-4">Método</th>
                            <th className="p-4">Boleta</th>
                            <th className="p-4">Pago y acciones</th>
                            <th className="p-4">Estado del pedido</th>
                        </tr>
                    </thead>

                    <tbody>
                        {orders?.map((order) => {
                            const boletaUrl = order.public_token
                                ? `/orders/${encodeURIComponent(order.public_token)}`
                                : order.order_number
                                ? `/pedido/${encodeURIComponent(order.order_number)}`
                                : `/pedido/${encodeURIComponent(order.id)}`;

                            return (
                                <tr
                                    key={order.id}
                                    className="border-t border-white/10 align-top"
                                >
                                    <td className="p-4 font-medium text-amber-400">
                                        <a
                                            href={boletaUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 font-semibold text-amber-400 hover:text-amber-300 hover:underline"
                                            title="Abrir boleta de compra"
                                        >
                                            <span>{order.order_number ?? order.id}</span>
                                            <span className="text-[10px] opacity-75">↗</span>
                                        </a>
                                    </td>

                                    <td className="p-4">
                                        {order.buyer_name ?? "Sin nombre"}
                                    </td>

                                    <td className="whitespace-nowrap p-4">
                                        S/{" "}
                                        {Number(order.total_amount).toFixed(2)}
                                    </td>

                                    <td className="p-4">
                                        {order.payment_method ?? "—"}
                                    </td>

                                    <td className="p-4">
                                        <a
                                            href={boletaUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 rounded-md bg-amber-400 px-3 py-1.5 text-xs font-semibold text-neutral-950 shadow-sm transition hover:bg-amber-300"
                                        >
                                            <span>🧾</span>
                                            <span>Ver boleta completa</span>
                                        </a>
                                    </td>

                                    <td className="p-4">
                                        <PaymentActions
                                            orderId={order.id}
                                            initialStatus={order.payment_status}
                                        />
                                    </td>

                                    <td className="p-4">
                                        {order.status ?? "pendiente"}
                                    </td>
                                </tr>
                            );
                        })}

                        {orders?.length === 0 && (
                            <tr>
                                <td
                                    colSpan={7}
                                    className="p-6 text-center text-neutral-400"
                                >
                                    Todavía no hay pedidos.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </section>
        </main>
    );
}
