"use client";

import Image from "next/image";
import { WHATSAPP_NUMBER } from "../lib/constants";

export default function CustomBouquet() {
  const steps = [
    {
      number: "01",
      title: "Elige tus flores",
      description: "Selecciona entre rosas, girasoles, lirios, tulipanes y más flores de temporada.",
    },
    {
      number: "02",
      title: "Define colores y estilo",
      description: "Desde minimalista y monocromático hasta exuberante y silvestre.",
    },
    {
      number: "03",
      title: "Escoge el envoltorio",
      description: "Papel kraft, tela de lino, caja de regalo o canasta artesanal.",
    },
    {
      number: "04",
      title: "Programa la entrega",
      description: "Elige fecha, hora y dirección. Coordinamos los detalles por WhatsApp.",
    },
  ];

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      "Hola LA OBRA, me gustaría crear mi propio ramo personalizado. ¿Pueden ayudarme?"
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank", "noopener,noreferrer");
  };

  return (
    <section
      id="personalizar"
      className="py-24 px-6 lg:px-12 overflow-hidden"
      style={{ background: "#F3E2CE" }}
      aria-labelledby="custom-title"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Text side */}
          <div>
            <p
              className="text-xs tracking-[0.35em] uppercase mb-4"
              style={{ color: "#6B6560", letterSpacing: "0.3em" }}
            >
              Experiencia personalizada
            </p>
            <h2
              id="custom-title"
              className="text-4xl sm:text-5xl font-light mb-6 leading-tight"
              style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                color: "#000000",
              }}
            >
              Crea tu
              <br />
              propio ramo
            </h2>
            <p
              className="text-base font-light leading-relaxed mb-10 max-w-md"
              style={{ color: "#3A3530" }}
            >
              Diseñamos ramos únicos a tu medida. Elige las flores que más te gusten,
              el tamaño, la paleta de color y un mensaje especial. Nosotros nos encargamos de que sea inolvidable.
            </p>

            {/* Steps list */}
            <div className="space-y-6 mb-10">
              {steps.map((step) => (
                <div key={step.number} className="flex gap-5 items-start">
                  <span
                    className="text-xs tracking-widest font-mono font-medium flex-shrink-0 pt-0.5"
                    style={{ color: "#6B6560" }}
                  >
                    {step.number}
                  </span>
                  <div>
                    <h3
                      className="text-base font-normal mb-1"
                      style={{ color: "#000000" }}
                    >
                      {step.title}
                    </h3>
                    <p
                      className="text-sm font-light leading-relaxed"
                      style={{ color: "#6B6560" }}
                    >
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <button
              onClick={handleWhatsApp}
              className="inline-flex items-center gap-3 px-8 py-4 text-sm tracking-widest uppercase transition-all duration-300 hover:gap-5 active:scale-95"
              style={{
                background: "#000000",
                color: "#FFFFFF",
                letterSpacing: "0.15em",
                fontWeight: 400,
              }}
              aria-label="Personalizar ramo por WhatsApp"
            >
              <span>Personalizar mi ramo</span>
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
                aria-hidden="true"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Visual side - Elegant overlapping images */}
          <div className="relative">
            {/* Main large image */}
            <div
              className="relative aspect-[4/5] overflow-hidden shadow-2xl"
              style={{ background: "#E8CEAD" }}
            >
              <Image
                src="https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=800&q=80&auto=format&fit=crop"
                alt="Florista armando un ramo floral personalizado con flores frescas"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                style={{ objectFit: "cover" }}
                quality={85}
              />
            </div>

            {/* Floating accent card */}
            <div
              className="absolute -bottom-8 -left-8 p-6 hidden sm:block max-w-xs shadow-xl"
              style={{
                background: "#FFFFFF",
                border: "1px solid #F3E2CE",
              }}
            >
              <p
                className="text-[11px] tracking-widest uppercase mb-1"
                style={{ color: "#6B6560", letterSpacing: "0.2em" }}
              >
                100% Personalizado
              </p>
              <p
                className="text-base font-light italic"
                style={{
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  color: "#000000",
                }}
              >
                &ldquo;Cada flor cuenta una historia diferente.&rdquo;
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}