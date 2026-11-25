import { Suspense } from "react";
import type { Metadata } from "next";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Ingresar | LA OBRA",
  robots: { index: false },
};

export default function IngresarPage() {
  return (
    <main className="min-h-screen bg-[#FAF3EC] flex items-center justify-center px-4 py-12">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
