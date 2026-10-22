"use client";

const benefits = [
  {
    id: "atencion",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
    title: "Atención personalizada",
    description:
      "Cada pedido recibe nuestra atención completa. Te asesoramos para elegir el arreglo perfecto según la ocasión y tu presupuesto.",
  },
  {
    id: "entregas",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="1" y="3" width="15" height="13" />
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
    title: "Entregas programadas",
    description:
      "Tú eliges el día y la franja horaria. Llegamos puntuales para que tu sorpresa sea impecable en todo Lima.",
  },
  {
    id: "pagos",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
    title: "Pagos fáciles y seguros",
    description:
      "Aceptamos Yape, Plin, transferencias bancarias y tarjetas. Proceso simple y sin complicaciones vía WhatsApp.",
  },
];

export default function Benefits() {
  return (
    <section
      className="py-24 px-6 lg:px-12"
      style={{ background: "#FDF8F3" }}
      aria-labelledby="benefits-title"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section title */}
        <div className="text-center mb-16">
          <p
            className="text-xs tracking-[0.35em] uppercase mb-3"
            style={{ color: "#6B6560", letterSpacing: "0.3em" }}
          >
            Por qué elegirnos
          </p>
          <h2
            id="benefits-title"
            className="text-3xl sm:text-4xl font-light"
            style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              color: "#000000",
            }}
          >
            La experiencia LAOBRA
          </h2>
          <div
            className="mt-6 mx-auto h-px w-16"
            style={{ background: "#F3E2CE" }}
            aria-hidden="true"
          />
        </div>

        {/* Benefits cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <article
              key={benefit.id}
              className="p-8 sm:p-10 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
              style={{
                background: "#FFFFFF",
                border: "1px solid #F3E2CE",
              }}
            >
              {/* Subtle top indicator */}
              <div
                className="absolute top-0 left-0 right-0 h-0.5 transition-all duration-300 group-hover:h-1"
                style={{ background: "#F3E2CE" }}
                aria-hidden="true"
              />

              <div>
                {/* Number & Icon */}
                <div className="flex items-center justify-between mb-8">
                  <div
                    className="p-3 transition-colors duration-300"
                    style={{
                      background: "#FAF3EC",
                      color: "#000000",
                    }}
                  >
                    {benefit.icon}
                  </div>
                  <span
                    className="text-2xl font-light"
                    style={{
                      fontFamily: "Georgia, 'Times New Roman', serif",
                      color: "#E8CEAD",
                    }}
                  >
                    0{index + 1}
                  </span>
                </div>

                <h3
                  className="text-xl font-light mb-3"
                  style={{
                    fontFamily: "Georgia, 'Times New Roman', serif",
                    color: "#000000",
                  }}
                >
                  {benefit.title}
                </h3>
                <p
                  className="text-sm font-light leading-relaxed"
                  style={{ color: "#6B6560" }}
                >
                  {benefit.description}
                </p>
              </div>
            </article>
          ))}
        </div>

        {/* Bottom CTA strip */}
        <div
          className="mt-16 p-10 flex flex-col sm:flex-row items-center justify-between gap-6"
          style={{ background: "#000000" }}
        >
          <p
            className="text-xl sm:text-2xl font-light text-white text-center sm:text-left"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            ¿Lista tu ocasión especial?
          </p>
          <a
            href="https://wa.me/51919487505?text=Hola%20LAOBRA%2C%20quiero%20hacer%20un%20pedido"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 inline-flex items-center gap-3 px-8 py-4 text-sm tracking-widest uppercase transition-all duration-300 hover:gap-5 hover:opacity-90 active:scale-95"
            style={{
              background: "#F3E2CE",
              color: "#000000",
              fontWeight: 400,
              letterSpacing: "0.15em",
            }}
            aria-label="Hacer un pedido por WhatsApp"
          >
            Hacer un pedido
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
          </a>
        </div>
      </div>
    </section>
  );
}
