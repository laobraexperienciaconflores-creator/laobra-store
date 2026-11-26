// Configuración compartida del ramo personalizado (cliente y servidor).

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
        flowers: ["5–8 flores de temporada", "3-6 flores de relleno", "Follaje clásico", "Envoltura clásica", "(Puede contener 1 flor exclusiva)"],
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
        flowers: ["8–12 flores de temporada", "6-9 flores de relleno", "Follaje clásico", "Envoltura clásica", "(Puede contener 2 flores exclusivas)"],
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
        flowers: ["12-18 flores de temporada", "6-8 flores mixtas", "Follaje clásico", "Envoltura clásica", "(Puede contener 3 flores exclusivas)"],
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
        flowers: ["18-24 flores de temporada", "8-12 flores mixtas", "Follaje clásico", "Envoltura clásica", "(Puede contener 4 flores exclusivas)"],
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
        flowers: ["6-8 flores premium", "4-6 flores de relleno", "Follaje aromático", "Envoltura premium", "Puede contener 2 flor exclusiva"],
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
        flowers: ["8-10 flores premium", "6-10 flores de relleno", "Follaje aromático", "Envoltura premium", "Puede contener 4 flores exclusivas"],
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
        flowers: ["10-16 flores premium", "10-16 flores de relleno", "Follaje aromático", "Envoltura premium", "Puede contener 6 flores exclusivas"],
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
        flowers: ["20+flores premium", "20+ flores de relleno", "Follaje aromático", "Envoltura premium", "Puede contener 8 flores exclusivas"],
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
        flowers: ["8-10 flores exclusivas", "4-8 flores de mixtas", "Follaje premium", "Envoltura premium", "Puede contener 1 flor exótica", "Entrega especial"],
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
        flowers: ["12-16 flores exclusivas", "6-12 flores mixtas", "Follaje premium", "Envoltura premium", "Puede contener 2 flores exóticas", "Entrega especial"],
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
        flowers: ["18-24 flores exclusivas", "10-16 flores de mixtas", "Follaje premium", "Envoltura premium", "Puede contener 3 flores exóticas", "Entrega especial"],
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
        flowers: ["24+ flores exclusivas", "24+ flores de mixtas", "Follaje premium", "Envoltura premium", "Puede contener 4 flores exóticas", "Entrega especial"],
      },
    },
  },
};
// Ocasión del ramo. "otro" permite que el cliente escriba la suya.
export const OCCASIONS = [
  { id: "romantico", label: "Romántico", icon: "♡" },
  { id: "cumpleanos", label: "Cumpleaños", icon: "✦" },
  { id: "aniversario", label: "Aniversario", icon: "∞" },
  { id: "agradecimiento", label: "Agradecimiento", icon: "✿" },
  { id: "felicitaciones", label: "Felicitaciones", icon: "★" },
  { id: "recuperacion", label: "Pronta recuperación", icon: "☼" },
  { id: "condolencias", label: "Condolencias", icon: "❀" },
  { id: "otro", label: "Otro", icon: "✎" },
] as const;

export type OccasionId = (typeof OCCASIONS)[number]["id"];
export const OTHER_OCCASION_MAX_LENGTH = 40;

/** Máximo de colores de flores que puede elegir el cliente. */
export const MAX_FLOWER_COLORS = 3;

export const INDIVIDUAL_COLORS = [
  { name: "Blanco", color: "#FFFFFF", border: true },
  { name: "Rosado", color: "#EC407A" },
  { name: "Rosa Pastel", color: "#F48FB1" },
  { name: "Fucsia", color: "#D81B60" },
  { name: "Rojo", color: "#C62828" },
  { name: "Rojo Vino", color: "#880E4F" },
  { name: "Morado", color: "#6A1B9A" },
  { name: "Lila / Violeta", color: "#CE93D8" },
  { name: "Naranja", color: "#FB8C00" },
  { name: "Durazno", color: "#FFAB91" },
  { name: "Terracota", color: "#C2603E" },
  { name: "Amarillo", color: "#FFE082" },
  { name: "Azul", color: "#90CAF9" },
  { name: "Negro", color: "#1A1A1A" },
  { name: "Follaje Verde", color: "#81C784" },
];
