"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useCart } from "../context/CartContext";
import { WHATSAPP_NUMBER } from "../lib/constants";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  images?: string[];
  videoUrl?: string;
  imageAlt: string;
  description?: string;
  tag?: string;
}

function ProductVideoSlide({ src, isActive }: { src: string; isActive: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isActive) {
      videoRef.current?.play().catch(() => {});
    } else {
      videoRef.current?.pause();
    }
  }, [isActive]);

  return (
    <div
      className={`absolute inset-0 transition-opacity duration-500 ease-out ${
        isActive ? "opacity-100 z-0" : "opacity-0 pointer-events-none"
      }`}
    >
      <video
        ref={videoRef}
        src={src}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
      />
    </div>
  );
}

export default function ProductCard({
  id,
  name,
  price,
  imageUrl,
  images,
  videoUrl,
  imageAlt,
  description,
  tag,
}: ProductCardProps) {
  const { addItem } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const rawImages = images && images.length > 0 ? images : [imageUrl];

  type MediaItem =
    | { type: "image"; src: string }
    | { type: "video"; src: string };

  const mediaList: MediaItem[] = [
    ...rawImages.map((src) => ({ type: "image" as const, src })),
    ...(videoUrl ? [{ type: "video" as const, src: videoUrl }] : []),
  ];

  const formattedPrice = new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 0,
  }).format(price);

  const handleAddToCart = () => {
    addItem({ id, name, price, imageUrl: rawImages[0] });
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 1500);
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % mediaList.length);
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + mediaList.length) % mediaList.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (diff > 40) {
      setCurrentImageIndex((prev) => (prev + 1) % mediaList.length);
    } else if (diff < -40) {
      setCurrentImageIndex((prev) => (prev - 1 + mediaList.length) % mediaList.length);
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
        {/* Image / Video wrapper */}
        <div
          className="relative aspect-[3/4] overflow-hidden mb-5 transition-transform duration-500 ease-out cursor-pointer select-none"
          style={{ background: "#F3E2CE" }}
          onClick={handleAddToCart}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {mediaList.map((media, idx) => {
            const isActive = idx === currentImageIndex;

            if (media.type === "video") {
              return (
                <ProductVideoSlide
                  key={media.src}
                  src={media.src}
                  isActive={isActive}
                />
              );
            }

            return (
              <div
                key={media.src}
                className={`absolute inset-0 transition-opacity duration-500 ease-out ${
                  isActive ? "opacity-100 z-0" : "opacity-0 pointer-events-none"
                }`}
              >
                <Image
                  src={media.src}
                  alt={`${imageAlt} - Foto ${idx + 1}`}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  quality={85}
                  priority={idx === 0}
                />
              </div>
            );
          })}

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

          {/* Botón rápido para alternar a Video / Fotos */}
          {videoUrl && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                const videoIdx = mediaList.findIndex((m) => m.type === "video");
                if (videoIdx !== -1) {
                  setCurrentImageIndex(currentImageIndex === videoIdx ? 0 : videoIdx);
                }
              }}
              className={`absolute top-4 right-4 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-medium tracking-wider uppercase backdrop-blur-md transition-all shadow-sm ${
                mediaList[currentImageIndex]?.type === "video"
                  ? "bg-black text-[#F3E2CE] ring-1 ring-[#B8924A]"
                  : "bg-white/90 text-black hover:bg-white"
              }`}
              title={
                mediaList[currentImageIndex]?.type === "video"
                  ? "Ver fotos"
                  : "Ver video del arreglo"
              }
              aria-label="Ver video del arreglo"
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="currentColor"
                className={mediaList[currentImageIndex]?.type === "video" ? "text-[#B8924A]" : "text-black"}
              >
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              <span>{mediaList[currentImageIndex]?.type === "video" ? "Fotos" : "Video"}</span>
            </button>
          )}

          {/* Slider controls */}
          {mediaList.length > 1 && (
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
                {mediaList.map((media, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex(idx);
                    }}
                    aria-label={
                      media.type === "video"
                        ? "Ver video"
                        : `Ir a foto ${idx + 1}`
                    }
                    className={`h-1.5 rounded-full transition-all duration-300 flex items-center justify-center ${
                      idx === currentImageIndex
                        ? "w-6 bg-white shadow"
                        : "w-2 bg-white/60 hover:bg-white/90 shadow-sm"
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Quick hover indicator - solo en desktop */}
          <div className="hidden sm:flex absolute inset-0 bg-black/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300 items-center justify-center pointer-events-none z-10">
            <span className="px-4 py-2 bg-white/95 text-black text-xs uppercase tracking-widest font-medium shadow-md flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
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
              <span>Agregar al carrito</span>
            </span>
          </div>
        </div>

        {/* Product Info */}
        <div className="flex items-baseline justify-between gap-2 mb-1.5">
          <h3
            className="text-xs sm:text-base font-light tracking-wide transition-opacity duration-300 group-hover:opacity-70 leading-snug"
            style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              color: "#000000",
            }}
          >
            {name}
          </h3>
          <span
            className="text-xs sm:text-sm font-medium flex-shrink-0"
            style={{ color: "#000000" }}
          >
            {formattedPrice}
          </span>
        </div>

        {description && (
          <p
            className="hidden sm:block text-xs font-light leading-relaxed mb-3"
            style={{ color: "#6B6560" }}
          >
            {description}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-2 sm:mt-3 space-y-1.5 sm:space-y-2">
        <button
          onClick={handleAddToCart}
          className="w-full py-2.5 sm:py-3.5 text-[10px] sm:text-xs tracking-[0.15em] sm:tracking-[0.2em] uppercase transition-all duration-300 flex items-center justify-center gap-2 font-medium active:scale-[0.98]"
          style={{
            background: isAdded ? "#4A6B53" : "#000000",
            color: "#FFFFFF",
          }}
          aria-label={`Agregar ${name} al carrito`}
          title={isAdded ? "¡Agregado al carrito!" : "Agregar al carrito"}
        >
          {isAdded ? (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span className="hidden sm:inline">¡Agregado al carrito!</span>
            </>
          ) : (
            <>
              {/* Ícono de carrito bien visible */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              <span className="hidden sm:inline">Agregar al carrito</span>
            </>
          )}
        </button>

        <button
          onClick={handleWhatsApp}
          className="hidden sm:flex w-full py-2 text-[11px] tracking-wider uppercase text-[#6B6560] hover:text-black transition-colors items-center justify-center gap-1.5"
        >
          <span>¿Consultas previas? Escríbenos</span>
        </button>
      </div>
    </article>
  );
}
