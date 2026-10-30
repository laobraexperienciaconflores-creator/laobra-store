'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';

const COUPON_CODE = 'PRIMERRAMO15';
const DISCOUNT_PERCENTAGE = '15%';

export default function PromoModal() {
  const { applyCoupon, appliedCoupon } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isExitIntent, setIsExitIntent] = useState(false);
  const [exitIntentFired, setExitIntentFired] = useState(false);
  const [hasBeenShown, setHasBeenShown] = useState(false);

  const isAlreadyClaimed = Boolean(appliedCoupon && appliedCoupon.code === COUPON_CODE);

  // 1. Mostrar al entrar a la web (tras 600ms)
  useEffect(() => {
    const welcomeTimer = setTimeout(() => {
      setIsExitIntent(false);
      setIsOpen(true);
      setHasBeenShown(true);
    }, 600);

    return () => clearTimeout(welcomeTimer);
  }, []);

  // 2. Detectar intención de salida (cuando el cursor sube a cerrar la pestaña)
  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !exitIntentFired) {
        setIsExitIntent(true);
        setIsOpen(true);
        setHasBeenShown(true);
        setExitIntentFired(true);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [exitIntentFired]);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(COUPON_CODE);
      setCopied(true);
      applyCoupon(COUPON_CODE);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      setCopied(true);
      applyCoupon(COUPON_CODE);
    }
  };

  const handleApplyAndShop = () => {
    applyCoupon(COUPON_CODE);
    setIsOpen(false);
    const catalog =
      document.getElementById('catalogo') ||
      document.getElementById('ramos') ||
      document.getElementById('productos');
    if (catalog) {
      catalog.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Botón flotante discreto alineado con la paleta si se cierra la ventana */}
      {!isOpen && hasBeenShown && (
        <button
          onClick={() => {
            setIsExitIntent(false);
            setIsOpen(true);
          }}
          className="fixed bottom-6 left-6 z-40 bg-[#000000] hover:bg-[#1A1A1A] text-[#F3E2CE] text-[11px] font-medium tracking-[0.18em] uppercase py-2.5 px-4 rounded-full shadow-2xl border border-[#B8924A]/40 backdrop-blur-md flex items-center gap-2 hover:scale-105 transition-all animate-fadeIn"
          title="Ver descuento del 15%"
        >
          <span className="text-[#B8924A] text-xs">✦</span>
          <span>
            {isAlreadyClaimed ? '15% OFF Activo en tu carrito' : '15% OFF en tu primer ramo'}
          </span>
        </button>
      )}

      {/* Modal Principal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fadeIn">
          {/* Overlay click para cerrar */}
          <div className="fixed inset-0" onClick={handleClose} />

          <div
            className="relative w-full max-w-md bg-[#FFFFFF] rounded-2xl shadow-2xl overflow-hidden border border-[#F3E2CE] z-10 animate-scaleUp transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botón de cierre sutil */}
            <button
              onClick={handleClose}
              aria-label="Cerrar ventana"
              className="absolute top-4 right-4 text-[#6B6560] hover:text-[#000000] bg-[#FAF3EC] hover:bg-[#F3E2CE] rounded-full w-8 h-8 flex items-center justify-center transition-colors z-20"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Encabezado editorial floral con la paleta de LA OBRA */}
            <div className="bg-gradient-to-b from-[#FDF8F3] to-[#FAF3EC] p-8 text-center border-b border-[#F3E2CE] relative">
              {/* Ícono floral artesanal */}
              <div className="inline-flex items-center justify-center w-14 h-14 bg-[#FFFFFF] rounded-full shadow-sm border border-[#E8CEAD] text-[#B8924A] mb-3.5 overflow-hidden">
                <img
                  src="/favicon.ico"
                  alt="logo"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>

              {/* Tag / Badge */}
              <div className="mb-2.5">
                <span className="inline-block px-3.5 py-1 bg-[#000000] text-[#F3E2CE] text-[10px] font-medium uppercase tracking-[0.25em] rounded-full shadow-sm">
                  {isExitIntent ? '¡Espera un momento!' : 'Cortesía de Bienvenida'}
                </span>
              </div>

              {/* Título tipográfico en Georgia / Serif */}
              <h3
                className="text-2xl sm:text-3xl font-light text-[#000000] tracking-tight leading-tight"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
              >
                {isExitIntent ? (
                  <>
                    ¿Te vas sin tu{' '}
                    <span className="font-serif italic text-[#B8924A] font-normal">
                      {DISCOUNT_PERCENTAGE} OFF
                    </span>
                    ?
                  </>
                ) : (
                  <>
                    Obtén un{' '}
                    <span className="font-serif italic text-[#B8924A] font-normal">
                      {DISCOUNT_PERCENTAGE} OFF
                    </span>
                  </>
                )}
              </h3>

              <p className="text-xs sm:text-sm text-[#6B6560] mt-2 max-w-xs mx-auto leading-relaxed">
                Válido en tu <strong className="text-[#000000] font-medium">primer ramo</strong> de diseño floral artesanal.
              </p>
            </div>

            {/* Contenido / Cupón */}
            <div className="p-6 sm:p-7 space-y-4 bg-[#FFFFFF]">
              <div className="bg-[#FDF8F3] border border-dashed border-[#E8CEAD] rounded-xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-[#6B6560] tracking-[0.2em] block mb-0.5">
                    Código de cupón
                  </span>
                  <span className="text-base sm:text-lg font-mono font-bold text-[#000000] tracking-widest">
                    {COUPON_CODE}
                  </span>
                </div>

                <button
                  onClick={handleCopyCode}
                  type="button"
                  className={`px-3.5 py-2 text-xs uppercase tracking-wider font-medium rounded-lg transition-all flex items-center gap-1.5 ${copied
                    ? 'bg-[#4A6B53] text-[#FFFFFF]'
                    : 'bg-[#000000] hover:bg-[#1A1A1A] text-[#FFFFFF]'
                    }`}
                >
                  {copied ? (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      ¡Aplicado!
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copiar
                    </>
                  )}
                </button>
              </div>

              {isAlreadyClaimed && (
                <div className="p-2.5 bg-[#FAF3EC] border border-[#E8CEAD] rounded-lg text-center text-xs text-[#4A6B53] font-medium flex items-center justify-center gap-1.5">
                  <span className="text-sm">✓</span>
                  <span>¡Descuento del 15% activo en tu carrito!</span>
                </div>
              )}

              <button
                onClick={handleApplyAndShop}
                className="w-full py-4 px-6 bg-[#000000] hover:bg-[#1A1A1A] text-[#FFFFFF] text-xs uppercase tracking-[0.2em] font-medium transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2 group"
              >
                <span>Aprovechar 15% y elegir mi ramo</span>
                <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
              </button>

              <p className="text-[11px] text-center text-[#6B6560]">
                * Aplica automáticamente al finalizar tu pedido.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
