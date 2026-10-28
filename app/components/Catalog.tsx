"use client";

import ProductCard from "./ProductCard";

const products = [
  {
    id: "lumbre",
    name: "LUMBRE | Bouquet de autor",
    price: 239,
    description: "Hay personas que lo iluminan todo. LUMBRE composición cálida y expresiva que combina rosas mandarina y durazno con flores verdes, diferentes texturas y una delicada caída floral dedicatoria personal.",
    imageUrl: "/products/lumbre.jpg",
    images: ["/products/lumbre.jpg", "/products/lumbre-model.jpg"],
    imageAlt: "LUMBRE | Bouquet de autor",
  },
  {
    id: "vela",
    name: "VELA | Bouquet romántico premium",
    price: 199,
    description: "Lo que sientes, en flores. VELA es una composición intensa y sofisticada que combina rosas rosadas, flores en tonos vino y elegantes calas oscuras. Incluye tarjeta para dedicatoria personalizada.",
    imageUrl: "/products/vela.jpg",
    images: ["/products/vela.jpg", "/products/vela-model.jpg"],
    imageAlt: "VELA | Bouquet romántico premium",
  },
  {
    id: "carmesí",
    name: "CARMESÍ | Bouquet romántico",
    price: 189,
    description: "Sentimientos que florecen. CARMESÍ reúne flores en rojo vino profundo, rosas rosadas y delicados acentos florales en una composición abundante y romántica. Incluye dedicatoria personalizada.",
    imageUrl: "/products/carmesí.jpg",
    images: ["/products/carmesí.jpg", "/products/carmesi-model.jpg"],
    imageAlt: "CARMESÍ | Bouquet romántico",
  },
  {
    id: "silencio",
    name: "SILENCIO | Bouquet de autor",
    price: 269,
    description: "Cuando las flores lo dicen todo. SILENCIO es una composición de presencia elegante y serena, creada con lirios blancos, calas y anturios en tonos marfil. Incluye tarjeta para dedicatoria personalizada.",
    imageUrl: "/products/silencio.jpg",
    images: ["/products/silencio.jpg", "/products/silencio-model.jpg"],
    imageAlt: "SILENCIO | Bouquet de autor",
  },
  {
    id: "bruma",
    name: "BRUMA | Bouquet floral",
    price: 169,
    description: "Alegría que florece. BRUMA composición luminosa y delicada donde las gerberas coral y frambuesa se encuentran con rosas y detalles florales llenos de frescura. Incluye dedicatoria personalizada.",
    imageUrl: "/products/bruma.jpg",
    images: ["/products/bruma.jpg", "/products/bruma-model.jpg"],
    imageAlt: "BRUMA | Bouquet floral",
  },
  /*{
    id: "aura",
    name: "AURA | Bouquet artístico",
    price: 209,
    description: "Paleta vibrante y audaz que celebra la creatividad floral.",
    imageUrl: "/products/aura.jpg",
    images: ["/products/aura.jpg"],
    imageAlt: "AURA | Bouquet artístico",
  },*/
  {
    id: "niebla",
    name: "NIEBLA | Bouquet artístico",
    price: 219,
    description: "La belleza de lo inesperado. NIEBLA es una composición floral de inspiración artística, con hortensias azules, iris violetas y delicadas flores en tonos lavanda. Incluye dedicatoria personalizada.",
    imageUrl: "/products/niebla.jpg",
    images: ["/products/niebla.jpg", "/products/niebla-model.jpg"],
    imageAlt: "NIEBLA | Bouquet artístico",
  },
];

export default function Catalog() {
  return (
    <section
      id="catalogo"
      className="py-24 px-6 lg:px-12"
      style={{ background: "#FFFFFF" }}
      aria-labelledby="catalog-title"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="mb-16 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <div>
            <p
              className="text-xs tracking-[0.35em] uppercase mb-3"
              style={{ color: "#6B6560", letterSpacing: "0.3em" }}
            >
              Selección curada
            </p>
            <h2
              id="catalog-title"
              className="text-4xl sm:text-5xl font-light leading-tight"
              style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                color: "#000000",
              }}
            >
              Arreglos
              <br />
              prediseñados
            </h2>
          </div>
          <p
            className="text-sm font-light max-w-xs leading-relaxed"
            style={{ color: "#6B6560" }}
          >
            Cada arreglo es preparado a mano el mismo día con flores frescas seleccionadas.
          </p>
        </div>

        {/* Thin horizontal rule */}
        <div
          className="mb-12 h-px w-full"
          style={{ background: "#F3E2CE" }}
          aria-hidden="true"
        />

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
          {products.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-16 text-center">
          <p className="text-sm font-light" style={{ color: "#6B6560" }}>
            ¿No encuentras lo que buscas?{" "}
            <a
              href="#personalizar"
              onClick={(e) => {
                e.preventDefault();
                document.querySelector("#personalizar")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="underline underline-offset-4 transition-opacity hover:opacity-50"
              style={{ color: "#000000" }}
            >
              Crea tu propio ramo
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
