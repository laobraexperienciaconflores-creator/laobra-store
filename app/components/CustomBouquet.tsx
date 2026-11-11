"use client";

import { useState, useId, useRef } from "react";
import Image from "next/image";
import { useCart } from "../context/CartContext";
import { FREE_DELIVERY_THRESHOLD } from "../lib/delivery";
import { WHATSAPP_NUMBER } from "../lib/constants";

export type BouquetCategory = "estandar" | "exclusivo" | "lujo";
export type BouquetSize = "S" | "M" | "L" | "XL";

export interface SizeConfig {
  size: BouquetSize;
  name: string;
  badge: string;
  /** Medidas aproximadas del ramo (alto x diámetro) */
  dimensions: string;
  minPrice: number;
  maxPrice: number;
  defaultPrice: number;
  description: string;
  /** Imagen referencial de la talla dentro de esta categoría */
  imageUrl: string;
  /** Flores / elementos típicos incluidos en esta talla */
  flowers: string[];
}

export interface CategoryConfig {
  id: BouquetCategory;
  name: string;
  subtitle: string;
  badge: string;
  description: string;
  imageUrl: string;
  sizes: Record<BouquetSize, SizeConfig>;
}

export const BOUQUET_CONFIGS: Record<BouquetCategory, CategoryConfig> = {
  estandar: {
    id: "estandar",
    name: "Estándar",
    subtitle: "Frescura & Armonía cotidiana",
    badge: "Accesible & Clásico",
    description:
      "Flores frescas de temporada seleccionadas el mismo día, combinadas con follajes aromáticos y envoltura artesanal.",
    imageUrl: "/products/bruma.jpg",
    sizes: {
      S: {
        size: "S",
        name: "Pequeño (S)",
        badge: "55 – 85 soles",
        dimensions: "30 – 35 cm alto × 25 cm ø",
        minPrice: 55,
        maxPrice: 85,
        defaultPrice: 65,
        description: "Detalle íntimo y delicado, perfecto para un gesto espontáneo.",
        imageUrl: "/products/niebla.jpg",
        flowers: ["5–7 rosas de temporada", "2–3 flores de relleno", "Follaje eucalipto", "Envoltura artesanal"],
      },
      M: {
        size: "M",
        name: "Mediano (M)",
        badge: "95 – 135 soles",
        dimensions: "40 – 45 cm alto × 35 cm ø",
        minPrice: 95,
        maxPrice: 135,
        defaultPrice: 115,
        description: "Tamaño ideal para cumpleaños o felicitaciones, muy vistoso.",
        imageUrl: "/products/bruma.jpg",
        flowers: ["10–12 rosas mixtas", "4–5 flores silvestres", "Follaje + gypsophila", "Papel kraft + cinta"],
      },
      L: {
        size: "L",
        name: "Grande (L)",
        badge: "145 – 205 soles",
        dimensions: "50 – 55 cm alto × 45 cm ø",
        minPrice: 145,
        maxPrice: 205,
        defaultPrice: 175,
        description: "Abundancia floral con variedad de especies y follajes selectos.",
        imageUrl: "/products/lumbre.jpg",
        flowers: ["15–18 rosas premium", "6–8 flores mixtas", "Follaje tropical", "Caja o papel de lujo"],
      },
      XL: {
        size: "XL",
        name: "Extra Grande (XL)",
        badge: "220 – 290 soles",
        dimensions: "60 – 70 cm alto × 55 cm ø",
        minPrice: 220,
        maxPrice: 290,
        defaultPrice: 250,
        description: "Ramo de gran volumen e impacto, memorable y protagónico.",
        imageUrl: "/products/carmesí.jpg",
        flowers: ["20+ rosas selectas", "10+ flores premium", "Follaje exótico", "Envoltura exclusiva + caja"],
      },
    },
  },
  exclusivo: {
    id: "exclusivo",
    name: "Exclusivo",
    subtitle: "Diseño de Autor & Flores Selectas",
    badge: "Más Solicitado",
    description:
      "Variedades premium de flores, texturas botánicas especiales, rosas selectas y arreglos con caída y arquitectura floral.",
    imageUrl: "/products/vela.jpg",
    sizes: {
      S: {
        size: "S",
        name: "Pequeño (S)",
        badge: "100 – 130 soles",
        dimensions: "30 – 35 cm alto × 25 cm ø",
        minPrice: 100,
        maxPrice: 130,
        defaultPrice: 110,
        description: "Pieza de diseño boutique con flores de alta gama.",
        imageUrl: "/products/niebla.jpg",
        flowers: ["5–6 rosas garden o ranúnculos", "Limonium o alstroemeria", "Follaje aromático", "Envoltura premium"],
      },
      M: {
        size: "M",
        name: "Mediano (M)",
        badge: "150 – 190 soles",
        dimensions: "40 – 45 cm alto × 35 cm ø",
        minPrice: 150,
        maxPrice: 190,
        defaultPrice: 160,
        description: "Equilibrio estético superior, flores protagonistas y acentos elegantes.",
        imageUrl: "/products/vela.jpg",
        flowers: ["10 rosas garden + peonías", "Flores silvestres selectas", "Follaje con caída", "Papel de seda + lazo"],
      },
      L: {
        size: "L",
        name: "Grande (L)",
        badge: "200 – 295 soles",
        dimensions: "50 – 55 cm alto × 45 cm ø",
        minPrice: 200,
        maxPrice: 295,
        defaultPrice: 245,
        description: "Composición de autor exuberante, dramática y sofisticada.",
        imageUrl: "/products/lumbre.jpg",
        flowers: ["15+ rosas premium", "Peonías o lisianthus", "Follaje tropical + botánica", "Caja de lujo exclusiva"],
      },
      XL: {
        size: "XL",
        name: "Extra Grande (XL)",
        badge: "310 – 390 soles",
        dimensions: "60 – 70 cm alto × 55 cm ø",
        minPrice: 310,
        maxPrice: 390,
        defaultPrice: 340,
        description: "Obra floral monumental con tallos exclusivos y envoltura de lino.",
        imageUrl: "/products/silencio.jpg",
        flowers: ["20+ rosas de jardín", "Peonías + ranúnculos + lisianthus", "Follaje exótico en capas", "Envoltura de lino artesanal"],
      },
    },
  },
  lujo: {
    id: "lujo",
    name: "Lujo",
    subtitle: "Alta Costura Floral",
    badge: "Colección Excepcional",
    description:
      "Flores importadas de exportación, orquídeas, anturios, tulipanes o calas oscuras con presentación de lujo de autor.",
    imageUrl: "/products/silencio.jpg",
    sizes: {
      S: {
        size: "S",
        name: "Pequeño (S)",
        badge: "Desde 160 soles",
        dimensions: "30 – 35 cm alto × 25 cm ø",
        minPrice: 160,
        maxPrice: 210,
        defaultPrice: 160,
        description: "Arreglo joya con especies raras y presentación de lujo absoluto.",
        imageUrl: "/products/carmesí.jpg",
        flowers: ["Orquídeas o calas selectas", "Rosas de exportación", "Envase de cristal o caja negra", "Tarjeta caligráfica"],
      },
      M: {
        size: "M",
        name: "Mediano (M)",
        badge: "Desde 215 soles",
        dimensions: "40 – 45 cm alto × 35 cm ø",
        minPrice: 215,
        maxPrice: 285,
        defaultPrice: 215,
        description: "Presencia escultural con orquídeas o flores de colección.",
        imageUrl: "/products/silencio.jpg",
        flowers: ["Orquídeas Cymbidium o Phalaenopsis", "Anturios + rosas negras", "Follaje silvestre premium", "Caja de lujo forrada"],
      },
      L: {
        size: "L",
        name: "Grande (L)",
        badge: "Desde 290 soles",
        dimensions: "50 – 55 cm alto × 45 cm ø",
        minPrice: 290,
        maxPrice: 400,
        defaultPrice: 290,
        description: "Espectacular despliegue de alta floristería con volumen opulento.",
        imageUrl: "/products/vela.jpg",
        flowers: ["Orquídeas + tulipanes importados", "Calas + anturios exóticos", "Follaje tropical de lujo", "Presentación en caja premium"],
      },
      XL: {
        size: "XL",
        name: "Extra Grande (XL)",
        badge: "Desde 410 soles",
        dimensions: "60 – 70 cm alto × 55 cm ø",
        minPrice: 410,
        maxPrice: 600,
        defaultPrice: 410,
        description: "Máxima expresión del arte floral. Impacto visual extraordinario e inolvidable.",
        imageUrl: "/products/carmesí.jpg",
        flowers: ["Orquídeas importadas + calas negras", "Flores de colección exclusivas", "Envoltura couture artesanal", "Caja archivadora + tarjeta dorada"],
      },
    },
  },
};

