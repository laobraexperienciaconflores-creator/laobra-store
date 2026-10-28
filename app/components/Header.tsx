"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "../context/CartContext";
import { WHATSAPP_NUMBER } from "../lib/constants";

const navLinks = [
  { href: "#inicio", label: "Inicio" },
  { href: "#catalogo", label: "Catálogo" },
  { href: "#personalizar", label: "Crea tu propio ramo" },
  /*{ href: "#nosotros", label: "Nosotros" },*/
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { totalCount, openCart } = useCart();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMenuOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 transition-all duration-300"
      style={{
        background: isScrolled
          ? "rgba(255, 255, 255, 0.97)"
          : "rgba(243, 226, 206, 0.85)",
        backdropFilter: "blur(12px)",
        borderBottom: isScrolled ? "1px solid #F3E2CE" : "1px solid rgba(0,0,0,0.06)",
        boxShadow: isScrolled ? "0 2px 20px rgba(0,0,0,0.05)" : "none",
      }}
    >
      <nav className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between h-20">
        {/* Logo */}
        <Link
          href="#inicio"
          onClick={(e) => handleNavClick(e, "#inicio")}
          className="flex items-center group"
          aria-label="LA OBRA — Ir al inicio"
        >
          <span
            className="text-2xl tracking-[0.25em] font-light transition-opacity duration-300 group-hover:opacity-70"
            style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              color: "#000000",
              letterSpacing: "0.3em",
            }}
          >
            LA OBRA
          </span>
        </Link>

        {/* Desktop Navigation */}
        <ul className="hidden md:flex items-center gap-10" role="navigation" aria-label="Navegación principal">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="text-sm tracking-widest uppercase transition-all duration-300 hover:opacity-60 relative group"
                style={{
                  color: "#000000",
                  fontWeight: 400,
                  letterSpacing: "0.12em",
                }}
              >
                {link.label}
                <span
                  className="absolute -bottom-1 left-0 w-0 h-px bg-current transition-all duration-300 group-hover:w-full"
                />
              </a>
            </li>
          ))}
        </ul>

        {/* Right CTA Actions: Cart & WhatsApp */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Cart Trigger Button */}
          <button
            onClick={openCart}
            className="relative flex items-center gap-2 p-2.5 sm:px-4 sm:py-2 text-xs tracking-widest uppercase border border-black/20 hover:border-black transition-all duration-300 hover:bg-black hover:text-white group"
            style={{ color: "#000000" }}
            aria-label={`Ver carrito con ${totalCount} productos`}
          >
            <CartIcon />
            <span className="hidden sm:inline font-medium">Carrito</span>
            {totalCount > 0 && (
              <span className="flex items-center justify-center min-w-5 h-5 px-1.5 text-[10px] font-bold rounded-full bg-black text-white group-hover:bg-white group-hover:text-black transition-colors">
                {totalCount}
              </span>
            )}
          </button>

          {/* WhatsApp CTA (Desktop) */}
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hola%20LAOBRA%2C%20me%20gustar%C3%ADa%20hacer%20un%20pedido`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-2 px-5 py-2.5 text-xs tracking-widest uppercase transition-all duration-300 hover:opacity-85 active:scale-95"
            style={{
              background: "#000000",
              color: "#FFFFFF",
              letterSpacing: "0.12em",
              fontWeight: 400,
            }}
            aria-label="Contactar por WhatsApp"
          >
            <WhatsAppIcon />
            WhatsApp
          </a>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-2 transition-all duration-300"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuOpen}
          >
            <span
              className="block w-6 h-0.5 transition-all duration-300 origin-center"
              style={{
                background: "#000000",
                transform: menuOpen ? "rotate(45deg) translate(3px, 3px)" : "none",
              }}
            />
            <span
              className="block w-6 h-0.5 transition-all duration-300"
              style={{
                background: "#000000",
                opacity: menuOpen ? 0 : 1,
              }}
            />
            <span
              className="block w-6 h-0.5 transition-all duration-300 origin-center"
              style={{
                background: "#000000",
                transform: menuOpen ? "rotate(-45deg) translate(3px, -3px)" : "none",
              }}
            />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className="md:hidden transition-all duration-500 overflow-hidden"
        style={{
          maxHeight: menuOpen ? "400px" : "0",
          background: "rgba(255,255,255,0.98)",
          backdropFilter: "blur(20px)",
        }}
      >
        <ul className="px-8 py-6 flex flex-col gap-5 border-t" style={{ borderColor: "#F3E2CE" }}>
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="text-base tracking-widest uppercase transition-opacity duration-300 hover:opacity-60 block"
                style={{ color: "#000000", fontWeight: 300, letterSpacing: "0.12em" }}
              >
                {link.label}
              </a>
            </li>
          ))}
          <li className="pt-2 flex flex-col gap-3">
            <button
              onClick={() => {
                setMenuOpen(false);
                openCart();
              }}
              className="w-full flex items-center justify-between py-3 px-4 text-xs tracking-widest uppercase border border-black bg-white text-black"
            >
              <div className="flex items-center gap-2">
                <CartIcon />
                <span>Ver Carrito</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-black text-white text-[10px]">
                {totalCount}
              </span>
            </button>

            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hola%20LAOBRA%2C%20me%20gustar%C3%ADa%20hacer%20un%20pedido`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-3 px-4 text-xs tracking-widest uppercase bg-black text-white"
              aria-label="Contactar por WhatsApp"
            >
              <WhatsAppIcon color="#FFFFFF" />
              WhatsApp Directo
            </a>
          </li>
        </ul>
      </div>
    </header>
  );
}

function CartIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

function WhatsAppIcon({ color = "currentColor" }: { color?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill={color}
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
