"use client";

import { useState, useId, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "../context/CartContext";
import { FREE_DELIVERY_THRESHOLD } from "../lib/delivery";
import {
  BOUQUET_CONFIGS,
  OCCASIONS,
  INDIVIDUAL_COLORS,
  MAX_FLOWER_COLORS,
  OTHER_OCCASION_MAX_LENGTH,
  type BouquetCategory,
  type BouquetSize,
  type OccasionId,
} from "../lib/bouquet";

const SILHOUETTE_COLORS: Record<BouquetSize, { bg: string; border: string }> = {
  S: { bg: "#F0D8BB", border: "#DFC09D" },
  M: { bg: "#F4DEC2", border: "#E5CCA9" },
  L: { bg: "#F4DFC6", border: "#E6CEAD" },
  XL: { bg: "#F4DDC3", border: "#E5CBAB" },
};

/**
 * Reduce una imagen (data URL) a máx. 800px y la convierte a JPEG.
 * Mantiene ligero el carrito en localStorage y el payload del pedido.
 */
function compressImageDataUrl(src: string, maxDim = 800, quality = 0.78): Promise<string> {
  return new Promise((resolve) => {
    const img = document.createElement("img");
    img.onload = () => {
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const width = Math.round(img.width * scale);
      const height = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve(src);
      // Fondo blanco para imágenes con transparencia (JPEG no tiene canal alfa)
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => resolve(src);
    img.src = src;
  });
}

// Imagen referencial del ramo en el resumen: oculta por ahora. Cambiar a true para mostrarla.
const SHOW_SUMMARY_IMAGE = false;

export default function CustomBouquet() {
  const { addItem, openCart } = useCart();
  const sliderId = useId();

  const [category, setCategory] = useState<BouquetCategory>("exclusivo");
  const [size, setSize] = useState<BouquetSize>("M");

  const categoryConfig = BOUQUET_CONFIGS[category];
  const sizeConfig = categoryConfig.sizes[size];

  const [price, setPrice] = useState<number>(sizeConfig.defaultPrice);
  const [selectedOccasion, setSelectedOccasion] = useState<OccasionId>("romantico");
  const [otherOccasion, setOtherOccasion] = useState<string>("");
  const [selectedColors, setSelectedColors] = useState<string[]>([
    "Rosa Pastel",
    "Blanco",
  ]);
  const [colorLimitHit, setColorLimitHit] = useState(false);
  const occasionLabel =
    selectedOccasion === "otro"
      ? otherOccasion.trim() || "Otra ocasión"
      : OCCASIONS.find((o) => o.id === selectedOccasion)?.label ?? "";
  const [customNotes, setCustomNotes] = useState<string>("");
  const [isAdded, setIsAdded] = useState(false);
  const referenceInputRef = useRef<HTMLInputElement>(null);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [referenceFileName, setReferenceFileName] = useState<string | null>(null);

  // ── Preview IA ──
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  // Cupo diario de vistas previas (5 con cuenta, 1 sin cuenta): lo informa el servidor
  const [previewRemaining, setPreviewRemaining] = useState<number | null>(null);
  const [showAccountCta, setShowAccountCta] = useState(false);
  // Selección con la que se generó la vista previa (para avisar si quedó desactualizada)
  const [previewConfigKey, setPreviewConfigKey] = useState<string | null>(null);
  const currentConfigKey = JSON.stringify([
    category,
    size,
    selectedOccasion,
    selectedOccasion === "otro" ? otherOccasion.trim() : "",
    [...selectedColors].sort(),
    customNotes.trim(),
  ]);
  const isPreviewStale = previewImage !== null && previewConfigKey !== currentConfigKey;

  // ── Tracking de paso activo y pasos completados con minimización ──
  const [activeStep, setActiveStep] = useState<number>(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const step1Ref = useRef<HTMLDivElement>(null);
  const step2Ref = useRef<HTMLDivElement>(null);
  const step3Ref = useRef<HTMLDivElement>(null);
  const step4Ref = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);

  const markStepAndAdvance = useCallback((stepNumber: number) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      next.add(stepNumber);
      return next;
    });

    // Minimiza el paso actual y abre el siguiente paso
    const nextStep = stepNumber < 4 ? stepNumber + 1 : 0;
    setActiveStep(nextStep);

    // Scroll suave al siguiente paso o resumen (los refs son estables)
    const stepRefs = [step1Ref, step2Ref, step3Ref, step4Ref, summaryRef];
    const nextRef = stepRefs[stepNumber]; // índice 0-based → siguiente paso
    if (nextRef?.current) {
      setTimeout(() => {
        nextRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    }
  }, []);

  // Props para las filas colapsadas: clic o teclado (Enter/Espacio) reabren el paso
  const openStepProps = (step: number) => ({
    role: "button" as const,
    tabIndex: 0,
    "aria-expanded": false,
    onClick: () => setActiveStep(step),
    onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setActiveStep(step);
      }
    },
  });

  const handleReferenceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("Por favor selecciona una imagen menor a 10MB.");
      return;
    }

    setReferenceFileName(file.name);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const original = event.target?.result as string;
      setReferenceImage(await compressImageDataUrl(original));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveReference = () => {
    setReferenceImage(null);
    setReferenceFileName(null);
    if (referenceInputRef.current) {
      referenceInputRef.current.value = "";
    }
  };

  // ── Generar vista previa con IA ──
  const handleGeneratePreview = async () => {
    setIsGeneratingPreview(true);
    setPreviewError(null);
    setShowAccountCta(false);
    const requestKey = currentConfigKey;

    try {
      // Solo se envían identificadores; el servidor arma el prompt con su propia configuración
      const res = await fetch("/api/preview-bouquet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          size,
          colors: selectedColors,
          occasion: selectedOccasion,
          occasionText: selectedOccasion === "otro" ? otherOccasion.trim() : "",
          // Preferencias del cliente; el servidor las limpia y las trata solo como preferencias
          notes: customNotes.trim(),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        if (err.code === "quota") {
          setPreviewRemaining(0);
          setShowAccountCta(!err.loggedIn);
        }
        throw new Error(
          err.error || `Error ${res.status}`
        );
      }

      const data = await res.json();
      // Comprimir: la imagen original de Gemini pesa 1–2 MB y saturaría el carrito
      setPreviewImage(await compressImageDataUrl(data.image));
      setPreviewConfigKey(requestKey);
      if (typeof data.remaining === "number") setPreviewRemaining(data.remaining);
    } catch (err) {
      console.error("Preview generation failed:", err);
      setPreviewError(
        err instanceof Error ? err.message : "No se pudo generar la vista previa"
      );
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  // Al cambiar categoría o tamaño, sincronizar el precio con el nuevo rango
  const handleCategoryChange = (newCategory: BouquetCategory) => {
    setCategory(newCategory);
    const newConfig = BOUQUET_CONFIGS[newCategory].sizes[size];
    setPrice(newConfig.defaultPrice);
    markStepAndAdvance(1);
  };

  const handleSizeChange = (newSize: BouquetSize) => {
    setSize(newSize);
    const newConfig = categoryConfig.sizes[newSize];
    setPrice(newConfig.defaultPrice);
    markStepAndAdvance(2);
  };

  const handleOccasionSelect = (occasionId: OccasionId) => {
    setSelectedOccasion(occasionId);
    setCompletedSteps((prev) => new Set(prev).add(4));
  };

  const toggleColor = (colorName: string) => {
    const isSelected = selectedColors.includes(colorName);
    if (!isSelected && selectedColors.length >= MAX_FLOWER_COLORS) {
      // Límite alcanzado: no se reemplaza ningún color, se avisa al cliente
      setColorLimitHit(true);
      return;
    }
    setColorLimitHit(false);
    setSelectedColors((prev) => {
      if (prev.includes(colorName)) return prev.filter((c) => c !== colorName);
      // Se revisa también aquí por si llegan dos clics seguidos antes de re-renderizar
      if (prev.length >= MAX_FLOWER_COLORS) return prev;
      return [...prev, colorName];
    });
    // Marcar paso 4 como completado (sin avanzar al siguiente)
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      next.add(4);
      return next;
    });
  };

  const isFreeDeliveryEligible = price >= FREE_DELIVERY_THRESHOLD;

  const colorSummary =
    selectedColors.length > 0
      ? selectedColors.join(", ")
      : "Colores a elección de la florista";

  const handleAddToCart = () => {
    const customId = `custom-${category}-${size}-${price}-${Date.now()}`;
    const notes = customNotes.trim();
    // La ocasión y las notas viajan en el nombre del producto para que la florista las vea en el pedido
    const customName = `Ramo Personalizado · ${categoryConfig.name} (${size} · ${sizeConfig.dimensions}) [${colorSummary}] · Ocasión: ${occasionLabel}${notes ? ` · Notas: ${notes}` : ""}${referenceImage ? " 📸 (Con referencia)" : ""
      }`;

    addItem({
      id: customId,
      name: customName,
      price: price,
      imageUrl: referenceImage || categoryConfig.imageUrl,
      referenceImage: referenceImage || undefined,
    });

    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      openCart();
    }, 800);
  };

  return (
    <section
      id="personalizar"
      className="py-20 px-6 lg:px-12 bg-[#F3E2CE] overflow-hidden"
      aria-labelledby="custom-title"
    >
      <div className="max-w-7xl mx-auto">
        {/* Encabezado */}
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <p
            className="text-xs tracking-[0.35em] uppercase mb-3 text-[#6B6560]"
            style={{ letterSpacing: "0.3em" }}
          >
            Taller Floral Artesanal · Barranco
          </p>
          <h2
            id="custom-title"
            className="text-4xl sm:text-5xl font-light text-black tracking-tight"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            Personaliza tu ramo
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#3A3530] font-light leading-relaxed">
            Elige la categoría, el tamaño y la paleta de colores.
          </p>
        </div>

        {/* Layout en dos columnas: Configuración a la izquierda, Preview a la derecha */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Columna Izquierda: Controles interactivos (7 cols) */}
          <div className="lg:col-span-7 space-y-4 bg-white p-6 sm:p-8 rounded-2xl border border-[#E8CEAD] shadow-sm">
            {/* PASO 1: Categoría de flores */}
            <div ref={step1Ref} className="scroll-mt-24 sm:scroll-mt-28">
              {activeStep === 1 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-semibold tracking-wider text-black flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-full text-[11px] flex items-center justify-center font-mono transition-colors duration-300 ${completedSteps.has(1)
                          ? "bg-[#4A6B53] text-white"
                          : "bg-black text-white"
                        }`}>
                        {completedSteps.has(1) ? "✓" : "1"}
                      </span>
                      Categoría de flores
                    </span>
                    <span className="text-[11px] text-[#B8924A] font-medium">
                      {categoryConfig.name}: {categoryConfig.subtitle}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {(Object.keys(BOUQUET_CONFIGS) as BouquetCategory[]).map((catKey) => {
                      const cfg = BOUQUET_CONFIGS[catKey];
                      const isSelected = category === catKey;
                      return (
                        <button
                          key={catKey}
                          type="button"
                          onClick={() => handleCategoryChange(catKey)}
                          className={`p-3.5 rounded-xl border text-left transition-all relative ${isSelected
                              ? "border-black bg-[#FAF3EC] shadow-sm ring-1 ring-black"
                              : "border-[#E8CEAD] bg-white hover:border-black/50"
                            }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-semibold text-black">
                              {cfg.name}
                            </span>
                            {isSelected && (
                              <span className="w-2 h-2 rounded-full bg-[#B8924A]" />
                            )}
                          </div>
                          <span className="text-[10px] block font-medium uppercase tracking-wider text-[#B8924A] mb-1">
                            {cfg.badge}
                          </span>
                          <p className="text-[11px] text-[#6B6560] leading-snug line-clamp-2">
                            {cfg.subtitle}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div
                  {...openStepProps(1)}
                  className="p-3.5 bg-[#FAF3EC] border border-[#E8CEAD] rounded-xl flex items-center justify-between cursor-pointer hover:border-black/50 transition-all group shadow-2xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold shrink-0 shadow-xs ${completedSteps.has(1) ? "bg-[#4A6B53] text-white" : "bg-black/10 text-black font-mono"
                      }`}>
                      {completedSteps.has(1) ? "✓" : "1"}
                    </span>
                    <div className="min-w-0">
                      <span className="text-[10px] uppercase tracking-wider text-[#6B6560] block font-medium">
                        Paso 1 · Categoría de flores
                      </span>
                      <span className="text-sm font-medium text-black truncate block">
                        Ramo {categoryConfig.name}{" "}
                        <span className="text-[#6B6560] text-xs font-normal">
                          ({categoryConfig.subtitle})
                        </span>
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] text-[#B8924A] group-hover:text-black font-medium tracking-wide uppercase px-2.5 py-1 rounded-md bg-white border border-[#E8CEAD] shadow-2xs transition-colors shrink-0">
                    Cambiar
                  </span>
                </div>
              )}
            </div>

            {/* PASO 2: Selección de Tallas (S, M, L, XL) */}
            <div ref={step2Ref} className="scroll-mt-24 sm:scroll-mt-28">
              {activeStep === 2 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-semibold tracking-wider text-black flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-full text-[11px] flex items-center justify-center font-mono transition-colors duration-300 ${completedSteps.has(2)
                          ? "bg-[#4A6B53] text-white"
                          : "bg-black text-white"
                        }`}>
                        {completedSteps.has(2) ? "✓" : "2"}
                      </span>
                      Talla del arreglo
                    </span>
                    <span className="text-[11px] text-[#6B6560]">
                      Medidas aprox.: <strong className="text-black">{sizeConfig.dimensions}</strong>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {(["S", "M", "L", "XL"] as BouquetSize[]).map((sKey) => {
                      const sCfg = categoryConfig.sizes[sKey];
                      const isSelected = size === sKey;
                      return (
                        <button
                          key={sKey}
                          type="button"
                          onClick={() => handleSizeChange(sKey)}
                          className={`p-3 rounded-xl border text-center transition-all ${isSelected
                              ? "border-black bg-black text-white shadow-md"
                              : "border-[#E8CEAD] bg-white text-black hover:border-black/60"
                            }`}
                        >
                          <span className="text-lg font-light block mb-0.5" style={{ fontFamily: "Georgia, serif" }}>
                            Talla {sKey}
                          </span>
                          <span
                            className={`text-[10px] font-medium tracking-wider block mb-1.5 ${isSelected ? "text-[#E8CEAD]" : "text-[#B8924A]"
                              }`}
                          >
                            {sCfg.badge}
                          </span>
                          <span
                            className={`text-[10px] block border-t pt-1 font-mono leading-tight ${isSelected ? "text-white/80 border-white/20" : "text-[#6B6560] border-[#E8CEAD]/60"
                              }`}
                          >
                            {sCfg.dimensions}
                          </span>

                          {/* Silueta de la talla */}
                          <div className="mt-2 pt-1.5 sm:mt-2.5 sm:pt-2 border-t border-[#E8CEAD]/30 flex flex-col items-center justify-center w-full">
                            <div
                              className="relative h-28 sm:h-44 md:h-48 w-full rounded-xl overflow-hidden flex items-center justify-center p-1.5 sm:p-2 border shadow-xs"
                              style={{
                                backgroundColor: SILHOUETTE_COLORS[sKey].bg,
                                borderColor: SILHOUETTE_COLORS[sKey].border,
                              }}
                            >
                              <img
                                src={`/products/Talla ${sKey}.png`}
                                alt={`Silueta referencial Talla ${sKey}`}
                                className="h-full w-auto max-h-full object-contain transition-transform duration-300 hover:scale-105"
                              />
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : completedSteps.has(2) ? (
                <div
                  {...openStepProps(2)}
                  className="p-3.5 bg-[#FAF3EC] border border-[#E8CEAD] rounded-xl flex items-center justify-between cursor-pointer hover:border-black/50 transition-all group shadow-2xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-full bg-[#4A6B53] text-white text-xs flex items-center justify-center font-bold shrink-0 shadow-xs">
                      ✓
                    </span>
                    <div className="min-w-0">
                      <span className="text-[10px] uppercase tracking-wider text-[#6B6560] block font-medium">
                        Paso 2 · Talla del arreglo
                      </span>
                      <span className="text-sm font-medium text-black truncate block">
                        Talla {size}{" "}
                        <span className="text-[#6B6560] text-xs font-normal">
                          ({sizeConfig.dimensions} · {sizeConfig.badge})
                        </span>
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] text-[#B8924A] group-hover:text-black font-medium tracking-wide uppercase px-2.5 py-1 rounded-md bg-white border border-[#E8CEAD] shadow-2xs transition-colors shrink-0">
                    Cambiar
                  </span>
                </div>
              ) : (
                <div
                  {...openStepProps(2)}
                  className="p-3.5 bg-white border border-[#E8CEAD]/70 rounded-xl flex items-center justify-between cursor-pointer hover:border-black/50 transition-all text-[#6B6560] shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-black/10 text-black text-[11px] flex items-center justify-center font-mono">
                      2
                    </span>
                    <span className="text-xs uppercase font-medium tracking-wider text-black">
                      Talla del arreglo
                    </span>
                  </div>
                  <span className="text-[11px] text-[#B8924A] font-medium flex items-center gap-1">
                    <span>Elegir</span>
                    <span>↓</span>
                  </span>
                </div>
              )}
            </div>

            {/* PASO 3: Rango de precio interactivo (Barra de precio) */}
            <div ref={step3Ref} className="scroll-mt-24 sm:scroll-mt-28">
              {activeStep === 3 ? (
                <div className="p-5 bg-[#FDF8F3] border border-[#E8CEAD] rounded-xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-xs uppercase font-semibold tracking-wider text-black flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full text-[11px] flex items-center justify-center font-mono transition-colors duration-300 ${completedSteps.has(3)
                            ? "bg-[#4A6B53] text-white"
                            : "bg-black text-white"
                          }`}>
                          {completedSteps.has(3) ? "✓" : "3"}
                        </span>
                        Barra de precio
                      </span>
                      <p className="text-[11px] text-[#6B6560] mt-0.5">
                        Rango para {categoryConfig.name} {size}: S/ {sizeConfig.minPrice} – S/ {sizeConfig.maxPrice}
                      </p>
                    </div>

                    <div className="text-right flex sm:flex-col items-baseline sm:items-end justify-between sm:justify-center">
                      <span className="text-[10px] uppercase tracking-wider text-[#6B6560] sm:mb-0.5">
                        Presupuesto
                      </span>
                      <span
                        className="text-2xl sm:text-3xl font-normal text-black tracking-tight"
                        style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                      >
                        S/ {price}.00
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <input
                      id={sliderId}
                      type="range"
                      min={sizeConfig.minPrice}
                      max={sizeConfig.maxPrice}
                      step={10}
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="w-full h-2.5 bg-[#E8CEAD] rounded-lg appearance-none cursor-pointer accent-black"
                      aria-label="Barra de ajuste de precio"
                    />

                    <div className="flex justify-between text-[11px] font-mono text-[#6B6560]">
                      <span>Mín: S/ {sizeConfig.minPrice}</span>
                      <span className="text-black font-semibold">Seleccionado: S/ {price}</span>
                      <span>Máx: S/ {sizeConfig.maxPrice}</span>
                    </div>
                  </div>

                  {isFreeDeliveryEligible ? (
                    <div className="p-2.5 bg-[#4A6B53]/10 border border-[#4A6B53]/30 rounded-lg flex items-center justify-between text-xs text-[#4A6B53]">
                      <span className="flex items-center gap-1.5 font-medium">
                        <span>✨</span>
                        <span>¡Superaste S/ {FREE_DELIVERY_THRESHOLD}! <strong>Envío GRATIS en Lima incluido</strong></span>
                      </span>
                      <span className="text-[10px] font-bold bg-[#4A6B53] text-white px-2 py-0.5 rounded-full">
                        S/ 0
                      </span>
                    </div>
                  ) : (
                    <p className="text-[11px] text-[#6B6560]">
                      💡 <em>Sugerencia: Con S/ {FREE_DELIVERY_THRESHOLD - price} más desbloqueas <strong>Envío GRATIS</strong> a todo Lima.</em>
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={() => markStepAndAdvance(3)}
                    className="w-full py-3 bg-black hover:bg-neutral-800 text-white text-xs uppercase tracking-[0.15em] font-medium rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm active:scale-[0.99]"
                  >
                    <span>Continuar a colores</span>
                    <span>→</span>
                  </button>
                </div>
              ) : completedSteps.has(3) ? (
                <div
                  {...openStepProps(3)}
                  className="p-3.5 bg-[#FAF3EC] border border-[#E8CEAD] rounded-xl flex items-center justify-between cursor-pointer hover:border-black/50 transition-all group shadow-2xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-full bg-[#4A6B53] text-white text-xs flex items-center justify-center font-bold shrink-0 shadow-xs">
                      ✓
                    </span>
                    <div className="min-w-0">
                      <span className="text-[10px] uppercase tracking-wider text-[#6B6560] block font-medium">
                        Paso 3 · Presupuesto
                      </span>
                      <span className="text-sm font-medium text-black truncate block">
                        S/ {price}.00{" "}
                        <span className="text-[#4A6B53] text-xs font-normal">
                          ({isFreeDeliveryEligible ? "Envío gratis incluido" : "Envío estándar"})
                        </span>
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] text-[#B8924A] group-hover:text-black font-medium tracking-wide uppercase px-2.5 py-1 rounded-md bg-white border border-[#E8CEAD] shadow-2xs transition-colors shrink-0">
                    Cambiar
                  </span>
                </div>
              ) : (
                <div
                  {...openStepProps(3)}
                  className="p-3.5 bg-white border border-[#E8CEAD]/70 rounded-xl flex items-center justify-between cursor-pointer hover:border-black/50 transition-all text-[#6B6560] shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-black/10 text-black text-[11px] flex items-center justify-center font-mono">
                      3
                    </span>
                    <span className="text-xs uppercase font-medium tracking-wider text-black">
                      Presupuesto del arreglo
                    </span>
                  </div>
                  <span className="text-[11px] text-[#B8924A] font-medium flex items-center gap-1">
                    <span>Elegir</span>
                    <span>↓</span>
                  </span>
                </div>
              )}
            </div>

            {/* PASO 4: Selección de Paleta de Colores */}
            <div ref={step4Ref} className="scroll-mt-24 sm:scroll-mt-28">
              {activeStep === 4 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-semibold tracking-wider text-black flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-full text-[11px] flex items-center justify-center font-mono transition-colors duration-300 ${completedSteps.has(4)
                          ? "bg-[#4A6B53] text-white"
                          : "bg-black text-white"
                        }`}>
                        {completedSteps.has(4) ? "✓" : "4"}
                      </span>
                      Ocasión y colores
                    </span>
                  </div>

                  {/* Ocasión del ramo */}
                  <div>
                    <label className="block text-[11px] text-[#6B6560] uppercase mb-2">
                      ¿Para qué ocasión es?
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" role="radiogroup" aria-label="Ocasión del ramo">
                      {OCCASIONS.map((occasion) => {
                        const isSelected = selectedOccasion === occasion.id;
                        return (
                          <button
                            key={occasion.id}
                            type="button"
                            role="radio"
                            aria-checked={isSelected}
                            onClick={() => handleOccasionSelect(occasion.id)}
                            className={`p-2.5 rounded-lg border text-left transition-all flex items-center gap-2 ${isSelected
                                ? "border-black bg-[#FAF3EC] ring-1 ring-black"
                                : "border-[#E8CEAD] bg-white hover:border-black/50"
                              }`}
                          >
                            <span className="text-sm text-[#B8924A] w-4 text-center shrink-0" aria-hidden="true">
                              {occasion.icon}
                            </span>
                            <span className="text-xs font-medium text-black leading-tight">
                              {occasion.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    {selectedOccasion === "otro" && (
                      <input
                        type="text"
                        placeholder="Escribe la ocasión. Ej. Día de la madre, bienvenida, graduación..."
                        value={otherOccasion}
                        onChange={(e) => setOtherOccasion(e.target.value)}
                        maxLength={OTHER_OCCASION_MAX_LENGTH}
                        aria-label="Escribe la ocasión"
                        autoFocus
                        className="mt-2 w-full text-xs px-3 py-2 border border-[#E8CEAD] focus:outline-none focus:border-black bg-white placeholder:text-[#6B6560]/60"
                      />
                    )}
                  </div>

                  {/* Selector de colores (máximo MAX_FLOWER_COLORS) */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-[11px] text-[#6B6560] uppercase">
                        Colores de las flores (máx. {MAX_FLOWER_COLORS})
                      </label>
                      <span className="text-[11px] text-[#6B6560]">
                        <strong>{selectedColors.length}</strong>/{MAX_FLOWER_COLORS}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {INDIVIDUAL_COLORS.map((col) => {
                        const isSelected = selectedColors.includes(col.name);
                        const isDisabled = !isSelected && selectedColors.length >= MAX_FLOWER_COLORS;
                        return (
                          <button
                            key={col.name}
                            type="button"
                            aria-pressed={isSelected}
                            aria-disabled={isDisabled}
                            onClick={() => toggleColor(col.name)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all border ${isSelected
                                ? "bg-black text-white border-black shadow-sm"
                                : isDisabled
                                  ? "bg-white text-black/40 border-[#E8CEAD]/60 cursor-not-allowed"
                                  : "bg-white text-black border-[#E8CEAD] hover:border-black/50"
                              }`}
                          >
                            <span
                              className={`w-3 h-3 rounded-full ${col.border ? "border border-black/30" : ""
                                }`}
                              style={{ backgroundColor: col.color }}
                            />
                            <span>{col.name}</span>
                            {isSelected && <span className="text-[10px]">✓</span>}
                          </button>
                        );
                      })}
                    </div>
                    {colorLimitHit && selectedColors.length >= MAX_FLOWER_COLORS && (
                      <p className="mt-2 text-[11px] text-[#B8924A]" role="status">
                        Puedes elegir hasta {MAX_FLOWER_COLORS} colores. Quita uno para cambiarlo.
                      </p>
                    )}
                  </div>

                  {/* Notas personalizadas */}
                  <div>
                    <label className="block text-[11px] text-[#6B6560] uppercase mb-1">
                      Notas para la florista (opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Prefiero más rosas rosadas, estilo silvestre, sin lirios..."
                      value={customNotes}
                      onChange={(e) => setCustomNotes(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-[#E8CEAD] focus:outline-none focus:border-black bg-white placeholder:text-[#6B6560]/60"
                      maxLength={150}
                    />
                  </div>

                  {/* Sección: Subir foto de ramo de referencia */}
                  <div className="pt-4 border-t border-[#F3E2CE] space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] text-[#6B6560] uppercase font-semibold">
                        📸 Foto de tu ramo de referencia (opcional)
                      </label>
                      {referenceImage && (
                        <span className="text-[10px] text-[#4A6B53] font-medium flex items-center gap-1">
                          <span>✓</span> Foto cargada
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#6B6560] leading-relaxed">
                      ¿Tienes una foto de Pinterest, Instagram o un ramo que viste? Súbela aquí para que nuestra florista la tome como referencia estética al armar tu diseño.
                    </p>

                    <input
                      ref={referenceInputRef}
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      onChange={handleReferenceUpload}
                      className="hidden"
                      id="bouquet-reference-upload"
                    />

                    {referenceImage ? (
                      <div className="p-3 bg-[#FAF3EC] border border-[#E8CEAD] rounded-xl flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-14 h-14 relative rounded-lg border border-[#E8CEAD] bg-white overflow-hidden flex-shrink-0 shadow-sm">
                            <img
                              src={referenceImage}
                              alt="Ramo de referencia"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-black truncate">
                              {referenceFileName || "ramo-referencia.jpg"}
                            </p>
                            <p className="text-[10px] text-[#4A6B53]">
                              ✓ Lista para la florista en tu pedido
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => referenceInputRef.current?.click()}
                            className="text-[11px] text-black hover:underline uppercase tracking-wider font-medium"
                          >
                            Cambiar
                          </button>
                          <span className="text-[#E8CEAD]">·</span>
                          <button
                            type="button"
                            onClick={handleRemoveReference}
                            className="text-[11px] text-red-600 hover:underline uppercase tracking-wider font-medium"
                          >
                            Quitar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label
                        htmlFor="bouquet-reference-upload"
                        className="w-full py-4 px-4 border border-dashed border-[#B8924A] rounded-xl bg-[#FDF8F3] hover:bg-[#FAF3EC] cursor-pointer flex flex-col items-center justify-center gap-1.5 transition-colors text-center group"
                      >
                        <div className="w-9 h-9 rounded-full bg-white border border-[#E8CEAD] flex items-center justify-center text-[#B8924A] group-hover:scale-105 transition-transform shadow-xs">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                          </svg>
                        </div>
                        <span className="text-xs font-medium text-black">
                          Subir foto o captura del ramo de referencia
                        </span>
                        <span className="text-[10px] text-[#6B6560]">
                          Formatos JPG, PNG, WEBP (hasta 10MB)
                        </span>
                      </label>
                    )}
                  </div>

                  {/* Botón para finalizar / ver resumen */}
                  <button
                    type="button"
                    onClick={() => {
                      setCompletedSteps((prev) => new Set(prev).add(4));
                      setActiveStep(0);
                      summaryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                    className="w-full py-3.5 bg-[#4A6B53] hover:bg-[#3D5A44] text-white text-xs uppercase tracking-[0.15em] font-medium rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm active:scale-[0.99]"
                  >
                    <span>✓ Listo · Ver ramo completo y pedir</span>
                  </button>
                </div>
              ) : completedSteps.has(4) ? (
                <div
                  {...openStepProps(4)}
                  className="p-3.5 bg-[#FAF3EC] border border-[#E8CEAD] rounded-xl flex items-center justify-between cursor-pointer hover:border-black/50 transition-all group shadow-2xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-full bg-[#4A6B53] text-white text-xs flex items-center justify-center font-bold shrink-0 shadow-xs">
                      ✓
                    </span>
                    <div className="min-w-0">
                      <span className="text-[10px] uppercase tracking-wider text-[#6B6560] block font-medium">
                        Paso 4 · Ocasión, colores & detalles
                      </span>
                      <span className="text-sm font-medium text-black truncate block">
                        {occasionLabel} · {colorSummary}{" "}
                        {referenceImage && (
                          <span className="text-[#4A6B53] text-xs font-normal">
                            · 📸 Foto adjunta
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] text-[#B8924A] group-hover:text-black font-medium tracking-wide uppercase px-2.5 py-1 rounded-md bg-white border border-[#E8CEAD] shadow-2xs transition-colors shrink-0">
                    Cambiar
                  </span>
                </div>
              ) : (
                <div
                  {...openStepProps(4)}
                  className="p-3.5 bg-white border border-[#E8CEAD]/70 rounded-xl flex items-center justify-between cursor-pointer hover:border-black/50 transition-all text-[#6B6560] shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-black/10 text-black text-[11px] flex items-center justify-center font-mono">
                      4
                    </span>
                    <span className="text-xs uppercase font-medium tracking-wider text-black">
                      Ocasión y colores
                    </span>
                  </div>
                  <span className="text-[11px] text-[#B8924A] font-medium flex items-center gap-1">
                    <span>Elegir</span>
                    <span>↓</span>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Columna Derecha: Vista previa, resumen y botones de acción (5 cols) */}
          <div ref={summaryRef} className="lg:col-span-5 sticky top-28 space-y-6 scroll-mt-24 sm:scroll-mt-28">
            <div className="bg-white rounded-2xl overflow-hidden border border-[#E8CEAD] shadow-xl">
              {/* Imagen referencial completa sin recortes (oculta por ahora, ver SHOW_SUMMARY_IMAGE) */}
              {SHOW_SUMMARY_IMAGE && (
              <div className="relative h-60 sm:h-72 w-full bg-[#FAF3EC] overflow-hidden flex items-center justify-center">
                {/* Fondo difuminado ambiental con los tonos florales para que se vea sofisticado */}
                <div className="absolute inset-0 overflow-hidden opacity-25 filter blur-xl scale-125 pointer-events-none">
                  <Image
                    src={referenceImage || sizeConfig.imageUrl}
                    alt=""
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover"
                    aria-hidden="true"
                    unoptimized={Boolean(referenceImage)}
                  />
                </div>

                {/* Ramo referencial completo sin perder ningún detalle ni flores */}
                {referenceImage ? (
                  <img
                    src={referenceImage}
                    alt="Ramo de referencia del cliente"
                    className="relative z-1 max-h-full max-w-full object-contain p-3 drop-shadow-md transition-transform duration-500 hover:scale-105"
                  />
                ) : (
                  <div className="relative z-1 w-full h-full p-2 flex items-center justify-center">
                    <Image
                      src={sizeConfig.imageUrl}
                      alt={`Ramo ${categoryConfig.name} · Talla ${size}`}
                      fill
                      className="object-contain p-2 drop-shadow-md transition-transform duration-500 hover:scale-105"
                      sizes="(max-width: 1024px) 100vw, 40vw"
                      priority
                    />
                  </div>
                )}

                {/* Badges superiores */}
                <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 pointer-events-none">
                  <span className="px-2.5 py-1 bg-black/85 backdrop-blur-md text-[#F3E2CE] text-[10px] uppercase tracking-widest font-medium rounded-full shadow-md">
                    {categoryConfig.name} · {sizeConfig.name}
                  </span>
                  {referenceImage && (
                    <span className="px-2.5 py-1 bg-[#B8924A] text-white text-[10px] uppercase tracking-widest font-semibold rounded-full shadow-md">
                      📸 Foto de referencia
                    </span>
                  )}
                  {isFreeDeliveryEligible && (
                    <span className="px-2.5 py-1 bg-[#4A6B53] text-white text-[10px] uppercase tracking-widest font-semibold rounded-full shadow-md">
                      Envío Gratis
                    </span>
                  )}
                </div>

                {/* Indicador inferior de vista completa */}
                <div className="absolute bottom-2.5 right-3 z-10 pointer-events-none">
                  <span className="px-2 py-0.5 bg-white/85 backdrop-blur-md text-[#3A3530] text-[9px] uppercase tracking-wider font-medium rounded-full shadow-xs border border-[#E8CEAD]/60">
                    Vista completa
                  </span>
                </div>
              </div>
              )}

              {/* Resumen del Ramo Configurado */}
              <div className="p-5 space-y-3.5">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-[#6B6560] tracking-widest block mb-1">
                    Tu composición a medida
                  </span>
                  <h3
                    className="text-2xl font-light text-black tracking-tight"
                    style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                  >
                    Ramo {categoryConfig.name}
                  </h3>
                  <p className="text-xs text-[#6B6560] mt-1 leading-relaxed">
                    {sizeConfig.description}
                  </p>
                </div>

                {/* Ficha de especificaciones */}
                <div className="p-3.5 bg-[#FDF8F3] border border-[#E8CEAD] rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#6B6560]">Categoría:</span>
                    <span className="font-medium text-black">{categoryConfig.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B6560]">Tamaño:</span>
                    <span className="font-medium text-black">
                      {sizeConfig.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B6560]">Medidas aprox.:</span>
                    <span className="font-medium text-black font-mono">
                      {sizeConfig.dimensions}
                    </span>
                  </div>

                  {/* Silueta referencial de escala humana con el color exacto de la imagen */}
                  <div
                    className="p-2.5 border rounded-xl flex items-center gap-3.5 transition-colors shadow-2xs"
                    style={{
                      backgroundColor: `${SILHOUETTE_COLORS[size].bg}26`,
                      borderColor: SILHOUETTE_COLORS[size].border,
                    }}
                  >
                    <div
                      className="relative h-24 w-16 flex-shrink-0 rounded-lg flex items-center justify-center p-1 border shadow-xs"
                      style={{
                        backgroundColor: SILHOUETTE_COLORS[size].bg,
                        borderColor: SILHOUETTE_COLORS[size].border,
                      }}
                    >
                      <img
                        src={`/products/Talla ${size}.png`}
                        alt={`Silueta Talla ${size}`}
                        className="h-full w-auto object-contain"
                      />
                    </div>
                    <div className="text-xs leading-relaxed min-w-0">
                      <span className="font-semibold text-black block text-xs">
                        Proporción Talla {size}
                      </span>
                      <span className="text-black font-mono font-medium block text-[11px]">
                        {sizeConfig.dimensions}
                      </span>
                      <span className="text-[#6B6560] text-[10px] block mt-0.5">
                        Escala referencial con persona
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B6560]">Ocasión:</span>
                    <span className="font-medium text-black text-right max-w-[180px] truncate">
                      {occasionLabel}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B6560]">Colores:</span>
                    <span className="font-medium text-black text-right max-w-[180px] truncate">
                      {colorSummary}
                    </span>
                  </div>
                  {referenceImage && (
                    <div className="flex justify-between items-center text-[#4A6B53]">
                      <span>Foto de referencia:</span>
                      <span className="font-medium flex items-center gap-1">
                        <span>📸</span> Adjunta
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-[#E8CEAD]">
                    <span className="text-[#6B6560]">Envío:</span>
                    <span className="font-medium text-[#4A6B53]">
                      {isFreeDeliveryEligible
                        ? "¡GRATIS! (≥ S/ 250)"
                        : "Desde S/ 10 según distrito"}
                    </span>
                  </div>
                </div>

                {/* Total */}
                <div className="flex items-baseline justify-between pt-2 border-t border-[#F3E2CE]">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-[#6B6560] block">
                      Monto a asignar
                    </span>
                    <span className="text-xs text-[#6B6560]">Incluye tarjeta de dedicatoria</span>
                  </div>
                  <span
                    className="text-3xl font-medium text-black"
                    style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                  >
                    S/ {price}.00
                  </span>
                </div>

                {/* ═══ Vista previa con IA ═══ */}
                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={handleGeneratePreview}
                    disabled={isGeneratingPreview}
                    className="group w-full relative overflow-hidden rounded-xl border border-[#B8924A]/60 bg-gradient-to-r from-[#FDF8F3] to-[#FAF3EC] px-4 py-3 text-xs font-medium uppercase tracking-[0.12em] text-[#B8924A] transition-all hover:border-[#B8924A] hover:shadow-md active:scale-[0.99] disabled:opacity-70 disabled:cursor-wait flex items-center justify-center gap-2.5"
                  >
                    {isGeneratingPreview ? (
                      <>
                        <span className="w-4 h-4 border-2 border-[#B8924A]/30 border-t-[#B8924A] rounded-full animate-spin" />
                        <span>Creando tu vista previa con IA…</span>
                      </>
                    ) : (
                      <>
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          className="text-[#B8924A]"
                        >
                          <path
                            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span>✨ Generar vista previa con IA</span>
                      </>
                    )}
                    <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[#B8924A]/10 to-transparent group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                  </button>

                  {previewError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 leading-relaxed space-y-1">
                      <p className="font-medium">⚠️ {previewError}</p>
                      {previewError.includes("GEMINI_API_KEY") && (
                        <p className="text-[11px] text-red-600">
                          Agrega tu clave en el archivo <code className="bg-red-100 px-1 py-0.5 rounded font-mono">.env.local</code> (GEMINI_API_KEY=tu_clave) y reinicia el servidor.
                        </p>
                      )}
                      {showAccountCta && (
                        <Link
                          href="/cuenta/ingresar?next=/%23personalizar"
                          className="inline-block mt-1 text-[11px] font-semibold text-black underline underline-offset-2 hover:opacity-70"
                        >
                          Crear cuenta o ingresar →
                        </Link>
                      )}
                    </div>
                  )}

                  {previewRemaining !== null && !previewError && (
                    <p className="text-[11px] text-[#6B6560] text-center">
                      {previewRemaining > 0
                        ? `Te ${previewRemaining === 1 ? "queda 1 vista previa" : `quedan ${previewRemaining} vistas previas`} hoy.`
                        : "Usaste todas tus vistas previas de hoy."}
                    </p>
                  )}

                  {previewImage && (
                    <div className="relative rounded-xl overflow-hidden border border-[#E8CEAD] shadow-md bg-white">
                      <div className="relative aspect-[3/4] w-full bg-[#FAF3EC] overflow-hidden flex items-center justify-center">
                        <img
                          src={previewImage}
                          alt="Vista previa generada con IA de tu ramo personalizado"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 pointer-events-none">
                        <span className="px-2.5 py-1 bg-[#B8924A]/90 backdrop-blur-md text-white text-[9px] uppercase tracking-widest font-semibold rounded-full shadow-md">
                          ✨ Preview IA
                        </span>
                      </div>
                      <div className="p-3 bg-[#FDF8F3] border-t border-[#E8CEAD]/60 space-y-2">
                        {isPreviewStale && (
                          <p className="text-[11px] text-[#8A5A00] bg-[#FFF4D6] border border-[#F0D58A] rounded-md px-2 py-1.5 text-center">
                            Cambiaste tu selección después de generar esta imagen. Pulsa ↻ para actualizarla.
                          </p>
                        )}
                        <p className="text-[10px] text-[#6B6560] leading-relaxed text-center">
                          Imagen referencial generada por IA según tus selecciones · El ramo real será confeccionado artesanalmente por nuestras floristas.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setReferenceImage(previewImage);
                            setReferenceFileName("vista-previa-ia.jpg");
                          }}
                          className="w-full py-2 px-3 bg-white hover:bg-[#FAF3EC] border border-[#B8924A] text-[#B8924A] hover:text-black rounded-lg text-xs font-medium tracking-wide flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                        >
                          <span>📸</span>
                          <span>
                            {referenceImage === previewImage
                              ? "✓ Adjunta como foto de referencia"
                              : "Usar como foto de referencia para la florista"}
                          </span>
                        </button>
                      </div>
                      <div className="absolute top-2.5 right-2.5 flex gap-1.5">
                        <button
                          type="button"
                          onClick={handleGeneratePreview}
                          disabled={isGeneratingPreview}
                          className="w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm text-[#6B6560] hover:text-black flex items-center justify-center shadow-sm transition-colors disabled:opacity-50"
                          title="Regenerar otra versión"
                        >
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="23 4 23 10 17 10" />
                            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewImage(null)}
                          className="w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm text-[#6B6560] hover:text-black flex items-center justify-center shadow-sm transition-colors"
                          title="Cerrar vista previa"
                        >
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Botón 1: Agregar al Carrito */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="w-full py-4 px-6 bg-black text-white hover:bg-neutral-800 text-xs uppercase tracking-[0.2em] font-medium transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: isAdded ? "#4A6B53" : "#000000",
                  }}
                >
                  {isAdded ? (
                    <>
                      <span>✓ ¡Ramo agregado al carrito!</span>
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <path d="M16 10a4 4 0 0 1-8 0" />
                      </svg>
                      <span>Agregar ramo personalizado al carrito</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Garantía artesanal */}
            <div className="p-4 bg-white/80 border border-[#E8CEAD] rounded-xl text-center space-y-1">
              <p className="text-xs font-medium text-black">
                ✨ Flores frescas seleccionadas el mismo día
              </p>
              <p className="text-[11px] text-[#6B6560]">
                Incluye tarjeta caligrafiada con dedicatoria artesanal de cortesía.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