const SILHOUETTE_COLORS: Record<BouquetSize, { bg: string; border: string }> = {
  S: { bg: "#F0D8BB", border: "#DFC09D" },
  M: { bg: "#F4DEC2", border: "#E5CCA9" },
  L: { bg: "#F4DFC6", border: "#E6CEAD" },
  XL: { bg: "#F4DDC3", border: "#E5CBAB" },
};

const COLOR_PRESETS = [
  {
    id: "romantico",
    label: "Romántico & Pastel",
    description: "Rosa, rubor, blanco & toques marfil",
    dots: ["#F8BBD0", "#FFFFFF", "#E1BEE7"],
  },
  {
    id: "calido",
    label: "Cálido & Atardecer",
    description: "Mandarina, durazno, coral & terracota",
    dots: ["#FF8A65", "#FFCC80", "#FFE082"],
  },
  {
    id: "sereno",
    label: "Blanco & Marfil",
    description: "Blanco puro, crema & follaje verde eucalipto",
    dots: ["#FFFFFF", "#F5F5DC", "#A5D6A7"],
  },
  {
    id: "pasion",
    label: "Pasión & Vino",
    description: "Rojo profundo, borgoña, escarlata & vino",
    dots: ["#B71C1C", "#880E4F", "#C2185B"],
  },
  {
    id: "mistico",
    label: "Místico & Silvestre",
    description: "Lila, lavanda, toques azules & flores silvestres",
    dots: ["#CE93D8", "#90CAF9", "#80CBC4"],
  },
  {
    id: "sorpresa",
    label: "Sorpresa del Florista",
    description: "La mejor selección y combinación armónica del día",
    dots: ["#B8924A", "#4A6B53", "#F3E2CE"],
  },
];

