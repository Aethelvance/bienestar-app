import { useEffect, useState } from "react";
import { BrowserRouter, Link, NavLink, Route, Routes } from "react-router-dom";
import { FlaskConical, Home as HomeIcon, Leaf } from "lucide-react";
import { motion } from "framer-motion";
import Lenis from "lenis";
import Home from "./pages/Home.jsx";
import Lab from "./pages/Lab.jsx";
import { EASE } from "./lib/motion.js";

export default function App() {
  // `started` orquesta la entrada: header + reveals del hero.
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), 60);
    return () => clearTimeout(t);
  }, []);

  // Scroll suave global (Lenis): un rAF recorre la página.
  useEffect(() => {
    const lenis = new Lenis();
    let raf;
    const loop = (time) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  return (
    <BrowserRouter>
      <div className="grain" aria-hidden />
      <motion.header
        initial={{ y: "-100%" }}
        animate={started ? { y: "0%" } : {}}
        transition={{ duration: 0.7, ease: EASE, delay: 0.05 }}
        className="relative z-20 flex h-16 items-center justify-between gap-4 border-b-[3px] border-ink bg-bone px-4 sm:px-6 lg:px-10"
      >
        <Link to="/" className="group flex items-center gap-3" aria-label="Bienestar — inicio">
          <span className="flex h-10 w-10 items-center justify-center border-[3px] border-ink bg-sky transition-transform duration-500 group-hover:rotate-[360deg]">
            <Leaf className="h-5 w-5" strokeWidth={2.5} />
          </span>
          <span className="font-display text-xl leading-none tracking-wide sm:text-2xl">
            BIENESTAR <span className="font-serif normal-case italic">app</span>
          </span>
        </Link>
        <nav className="flex items-center gap-2 sm:gap-3">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex items-center gap-2 border-[3px] border-ink px-3 py-2 font-mono text-[11px] tracking-[0.18em] transition-colors duration-300 sm:px-4 ${
                isActive ? "bg-ink text-bone" : "bg-bone hover:bg-sky"
              }`
            }
          >
            <HomeIcon className="h-4 w-4" strokeWidth={2.6} /> INICIO
          </NavLink>
          <NavLink
            to="/lab"
            className={({ isActive }) =>
              `flex items-center gap-2 border-[3px] border-ink px-3 py-2 font-mono text-[11px] tracking-[0.18em] transition-colors duration-300 sm:px-4 ${
                isActive ? "bg-ink text-bone" : "bg-bone hover:bg-sky"
              }`
            }
          >
            <FlaskConical className="h-4 w-4" strokeWidth={2.6} /> LAB
          </NavLink>
        </nav>
      </motion.header>

      <main>
        <Routes>
          <Route path="/" element={<Home started={started} />} />
          <Route path="/lab" element={<Lab started={started} />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
