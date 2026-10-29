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
      // clientY <= 0 indica que el puntero salió por la parte superior de la ventana
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
      {/* Botón flotante discreto si cerró la ventana para que pueda ver su descuento */}
      {!isOpen && hasBeenShown && (
        <button
          onClick={() => {
            setIsExitIntent(false);
            setIsOpen(true);
          }}
          className="fixed bottom-6 left-6 z-40 bg-black/90 hover:bg-black text-white text-xs font-medium py-2.5 px-4 rounded-full shadow-xl border border-rose-200/30 backdrop-blur-md flex items-center gap-2 hover:scale-105 transition-all animate-fadeIn"
          title="Ver descuento del 15%"
        >
          <span className="text-sm">🌸</span>
          <span className="tracking-wide">
            {isAlreadyClaimed ? '15% OFF Activo en tu carrito' : '15% OFF primer ramo'}
          </span>
        </button>
      )}

      {/* Modal Principal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          {/* Overlay click para cerrar */}
          <div className="fixed inset-0" onClick={handleClose} />

          <div
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-rose-100 z-10 animate-scaleUp transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botón de cierre */}
            <button
              onClick={handleClose}
              aria-label="Cerrar ventana"
              className="absolute top-3.5 right-3.5 text-zinc-400 hover:text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Encabezado decorativo floral */}
            <div className="bg-gradient-to-br from-rose-50 via-rose-100/70 to-pink-50 p-6 text-center border-b border-rose-100">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-white rounded-full shadow-md text-rose-500 mb-3">
                <span className="text-2xl" role="img" aria-label="Ramo de flores">💐</span>
              </div>

              <span className="inline-block px-3 py-1 bg-rose-500 text-white text-xs font-semibold uppercase tracking-wider rounded-full shadow-sm mb-2">
                {isExitIntent ? '¡Espera un momento!' : 'Regalo de Bienvenida'}
              </span>

              <h3 
                className="text-2xl font-bold text-zinc-900 tracking-tight"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
              >
                {isExitIntent ? (
                  <>¿Te vas sin tu <span className="text-rose-600">{DISCOUNT_PERCENTAGE} OFF</span>?</>
                ) : (
                  <>Obtén un <span className="text-rose-600">{DISCOUNT_PERCENTAGE} OFF</span></>
                )}
              </h3>

              <p className="text-sm text-zinc-600 mt-1 max-w-xs mx-auto">
                Válido en tu <strong className="text-zinc-800">primer ramo</strong> de diseño floral artesanal.
              </p>
            </div>

            {/* Contenido / Cupón */}
            <div className="p-6 space-y-4">
              <div className="bg-zinc-50 border-2 border-dashed border-rose-300 rounded-xl p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">Código de cupón</span>
                  <span className="text-lg font-mono font-bold text-rose-600 tracking-wider">
                    {COUPON_CODE}
                  </span>
                </div>

                <button
                  onClick={handleCopyCode}
                  type="button"
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                    copied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-zinc-900 hover:bg-zinc-800 text-white'
                  }`}
                >
                  {copied ? (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      ¡Aplicado!
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copiar y Aplicar
                    </>
                  )}
                </button>
              </div>

              {isAlreadyClaimed && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-center text-xs text-emerald-800 font-medium flex items-center justify-center gap-1.5">
                  <span>✓</span>
                  <span>¡Descuento del 15% activo en tu carrito!</span>
                </div>
              )}

              <button
                onClick={handleApplyAndShop}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-medium rounded-xl shadow-lg shadow-rose-500/25 transition-all text-sm flex items-center justify-center gap-2 group"
              >
                <span>Aplicar 15% y elegir mi ramo</span>
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </button>

              <p className="text-[11px] text-center text-zinc-400">
                * Se descuenta el 15% directamente del total al finalizar tu pedido.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