const INDIVIDUAL_COLORS = [
  { name: "Blanco", color: "#FFFFFF", border: true },
  { name: "Rosado", color: "#EC407A" },
  { name: "Rosa Pastel", color: "#F48FB1" },
  { name: "Fucsia", color: "#D81B60" },
  { name: "Rojo Vino", color: "#880E4F" },
  { name: "Morado", color: "#6A1B9A" },
  { name: "Lila / Violeta", color: "#CE93D8" },
  { name: "Naranja", color: "#FB8C00" },
  { name: "Durazno", color: "#FFAB91" },
  { name: "Amarillo", color: "#FFE082" },
  { name: "Azul", color: "#90CAF9" },
  { name: "Negro", color: "#1A1A1A" },
  { name: "Follaje Verde", color: "#81C784" },
];

export default function CustomBouquet() {
  const { addItem, openCart } = useCart();
  const sliderId = useId();

  const [category, setCategory] = useState<BouquetCategory>("exclusivo");
  const [size, setSize] = useState<BouquetSize>("M");

  const categoryConfig = BOUQUET_CONFIGS[category];
  const sizeConfig = categoryConfig.sizes[size];

  const [price, setPrice] = useState<number>(sizeConfig.defaultPrice);
  const [selectedPreset, setSelectedPreset] = useState<string>("romantico");
  const [selectedColors, setSelectedColors] = useState<string[]>([
    "Rosa Pastel",
    "Blanco",
  ]);
  const [customNotes, setCustomNotes] = useState<string>("");
  const [isAdded, setIsAdded] = useState(false);
  const referenceInputRef = useRef<HTMLInputElement>(null);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [referenceFileName, setReferenceFileName] = useState<string | null>(null);

  const handleReferenceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("Por favor selecciona una imagen menor a 10MB.");
      return;
    }

    setReferenceFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = document.createElement("img");
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_DIM = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIM) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.78);
          setReferenceImage(compressedDataUrl);
        } else {
          setReferenceImage(event.target?.result as string);
        }
      };
      img.src = event.target?.result as string;
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

  // Al cambiar categoría o tamaño, sincronizar el precio con el nuevo rango
  const handleCategoryChange = (newCategory: BouquetCategory) => {
    setCategory(newCategory);
    const newConfig = BOUQUET_CONFIGS[newCategory].sizes[size];
    setPrice(newConfig.defaultPrice);
  };

  const handleSizeChange = (newSize: BouquetSize) => {
    setSize(newSize);
    const newConfig = categoryConfig.sizes[newSize];
    setPrice(newConfig.defaultPrice);
  };

  const handlePresetSelect = (presetId: string) => {
    setSelectedPreset(presetId);
    const preset = COLOR_PRESETS.find((p) => p.id === presetId);
    if (preset && preset.id !== "sorpresa") {
      // Sincronizar colores sugeridos
      if (presetId === "romantico") setSelectedColors(["Rosa Pastel", "Blanco"]);
      else if (presetId === "calido") setSelectedColors(["Durazno", "Amarillo"]);
      else if (presetId === "sereno") setSelectedColors(["Blanco", "Follaje Verde"]);
      else if (presetId === "pasion") setSelectedColors(["Rojo Vino", "Fucsia"]);
      else if (presetId === "mistico") setSelectedColors(["Lila / Violeta", "Azul"]);
    }
  };

  const toggleColor = (colorName: string) => {
    setSelectedColors((prev) => {
      if (prev.includes(colorName)) {
        return prev.filter((c) => c !== colorName);
      }
      if (prev.length >= 4) {
        return [...prev.slice(1), colorName];
      }
      return [...prev, colorName];
    });
  };

  const isFreeDeliveryEligible = price >= FREE_DELIVERY_THRESHOLD;

  const colorSummary =
    selectedColors.length > 0
      ? selectedColors.join(", ")
      : COLOR_PRESETS.find((p) => p.id === selectedPreset)?.label || "A elección";

  const handleAddToCart = () => {
    const customId = `custom-${category}-${size}-${price}-${Date.now()}`;
    const customName = `Ramo Personalizado · ${categoryConfig.name} (${size} · ${sizeConfig.dimensions}) [${colorSummary}]${referenceImage ? " 📸 (Con referencia)" : ""
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

  const handleWhatsAppConsult = () => {
    let msg = `¡Hola LA OBRA! 🌸 Quisiera consultar por este Ramo Personalizado:\n\n`;
    msg += `• Categoría: ${categoryConfig.name} (${categoryConfig.subtitle})\n`;
    msg += `• Talla: ${sizeConfig.name} (${sizeConfig.dimensions})\n`;
    msg += `• Flores de la talla: ${sizeConfig.flowers.join(", ")}\n`;
    msg += `• Paleta de color: ${colorSummary}\n`;
    msg += `• Presupuesto seleccionado: S/ ${price}.00\n`;
    if (referenceImage) {
      msg += `• 📸 Adjuntaré mi foto de referencia en este chat.\n`;
    }
    msg += `\n¿Tienen disponibilidad para prepararlo y coordinar la entrega?`;

    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`,
      "_blank",
      "noopener,noreferrer"
    );
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
          <div className="lg:col-span-7 space-y-8 bg-white p-6 sm:p-8 rounded-2xl border border-[#E8CEAD] shadow-sm">
            {/* PASO 1: Categoría de flores */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase font-semibold tracking-wider text-black flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-black text-white text-[11px] flex items-center justify-center font-mono">
                    1
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

            {/* PASO 2: Selección de Tallas (S, M, L, XL) */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase font-semibold tracking-wider text-black flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-black text-white text-[11px] flex items-center justify-center font-mono">
                    2
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

                      {/* Silueta de la talla debajo del texto de las medidas con el color exacto de la imagen */}
                      <div className="mt-2.5 pt-2 border-t border-[#E8CEAD]/30 flex flex-col items-center justify-center w-full">
                        <div
                          className="relative h-36 sm:h-44 md:h-48 w-full rounded-xl overflow-hidden flex items-center justify-center p-2 border shadow-xs"
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

            {/* PASO 3: Rango de precio interactivo (Barra de precio*/}
            <div className="p-5 bg-[#FDF8F3] border border-[#E8CEAD] rounded-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs uppercase font-semibold tracking-wider text-black flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-black text-white text-[11px] flex items-center justify-center font-mono">
                      3
                    </span>
                    Barra de precio
                  </span>
                  <p className="text-[11px] text-[#6B6560] mt-0.5">
                    Rango para {categoryConfig.name} {size}: S/ {sizeConfig.minPrice} – S/ {sizeConfig.maxPrice}
                  </p>
                </div>

                {/* Display del precio en Serif grande */}
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

              {/* Slider */}
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

              {/* Indicador de Delivery Gratuito */}
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
            </div>

            {/* PASO 4: Selección de Paleta de Colores */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-semibold tracking-wider text-black flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-black text-white text-[11px] flex items-center justify-center font-mono">
                    4
                  </span>
                  Escoge tus colores
                </span>
                <span className="text-[11px] text-[#6B6560]">
                  Seleccionados: <strong>{selectedColors.length}</strong>
                </span>
              </div>

              {/* Paletas temáticas sugeridas */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {COLOR_PRESETS.map((preset) => {
                  const isSelected = selectedPreset === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handlePresetSelect(preset.id)}
                      className={`p-2.5 rounded-lg border text-left transition-all ${isSelected
                        ? "border-black bg-[#FAF3EC] ring-1 ring-black"
                        : "border-[#E8CEAD] bg-white hover:border-black/50"
                        }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        {preset.dots.map((dot, idx) => (
                          <span
                            key={idx}
                            className="w-3 h-3 rounded-full border border-black/20"
                            style={{ backgroundColor: dot }}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-medium text-black block leading-tight">
                        {preset.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Selector de colores individuales */}
              <div>
                <label className="block text-[11px] text-[#6B6560] uppercase mb-2">
                  O elige los tonos individuales que deseas incluir:
                </label>
                <div className="flex flex-wrap gap-2">
                  {INDIVIDUAL_COLORS.map((col) => {
                    const isSelected = selectedColors.includes(col.name);
                    return (
                      <button
                        key={col.name}
                        type="button"
                        onClick={() => toggleColor(col.name)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all border ${isSelected
                          ? "bg-black text-white border-black shadow-sm"
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
            </div>
          </div>

          {/* Columna Derecha: Vista previa, resumen y botones de acción (5 cols) */}
          <div className="lg:col-span-5 sticky top-28 space-y-6">
            <div className="bg-white rounded-2xl overflow-hidden border border-[#E8CEAD] shadow-xl">
              {/* Imagen referencial completa sin recortes (object-contain + ambient blur) */}
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

                {/* Lista de flores incluidas en esta talla */}
                <div className="p-3 bg-[#FDF8F3] border border-[#E8CEAD] rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] uppercase tracking-widest text-[#B8924A] font-semibold">
                      🌸 Incluye esta talla
                    </p>
                    <span className="text-[10px] text-[#6B6560] font-mono">
                      {sizeConfig.dimensions}
                    </span>
                  </div>
                  <ul className="space-y-1">
                    {sizeConfig.flowers.map((flower, i) => (
                      <li key={i} className="text-xs text-[#3A3530] flex items-start gap-1.5">
                        <span className="text-[#B8924A] mt-0.5 leading-none">·</span>
                        <span>{flower}</span>
                      </li>
                    ))}
                  </ul>
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
                    <span className="text-[#6B6560]">Paleta de color:</span>
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
                    <span className="text-[#6B6560]">Envío (desde Barranco):</span>
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

                {/* Botón 2: Consultar diseño por WhatsApp */}
                <button
                  type="button"
                  onClick={handleWhatsAppConsult}
                  className="w-full py-3 px-4 bg-[#FAF3EC] hover:bg-[#F3E2CE] text-black border border-[#E8CEAD] text-xs uppercase tracking-[0.12em] font-medium transition-all flex items-center justify-center gap-2 rounded-xl active:scale-[0.99]"
                >
                  <svg
                    className="w-4 h-4 text-[#25D366] flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                  </svg>
                  <span>Consultar este diseño por WhatsApp</span>
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
