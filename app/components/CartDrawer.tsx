"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useCart } from "../context/CartContext";
import { WHATSAPP_NUMBER } from "../lib/constants";

export default function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    clearCart,
    totalCount,
    subtotal,
    totalPrice,
    discountAmount,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    orderDetails,
    updateOrderDetails,
  } = useCart();

  const [activeTab, setActiveTab] = useState<"items" | "delivery" | "payment">("items");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"yape_plin" | "mercadopago">("yape_plin");
  const [operationNumber, setOperationNumber] = useState("");
  const [voucherFile, setVoucherFile] = useState<string | null>(null);
  const [voucherFileName, setVoucherFileName] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [mpError, setMpError] = useState<string | null>(null);
  const [couponInput, setCouponInput] = useState("");
  const [couponMessage, setCouponMessage] = useState<{ success: boolean; text: string } | null>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleApplyCoupon = () => {
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput);
    setCouponMessage({ success: res.success, text: res.message });
    if (res.success) {
      setCouponInput("");
    }
  };

  // Lock body scroll and handle ESC key
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") closeCart();
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [isOpen, closeCart]);

  const formattedTotal = new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 0,
  }).format(totalPrice);

  const formattedSubtotal = new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 0,
  }).format(subtotal);

  const formattedDiscount = new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 0,
  }).format(discountAmount);

  const formatShortDate = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      const parts = dateStr.split("-");
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}`;
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  const handleCopyPhone = () => {
    navigator.clipboard.writeText("988559304");
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleVoucherUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setValidationError("El comprobante debe pesar menos de 5MB.");
      return;
    }

    setVoucherFileName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      setVoucherFile(reader.result as string);
      setValidationError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveVoucher = () => {
    setVoucherFile(null);
    setVoucherFileName(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const validateDeliveryDetails = () => {
    if (!orderDetails.deliveryAddress.trim()) {
      setActiveTab("delivery");
      setValidationError("Por favor, ingresa la dirección de entrega para el motorizado.");
      return false;
    }
    if (!orderDetails.recipientName.trim()) {
      setActiveTab("delivery");
      setValidationError("Por favor, indica el nombre de la persona que recibe las flores.");
      return false;
    }
    if (!orderDetails.buyerName.trim()) {
      setActiveTab("delivery");
      setValidationError("Por favor, ingresa tu nombre (quien realiza la compra).");
      return false;
    }
    setValidationError(null);
    return true;
  };

  const handleProceedToPayment = () => {
    if (validateDeliveryDetails()) {
      setActiveTab("payment");
    }
  };

  // 1. Checkout con Yape / Plin + Comprobante por WhatsApp
  const handleCheckoutYapePlin = async () => {
    if (items.length === 0 || isSubmitting) return;
    if (!validateDeliveryDetails()) return;

    setIsSubmitting(true);

    setIsSubmitting(true);

    let generatedOrderNumber = "";
    let generatedPublicToken = "";

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          orderDetails,
          totalPrice,
          paymentMethod: "yape_plin",
          operationNumber,
          voucherUrl: voucherFile,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data?.publicToken || !data?.orderNumber) {
        throw new Error(
          data?.error || "No se pudo registrar el pedido."
        );
      }

      generatedOrderNumber = data.orderNumber;
      generatedPublicToken = data.publicToken;
    } catch (err) {
      console.error("Error al registrar el pedido:", err);
      setValidationError(
        "No se pudo registrar tu pedido. Inténtalo nuevamente."
      );
      return;
    } finally {
      setIsSubmitting(false);
    }


    const shortDate = formatShortDate(orderDetails.deliveryDate) || "A coordinar";
    const hora = orderDetails.deliveryTime || "10:00 AM";
    const fechaEntrega = orderDetails.deliveryDate ? `${shortDate} - ${hora}` : `A coordinar - ${hora}`;

    const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

    // Encabezado estilo referencia
    let message = `*La Obra #${generatedOrderNumber}*\n\n`;

    // Items
    items.forEach((item) => {
      message += `${item.quantity}x ${item.name} S/ ${(item.price * item.quantity).toFixed(2)}\n`;
    });
    message += "\n";

    // Totales
    message += `Total del artículo: S/ ${subtotal.toFixed(2)} (Cantidad: ${itemCount})\n`;
    message += `Subtotal: S/ ${subtotal.toFixed(2)}\n`;
    if (appliedCoupon && discountAmount > 0) {
      message += `Descuento ${appliedCoupon.discountPercentage}% (${appliedCoupon.code}): -S/ ${discountAmount.toFixed(2)}\n`;
    }
    message += `*Total a pagar: S/ ${totalPrice.toFixed(2)}*\n`;
    message += "\n";

    // Cliente
    const clientePhone = orderDetails.buyerPhone.trim() ? ` ${orderDetails.buyerPhone.trim()}` : "";
    message += `Cliente: ${orderDetails.buyerName.trim()}${clientePhone}\n`;
    message += "\n";

    // Delivery / Entrega
    message += `Delivery: Entrega a domicilio\n`;
    message += `└ ${orderDetails.deliveryAddress.trim()}`;
    if (orderDetails.deliveryReference.trim()) {
      message += `, ${orderDetails.deliveryReference.trim()}`;
    }
    message += "\n";
    if (orderDetails.deliveryLocationUrl?.trim()) {
      message += `└ Ubicación: ${orderDetails.deliveryLocationUrl.trim()}\n`;
    }
    message += `└ Fecha: ${fechaEntrega}\n`;

    // Quien recibe
    if (orderDetails.recipientName.trim()) {
      const recipientPhone = orderDetails.recipientPhone.trim() ? ` ${orderDetails.recipientPhone.trim()}` : "";
      message += `└ Recibe: ${orderDetails.recipientName.trim()}${recipientPhone}\n`;
    }
    message += "\n";

    // Dedicatoria
    if (orderDetails.dedication.trim()) {
      message += `Dedicatoria para la tarjeta\n`;
      message += `└ "${orderDetails.dedication.trim()}"`;
      if (orderDetails.dedicationFrom.trim()) {
        message += ` — De: ${orderDetails.dedicationFrom.trim()}`;
      }
      message += "\n\n";
    }

    // Pago
    if (operationNumber.trim()) {
      message += `Pago: YAPE/PLIN (N° Op. ${operationNumber.trim()})\n`;
    } else {
      message += `Pago: YAPE/PLIN (Confirming Payment)\n`;
    }
    if (voucherFile) {
      message += "└ Comprobante adjunto 📸\n";
    } else {
      message += "└ Adjuntaré el comprobante en este chat.\n";
    }
    message += "\n";

    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
      window.location.origin;
    const invoiceUrl = `${baseUrl}/orders/${generatedPublicToken}`;

    message += `🧾 Ver factura: ${invoiceUrl}\n\n`;
    message += `Enviado desde www.laobra.pe`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`, "_blank", "noopener,noreferrer");
  };

  // 2. Checkout con Mercado Pago (Tarjeta)
  const handleCheckoutMercadoPago = async () => {
    if (items.length === 0 || isSubmitting) return;
    if (!validateDeliveryDetails()) return;

    setIsSubmitting(true);
    setMpError(null);

    try {
      // 1. Registrar el pedido en Supabase
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          orderDetails,
          totalPrice,
          paymentMethod: "mercadopago",
        }),
      });
      const orderData = await orderRes.json();
      const orderNumber = orderData?.orderNumber || "LAOBRA-0001";

      // 2. Crear preferencia de pago en Mercado Pago
      const mpRes = await fetch("/api/mercadopago/create-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          orderNumber,
          buyerName: orderDetails.buyerName.trim(),
          buyerEmail: "cliente@laobra.pe",
          orderDetails, // para pre-rellenar datos en MP
        }),
      });
      const mpData = await mpRes.json();

      if (!mpData?.success) {
        setMpError(
          mpData?.error ||
          "No se pudo iniciar Mercado Pago. Verifica las credenciales en .env.local."
        );
        setIsSubmitting(false);
        return;
      }

      // En producción usar init_point, en desarrollo sandbox_init_point
      const redirectUrl =
        process.env.NODE_ENV === "production"
          ? mpData.init_point
          : (mpData.sandbox_init_point || mpData.init_point);

      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        setMpError("No se obtuvo URL de pago de Mercado Pago.");
        setIsSubmitting(false);
      }
    } catch (err: any) {
      console.error("Error en checkout Mercado Pago:", err);
      setMpError(
        "Hubo un error al conectar con Mercado Pago. Por favor intenta con Yape/Plin."
      );
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden"
      aria-labelledby="cart-heading"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div
          ref={drawerRef}
          className="w-screen max-w-lg bg-[#FFFFFF] shadow-2xl flex flex-col justify-between border-l border-[#F3E2CE] animate-in slide-in-from-right duration-300"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-[#F3E2CE] flex items-center justify-between bg-[#FDF8F3]">
            <div className="flex items-center gap-3">
              <h2
                id="cart-heading"
                className="text-xl font-light tracking-wide text-black"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
              >
                Tu Carrito
              </h2>
              {totalCount > 0 && (
                <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-[#000000] text-white">
                  {totalCount} {totalCount === 1 ? "arreglo" : "arreglos"}
                </span>
              )}
            </div>

            <button
              onClick={closeCart}
              className="p-2 text-black/60 hover:text-black transition-colors rounded-full hover:bg-black/5"
              aria-label="Cerrar carrito"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Navigation Steps / Tabs */}
          {items.length > 0 && (
            <div className="grid grid-cols-3 border-b border-[#F3E2CE] bg-[#FAF3EC] text-[11px] uppercase tracking-wider font-medium text-center">
              <button
                onClick={() => {
                  setActiveTab("items");
                  setValidationError(null);
                }}
                className={`py-3 px-2 border-b-2 transition-all flex items-center justify-center gap-1 ${activeTab === "items"
                  ? "border-black text-black bg-white"
                  : "border-transparent text-[#6B6560] hover:text-black"
                  }`}
              >
                <span>1. Arreglos</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab("delivery");
                  setValidationError(null);
                }}
                className={`py-3 px-2 border-b-2 transition-all flex items-center justify-center gap-1 ${activeTab === "delivery"
                  ? "border-black text-black bg-white"
                  : "border-transparent text-[#6B6560] hover:text-black"
                  }`}
              >
                <span>2. Entrega</span>
              </button>
              <button
                onClick={handleProceedToPayment}
                className={`py-3 px-2 border-b-2 transition-all flex items-center justify-center gap-1 ${activeTab === "payment"
                  ? "border-black text-black bg-white"
                  : "border-transparent text-[#6B6560] hover:text-black"
                  }`}
              >
                <span>3. Pago</span>
              </button>
            </div>
          )}

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
                  style={{ background: "#FAF3EC" }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#B8924A"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 0 1-8 0" />
                  </svg>
                </div>

                <p
                  className="text-2xl font-light text-black mb-2"
                  style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                >
                  Tu carrito está vacío
                </p>
                <p className="text-sm font-light text-[#6B6560] max-w-xs mb-8">
                  Explora nuestra selección y elige las flores perfectas para regalar o transformar tu espacio.
                </p>

                <button
                  onClick={() => {
                    closeCart();
                    document.querySelector("#catalogo")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="px-8 py-3.5 text-xs uppercase tracking-[0.2em] font-medium bg-black text-white hover:bg-black/85 transition-colors"
                >
                  Explorar catálogo
                </button>
              </div>
            ) : activeTab === "items" ? (
              /* TAB 1: PRODUCT ITEMS */
              <div className="space-y-6">
                <div className="divide-y divide-[#F3E2CE]">
                  {items.map((item) => {
                    const itemFormattedSubtotal = new Intl.NumberFormat("es-PE", {
                      style: "currency",
                      currency: "PEN",
                      minimumFractionDigits: 0,
                    }).format(item.price * item.quantity);

                    return (
                      <div key={item.id} className="py-4 flex gap-4 items-center">
                        {/* Thumbnail */}
                        <div className="relative w-20 h-24 flex-shrink-0 overflow-hidden bg-[#F3E2CE]">
                          <Image
                            src={item.imageUrl}
                            alt={item.name}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <h3
                              className="text-base font-light text-black truncate"
                              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                            >
                              {item.name}
                            </h3>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-[#6B6560] hover:text-black p-1 transition-colors"
                              aria-label={`Eliminar ${item.name}`}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M3 6h18" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                                <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              </svg>
                            </button>
                          </div>

                          <p className="text-xs text-[#6B6560] mt-0.5">
                            S/ {item.price} c/u
                          </p>

                          <div className="flex justify-between items-center mt-3">
                            {/* Quantity Selector */}
                            <div className="flex items-center border border-[#E8CEAD] bg-[#FFFFFF]">
                              <button
                                onClick={() => updateQuantity(item.id, -1)}
                                className="w-7 h-7 flex items-center justify-center text-black/70 hover:text-black hover:bg-[#FAF3EC] transition-colors"
                                aria-label="Disminuir cantidad"
                              >
                                -
                              </button>
                              <span className="w-8 text-center text-xs font-medium text-black">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, 1)}
                                className="w-7 h-7 flex items-center justify-center text-black/70 hover:text-black hover:bg-[#FAF3EC] transition-colors"
                                aria-label="Aumentar cantidad"
                              >
                                +
                              </button>
                            </div>

                            <span className="text-sm font-medium text-black">
                              {itemFormattedSubtotal}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Actions */}
                <div className="pt-2 flex justify-between items-center">
                  <button
                    onClick={clearCart}
                    className="text-xs text-[#6B6560] hover:text-black underline underline-offset-2 transition-colors"
                  >
                    Vaciar carrito
                  </button>

                  <button
                    onClick={() => setActiveTab("delivery")}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-xs tracking-widest uppercase font-medium bg-black text-white hover:bg-black/85 transition-colors"
                  >
                    <span>Datos de entrega</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                </div>
              </div>
            ) : activeTab === "delivery" ? (
              /* TAB 2: DELIVERY & DEDICATION DETAILS */
              <div className="space-y-6">
                {validationError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-800 rounded">
                    ⚠️ {validationError}
                  </div>
                )}

                {/* Section 1: Quién compra */}
                <div className="p-4 bg-[#FDF8F3] border border-[#F3E2CE] space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-black">
                      👤 Datos de quien compra
                    </span>
                    <span className="text-[10px] text-[#6B6560]">(Para coordinar el pago)</span>
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#6B6560] uppercase mb-1">
                      Nombre y Apellido <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Carlos Méndez"
                      value={orderDetails.buyerName}
                      onChange={(e) => updateOrderDetails({ buyerName: e.target.value })}
                      className="w-full text-xs px-3 py-2 border border-[#E8CEAD] focus:outline-none focus:border-black bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#6B6560] uppercase mb-1">
                      Teléfono / WhatsApp de contacto
                    </label>
                    <input
                      type="tel"
                      placeholder="Ej. 987 654 321"
                      value={orderDetails.buyerPhone}
                      onChange={(e) => updateOrderDetails({ buyerPhone: e.target.value })}
                      className="w-full text-xs px-3 py-2 border border-[#E8CEAD] focus:outline-none focus:border-black bg-white"
                    />
                  </div>
                </div>

                {/* Section 2: Quién recibe */}
                <div className="p-4 bg-[#FDF8F3] border border-[#F3E2CE] space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-black">
                      🎁 Datos de quien recibe
                    </span>
                    <span className="text-[10px] text-[#6B6560]">(Destinataria/o de las flores)</span>
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#6B6560] uppercase mb-1">
                      Nombre de quien recibe <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Valeria Torres"
                      value={orderDetails.recipientName}
                      onChange={(e) => updateOrderDetails({ recipientName: e.target.value })}
                      className="w-full text-xs px-3 py-2 border border-[#E8CEAD] focus:outline-none focus:border-black bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#6B6560] uppercase mb-1">
                      Teléfono de quien recibe (opcional)
                    </label>
                    <input
                      type="tel"
                      placeholder="Por si el motorizado no ubica el timbre"
                      value={orderDetails.recipientPhone}
                      onChange={(e) => updateOrderDetails({ recipientPhone: e.target.value })}
                      className="w-full text-xs px-3 py-2 border border-[#E8CEAD] focus:outline-none focus:border-black bg-white"
                    />
                  </div>
                </div>

                {/* Section 3: Entrega para el motorizado */}
                <div className="p-4 bg-[#FDF8F3] border border-[#F3E2CE] space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-black">
                      📍 Entrega (para el motorizado)
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#6B6560] uppercase mb-1">
                      Dirección exacta <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Av. Canada, La Victoria"
                      value={orderDetails.deliveryAddress}
                      onChange={(e) => updateOrderDetails({ deliveryAddress: e.target.value })}
                      className="w-full text-xs px-3 py-2 border border-[#E8CEAD] focus:outline-none focus:border-black bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#6B6560] uppercase mb-1">
                      Referencia o interior (Dpto / Oficina)
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Dpto. 401, frente al parque, portón blanco"
                      value={orderDetails.deliveryReference}
                      onChange={(e) => updateOrderDetails({ deliveryReference: e.target.value })}
                      className="w-full text-xs px-3 py-2 border border-[#E8CEAD] focus:outline-none focus:border-black bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#6B6560] uppercase mb-1">
                      Link de ubicación en mapa <span className="text-[10px] text-[#6B6560]/70 lowercase font-normal">(opcional)</span>
                    </label>
                    <input
                      type="url"
                      placeholder="Ej. https://maps.app.goo.gl/... o link de Waze"
                      value={orderDetails.deliveryLocationUrl || ""}
                      onChange={(e) => updateOrderDetails({ deliveryLocationUrl: e.target.value })}
                      className="w-full text-xs px-3 py-2 border border-[#E8CEAD] focus:outline-none focus:border-black bg-white placeholder:text-[#6B6560]/60"
                    />
                    <p className="text-[10px] text-[#6B6560] mt-1">
                      📍 Puedes pegar el enlace de Google Maps o Waze para que el motorizado llegue más rápido y exacto.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] text-[#6B6560] uppercase mb-1">
                        Fecha de entrega
                      </label>
                      <input
                        type="date"
                        min={new Date().toISOString().split("T")[0]}
                        value={orderDetails.deliveryDate}
                        onChange={(e) => updateOrderDetails({ deliveryDate: e.target.value })}
                        className="w-full text-xs px-3 py-2 border border-[#E8CEAD] focus:outline-none focus:border-black bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-[#6B6560] uppercase mb-1">
                        Hora o rango solicitado
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. 10:00 AM o Mañana 9am-1pm"
                        value={orderDetails.deliveryTime}
                        onChange={(e) => updateOrderDetails({ deliveryTime: e.target.value })}
                        className="w-full text-xs px-3 py-2 border border-[#E8CEAD] focus:outline-none focus:border-black bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 4: Dedicatoria para la tarjeta */}
                <div className="p-4 bg-[#FDF8F3] border border-[#F3E2CE] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-black">
                      💌 Dedicatoria para la tarjeta
                    </span>
                    <span className="text-[10px] text-[#B8924A] font-medium">Gratis</span>
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#6B6560] uppercase mb-1">
                      Mensaje de la tarjeta
                    </label>
                    <textarea
                      rows={3}
                      value={orderDetails.dedication}
                      onChange={(e) => updateOrderDetails({ dedication: e.target.value })}
                      placeholder="Escribe aquí las palabras especiales que acompañarán tu regalo floral..."
                      className="w-full text-xs px-3 py-2 border border-[#E8CEAD] focus:outline-none focus:border-black bg-white resize-none"
                      maxLength={250}
                    />
                    <div className="flex justify-between items-center text-[10px] text-[#6B6560] mt-0.5">
                      <span>Tarjetón exclusivo LA OBRA caligrafiado</span>
                      <span>{orderDetails.dedication.length}/250</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#6B6560] uppercase mb-1">
                      Firma / De parte de (opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Con amor, Carlos"
                      value={orderDetails.dedicationFrom}
                      onChange={(e) => updateOrderDetails({ dedicationFrom: e.target.value })}
                      className="w-full text-xs px-3 py-2 border border-[#E8CEAD] focus:outline-none focus:border-black bg-white"
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* TAB 3: Método de Pago (Yape / Plin con Comprobante y Mercado Pago) */
              <div className="space-y-6">
                {validationError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-800 rounded">
                    {validationError}
                  </div>
                )}

                {mpError && (
                  <div className="p-3 bg-amber-50 border border-amber-200 text-xs text-amber-900 rounded">
                    {mpError}
                  </div>
                )}

                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-black block mb-3">
                    Elige cómo deseas pagar
                  </span>

                  {/* Selector de métodos de pago */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("yape_plin")}
                      className={`p-3.5 border text-left transition-all relative ${paymentMethod === "yape_plin"
                        ? "border-black bg-[#FAF3EC] shadow-sm"
                        : "border-[#E8CEAD] bg-white hover:border-black/50"
                        }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-black">Yape / Plin</span>
                        <span className="text-[9px] px-1.5 py-0.5 bg-[#4A6B53] text-white rounded">
                          0% comisión
                        </span>
                      </div>
                      <p className="text-[11px] text-[#6B6560] leading-tight">
                        Transferencia con QR y comprobante
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("mercadopago")}
                      className={`p-3.5 border text-left transition-all relative ${paymentMethod === "mercadopago"
                        ? "border-black bg-[#FAF3EC] shadow-sm"
                        : "border-[#E8CEAD] bg-white hover:border-black/50"
                        }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-black">Tarjeta</span>
                        <span className="text-[9px] px-1.5 py-0.5 bg-black text-white rounded">
                          Online
                        </span>
                      </div>
                      <p className="text-[11px] text-[#6B6560] leading-tight">
                        Visa, Mastercard vía Mercado Pago
                      </p>
                    </button>
                  </div>
                </div>

                {/* Sub-bloque 1: Yape / Plin */}
                {paymentMethod === "yape_plin" && (
                  <div className="space-y-4">
                    <div className="p-4 bg-[#FDF8F3] border border-[#F3E2CE] space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#742284]" />
                          <span className="text-xs font-medium text-black">Yape</span>
                          <span className="text-[#6B6560]">/</span>
                          <span className="w-2.5 h-2.5 rounded-full bg-[#00D4FF]" />
                          <span className="text-xs font-medium text-black">Plin</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-semibold text-black block">
                            {formattedTotal}
                          </span>
                          {appliedCoupon && discountAmount > 0 && (
                            <span className="text-[10px] text-[#4A6B53] font-medium block">
                              15% desc. aplicado
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="p-3 bg-white border border-[#E8CEAD] flex items-center justify-between">
                        <div>
                          <p className="text-[10px] text-[#6B6560] uppercase">Número a yapear / plinear</p>
                          <p className="text-sm font-semibold tracking-wider text-black">988 559 304</p>
                          <p className="text-[10px] text-[#6B6560]">Titular: Mateo Contreras</p>
                        </div>
                        <button
                          type="button"
                          onClick={handleCopyPhone}
                          className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-medium border border-black hover:bg-black hover:text-white transition-colors"
                        >
                          {isCopied ? "¡Copiado!" : "Copiar"}
                        </button>
                      </div>

                      {/* Código QR de Yape */}
                      <div className="mt-4 rounded-2xl border border-pink-200 bg-white p-4 text-center">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Paga escaneando nuestro QR
                        </h3>

                        <p className="mt-1 text-sm text-gray-600">
                          Escanea el código QR con tu aplicación de pago y realiza el pago
                          por el monto exacto de tu pedido.
                        </p>

                        <div className="mx-auto mt-4 w-full max-w-[280px]">
                          <Image
                            src="/products/qr-yape.png"
                            alt="Código QR de Yape para pagar a LAOBRA"
                            width={600}
                            height={600}
                            className="h-auto w-full rounded-xl object-contain"
                            priority
                          />
                        </div>

                        <p className="mt-3 text-xs text-gray-500">
                          Después de pagar, adjunta tu comprobante para que podamos verificarlo.
                        </p>
                      </div>

                      {/* Número de operación */}
                      <div>
                        <label className="block text-[11px] text-[#6B6560] uppercase mb-1">
                          Número de operación (opcional)
                        </label>
                        <input
                          type="text"
                          placeholder="Ej. 12345678"
                          value={operationNumber}
                          onChange={(e) => setOperationNumber(e.target.value)}
                          className="w-full text-xs px-3 py-2 border border-[#E8CEAD] focus:outline-none focus:border-black bg-white"
                        />
                      </div>

                      {/* Carga de comprobante */}
                      <div>
                        <label className="block text-[11px] text-[#6B6560] uppercase mb-1">
                          📸 Captura del comprobante (voucher)
                        </label>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleVoucherUpload}
                          className="hidden"
                          id="voucher-input"
                        />

                        {voucherFile ? (
                          <div className="p-3 bg-white border border-[#4A6B53] flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 relative bg-[#FAF3EC] border overflow-hidden">
                                <img
                                  src={voucherFile}
                                  alt="Comprobante"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="text-left">
                                <p className="text-xs font-medium text-black truncate max-w-[160px]">
                                  {voucherFileName || "Comprobante cargado"}
                                </p>
                                <span className="text-[10px] text-[#4A6B53]">✓ Listo para registrar</span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={handleRemoveVoucher}
                              className="text-xs text-red-600 hover:underline"
                            >
                              Quitar
                            </button>
                          </div>
                        ) : (
                          <label
                            htmlFor="voucher-input"
                            className="w-full py-3 px-4 border border-dashed border-[#B8924A] bg-white hover:bg-[#FAF3EC] cursor-pointer flex items-center justify-center gap-2 text-xs text-black transition-colors"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                              <polyline points="17 8 12 3 7 8" />
                              <line x1="12" y1="3" x2="12" y2="15" />
                            </svg>
                            <span>Subir captura de pantalla / foto del voucher</span>
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub-bloque 2: Mercado Pago 
                {paymentMethod === "mercadopago" && (
                  <div className="p-4 bg-[#FDF8F3] border border-[#F3E2CE] space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-black">
                        Pago con Tarjetas
                      </span>
                      <span className="text-[10px] px-2 py-0.5 bg-black text-white rounded">
                        Mercado Pago
                      </span>
                    </div>

                    <p className="text-xs text-[#6B6560] leading-relaxed">
                      Paga de forma 100% segura con tu tarjeta de crédito o débito Visa, Mastercard o American Express a través de la pasarela protegida de Mercado Pago Perú.
                    </p>

                    <div className="flex items-center gap-2 py-2 border-y border-[#F3E2CE] text-[11px] text-[#6B6560]">
                      <span className="font-semibold text-black">Aceptamos:</span>
                      <span>Visa · Mastercard · Diners · Amex · Débito y Crédito</span>
                    </div>

                    <div className="p-3 bg-white border border-[#E8CEAD] flex items-center justify-between">
                      <span className="text-xs text-[#6B6560]">Monto total a procesar:</span>
                      <span className="text-sm font-semibold text-black">{formattedTotal}</span>
                    </div>
                  </div>
                )}*/}

                {/* Sub-bloque 2: Mercado Pago - Próximamente */}
                {paymentMethod === "mercadopago" && (
                  <div className="p-4 bg-[#FDF8F3] border border-[#F3E2CE] space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-semibold uppercase tracking-wider text-black">
                        Pago con tarjetas
                      </span>

                      <span className="text-[10px] font-semibold px-2 py-1 bg-[#EDE5DA] text-[#6B6560] rounded">
                        PRÓXIMAMENTE
                      </span>
                    </div>

                    <p className="text-xs text-[#6B6560] leading-relaxed">
                      Estamos preparando los pagos en línea con Mercado Pago para que
                      puedas comprar tus flores de forma fácil y segura.
                    </p>

                    <div className="flex items-center gap-2 py-2 border-y border-[#F3E2CE] text-[11px] text-[#6B6560]">
                      <span className="font-semibold text-black">Muy pronto:</span>
                      <span>Visa · Mastercard · Débito y crédito</span>
                    </div>

                    <div className="p-3 bg-white border border-[#E8CEAD] flex items-center gap-2">
                      <span className="text-[#8A7560]">ⓘ</span>
                      <span className="text-xs text-[#6B6560]">
                        Por ahora, puedes pagar mediante Yape o Plin.
                      </span>
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>

          {/* Footer Checkout Area */}
          {items.length > 0 && (
            <div className="p-6 bg-[#FDF8F3] border-t border-[#F3E2CE] space-y-4">
              {/* Sección de Cupón de Descuento */}
              <div className="p-3 bg-white border border-[#E8CEAD] rounded-lg">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">🏷️</span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-black tracking-wider">
                            {appliedCoupon.code}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 bg-[#FAF3EC] text-[#4A6B53] border border-[#E8CEAD] rounded font-medium">
                            -{appliedCoupon.discountPercentage}%
                          </span>
                        </div>
                        <p className="text-[10px] text-[#4A6B53]">
                          Ahorras S/ {discountAmount.toFixed(2)} en tu primer ramo
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-[11px] text-[#6B6560] hover:text-red-600 underline transition-colors"
                    >
                      Quitar
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Código de descuento (ej. PRIMERRAMO15)"
                        value={couponInput}
                        onChange={(e) => {
                          setCouponInput(e.target.value.toUpperCase());
                          setCouponMessage(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleApplyCoupon();
                          }
                        }}
                        className="flex-1 text-xs px-3 py-2 bg-[#FDF8F3] border border-[#E8CEAD] focus:outline-none focus:border-black uppercase font-mono tracking-wider text-black placeholder:text-[#6B6560]/60 placeholder:normal-case"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        className="px-4 py-2 text-xs font-medium uppercase tracking-wider bg-black text-white hover:bg-black/85 transition-colors"
                      >
                        Aplicar
                      </button>
                    </div>
                    {couponMessage && (
                      <p
                        className={`text-[11px] mt-1.5 ${couponMessage.success ? "text-[#4A6B53]" : "text-red-600"
                          }`}
                      >
                        {couponMessage.text}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-[#6B6560]">
                  <span>Subtotal ({totalCount} {totalCount === 1 ? "arreglo" : "arreglos"})</span>
                  <span>{formattedSubtotal}</span>
                </div>

                {appliedCoupon && discountAmount > 0 && (
                  <div className="flex justify-between text-xs text-[#4A6B53] font-medium">
                    <span className="flex items-center gap-1">
                      <span>🏷️ Descuento ({appliedCoupon.discountPercentage}% primer ramo)</span>
                    </span>
                    <span>-{formattedDiscount}</span>
                  </div>
                )}

                <div className="flex justify-between text-xs text-[#6B6560]">
                  <span>Envío en Lima (motorizado)</span>
                  <span className="italic">A coordinar por WhatsApp</span>
                </div>

                <div className="flex justify-between text-base font-light text-black pt-2 border-t border-[#F3E2CE]">
                  <span style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                    Total {appliedCoupon ? "con descuento" : "estimado"}
                  </span>
                  <span className="font-semibold text-lg">{formattedTotal}</span>
                </div>
              </div>

              {activeTab === "items" ? (
                <button
                  onClick={() => setActiveTab("delivery")}
                  className="w-full py-4 text-xs uppercase tracking-[0.2em] font-medium bg-[#000000] text-white flex items-center justify-center gap-3 transition-all hover:bg-black/85 active:scale-[0.99] shadow-md"
                >
                  <span>Continuar a datos de entrega</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              ) : activeTab === "delivery" ? (
                <button
                  onClick={handleProceedToPayment}
                  className="w-full py-4 text-xs uppercase tracking-[0.2em] font-medium bg-[#000000] text-white flex items-center justify-center gap-3 transition-all hover:bg-black/85 active:scale-[0.99] shadow-md"
                >
                  <span>Continuar a método de pago</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              ) : paymentMethod === "yape_plin" ? (
                <button
                  onClick={handleCheckoutYapePlin}
                  disabled={isSubmitting || !voucherFile}
                  className="w-full py-4 text-xs uppercase tracking-[0.2em] font-medium bg-[#000000] text-white flex items-center justify-center gap-3 transition-all hover:bg-black/85 active:scale-[0.99] shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Registrando pedido...</span>
                    </>
                  ) : (
                    <>
                      <WhatsAppIcon />
                      <span>Confirmar pedido con comprobante</span>
                    </>
                  )}
                </button>
              ) : (
                /*<button
                  onClick={handleCheckoutMercadoPago}
                  disabled={isSubmitting}
                  className="w-full py-4 text-xs uppercase tracking-[0.2em] font-medium bg-[#000000] text-white flex items-center justify-center gap-3 transition-all hover:bg-black/85 active:scale-[0.99] shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Conectando Mercado Pago...</span>
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                        <line x1="1" y1="10" x2="23" y2="10" />
                      </svg>
                      <span>Pagar con Mercado Pago</span>
                    </>
                  )}
                </button>*/

                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod("yape_plin");
                    setIsSubmitting(false);
                    setValidationError(null);
                  }}
                  className="w-full py-4 text-xs uppercase tracking-[0.2em] font-medium bg-[#000000] text-white flex items-center justify-center gap-3 transition-all hover:bg-black/85 active:scale-[0.99] shadow-md"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                    <line x1="1" y1="10" x2="23" y2="10" />
                  </svg>
                  <span>Elegir otro método de pago</span>
                </button>

              )}

              <div className="flex items-center justify-between text-[11px] text-[#6B6560]">
                {activeTab !== "items" ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (activeTab === "payment") setActiveTab("delivery");
                      else if (activeTab === "delivery") setActiveTab("items");
                      setValidationError(null);
                    }}
                    className="hover:text-black underline underline-offset-2"
                  >
                    ← Volver al paso anterior
                  </button>
                ) : (
                  <span />
                )}
                <span>Pagos seguros · LA OBRA Flores</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function WhatsAppIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
