"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../lib/supabaseBrowser";
import { useCart } from "../context/CartContext";

export default function ProfileForm({
  initialName,
  initialPhone,
}: {
  initialName: string;
  initialPhone: string;
}) {
  const router = useRouter();
  const { updateOrderDetails } = useCart();
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    const cleanName = name.trim().slice(0, 80);
    const cleanPhone = phone.replace(/[^\d+ ]/g, "").trim().slice(0, 20);
    if (cleanPhone && cleanPhone.replace(/\D/g, "").length < 9) {
      setMessage({ ok: false, text: "El celular debe tener al menos 9 dígitos." });
      return;
    }

    setSaving(true);
    const { error } = await createClient().auth.updateUser({
      data: { full_name: cleanName, phone: cleanPhone },
    });
    setSaving(false);

    if (error) {
      setMessage({ ok: false, text: "No se pudieron guardar tus datos. Inténtalo de nuevo." });
      return;
    }

    // Refleja los datos en el carrito para el próximo pedido
    updateOrderDetails({
      ...(cleanName && { buyerName: cleanName }),
      ...(cleanPhone && { buyerPhone: cleanPhone }),
    });
    setMessage({ ok: true, text: "Datos guardados." });
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <label className="block text-[11px] uppercase tracking-wider text-[#6B6560]">
        Nombre completo
        <input
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={80}
          className="mt-1.5 w-full px-3.5 py-2.5 border border-[#E8CEAD] rounded-xl text-sm text-black normal-case tracking-normal focus:outline-none focus:border-black"
        />
      </label>
      <label className="block text-[11px] uppercase tracking-wider text-[#6B6560]">
        Celular
        <input
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="987 654 321"
          maxLength={20}
          className="mt-1.5 w-full px-3.5 py-2.5 border border-[#E8CEAD] rounded-xl text-sm text-black normal-case tracking-normal focus:outline-none focus:border-black"
        />
      </label>
      <div className="sm:col-span-2 flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2.5 bg-black hover:bg-neutral-800 text-white text-xs uppercase tracking-[0.15em] rounded-xl transition-colors disabled:opacity-60"
        >
          {saving ? "Guardando…" : "Guardar"}
        </button>
        {message && (
          <span className={`text-xs ${message.ok ? "text-[#4A6B53]" : "text-red-700"}`}>
            {message.text}
          </span>
        )}
      </div>
    </form>
  );
}
