"use client";

import ProductCard from "./ProductCard";

const products = [
  {
    id: "rosas-eternas",
    name: "Rosas Eternas",
    price: 120,
    tag: "Bestseller",
    imageUrl:
      "https://images.unsplash.com/photo-1561136994-a8f38a2f76e1?w=600&q=80&auto=format&fit=crop",
    imageAlt: "Ramo de rosas rojas y rosadas sobre fondo beige",
  },
  {
    id: "jardin-silvestre",
    name: "Jardín Silvestre",
    price: 95,
    tag: undefined,
    imageUrl:
      "https://images.unsplash.com/photo-1549187774-b4e9b0445b41?w=600&q=80&auto=format&fit=crop",
    imageAlt: "Arreglo con flores silvestres coloridas en tonos pasteles",
  },
  {
    id: "suite-blanca",
    name: "Suite Blanca",
    price: 150,
    tag: "Premium",
    imageUrl:
      "https://images.unsplash.com/photo-1462530260150-162092dbf011?w=600&q=80&auto=format&fit=crop",
    imageAlt: "Arreglo floral minimalista en blanco con rosas blancas",
  },
  {
    id: "atardecer-dorado",
    name: "Atardecer Dorado",
    price: 110,
    tag: undefined,
    imageUrl:
      "https://images.unsplash.com/photo-1487530811015-780be95be2e1?w=600&q=80&auto=format&fit=crop",
    imageAlt: "Ramo con flores en tonos naranjas, amarillos y dorados",
  },
  {
    id: "girasoles-del-campo",
    name: "Girasoles del Campo",
    price: 80,
    tag: undefined,
    imageUrl:
      "https://images.unsplash.com/photo-1470509037663-253d2d33b4b4?w=600&q=80&auto=format&fit=crop",
    imageAlt: "Ramo luminoso de girasoles frescos con follaje verde",
  },
  {
    id: "nocturna-violeta",
    name: "Nocturna Violeta",
    price: 130,
    tag: "Nuevo",
    imageUrl:
      "https://images.unsplash.com/photo-1455582916367-25f75bfc6710?w=600&q=80&auto=format&fit=crop",
    imageAlt: "Arreglo elegante en tonos violetas, lilas y borgoña",
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
