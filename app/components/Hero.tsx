export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#F3E2CE]">
      <div className="mx-auto grid min-h-[620px] max-w-7xl items-center gap-10 px-6 pt-28 pb-16 md:px-12 lg:px-20">
        <div className="relative z-10 max-w-xl">
          <p className="mb-6 text-xs font-semibold uppercase tracking-[0.3em] text-black/60">
            LAOBRA · El arte de regalar
          </p>

          <h1 className="text-5xl font-light leading-[1.08] tracking-tight text-black sm:text-6xl lg:text-7xl">
            Flores que
            <span className="block font-serif italic">dicen más.</span>
          </h1>

          <p className="mt-7 max-w-md text-base leading-7 text-black/70 sm:text-lg">
            Creamos arreglos florales para transformar momentos especiales
            en recuerdos que duran para siempre.
          </p>

          <div className="mt-9 flex flex-wrap gap-4">
            <a
              href="#catalogo"
              className="inline-flex min-h-12 items-center justify-center bg-black px-7 py-3 text-sm font-medium text-white transition hover:bg-black/80"
            >
              Explorar colección
            </a>

            <a
              href="#personalizar"
              className="inline-flex min-h-12 items-center justify-center border border-black/30 px-7 py-3 text-sm font-medium text-black transition hover:bg-white/50"
            >
              Diseña tu ramo
            </a>
          </div>

          <div className="mt-12 flex items-center gap-4 border-t border-black/15 pt-6">
            <span className="text-2xl font-serif italic">01</span>
            <p className="max-w-xs text-xs leading-5 text-black/60">
              Selección especial de flores y detalles preparados con dedicación.
            </p>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-lg">
          <div className="absolute -right-4 -top-4 h-full w-full border border-black/15 sm:-right-6 sm:-top-6" />

          <div className="relative aspect-[4/5] overflow-hidden bg-[#E8D2BA]">
            <img
              src="https://images.unsplash.com/photo-1520763185298-1b434c919102?auto=format&fit=crop&w=1200&q=85"
              alt="Arreglo floral elegante con flores frescas"
              className="h-full w-full object-cover"
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
