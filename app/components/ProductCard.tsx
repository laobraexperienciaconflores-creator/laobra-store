"use client";

import { useState } from "react";
import Image from "next/image";
import { useCart } from "../context/CartContext";
import { WHATSAPP_NUMBER } from "../lib/constants";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  images?: string[];
  imageAlt: string;
  description?: string;
  tag?: string;
}

export default function ProductCard({
  id,
  name,
  price,
  imageUrl,
  images,
  imageAlt,
  description,
  tag,
}: ProductCardProps) {
  const { addItem } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const imageList = images && images.length > 0 ? images : [imageUrl];

  const formattedPrice = new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 0,
  }).format(price);

  const handleAddToCart = () => {
    addItem({ id, name, price, imageUrl: imageList[0] });
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 1500);
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % imageList.length);
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + imageList.length) % imageList.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (diff > 40) {
      setCurrentImageIndex((prev) => (prev + 1) % imageList.length);
    } else if (diff < -40) {
      setCurrentImageIndex((prev) => (prev - 1 + imageList.length) % imageList.length);
    }
    setTouchStartX(null);
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `Hola LA OBRA, quisiera consultar por el arreglo "${name}" (${formattedPrice}). ¿Tienen disponibilidad para entrega?`
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank", "noopener,noreferrer");
  };

  return (
    <article className="group flex flex-col justify-between" aria-label={`Producto: ${name}`}>
      <div>
        {/* Image wrapper */}
        <div
          className="relative aspect-[3/4] overflow-hidden mb-5 transition-transform duration-500 ease-out cursor-pointer select-none"
          style={{ background: "#F3E2CE" }}
          onClick={handleAddToCart}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {imageList.map((imgSrc, idx) => (
            <div
              key={imgSrc}
              className={`absolute inset-0 transition-opacity duration-500 ease-out ${idx === currentImageIndex ? "opacity-100 z-0" : "opacity-0 pointer-events-none"
                }`}
            >
              <Image
                src={imgSrc}
                alt={`${imageAlt} - Foto ${idx + 1}`}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                quality={85}
                priority={idx === 0}
              />
            </div>
          ))}

          {tag && (
            <span
              className="absolute top-4 left-4 z-20 px-3 py-1 text-[11px] tracking-widest uppercase font-medium"
              style={{
                background: "#000000",
                color: "#FFFFFF",
                letterSpacing: "0.15em",
              }}
            >
              {tag}
            </span>
          )}

          {/* Slider controls */}
          {imageList.length > 1 && (
            <>
              {/* Prev button */}
              <button
                type="button"
                onClick={handlePrevImage}
                aria-label="Foto anterior"
                className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-black flex items-center justify-center shadow-md backdrop-blur-sm transition-all sm:opacity-0 sm:group-hover:opacity-100"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>

              {/* Next button */}
              <button
                type="button"
                onClick={handleNextImage}
                aria-label="Siguiente foto"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-black flex items-center justify-center shadow-md backdrop-blur-sm transition-all sm:opacity-0 sm:group-hover:opacity-100"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>

              {/* Indicators */}
              <div
                className="absolute bottom-3 inset-x-0 z-20 flex justify-center items-center gap-1.5 pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {imageList.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex(idx);
                    }}
                    aria-label={`Ir a foto ${idx + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentImageIndex
                        ? "w-6 bg-white shadow"
                        : "w-2 bg-white/60 hover:bg-white/90 shadow-sm"
                      }`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Quick hover indicator */}
          <div className="absolute inset-0 bg-black/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none z-10">
            <span className="px-4 py-2 bg-white/95 text-black text-xs uppercase tracking-widest font-medium shadow-md">
              Agregar al carrito
            </span>
          </div>
        </div>

        {/* Product Info */}
        <div className="flex items-baseline justify-between gap-4 mb-2">
          <h3
            className="text-lg font-light tracking-wide transition-opacity duration-300 group-hover:opacity-70"
            style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              color: "#000000",
            }}
          >
            {name}
          </h3>
          <span
            className="text-sm font-light flex-shrink-0"
            style={{ color: "#6B6560" }}
          >
            {formattedPrice}
          </span>
        </div>

        {description && (
          <p
            className="text-xs font-light leading-relaxed mb-3"
            style={{ color: "#6B6560" }}
          >
            {description}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-3 space-y-2">
        <button
          onClick={handleAddToCart}
          className="w-full py-3.5 text-xs tracking-[0.2em] uppercase transition-all duration-300 flex items-center justify-center gap-2 font-medium"
          style={{
            background: isAdded ? "#4A6B53" : "#000000",
            color: "#FFFFFF",
          }}
          aria-label={`Agregar ${name} al carrito`}
        >
          {isAdded ? (
            <>
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
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>¡Agregado al carrito!</span>
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              <span>Agregar al carrito</span>
            </>
          )}
        </button>

        <button
          onClick={handleWhatsApp}
          className="w-full py-2 text-[11px] tracking-wider uppercase text-[#6B6560] hover:text-black transition-colors flex items-center justify-center gap-1.5"
        >
          <span>¿Consultas previas? Escríbenos</span>
        </button>
      </div>
    </article>
  );
}
