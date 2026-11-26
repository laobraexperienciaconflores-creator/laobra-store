import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "./context/CartContext";
import CartDrawer from "./components/CartDrawer";
import WhatsAppButton from "./components/WhatsAppButton";
import AccountSync from "./components/AccountSync";
import { WHATSAPP_DISPLAY } from "./lib/constants";

// Ficha del negocio para Google (búsqueda y Maps). Debe coincidir con el Perfil de Empresa de Google.
const SITE_URL = "https://laobra-store.vercel.app";
const businessJsonLd = {
  "@context": "https://schema.org",
  "@type": "Florist",
  name: "LA OBRA",
  description: "Floristería artesanal en Lima. Experiencias con flores y ramos personalizados.",
  url: SITE_URL,
  telephone: WHATSAPP_DISPLAY.replace(/\s/g, ""),
  image: `${SITE_URL}/brand/tarjeta-laobra.jpg`,
  priceRange: "S/ 55 – S/ 600",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Av. Roca y Boloña 825",
    addressLocality: "Lima",
    postalCode: "15048",
    addressCountry: "PE",
  },
  geo: { "@type": "GeoCoordinates", latitude: -12.12034, longitude: -77.013524 },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "09:00",
      closes: "19:00",
    },
  ],
  sameAs: ["https://www.instagram.com/laobra.pe", "https://www.tiktok.com/@laobra.pe"],
};

export const metadata: Metadata = {
  title: "LA OBRA | Experiencias con flores",
  description:
    "Descubre arreglos florales artesanales en Lima. Regala flores, expresa tus sentimientos y crea un ramo personalizado con LA OBRA.",
  applicationName: "LA OBRA",
  openGraph: {
    title: "LA OBRA | Experiencias con flores",
    description:
      "Flores artesanales para expresar lo que sientes. Descubre el catálogo de LA OBRA en Lima.",
    locale: "es_PE",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(businessJsonLd).replace(/</g, "\\u003c") }}
        />
        <CartProvider>
          {children}
          <CartDrawer />
          <AccountSync />
          {/* Botón flotante de WhatsApp */}
          <WhatsAppButton />
        </CartProvider>
      </body>
    </html>
  );
}
