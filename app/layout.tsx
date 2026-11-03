import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "./context/CartContext";
import CartDrawer from "./components/CartDrawer";
import PromoModal from "./components/PromoModal";
import WhatsAppButton from "./components/WhatsAppButton";


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
        <CartProvider>
          {children}
          <CartDrawer />
          {/* Ventana emergente de 15% de descuento al entrar y al intentar salir */}
          <PromoModal />
          {/* Botón flotante de WhatsApp */}
          <WhatsAppButton />
        </CartProvider>
      </body>
    </html>
  );
}
