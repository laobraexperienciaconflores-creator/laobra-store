import Image from "next/image";

export default function AboutUs() {
  return (
    <section
      id="nosotros"
      className="py-24 px-6 lg:px-12"
      style={{ background: "#FFFFFF" }}
      aria-labelledby="about-title"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Images mosaic */}
          <div className="relative grid grid-cols-2 gap-4">
            <div className="col-span-2 relative aspect-[16/9] overflow-hidden" style={{ background: "#F3E2CE" }}>
              <Image
                src="https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=800&q=80&auto=format&fit=crop"
                alt="Interior del taller floral de LA OBRA con flores frescas"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                style={{ objectFit: "cover" }}
                quality={80}
              />
            </div>
            <div className="relative aspect-square overflow-hidden" style={{ background: "#E8CEAD" }}>
              <Image
                src="https://images.unsplash.com/photo-1502977249166-824b3a8a4d6d?w=400&q=80&auto=format&fit=crop"
                alt="Detalle de flores frescas en el taller"
                fill
                sizes="25vw"
                style={{ objectFit: "cover" }}
                quality={75}
              />
            </div>
            <div className="relative aspect-square overflow-hidden" style={{ background: "#FAF3EC" }}>
              <Image
                src="https://images.unsplash.com/photo-1548533416-6b88b81c4248?w=400&q=80&auto=format&fit=crop"
                alt="Ramos listos para entrega en LA OBRA"
                fill
                sizes="25vw"
                style={{ objectFit: "cover" }}
                quality={75}
              />
            </div>
          </div>

          {/* Text content */}
          <div>
            <p
              className="text-xs tracking-[0.35em] uppercase mb-4"
              style={{ color: "#6B6560", letterSpacing: "0.3em" }}
            >
              Nuestra filosofía
            </p>
            <h2
              id="about-title"
              className="text-4xl sm:text-5xl font-light mb-8 leading-tight"
              style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                color: "#000000",
              }}
            >
              Floristería de autor
              <br />
              con alma y detalle
            </h2>

            <div className="space-y-5 text-sm font-light leading-relaxed" style={{ color: "#3A3530" }}>
              <p>
                En <strong style={{ color: "#000000", fontWeight: 500 }}>LA OBRA</strong> creemos
                que las flores son mucho más que un regalo: son un puente entre personas, un gesto que expresa
                lo que las palabras a veces no logran decir.
              </p>
              <p>
                Nacimos en Lima con la visión de transformar la experiencia floral tradicional en algo sofisticado,
                cálido y verdaderamente personalizado. Cada flor es elegida por su frescura, color y presencia, y cada
                arreglo es diseñado individualmente como una pequeña obra de arte efímera.
              </p>
              <p>
                Trabajamos con productores locales y flores de temporada para garantizar la máxima durabilidad y
                belleza en cada entrega.
              </p>
            </div>

            {/* Brand pillars */}
            <div className="mt-10 pt-10 border-t grid grid-cols-3 gap-6 text-center" style={{ borderColor: "#F3E2CE" }}>
              {[
                { number: "100%", label: "Flores frescas del día" },
                { number: "Lima", label: "Cobertura en toda la ciudad" },
                { number: "+500", label: "Momentos celebrados" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p
                    className="text-2xl sm:text-3xl font-light mb-1"
                    style={{
                      fontFamily: "Georgia, 'Times New Roman', serif",
                      color: "#000000",
                    }}
                  >
                    {stat.number}
                  </p>
                  <p className="text-xs font-light" style={{ color: "#6B6560", letterSpacing: "0.05em" }}>
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
