import Hero from "./components/Hero";
import Catalog from "./components/Catalog";
import CustomBouquet from "./components/CustomBouquet";
import AboutUs from "./components/AboutUs";
import Benefits from "./components/Benefits";
import Header from "./components/Header";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <>
      <a
        href="#contenido-principal"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-white focus:p-3 focus:text-black"
      >
        Saltar al contenido
      </a>

      <Header />

      <main id="contenido-principal">
        <section id="inicio">
          <Hero />
        </section>

        <section id="catalogo">
          <Catalog />
        </section>

        <section id="personalizar">
          <CustomBouquet />
        </section>

        <section id="nosotros">
          <AboutUs />
        </section>

        <Benefits />
      </main>

      <Footer />
    </>
  );
}
