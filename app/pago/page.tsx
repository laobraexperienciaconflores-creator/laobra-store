"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { WHATSAPP_NUMBER } from "../lib/constants";

type PaymentState = "aprobado" | "rechazado" | "pendiente" | null;

function PaymentResultContent() {
  const searchParams = useSearchParams();
  const estado = searchParams.get("estado") as PaymentState;
  const pedido = searchParams.get("pedido");
  const [dots, setDots] = useState(".");

  // Animación de puntos suspensivos para estado pendiente
  useEffect(() => {
    if (estado !== "pendiente") return;
    const interval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "." : d + "."));
    }, 500);
    return () => clearInterval(interval);
  }, [estado]);

  const handleWhatsApp = () => {
    const msg =
      estado === "aprobado"
        ? `¡Hola LA OBRA! 🌸 Acabo de pagar con Mercado Pago mi pedido *#${pedido}*. ¿Pueden confirmarme la entrega?`
        : `¡Hola LA OBRA! Tuve un problema con mi pago en Mercado Pago (pedido *#${pedido}*). ¿Pueden ayudarme?`;
    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  // ── Estado APROBADO ─────────────────────────────────────────────────────────
  if (estado === "aprobado") {
    return (
      <div className="min-h-screen bg-[#FAF3EC] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-[#F3E2CE] shadow-lg overflow-hidden">
          {/* Header verde */}
          <div className="bg-[#1A3C2A] px-8 py-10 text-center text-white">
            <div className="w-16 h-16 rounded-full bg-white/10 border-2 border-white/30 flex items-center justify-center mx-auto mb-4">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h1
              className="text-2xl font-light tracking-[0.15em]"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              ¡Pago Aprobado!
            </h1>
            <p className="text-white/70 text-xs mt-2 tracking-wider">
              Mercado Pago · Transacción confirmada
            </p>
          </div>

          {/* Cuerpo */}
          <div className="p-8 space-y-6 text-center">
            {pedido && (
              <div className="p-4 bg-[#FDF8F3] border border-[#F3E2CE]">
                <p className="text-[10px] uppercase tracking-widest text-[#6B6560] mb-1">
                  Número de pedido
                </p>
                <p className="text-xl font-light text-black tracking-wider">
                  #{pedido}
                </p>
              </div>
            )}

            <p className="text-sm font-light text-[#6B6560] leading-relaxed">
              Tu pago fue procesado exitosamente. Nuestro equipo ya recibió tu
              pedido y lo está preparando con cariño. 🌸
            </p>

            <div className="space-y-3">
              {pedido && (
                <Link
                  href={`/pedido/${pedido}`}
                  className="block w-full py-3.5 text-xs uppercase tracking-[0.2em] font-medium bg-black text-white hover:bg-black/85 transition-colors text-center"
                >
                  Ver boleta de compra
                </Link>
              )}
              <button
                onClick={handleWhatsApp}
                className="w-full py-3 text-xs uppercase tracking-wider border border-black text-black hover:bg-black/5 transition-colors"
              >
                Confirmar por WhatsApp
              </button>
              <Link
                href="/"
                className="block text-xs text-[#6B6560] hover:text-black underline underline-offset-4 transition-colors"
              >
                Volver a la tienda
              </Link>
            </div>
          </div>

          <div className="px-8 py-4 bg-[#FDF8F3] border-t border-[#F3E2CE] text-center">
            <p className="text-[10px] text-[#6B6560] tracking-wider">
              Recibirás las flores en la fecha coordinada · LA OBRA
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Estado RECHAZADO ────────────────────────────────────────────────────────
  if (estado === "rechazado") {
    return (
      <div className="min-h-screen bg-[#FAF3EC] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-[#F3E2CE] shadow-lg overflow-hidden">
          {/* Header rojo oscuro */}
          <div className="bg-[#3C1A1A] px-8 py-10 text-center text-white">
            <div className="w-16 h-16 rounded-full bg-white/10 border-2 border-white/30 flex items-center justify-center mx-auto mb-4">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </div>
            <h1
              className="text-2xl font-light tracking-[0.1em]"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              Pago No Aprobado
            </h1>
            <p className="text-white/70 text-xs mt-2">
              La transacción fue rechazada por Mercado Pago
            </p>
          </div>

          {/* Cuerpo */}
          <div className="p-8 space-y-6 text-center">
            <p className="text-sm font-light text-[#6B6560] leading-relaxed">
              No se pudo procesar tu pago. Puede deberse a fondos insuficientes,
              datos incorrectos o restricciones del banco. No te preocupes,{" "}
              <strong className="text-black">no se realizó ningún cobro</strong>.
            </p>

            <div className="p-4 bg-[#FDF8F3] border border-[#F3E2CE] text-left space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-black">
                ¿Qué puedes hacer?
              </p>
              <ul className="text-xs text-[#6B6560] space-y-1">
                <li>• Verifica los datos de tu tarjeta e inténtalo de nuevo.</li>
                <li>• Usa otra tarjeta de crédito o débito.</li>
                <li>• Paga con Yape o Plin (sin comisión).</li>
                <li>• Contáctanos por WhatsApp y te ayudamos.</li>
              </ul>
            </div>

            <div className="space-y-3">
              <Link
                href="/"
                className="block w-full py-3.5 text-xs uppercase tracking-[0.2em] font-medium bg-black text-white hover:bg-black/85 transition-colors text-center"
              >
                Intentar nuevamente
              </Link>
              <button
                onClick={handleWhatsApp}
                className="w-full py-3 text-xs uppercase tracking-wider border border-black text-black hover:bg-black/5 transition-colors"
              >
                Ayuda por WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Estado PENDIENTE ────────────────────────────────────────────────────────
  if (estado === "pendiente") {
    return (
      <div className="min-h-screen bg-[#FAF3EC] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-[#F3E2CE] shadow-lg overflow-hidden">
          {/* Header ámbar */}
          <div className="bg-[#3C2A00] px-8 py-10 text-center text-white">
            <div className="w-16 h-16 rounded-full bg-white/10 border-2 border-white/30 flex items-center justify-center mx-auto mb-4">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <h1
              className="text-2xl font-light tracking-[0.1em]"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              Pago en Proceso
            </h1>
            <p className="text-white/70 text-xs mt-2">
              Verificando con Mercado Pago{dots}
            </p>
          </div>

          {/* Cuerpo */}
          <div className="p-8 space-y-6 text-center">
            {pedido && (
              <div className="p-4 bg-[#FDF8F3] border border-[#F3E2CE]">
                <p className="text-[10px] uppercase tracking-widest text-[#6B6560] mb-1">
                  Número de pedido
                </p>
                <p className="text-xl font-light text-black tracking-wider">
                  #{pedido}
                </p>
              </div>
            )}

            <p className="text-sm font-light text-[#6B6560] leading-relaxed">
              Tu pago está siendo procesado. Algunos métodos (como transferencias
              bancarias) pueden demorar unas horas. Te notificaremos al aprobar.
            </p>

            <div className="space-y-3">
              {pedido && (
                <Link
                  href={`/pedido/${pedido}`}
                  className="block w-full py-3.5 text-xs uppercase tracking-[0.2em] font-medium bg-black text-white hover:bg-black/85 transition-colors text-center"
                >
                  Ver estado del pedido
                </Link>
              )}
              <button
                onClick={handleWhatsApp}
                className="w-full py-3 text-xs uppercase tracking-wider border border-black text-black hover:bg-black/5 transition-colors"
              >
                Consultar por WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Sin estado (acceso directo a /pago) ────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#FAF3EC] flex items-center justify-center p-4">
      <div className="max-w-sm text-center space-y-4">
        <p
          className="text-2xl font-light text-black"
          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          LA OBRA
        </p>
        <p className="text-sm text-[#6B6560]">
          Información de pago no disponible.
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

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF3EC] flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-black/20 border-t-black rounded-full animate-spin" />
        </div>
      }
    >
      <PaymentResultContent />
    </Suspense>
  );
}
