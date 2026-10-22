"use client";

import { useEffect, useState } from "react";

export default function Footer() {
  const [currentYear, setCurrentYear] = useState(2026);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      "¡Hola, LAOBRA! 🌸 Quisiera más información."
    );

    window.open(
      `https://wa.me/51919487505?text=${message}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const navigationLinks = [
    { href: "#inicio", label: "Inicio" },
    { href: "#catalogo", label: "Catálogo" },
    { href: "#personalizar", label: "Crea tu ramo" },
    { href: "#nosotros", label: "Nosotros" },
  ];

  return (
    <footer
      className="px-6 py-20 lg:px-12"
      style={{ background: "#000000" }}
      aria-label="Pie de página"
    >
      <div className="mx-auto max-w-7xl">
        <div
          className="grid grid-cols-1 gap-14 border-b pb-14 md:grid-cols-3"
          style={{ borderColor: "rgba(255,255,255,0.1)" }}
        >
          <div className="flex flex-col gap-6">
            <div>
              <a
                href="#inicio"
                className="inline-block text-2xl font-light tracking-[0.3em] text-white transition-opacity hover:opacity-70"
                style={{
                  fontFamily: "Georgia, 'Times New Roman', serif",
                }}
                aria-label="LAOBRA, ir al inicio"
              >
                LAOBRA
              </a>

              <p
                className="mt-3 max-w-xs text-xs font-light leading-relaxed"
                style={{
                  color: "rgba(255,255,255,0.5)",
                  letterSpacing: "0.02em",
                }}
              >
                Floristería artesanal en Lima.
                <br />
                Flores que hablan por ti.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <a
                href="https://www.instagram.com/laobra.flores/"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-opacity hover:opacity-50"
                aria-label="Seguir LAOBRA en Instagram"
              >
                <InstagramIcon />
              </a>

              <button
                type="button"
                onClick={handleWhatsApp}
                className="transition-opacity hover:opacity-50"
                aria-label="Contactar LAOBRA por WhatsApp"
              >
                <WhatsAppIconSmall />
              </button>
            </div>
          </div>

          <nav aria-label="Navegación del pie de página">
            <p
              className="mb-5 text-xs uppercase tracking-widest"
              style={{
                color: "rgba(255,255,255,0.4)",
                letterSpacing: "0.2em",
              }}
            >
              Navegación
            </p>

            <ul className="flex flex-col gap-3">
              {navigationLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm font-light transition-opacity duration-300 hover:opacity-50"
                    style={{
                      color: "rgba(255,255,255,0.7)",
                      letterSpacing: "0.03em",
                    }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p
              className="mb-5 text-xs uppercase tracking-widest"
              style={{
                color: "rgba(255,255,255,0.4)",
                letterSpacing: "0.2em",
              }}
            >
              Contacto
            </p>

            <ul className="flex flex-col gap-4">
              <li>
                <p
                  className="mb-1 text-xs font-light"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                >
                  WhatsApp
                </p>

                <button
                  type="button"
                  onClick={handleWhatsApp}
                  className="text-sm font-light transition-opacity hover:opacity-60"
                  style={{ color: "rgba(255,255,255,0.8)" }}
                  aria-label="Contactar a LAOBRA por WhatsApp"
                >
                  +51 919 487 505
                </button>
              </li>

              <li>
                <p
                  className="mb-1 text-xs font-light"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                >
                  Instagram
                </p>

                <a
                  href="https://www.instagram.com/laobra.flores/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-light transition-opacity hover:opacity-60"
                  style={{ color: "rgba(255,255,255,0.8)" }}
                >
                  @laobra.flores
                </a>
              </li>

              <li>
                <p
                  className="mb-1 text-xs font-light"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                >
                  Horario de atención
                </p>

                <p
                  className="text-sm font-light"
                  style={{ color: "rgba(255,255,255,0.8)" }}
                >
                  Lun–Sáb: 9 a. m. – 7 p. m.
                </p>
              </li>

              <li>
                <p
                  className="mb-1 text-xs font-light"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                >
                  Ubicación
                </p>

                <p
                  className="text-sm font-light"
                  style={{ color: "rgba(255,255,255,0.8)" }}
                >
                  Lima, Perú
                </p>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 pt-8 sm:flex-row">
          <p
            className="text-center text-xs font-light sm:text-left"
            style={{ color: "rgba(255,255,255,0.3)" }}
          >
            © {currentYear} LAOBRA. Todos los derechos reservados.
          </p>

          <p
            className="text-xs font-light"
            style={{ color: "rgba(255,255,255,0.3)" }}
          >
            Hecho con <span aria-label="amor" role="img">♡</span> en Lima
          </p>
        </div>
      </div>
    </footer>
  );
}

function InstagramIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="rgba(255,255,255,0.7)"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function WhatsAppIconSmall() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="rgba(255,255,255,0.7)"
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.347-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  );
}
