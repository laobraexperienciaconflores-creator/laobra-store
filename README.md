# LA OBRA — Tienda Online

E-commerce de arreglos florales artesanales en Lima, construido con **Next.js 16**, **Supabase** y **Mercado Pago**.

---

## Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Base de datos / Auth**: Supabase (PostgreSQL)
- **Pagos**: Mercado Pago (Perú) — Yape/Plin + tarjeta
- **Deploy**: Vercel
- **Estilos**: Tailwind CSS v4

---

## Desarrollo local

```bash
# 1. Instala dependencias
npm install

# 2. Copia el ejemplo de variables y complétalo
cp .env.example .env.local

# 3. Levanta el servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

---

## Variables de entorno

Copia `.env.example` y completa cada valor. Las variables `NEXT_PUBLIC_*` son seguras para el cliente; las demás son solo servidor.

| Variable | Dónde obtenerla |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API |
| `SUPABASE_SECRET_KEY` | Supabase → Project Settings → API → service_role |
| `MERCADOPAGO_ACCESS_TOKEN` | [MP Developers](https://www.mercadopago.com.pe/settings/account/credentials) → Credenciales de producción |
| `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY` | Igual que el anterior |
| `NEXT_PUBLIC_SITE_URL` | URL pública de tu Vercel (ej: `https://laobra.vercel.app`) |
| `MERCADOPAGO_WEBHOOK_URL` | `${NEXT_PUBLIC_SITE_URL}/api/mercadopago/webhook` |
| `ADMIN_EMAIL` | Email del administrador |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Número de WhatsApp con código de país, sin `+` (ej: `51988559304`) |

---

## Deploy en Vercel

1. Conecta el repositorio en [vercel.com/new](https://vercel.com/new)
2. En **Environment Variables**, agrega todas las variables del archivo `.env.example`
3. Vercel detectará automáticamente Next.js y usará `npm run build`

### Configurar webhook de Mercado Pago

Después del primer deploy, ve a [MP Developers → Webhooks](https://www.mercadopago.com.pe/developers/panel/app) y registra:

```
https://TU-DOMINIO.vercel.app/api/mercadopago/webhook
```

Eventos a suscribir: `payment`

---

## Comandos útiles

```bash
npm run dev      # Desarrollo con hot-reload
npm run build    # Build de producción (verifica errores TS)
npm run start    # Inicia el servidor de producción local
npm run lint     # Linter ESLint
```

