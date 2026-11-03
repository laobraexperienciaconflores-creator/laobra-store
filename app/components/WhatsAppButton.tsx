'use client';

import React, { useState, useEffect } from 'react';
import { WHATSAPP_NUMBER } from '../lib/constants';

const WA_MESSAGE = encodeURIComponent(
  '¡Hola LA OBRA! 🌸 Me interesa hacer un pedido. ¿Me pueden ayudar?'
);
const WA_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${WA_MESSAGE}`;

export default function WhatsAppButton() {
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);

  // Desliza hacia arriba tras 1.2 segundos
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <a
      href={WA_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escríbenos por WhatsApp"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="wa-float-btn"
      style={{
        position: 'fixed',
        bottom: '1.75rem',
        right: '1.75rem',
        zIndex: 45,
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        background: '#25D366',
        borderRadius: '9999px',
        boxShadow: '0 4px 24px rgba(37,211,102,0.35), 0 1px 4px rgba(0,0,0,0.15)',
        padding: hovered ? '0.75rem 1.25rem 0.75rem 1rem' : '0.875rem',
        transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
        transform: visible ? 'translateY(0)' : 'translateY(120px)',
        opacity: visible ? 1 : 0,
        cursor: 'pointer',
        textDecoration: 'none',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
      }}
    >
      {/* Ícono SVG WhatsApp oficial */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        width="26"
        height="26"
        fill="#FFFFFF"
        style={{ flexShrink: 0, display: 'block' }}
        aria-hidden="true"
      >
        <path d="M16.004 2.667C8.64 2.667 2.667 8.64 2.667 16c0 2.37.626 4.694 1.814 6.74L2.667 29.333l6.783-1.778A13.28 13.28 0 0016.004 29.333C23.36 29.333 29.333 23.36 29.333 16S23.36 2.667 16.004 2.667zm0 24.267a11 11 0 01-5.626-1.548l-.403-.24-4.026 1.056 1.073-3.92-.263-.414A11.006 11.006 0 0116.004 5a11 11 0 110 21.934zm6.04-8.24c-.331-.166-1.96-.966-2.264-1.076-.304-.11-.525-.166-.746.167-.221.33-.856 1.075-1.05 1.296-.193.22-.386.247-.717.083-.331-.166-1.397-.515-2.661-1.642-.984-.877-1.648-1.96-1.841-2.292-.193-.332-.02-.512.145-.677.15-.15.331-.386.497-.58.166-.193.22-.33.331-.552.11-.22.055-.414-.028-.58-.083-.166-.746-1.8-1.022-2.463-.27-.647-.543-.56-.746-.57l-.636-.011c-.22 0-.58.083-.884.414-.304.33-1.16 1.133-1.16 2.763 0 1.63 1.188 3.207 1.354 3.428.166.22 2.34 3.573 5.67 5.01.793.343 1.41.548 1.892.701.795.254 1.52.218 2.09.132.638-.096 1.96-.801 2.237-1.574.276-.773.276-1.435.193-1.574-.082-.138-.304-.22-.635-.386z" />
      </svg>

      {/* Label deslizante al hacer hover */}
      <span
        style={{
          color: '#FFFFFF',
          fontSize: '0.78rem',
          fontWeight: 600,
          letterSpacing: '0.06em',
          maxWidth: hovered ? '160px' : '0px',
          opacity: hovered ? 1 : 0,
          transition: 'max-width 0.3s cubic-bezier(0.34,1.56,0.64,1), opacity 0.25s ease',
          overflow: 'hidden',
        }}
      >
        Escríbenos
      </span>

      {/* Pulse animado */}
      <span
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '9999px',
          background: '#25D366',
          animation: 'wa-pulse 2.4s ease-out infinite',
          zIndex: -1,
        }}
      />
    </a>
  );
}

