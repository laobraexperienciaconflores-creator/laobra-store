export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#F3E2CE]">
      <div className="mx-auto grid min-h-[620px] max-w-7xl items-center gap-10 px-6 pt-32 pb-16 md:px-12 lg:px-20">
        <div className="relative z-10 max-w-xl">
          <p className="mb-6 text-xs font-semibold uppercase tracking-[0.3em] text-black/60">
            LA OBRA · El arte de regalar
          </p>

          <h1 className="text-5xl font-light leading-[1.08] tracking-tight text-black sm:text-6xl lg:text-7xl">
            Flores que
            <span className="block font-serif italic">dicen más.</span>
          </h1>

          <p className="mt-7 max-w-md text-base leading-7 text-black/70 sm:text-lg">
            Creamos arreglos florales para transformar momentos especiales
            en recuerdos que duran para siempre.
          </p>

          <div className="mt-9 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="relative group inline-block w-full sm:w-auto">
              {/* Halo de resplandor dorado animado */}
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#B8924A] via-[#E8CEAD] to-[#B8924A] opacity-80 blur-md group-hover:opacity-100 group-hover:blur-lg transition-all duration-500 animate-pulse" />

              <a
                href="#personalizar"
                className="relative flex min-h-14 w-full sm:w-auto items-center justify-between sm:justify-center gap-3.5 overflow-hidden rounded-2xl bg-black px-7 py-3.5 text-white shadow-2xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] border border-[#B8924A]/80"
              >
                {/* Icono con fondo dorado */}
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#B8924A] to-[#8C6D2E] text-white text-sm shadow-sm">
                  ✨
                </span>

                <div className="flex flex-col text-left">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#E8CEAD] font-semibold leading-tight">
                    100% Personalizado
                  </span>
                  <span className="text-base font-bold tracking-tight text-white leading-tight">
                    Diseña tu ramo
                  </span>
                </div>

                <span className="text-[#E8CEAD] text-xl font-light group-hover:translate-x-1.5 transition-transform duration-300 pl-1">
                  →
                </span>

                {/* Destello de brillo diagonal que recorre el botón */}
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
              </a>
            </div>

            <a
              href="#catalogo"
              className="inline-flex min-h-14 items-center justify-center rounded-2xl border border-black/25 bg-white/40 px-7 py-3.5 text-sm font-medium text-black backdrop-blur-xs transition-all hover:bg-white/80 hover:border-black/60 w-full sm:w-auto text-center"
            >
              Explorar colección
            </a>
          </div>

          <div className="mt-12 flex items-center gap-4 border-t border-black/15 pt-6">
            <span className="text-2xl font-serif italic">VOL.1</span>
            <p className="max-w-xs text-xs leading-5 text-black/60">
              Selección especial de flores y detalles preparados con dedicación.
            </p>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-lg">
          <div className="absolute -right-4 -top-4 h-full w-full border border-black/15 sm:-right-6 sm:-top-6" />

          <div className="relative aspect-[3/4] sm:aspect-[2/3] overflow-hidden bg-[#E8D2BA]">
            <img
              src="/hero.jpg"
              alt="Florista con ramos exclusivos de LA OBRA"
              className="h-full w-full object-cover object-top"
              fetchPriority="high"
            />

            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-6 pt-20">
              <p className="text-xs uppercase tracking-[0.25em] text-white/80">
                Hecho para emocionar
              </p>
              <p className="mt-2 font-serif text-2xl italic text-white">
                Cada flor tiene algo que decir.
              </p>
            </div>
          </div>

          <p className="mt-4 text-right text-[10px] uppercase tracking-[0.25em] text-black/50">
            Flores · Diseño · Emoción
          </p>
        </div>
      </div>
    </section>
  );
}
