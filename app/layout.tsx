import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LAOBRA | Flores que hablan por ti",
  description:
    "Descubre arreglos florales artesanales en Lima. Regala flores, expresa tus sentimientos y crea un ramo personalizado con LAOBRA.",
  applicationName: "LAOBRA",
  openGraph: {
    title: "LAOBRA | Flores que hablan por ti",
    description:
      "Flores artesanales para expresar lo que sientes. Descubre el catálogo de LAOBRA en Lima.",
    locale: "es_PE",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-PE">
      <body>{children}</body>
    </html>
  );
}
