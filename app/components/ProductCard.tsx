"use client";

import Image from "next/image";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  imageAlt: string;
  tag?: string;
}

export default function ProductCard({
  name,
  price,
  imageUrl,
  imageAlt,
  tag,
}: ProductCardProps) {
  const formattedPrice = new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 0,
  }).format(price);

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `Hola LAOBRA 🌸 Me gustaría pedir el arreglo "${name}" (${formattedPrice}). ¿Está disponible?`
    );
    window.open(`https://wa.me/51919487505?text=${message}`, "_blank", "noopener,noreferrer");
  };

  return (
    <article className="group flex flex-col justify-between" aria-label={`Producto: ${name}`}>
      <div>
        {/* Image wrapper */}
        <div
          className="relative aspect-[3/4] overflow-hidden mb-5 transition-transform duration-500 ease-out"
          style={{ background: "#F3E2CE" }}
        >
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            quality={85}
          />

          {tag && (
            <span
              className="absolute top-4 left-4 px-3 py-1 text-[11px] tracking-widest uppercase font-medium"
              style={{
                background: "#000000",
                color: "#FFFFFF",
                letterSpacing: "0.15em",
              }}
            >
              {tag}
            </span>
          )}
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
      </div>

      {/* Action Button */}
      <button
        onClick={handleWhatsApp}
        className="mt-3 w-full py-3 text-xs tracking-[0.2em] uppercase transition-all duration-300 flex items-center justify-center gap-2 border"
        style={{
          borderColor: "#000000",
          color: "#000000",
          background: "transparent",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#000000";
          e.currentTarget.style.color = "#FFFFFF";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "#000000";
        }}
        aria-label={`Pedir ${name} por WhatsApp`}
      >
        <span>Pedir por WhatsApp</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </button>
    </article>
  );
}
