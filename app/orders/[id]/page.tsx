import { notFound } from "next/navigation";
import { getSupabaseAdmin } from "@/app/lib/supabaseAdmin";

export const instant = false;

type OrderPageProps = {
    params: Promise<{ id: string }>;
};

type OrderItem = {
    id?: string;
    name?: string;
    price?: number;
    quantity?: number;
    imageUrl?: string;
    discountAmount?: number;
    couponCode?: string;
    discountPercentage?: number;
    deliveryCost?: number;
    itemsSubtotal?: number;
};

const formatMoney = (amount: number) =>
    new Intl.NumberFormat("es-PE", {
        style: "currency",
        currency: "PEN",
    }).format(amount);


export default async function OrderPage({ params }: OrderPageProps) {
    const { id } = await params;

    // Esta página recibe tokens públicos de pedidos, nunca rutas de archivos.
    if (
        id.toLowerCase().endsWith(".jpg") ||
        id.toLowerCase().endsWith(".jpeg") ||
        id.toLowerCase().endsWith(".png") ||
        id.toLowerCase().endsWith(".webp")
    ) {
        notFound();
    }

    const supabase = getSupabaseAdmin();


    // Busca el pedido mediante su identificador público aleatorio.
    const { data: order, error } = await supabase
        .from("orders")
        .select("*")
        .eq("public_token", id)
        .maybeSingle();

    if (error) {
        console.error("Error consultando el pedido:", error.message);
        throw new Error("No se pudo consultar el pedido.");
    }

    if (!order) {
        notFound();
    }

    const items = (order.items ?? []) as OrderItem[];

    const totalAmount = Number(order.total_amount ?? 0);
    const itemsSubtotal = items.reduce(
        (sum, item) => sum + Number(item.price ?? 0) * Number(item.quantity ?? 1),
        0
    );
    const totalItemsCount = items.reduce(
        (sum, item) => sum + Number(item.quantity ?? 1),
        0
    );

    const metaItem = items[0] as OrderItem | undefined;
    let discountAmount = Number(metaItem?.discountAmount ?? 0);
    let couponCode = metaItem?.couponCode || "";
    let deliveryCost = metaItem?.deliveryCost !== undefined ? Number(metaItem.deliveryCost) : -1;

    if (deliveryCost < 0) {
        if (itemsSubtotal >= 250) {
            deliveryCost = 0;
            discountAmount = Math.max(0, itemsSubtotal - totalAmount);
        } else {
            const fifteenPercent = Math.round(itemsSubtotal * 0.15 * 100) / 100;
            const diffWithDiscount = Math.round((totalAmount - (itemsSubtotal - fifteenPercent)) * 100) / 100;
            const diffNoDiscount = Math.round((totalAmount - itemsSubtotal) * 100) / 100;

            if ([0, 10, 15, 20, 25, 30].includes(diffWithDiscount)) {
                discountAmount = fifteenPercent;
                couponCode = "LAOBRA01";
                deliveryCost = diffWithDiscount;
            } else if ([0, 10, 15, 20, 25, 30].includes(diffNoDiscount)) {
                discountAmount = 0;
                deliveryCost = diffNoDiscount;
            } else if (itemsSubtotal > totalAmount) {
                discountAmount = itemsSubtotal - totalAmount;
                deliveryCost = 0;
            } else {
                deliveryCost = Math.max(0, totalAmount - itemsSubtotal);
            }
        }
    }

    // Genera una URL temporal para visualizar el comprobante privado.
    let voucherSignedUrl: string | null = null;

    if (order.voucher_url) {
        const { data: signedData, error: signedError } =
            await supabase.storage
                .from("payment-vouchers")
                .createSignedUrl(order.voucher_url, 300);

        if (signedError) {
            console.error(
                "Error generando URL del comprobante:",
                signedError.message
            );
        } else {
            voucherSignedUrl = signedData.signedUrl;
        }
    }

    return (
        <main className="min-h-screen bg-[#faf7f2] px-4 py-10 text-[#29251f]">
            <div className="mx-auto max-w-2xl">
                <header className="mb-8 text-center">
                    <p className="text-sm uppercase tracking-[0.3em] text-[#96764c]">
                        LAOBRA
                    </p>
                    <h1 className="mt-3 text-3xl font-semibold">
                        Detalle de tu pedido
                    </h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Experiencias con flores
                    </p>
                </header>

                <section className="rounded-2xl border border-[#e9e0d4] bg-white p-6 shadow-sm sm:p-8">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-5">
                        <div>
                            <p className="text-sm text-gray-500">
                                Número de pedido
                            </p>
                            <p className="text-xl font-semibold">
                                {order.order_number}
                            </p>
                        </div>

                        <span className="rounded-full bg-[#f5eee2] px-3 py-2 text-sm">
                            {order.status ?? "Pendiente"}
                        </span>
                    </div>

                    <h2 className="mb-4 mt-6 text-lg font-semibold">
                        Productos
                    </h2>

                    <div className="space-y-4">
                        {items.map((item, index) => (
                            <div
                                key={item.id ?? `${item.name}-${index}`}
                                className="flex justify-between gap-4"
                            >
                                <div className="flex items-center gap-3">
                                    {item.imageUrl && (
                                        <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border border-[#e9e0d4] bg-[#faf7f2]">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={item.imageUrl}
                                                alt={item.name ?? "Producto"}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-medium">
                                            {item.name ?? "Producto"}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Cantidad: {item.quantity ?? 1}
                                        </p>
                                        {item.imageUrl?.startsWith("data:") && (
                                            <a
                                                href={item.imageUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-block mt-0.5 text-xs text-[#96764c] underline"
                                            >
                                                Ver foto de referencia completa ↗
                                            </a>
                                        )}
                                    </div>
                                </div>

                                <p className="whitespace-nowrap">
                                    {formatMoney(
                                        Number(item.price ?? 0) *
                                        Number(item.quantity ?? 1)
                                    )}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 border-t border-gray-100 pt-5 space-y-3">
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Subtotal ({totalItemsCount} {totalItemsCount === 1 ? "artículo" : "artículos"})</span>
                            <span>{formatMoney(itemsSubtotal)}</span>
                        </div>

                        {discountAmount > 0 && (
                            <div className="flex justify-between text-sm font-medium text-[#4A6B53]">
                                <span>Descuento {couponCode ? `(${couponCode})` : "aplicado"}</span>
                                <span>-{formatMoney(discountAmount)}</span>
                            </div>
                        )}

                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Envío a domicilio</span>
                            <span>
                                {deliveryCost === 0 ? (
                                    <span className="font-medium text-[#4A6B53]">¡GRATIS!</span>
                                ) : (
                                    formatMoney(deliveryCost)
                                )}
                            </span>
                        </div>

                        <div className="flex justify-between text-sm text-gray-600">
                            <span>IGV incluido (18%)</span>
                            <span>
                                {formatMoney(
                                    Number(order.total_amount ?? 0) -
                                    Number(order.total_amount ?? 0) / 1.18
                                )}
                            </span>
                        </div>

                        <div className="flex justify-between border-t border-gray-100 pt-4">
                            <span className="text-lg font-semibold">Total a pagar</span>
                            <span className="text-2xl font-semibold">
                                {formatMoney(Number(order.total_amount ?? 0))}
                            </span>
                        </div>

                        <p className="text-xs text-gray-500">
                            Los precios incluyen el Impuesto General a las Ventas (IGV) del 18%.
                        </p>
                    </div>

                    <div className="mt-6 border-t border-gray-100 pt-5">
                        <h2 className="mb-3 text-lg font-semibold">
                            Datos de entrega
                        </h2>

                        <p>
                            <span className="text-gray-500">
                                Destinatario:
                            </span>{" "}
                            {order.recipient_name}
                        </p>

                        <p className="mt-2">
                            <span className="text-gray-500">
                                Dirección:
                            </span>{" "}
                            {order.delivery_address}
                        </p>

                        {order.delivery_date && (
                            <p className="mt-2">
                                <span className="text-gray-500">
                                    Fecha:
                                </span>{" "}
                                {order.delivery_date}
                            </p>
                        )}

                        {order.delivery_time && (
                            <p className="mt-2">
                                <span className="text-gray-500">
                                    Hora:
                                </span>{" "}
                                {order.delivery_time}
                            </p>
                        )}

                        {order.dedication && (
                            <div className="mt-3">
                                <p className="text-gray-500">
                                    Dedicatoria:
                                </p>
                                <p className="whitespace-pre-wrap">
                                    {order.dedication}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="mt-6 rounded-xl bg-[#faf7f2] p-4">
                        <p className="text-sm text-gray-500">
                            Estado del pago
                        </p>
                        <p className="mt-1 font-medium">
                            {order.payment_status ??
                                "Pendiente de verificación"}
                        </p>
                    </div>

                    {/* Comprobante de pago */}
                    <div className="mt-6 border-t border-gray-100 pt-5">
                        <h2 className="mb-3 text-lg font-semibold">
                            Comprobante de pago
                        </h2>

                        {voucherSignedUrl ? (
                            <div>
                                <a
                                    href={voucherSignedUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-[#96764c] underline underline-offset-4"
                                >
                                    Ver comprobante en tamaño completo
                                </a>

                                <img
                                    src={voucherSignedUrl}
                                    alt="Comprobante de pago del pedido"
                                    className="mt-4 max-h-[500px] w-full rounded-xl border border-[#e9e0d4] bg-[#faf7f2] object-contain"
                                />

                                <p className="mt-2 text-xs text-gray-500">
                                    Imagen del comprobante enviado para
                                    verificar el pago.
                                </p>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">
                                No hay un comprobante disponible para mostrar
                                en este pedido.
                            </p>
                        )}
                    </div>

                    <p className="mt-6 text-center text-xs text-gray-500">
                        Gracias por elegir LAOBRA. Cada flor cuenta una historia.
                    </p>
                </section>
            </div>
        </main>
    );
}
