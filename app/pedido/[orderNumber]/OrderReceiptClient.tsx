"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { WHATSAPP_NUMBER } from "../../lib/constants";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

interface OrderData {
  order_number: string;
  status: string;
  payment_status: string;
  payment_method: string;
  total_amount: number;
  currency: string;
  buyer_name: string;
  buyer_phone?: string;
  recipient_name: string;
  recipient_phone?: string;
  delivery_address: string;
  delivery_reference?: string;
  delivery_date?: string;
  delivery_time?: string;
  dedication?: string;
  dedication_from?: string;
  items: OrderItem[];
  operation_number?: string;
  voucher_url?: string;
  created_at?: string;
}

export default function OrderReceiptPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const resolvedParams = use(params);
  const orderNumber = resolvedParams.orderNumber;

  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);

  useEffect(() => {
    async function fetchOrder() {
      try {
        setLoading(true);
        const res = await fetch(`/api/orders/${orderNumber}`);
        const data = await res.json();

        if (data.success && data.order) {
          setOrder(data.order);
        } else {
          // Intentar rescatar de localStorage si se acaba de crear en la sesión
          const localBackup = localStorage.getItem(`laobra_order_${orderNumber}`);
          if (localBackup) {
            setOrder(JSON.parse(localBackup));
          } else {
            setError(data.error || "Pedido no encontrado");
          }
        }
      } catch (err) {
        console.error("Error al cargar la boleta:", err);
        setError("No se pudo cargar la información de la boleta.");
      } finally {
        setLoading(false);
      }
    }

    if (orderNumber) {
      fetchOrder();
    }
  }, [orderNumber]);

  const formattedTotal = order
    ? new Intl.NumberFormat("es-PE", {
        style: "currency",
        currency: "PEN",
        minimumFractionDigits: 2,
      }).format(order.total_amount)
    : "S/ 0.00";

  const itemsSubtotal =
    order?.items?.reduce(
      (acc, item) => acc + Number(item.price) * item.quantity,
      0
    ) || 0;
  const hasDiscount = order ? itemsSubtotal > order.total_amount + 0.01 : false;
  const discountDifference = hasDiscount ? itemsSubtotal - (order?.total_amount || 0) : 0;

  const formattedSubtotal = new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 2,
  }).format(itemsSubtotal || order?.total_amount || 0);

  const formattedDiscount = new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 2,
  }).format(discountDifference);

  const totalItemsCount = order?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  const getStatusBadge = () => {
    const status = order?.payment_status?.toLowerCase();
    if (status === "pagado" || status === "confirmado") {
      return {
        label: "Confirmación de pago: Confirmado",
        bg: "bg-[#E6F4EA]",
        text: "text-[#137333]",
        border: "border-[#CEEAD6]",
        desc: "Tu pago ha sido validado exitosamente. Tu arreglo está programado para elaboración.",
      };
    }
    return {
      label: "Confirmación de pago: Pendiente",
      bg: "bg-[#FEF7E0]",
      text: "text-[#B06000]",
      border: "border-[#FEEFC3]",
      desc: "Comprobante en proceso de verificación por nuestro equipo.",
    };
  };

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppHelp = () => {
    const message = encodeURIComponent(
      `¡Hola LA OBRA! 🌸 Tengo una consulta sobre mi boleta del pedido *#${orderNumber}*.`
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank", "noopener,noreferrer");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDF8F3] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-10 h-10 border-2 border-black/20 border-t-black rounded-full animate-spin mb-4" />
        <p className="text-sm font-light text-[#6B6560] tracking-wider uppercase">
          Cargando boleta de compra...
        </p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#FDF8F3] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md p-8 bg-white border border-[#F3E2CE] shadow-sm">
          <p className="text-2xl font-serif mb-2">Pedido no encontrado</p>
          <p className="text-xs text-[#6B6560] mb-6">
            No pudimos localizar la boleta asociada al código <strong>#{orderNumber}</strong>.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-black text-white text-xs uppercase tracking-widest hover:bg-black/80 transition-colors"
          >
            Volver a la tienda
          </Link>
        </div>
      </div>
    );
  }

  const badge = getStatusBadge();

  return (
    <div className="min-h-screen bg-[#FAF3EC] py-10 px-4 sm:px-6 lg:px-8 print:bg-white print:py-0 print:px-0">
      <div className="max-w-2xl mx-auto bg-white border border-[#F3E2CE] shadow-lg print:shadow-none print:border-none">
        {/* Cabecera de la boleta */}
        <header className="p-8 border-b border-[#F3E2CE] bg-[#FDF8F3] text-center relative">
          <Link
            href="/"
            className="inline-block text-2xl sm:text-3xl font-light tracking-[0.25em] text-black hover:opacity-70 transition-opacity"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            LA OBRA
          </Link>
          <p className="text-[10px] tracking-[0.3em] uppercase text-[#6B6560] mt-1">
            Flores de autor · Lima, Perú
          </p>
          <div className="mt-4 pt-4 border-t border-[#F3E2CE] flex flex-col sm:flex-row justify-between items-center text-xs text-[#6B6560] gap-2">
            <span>
              Boleta digital: <strong className="text-black">#{order.order_number}</strong>
            </span>
            <span>
              {order.created_at
                ? new Date(order.created_at).toLocaleDateString("es-PE", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Fecha reciente"}
            </span>
          </div>
        </header>

        {/* Banner de Estado de Pago */}
        <div className={`p-4 border-b ${badge.bg} ${badge.border} flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left`}>
          <div>
            <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded text-xs font-semibold uppercase tracking-wider ${badge.text}`}>
              <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
              <span>{badge.label}</span>
            </div>
            <p className="text-xs text-black/70 mt-1">{badge.desc}</p>
          </div>
          <button
            onClick={handleWhatsAppHelp}
            className="text-[11px] underline underline-offset-4 text-black hover:opacity-60 whitespace-nowrap"
          >
            ¿Dudas? Escríbenos
          </button>
        </div>

        {/* Contenido de la Boleta */}
        <div className="p-8 space-y-8 text-xs text-black">
          {/* 1. Detalle de los artículos */}
          <div>
            <h3 className="text-[11px] uppercase tracking-widest text-[#6B6560] font-semibold mb-4 border-b pb-2 border-[#F3E2CE]">
              Detalle del Pedido
            </h3>
            <div className="divide-y divide-[#F3E2CE]">
              {order.items.map((item, index) => (
                <div key={index} className="py-3 flex justify-between items-center gap-4">
                  <div className="flex items-center gap-3">
                    {item.imageUrl && (
                      <div className="w-12 h-14 relative bg-[#F3E2CE] flex-shrink-0 overflow-hidden">
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-black text-sm">{item.name}</p>
                      <p className="text-[#6B6560] text-[11px]">
                        {item.quantity}x a S/ {Number(item.price).toFixed(2)} c/u
                      </p>
                    </div>
                  </div>
                  <span className="font-semibold text-sm">
                    S/ {(Number(item.price) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Totales */}
            <div className="mt-4 pt-4 border-t border-[#F3E2CE] space-y-1.5 text-right">
              <div className="flex justify-between text-[#6B6560]">
                <span>Total de artículos:</span>
                <span>{totalItemsCount} {totalItemsCount === 1 ? "unidad" : "unidades"}</span>
              </div>
              <div className="flex justify-between text-[#6B6560]">
                <span>Subtotal:</span>
                <span>{formattedSubtotal}</span>
              </div>
              {hasDiscount && (
                <div className="flex justify-between text-[#4A6B53] font-medium">
                  <span>Descuento aplicado (15%):</span>
                  <span>-{formattedDiscount}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-semibold text-black pt-2 border-t border-[#F3E2CE]">
                <span>Total pagado:</span>
                <span>{formattedTotal}</span>
              </div>
            </div>
          </div>

          {/* 2. Cliente y Entrega */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-[#F3E2CE]">
            <div className="space-y-2">
              <h4 className="text-[11px] uppercase tracking-widest text-[#6B6560] font-semibold">
                Datos del Cliente
              </h4>
              <p><strong>Comprador:</strong> {order.buyer_name}</p>
              {order.buyer_phone && <p><strong>Teléfono:</strong> {order.buyer_phone}</p>}
              <p className="mt-2"><strong>Destinatario:</strong> {order.recipient_name}</p>
              {order.recipient_phone && <p><strong>Teléfono destinatario:</strong> {order.recipient_phone}</p>}
            </div>

            <div className="space-y-2">
              <h4 className="text-[11px] uppercase tracking-widest text-[#6B6560] font-semibold">
                Datos de Entrega
              </h4>
              <p><strong>Dirección:</strong> {order.delivery_address}</p>
              {order.delivery_reference && (
                <p><strong>Referencia:</strong> {order.delivery_reference}</p>
              )}
              <p>
                <strong>Fecha de entrega:</strong>{" "}
                {order.delivery_date || "Fecha a coordinar"}
              </p>
              <p>
                <strong>Hora solicitada:</strong> {order.delivery_time || "10:00 AM"}
              </p>
            </div>
          </div>

          {/* 3. Dedicatoria en Tarjeta */}
          {order.dedication && (
            <div className="pt-4 border-t border-[#F3E2CE]">
              <h4 className="text-[11px] uppercase tracking-widest text-[#6B6560] font-semibold mb-2">
                💌 Mensaje para la Tarjeta
              </h4>
              <div className="p-4 bg-[#FDF8F3] border border-[#F3E2CE] italic text-sm text-black/85 leading-relaxed rounded">
                &ldquo;{order.dedication}&rdquo;
                {order.dedication_from && (
                  <p className="text-right not-italic text-xs font-semibold mt-2 text-black">
                    — {order.dedication_from}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* 4. Comprobante de Pago */}
          <div className="pt-4 border-t border-[#F3E2CE] space-y-4">
            <h4 className="text-[11px] uppercase tracking-widest text-[#6B6560] font-semibold">
              Información del Pago
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 bg-[#FDF8F3] border border-[#F3E2CE]">
                <p className="text-[#6B6560] text-[10px] uppercase">Método de pago</p>
                <p className="text-sm font-semibold capitalize mt-0.5">
                  {order.payment_method === "mercadopago" ? "Tarjeta (Mercado Pago)" : "Yape / Plin"}
                </p>
                {order.operation_number && (
                  <p className="text-xs text-[#6B6560] mt-1">
                    N° de Operación: <strong className="text-black">{order.operation_number}</strong>
                  </p>
                )}
              </div>

              <div className="p-3 bg-[#FDF8F3] border border-[#F3E2CE]">
                <p className="text-[#6B6560] text-[10px] uppercase">Estado de la transacción</p>
                <p className="text-sm font-semibold mt-0.5">
                  {order.payment_status === "pagado" || order.payment_status === "confirmado"
                    ? "✓ Pago Verificado"
                    : "⏳ Pendiente de Confirmación"}
                </p>
              </div>
            </div>

            {/* Previsualización del Voucher si existe */}
            {order.voucher_url && (
              <div className="mt-4 p-4 bg-[#FDF8F3] border border-[#F3E2CE] rounded">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-semibold text-xs uppercase tracking-wider text-black">
                    📸 Captura del comprobante adjunto
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsVoucherModalOpen(true)}
                    className="text-[11px] underline text-[#B8924A] hover:text-black"
                  >
                    Ver en tamaño completo
                  </button>
                </div>
                <div
                  className="relative w-full max-w-xs mx-auto aspect-[3/4] bg-white border border-[#E8CEAD] overflow-hidden cursor-pointer shadow-sm hover:opacity-90 transition-opacity"
                  onClick={() => setIsVoucherModalOpen(true)}
                >
                  <img
                    src={order.voucher_url}
                    alt="Comprobante de pago"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <footer className="p-6 bg-[#FDF8F3] border-t border-[#F3E2CE] flex flex-col sm:flex-row justify-between items-center gap-4 print:hidden">
          <Link
            href="/"
            className="text-xs uppercase tracking-widest text-[#6B6560] hover:text-black underline underline-offset-4"
          >
            ← Volver a la tienda
          </Link>
          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 text-xs uppercase tracking-wider border border-black hover:bg-black hover:text-white transition-colors"
            >
              Imprimir Boleta
            </button>
            <button
              onClick={handleWhatsAppHelp}
              className="px-5 py-2.5 text-xs uppercase tracking-wider bg-black text-white hover:bg-black/85 transition-colors font-medium"
            >
              Consultar por WhatsApp
            </button>
          </div>
        </footer>
      </div>

      {/* Modal para ver Voucher en tamaño completo */}
      {isVoucherModalOpen && order.voucher_url && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setIsVoucherModalOpen(false)}
        >
          <div className="relative max-w-lg w-full max-h-[90vh] bg-white p-2 rounded shadow-2xl overflow-auto">
            <button
              onClick={() => setIsVoucherModalOpen(false)}
              className="absolute top-3 right-3 p-2 bg-black text-white rounded-full text-xs font-bold"
            >
              ✕
            </button>
            <img
              src={order.voucher_url}
              alt="Comprobante de pago completo"
              className="w-full h-auto object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
