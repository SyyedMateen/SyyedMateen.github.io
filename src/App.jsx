import Cursor from "./components/Cursor";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import Services from "./components/Services";
import About from "./components/About";
import Capabilities from "./components/Capabilities";
import Work from "./components/Work";
import Process from "./components/Process";
import Cinematic from "./components/Cinematic";
import CTA from "./components/CTA";
import Footer from "./components/Footer";

export default function App() {
  return (
    <>
      <Cursor />

      <Nav />

      <main>
        <Hero />
        <Services />
        <Work />
        <About />
        <Capabilities />
        <Process />
        <Cinematic />
        <CTA />
      </main>

      <Footer />
    </>
  );
}