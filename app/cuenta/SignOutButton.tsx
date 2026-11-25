"use client";

import { useRouter } from "next/navigation";
import { createClient } from "../lib/supabaseBrowser";

export default function SignOutButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={async () => {
        await createClient().auth.signOut();
        router.replace("/");
        router.refresh();
      }}
      className="text-[11px] uppercase tracking-wider px-3 py-2 border border-[#E8CEAD] rounded-lg bg-white text-[#6B6560] hover:text-black hover:border-black transition-colors"
    >
      Cerrar sesión
    </button>
  );
}
